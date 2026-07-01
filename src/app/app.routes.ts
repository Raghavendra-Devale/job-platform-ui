import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'jobs',
    pathMatch: 'full',
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
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/profile/profile.component').then((m) => m.UserProfileComponent),
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

    loadComponent: () =>
      import('./features/admin/admin.component').then((m) => m.AdminComponent),
  },

  {
    path: '**',
    redirectTo: 'jobs',
  },
];
