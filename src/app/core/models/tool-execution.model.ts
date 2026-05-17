export interface ToolExecution {

  toolName: string;

  status?:
    | 'SUCCESS'
    | 'FAILED'
    | 'RUNNING'
    | 'FALLBACK_USED'
    | 'RETRYING'
    | 'SKIPPED';

  success?: boolean;

  durationMs: number;

  confidence?: number;

  input?: Record<string, any>;

  output?: Record<string, any>;

  inputSummary?: string;

  outputSummary?: string;

  executedAt?: string;

  reasoning?: string;

  errorMessage?: string;

  fallbackTool?: string;

  retryCount?: number;

}
