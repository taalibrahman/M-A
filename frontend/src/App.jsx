import React, { useState } from 'react';
import PredictionForm from './components/PredictionForm';
import ScoreMeter from './components/ScoreMeter';
import InsightGraphs from './components/InsightGraphs';
import { Activity } from 'lucide-react';
import axios from 'axios';

function App() {
  const [loading, setLoading] = useState(false);
  const [predictionData, setPredictionData] = useState({
    score: 0,
    verdict: null,
    confidence: null,
    features: []
  });

  const handlePredict = async (formData) => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/predict', formData);
      setPredictionData(response.data);
    } catch (error) {
      console.error("Prediction failed", error);
      alert("Uh oh! Could not connect to the model API. Ensure the backend server is running on port 8000.");
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="container">
        <header style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', marginTop: '16px' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', padding: '12px', borderRadius: '12px', display: 'flex', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)' }}>
            <Activity color="white" size={32} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '2.5rem', letterSpacing: '-0.5px' }}>Market Reaction Predictor</h1>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '1.1rem' }}>AI predicting stock performance post-M&A announcement</p>
          </div>
        </header>

        <div className="grid lg:grid-cols-12">
          {/* Main Form Area */}
          <div className="col-span-12 lg:col-span-8">
            <PredictionForm onSubmit={handlePredict} loading={loading} />
          </div>

          {/* Results Area */}
          <div className="col-span-12 lg:col-span-4" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ flex: '0 0 auto' }}>
              <ScoreMeter 
                score={predictionData.score} 
                verdict={predictionData.verdict}
                confidence={predictionData.confidence}
              />
            </div>
            
            <div style={{ flex: '1 1 auto' }}>
              <InsightGraphs data={predictionData.features} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
