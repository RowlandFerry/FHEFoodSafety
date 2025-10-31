import React, { useState } from 'react';
import { useFoodSafety } from '../hooks/useFoodSafety';
import { useContractContext } from '../context/ContractContext';
import { FOOD_TYPE_OPTIONS, SAFETY_LEVEL_OPTIONS } from '../utils/constants';

export function SubmitReportTab() {
  const { isConnected } = useContractContext();
  const { submitReport, loading, error } = useFoodSafety();
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    safetyLevel: '',
    locationCode: '',
    foodType: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setSuccess(null);
      const tx = await submitReport(
        parseInt(formData.safetyLevel),
        parseInt(formData.locationCode),
        parseInt(formData.foodType),
        formData.description
      );

      setSuccess(`Report submitted! TX Hash: ${tx.hash.substring(0, 20)}...`);

      // Reset form
      setFormData({
        safetyLevel: '',
        locationCode: '',
        foodType: '',
        description: '',
      });

      setTimeout(() => {
        setSuccess('Report confirmed on-chain! ✅');
      }, 2000);
    } catch (err) {
      console.error('Submit failed:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="card">
      <h2>📝 Submit Anonymous Report</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="safetyLevel">Safety Level *</label>
          <select
            id="safetyLevel"
            name="safetyLevel"
            value={formData.safetyLevel}
            onChange={handleChange}
            required
          >
            <option value="">Select Safety Level</option>
            {SAFETY_LEVEL_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.emoji} {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="locationCode">Location Code *</label>
          <input
            type="number"
            id="locationCode"
            name="locationCode"
            value={formData.locationCode}
            onChange={handleChange}
            placeholder="e.g., 110101 (Administrative Area Code)"
            required
          />
          <small>Enter 6-digit administrative area code</small>
        </div>

        <div className="form-group">
          <label htmlFor="foodType">Food Type *</label>
          <select
            id="foodType"
            name="foodType"
            value={formData.foodType}
            onChange={handleChange}
            required
          >
            <option value="">Select Food Type</option>
            {FOOD_TYPE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.emoji} {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Problem Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the food safety issue in detail, including discovery time, location, specific circumstances, etc."
            required
          />
        </div>

        <button type="submit" className="btn" disabled={loading || !isConnected}>
          {loading ? 'Submitting...' : '🚀 Submit Anonymous Report'}
        </button>
      </form>
    </div>
  );
}
