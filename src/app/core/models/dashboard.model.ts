export type DashboardTrend = 'UP' | 'DOWN' | 'FLAT' | 'NEW';
export type DashboardRiskLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNANALYZED';
export type DashboardInsightSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface DashboardMetric {
  value: number;
  currentPeriodValue: number;
  previousPeriodValue: number;
  changePercent: number | null;
  trend: DashboardTrend;
}

export interface DashboardMetrics {
  totalEvents: DashboardMetric;
  highRiskEvents: DashboardMetric;
  aiAnalyzed: DashboardMetric;
  policyMatches: DashboardMetric;
  periodStart: string;
  previousPeriodStart: string;
  generatedAt: string;
}

export interface RecentAuditActivity {
  eventId: string;
  eventType: string;
  actor: string;
  action: string;
  target: string;
  status: string;
  eventTime: string;
  riskScore: number | null;
  riskLevel: DashboardRiskLevel;
  category: string | null;
  analyzed: boolean;
}

export interface DashboardInsight {
  code: string;
  severity: DashboardInsightSeverity;
  title: string;
  message: string;
  value: number | null;
  unit: string;
}

export interface DashboardEngineStatus {
  status: string;
  modelName: string;
  lastAnalysisAt: string | null;
  uptimeSeconds: number;
  checkedAt: string;
}

export interface DashboardSummary {
  metrics: DashboardMetrics;
  recentActivity: RecentAuditActivity[];
  insights: DashboardInsight[];
  engineStatus: DashboardEngineStatus;
}
