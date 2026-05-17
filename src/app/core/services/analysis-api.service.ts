import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AnalysisResult } from '../models/analysis-result.model';
import { AnalysisStreamEvent } from '../models/analysis-stream-event.model';

@Injectable({ providedIn: 'root' })
export class AnalysisApiService {
  private readonly http = inject(HttpClient);
  private readonly zone = inject(NgZone);
  private readonly baseUrl = '/audit';
  private readonly streamEventNames = [
    'analysis-started',
    'event-loaded',
    'policy-retrieval',
    'tool-execution',
    'ai-reasoning',
    'analysis-completed',
    'analysis-failed'
  ];

  analyzeEvent(eventId: string): Observable<AnalysisResult> {
    return this.http.post<AnalysisResult>(`${this.baseUrl}/analyze/${eventId}`, {});
  }

  analyzeEventWithTools(eventId: string): Observable<AnalysisResult> {
    return this.http.post<AnalysisResult>(`${this.baseUrl}/analyze-with-tools/${eventId}`, {});
  }

  getFullAnalysis(eventId: string): Observable<AnalysisResult> {
    return this.http.get<AnalysisResult>(`${this.baseUrl}/full/${eventId}`);
  }

  getPersistedAnalysis(eventId: string): Observable<AnalysisResult> {
    return this.http.get<AnalysisResult>(`${this.baseUrl}/analysis/${eventId}`);
  }

  streamAnalyzeEventWithTools(eventId: string): Observable<AnalysisStreamEvent> {
    return new Observable<AnalysisStreamEvent>((observer) => {
      const source = new EventSource(`${this.baseUrl}/analyze-with-tools/${encodeURIComponent(eventId)}/stream`);
      const handleMessage = (message: MessageEvent<string>) => {
        this.zone.run(() => {
          try {
            observer.next(JSON.parse(message.data) as AnalysisStreamEvent);
          } catch (error) {
            observer.error(error);
          }
        });
      };

      source.onmessage = handleMessage;
      this.streamEventNames.forEach((eventName) => source.addEventListener(eventName, handleMessage));
      source.onerror = () => {
        this.zone.run(() => observer.error(new Error('Streaming connection failed. Verify the backend SSE endpoint is running.')));
      };

      return () => source.close();
    });
  }
}
