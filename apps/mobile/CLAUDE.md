@AGENTS.md

# FleetSync Mobile — guide for Claude Code

FleetSync is a fleet management system (team devSync, IN2901 Software Development Project).
This folder is the **mobile app** (Expo + React Native) for two roles: **Driver** and **Mechanic**.
Customers, Coordinators, Admins and Owners use the web app in `apps/web` instead.

## The design is the spec

All screens are finished in Figma: **https://www.figma.com/design/kVIYQZ1EidykzANXtuGpJx/UI-design**

- Page **Screens**: mobile frames are 390 px wide, named `Mobile — …`, `Driver — …`, `Mechanic — …`.
- Page **Style Guide**, frame *FMS — Design System v2*: colour tokens, type scale and components.
- **`docs/design/figma-screens.md`** lists every screen with its direct Figma link (sections
  "Mobile sign-in", "Driver (mobile)", "Mechanic (mobile)"). Look up the screen there when asked to build one.

When building a screen:
1. Read the frame with the Figma connector (`get_design_context` + `get_screenshot`) before writing code.
2. Match layout, spacing, text and states to the frame. Use the tokens in `src/theme/` — never paste raw hex
   values or font sizes into screens.
3. Reuse components in `src/components/ui` before making new ones. If a Figma component (Button, Status Badge,
   Card, Chip, Text field…) has no code version yet, create it there so other screens can use it.
4. Variant frames (e.g. *Driver — Profile (Licence expiring)*, *Active trip (to pickup)*) are states of one
   screen, not separate routes.
5. After a screen is done, run `npx tsc --noEmit` and `npx expo lint` from `apps/mobile` and fix every error.

## Stack

- Expo SDK (see `expo` in `package.json`) + React Native + TypeScript (strict)
- Navigation: **Expo Router** (file-based, routes in `src/app/`)
- HTTP: **axios** through one shared client (`src/services/apiClient.ts`), same pattern as the web app
- Styling: React Native `StyleSheet` with tokens from `src/theme/` (no extra styling library)
- Icons: `lucide-react-native` (same icon set as the web app) — install with `npx expo install`
- Fonts: Inter + JetBrains Mono via `expo-font` (`@expo-google-fonts/inter`, `@expo-google-fonts/jetbrains-mono`)
- Always add packages with `npx expo install <pkg>` (run inside `apps/mobile`), never plain `npm install <pkg>`.

Run from the repo root: `npm run dev:mobile` (dev server, scan the QR code with Expo Go) and
`npm run check:mobile` (type-check — CI runs this).

## Folder structure (feature-based)

```
src/
├── app/                         ROUTES ONLY (Expo Router). Keep screens thin: import from features/.
│   ├── _layout.tsx              root stack: fonts, splash, providers
│   ├── (auth)/                  sign-in, request-account, request-sent, account-approved
│   ├── driver/                  driver area
│   │   ├── _layout.tsx          stack wrapping the tabs
│   │   └── (tabs)/              bottom tabs: Home, Trips, Chat, Profile (as in Figma)
│   │       └── (home)/          Home tab stack: home + trip/[tripId]/... (details, start, active, picked-up,
│   │                            proof-of-delivery, complete, report-issue) — every mobile screen keeps the tab bar
│   └── (mechanic)/              mechanic area (tabs as in the Mechanic Figma frames)
├── features/                    one folder per module
│   └── <feature>/
│       ├── screens/             screen components (XxxScreen.tsx) used by routes in app/
│       ├── components/          components used only by this feature
│       ├── hooks/               useXxx.ts
│       ├── services/            API calls (xxxApi.ts) — uses apiClient
│       ├── mocks/               mock data used until the backend endpoint exists
│       └── types.ts
├── components/ui/               FleetSync design-system pieces: Button, Card, StatusBadge, Chip, TextField,
│                                ScreenHeader, InfoBanner, EmptyState, Avatar…
├── theme/                       colors.ts, typography.ts, spacing.ts, index.ts
├── contexts/                    only truly global state (e.g. AuthContext)
├── hooks/                       hooks shared by two or more features
├── services/apiClient.ts        the one axios instance (base URL from EXPO_PUBLIC_API_BASE_URL)
└── lib/format.ts                formatLKR, formatDate, formatTime, formatDistance
```

Feature folders: `auth`, `driver-home`, `trips` (details, start, active, complete, history), `proof-of-delivery`,
`vehicle-issues`, `chat`, `notifications`, `profile`, `mechanic-queue`, `maintenance`, `services`, `documents`.
Create a folder only when work on it starts.

Rules:
- Code lives inside its feature. Move it to `components/ui`, `hooks/` or `services/` only when a **second** feature needs it.
- Features never import from another feature's internal folders.
- No axios calls inside components; screens get data from a hook, the hook calls the feature's service.
- Until a backend endpoint exists, the service returns data from `mocks/` behind the same async signature,
  so switching to the real API only changes the service file.
- Every screen handles loading, empty and error states.
- One component per file; PascalCase for components, camelCase for hooks and services.
- Remove Expo template leftovers (explore screen, react logos, animated icon, web badge) as they are replaced.

## Design tokens (from Figma "FMS Colours" — the only colours allowed)

Put these in `src/theme/colors.ts`. **Light theme only** — the design has no dark mode
(set `"userInterfaceStyle": "light"` in `app.json` and drop the template's dark colours).

| Token | Hex | Use |
|---|---|---|
| background | `#F4F5F7` | Screen background |
| surface | `#FFFFFF` | Cards, inputs, tab bar |
| border | `#E3E6EB` | Card and input borders |
| line | `#D1D5DB` | Dividers, progress tracks |
| text | `#111827` | Headings, body, **primary button background** |
| muted | `#6B7280` | Labels, captions, metadata |
| faint | `#9CA3AF` | Placeholders, disabled |
| accent | `#4F46E5` | Links, focus, active tab, "Assigned" |
| accentSoft | `#E0E7FF` | Selected chip, "Assigned" background, avatar background |
| greySoft | `#F3F4F6` | Inactive / tile backgrounds |
| pending / pendingSoft | `#B45309` / `#FEF3C7` | Pending, due soon, late-start banner |
| info / infoSoft | `#1D4ED8` / `#DBEAFE` | In progress, on trip |
| success / successSoft | `#15803D` / `#DCFCE7` | Completed, available, approved |
| danger / dangerSoft | `#B91C1C` / `#FEE2E2` | Cancelled, failed, overdue, expiring licence |

The logo's greens and orange are used only inside the logo, never as UI colours.

## Typography

| Style | Size / weight | Example |
|---|---|---|
| Screen greeting / title | 24 / Bold | Good morning, Kasun |
| Header title | 18 / Semi Bold | Proof of delivery |
| Section label | 12 / Semi Bold, uppercase, Muted | TODAY · UPCOMING |
| Card title | 16 / Semi Bold | Colombo Pharma, Colombo 10 |
| Body | 14–15 / Regular | Tap Start trip when you leave the pickup. |
| Caption | 12 / Regular, Muted | Monday, 19 Oct · DRV-014 |
| Data / mono | JetBrains Mono 14–16 | TRP-2208 · WP LB-7702 · 09:30 |

Check exact sizes in each frame with `get_design_context`; put the scale in `src/theme/typography.ts`.

## Component and content rules

- **Primary button**: dark (`text` colour) background, white label, full width on mobile. Secondary: white with border.
- **Status badges**: soft tinted background with the label in the strong colour, no dot. Map every domain status
  to a tone in one place (`components/ui/statusTones.ts`): neutral = inactive/off duty, pending = pending/due soon,
  accent = assigned/scheduled, info = in progress/on trip, success = completed/approved, danger = cancelled/overdue.
- Never strike through or draw lines across field values.
- Respect safe areas (`react-native-safe-area-context`); the bottom action bar sits above the home indicator.
- Touch targets at least 44 × 44.
- Mock data is Sri Lankan and consistent with the Figma frames: driver Kasun (DRV-014), trips `TRP-2208`,
  orders `ORD-1053`, plates like `WP LB-7702`, amounts in LKR. Copy names and values from the frames.

## Scope rules

- The use case diagram is the source of truth. Do not add features that are not on it; flag them instead.
- **No GPS, live map, ETA or IoT tracking anywhere.** Trip screens show stops and times, never a map.
- Drivers and mechanics cannot request role changes; only the Fleet Administrator changes roles.
- No screen shows a fixed vehicle for a driver: the vehicle comes from each trip assignment.
- The Operational Coordinator assigns a vehicle, a driver and a mechanic to each trip.
- Chat is one room per order, with a separate 1-to-1 thread per person in it. Driver and mechanic join the room
  when the trip is created.

## Git

- Follow **`docs/runbooks/mobile-git-workflow.md`**: one feature per branch, in the order listed there.
- Branch names use the Jira ticket: `KAN-xx-feat/mobile-<feature>` (e.g. `KAN-xx-feat/mobile-driver-home`).
- Only build the screens that belong to the current branch's feature; never commit to `main` directly.
- Pull request into `main` (Squash and merge), at least one peer review.
- Conventional commit messages (`feat:`, `fix:`, `chore:`, `docs:`).
- CI must pass: `npm run check:mobile`.