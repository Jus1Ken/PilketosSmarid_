# Deployment Plan for Pilketos Web App

## Backend (Render)
- [x] Add "start" script to root package.json
- [ ] Ensure .env has required environment variables (MONGO_URI, JWT_SECRET, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)
- [ ] Push code to GitHub repository
- [ ] Create Render web service:
  - Connect GitHub repo
  - Build Command: (leave empty for Node.js)
  - Start Command: npm start
  - Set environment variables in Render dashboard
- [ ] Deploy backend and note the URL (e.g., https://pilketos-backend.onrender.com)

## Frontend (Netlify)
- [x] Create _redirects file in frontend/public/
- [ ] Push updated code to GitHub
- [ ] Create Netlify site:
  - Connect GitHub repo
  - Build Command: npm run build
  - Publish Directory: dist
  - Set environment variable: VITE_API_URL = [Render backend URL]
- [ ] Deploy frontend

## Testing
- [ ] Test frontend loads and connects to backend
- [ ] Verify all features work in production
