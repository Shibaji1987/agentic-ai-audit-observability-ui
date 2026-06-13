import { DatePipe, JsonPipe, NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  KnowledgeDocumentPage,
  KnowledgeDocumentRequest,
  KnowledgeDocumentSummary,
  KnowledgeSearchResult
} from '../../core/models/knowledge.model';
import { KnowledgeApiService } from '../../core/services/knowledge-api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-knowledge',
  standalone: true,
  imports: [DatePipe, FormsModule, JsonPipe, NgClass],
  templateUrl: './knowledge.component.html',
  styleUrl: './knowledge.component.css'
})
export class KnowledgeComponent implements OnInit {
  private readonly knowledgeApi = inject(KnowledgeApiService);
  readonly authService = inject(AuthService);

  readonly catalogLoading = signal(true);
  readonly catalogError = signal<string | null>(null);
  readonly catalog = signal<KnowledgeDocumentPage | null>(null);
  readonly selectedPolicy = signal<KnowledgeDocumentSummary | null>(null);
  readonly ingesting = signal(false);
  readonly searching = signal(false);
  readonly message = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly results = signal<KnowledgeSearchResult[]>([]);
  readonly pageNumbers = computed(() => {
    const catalog = this.catalog();
    if (!catalog || catalog.totalPages <= 1) {
      return [];
    }

    const start = Math.max(0, Math.min(catalog.page - 2, catalog.totalPages - 5));
    const end = Math.min(catalog.totalPages, start + 5);
    return Array.from({ length: end - start }, (_, index) => start + index);
  });

  catalogQuery = '';
  catalogSourceType = 'POLICY';
  readonly catalogPageSize = 25;
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

  ngOnInit(): void {
    void this.loadCatalog(0);
  }

  async loadCatalog(page = 0): Promise<void> {
    this.catalogLoading.set(true);
    this.catalogError.set(null);

    try {
      const catalog = await firstValueFrom(
        this.knowledgeApi.getDocuments(
          page,
          this.catalogPageSize,
          this.catalogQuery.trim(),
          this.catalogSourceType.trim()
        )
      );
      this.catalog.set(catalog);

      const selectedId = this.selectedPolicy()?.id;
      const selectedOnPage = catalog.items.find((policy) => policy.id === selectedId);
      this.selectedPolicy.set(selectedOnPage ?? catalog.items[0] ?? null);
    } catch (error) {
      this.catalogError.set(this.toErrorMessage(error));
    } finally {
      this.catalogLoading.set(false);
    }
  }

  selectPolicy(policy: KnowledgeDocumentSummary): void {
    this.selectedPolicy.set(policy);
  }

  applyCatalogFilters(): void {
    void this.loadCatalog(0);
  }

  clearCatalogFilters(): void {
    this.catalogQuery = '';
    this.catalogSourceType = 'POLICY';
    void this.loadCatalog(0);
  }

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
      await this.loadCatalog(0);
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
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'The knowledge service is unavailable.';
      }
      return error.error?.message ?? `Knowledge request failed (${error.status}).`;
    }
    return error instanceof Error ? error.message : 'Knowledge request failed.';
  }
}
