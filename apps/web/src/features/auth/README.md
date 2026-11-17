# Auth feature (web)

Sign-in and sign-up screens under `/auth/*`, connected to the FleetSync API (`/api/auth/*`).

| Route | Page | Figma frame |
| --- | --- | --- |
| `/auth/login` | `LoginPage` | Login (33:438), Login — error (33:687) |
| `/auth/register` | `CustomerRegistrationPage` | Auth — Customer registration (118:3518), Registration submitted (371:7348) |
| `/auth/request-staff-account` | `StaffApplicationPage` | Auth — Staff account application (118:3655), Registration submitted |
| `/auth/verify-email?token=` | `VerifyEmailPage` | *no frame yet* |
| `/auth/forgot-password` | `ForgotPasswordPage` | Auth — Forgot password (113:4235) |
| `/auth/reset-password?token=` | `SetNewPasswordPage` | Auth — Set new password (113:4333) |
| `/` (signed in) | `SignedInPage` | *temporary, until the role dashboards exist* |

Old paths used by emailed links (`/login`, `/verify-email`, `/reset-password`) redirect to the `/auth/*` routes.

## Folders

```
auth/
├── pages/       route-level components: wire a hook + API call to a form
├── components/  forms and pieces used only by auth (FileUpload, IconBadge, CheckboxField…)
├── hooks/       useSubmit (loading/error for a submit), useTokenCheck (emailed-link pages)
├── services/    authApi.ts — every auth API call, through the shared apiClient
├── utils/       pure helpers: login error messages, password rules, role labels
└── types.ts     request/response and view types
```

Session state (who is signed in, refresh on start-up) lives in `src/contexts/AuthContext.tsx`;
refresh and logout calls in `src/services/sessionApi.ts`, because the whole app uses them.

## Errors

Every API failure is an `ApiError` with the backend's `errorCode`. Pages switch on it:
field errors (`validation_failed`) appear under their inputs; everything else in a danger `Banner`.
The login form maps `auth.invalid_credentials` (with `attemptsLeft`) and `auth.locked_out` to the
Figma wording; other codes show the API's own title and detail.
