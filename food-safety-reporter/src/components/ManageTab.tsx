import React, { useState } from 'react';
import { useFoodSafety } from '../hooks/useFoodSafety';

export function ManageTab() {
  const {
    authorizeInvestigator,
    revokeInvestigator,
    updateReportStatus,
    startInvestigation,
    completeInvestigation,
    loading,
    error,
  } = useFoodSafety();

  const [success, setSuccess] = useState<string | null>(null);
  const [investigatorAddress, setInvestigatorAddress] = useState('');
  const [manageReportId, setManageReportId] = useState('');
  const [newStatus, setNewStatus] = useState('1');
  const [investigateReportId, setInvestigateReportId] = useState('');
  const [completeReportId, setCompleteReportId] = useState('');
  const [finalLevel, setFinalLevel] = useState('1');
  const [findings, setFindings] = useState('');

  const handleAuthorize = async () => {
    if (!investigatorAddress) return;
    try {
      setSuccess(null);
      await authorizeInvestigator(investigatorAddress);
      setSuccess('Investigator authorized successfully!');
    } catch (err) {
      console.error('Authorization failed:', err);
    }
  };

  const handleRevoke = async () => {
    if (!investigatorAddress) return;
    try {
      setSuccess(null);
      await revokeInvestigator(investigatorAddress);
      setSuccess('Permission revoked successfully!');
    } catch (err) {
      console.error('Revocation failed:', err);
    }
  };

  const handleUpdateStatus = async () => {
    if (!manageReportId || !newStatus) return;
    try {
      setSuccess(null);
      await updateReportStatus(parseInt(manageReportId), parseInt(newStatus));
      setSuccess('Status updated successfully!');
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const handleStartInvestigation = async () => {
    if (!investigateReportId) return;
    try {
      setSuccess(null);
      await startInvestigation(parseInt(investigateReportId));
      setSuccess('Investigation started successfully!');
    } catch (err) {
      console.error('Start investigation failed:', err);
    }
  };

  const handleCompleteInvestigation = async () => {
    if (!completeReportId || !finalLevel || !findings) return;
    try {
      setSuccess(null);
      await completeInvestigation(parseInt(completeReportId), parseInt(finalLevel), findings);
      setSuccess('Investigation completed!');
      setFindings('');
    } catch (err) {
      console.error('Complete investigation failed:', err);
    }
  };

  return (
    <>
      <div className="card">
        <h2>⚙️ Management Panel</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="grid">
          <div>
            <h3>👥 Investigator Management</h3>
            <div className="form-group">
              <label htmlFor="investigatorAddress">Investigator Address</label>
              <input
                type="text"
                id="investigatorAddress"
                value={investigatorAddress}
                onChange={(e) => setInvestigatorAddress(e.target.value)}
                placeholder="0x..."
              />
            </div>
            <button className="btn btn-secondary" onClick={handleAuthorize} disabled={loading}>
              Authorize Investigator
            </button>
            <button
              className="btn"
              style={{ background: '#e84393', marginTop: '10px' }}
              onClick={handleRevoke}
              disabled={loading}
            >
              Revoke Permission
            </button>
          </div>

          <div>
            <h3>📋 Report Management</h3>
            <div className="form-group">
              <label htmlFor="manageReportId">Report ID</label>
              <input
                type="number"
                id="manageReportId"
                value={manageReportId}
                onChange={(e) => setManageReportId(e.target.value)}
                placeholder="Report ID"
              />
            </div>
            <div className="form-group">
              <label htmlFor="newStatus">New Status</label>
              <select id="newStatus" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                <option value="1">Under Review</option>
                <option value="2">Investigating</option>
                <option value="3">Resolved</option>
                <option value="4">Closed</option>
              </select>
            </div>
            <button className="btn btn-secondary" onClick={handleUpdateStatus} disabled={loading}>
              Update Status
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>🔬 Investigation Management</h2>
        <div className="grid">
          <div>
            <h3>Start Investigation</h3>
            <div className="form-group">
              <label htmlFor="investigateReportId">Report ID</label>
              <input
                type="number"
                id="investigateReportId"
                value={investigateReportId}
                onChange={(e) => setInvestigateReportId(e.target.value)}
                placeholder="Report ID"
              />
            </div>
            <button className="btn btn-secondary" onClick={handleStartInvestigation} disabled={loading}>
              Start Investigation
            </button>
          </div>

          <div>
            <h3>Complete Investigation</h3>
            <div className="form-group">
              <label htmlFor="completeReportId">Report ID</label>
              <input
                type="number"
                id="completeReportId"
                value={completeReportId}
                onChange={(e) => setCompleteReportId(e.target.value)}
                placeholder="Report ID"
              />
            </div>
            <div className="form-group">
              <label htmlFor="finalLevel">Final Safety Level</label>
              <select id="finalLevel" value={finalLevel} onChange={(e) => setFinalLevel(e.target.value)}>
                <option value="1">Safe</option>
                <option value="2">Warning</option>
                <option value="3">Danger</option>
                <option value="4">Critical</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="findings">Investigation Findings</label>
              <textarea
                id="findings"
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
                placeholder="Investigation findings and conclusions"
              />
            </div>
            <button className="btn btn-secondary" onClick={handleCompleteInvestigation} disabled={loading}>
              Complete Investigation
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
