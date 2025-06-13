# 🦠 COVID-19 India Live Dashboard

A real-time COVID-19 dashboard for India with state-wise statistics, live updates, and beautiful visualizations.

![Dashboard Preview](https://img.shields.io/badge/Status-Live-brightgreen)
![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.1.0-green)
![Frontend](https://img.shields.io/badge/Frontend-Vanilla%20JS-yellow)

## ✨ Features

- 📊 **Real-time COVID-19 metrics** with live indicators
- 🏛️ **State-wise data table** for all 31 Indian states
- 👥 **Visitor counter** with persistent tracking
- 🔄 **Auto-refresh** functionality (hourly updates)
- 📱 **Responsive design** for all devices
- 🚀 **Professional animations** and UI elements
- 📈 **Coming soon** features section
- 🔗 **API endpoint** for raw data access

## 🏗️ Architecture

### Backend (Spring Boot)
- **Java 17** with Spring Boot 3.1.0
- RESTful API endpoints
- Real-time data fetching from official sources
- State filtering (displays states 1-31 only)
- CORS configured for cross-origin requests

### Frontend (Vanilla JavaScript)
- Clean, modern UI with CSS animations
- Environment-aware API calls
- localStorage for visitor tracking
- Responsive design with mobile support

## 🚀 Deployment

### Backend Deployment (GitHub Actions + Railway/Heroku)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit: COVID-19 Dashboard"
   git branch -M main
   git remote add origin https://github.com/yourusername/covid-dashboard.git
   git push -u origin main
   ```

2. **Railway Deployment:**
   - Connect your GitHub repo to [Railway](https://railway.app)
   - Railway will auto-detect the Spring Boot app
   - Set environment variable: `SPRING_PROFILES_ACTIVE=prod`

3. **GitHub Actions:**
   - Automatically builds and tests on every push
   - Runs hourly to keep the backend active
   - Located in `.github/workflows/backend.yml`

### Frontend Deployment (Vercel)

1. **Connect to Vercel:**
   - Import your GitHub repo in [Vercel](https://vercel.com)
   - Vercel will detect the static files automatically

2. **Update Backend URL:**
   - After backend deployment, update the API URL in `dashboard.js`
   - Replace `your-backend-url.railway.app` with your actual backend URL

3. **Environment Variables:**
   - Set `BACKEND_URL` in Vercel dashboard if needed

## 🛠️ Local Development

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- Modern web browser

### Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/covid-dashboard.git
   cd covid-dashboard
   ```

2. **Start the backend:**
   ```bash
   ./mvnw spring-boot:run
   ```

3. **Access the dashboard:**
   - Open http://localhost:8080 in your browser
   - The dashboard will load with real-time COVID-19 data

### API Endpoints

- `GET /` - Main dashboard page
- `GET /api/metrics` - JSON API with COVID-19 metrics
- `GET /actuator/health` - Health check endpoint

## 📊 Data Sources

- **Primary Source:** Ministry of Health and Family Welfare, India
- **API Endpoint:** https://covid19dashboard.mohfw.gov.in/data/datanew.json
- **Update Frequency:** Hourly (via GitHub Actions)
- **Data Coverage:** All 31 Indian states and union territories

## 🎨 Features in Detail

### Metric Cards
- **New Cases** as primary display (swapped from totals)
- **Active, Recovered, Deaths** with trend indicators
- **Color-coded arrows** (red for increases, green for recoveries)
- **No +/- signs** for cleaner display

### State Table
- **Filtered data** showing only states 1-31
- **Responsive design** with horizontal scroll on mobile
- **Number formatting** with comma separators
- **Color-coded columns** for better readability

### Live Features
- **LIVE indicator** with pulsing red animation
- **Visitor counter** with animated number updates
- **Auto-refresh** countdown timer
- **Real-time status** updates

### Coming Soon
- **7-day trend charts** with professional placeholder
- **Advanced analytics** features
- **More visualization options**

## 🔧 Configuration

### Environment Variables
```properties
# Production
SPRING_PROFILES_ACTIVE=prod
PORT=8080
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app

# Development
SPRING_PROFILES_ACTIVE=default
```

### CORS Configuration
The application is configured to accept requests from:
- Vercel deployments (*.vercel.app)
- Netlify deployments (*.netlify.app)
- Local development (localhost:*)

## 📱 Mobile Support

- **Responsive design** adapts to all screen sizes
- **Touch-friendly** buttons and interactions
- **Optimized layouts** for mobile and tablet
- **Fast loading** with minimal bandwidth usage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ministry of Health and Family Welfare, India** for providing the COVID-19 data
- **Spring Boot** community for the excellent framework
- **GitHub Actions** for CI/CD automation
- **Railway/Vercel** for hosting infrastructure

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check the [GitHub Actions logs](https://github.com/yourusername/covid-dashboard/actions) for deployment status
- Verify the [backend health endpoint](https://your-backend-url.railway.app/actuator/health)

---

**Built with ❤️ for India | Real-time COVID-19 Dashboard**

🇮🇳 Stay Safe, Stay Informed
