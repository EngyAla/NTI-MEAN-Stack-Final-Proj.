import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { LanguageService } from '../services/language.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);
  const languageService = inject(LanguageService);

  const token = authService.getToken();
  const currentLang = languageService.currentLang();

  const headers: Record<string, string> = {
    'Accept-Language': currentLang,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const modifiedReq = req.clone({
    setHeaders: headers,
  });

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/login')) {
        authService.logout();
        toastService.error(
          currentLang === 'ar'
            ? 'انتهت الجلسة. يرجى تسجيل الدخول مجدداً.'
            : 'Session expired. Please log in again.'
        );
      }
      return throwError(() => error);
    })
  );
};
