# TODO: Fix Mixed Content Error

## Steps to Complete:

1. [x] Update frontend/src/context/VotingContext.jsx: Change API_BASE fallback to '' for relative URLs.
2. [x] Update frontend/src/components/AdminPanel.jsx: Replace 4 hardcoded 'http://localhost:5000' URLs with relative paths.
3. [x] Update frontend/vite.config.js: Add Vite proxy for '/api' to 'http://localhost:5000' for development.
4. [ ] Test the changes locally and in production (user to deploy and verify no mixed content errors).

After completing each step, mark as [x].
