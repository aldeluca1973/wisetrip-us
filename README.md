# WiseTrip - AI-Powered Travel Planning Platform

[![Build Status](https://github.com/wisetrip/wisetrip-app/workflows/Build%20and%20Deploy%20WiseTrip/badge.svg)](https://github.com/wisetrip/wisetrip-app/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/wisetrip/wisetrip-app/releases)

## 🌟 Overview

WiseTrip is a comprehensive AI-powered travel planning platform that combines intelligent recommendations with transparent pricing and collaborative planning features. Built with modern web technologies and optimized for both web and mobile experiences.

### ✨ Key Features

- **🤖 AI-Powered Inspiration**: Get personalized travel recommendations based on mood, interests, and preferences
- **🔒 Price Lock Transparency**: Track price changes with savings calculators and expiry monitoring
- **🤝 Collaborative Planning**: Share and collaborate on trip planning with friends and family
- **🛡️ Trust Flags**: Verified businesses with ratings and authenticity badges
- **📱 Cross-Platform**: Progressive Web App with native mobile app support via Capacitor
- **💰 B2B Portal**: Business partnerships and subscription management
- **🔍 Provider Comparison**: Real-time comparison across multiple travel providers

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Mobile**: Capacitor for iOS/Android
- **AI**: OpenAI GPT-4 integration
- **Payments**: Stripe subscriptions
- **Maps**: Google Maps API
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (Web) + App Stores (Mobile)

### Project Structure

```
wisetrip-app/
├── .github/workflows/          # GitHub Actions CI/CD
├── android/                    # Android app (Capacitor)
├── ios/                        # iOS app (Capacitor)
├── supabase/
│   ├── functions/             # Edge Functions
│   ├── migrations/            # Database migrations
│   └── tables/               # Table definitions
├── src/
│   ├── components/           # React components
│   ├── pages/               # Page components
│   ├── hooks/               # Custom React hooks
│   ├── contexts/            # React contexts
│   └── lib/                 # Utilities and configurations
├── public/                  # Static assets
├── docs/                   # Documentation
└── dist/                   # Build output
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- pnpm 8.15.6 or higher
- Git
- Supabase CLI (optional, for local development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/wisetrip/wisetrip-app.git
   cd wisetrip-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**
   ```bash
   pnpm dev
   ```

5. **Access the application**
   - Web: http://localhost:5173
   - Development tools: Available in browser dev tools

### Environment Variables

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Optional: Sentry for error monitoring
VITE_SENTRY_DSN=your_sentry_dsn
```

## 📱 Mobile Development

### iOS Development

1. **Prerequisites**
   - Xcode 14+ (macOS only)
   - iOS 13+ target devices
   - Apple Developer account

2. **Setup**
   ```bash
   # Build web assets
   pnpm build
   
   # Sync with Capacitor
   npx cap sync ios
   
   # Open in Xcode
   npx cap open ios
   ```

3. **App Store Submission**
   - Configure signing certificates
   - Update app icons and splash screens
   - Test on physical devices
   - Submit via App Store Connect

### Android Development

1. **Prerequisites**
   - Android Studio
   - Android SDK 21+ (Android 5.0+)
   - Google Play Console account

2. **Setup**
   ```bash
   # Build web assets
   pnpm build
   
   # Sync with Capacitor
   npx cap sync android
   
   # Open in Android Studio
   npx cap open android
   ```

3. **Play Store Submission**
   - Generate signed APK/AAB
   - Configure app icons and metadata
   - Test on various devices
   - Submit via Google Play Console

## 🔧 Development Workflow

### Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm build:prod       # Build with production optimizations
pnpm preview          # Preview production build
pnpm lint             # Run ESLint

# Mobile
npx cap sync          # Sync web assets to mobile
npx cap run ios       # Run on iOS simulator
npx cap run android   # Run on Android emulator

# Database
npx supabase start    # Start local Supabase
npx supabase stop     # Stop local Supabase
npx supabase db push  # Apply migrations
```

### Code Quality

- **TypeScript**: Strict typing for better development experience
- **ESLint**: Code linting with React and TypeScript rules
- **Prettier**: Code formatting (integrated with ESLint)
- **Husky**: Pre-commit hooks for code quality
- **GitHub Actions**: Automated testing and deployment

## 🚀 Deployment

### Web Deployment (Vercel)

1. **Automatic Deployment**
   - Push to `main` branch triggers automatic deployment
   - Preview deployments for pull requests
   - Environment variables configured in Vercel dashboard

2. **Manual Deployment**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```

### Mobile App Deployment

1. **iOS App Store**
   - Archive and validate in Xcode
   - Upload via Xcode or Application Loader
   - Submit for review in App Store Connect

2. **Google Play Store**
   - Generate signed AAB bundle
   - Upload via Google Play Console
   - Complete store listing and submit for review

## 🔒 Security & Compliance

### Security Measures

- **Authentication**: Supabase Auth with JWT tokens
- **Authorization**: Row Level Security (RLS) policies
- **API Security**: Rate limiting and CORS configuration
- **Data Encryption**: TLS 1.3 for data in transit
- **Environment Variables**: Secure secret management
- **Regular Audits**: Automated security scanning with Snyk

### Privacy Compliance

- **GDPR Compliant**: User data rights and consent management
- **CCPA Compliant**: California Consumer Privacy Act compliance
- **Data Minimization**: Collect only necessary user data
- **Secure Storage**: Encrypted data at rest in Supabase

## 📊 Monitoring & Analytics

### Application Monitoring

- **Health Checks**: `/api/health` endpoint for system monitoring
- **Error Tracking**: Sentry integration for error monitoring
- **Performance**: Web Vitals tracking and optimization
- **Uptime Monitoring**: 24/7 availability tracking

### Business Analytics

- **User Analytics**: Privacy-focused user behavior tracking
- **Conversion Tracking**: Funnel analysis and optimization
- **Provider Performance**: Real-time provider comparison metrics
- **Revenue Tracking**: Subscription and commission analytics

## 🤝 Contributing

### Development Process

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Write/update tests**
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Create a Pull Request**

### Code Style Guidelines

- Follow existing TypeScript and React patterns
- Use meaningful variable and function names
- Write self-documenting code with appropriate comments
- Ensure all tests pass before submitting PR
- Update documentation for significant changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation

- [API Documentation](docs/API.md)
- [Deployment Guide](docs/DEPLOY.md)
- [Mobile Setup Guide](mobile-setup.md)
- [Admin Guide](docs/ADMIN.md)

### Contact

- **Email**: support@wisetrip.us
- **Website**: [wisetrip.us](https://wisetrip.us)
- **GitHub Issues**: [Report bugs and request features](https://github.com/wisetrip/wisetrip-app/issues)

### Community

- **Discord**: [Join our community](https://discord.gg/wisetrip)
- **Twitter**: [@WiseTrip](https://twitter.com/wisetrip)
- **Blog**: [Latest updates and tutorials](https://blog.wisetrip.us)

---

**Made with ❤️ by the WiseTrip Team**

*Empowering travelers with AI-driven insights and transparent pricing since 2025.*