import { PolicyEvidence } from './policy-evidence.model';
import { ToolExecution } from './tool-execution.model';

export interface AnalysisResult {

  eventId?: string;

  auditEventId?: string;

  eventType?: string;

  actor?: string;

  action?: string;

  target?: string;

  status?: string;

  eventTime?: string;

  metadata?: Record<string, any>;

  riskScore: number;

  confidenceScore?: number;

  category: string;

  summary: string;

  recommendedAction: string;

  reasons?: string[];

  tags?: string[];

  reasoningTrace?: string[];

  diagnostics?: Record<string, any>;

  toolExecutions?: ToolExecution[];

  matchedPolicyEvidence?: PolicyEvidence[];

}
