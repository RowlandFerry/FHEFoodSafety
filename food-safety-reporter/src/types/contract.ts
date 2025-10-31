export interface ReportInfo {
  isProcessed: boolean;
  status: number;
  timestamp: bigint;
  lastUpdated: bigint;
  isValid: boolean;
}

export interface InvestigationInfo {
  reportId: number;
  investigator: string;
  finalSafetyLevel: number;
  findings: string;
  isComplete: boolean;
  startTime: bigint;
  endTime: bigint;
}

export interface LocationStats {
  totalReports: number;
  resolvedReports: number;
  avgSafetyLevel: number;
  lastReportTime: bigint;
}

export interface TotalStats {
  total: number;
  submitted: number;
  underReview: number;
  investigating: number;
  resolved: number;
  closed: number;
}

export enum SafetyLevel {
  Unknown = 0,
  Safe = 1,
  Warning = 2,
  Danger = 3,
  Critical = 4,
}

export enum ReportStatus {
  Submitted = 0,
  UnderReview = 1,
  Investigating = 2,
  Resolved = 3,
  Closed = 4,
}

export enum FoodType {
  MeatProducts = 1,
  DairyProducts = 2,
  BreadPastries = 3,
  CannedFoods = 4,
  InstantFoods = 5,
  FreshVegetables = 6,
  Fruits = 7,
  Beverages = 8,
  Condiments = 9,
  Other = 10,
}
