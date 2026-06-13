import { AnalysisResult } from './analysis-result.model';

export type AnalysisRunStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface CreateAnalysisRunResponse {
  analysisRunId: string;
  eventId: string;
  status: AnalysisRunStatus;
  createdAt: string;
  streamUrl: string;
  resultUrl: string;
}

export interface AnalysisRun {
  analysisRunId: string;
  eventId: string;
  status: AnalysisRunStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  result?: AnalysisResult;
  streamUrl: string;
  resultUrl: string;
}
