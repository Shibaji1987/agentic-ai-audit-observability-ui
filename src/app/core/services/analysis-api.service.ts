import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone, inject } from '@angular/core';
import { Observable, filter, map, switchMap, take, timeout, timer } from 'rxjs';
import { AuthService } from './auth.service';
import { AnalysisResult } from '../models/analysis-result.model';
import { AnalysisStreamEvent } from '../models/analysis-stream-event.model';
import { AnalysisRun, CreateAnalysisRunResponse } from '../models/analysis-run.model';

@Injectable({ providedIn: 'root' })
export class AnalysisApiService {
  private readonly http = inject(HttpClient);
  private readonly zone = inject(NgZone);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = '/audit';
  private readonly streamEventNames = [
    'analysis-started',
    'event-loaded',
    'policy-retrieval',
    'llm-decision',
    'tool-requested',
    'tool-execution',
    'ai-reasoning',
    'analysis-completed',
    'analysis-failed'
  ];

  analyzeEvent(eventId: string): Observable<AnalysisResult> {
    return this.http.post<AnalysisResult>(`${this.baseUrl}/analyze/${eventId}`, {});
  }

  getFullAnalysis(eventId: string): Observable<AnalysisResult> {
    return this.http.get<AnalysisResult>(`${this.baseUrl}/full/${eventId}`);
  }

  getPersistedAnalysis(eventId: string): Observable<AnalysisResult> {
    return this.http.get<AnalysisResult>(`${this.baseUrl}/analysis/${eventId}`);
  }

  createAnalysisRun(eventId: string): Observable<CreateAnalysisRunResponse> {
    return this.http.post<CreateAnalysisRunResponse>(
      `${this.baseUrl}/events/${encodeURIComponent(eventId)}/analysis-runs`,
      {}
    );
  }

  getAnalysisRun(resultUrl: string): Observable<AnalysisRun> {
    return this.http.get<AnalysisRun>(resultUrl);
  }

  executeAnalysisRun(eventId: string): Observable<AnalysisResult> {
    return this.createAnalysisRun(eventId).pipe(
      switchMap((created) =>
        timer(0, 1000).pipe(
          switchMap(() => this.getAnalysisRun(created.resultUrl)),
          filter((run) => run.status === 'COMPLETED' || run.status === 'FAILED'),
          take(1),
          timeout(10 * 60 * 1000),
          map((run) => {
            if (run.status === 'FAILED' || !run.result) {
              throw new Error(run.errorMessage || 'The analysis run failed without a result.');
            }
            return run.result;
          })
        )
      )
    );
  }

  streamAnalysisRun(streamUrl: string): Observable<AnalysisStreamEvent> {
    return new Observable<AnalysisStreamEvent>((observer) => {
      const token = this.authService.getAccessToken();
      const separator = streamUrl.includes('?') ? '&' : '?';
      const tokenQuery = token ? `${separator}access_token=${encodeURIComponent(token)}` : '';
      const source = new EventSource(`${streamUrl}${tokenQuery}`);
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
