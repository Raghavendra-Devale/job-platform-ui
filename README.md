# 🎨 Job Platform UI

The frontend single-page application for the Job Platform, built with **Angular 17** using standalone components, lazy-loaded routes, and view transitions. Provides a modern, responsive interface for job seekers to browse listings, manage applications, and build their professional profile with AI resume intelligence.

---

## 📐 Architecture

The application follows Angular's recommended **standalone component architecture** with a clean separation into `core`, `features`, and `shared` layers:

```
src/app/
│
├── app.component.ts                    # Root component
├── app.config.ts                       # Application configuration (providers)
├── app.routes.ts                       # Route definitions (lazy-loaded)
│
├── core/                               # Singleton services & infrastructure
│   ├── guards/
│   │   └── auth.guard.ts               # Route guards (authGuard, guestGuard)
│   ├── interceptors/
│   │   ├── auth.interceptor.ts         # Attaches JWT to outgoing requests
│   │   └── error.interceptor.ts        # Global HTTP error handling
│   ├── models/
│   │   ├── auth.models.ts              # Auth DTOs (login, register, token)
│   │   ├── job.models.ts               # Job & application models
│   │   ├── dashboard.models.ts         # Dashboard statistics models
│   │   ├── notification.models.ts      # Notification models
│   │   ├── recommendation.models.ts    # Recommendation models
│   │   └── resume.models.ts            # Resume models
│   └── services/
│       ├── auth.service.ts             # Authentication (login, register, JWT)
│       ├── job.service.ts              # Job CRUD & search operations
│       ├── dashboard.service.ts        # Dashboard analytics data
│       ├── recommendation.service.ts   # Job recommendations
│       ├── notification.service.ts     # Real-time notifications
│       ├── toast.service.ts            # Toast notification display
│       └── confirmation-modal.service.ts # Confirmation dialog service
│
├── features/                           # Feature modules (lazy-loaded)
│   ├── auth/                           # Authentication (Login, Register pages)
│   ├── jobs/                           # Job listing & search
│   ├── job-detail/                     # Individual job details
│   ├── dashboard/                      # User dashboard with analytics
│   ├── applications/                   # Application tracking
│   ├── saved-jobs/                     # Bookmarked jobs
│   ├── resumes/                        # Resume management & AI processing badges
│   ├── recommendations/                # AI job recommendations with Refresh matching
│   ├── profile/                        # User profile management (skills filters)
│   ├── settings/                       # Account settings
│   └── admin/                          # Admin panel (manual job sync button)
│
└── shared/                             # Reusable UI components
    ├── navbar/                         # Navigation bar
    ├── notification-bell/              # Notification indicator
    └── components/
        ├── toast/                      # Toast notifications
        └── confirmation-modal/         # Confirmation dialog
```

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Angular** | 17.3 | Component framework |
| **TypeScript** | 5.4 | Type-safe JavaScript |
| **RxJS** | 7.8 | Reactive programming & state |
| **Angular Router** | 17.3 | Client-side routing |
| **Angular Animations** | 17.3 | UI transitions |
| **Zone.js** | 0.14.3 | Change detection |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+**
- **npm 9+**
- Backend API running on `http://localhost:8080` (see [job-platform-api](https://github.com/Raghavendra-Devale/job-platform-api/blob/devale/README.md))

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm start
# or
ng serve
```

The app starts on **http://localhost:4200** and automatically proxies API requests to the backend.

### 3. Build for Production

```bash
npm run build
```

Output is generated in the `dist/` directory.

---

## 🔌 API Proxy target configuration

To avoid CORS and connect features during development, `job-platform-ui` relies on `src/proxy.conf.json`.

### Local running
Change `target` to `localhost` to connect to local Spring Boot:
```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```

### Docker Compose running
Revert `target` to the container service name:
```json
{
  "/api": {
    "target": "http://job-platform-api:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```

---

## 🗺️ Routing

All feature routes use **lazy loading** for optimal bundle splitting:

| Route | Component | Auth Required | Description |
|-------|-----------|:---:|-------------|
| `/jobs` | `JobsComponent` | ❌ | Browse & search job listings |
| `/jobs/:id` | `JobDetailComponent` | ❌ | View job details |
| `/login` | `LoginComponent` | 🚫 Guest only | User login |
| `/register` | `RegisterComponent` | 🚫 Guest only | User registration |
| `/dashboard` | `DashboardComponent` | ✅ | User analytics dashboard & AI recommendations trigger |
| `/applications` | `ApplicationsComponent` | ✅ | Track job applications |
| `/saved-jobs` | `SavedJobsComponent` | ✅ | View saved/bookmarked jobs |
| `/resumes` | `ResumesComponent` | ✅ | Manage resumes & verify parsing status |
| `/recommendations` | `RecommendationsComponent` | ✅ | AI recommendations & manual re-scoring |
| `/profile` | `UserProfileComponent` | ✅ | Edit user profile & active skills |
| `/settings` | `SettingsComponent` | ✅ | Account settings |
| `/admin` | `AdminComponent` | — | Admin panel & run sync tool |

**Route Guards:**
- `authGuard` — Redirects unauthenticated users to `/login`
- `guestGuard` — Redirects authenticated users away from login/register

---

## 🏗️ Key Patterns

### Standalone Components
All components are **standalone** (no NgModules), following Angular 17 best practices:

```typescript
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ToastComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {}
```

### Functional Interceptors
HTTP interceptors use the modern **functional style**:

- **`authInterceptor`** — Automatically attaches the JWT `Authorization` header to all outgoing API requests
- **`errorInterceptor`** — Catches HTTP errors globally and triggers toast notifications

### Lazy-Loaded Routes
Every feature route is lazy-loaded using dynamic imports for optimal performance:

```typescript
{
  path: 'dashboard',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./features/dashboard/dashboard.component')
      .then((m) => m.DashboardComponent),
}
```

### View Transitions
The app uses Angular's `withViewTransitions()` for smooth page-to-page animations.

---

## 📁 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Start** | `npm start` | Start dev server on port 4200 |
| **Build** | `npm run build` | Production build |
| **Watch** | `npm run watch` | Build in watch mode |
| **NG CLI** | `npm run ng` | Run Angular CLI commands |

---

## 🔌 API Integration

The UI communicates with the backend via REST calls through Angular's `HttpClient`. All API calls are centralized in the `core/services/` directory:

| Service | Responsibility |
|---------|---------------|
| `AuthService` | Login, registration, JWT management, user state |
| `JobService` | Job CRUD, search, applications, saved jobs, sync triggers |
| `DashboardService` | Dashboard statistics & analytics |
| `RecommendationService` | Personalized job recommendations generator |
| `NotificationService` | User notifications |
| `ToastService` | UI toast notifications |
| `ConfirmationModalService` | Confirmation dialogs |

---

## 📝 License

This project is for learning and portfolio purposes.
