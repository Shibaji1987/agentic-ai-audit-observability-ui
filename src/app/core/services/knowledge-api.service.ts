import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { KnowledgeDocumentRequest, KnowledgeDocumentResponse, KnowledgeSearchResult } from '../models/knowledge.model';

@Injectable({ providedIn: 'root' })
export class KnowledgeApiService {
  private readonly http = inject(HttpClient);

  ingestDocument(payload: KnowledgeDocumentRequest): Observable<KnowledgeDocumentResponse> {
    return this.http.post<KnowledgeDocumentResponse>('/knowledge/documents', payload);
  }

  searchKnowledge(query: string, topK = 3): Observable<KnowledgeSearchResult[]> {
    const params = new HttpParams().set('query', query).set('topK', topK);
    return this.http.get<KnowledgeSearchResult[]>('/knowledge/search', { params });
  }
}
