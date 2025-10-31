import { useState } from 'react';
import { useContract } from './useContract';
import { ReportInfo, InvestigationInfo, LocationStats, TotalStats } from '../types/contract';

export function useFoodSafety() {
  const { contract } = useContract();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitReport = async (
    safetyLevel: number,
    locationCode: number,
    foodType: number,
    description: string
  ) => {
    if (!contract) throw new Error('Contract not initialized');

    setLoading(true);
    setError(null);

    try {
      const tx = await contract.submitAnonymousReport(
        safetyLevel,
        locationCode,
        foodType,
        description
      );
      await tx.wait();
      return tx;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to submit report';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getReportInfo = async (reportId: number): Promise<ReportInfo> => {
    if (!contract) throw new Error('Contract not initialized');

    setLoading(true);
    setError(null);

    try {
      const result = await contract.getReportInfo(reportId);
      return {
        isProcessed: result.isProcessed,
        status: Number(result.status),
        timestamp: result.timestamp,
        lastUpdated: result.lastUpdated,
        isValid: result.isValid,
      };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get report info';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getInvestigationInfo = async (reportId: number): Promise<InvestigationInfo> => {
    if (!contract) throw new Error('Contract not initialized');

    setLoading(true);
    setError(null);

    try {
      const result = await contract.getInvestigationInfo(reportId);
      return {
        reportId: Number(result.reportId),
        investigator: result.investigator,
        finalSafetyLevel: Number(result.finalSafetyLevel),
        findings: result.findings,
        isComplete: result.isComplete,
        startTime: result.startTime,
        endTime: result.endTime,
      };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get investigation info';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getLocationStats = async (locationCode: number): Promise<LocationStats> => {
    if (!contract) throw new Error('Contract not initialized');

    setLoading(true);
    setError(null);

    try {
      const result = await contract.getLocationStats(locationCode);
      return {
        totalReports: Number(result.totalReports),
        resolvedReports: Number(result.resolvedReports),
        avgSafetyLevel: Number(result.avgSafetyLevel),
        lastReportTime: result.lastReportTime,
      };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get location stats';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTotalStats = async (): Promise<TotalStats> => {
    if (!contract) throw new Error('Contract not initialized');

    setLoading(true);
    setError(null);

    try {
      const result = await contract.getTotalStats();
      return {
        total: Number(result.total),
        submitted: Number(result.submitted),
        underReview: Number(result.underReview),
        investigating: Number(result.investigating),
        resolved: Number(result.resolved),
        closed: Number(result.closed),
      };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get total stats';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const authorizeInvestigator = async (investigatorAddress: string) => {
    if (!contract) throw new Error('Contract not initialized');

    setLoading(true);
    setError(null);

    try {
      const tx = await contract.authorizeInvestigator(investigatorAddress);
      await tx.wait();
      return tx;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to authorize investigator';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const revokeInvestigator = async (investigatorAddress: string) => {
    if (!contract) throw new Error('Contract not initialized');

    setLoading(true);
    setError(null);

    try {
      const tx = await contract.revokeInvestigator(investigatorAddress);
      await tx.wait();
      return tx;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to revoke investigator';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: number, status: number) => {
    if (!contract) throw new Error('Contract not initialized');

    setLoading(true);
    setError(null);

    try {
      const tx = await contract.updateReportStatus(reportId, status);
      await tx.wait();
      return tx;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update report status';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const startInvestigation = async (reportId: number) => {
    if (!contract) throw new Error('Contract not initialized');

    setLoading(true);
    setError(null);

    try {
      const tx = await contract.startInvestigation(reportId);
      await tx.wait();
      return tx;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to start investigation';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const completeInvestigation = async (reportId: number, finalLevel: number, findings: string) => {
    if (!contract) throw new Error('Contract not initialized');

    setLoading(true);
    setError(null);

    try {
      const tx = await contract.completeInvestigation(reportId, finalLevel, findings);
      await tx.wait();
      return tx;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to complete investigation';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    submitReport,
    getReportInfo,
    getInvestigationInfo,
    getLocationStats,
    getTotalStats,
    authorizeInvestigator,
    revokeInvestigator,
    updateReportStatus,
    startInvestigation,
    completeInvestigation,
  };
}
