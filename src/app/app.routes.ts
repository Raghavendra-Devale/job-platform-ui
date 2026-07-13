import { Routes } from '@angular/router';
import { authGuard, guestGuard, adminGuard } from './core/guards/auth.guard';
import { AuthLayoutComponent } from './shared/layout/auth-layout/auth-layout.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: '',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/auth/forgot-password/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent
          ),
      },
    ],
  },
  {
    path: 'jobs',
    loadComponent: () =>
      import('./features/jobs/jobs.component').then((m) => m.JobsComponent),
  },
  {
    path: 'jobs/:id',
    loadComponent: () =>
      import('./features/job-detail/job-detail.component').then(
        (m) => m.JobDetailComponent
      ),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile.component').then((m) => m.UserProfileComponent),
  },
  {
    path: 'onboarding',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/onboarding/onboarding.component').then((m) => m.OnboardingComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'saved-jobs',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/saved-jobs/saved-jobs.component').then((m) => m.SavedJobsComponent),
  },
  {
    path: 'resumes',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/resumes/resumes.component').then((m) => m.ResumesComponent),
  },
  {
    path: 'applications',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/applications/applications.component').then((m) => m.ApplicationsComponent),
  },
  {
    path: 'recommendations',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/recommendations/recommendations.component').then(
        (m) => m.RecommendationsComponent
      ),
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/settings/settings.component').then((m) => m.SettingsComponent),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/admin/admin.component').then((m) => m.AdminComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
