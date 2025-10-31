import React, { useState, useEffect } from 'react';
import { useFoodSafety } from '../hooks/useFoodSafety';
import { TotalStats, LocationStats } from '../types/contract';
import { SAFETY_LEVELS } from '../utils/constants';

export function StatsTab() {
  const { getTotalStats, getLocationStats, loading, error } = useFoodSafety();
  const [stats, setStats] = useState<TotalStats | null>(null);
  const [locationCode, setLocationCode] = useState('');
  const [locationStats, setLocationStats] = useState<LocationStats | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const result = await getTotalStats();
      setStats(result);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleQueryLocation = async () => {
    if (!locationCode) return;

    try {
      const result = await getLocationStats(parseInt(locationCode));
      setLocationStats(result);
    } catch (err) {
      console.error('Failed to query location:', err);
    }
  };

  const getSafetyClass = (level: number) => {
    const classes = ['unknown', 'safe', 'warning', 'danger', 'critical'];
    return classes[level] || 'unknown';
  };

  return (
    <>
      <div className="card">
        <h2>📊 System Statistics</h2>

        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Reports</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.submitted}</div>
              <div className="stat-label">Pending Review</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.underReview}</div>
              <div className="stat-label">Under Review</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.investigating}</div>
              <div className="stat-label">Investigating</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.resolved}</div>
              <div className="stat-label">Resolved</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.closed}</div>
              <div className="stat-label">Closed</div>
            </div>
          </div>
        )}

        <button className="btn btn-secondary" onClick={loadStats} disabled={loading}>
          {loading ? 'Loading...' : '🔄 Refresh Statistics'}
        </button>
      </div>

      <div className="card">
        <h2>🗺️ Regional Statistics</h2>

        <div className="form-group">
          <label htmlFor="locationQuery">Region Code</label>
          <input
            type="number"
            id="locationQuery"
            value={locationCode}
            onChange={(e) => setLocationCode(e.target.value)}
            placeholder="Enter 6-digit region code"
          />
          <button className="btn btn-secondary" onClick={handleQueryLocation} disabled={loading}>
            {loading ? 'Loading...' : 'Query Regional Statistics'}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {locationStats && (
          <div className="report-item">
            <h4>Location Code: {locationCode}</h4>
            <p>
              <strong>Total Reports:</strong> {locationStats.totalReports}
            </p>
            <p>
              <strong>Resolved:</strong> {locationStats.resolvedReports}
            </p>
            <p>
              <strong>Avg Safety Level:</strong>{' '}
              <span className={`safety-level safety-${getSafetyClass(locationStats.avgSafetyLevel)}`}>
                {SAFETY_LEVELS[locationStats.avgSafetyLevel]}
              </span>
            </p>
            <p>
              <strong>Last Report:</strong>{' '}
              {locationStats.lastReportTime > 0
                ? new Date(Number(locationStats.lastReportTime) * 1000).toLocaleString()
                : 'None'}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
