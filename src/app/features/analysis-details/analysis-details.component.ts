import { DecimalPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AnalysisStore } from '../../core/state/analysis.store';
import { PolicyEvidence } from '../../core/models/policy-evidence.model';
import { JsonViewerComponent } from '../../shared/ui/json-viewer/json-viewer.component';
import { PolicyEvidenceCardComponent } from '../../shared/ui/policy-evidence-card/policy-evidence-card.component';
import { RiskBadgeComponent } from '../../shared/ui/risk-badge/risk-badge.component';
import { ToolTraceCardComponent } from '../../shared/ui/tool-trace-card/tool-trace-card.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-analysis-details',
  standalone: true,
  imports: [RiskBadgeComponent, ToolTraceCardComponent, PolicyEvidenceCardComponent, JsonViewerComponent, DecimalPipe, RouterLink],
  templateUrl: './analysis-details.component.html',
  styleUrl: './analysis-details.component.css'
})
export class AnalysisDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  readonly analysisStore = inject(AnalysisStore);
  readonly authService = inject(AuthService);

  readonly analysis = computed(() => this.analysisStore.selectedAnalysis());
  readonly eventId = this.route.snapshot.paramMap.get('eventId');
  readonly displayEventId = computed(() => this.analysis()?.eventId ?? this.analysis()?.auditEventId ?? this.eventId ?? 'AI Analysis');
  readonly confidenceScore = computed(() => {
    const score = this.analysis()?.confidenceScore ?? 0;
    return score <= 1 ? score * 100 : score;
  });
  readonly toolExecutions = computed(() => this.analysis()?.toolExecutions ?? []);
  readonly reasons = computed(() => this.analysis()?.reasons ?? []);
  readonly tags = computed(() => this.analysis()?.tags ?? []);
  readonly metadata = computed(() => this.analysis()?.metadata ?? null);
  readonly selectedEvidence = computed(() => this.analysis()?.matchedPolicyEvidence ?? []);
  readonly hasBasicAnalysis = computed(() => this.toolExecutions().length === 0);

  constructor() {
    if (this.eventId) {
      void this.analysisStore.loadFullAnalysis(this.eventId);
    }
  }

  runToolAnalysis(): void {
    if (this.eventId) {
      void this.analysisStore.analyzeEvent(this.eventId);
    }
  }

  trackEvidence(index: number, evidence: PolicyEvidence): string {
    return evidence.sourceChunkId ?? evidence.policyId ?? `evidence-${index}`;
  }
}
