import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppRole } from '../models/app-role.model';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = (route.data['roles'] ?? []) as AppRole[];

  if (allowedRoles.length === 0 || authService.hasAnyRole(...allowedRoles)) {
    return true;
  }

  return router.createUrlTree(['/forbidden'], {
    queryParams: { returnUrl: state.url }
  });
};
