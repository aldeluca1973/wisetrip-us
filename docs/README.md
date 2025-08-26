# WiseTrip Application Documentation

## Overview

WiseTrip is an intelligent travel companion that creates personalized itineraries with AI-powered insights, transparent pricing, and verified local experiences. This documentation provides comprehensive guidance for running, deploying, and administering the complete WiseTrip application.

## Quick Links

- [🚀 Getting Started](RUN.md) - How to run WiseTrip locally
- [🌐 Deployment Guide](DEPLOY.md) - Production deployment instructions  
- [📱 Mobile Apps](STORES.md) - App store deployment via Capacitor
- [👤 Admin Guide](ADMIN.md) - Administrative functions and management
- [🔗 API Reference](API.md) - Complete API documentation

## Architecture Overview

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for build tooling
- **TailwindCSS** for styling
- **React Router** for routing
- **Supabase Client** for backend integration

### Backend Stack
- **Supabase** as Backend-as-a-Service
- **PostgreSQL** database
- **Edge Functions** for AI services
- **Supabase Auth** for authentication
- **Supabase Storage** for file management

### AI Services (6 Core Functions)
1. **generate-itinerary** - Creates personalized day-by-day itineraries
2. **optimize-itinerary** - Optimizes existing itineraries for time/cost
3. **generate-packing-list** - Creates smart packing recommendations
4. **inspire-me** - Generates travel inspiration based on preferences
5. **price-lock-monitor** - Monitors and manages price locks
6. **concierge-answer** - Provides intelligent travel assistance

## Key Features Implemented

### ✅ Core AI Features (6/6)
- Generate Itinerary
- Optimize Itinerary  
- Generate Packing List
- Inspire Me
- Price Lock Monitor
- Concierge Answer

### ✅ Differentiator Features (7/7)
- **Inspire Me Mode** - AI-powered travel inspiration
- **Trust Flags** - Business verification system
- **Backup Activities** - Alternative activity suggestions
- **Price Lock Transparency** - Guaranteed pricing with savings tracking
- **Offline Exports** - PDF itinerary downloads
- **AR Stub** - Augmented reality integration foundation
- **Anonymous Voting** - Group decision-making tools

### ✅ Database Schema
- Complete database with all 12+ tables
- User profiles and authentication
- Trip management with days and activities
- Business and tourist office partnerships
- Price lock and trust flag systems
- Voting and inspiration features

### ✅ B2B Portal
- Tourist office management
- Business partnership features
- Subscription tiers (Free, Pro, Enterprise)
- Analytics and reporting capabilities

## Deployment Status

- **🌐 Live Application**: https://xezfbroix3kf.space.minimax.io
- **📊 Database**: Supabase project `mbrzrpstrzicaxqqfftk`
- **⚡ Edge Functions**: All 6 AI functions deployed and active
- **📱 Mobile Ready**: Capacitor configuration included

## Project Structure

```
wisetrip-complete/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── Layout/         # Header, Footer, Navigation
│   │   └── UI/             # Common UI elements
│   ├── pages/              # Route components
│   │   ├── HomePage.tsx    # Landing page
│   │   ├── InspirePage.tsx # Inspiration feature
│   │   ├── TripsPage.tsx   # Trip management
│   │   ├── PriceLocksPage.tsx # Price transparency
│   │   └── B2BPortalPage.tsx # Business portal
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   └── App.tsx             # Main application component
├── supabase/
│   ├── functions/          # Edge Functions (AI services)
│   ├── migrations/         # Database migrations
│   └── seed.sql            # Demo data
├── docs/                   # This documentation
└── public/                 # Static assets
```

## Environment Requirements

### Required Environment Variables
```env
VITE_SUPABASE_URL=https://mbrzrpstrzicaxqqfftk.supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
OPENAI_API_KEY=[for-ai-functions]
```

### Dependencies
- Node.js 18+
- pnpm or npm
- Supabase CLI (for local development)
- Git

## Getting Started

For detailed setup instructions, see [RUN.md](RUN.md).

## Contributing

This is a production application built to exact specifications. Any modifications should maintain:
- All 6 AI functions
- All 7 differentiator features  
- Complete database schema
- Mobile compatibility
- Performance standards

## Support

For technical issues or questions:
- Check the [Admin Guide](ADMIN.md) for administrative functions
- Review [API Documentation](API.md) for integration details
- Consult deployment logs in Supabase dashboard

---

**WiseTrip** - Your Intelligent Travel Companion  
Built with ❤️ using React, Supabase, and AI