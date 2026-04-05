# UNMESSIFY

UNMESSIFY is a React app for hostel/mess meal budget management. It helps users set monthly credit limits, track spending, plan meals, and get smart meal combo suggestions from live mess menu data.

## Features

- Dashboard with monthly progress, safe-limit indicators, and burn-rate projection
- Smart Suggestions with budget-aware meal combo generation
- Menu Planner calendar for planning upcoming meals
- Guest mode with quick budget calculator
- Local persistence and optional cloud sync for meal plans

## Tech Stack

- React 19
- React Router
- Recharts for analytics visualizations
- Firebase for authentication/cloud integration
- IndexedDB (via idb) and local storage fallback
- Create React App tooling

## Setup

### Prerequisites

- Node.js 18+ recommended
- npm 9+ recommended

### Install

```bash
npm install
```

### Run In Development

```bash
npm start
```

### Build For Production

```bash
npm run build
```

## Deploy (Firebase Hosting)

This project is pre-configured for Firebase Hosting with SPA rewrites.

### One-time setup

```bash
npx firebase-tools login
```

### Deploy to production

```bash
npm run hosting:deploy
```

### Deploy preview channel

```bash
npm run hosting:preview
```

### Important auth step

After first deploy, add your hosting domain in Firebase Console:

1. Firebase Console -> Authentication -> Settings -> Authorized domains
2. Add `<project-id>.web.app` and `<project-id>.firebaseapp.com`
3. Add custom domain too if you configure one

## Project Structure

```text
src/
	components/      Reusable UI components and illustrations
	context/         App state providers (auth, user, menu, transactions, theme)
	pages/           Route-level pages (Dashboard, MenuPlanner, Suggestions, etc.)
	services/        API, cloud sync, and storage services
	styles/          Global and page-level styles
	utils/           Budget and recommendation algorithms
```

## Notes

- The build output directory is intentionally not tracked in source.
- Menu data is fetched dynamically from the configured API endpoint in the mess API service.
