export const CONTRACT_ADDRESS = "0x09611Fc40177fe10D518C13F5c32fE8E1A29A656";

export const CONTRACT_ABI = [
  "function submitAnonymousReport(uint8 _safetyLevel, uint32 _locationCode, uint32 _foodType, string memory _description) external returns (uint32)",
  "function getReportInfo(uint32 _reportId) external view returns (bool isProcessed, uint8 status, uint256 timestamp, uint256 lastUpdated, bool isValid)",
  "function getInvestigationInfo(uint32 _reportId) external view returns (uint32 reportId, address investigator, uint8 finalSafetyLevel, string memory findings, bool isComplete, uint256 startTime, uint256 endTime)",
  "function getLocationStats(uint32 _locationCode) external view returns (uint32 totalReports, uint32 resolvedReports, uint8 avgSafetyLevel, uint256 lastReportTime)",
  "function getTotalStats() external view returns (uint32 total, uint32 submitted, uint32 underReview, uint32 investigating, uint32 resolved, uint32 closed)",
  "function authorizeInvestigator(address _investigator) external",
  "function revokeInvestigator(address _investigator) external",
  "function updateReportStatus(uint32 _reportId, uint8 _status) external",
  "function startInvestigation(uint32 _reportId) external",
  "function completeInvestigation(uint32 _reportId, uint8 _finalLevel, string memory _findings) external",
  "function totalReports() external view returns (uint32)",
  "function owner() external view returns (address)",
  "function regulator() external view returns (address)"
];

export const STATUS_NAMES = ['Submitted', 'Under Review', 'Investigating', 'Resolved', 'Closed'];
export const SAFETY_LEVELS = ['Unknown', 'Safe', 'Warning', 'Danger', 'Critical'];

export const FOOD_TYPE_OPTIONS = [
  { value: 1, label: 'Meat Products', emoji: '🥩' },
  { value: 2, label: 'Dairy Products', emoji: '🥛' },
  { value: 3, label: 'Bread & Pastries', emoji: '🍞' },
  { value: 4, label: 'Canned Foods', emoji: '🥫' },
  { value: 5, label: 'Instant Foods', emoji: '🍜' },
  { value: 6, label: 'Fresh Vegetables', emoji: '🥗' },
  { value: 7, label: 'Fruits', emoji: '🍎' },
  { value: 8, label: 'Beverages & Alcohol', emoji: '🍷' },
  { value: 9, label: 'Condiments & Spices', emoji: '🍯' },
  { value: 10, label: 'Other Foods', emoji: '🍱' },
];

export const SAFETY_LEVEL_OPTIONS = [
  { value: 1, label: 'Minor Risk', emoji: '⚠️' },
  { value: 2, label: 'Moderate Risk', emoji: '⚠️' },
  { value: 3, label: 'Serious Risk', emoji: '🚨' },
  { value: 4, label: 'Critical Danger', emoji: '💀' },
];
