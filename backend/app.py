from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import joblib 
import pandas as pd
import numpy as np
import os
from sklearn.metrics.pairwise import cosine_similarity
import yfinance as yf
import shap

app = FastAPI(title="M&A Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the models
model_dir = os.path.dirname(os.path.abspath(__file__))
try:
    model = joblib.load(os.path.join(model_dir, 'mna_model.pkl'))
    feature_cols = joblib.load(os.path.join(model_dir, 'mna_features.pkl'))
    tfidf = joblib.load(os.path.join(model_dir, 'mna_tfidf.pkl'))
    explainer = shap.TreeExplainer(model)
except Exception as e:
    print(f"Model failed to load: {e}")
    model = None
    feature_cols = []
    tfidf = None
    explainer = None

# Optional: Load centroid for text relatedness if the CSV exists
train_centroid = None
try:
    df_path = os.path.join(model_dir, '../mna_features_output.csv')
    if os.path.exists(df_path) and tfidf is not None:
        df = pd.read_csv(df_path)
        if 'combined_text' in df.columns:
            train_centroid = np.asarray(tfidf.transform(df['combined_text'].fillna('')).mean(axis=0))
        
        # We also need price_median and mkt_cap median from df if possible
        price_median_val = df['Price'].dropna()[df['Price'] > 0].median() if 'Price' in df.columns else 100
        mkt_cap_median = df['acquirer_mkt_cap'].median() if 'acquirer_mkt_cap' in df.columns else 1e9
    else:
        price_median_val = 100
        mkt_cap_median = 1e9
except Exception as e:
    print(f"Warning: Could not compute training centroid: {e}")
    price_median_val = 100
    mkt_cap_median = 1e9

class DealRequest(BaseModel):
    acquirerName: str
    acquirerTicker: str
    acquirerFounded: str
    acquirerIpoYr: str
    acquirerEmployees: str
    acquirerFunding: str
    acquirerNumAcqs: str
    acquirerExperience: str
    acquirerNumBoard: str
    acquirerNumFounders: str
    acquirerDescInput: str
    acquirerCatInput: str

    targetName: str
    targetFounded: str
    targetCountryInp: str
    targetDescInput: str
    targetCatInput: str

    dealPriceM: str
    termsInput: str
    dealYear: str

@app.post("/predict")
async def predict(deal: DealRequest):
    if model is None:
        raise HTTPException(status_code=500, detail="Model file not found. Ensure .pkl files are present.")
    
    try:
        deal_year = int(deal.dealYear or 2025)
        deal_price_m = float(deal.dealPriceM or 0)
        
        # ── Price features ────────────────────────────────────────
        price_filled = (deal_price_m * 1e6) if deal_price_m > 0 else price_median_val
        log_price = np.log1p(price_filled)
        
        # ── Live market cap from Yahoo Finance ────────────────────
        acquirer_mkt_cap = None
        ticker = deal.acquirerTicker.strip().upper()
        if ticker:
            try:
                info = yf.Ticker(ticker).fast_info
                acquirer_mkt_cap = getattr(info, 'market_cap', None)
            except Exception:
                pass
        
        if not acquirer_mkt_cap:
            acquirer_mkt_cap = mkt_cap_median
        
        relative_deal_size = price_filled / acquirer_mkt_cap
        log_relative_size  = np.log1p(relative_deal_size)

        # ── Acquirer features ─────────────────────────────────────
        acquirer_funding = float(deal.acquirerFunding or 0)
        log_acquirer_funding    = np.log1p(acquirer_funding * 1e6)
        
        acquirer_employees = float(deal.acquirerEmployees or 0)
        log_acquirer_employees  = np.log1p(acquirer_employees)
        
        acquirer_founded = int(deal.acquirerFounded or 0)
        acquirer_age = max(0, deal_year - acquirer_founded) if acquirer_founded else 0
        
        acquirer_ipo_yr = int(deal.acquirerIpoYr or 0)
        years_since_ipo = max(0, deal_year - acquirer_ipo_yr) if acquirer_ipo_yr > 0 else 0
        
        acquirer_num_board = float(deal.acquirerNumBoard or 0)
        acquirer_num_founders = float(deal.acquirerNumFounders or 0)
        founder_to_board_ratio = (acquirer_num_founders / acquirer_num_board) if acquirer_num_board > 0 else 0
        
        acquirer_experience = float(deal.acquirerExperience or 0)
        acquirer_num_acqs = float(deal.acquirerNumAcqs or 0)

        # ── Target features ───────────────────────────────────────
        target_founded = int(deal.targetFounded or 0)
        target_age = max(0, deal_year - target_founded) if target_founded else 0
        
        country = deal.targetCountryInp.strip().lower()
        is_us_target = 1 if country in ('united states', 'us', 'usa') else 0

        # ── Payment terms ─────────────────────────────────────────
        terms_input = deal.termsInput.lower()
        is_cash = 1 if 'cash' in terms_input else 0
        is_stock = 1 if 'stock' in terms_input or 'share' in terms_input else 0
        is_undisclosed_terms = 1 if 'undisclosed' in terms_input or not terms_input else 0
        is_completed = 0   
        is_cross_border = 1 if not is_us_target else 0

        # ── Text & category relatedness ───────────────────────────
        combined_new = f"{deal.acquirerDescInput} {deal.targetDescInput} {deal.targetCatInput} {deal.acquirerCatInput}"
        text_relatedness = 0.0
        if tfidf and train_centroid is not None:
            vec_new = tfidf.transform([combined_new])
            text_relatedness = float(cosine_similarity(vec_new, train_centroid)[0][0])
            
        t_cats = set(deal.targetCatInput.lower().split(','))
        a_words = set(deal.acquirerDescInput.lower().split())
        cat_overlap = len(t_cats & a_words) / max(len(t_cats), 1)
        
        new_deal_values = {
            'log_price': log_price,
            'log_relative_size': log_relative_size,
            'acquirer_experience': acquirer_experience,
            'acquirer_num_acquisitions': acquirer_num_acqs,
            'log_acquirer_funding': log_acquirer_funding,
            'log_acquirer_employees': log_acquirer_employees,
            'target_age': target_age,
            'acquirer_age': acquirer_age,
            'years_since_ipo': years_since_ipo,
            'text_relatedness': text_relatedness,
            'cat_overlap': cat_overlap,
            'is_cash': is_cash,
            'is_stock': is_stock,
            'is_undisclosed_terms': is_undisclosed_terms,
            'is_completed': is_completed,
            'is_us_target': is_us_target,
            'is_cross_border': is_cross_border,
            'num_founders': acquirer_num_founders,
            'num_board': acquirer_num_board,
            'founder_to_board_ratio': founder_to_board_ratio,
        }
        
        # Build exact feature dict ensuring all `size_*` dummies get 0 if not defined
        final_row = {}
        for col in feature_cols:
            final_row[col] = new_deal_values.get(col, 0)
            
        X_new = pd.DataFrame([final_row])

        probability = model.predict_proba(X_new)[0][1] * 100
        score = round(probability, 1)
        
        if score >= 55:
            verdict = "📈 STOCK LIKELY TO OUTPERFORM"
        elif score <= 45:
            verdict = "📉 STOCK LIKELY TO UNDERPERFORM"
        else:
            verdict = "📊 STOCK LIKELY TO REMAIN FLAT (NEUTRAL)"
            
        confidence = "High" if abs(score - 50) > 15 else ("Moderate" if abs(score - 50) > 5 else "Low — borderline")
        
        if explainer is not None:
            shap_output = explainer.shap_values(X_new)
            # Handle both list formats (classifier) and array formats
            shap_vals = shap_output[1][0] if isinstance(shap_output, list) else shap_output[0]
            imp_series = pd.Series(shap_vals, index=feature_cols)
            # Find the top 5 largest impacts by absolute value
            top_features = imp_series.reindex(imp_series.abs().sort_values(ascending=False).index).head(5)
            # Convert log-odds raw SHAP to a pseudo-percentage impact for display
            features = [{"name": feat.replace('_', ' ').title(), "value": float(imp * 10)} for feat, imp in top_features.items()]
        else:
            imp_series = pd.Series(model.feature_importances_, index=feature_cols)
            top_features = imp_series.sort_values(ascending=False).head(5)
            features = [{"name": feat.replace('_', ' ').title(), "value": float(imp * 100)} for feat, imp in top_features.items()]
        
        return {
            "score": score,
            "verdict": verdict,
            "confidence": confidence,
            "features": features
        }
        
    except Exception as e:
        print(f"Error evaluating prediction: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
