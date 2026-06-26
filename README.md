# McLeod Budgeting

A personal budgeting web app built with React, Tailwind CSS, Lucide React, and browser localStorage.

## Local development

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

## GitHub Pages deployment

1. Update `package.json`:
   - Set `homepage` to `https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPO_NAME`

2. Update `vite.config.js`:
   - Set `base` to `'/YOUR_REPO_NAME/'`

3. Build and deploy:

```bash
npm run deploy
```

4. In GitHub repository settings:
   - Go to Pages
   - Set source to the `gh-pages` branch and `/ (root)`

## Notes

- All data stays in the browser using localStorage.
- There is no backend database.
- The `McLeodBudgetApp.jsx` file contains the budgeting logic and UI.
