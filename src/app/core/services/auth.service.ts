import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AppRole } from '../models/app-role.model';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
  username: string;
  roles: AppRole[];
}

interface AuthSession {
  accessToken: string;
  expiresAt: string;
  username: string;
  roles: AppRole[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'agentic-ai.auth.session';
  private readonly session = signal<AuthSession | null>(this.readSession());

  readonly currentUser = computed(() => this.session()?.username ?? null);
  readonly roles = computed(() => this.session()?.roles ?? []);
  readonly primaryRole = computed(() => this.roles()[0] ?? null);
  readonly primaryRoleLabel = computed(() => this.primaryRole()?.replaceAll('_', ' ') ?? null);
  readonly canSubmitAudit = computed(() => this.hasAnyRole('ADMIN', 'ANALYST'));
  readonly canManagePolicies = computed(() => this.hasAnyRole('ADMIN', 'POLICY_MANAGER'));
  readonly isAuthenticated = computed(() => {
    const session = this.session();
    return !!session && new Date(session.expiresAt).getTime() > Date.now();
  });

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/auth/login', credentials).pipe(
      tap((response) => this.setSession({
        accessToken: response.accessToken,
        expiresAt: response.expiresAt,
        username: response.username,
        roles: response.roles?.length ? response.roles : this.readRolesFromToken(response.accessToken)
      }))
    );
  }

  logout(): void {
    this.session.set(null);
    if (this.canUseStorage()) {
      localStorage.removeItem(this.storageKey);
    }
  }

  getAccessToken(): string | null {
    const session = this.session();
    if (!session) {
      return null;
    }

    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      this.logout();
      return null;
    }

    return session.accessToken;
  }

  hasRole(role: AppRole): boolean {
    return this.roles().includes(role);
  }

  hasAnyRole(...roles: AppRole[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }

  private setSession(session: AuthSession): void {
    this.session.set(session);
    if (this.canUseStorage()) {
      localStorage.setItem(this.storageKey, JSON.stringify(session));
    }
  }

  private readSession(): AuthSession | null {
    if (!this.canUseStorage()) {
      return null;
    }

    const rawSession = localStorage.getItem(this.storageKey);
    if (!rawSession) {
      return null;
    }

    try {
      const storedSession = JSON.parse(rawSession) as AuthSession;
      const session: AuthSession = {
        ...storedSession,
        roles: storedSession.roles?.length
          ? storedSession.roles
          : this.readRolesFromToken(storedSession.accessToken)
      };
      if (!session.accessToken || !session.expiresAt || new Date(session.expiresAt).getTime() <= Date.now()) {
        localStorage.removeItem(this.storageKey);
        return null;
      }

      return session;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }

  private canUseStorage(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private readRolesFromToken(accessToken: string): AppRole[] {
    try {
      const encodedPayload = accessToken.split('.')[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      const paddedPayload = encodedPayload.padEnd(Math.ceil(encodedPayload.length / 4) * 4, '=');
      const payload = JSON.parse(atob(paddedPayload)) as { roles?: string[] };
      const supportedRoles: AppRole[] = ['ADMIN', 'POLICY_MANAGER', 'ANALYST', 'VIEWER'];
      return (payload.roles ?? [])
        .map((role) => role.replace(/^ROLE_/, '') as AppRole)
        .filter((role) => supportedRoles.includes(role));
    } catch {
      return [];
    }
  }
}
