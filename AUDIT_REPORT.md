# Security & Quality Audit Report — UNMESSIFY

**Date:** 2026-04-06  
**Branch audited:** `main`  
**Auditor:** GitHub Copilot Coding Agent  
**Scope:** Full repository static analysis — secrets, auth, Firebase config, client-side patterns, dependency/CI risks.

---

## Summary

| ID | Severity | Status | Title |
|----|----------|--------|-------|
| [F-01](#f-01-no-firestore-security-rules-in-repository) | 🔴 High | **Fixed in this PR** | No Firestore security rules in repository |
| [F-02](#f-02-client-side-only-domain-restriction) | 🟠 Medium | **Fixed in this PR** | Domain restriction enforced client-side only |
| [F-03](#f-03-sensitive-data-written-to-localstorage) | 🟠 Medium | Documented — mitigated by existing sign-out clear | Sensitive data written to `localStorage` |
| [F-04](#f-04-no-cicd-pipeline) | 🟡 Low | **Fixed in this PR** | No CI/CD pipeline |
| [F-05](#f-05-missing-http-security-response-headers) | 🟡 Low | **Fixed in this PR** | Missing HTTP security response headers |
| [F-06](#f-06-hardcoded-firebase-credentials) | 🟡 Low | Resolved in prior PR #1 | Hardcoded Firebase credentials |

---

## Findings

---

### F-01: No Firestore security rules in repository
**Severity:** 🔴 High  
**Status:** Fixed — `firestore.rules` added in this PR  
**Impacted files:** (none previously — `firestore.rules` was absent)

#### Description
The repository had no `firestore.rules` file. When deploying via `firebase deploy`, if no rules file is referenced, the project relies on whatever rules are currently deployed in the Firebase Console — which may default to **open read/write access** (`allow read, write: if true`). This would allow any authenticated (or even unauthenticated) Firebase user to read or overwrite any other user's financial data.

#### Risk
- Any Firebase authenticated user could read all other users' transaction history, profile data, and meal plans.
- An attacker who obtains the `apiKey` (which was previously hardcoded in git history) could exfiltrate all user data.

#### Remediation (applied)
Added `firestore.rules` with the following policy:
- Only authenticated users (`request.auth != null`) can access data.
- Each user can only read/write their **own** document (`request.auth.uid == uid`).
- The user's email must match `@vitstudent.ac.in` **as verified by the Firebase ID token** (`request.auth.token.email`), making this a server-enforced check.
- All other paths denied by default.

Updated `firebase.json` to reference `firestore.rules` so rules are deployed alongside hosting.

**Deploy the rules** to Firebase with:
```bash
npx firebase-tools deploy --only firestore:rules
```

---

### F-02: Client-side only domain restriction
**Severity:** 🟠 Medium  
**Status:** Fixed via F-01 (Firestore rules now enforce domain server-side)  
**Impacted files:** `src/utils/authUtils.js`, `src/context/AuthContext.jsx`

#### Description
`authUtils.js` exports `isAllowedDomainEmail()` and `AuthContext.jsx` calls it after `signInWithPopup` to block non-`@vitstudent.ac.in` accounts. However, this check runs entirely in the browser. A sophisticated attacker who manipulates the client (e.g., via browser devtools or a modified build) could bypass the sign-out call and retain an authenticated `authUser` state for an arbitrary Google account.

#### Risk
Without a matching server-side rule, a non-VIT Google account that bypasses client filtering could read or write Firestore data.

#### Remediation (applied via F-01)
The Firestore rule now includes:
```
request.auth.token.email.matches('^[^@]+@vitstudent\\.ac\\.in$')
```
This is evaluated against the **cryptographically signed Firebase ID token** on Google's servers — it cannot be spoofed by a client. The client-side check in `AuthContext.jsx` is retained as a UX guard (immediate feedback) but is no longer the only enforcement layer.

---

### F-03: Sensitive data written to `localStorage`
**Severity:** 🟠 Medium  
**Status:** Documented — existing sign-out clear mitigates main risk  
**Impacted files:** `src/services/storageService.js`

#### Description
`storageService.js` maintains a write-through `localStorage` cache alongside IndexedDB for synchronous initial-render performance. The following keys are written:

| Key | Content |
|-----|---------|
| `unmessify_user` | User profile (name, email, budget settings) |
| `unmessify_transactions` | Full spending transaction history |
| `unmessify_planned_meals` | Planned meal schedule |

`localStorage` data persists across browser sessions and is readable by any JavaScript on the same origin. On a **shared device** (lab computer, shared laptop), a second user could open browser devtools and read the previous user's financial data.

#### Mitigating factor (already present)
`clearAllStorage()` is called in `UserContext.resetUser()`, which is triggered by the **Sign Out** button in `Settings.jsx`. The `localStorage` data is cleared on sign-out.

#### Residual risk
- User forgets to sign out (common on shared devices).
- Browser crash prevents the sign-out handler from running.

#### Recommended remediation (not applied — requires UX decisions)
1. Display a **"Sign out on shared device"** reminder on the Settings page.
2. Consider adding a `sessionStorage`-only cache (cleared automatically when the tab closes) instead of `localStorage`, accepting the trade-off of losing fast-load optimisation on return visits.

---

### F-04: No CI/CD pipeline
**Severity:** 🟡 Low  
**Status:** Fixed — `.github/workflows/ci.yml` added in this PR  
**Impacted files:** (none previously — `.github/workflows/` did not exist)

#### Description
No GitHub Actions (or other CI) workflows existed. Pull requests and pushes to `main` received no automated test or build validation, meaning broken code or regressions could be merged silently.

#### Remediation (applied)
Added `.github/workflows/ci.yml` that:
- Triggers on every push and pull request to `main`.
- Installs dependencies with `npm ci` (reproducible from lockfile).
- Runs the existing Jest test suite (`npm test -- --watchAll=false`).
- Runs a production build (`npm run build`).
- Passes stub Firebase env-var values so `firebaseConfig.js` validation does not fail in the CI environment.

---

### F-05: Missing HTTP security response headers
**Severity:** 🟡 Low  
**Status:** Fixed — headers added to `firebase.json` in this PR  
**Impacted files:** `firebase.json`

#### Description
The Firebase Hosting config served no security-related HTTP response headers. Without these, browsers apply lenient defaults that allow several classes of attack.

| Header | Risk without it |
|--------|----------------|
| `X-Content-Type-Options: nosniff` | MIME-sniffing attacks |
| `X-Frame-Options: DENY` | Clickjacking |
| `Referrer-Policy: strict-origin-when-cross-origin` | Referrer leakage to third-party sites |
| `Permissions-Policy` | Unrestricted access to camera/mic/geolocation APIs |

#### Remediation (applied)
Added a catch-all `"source": "**"` header block to `firebase.json` setting all four headers. Cache-control headers for HTML and static assets are preserved unchanged.

---

### F-06: Hardcoded Firebase credentials (resolved)
**Severity:** 🟡 Low  
**Status:** Resolved in prior PR #1  
**Impacted files:** `src/services/firebaseConfig.js`, `.env.example`

#### Description
Firebase client config values were hardcoded directly in `firebaseConfig.js` and committed to the repository, triggering a GitHub secret scanning alert.

#### Remediation (applied in PR #1)
- All six Firebase config values moved to `REACT_APP_FIREBASE_*` environment variables.
- `firebaseConfig.js` validates that all variables are present at startup; the app fails fast with a clear error if any are missing.
- `.env.example` added with placeholder values and instructions.
- `.gitignore` already excluded `.env.local`.
- **Action required:** Rotate the previously exposed API key in the [Firebase Console](https://console.firebase.google.com) → Project Settings → API keys.

---

## What Was Checked

| Area | Finding |
|------|---------|
| Tracked files for secrets/tokens | No new secrets found; prior hardcoded Firebase config resolved in PR #1 |
| `.gitignore` | Correctly excludes `.env`, `.env.local`, and variants |
| Firebase config | Env-var driven; validated at startup |
| Firestore security rules | **Missing — added in this PR** |
| Authentication flow | Google Sign-In with domain restriction; UX-layer bypass risk mitigated by new Firestore rule |
| Client-side auth state trust | Route gating via `authUser` from Firebase SDK (server-validated token); acceptable |
| `localStorage` usage | Sensitive cache; cleared on sign-out; documented residual risk |
| External API calls | `messApi.js` calls `https://messit.vinnovateit.com` — no credentials sent, public menu data only |
| `package.json` / dependencies | No obviously vulnerable pinned versions; CRA `react-scripts@5.0.1` is current stable |
| Firebase Hosting config | Headers added; cache policy unchanged |
| CI/CD | **Missing — GitHub Actions workflow added in this PR** |
| GitHub Actions secrets | No workflow previously existed; CI uses non-functional placeholder env vars |

---

## Post-PR Action Checklist

These items require manual action by the repository owner and cannot be done via code changes:

- [ ] **Rotate the Firebase API key** that was previously hardcoded (see F-06).
- [ ] **Deploy Firestore rules** to production: `npx firebase-tools deploy --only firestore:rules`
- [ ] **Restrict the Firebase API key** in Google Cloud Console: limit to your production domain and required APIs only.
- [ ] **Enable Firebase Authentication domain restrictions** in the Firebase Console if not already done.
- [ ] **Review existing Firestore data** to ensure no data was accessed by unauthorised accounts before rules were deployed.
- [ ] **Add `REACT_APP_FIREBASE_*` secrets** to GitHub repository secrets for future deployment workflows.
