import { AnalysisResult } from './analysis-result.model';
import { PolicyEvidence } from './policy-evidence.model';
import { ToolExecution } from './tool-execution.model';

export type AnalysisStreamPhase =
  | 'ANALYSIS_STARTED'
  | 'EVENT_LOADED'
  | 'POLICY_RETRIEVAL'
  | 'LLM_DECISION'
  | 'TOOL_REQUESTED'
  | 'TOOL_EXECUTION'
  | 'AI_REASONING'
  | 'ANALYSIS_COMPLETED'
  | 'ANALYSIS_FAILED';

export type AnalysisStreamStatus = 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface AnalysisStreamEvent {
  eventId: string;
  phase: AnalysisStreamPhase;
  status: AnalysisStreamStatus;
  message: string;
  matchedPolicyEvidence?: PolicyEvidence[];
  toolExecution?: ToolExecution;
  analysis?: AnalysisResult;
  timestamp: string;
}
