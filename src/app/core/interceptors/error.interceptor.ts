import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastService } from '../services/toast.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error) => {
      const isLoginRequest = req.url.endsWith('/auth/login');

      switch (error.status) {
        case 401:
          if (!isLoginRequest) {
            toastService.showError('Session expired. Please log in again.');
          }
          break;
        case 403:
          toastService.showError('Access Denied: You do not have permission to perform this action.');
          break;
        case 500:
          toastService.showError('Internal Server Error: A server error occurred. Please try again later.');
          break;
        case 0:
        case 502:
        case 503:
        case 504:
          toastService.showError('Server is unreachable. Please check if the API backend is running.');
          break;
        default:
          // Other status codes (e.g., 400, 404) are feature-specific and will be handled by the components locally
          break;
      }

      return throwError(() => error);
    })
  );
};
