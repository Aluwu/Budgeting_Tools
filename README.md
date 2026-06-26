# McLeod Budgeting

> A clean, local-first budgeting app for tracking income, expenses, savings, and month-to-month cash carryover.

**Live site:** https://Aluwu.github.io/Budgeting_Tools

## What it does

McLeod Budgeting is a personal finance dashboard built for fast monthly planning without a backend. Everything is stored in browser `localStorage`, so the app works as a static GitHub Pages site and keeps your data on your device.

## Highlights

- Top-line dashboard cards for income, expenses, savings, and cash balance.
- Inline editing for every name and number.
- Month switcher with previous/next navigation.
- Start New Month flow that carries recurring expenses forward and resets spent amounts.
- Expense delta tracking that shows what is left, with color cues for over/under budget.
- Responsive dark UI designed for desktop and mobile.

## Tech Stack

- React
- Vite
- Tailwind CSS
- Lucide React
- Browser `localStorage`

## Project Structure

- `McLeodBudgetApp.jsx` - main app component and budgeting logic
- `src/App.jsx` - app entry wrapper
- `src/main.jsx` - React bootstrap
- `src/index.css` - Tailwind base styles
- `vite.config.js` - GitHub Pages base path
- `package.json` - scripts and dependencies

## Run Locally

```bash
npm install
npm run dev
```

## Build for Production

```bash
npm run build
```

## Deploy to GitHub Pages

```bash
npm run deploy
```

Before deploying, make sure these values match your repository:

- `homepage` in `package.json` should point to your Pages URL
- `base` in `vite.config.js` should be set to `/<repo-name>/`

Then in GitHub:

1. Open the repository settings.
2. Go to Pages.
3. Set the source to the `gh-pages` branch.
4. Use the `/ (root)` folder.

## Notes

- The app does not use a backend database.
- Data persists in the browser unless the user clears site storage.
- The deployed site is a static build, so it is safe for GitHub Pages.
