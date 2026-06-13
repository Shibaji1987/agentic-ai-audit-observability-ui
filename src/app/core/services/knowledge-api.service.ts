import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  KnowledgeDocumentPage,
  KnowledgeDocumentRequest,
  KnowledgeDocumentResponse,
  KnowledgeSearchResult
} from '../models/knowledge.model';

@Injectable({ providedIn: 'root' })
export class KnowledgeApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/knowledge';

  ingestDocument(payload: KnowledgeDocumentRequest): Observable<KnowledgeDocumentResponse> {
    return this.http.post<KnowledgeDocumentResponse>(`${this.baseUrl}/documents`, payload);
  }

  searchKnowledge(query: string, topK = 3): Observable<KnowledgeSearchResult[]> {
    const params = new HttpParams().set('query', query).set('topK', topK);
    return this.http.get<KnowledgeSearchResult[]>(`${this.baseUrl}/search`, { params });
  }

  getDocuments(page = 0, size = 25, query = '', sourceType = ''): Observable<KnowledgeDocumentPage> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('query', query)
      .set('sourceType', sourceType);
    return this.http.get<KnowledgeDocumentPage>(`${this.baseUrl}/documents`, { params });
  }
}
