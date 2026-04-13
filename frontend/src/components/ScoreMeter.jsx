import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

const ScoreMeter = ({ score = 0, verdict = null, confidence = null }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  // Calculations for SVGs
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  // gauge shows a 270 degree arc (75% of circumference)
  const arcLength = circumference * 0.75;
  const offset = circumference - (animatedScore / 100) * arcLength;

  const getScoreColor = (val) => {
    if (val >= 70) return '#10b981'; // Green
    if (val >= 40) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  const currentColor = getScoreColor(animatedScore);

  return (
    <div className="glass-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <h2 style={{ marginBottom: '20px' }}>Prediction Score</h2>
      
      <div style={{ position: 'relative', width: '220px', height: '220px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <svg fill="none" width="220" height="220" viewBox="0 0 220 220" style={{ transform: 'rotate(135deg)', position: 'absolute' }}>
          {/* Background circle */}
          <circle
            cx="110" cy="110" r={radius}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * 0.25}
          />
          {/* Foreground circle (Score) */}
          <circle
            cx="110" cy="110" r={radius}
            stroke={currentColor}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.5s ease-out, stroke 1.5s ease' }}
          />
        </svg>

        {/* Inner text content */}
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{ fontSize: '3.5rem', fontWeight: '800', color: currentColor, lineHeight: '1', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
            {Math.round(animatedScore)}<span style={{ fontSize: '1.5rem', opacity: 0.8, marginTop: '8px' }}>%</span>
          </div>
        </div>
      </div>

      {verdict && (
        <div style={{ marginTop: '24px', textAlign: 'center', width: '100%' }} className="animate-fade-in">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
            {verdict.includes('OUTPERFORM') && !verdict.includes('UNDERPERFORM') ? (
               <CheckCircle2 color="#10b981" size={28} />
            ) : verdict.includes('UNDERPERFORM') ? (
               <XCircle color="#ef4444" size={28} />
            ) : (
               <AlertCircle color="#f59e0b" size={28} />
            )}
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: verdict.includes('UNDERPERFORM') ? 'var(--danger)' : verdict.includes('FLAT') ? 'var(--warning)' : 'var(--success)' }}>
              {verdict}
            </h3>
          </div>
          {confidence && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '6px 16px', borderRadius: '20px', fontSize: '0.875rem' }}>
              <AlertCircle size={14} color="var(--text-muted)" />
              <span style={{ color: 'var(--text-muted)' }}>Confidence: </span>
              <span style={{ fontWeight: '600', color: confidence.toLowerCase() === 'high' ? 'white' : 'var(--warning)' }}>{confidence}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScoreMeter;
