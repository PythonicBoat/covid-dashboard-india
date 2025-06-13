# 🚀 Deployment Guide

## Method 1: Automated Deployment (Recommended)

### Prerequisites
```bash
# Install GitHub CLI if not already installed
brew install gh

# Authenticate with GitHub
gh auth login
```

### Deploy
```bash
# Run the deployment script
./deploy.sh
```

## Method 2: Manual Deployment

### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it: `covid-dashboard-india`
3. Make it public
4. Don't initialize with README (we already have one)

### Step 2: Push Code

```bash
# Add remote origin (replace 'yourusername' with your GitHub username)
git remote add origin https://github.com/yourusername/covid-dashboard-india.git

# Push code
git push -u origin main
```

### Step 3: Deploy Backend (Railway)

1. **Go to [Railway](https://railway.app)**
2. **Sign up/Login** with GitHub
3. **Create New Project** → **Deploy from GitHub repo**
4. **Select** your `covid-dashboard-india` repository
5. **Environment Variables:**
   ```
   SPRING_PROFILES_ACTIVE=prod
   PORT=8080
   ```
6. **Deploy** - Railway will automatically build the Docker container
7. **Note the deployed URL** (e.g., `https://your-app-name.railway.app`)

### Step 4: Deploy Frontend (Vercel)

1. **Go to [Vercel](https://vercel.com)**
2. **Sign up/Login** with GitHub
3. **Import Project** → Select your repository
4. **Configure:**
   - Framework Preset: `Other`
   - Root Directory: `public/`
   - Build Command: `echo "Static build"`
   - Output Directory: `public/`
5. **Deploy**
6. **Note the deployed URL** (e.g., `https://your-app-name.vercel.app`)

### Step 5: Update API Configuration

1. **Edit `public/js/dashboard.js`**
2. **Find the line:** `return 'https://your-backend-url.railway.app';`
3. **Replace** with your actual Railway backend URL
4. **Commit and push:**
   ```bash
   git add public/js/dashboard.js
   git commit -m "Update backend API URL for production"
   git push
   ```
5. **Vercel will auto-deploy** the updated frontend

## Alternative Backend Hosting Options

### Heroku (Free Tier Discontinued)
```bash
# Install Heroku CLI
brew install heroku/brew/heroku

# Login and create app
heroku login
heroku create your-covid-dashboard

# Set environment variables
heroku config:set SPRING_PROFILES_ACTIVE=prod

# Deploy
git push heroku main
```

### Render
1. Go to [Render](https://render.com)
2. Connect GitHub repo
3. Choose "Web Service"
4. Build Command: `./mvnw clean package -DskipTests`
5. Start Command: `java -jar target/india-covid19-dashboard-1.0.0.jar`

### Google Cloud Run
```bash
# Build and deploy
gcloud run deploy covid-dashboard \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Alternative Frontend Hosting Options

### Netlify
1. Go to [Netlify](https://netlify.com)
2. Drag and drop the `public/` folder
3. Or connect GitHub repo with build settings:
   - Publish directory: `public/`

### GitHub Pages
```bash
# Create gh-pages branch
git checkout -b gh-pages
git push origin gh-pages

# Enable GitHub Pages in repository settings
```

## Verification Steps

### Backend Health Check
```bash
# Test backend API
curl https://your-backend-url.railway.app/actuator/health

# Test metrics endpoint  
curl https://your-backend-url.railway.app/api/metrics
```

### Frontend Testing
1. **Open** your Vercel URL
2. **Check** that metrics load properly
3. **Verify** state table populates
4. **Test** refresh and export buttons

## Environment URLs

After deployment, you'll have:

- **Backend API:** `https://your-app-name.railway.app`
- **Frontend:** `https://your-app-name.vercel.app`
- **API Endpoint:** `https://your-app-name.railway.app/api/metrics`
- **Health Check:** `https://your-app-name.railway.app/actuator/health`

## Monitoring

### GitHub Actions
- **Builds** run automatically on every push
- **Scheduled runs** keep backend active hourly
- **Check status** at: `https://github.com/yourusername/covid-dashboard-india/actions`

### Backend Monitoring
- **Railway Dashboard** shows logs and metrics
- **Health endpoint** for uptime monitoring
- **Auto-scaling** based on traffic

### Frontend Monitoring
- **Vercel Dashboard** shows deployment status
- **Analytics** available in Vercel dashboard
- **Edge caching** for global performance

## Troubleshooting

### Backend Issues
```bash
# Check logs in Railway dashboard
# Verify environment variables
# Test API endpoints manually
```

### Frontend Issues
```bash
# Check browser console for errors
# Verify API URL is correct
# Test CORS configuration
```

### CORS Issues
If frontend can't connect to backend:
1. **Check** `application-prod.properties`
2. **Update** `cors.allowed-origins` with your Vercel URL
3. **Redeploy** backend

## Cost Estimation

### Free Tier Limits
- **Railway:** 512MB RAM, $5 credit monthly
- **Vercel:** 100GB bandwidth, unlimited sites
- **GitHub Actions:** 2000 minutes monthly

### Expected Usage
- **Backend:** ~100MB RAM, minimal CPU
- **Frontend:** Static files, fast CDN delivery
- **Data Transfer:** Low (API calls only)

**Total Cost:** $0-5/month for moderate traffic

## Security Notes

- **No sensitive data** stored in frontend
- **CORS** properly configured
- **HTTPS** enforced on both platforms
- **Rate limiting** handled by hosting providers
- **API endpoints** are read-only public data

---

🎉 **Your COVID-19 Dashboard is now live and accessible worldwide!**
