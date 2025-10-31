import React, { useState } from 'react';
import { useFoodSafety } from '../hooks/useFoodSafety';
import { ReportInfo, InvestigationInfo } from '../types/contract';
import { STATUS_NAMES, SAFETY_LEVELS } from '../utils/constants';

export function QueryReportTab() {
  const { getReportInfo, getInvestigationInfo, loading, error } = useFoodSafety();
  const [reportId, setReportId] = useState('');
  const [reportInfo, setReportInfo] = useState<ReportInfo | null>(null);
  const [investigationInfo, setInvestigationInfo] = useState<InvestigationInfo | null>(null);

  const handleQuery = async () => {
    if (!reportId) return;

    try {
      const report = await getReportInfo(parseInt(reportId));
      setReportInfo(report);

      const investigation = await getInvestigationInfo(parseInt(reportId));
      setInvestigationInfo(investigation);
    } catch (err) {
      console.error('Query failed:', err);
    }
  };

  const getStatusClass = (status: number) => {
    const classes = ['submitted', 'review', 'investigating', 'resolved', 'closed'];
    return classes[status] || 'submitted';
  };

  const getSafetyClass = (level: number) => {
    const classes = ['unknown', 'safe', 'warning', 'danger', 'critical'];
    return classes[level] || 'unknown';
  };

  return (
    <div className="card">
      <h2>🔍 Query Report Information</h2>

      <div className="form-group">
        <label htmlFor="queryReportId">Report ID</label>
        <input
          type="number"
          id="queryReportId"
          value={reportId}
          onChange={(e) => setReportId(e.target.value)}
          placeholder="Enter Report ID"
        />
        <button className="btn btn-secondary" onClick={handleQuery} disabled={loading}>
          {loading ? 'Loading...' : 'Query Report'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {reportInfo && (
        <div className="report-item">
          <h4>Report #{reportId}</h4>
          <p>
            <strong>Status:</strong>{' '}
            <span className={`status-badge status-${getStatusClass(reportInfo.status)}`}>
              {STATUS_NAMES[reportInfo.status]}
            </span>
          </p>
          <p>
            <strong>Submitted:</strong> {new Date(Number(reportInfo.timestamp) * 1000).toLocaleString()}
          </p>
          <p>
            <strong>Last Updated:</strong> {new Date(Number(reportInfo.lastUpdated) * 1000).toLocaleString()}
          </p>
          <p>
            <strong>Processed:</strong> {reportInfo.isProcessed ? 'Yes' : 'No'}
          </p>

          {investigationInfo && investigationInfo.isComplete && (
            <>
              <hr />
              <h5>Investigation Results</h5>
              <p>
                <strong>Investigator:</strong> {investigationInfo.investigator}
              </p>
              <p>
                <strong>Final Rating:</strong>{' '}
                <span className={`safety-level safety-${getSafetyClass(investigationInfo.finalSafetyLevel)}`}>
                  {SAFETY_LEVELS[investigationInfo.finalSafetyLevel]}
                </span>
              </p>
              <p>
                <strong>Findings:</strong> {investigationInfo.findings}
              </p>
              <p>
                <strong>Completed:</strong> {new Date(Number(investigationInfo.endTime) * 1000).toLocaleString()}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
