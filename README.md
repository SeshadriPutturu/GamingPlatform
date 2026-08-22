# Score Keeper

Simple single-page web app to add members, track scores, and show the winner when you click "End Game". Data is stored in the browser's `localStorage` so no server is required.

## Files

- `index.html` — main page
- `style.css` — styles
- `app.js` — app logic

## Run locally

Open `index.html` in a browser.

## Host on GitHub Pages

1. Create a new GitHub repository and push these files to the `main` branch.
2. On GitHub, go to **Settings → Pages** and set the source to `main` branch and `/ (root)` folder, then save.
3. Your site will be available at `https://<your-username>.github.io/<repo-name>/` shortly.

Quick commands to push (run locally):

```bash
git init
git add .
git commit -m "Initial commit: score keeper"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main

```
