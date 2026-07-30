import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, of, switchMap, tap } from 'rxjs';
import { SessionResponse, SessionUser } from './session.model';

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly userSignal = signal<SessionUser | null>(null);
  private readonly readySignal = signal(false);

  readonly user = this.userSignal.asReadonly();
  readonly ready = this.readySignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null);

  /** CSRF token from the non-HttpOnly cookie set by the BFF. */
  csrfToken(): string | null {
    return readCookie('csrf');
  }

  hasRole(role: string): boolean {
    return this.userSignal()?.roles.includes(role) ?? false;
  }

  /** Ensure CSRF cookie exists, then hydrate session from the BFF. */
  bootstrap(): Observable<boolean> {
    return this.http.get<{ csrf: string }>('/bff/csrf', { withCredentials: true }).pipe(
      catchError(() => of({ csrf: '' })),
      switchMap(() => this.refreshSession())
    );
  }

  refreshSession(): Observable<boolean> {
    return this.http
      .get<SessionResponse>('/bff/session', { withCredentials: true })
      .pipe(
        tap((res) => {
          this.userSignal.set(res.authenticated && res.user ? res.user : null);
          this.readySignal.set(true);
        }),
        switchMap((res) => of(!!res.authenticated)),
        catchError(() => {
          this.userSignal.set(null);
          this.readySignal.set(true);
          return of(false);
        })
      );
  }

  login(email: string, role: 'member' | 'admin'): Observable<SessionResponse> {
    return this.http
      .post<SessionResponse>(
        '/bff/login',
        { email, role },
        { withCredentials: true }
      )
      .pipe(
        tap((res) => {
          this.userSignal.set(res.user ?? null);
        })
      );
  }

  /** Silent refresh when access window expires — tokens stay on the BFF. */
  refreshAccess(): Observable<boolean> {
    return this.http
      .post<SessionResponse>('/bff/refresh', {}, { withCredentials: true })
      .pipe(
        tap((res) => this.userSignal.set(res.user ?? null)),
        switchMap((res) => of(!!res.authenticated)),
        catchError(() => {
          this.userSignal.set(null);
          return of(false);
        })
      );
  }

  logout(): Observable<void> {
    return this.http.post<void>('/bff/logout', {}, { withCredentials: true }).pipe(
      tap(() => this.userSignal.set(null)),
      catchError(() => {
        this.userSignal.set(null);
        return of(undefined);
      })
    );
  }
}
