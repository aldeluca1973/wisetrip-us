# WiseTrip - Running the Application

This guide explains how to run WiseTrip locally for development and testing.

## Prerequisites

### System Requirements
- **Node.js**: Version 18.0 or higher
- **Package Manager**: pnpm (recommended) or npm
- **Git**: For version control
- **Modern Browser**: Chrome, Firefox, Safari, or Edge

### Environment Setup

1. **Clone the Repository**
   ```bash
   git clone [your-repo-url]
   cd wisetrip-complete
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the project root:
   ```env
   VITE_SUPABASE_URL=https://mbrzrpstrzicaxqqfftk.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icnpycHN0cnppY2F4cXFmZnRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQxOTc3NTYsImV4cCI6MjAzOTc3Mzc1Nn0.QmU1yVGJP6rsPBGz5krcGHKMkvNME5GKvMdGzf6GV2Y
   ```

## Running the Development Server

### Start the Application
```bash
pnpm dev
# or
npm run dev
```

The application will start on `http://localhost:5173/`

### Development Features
- **Hot Module Replacement (HMR)**: Instant updates during development
- **TypeScript Support**: Full type checking and IntelliSense
- **ESLint Integration**: Code quality enforcement
- **Tailwind CSS**: Utility-first styling with purging

## Demo Account

For testing purposes, use these demo credentials:
- **Email**: `demo@wisetrip.com`
- **Password**: `demo123`

Or create a new account through the signup process.

## Application Structure

### Main Routes
- `/` - Homepage with feature overview
- `/inspire` - Inspire Me feature (public)
- `/trips` - Trip management (authenticated)
- `/price-locks` - Price transparency (authenticated) 
- `/b2b` - Business portal (public)
- `/auth` - Authentication pages

### Key Features to Test

#### 1. Inspire Me Mode
- Navigate to `/inspire`
- Filter by travel themes
- Generate new AI inspirations
- Plan trips from inspirations

#### 2. Trip Management
- Create new trips
- View detailed itineraries
- Test AI assistant functions
- Use group voting features

#### 3. Price Locks
- View active price locks
- Check savings calculations
- Monitor expiration dates

#### 4. B2B Portal
- Browse partner businesses
- View tourist offices
- Explore partnership plans

## AI Functions Testing

The following AI functions are deployed and can be tested:

1. **Generate Itinerary**
   - Create a trip and use the AI assistant
   - Test different destinations and preferences

2. **Optimize Itinerary**
   - Modify existing trip plans
   - Request optimization suggestions

3. **Generate Packing List**
   - Access from trip detail page
   - Test different seasons/activities

4. **Inspire Me**
   - Use the main Inspire page
   - Try different themes and filters

5. **Price Lock Monitor**
   - View price locks page
   - Check monitoring functionality

6. **Concierge Answer**
   - Available in trip context
   - Ask travel-related questions

## Database Connection

The application connects to:
- **Supabase Project**: `mbrzrpstrzicaxqqfftk`
- **Database**: PostgreSQL with full schema
- **Auth**: Supabase Authentication
- **Storage**: Supabase Storage (if needed)

### Sample Data

The database includes comprehensive demo data:
- 5 sample trips across different themes
- 6 tourist offices with various plans
- 9+ partner businesses
- 4 travel inspirations
- 4 price locks with savings
- Trust flags and voting sessions

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process on port 5173
   lsof -ti:5173 | xargs kill -9
   ```

2. **Environment Variables Not Loading**
   - Ensure `.env` file is in project root
   - Restart development server
   - Check file name (no `.env.local` or `.env.development`)

3. **Supabase Connection Issues**
   - Verify Supabase URL and key in `.env`
   - Check network connectivity
   - Confirm project status in Supabase dashboard

4. **TypeScript Errors**
   ```bash
   # Clear TypeScript cache
   rm -rf node_modules/.vite
   pnpm dev
   ```

5. **Build Issues**
   ```bash
   # Clean install
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

### Performance Optimization

For optimal development experience:

1. **Enable source maps** in browser DevTools
2. **Use React DevTools** browser extension
3. **Monitor bundle size** with build analyzer
4. **Check Network tab** for API performance

### Development Tools

#### Browser Extensions
- React Developer Tools
- Supabase DevTools (if available)
- TailwindCSS IntelliSense

#### VSCode Extensions
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- TypeScript Importer
- Auto Rename Tag

## Testing Guidelines

### Manual Testing Checklist

- [ ] Homepage loads correctly
- [ ] Authentication flow works
- [ ] All navigation links function
- [ ] AI functions respond (mock or real)
- [ ] Database operations succeed
- [ ] Responsive design on mobile
- [ ] Error handling displays properly

### Browser Testing

Test in multiple browsers:
- Chrome (primary)
- Firefox
- Safari (macOS/iOS)
- Edge (Windows)

### Mobile Testing

Test responsive design:
- Mobile phones (320px+)
- Tablets (768px+)
- Desktop (1024px+)

## Next Steps

- For production deployment: See [DEPLOY.md](DEPLOY.md)
- For mobile app builds: See [STORES.md](STORES.md)
- For admin functions: See [ADMIN.md](ADMIN.md)
- For API integration: See [API.md](API.md)

---

🎉 **Happy Development!**

If you encounter issues not covered here, check the Supabase logs and browser console for specific error messages.