# 📈 M&A Market Reaction Predictor

> **An AI-powered full-stack web application that predicts how the stock market will react to a Mergers & Acquisitions (M&A) announcement — before the deal closes.**

---

## 🧠 What It Does

When a company announces an acquisition, the stock price of the acquiring firm often moves significantly. This tool takes in details about the **acquirer**, the **target company**, and the **deal itself**, and uses a trained machine learning model to predict:

- Whether the acquirer's stock is likely to **outperform**, **underperform**, or stay **neutral** post-announcement
- A **confidence score** (0–100) based on historical M&A patterns
- The **top 5 features** driving the prediction, powered by SHAP explainability

---

## 🗂️ Project Structure

```
M-A/
│
├── backend/                  # FastAPI ML inference server
│   ├── app.py                # Main API with /predict endpoint
│   ├── mna_model.pkl         # Trained XGBoost model
│   ├── mna_features.pkl      # Feature column list
│   ├── mna_tfidf.pkl         # TF-IDF vectorizer for text relatedness
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile
│
├── frontend/                 # React + Vite UI
│   └── src/
│       ├── App.jsx
│       └── components/
│           ├── PredictionForm.jsx   # Deal input form
│           ├── ScoreMeter.jsx       # Animated score gauge
│           └── InsightGraphs.jsx    # SHAP feature bar charts
│
├── mna_prediction_v2.ipynb   # Full ML pipeline (EDA → Training → Export)
├── Acquisitions.csv          # Raw M&A deal data
├── Acquired Tech Companies.csv
├── Acquiring Tech Companies.csv
├── Founders and Board Members.csv
├── mna_features_output.csv   # Engineered feature dataset
├── feature_importance.png    # XGBoost feature importance chart
└── docker-compose.yml        # One-command local deployment
```

---

## ⚙️ Tech Stack

### Machine Learning
| Tool | Purpose |
|---|---|
| **XGBoost** | Core gradient-boosted tree classifier |
| **scikit-learn** | Train/test split, TF-IDF vectorizer, cosine similarity |
| **SHAP** | Model explainability — per-prediction feature attribution |
| **yfinance** | Live market cap fetching via stock ticker |
| **pandas / numpy** | Data wrangling and feature engineering |
| **matplotlib / seaborn** | EDA plots and feature importance visualization |

### Backend
| Tool | Purpose |
|---|---|
| **FastAPI** | High-performance REST API framework |
| **Uvicorn** | ASGI server |
| **Pydantic** | Request validation and schema enforcement |
| **joblib** | Model serialization/deserialization |

### Frontend
| Tool | Purpose |
|---|---|
| **React 18** | Component-based UI |
| **Vite** | Fast dev server and bundler |
| **Axios** | HTTP requests to the FastAPI backend |
| **Lucide React** | Icon library |

### Infrastructure
| Tool | Purpose |
|---|---|
| **Docker + Docker Compose** | Containerized local development |
| **Vercel** | Frontend deployment |

---

## 🧪 ML Pipeline (Notebook)

The `mna_prediction_v2.ipynb` notebook walks through the full modeling process:

1. **Data Loading** — Four CSVs covering acquisitions, acquirers, targets, and founders/board members
2. **Dataset Merging** — Joins on company names and deal identifiers
3. **Founder & Board Features** — Extracts num_founders, num_board_members, founder-to-board ratio
4. **CAR (Cumulative Abnormal Return)** — Uses `yfinance` to compute actual post-announcement stock returns as the training label; also fetches market cap at the time of deal
5. **Feature Engineering** — Constructs 20 features:
   - Log-transformed price, relative deal size, acquirer funding, employee count
   - Acquirer/target company ages, years since IPO
   - Payment terms flags (cash / stock / undisclosed)
   - Cross-border deal flag
   - **TF-IDF text relatedness** between acquirer + target descriptions
   - **Category overlap** between acquirer and target market segments
6. **Model Training** — XGBoost binary classifier (outperform vs underperform)
7. **Evaluation** — Classification report + ROC-AUC score
8. **Export** — Saves `mna_model.pkl`, `mna_features.pkl`, `mna_tfidf.pkl`

---

## 🚀 Running Locally

### Option 1: Docker (Recommended)

```bash
git clone https://github.com/taalibrahman/M-A.git
cd M-A
docker-compose up --build
```

- Frontend: http://localhost:5173  
- Backend API: http://localhost:8000  
- API Docs: http://localhost:8000/docs

### Option 2: Manual

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend:**
```bash
cd frontend
npm install
VITE_API_URL=http://localhost:8000 npm run dev
```

---

## 🌐 API Reference

### `POST /predict`

Accepts a JSON body with acquirer, target, and deal details. Returns a prediction.

**Sample Request:**
```json
{
  "acquirerName": "Microsoft",
  "acquirerTicker": "MSFT",
  "acquirerFounded": "1975",
  "acquirerIpoYr": "1986",
  "acquirerEmployees": "220000",
  "acquirerFunding": "0",
  "acquirerNumAcqs": "250",
  "acquirerExperience": "251",
  "acquirerNumBoard": "12",
  "acquirerNumFounders": "2",
  "acquirerDescInput": "Cloud computing and enterprise software",
  "acquirerCatInput": "Software, Cloud, AI",
  "targetName": "Activision Blizzard",
  "targetFounded": "1979",
  "targetCountryInp": "United States",
  "targetDescInput": "Video game developer and publisher",
  "targetCatInput": "Gaming, Entertainment",
  "dealPriceM": "68700",
  "termsInput": "cash",
  "dealYear": "2023"
}
```

**Sample Response:**
```json
{
  "score": 62.4,
  "verdict": "📈 STOCK LIKELY TO OUTPERFORM",
  "confidence": "Moderate",
  "features": [
    { "name": "Log Relative Size", "value": -1.23 },
    { "name": "Text Relatedness", "value": 0.85 },
    ...
  ]
}
```

---

## 📊 Key Features Used by the Model

| Feature | Description |
|---|---|
| `log_price` | Log-transformed deal value |
| `log_relative_size` | Deal size relative to acquirer's live market cap |
| `text_relatedness` | TF-IDF cosine similarity of company descriptions |
| `cat_overlap` | Overlap between acquirer and target market categories |
| `acquirer_experience` | Serial number of this acquisition for the acquirer |
| `acquirer_age` | Years since acquirer was founded |
| `target_age` | Years since target was founded |
| `is_cash` / `is_stock` | Payment structure flags |
| `is_cross_border` | Whether the deal crosses national borders |
| `founder_to_board_ratio` | Governance proxy for acquirer |

---

## 📁 Data Sources

The datasets included cover tech-sector M&A activity and contain:

- **Acquisitions.csv** — Deal terms, prices, announcement dates, and statuses
- **Acquired Tech Companies.csv** — Target company profiles (founded year, country, categories, description)
- **Acquiring Tech Companies.csv** — Acquirer profiles (funding, employees, IPO year, number of acquisitions)
- **Founders and Board Members.csv** — Governance data: founder names, board composition

---

## 🙋 Author

**Taalib Rahman**  
[GitHub](https://github.com/taalibrahman) · Built as an end-to-end ML + full-stack project exploring the intersection of finance and machine learning.
