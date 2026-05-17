import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { KnowledgeDocumentRequest, KnowledgeSearchResult } from '../../core/models/knowledge.model';
import { KnowledgeApiService } from '../../core/services/knowledge-api.service';

@Component({
  selector: 'app-knowledge',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './knowledge.component.html',
  styleUrl: './knowledge.component.css'
})
export class KnowledgeComponent {
  private readonly knowledgeApi = inject(KnowledgeApiService);

  readonly ingesting = signal(false);
  readonly searching = signal(false);
  readonly message = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly results = signal<KnowledgeSearchResult[]>([]);

  title = 'Privileged Access Control Policy';
  sourceType = 'POLICY';
  tags = 'privileged-access, core-banking, data-export';
  content = `Privileged access to core banking production systems must be approved, time-bound, and performed from managed devices. Failed login bursts, MFA bypass, terminated account activity, privileged customer data export, or access from unknown VPN locations must be treated as high-risk signals requiring SOC review.`;
  metadata = `{
  "owner": "Security Governance",
  "classification": "CONFIDENTIAL",
  "controlId": "IAM-PA-001"
}`;

  query = 'terminated admin exporting customer data from core banking after failed login';
  topK = 5;

  async ingestDocument(): Promise<void> {
    this.ingesting.set(true);
    this.error.set(null);
    this.message.set(null);

    try {
      const payload: KnowledgeDocumentRequest = {
        title: this.title.trim(),
        sourceType: this.sourceType.trim(),
        content: this.content.trim(),
        tags: this.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        metadata: this.parseMetadata()
      };

      const response = await firstValueFrom(this.knowledgeApi.ingestDocument(payload));
      this.message.set(`${response.title} ingested successfully.`);
    } catch (error) {
      this.error.set(this.toErrorMessage(error));
    } finally {
      this.ingesting.set(false);
    }
  }

  async searchKnowledge(): Promise<void> {
    if (!this.query.trim()) {
      this.error.set('Enter a search query.');
      return;
    }

    this.searching.set(true);
    this.error.set(null);

    try {
      const results = await firstValueFrom(this.knowledgeApi.searchKnowledge(this.query.trim(), this.topK));
      this.results.set(results);
    } catch (error) {
      this.error.set(this.toErrorMessage(error));
    } finally {
      this.searching.set(false);
    }
  }

  private parseMetadata(): Record<string, unknown> {
    if (!this.metadata.trim()) {
      return {};
    }

    const value = JSON.parse(this.metadata);
    return typeof value === 'object' && value !== null && !Array.isArray(value) ? value : {};
  }

  private toErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Knowledge request failed.';
  }
}
