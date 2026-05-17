import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AnalysisResult } from '../models/analysis-result.model';
import { ToolExecution } from '../models/tool-execution.model';
import { AnalysisApiService } from '../services/analysis-api.service';

@Injectable({ providedIn: 'root' })
export class AnalysisStore {
  private readonly analysisApi = inject(AnalysisApiService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly selectedAnalysis = signal<AnalysisResult | null>(null);
  readonly toolTrace = signal<ToolExecution[]>([]);

  async analyzeEvent(eventId: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const toolResult = await firstValueFrom(this.analysisApi.analyzeEventWithTools(eventId));
      const full = await firstValueFrom(this.analysisApi.getFullAnalysis(eventId));
      const result = this.mergeAnalysis(full, toolResult);
      this.selectedAnalysis.set(result);
      this.toolTrace.set(result.toolExecutions ?? []);
    } catch {
      this.error.set('Failed to run AI analysis.');
    } finally {
      this.loading.set(false);
    }
  }

  async loadFullAnalysis(eventId: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const full = await firstValueFrom(this.analysisApi.getFullAnalysis(eventId));
      const persisted = await firstValueFrom(this.analysisApi.getPersistedAnalysis(eventId)).catch(() => full);
      const result = this.mergeAnalysis(full, persisted);
      this.selectedAnalysis.set(result);
      this.toolTrace.set(result.toolExecutions ?? []);
    } catch {
      this.error.set('Failed to load analysis details.');
    } finally {
      this.loading.set(false);
    }
  }

  private mergeAnalysis(full: AnalysisResult, persisted: AnalysisResult): AnalysisResult {
    return {
      ...persisted,
      ...full,
      eventId: persisted.eventId ?? full.eventId ?? full.auditEventId,
      auditEventId: full.auditEventId ?? persisted.auditEventId ?? persisted.eventId,
      confidenceScore: persisted.confidenceScore ?? full.confidenceScore,
      matchedPolicyEvidence: persisted.matchedPolicyEvidence ?? full.matchedPolicyEvidence,
      toolExecutions: persisted.toolExecutions ?? full.toolExecutions,
      diagnostics: persisted.diagnostics ?? full.diagnostics,
      reasoningTrace: persisted.reasoningTrace ?? full.reasoningTrace
    };
  }
}
