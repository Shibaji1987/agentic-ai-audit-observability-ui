import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
  username: string;
}

interface AuthSession {
  accessToken: string;
  expiresAt: string;
  username: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly storageKey = 'agentic-ai.auth.session';
  private readonly session = signal<AuthSession | null>(this.readSession());

  readonly currentUser = computed(() => this.session()?.username ?? null);
  readonly isAuthenticated = computed(() => {
    const session = this.session();
    return !!session && new Date(session.expiresAt).getTime() > Date.now();
  });

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/auth/login', credentials).pipe(
      tap((response) => this.setSession({
        accessToken: response.accessToken,
        expiresAt: response.expiresAt,
        username: response.username
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
      const session = JSON.parse(rawSession) as AuthSession;
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
}
