import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription, firstValueFrom } from 'rxjs';
import { AuditApiService } from '../../core/services/audit-api.service';
import { AnalysisApiService } from '../../core/services/analysis-api.service';
import { AuditEvent } from '../../core/models/audit-event.model';
import { AnalysisStreamEvent, AnalysisStreamPhase, AnalysisStreamStatus } from '../../core/models/analysis-stream-event.model';
import { PolicyEvidence } from '../../core/models/policy-evidence.model';
import { ToolExecution } from '../../core/models/tool-execution.model';
import { PolicyEvidenceCardComponent } from '../../shared/ui/policy-evidence-card/policy-evidence-card.component';

@Component({
  selector: 'app-submit-event',
  standalone: true,
  imports: [FormsModule, PolicyEvidenceCardComponent],
  templateUrl: './submit-event.component.html',
  styleUrl: './submit-event.component.css'
})
export class SubmitEventComponent {
  private readonly router = inject(Router);
  private readonly auditApi = inject(AuditApiService);
  private readonly analysisApi = inject(AnalysisApiService);
  private streamSubscription?: Subscription;

  readonly isValidJson = signal(true);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly currentEventId = signal<string | null>(null);
  readonly streamEvents = signal<AnalysisStreamEvent[]>([]);
  readonly streamedTools = signal<ToolExecution[]>([]);
  readonly selectedEvidence = signal<PolicyEvidence[]>([]);
  readonly hasStreamActivity = computed(() => this.streamEvents().length > 0 || this.streamedTools().length > 0 || this.selectedEvidence().length > 0);

  readonly pipelineSteps: Array<{ phase: AnalysisStreamPhase; label: string; description: string }> = [
    { phase: 'EVENT_LOADED', label: '1. Event Ingestion', description: 'Validate incoming audit payload' },
    { phase: 'POLICY_RETRIEVAL', label: '2. RAG Retrieval', description: 'Retrieve policy and knowledge evidence' },
    { phase: 'LLM_DECISION', label: '3. LLM Decision', description: 'Decide whether additional evidence is required' },
    { phase: 'TOOL_EXECUTION', label: '4. Tool Execution', description: 'Execute model-requested tools under guardrails' },
    { phase: 'AI_REASONING', label: '5. Final Assessment', description: 'Generate the grounded risk assessment' }
  ];

  payload = `{
  "eventType": "PRIVILEGED_ACCESS",
  "actor": "john.doe@bank.com",
  "action": "LOGIN",
  "target": "CBS-Enterprise",
  "status": "NEW",
  "metadata": {
    "sourceSystem": "Core Banking",
    "ipAddress": "10.45.23.187"
  }
}`;

  validateJson(): void {
    try {
      JSON.parse(this.payload);
      this.isValidJson.set(true);
    } catch {
      this.isValidJson.set(false);
    }
  }

  async analyzeEvent(): Promise<void> {
    this.validateJson();
    if (!this.isValidJson()) return;

    this.loading.set(true);
    this.error.set(null);

    try {
      const eventRequest = JSON.parse(this.payload) as AuditEvent;
      const submitted = await firstValueFrom(this.auditApi.submitEvent(eventRequest));
      const eventId = submitted.id ?? submitted.eventId;

      if (!eventId) {
        throw new Error('Saved event response did not include an id.');
      }

      this.currentEventId.set(eventId);
      this.openAnalysisStream(eventId);
    } catch (error) {
      this.error.set(this.toErrorMessage(error));
      this.loading.set(false);
    }
  }

  clearPayload(): void {
    this.closeAnalysisStream();
    this.payload = '';
    this.error.set(null);
    this.currentEventId.set(null);
    this.streamEvents.set([]);
    this.streamedTools.set([]);
    this.selectedEvidence.set([]);
    this.loading.set(false);
  }

  ngOnDestroy(): void {
    this.closeAnalysisStream();
  }

  phaseStatus(phase: AnalysisStreamPhase): AnalysisStreamStatus | 'PENDING' {
    const events = this.streamEvents().filter((event) => event.phase === phase);
    if (events.length === 0) {
      return 'PENDING';
    }

    return events[events.length - 1].status;
  }

  phaseClass(phase: AnalysisStreamPhase): string {
    const status = this.phaseStatus(phase);
    if (status === 'COMPLETED') {
      return 'border-emerald-500/30 bg-emerald-500/10';
    }
    if (status === 'RUNNING') {
      return 'border-cyan-500/40 bg-cyan-500/10';
    }
    if (status === 'FAILED') {
      return 'border-red-500/30 bg-red-500/10';
    }

    return 'border-slate-800 bg-slate-950';
  }

  phaseLabelClass(phase: AnalysisStreamPhase): string {
    const status = this.phaseStatus(phase);
    if (status === 'COMPLETED') {
      return 'text-emerald-300';
    }
    if (status === 'FAILED') {
      return 'text-red-300';
    }

    return status === 'RUNNING' ? 'text-cyan-300' : 'text-slate-400';
  }

  toolBadgeClass(tool: ToolExecution): string {
    const base = 'rounded-full border px-2.5 py-1 text-[11px] font-semibold';
    return tool.success === false
      ? `${base} border-red-500 bg-red-500/10 text-red-300`
      : `${base} border-emerald-500 bg-emerald-500/10 text-emerald-300`;
  }

  private openAnalysisStream(eventId: string): void {
    this.closeAnalysisStream();
    this.streamEvents.set([]);
    this.streamedTools.set([]);
    this.selectedEvidence.set([]);

    this.streamSubscription = this.analysisApi.streamAnalyzeEventWithTools(eventId).subscribe({
      next: (event) => this.handleStreamEvent(event),
      error: (error) => {
        this.error.set(this.toErrorMessage(error));
        this.loading.set(false);
      }
    });
  }

  private async handleStreamEvent(event: AnalysisStreamEvent): Promise<void> {
    this.streamEvents.update((events) => [...events, event]);

    if (event.toolExecution) {
      this.streamedTools.update((tools) => [...tools, event.toolExecution as ToolExecution]);
    }

    if (event.matchedPolicyEvidence?.length) {
      this.selectedEvidence.set(event.matchedPolicyEvidence);
    }

    if (event.phase === 'ANALYSIS_FAILED') {
      this.error.set(event.message || 'AI analysis failed.');
      this.loading.set(false);
      this.closeAnalysisStream();
      return;
    }

    if (event.phase === 'ANALYSIS_COMPLETED') {
      this.loading.set(false);
      this.closeAnalysisStream();
      await this.router.navigate(['/analysis', event.eventId]);
    }
  }

  private closeAnalysisStream(): void {
    this.streamSubscription?.unsubscribe();
    this.streamSubscription = undefined;
  }

  private toErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const backendMessage = typeof error.error?.message === 'string' ? error.error.message : null;
      return backendMessage
        ? `Backend error (${error.status}): ${backendMessage}`
        : `Backend error (${error.status}): ${error.statusText || 'Request failed'}`;
    }

    return error instanceof Error
      ? error.message
      : 'Unable to submit/analyze event. Verify backend is running and payload matches API contract.';
  }
}
