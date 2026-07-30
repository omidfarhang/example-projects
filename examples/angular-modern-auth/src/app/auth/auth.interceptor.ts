import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * On 401 from API/BFF session checks:
 * 1. Attempt one silent refresh against the BFF.
 * 2. Retry the original request if refresh succeeds.
 * 3. Otherwise clear local session state and send the user to login.
 *
 * Tokens are never read or attached here — the BFF owns them.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Avoid refresh loops on auth endpoints themselves.
  const isAuthEndpoint =
    req.url.includes('/bff/login') ||
    req.url.includes('/bff/refresh') ||
    req.url.includes('/bff/logout') ||
    req.url.includes('/bff/csrf') ||
    req.url.includes('/bff/session');

  return next(req.clone({ withCredentials: true })).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || isAuthEndpoint) {
        return throwError(() => error);
      }

      return auth.refreshAccess().pipe(
        switchMap((ok) => {
          if (!ok) {
            void router.navigate(['/login'], {
              queryParams: { reason: 'session_expired' },
            });
            return throwError(() => error);
          }
          return next(req.clone({ withCredentials: true }));
        })
      );
    })
  );
};
