# TODO: Fix Railway Deployment Proxy Error

## Completed Steps
- [x] Analyze the issue: Frontend proxy error due to separate deployments (frontend and backend as separate Railway services).
- [x] Update frontend/src/context/VotingContext.jsx to use VITE_API_URL env var for API base URL.
- [x] Fix TypeError: candidates.reduce is not a function by adding Array.isArray check in totalVotes calculation.

## Pending Steps
- [ ] Deploy backend as separate Railway service (from backend/ directory or separate repo).
- [ ] Get the backend Railway URL (e.g., https://backend-service.up.railway.app).
- [ ] Deploy frontend as separate Railway service (from frontend/ directory or separate repo).
- [ ] In frontend Railway service, set environment variable VITE_API_URL to the backend URL.
- [ ] For frontend deployment: Set build command to "npm run build", publish directory to "dist" (static site).
- [ ] Test the deployed frontend: API calls should now go to backend URL instead of failing proxy.
- [ ] If issues, check Railway logs for build/start errors.
