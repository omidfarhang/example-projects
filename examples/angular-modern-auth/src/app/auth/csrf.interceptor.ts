import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

/**
 * Attach CSRF header for mutating requests.
 * Session cookie is HttpOnly and sent automatically via withCredentials —
 * this interceptor never touches access/refresh tokens.
 */
export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next(req);
  }

  const csrf = inject(AuthService).csrfToken();
  if (!csrf) {
    return next(req.clone({ withCredentials: true }));
  }

  return next(
    req.clone({
      withCredentials: true,
      setHeaders: { 'X-CSRF-Token': csrf },
    })
  );
};
