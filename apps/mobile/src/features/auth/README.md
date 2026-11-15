# Auth feature (mobile — drivers & mechanics)

One folder per auth feature. Each holds only what that feature uses:

```
auth/
├── login/          Sign in                                   (/sign-in)
├── registration/   Request an account + "Request sent"       (/request-account,
│                                                             /request-sent)
├── activation/     "Account approved" — create password      (/activate?token=…)
└── shared/         Used by more than one auth feature (AppBar, role labels,
                    date/size formatting, email validation)
```

Inside a feature:

| Folder / file   | What goes there                                         |
| --------------- | ------------------------------------------------------- |
| `screens/`      | Full screens (default export)                            |
| `components/`   | UI pieces used by that feature's screens                 |
| `utils/`        | Pure helpers (validation, rules, formatting)             |
| `constants.ts`  | Fixed lists and limits (e.g. licence classes, 5 MB)      |
| `types.ts`      | Request/response and view types for the feature          |
| `api/`, `hooks/` | Add when needed (e.g. API calls once the backend exists) |

Routing: Expo Router only looks in `src/app`, so each route file there is a
one-line re-export of a screen, e.g. `src/app/(auth)/sign-in.tsx`:

```ts
export { default } from '@/features/auth/login/screens/SignInScreen'
```

Rules of thumb:

- Import across folders with the alias (`@/features/auth/shared/…`).
- Move something to `shared/` only once a second feature needs it.
- Generic UI used outside auth (Button, TextField, Screen…) lives in
  `src/components/ui`, not here.
