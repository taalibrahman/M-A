import React, { useState } from 'react';
import { Send } from 'lucide-react';

const PredictionForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    acquirerName: '',
    acquirerTicker: '',
    acquirerFounded: '',
    acquirerIpoYr: '',
    acquirerEmployees: '',
    acquirerFunding: '',
    acquirerNumAcqs: '',
    acquirerExperience: '',
    acquirerNumBoard: '',
    acquirerNumFounders: '',
    acquirerDescInput: '',
    acquirerCatInput: '',

    targetName: '',
    targetFounded: '',
    targetCountryInp: 'United States',
    targetDescInput: '',
    targetCatInput: '',

    dealPriceM: '',
    termsInput: 'cash',
    dealYear: new Date().getFullYear().toString()
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ height: '100%' }}>
      <h2>Predict M&A Success</h2>

      <form onSubmit={handleSubmit}>
        
        {/* Acquiring Company */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1.1rem', paddingBottom: '8px', borderBottom: '1px solid rgba(59, 130, 246, 0.3)', marginBottom: '16px', color: 'var(--primary)' }}>Acquiring Company</h3>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Acquiring company name</label>
              <input required type="text" name="acquirerName" value={formData.acquirerName} onChange={handleChange} className="glass-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Stock ticker</label>
              <input type="text" name="acquirerTicker" value={formData.acquirerTicker} onChange={handleChange} className="glass-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Year founded</label>
              <input required type="number" name="acquirerFounded" value={formData.acquirerFounded} onChange={handleChange} className="glass-input" />
            </div>
            <div className="form-group">
              <label className="form-label">IPO year</label>
              <input required type="number" name="acquirerIpoYr" value={formData.acquirerIpoYr} onChange={handleChange} className="glass-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Number of employees</label>
              <input required type="number" name="acquirerEmployees" value={formData.acquirerEmployees} onChange={handleChange} className="glass-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Total funding (USD millions)</label>
              <input required type="number" step="any" name="acquirerFunding" value={formData.acquirerFunding} onChange={handleChange} className="glass-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Total acquisitions made so far</label>
              <input required type="number" name="acquirerNumAcqs" value={formData.acquirerNumAcqs} onChange={handleChange} className="glass-input" />
            </div>
            <div className="form-group">
              <label className="form-label">This is acquisition number (serial)</label>
              <input required type="number" name="acquirerExperience" value={formData.acquirerExperience} onChange={handleChange} className="glass-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Number of board members</label>
              <input required type="number" name="acquirerNumBoard" value={formData.acquirerNumBoard} onChange={handleChange} className="glass-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Number of founders</label>
              <input required type="number" name="acquirerNumFounders" value={formData.acquirerNumFounders} onChange={handleChange} className="glass-input" />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 3' }}>
              <label className="form-label">Brief description / sector</label>
              <input type="text" name="acquirerDescInput" value={formData.acquirerDescInput} onChange={handleChange} className="glass-input" />
            </div>
             <div className="form-group" style={{ gridColumn: 'span 3' }}>
              <label className="form-label">Market categories</label>
              <input type="text" name="acquirerCatInput" value={formData.acquirerCatInput} onChange={handleChange} className="glass-input" />
            </div>
          </div>
        </div>

        {/* Target Company */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1.1rem', paddingBottom: '8px', borderBottom: '1px solid rgba(139, 92, 246, 0.3)', marginBottom: '16px', color: 'var(--secondary)' }}>Target Company</h3>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Target company name</label>
              <input required type="text" name="targetName" value={formData.targetName} onChange={handleChange} className="glass-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Year founded</label>
              <input required type="number" name="targetFounded" value={formData.targetFounded} onChange={handleChange} className="glass-input" />
            </div>
            <div className="form-group">
              <label className="form-label">HQ country</label>
              <input required type="text" name="targetCountryInp" value={formData.targetCountryInp} onChange={handleChange} className="glass-input" />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Market categories</label>
              <input type="text" name="targetCatInput" value={formData.targetCatInput} onChange={handleChange} className="glass-input" />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 3' }}>
              <label className="form-label">Brief description / sector</label>
              <input type="text" name="targetDescInput" value={formData.targetDescInput} onChange={handleChange} className="glass-input" />
            </div>
          </div>
        </div>

        {/* Deal Details */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', paddingBottom: '8px', borderBottom: '1px solid rgba(245, 158, 11, 0.3)', marginBottom: '16px', color: 'var(--warning)' }}>Deal Details</h3>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
             <div className="form-group">
              <label className="form-label">Deal price (USD millions)</label>
              <input required type="number" step="any" name="dealPriceM" value={formData.dealPriceM} onChange={handleChange} className="glass-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Payment terms</label>
               <select name="termsInput" value={formData.termsInput} onChange={handleChange} className="glass-input">
                <option value="cash">Cash</option>
                <option value="stock">Stock</option>
                <option value="undisclosed">Undisclosed</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Expected deal year</label>
              <input required type="number" name="dealYear" value={formData.dealYear} onChange={handleChange} className="glass-input" />
            </div>
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '32px' }}>
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="animate-spin" style={{ width: '18px', height: '18px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
              Analyzing Deal...
            </span>
          ) : (
            <>
              Generate Prediction
              <Send size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default PredictionForm;
