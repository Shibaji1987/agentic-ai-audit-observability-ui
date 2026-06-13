import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  DashboardInsightSeverity,
  DashboardMetric,
  DashboardRiskLevel,
  DashboardSummary
} from '../../core/models/dashboard.model';
import { DashboardApiService } from '../../core/services/dashboard-api.service';

interface MetricCard {
  label: string;
  metric: DashboardMetric;
  panelClass: string;
  labelClass: string;
  valueClass: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private readonly dashboardApi = inject(DashboardApiService);

  readonly dashboard = signal<DashboardSummary | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly metricCards = computed<MetricCard[]>(() => {
    const metrics = this.dashboard()?.metrics;
    if (!metrics) {
      return [];
    }

    return [
      {
        label: 'Total Events',
        metric: metrics.totalEvents,
        panelClass: 'border-slate-800 bg-slate-900',
        labelClass: 'text-slate-400',
        valueClass: 'text-white'
      },
      {
        label: 'High Risk Events',
        metric: metrics.highRiskEvents,
        panelClass: 'border-red-500/20 bg-red-500/10',
        labelClass: 'text-red-300',
        valueClass: 'text-red-100'
      },
      {
        label: 'AI Analyzed',
        metric: metrics.aiAnalyzed,
        panelClass: 'border-cyan-500/20 bg-cyan-500/10',
        labelClass: 'text-cyan-300',
        valueClass: 'text-cyan-100'
      },
      {
        label: 'Policy Matches',
        metric: metrics.policyMatches,
        panelClass: 'border-emerald-500/20 bg-emerald-500/10',
        labelClass: 'text-emerald-300',
        valueClass: 'text-emerald-100'
      }
    ];
  });

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.error.set(null);

    this.dashboardApi.getSummary().subscribe({
      next: (dashboard) => {
        this.dashboard.set(dashboard);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.dashboard.set(null);
        this.error.set(this.getErrorMessage(error));
        this.loading.set(false);
      }
    });
  }

  trendText(metric: DashboardMetric): string {
    if (metric.trend === 'NEW') {
      return `${metric.currentPeriodValue.toLocaleString()} new in the last 7 days`;
    }

    if (metric.trend === 'FLAT' || metric.changePercent === null) {
      return 'No change vs previous 7 days';
    }

    const direction = metric.trend === 'UP' ? 'increase' : 'decrease';
    return `${Math.abs(metric.changePercent).toFixed(1)}% ${direction} vs previous 7 days`;
  }

  trendClass(metric: DashboardMetric): string {
    if (metric.trend === 'DOWN') {
      return 'text-amber-300';
    }
    if (metric.trend === 'FLAT') {
      return 'text-slate-400';
    }
    return 'text-emerald-300';
  }

  riskClass(riskLevel: DashboardRiskLevel): string {
    const classes: Record<DashboardRiskLevel, string> = {
      HIGH: 'border-red-500/20 bg-red-500/10 text-red-300',
      MEDIUM: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
      LOW: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
      UNANALYZED: 'border-slate-700 bg-slate-800 text-slate-300'
    };
    return classes[riskLevel];
  }

  insightClass(severity: DashboardInsightSeverity): string {
    const classes: Record<DashboardInsightSeverity, string> = {
      CRITICAL: 'border-red-500/30 bg-red-500/10 text-red-300',
      HIGH: 'border-red-500/20 bg-red-500/10 text-red-300',
      MEDIUM: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
      LOW: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300',
      INFO: 'border-slate-700 bg-slate-950 text-slate-300'
    };
    return classes[severity];
  }

  formatUptime(totalSeconds: number): string {
    const days = Math.floor(totalSeconds / 86_400);
    const hours = Math.floor((totalSeconds % 86_400) / 3_600);
    const minutes = Math.floor((totalSeconds % 3_600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return 'Your session is no longer authorized. Sign in again to load dashboard data.';
    }
    if (error.status === 0) {
      return 'The dashboard service is unavailable. Confirm that the backend is running.';
    }
    return `Dashboard data could not be loaded (${error.status}).`;
  }
}
