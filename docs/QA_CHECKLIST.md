# UNMESSIFY QA Checklist

This checklist is for manual end-to-end verification after automated tests pass.

## Environment

1. Install dependencies.
2. Start app in development mode.
3. Use a valid VIT student account for authentication checks.

## Authentication and Routing

1. Open root route while logged out.
   Expected: Guest mode page appears.
2. Sign in with non-allowed domain.
   Expected: Access is denied and auth error message is shown.
3. Sign in with allowed domain and no profile.
   Expected: Redirect to setup flow.
4. Complete profile setup.
   Expected: Redirect to dashboard and navigation appears.
5. Enter invalid deep route while authenticated.
   Expected: Redirect to dashboard.

## Profile and Settings

1. Update monthly limit in settings to a valid value.
   Expected: Success message appears and value persists on refresh.
2. Enter monthly limit below minimum and above maximum.
   Expected: Validation errors appear.
3. Run reset credits/transactions from settings.
   Expected: Dashboard and planner totals reset.
4. Sign out from settings.
   Expected: User data is cleared locally and app returns to guest mode.

## Dashboard

1. Open dashboard with no transactions.
   Expected: Empty chart and no crash.
2. Add transactions/meals and reopen dashboard.
   Expected: Total spent, remaining budget, and progress bar update correctly.
3. Cross 70 percent of monthly limit.
   Expected: Safe-limit warning appears.
4. Exceed monthly limit.
   Expected: Budget exceeded alert appears.
5. Validate burn-rate section with at least 3 recent-day records.
   Expected: Projection graph appears and values are reasonable.

## Smart Suggestions

1. Open suggestions with today budget selected.
   Expected: Budget card reflects available budget after today spend.
2. Change filters: meal types and veg/non-veg.
   Expected: Recommendations adjust accordingly.
3. Use low budget where no combo should fit.
   Expected: No-results state shown.
4. Add combo to transactions.
   Expected: Toast appears and dashboard totals reflect new entries.

## Menu Planner

1. Open planner and select date.
   Expected: Date detail panel opens.
2. Add one meal and multiple meals from modal.
   Expected: Entries appear on selected day and month stats update.
3. Delete planned meal.
   Expected: Meal is removed from planner and linked transaction is removed where applicable.
4. Navigate months and return to current month.
   Expected: Calendar state and counts remain consistent.

## Menu and Data Loading

1. Load menu page with network available.
   Expected: Menu items appear grouped by meal type.
2. Simulate API failure (offline/devtools network block).
   Expected: App handles gracefully without crash.

## Persistence and Sync

1. Add transactions and planned meals, then refresh app.
   Expected: Data is restored from local storage/indexedDB.
2. If cloud sync is enabled, login on second session/device.
   Expected: Profile, transactions, and planned meals sync from cloud.
3. Cloud has empty arrays for transactions/meals.
   Expected: Local stale arrays are cleared after sync.

## Non-Functional Checks

1. Mobile viewport check (approximately 360x800).
   Expected: Navigation and key pages remain usable without overlap.
2. Basic accessibility pass.
   Expected: Interactive elements are keyboard reachable and labeled.
3. Performance smoke check.
   Expected: Initial load and route transitions complete without obvious lag.
