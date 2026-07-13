import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';

export const authGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return toObservable(authService.isInitialized).pipe(
    filter((initialized) => initialized),
    take(1),
    map(() => {
      if (!authService.isAuthenticated()) {
        router.navigate(['/login']);
        return false;
      }

      // Dynamic onboarding checks: if they don't have a resume, guide them to upload one
      const path = route.routeConfig?.path;
      const isAllowedWithoutResume = path === 'onboarding' || path === 'resumes';

      if (!authService.hasResume() && !isAllowedWithoutResume) {
        router.navigate(['/onboarding']);
        return false;
      }

      // If they have a resume and try to visit onboarding, route to dashboard
      if (authService.hasResume() && path === 'onboarding') {
        router.navigate(['/dashboard']);
        return false;
      }

      return true;
    })
  );
};

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return toObservable(authService.isInitialized).pipe(
    filter((initialized) => initialized),
    take(1),
    map(() => {
      if (!authService.isAuthenticated()) {
        return true;
      }
      router.navigate(['/dashboard']);
      return false;
    })
  );
};

export const adminGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return toObservable(authService.isInitialized).pipe(
    filter((initialized) => initialized),
    take(1),
    map(() => {
      if (authService.isAuthenticated() && authService.currentUser()?.role === 'ADMIN') {
        return true;
      }
      router.navigate(['/dashboard']);
      return false;
    })
  );
};
