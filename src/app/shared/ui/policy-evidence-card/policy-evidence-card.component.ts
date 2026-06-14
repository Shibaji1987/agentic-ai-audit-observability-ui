import { Component, computed, input } from '@angular/core';
import { PolicyEvidence } from '../../../core/models/policy-evidence.model';

@Component({
  selector: 'app-policy-evidence-card',
  standalone: true,
  imports: [],
  templateUrl: './policy-evidence-card.component.html',
  styleUrl: './policy-evidence-card.component.css'
})
export class PolicyEvidenceCardComponent {
  evidence = input.required<PolicyEvidence>();
  index = input(0);

  readonly title = computed(() => this.evidence().policyName ?? this.evidence().title ?? this.evidence().sourceDocument ?? 'Knowledge evidence');
  readonly excerpt = computed(() => this.evidence().excerpt ?? this.evidence().matchedText ?? 'No excerpt returned for this evidence item.');
  readonly chunkId = computed(() => this.evidence().sourceChunkId ?? this.evidence().policyId ?? 'N/A');
  readonly score = computed(() => this.evidence().relevanceScore ?? this.evidence().similarityScore ?? null);
  readonly normalizedScore = computed(() => {
    const score = this.score();
    if (score === null || !Number.isFinite(score)) {
      return null;
    }
    return Math.min(100, Math.max(0, score <= 1 ? score * 100 : score));
  });
  readonly formattedScore = computed(() => {
    const score = this.normalizedScore();
    return score === null ? null : `${score.toFixed(2)}%`;
  });
}
