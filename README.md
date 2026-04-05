# UNMESSIFY

UNMESSIFY is a React-based web app for **hostel/mess meal budget management**.  
It helps students stay within monthly food credits by tracking meal spending, planning ahead, and offering budget-aware meal suggestions from live menu data.

---

## ✨ Features

- **Budget Dashboard**
  - Monthly credit tracking
  - Safe-limit indicators
  - Burn-rate projection

- **Smart Suggestions**
  - Budget-aware meal combo recommendations
  - Helps optimize spending while preserving meal variety

- **Menu Planner**
  - Calendar-based meal planning for upcoming days

- **Guest Mode**
  - Quick budget calculator without full account setup

- **Data Persistence**
  - Local-first storage with IndexedDB
  - Optional cloud sync integration

---

## 🧱 Tech Stack

- **Frontend:** React 19, React Router, React Bootstrap, Bootstrap
- **Charts & Analytics:** Recharts
- **Persistence:** IndexedDB (`idb`) + localStorage fallback
- **Backend/Cloud Integration:** Firebase
- **Tooling:** Create React App (`react-scripts`)

---

## 📁 Project Structure

```text
src/
  App.jsx            Main app layout and routing shell
  components/        Reusable UI components
  context/           State providers (auth, user, menu, transactions, theme)
  pages/             Route-level views (Dashboard, Planner, Suggestions, etc.)
  services/          API, cloud sync, storage services
  styles/            App and page-level styles
  utils/             Budget/recommendation utility logic
```

Other notable directories/files:

```text
public/              Static assets and base HTML template
docs/                Project documentation assets
firebase.json        Firebase Hosting config (with SPA rewrites)
.firebaserc          Firebase project aliases/config
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js:** 18+ recommended  
- **npm:** 9+ recommended

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm start
```

App runs in development mode on the default CRA dev server.

### Build for production

```bash
npm run build
```

---

## 🧪 Available Scripts

From `package.json`:

- `npm start` – Start development server
- `npm run build` – Create production build
- `npm test` – Run tests
- `npm run eject` – Eject CRA configuration
- `npm run hosting:deploy` – Build and deploy to Firebase Hosting
- `npm run hosting:preview` – Build and deploy to Firebase preview channel

---

## 🌐 Deployment (Firebase Hosting)

This project is configured for **single-page app (SPA)** hosting via Firebase.

### One-time setup

```bash
npx firebase-tools login
```

### Deploy production

```bash
npm run hosting:deploy
```

### Deploy preview channel

```bash
npm run hosting:preview
```

### Important authentication step (after first deploy)

In Firebase Console:

1. Go to **Authentication → Settings → Authorized domains**
2. Add:
   - `<project-id>.web.app`
   - `<project-id>.firebaseapp.com`
3. Add your custom domain (if used)

---

## 📝 Notes

- Build artifacts are intentionally excluded from source control.
- Menu data is fetched dynamically through the configured API service in `src/services`.
- Firebase configuration and environment-specific setup should be validated before production deployment.

---