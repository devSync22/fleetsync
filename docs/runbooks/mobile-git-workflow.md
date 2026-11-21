# Mobile — feature branch workflow

How the mobile app (`apps/mobile`, Driver & Mechanic) is built one feature at a time.
Every feature gets its own branch, starts from the latest `main`, and goes back into `main` through a pull request.

> Replace `KAN-xx` with the Jira ticket number for the task (same style as `KAN-82feat/web-coordinator-dashboard`).

## Feature branches, in order

| # | Branch | What goes in it | Figma frames |
|---|---|---|---|
| 1 | `KAN-xx-feat/mobile-foundation` | `apps/mobile/CLAUDE.md`, theme tokens, fonts, base UI components, route groups + bottom tabs, Expo template removed | Style Guide |
| 2 | `KAN-xx-feat/mobile-auth` | Sign in, Request account, Request sent, Account approved | Mobile sign-in (4) |
| 3 | `KAN-xx-feat/mobile-driver-home` | Driver Home, Trip details | Driver — Home, Trip details |
| 4 | `KAN-xx-feat/mobile-trip-flow` | Start trip, Active trip (to pickup), Cargo picked up, Active trip | Driver trip flow |
| 5 | `KAN-xx-feat/mobile-proof-of-delivery` | Proof of delivery, Complete trip | Driver — Proof of delivery, Complete trip |
| 6 | `KAN-xx-feat/mobile-trip-history-issues` | Trip history, Report vehicle issue | Driver — Trip history, Report vehicle issue |
| 7 | `KAN-xx-feat/mobile-driver-profile` | Profile, Licence expiring, Upload renewed licence, Change password, Password updated | Driver — Profile frames |
| 8 | `KAN-xx-feat/mobile-chat-notifications` | Driver Chat, Chat (Customer), New trip notification, Mechanic Chat | Chat + notification frames |
| 9 | `KAN-xx-feat/mobile-mechanic` | Queue, Driver issues, Resolve issue, Record maintenance, Maintenance history, Services, Documents, Profile | Mechanic (10) |

**Branch 1 must be merged first** — every other branch uses its theme and components.
Direct links to every frame are in [`docs/design/figma-screens.md`](../design/figma-screens.md).

## The cycle for every feature

### 1. Start from an up-to-date `main`

```bash
git checkout main
git pull
git checkout -b KAN-xx-feat/mobile-foundation
```

### 2. Build and commit as you go

Build one or two screens at a time with Claude Code, check them on the phone against the Figma frame, then commit.
Small commits are better than one big one.

```bash
git add .
git commit -m "feat(mobile): add theme tokens and fonts"
```

Commit messages use Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.

### 3. Check before pushing

```bash
npm run check:mobile        # type-check (CI runs this)
cd apps/mobile && npx expo lint && cd ../..
```

### 4. Push the branch

```bash
git push -u origin KAN-xx-feat/mobile-foundation   # first push
git push                                           # every push after that
```

### 5. Open a pull request

1. On GitHub, click **Compare & pull request**.
2. Base: `main`. Fill in the PR template (what changed, screenshots of the screens, Figma links).
3. Add at least one teammate as reviewer.
4. Wait for the CI checks to pass.

### 6. Merge

After approval, use **Squash and merge** on GitHub, then **Delete branch**.

### 7. Clean up and start the next feature

```bash
git checkout main
git pull
git branch -d KAN-xx-feat/mobile-foundation
git checkout -b KAN-xx-feat/mobile-auth
```

## Common situations

### Teammates merged into `main` while you are still working

Bring their changes into your branch so your PR does not clash:

```bash
git fetch origin
git merge origin/main
```

If Git reports a **conflict**, ask Claude Code: *"Resolve the merge conflicts in this branch, keep both sides' changes"*,
check the result, then:

```bash
git add .
git commit
```

### Your PR is waiting for review and you want to keep going

Create the next branch from your current (unmerged) branch instead of `main`:

```bash
git checkout -b KAN-xx-feat/mobile-auth      # while still on mobile-foundation
```

When the first PR is merged, update the new branch:

```bash
git fetch origin
git merge origin/main
```

### You committed on the wrong branch (not pushed yet)

```bash
git branch KAN-xx-feat/correct-branch     # keep the commits on a new branch
git reset --hard origin/main              # put the wrong branch (e.g. main) back
git checkout KAN-xx-feat/correct-branch
```

## Rules

- Never commit directly to `main`.
- One feature per branch; keep branches short-lived.
- Run `npm run check:mobile` before every push.
- Every PR gets at least one peer review before merging.
- Pull `main` before starting each new branch.