# 🚀 Deployment Guide - AI Project Manager

## 🌐 Frontend Deployment (Vercel)

### 1. Deploy to Vercel
```bash
# Already done - your frontend is on Vercel
# URL: https://your-app.vercel.app
```

### 2. Environment Variables for Vercel
In your Vercel dashboard, add these environment variables:

```bash
# Firebase Configuration (Public - Safe to expose)
VITE_FIREBASE_API_KEY=AIzaSyBCw3bisR9MbsbMGicUiQ5NpYrlG_FCn8U
VITE_FIREBASE_AUTH_DOMAIN=ai-project-manager-8f527.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ai-project-manager-8f527
VITE_FIREBASE_STORAGE_BUCKET=ai-project-manager-8f527.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=220708142612
VITE_FIREBASE_APP_ID=1:220708142612:web:3e93738f6a0f15e7cb3101
VITE_FIREBASE_MEASUREMENT_ID=G-65XHX6DD8E

# Tambo AI Configuration
VITE_TAMBO_API_KEY=tambo_zApVRC7JUwMxvUcEOLSJCu07eSFaFnOWiinIO2b40xrwd7rxuAiFmNR7090/mpyI6/tZJWqMoZawImlId0cgHljhgRpbzFvlrZPqIMlBUqQ=

# Backend API URL (will be set after backend deployment)
VITE_API_URL=https://your-backend-url.railway.app
```

## 🖥️ Backend Deployment (Railway)

### 1. Deploy to Railway
1. Go to [Railway.app](https://railway.app)
2. Connect your GitHub repository
3. Select "Deploy from GitHub repo"
4. Choose your `AI-Project-Manager` repository
5. Railway will automatically detect Node.js and deploy

### 2. Environment Variables for Railway
In Railway dashboard, add these environment variables:

```bash
# Production Environment
NODE_ENV=production

# Server Configuration
PORT=3001

# CORS Configuration (your Vercel frontend URL)
CORS_ORIGIN=https://your-app.vercel.app

# Firebase Admin (if needed for server-side operations)
# Note: For hackathon, we're using client-side Firebase only
```

### 3. Railway Configuration Files
The following files are already created for Railway:

- `railway.json` - Railway deployment configuration
- `Procfile` - Process configuration
- Health check endpoint at `/api/health`

## 🔧 Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/PAVAN2627/AI-Project-Manager.git
cd AI-Project-Manager
npm install
```

### 2. Create Local Environment Files
```bash
# Copy example files
cp .env.example .env
cp .env.example server/.env

# Edit .env with your values
# Edit server/.env with your values
```

### 3. Run Development Servers
```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend  
npm run dev
```

## 🌍 Production URLs

### Frontend (Vercel)
- **URL**: `https://your-app.vercel.app`
- **Status**: ✅ Deployed

### Backend (Railway)
- **URL**: `https://your-backend-url.railway.app`
- **Health Check**: `https://your-backend-url.railway.app/api/health`
- **Status**: 🔄 Ready to deploy

## 🔐 Security Notes

### Environment Variables
- ✅ `.env` files are in `.gitignore`
- ✅ No secrets committed to GitHub
- ✅ Firebase config is public (safe to expose)
- ✅ Tambo API key is environment-specific

### CORS Configuration
- Production: Only allows your Vercel domain
- Development: Allows localhost

## 🚀 Quick Deploy Commands

### Update Frontend (Vercel)
```bash
git add .
git commit -m "Update frontend"
git push origin main
# Vercel auto-deploys from main branch
```

### Update Backend (Railway)
```bash
git add .
git commit -m "Update backend"
git push origin main
# Railway auto-deploys from main branch
```

## 🎯 Hackathon Demo URLs

Once deployed, your demo URLs will be:

- **Live Demo**: `https://your-app.vercel.app`
- **API Health**: `https://your-backend-url.railway.app/api/health`
- **GitHub Repo**: `https://github.com/PAVAN2627/AI-Project-Manager`

## 🆘 Troubleshooting

### Frontend Issues
- Check Vercel build logs
- Verify environment variables in Vercel dashboard
- Ensure `VITE_API_URL` points to your Railway backend

### Backend Issues
- Check Railway deployment logs
- Verify environment variables in Railway dashboard
- Test health endpoint: `/api/health`

### CORS Issues
- Ensure `CORS_ORIGIN` in Railway matches your Vercel URL
- Check browser console for CORS errors

## 📞 Support

If you encounter issues:
1. Check deployment logs in Vercel/Railway dashboards
2. Verify all environment variables are set correctly
3. Test API endpoints directly
4. Check browser console for errors

---

**Ready for hackathon judging!** 🏆