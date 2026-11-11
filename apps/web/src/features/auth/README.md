# Auth feature (web)

One folder per auth feature. Each holds only what that feature uses:

```
auth/
├── login/            Sign in + login error state         (/, /login)
├── registration/     Customer registration, staff         (/register,
│                     application, "Registration           /request-staff-account)
│                     submitted" confirmation
├── password-reset/   Forgot password, set new password    (/forgot-password,
│                                                          /reset-password)
└── shared/           Used by more than one auth feature (e.g. AuthForm styles)
```

Inside a feature:

| Folder / file  | What goes there                                        |
| -------------- | ------------------------------------------------------ |
| `pages/`       | Route-level components (wired up in `src/App.tsx`)      |
| `components/`  | UI pieces used by that feature's pages                  |
| `utils/`       | Pure helpers (formatting, rules, error messages)        |
| `types.ts`     | Request/response and view types for the feature         |
| `api/`, `hooks/`, `schemas/` | Add when needed (e.g. API calls once the backend exists) |

Rules of thumb:

- Import within a feature with relative paths (`../components/…`); import
  from another feature or `shared/` with the alias (`@/features/auth/shared/…`).
- Move something to `shared/` only once a second feature needs it.
- Generic UI used outside auth (Button, TextField, Banner…) lives in
  `src/components/ui`, not here.
