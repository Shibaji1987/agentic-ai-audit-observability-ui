import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component')
            .then(m => m.DashboardComponent)
      },
      {
        path: 'audit-events',
        loadComponent: () =>
          import('./features/audit-events/audit-events.component')
            .then(m => m.AuditEventsComponent)
      },
      {
        path: 'submit-event',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'ANALYST'] },
        loadComponent: () =>
          import('./features/submit-event/submit-event.component')
            .then(m => m.SubmitEventComponent)
      },
      {
        path: 'knowledge',
        loadComponent: () =>
          import('./features/knowledge/knowledge.component')
            .then(m => m.KnowledgeComponent)
      },
      {
        path: 'analysis',
        loadComponent: () =>
          import('./features/analysis-details/analysis-details.component')
            .then(m => m.AnalysisDetailsComponent)
      },
      {
        path: 'analysis/:eventId',
        loadComponent: () =>
          import('./features/analysis-details/analysis-details.component')
            .then(m => m.AnalysisDetailsComponent)
      },
      {
        path: 'forbidden',
        loadComponent: () =>
          import('./features/forbidden/forbidden.component')
            .then(m => m.ForbiddenComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
