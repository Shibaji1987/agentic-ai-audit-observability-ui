import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DashboardEngineStatus } from '../models/dashboard.model';
import { DashboardApiService } from '../services/dashboard-api.service';

@Injectable({ providedIn: 'root' })
export class EngineStatusStore {
  private readonly dashboardApi = inject(DashboardApiService);

  readonly status = signal<DashboardEngineStatus | null>(null);
  readonly unavailable = signal(false);

  async load(): Promise<void> {
    this.unavailable.set(false);
    try {
      this.status.set(await firstValueFrom(this.dashboardApi.getEngineStatus()));
    } catch {
      this.status.set(null);
      this.unavailable.set(true);
    }
  }
}
