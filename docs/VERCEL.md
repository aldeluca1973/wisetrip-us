# WiseTrip Vercel Deployment Configuration

## Environment Variables Setup

### Required Environment Variables (Production)

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://mbrzrpstrzicaxqqfftk.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_production_key

# Google Maps API
VITE_GOOGLE_MAPS_API_KEY=your_production_maps_key

# Optional: Analytics and Monitoring
VITE_GA_TRACKING_ID=GA_MEASUREMENT_ID
VITE_SENTRY_DSN=your_sentry_dsn

# Vercel Configuration
VERCEL_TOKEN=your_vercel_token
ORG_ID=your_vercel_org_id
PROJECT_ID=your_vercel_project_id
```

### Environment Matrix

#### Production (wisetrip.us)
- **Domain**: wisetrip.us
- **Environment**: production
- **Supabase**: Production project
- **Stripe**: Live keys
- **Analytics**: Full tracking enabled
- **Error Monitoring**: Sentry production
- **Performance**: Optimized builds

#### Preview (Vercel Preview)
- **Domain**: preview-*.vercel.app
- **Environment**: preview
- **Supabase**: Staging project
- **Stripe**: Test keys
- **Analytics**: Limited tracking
- **Error Monitoring**: Sentry staging
- **Performance**: Development builds

#### Development (Local)
- **Domain**: localhost:5173
- **Environment**: development
- **Supabase**: Local instance or staging
- **Stripe**: Test keys
- **Analytics**: Disabled
- **Error Monitoring**: Console only
- **Performance**: Development builds

## Deployment Steps

### 1. Initial Setup

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Link Project**
   ```bash
   vercel link
   ```

### 2. Domain Configuration

1. **Add Custom Domain**
   ```bash
   vercel domains add wisetrip.us
   ```

2. **Configure DNS Records**
   - A record: `@` → Vercel IP
   - CNAME record: `www` → `wisetrip.us`
   - CNAME record: `api` → `wisetrip.us` (if needed)

3. **SSL Certificate**
   - Vercel automatically provisions SSL certificates
   - Supports automatic renewal

### 3. Environment Variables Setup

#### Via Vercel Dashboard:
1. Go to Project Settings
2. Navigate to Environment Variables
3. Add all required variables for each environment

#### Via Vercel CLI:
```bash
# Production
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add VITE_STRIPE_PUBLISHABLE_KEY production
vercel env add VITE_GOOGLE_MAPS_API_KEY production

# Preview
vercel env add VITE_SUPABASE_URL preview
vercel env add VITE_SUPABASE_ANON_KEY preview
vercel env add VITE_STRIPE_PUBLISHABLE_KEY preview
vercel env add VITE_GOOGLE_MAPS_API_KEY preview
```

### 4. Deploy

#### Production Deployment:
```bash
vercel --prod
```

#### Preview Deployment:
```bash
vercel
```

#### From GitHub (Automatic):
- Push to `main` branch triggers production deployment
- Pull requests trigger preview deployments

## Performance Optimization

### 1. Build Configuration

- **Tree Shaking**: Enabled via Vite
- **Code Splitting**: Automatic route-based splitting
- **Asset Optimization**: Images, CSS, JS minification
- **Caching**: Static assets with long-term caching

### 2. Edge Functions

- **Health Check**: `/api/health`
- **Sitemap**: `/api/sitemap`
- **Robots.txt**: `/api/robots`

### 3. CDN and Caching

- **Global CDN**: Vercel's global edge network
- **Static Assets**: Cached at edge locations
- **Dynamic Content**: Intelligent caching strategies
- **Cache Headers**: Optimized for performance

### 4. Performance Monitoring

- **Core Web Vitals**: Automatic monitoring
- **Real User Monitoring**: Performance insights
- **Lighthouse Scores**: Continuous monitoring
- **Bundle Analysis**: Size optimization tracking

## Security Configuration

### 1. Headers

- **CSP**: Content Security Policy configured
- **HSTS**: HTTP Strict Transport Security
- **X-Frame-Options**: Clickjacking protection
- **X-Content-Type-Options**: MIME sniffing protection

### 2. Environment Security

- **Secret Management**: Environment variables
- **API Key Protection**: Client-side key restrictions
- **Domain Restrictions**: CORS configuration
- **Rate Limiting**: Built-in DDoS protection

### 3. Authentication

- **JWT Tokens**: Secure authentication
- **Session Management**: Supabase Auth
- **OAuth Providers**: Social login support
- **Password Policies**: Strong password requirements

## Monitoring and Analytics

### 1. Application Monitoring

- **Uptime**: 99.99% SLA with Vercel
- **Response Times**: Global edge performance
- **Error Rates**: Real-time error tracking
- **Traffic Patterns**: Usage analytics

### 2. Business Metrics

- **User Analytics**: Privacy-focused tracking
- **Conversion Rates**: Funnel analysis
- **Feature Usage**: Product insights
- **Performance Impact**: User experience metrics

### 3. Alerts and Notifications

- **Deployment Status**: Success/failure notifications
- **Performance Degradation**: Automatic alerts
- **Error Spikes**: Immediate notifications
- **Uptime Monitoring**: 24/7 availability tracking

## Rollback and Recovery

### 1. Instant Rollbacks

```bash
# Rollback to previous deployment
vercel rollback

# Rollback to specific deployment
vercel rollback [deployment-url]
```

### 2. Blue-Green Deployments

- **Zero Downtime**: Seamless deployments
- **Traffic Shifting**: Gradual rollout capability
- **A/B Testing**: Feature flag support
- **Canary Releases**: Risk mitigation

### 3. Disaster Recovery

- **Multi-Region**: Automatic failover
- **Data Backup**: Supabase automatic backups
- **Configuration Backup**: Git-based configuration
- **Recovery Time**: < 1 minute RTO

## Cost Optimization

### 1. Vercel Pricing

- **Free Tier**: Development and staging
- **Pro Tier**: Production with custom domains
- **Enterprise Tier**: Advanced features and SLA

### 2. Resource Usage

- **Bandwidth**: Optimized asset delivery
- **Function Executions**: Efficient API routes
- **Build Minutes**: Optimized build process
- **Storage**: Minimal static assets

### 3. Cost Monitoring

- **Usage Dashboard**: Real-time cost tracking
- **Alerts**: Budget limit notifications
- **Optimization**: Regular cost reviews
- **Scaling**: Automatic resource scaling

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables
   - Verify dependencies
   - Review build logs

2. **Runtime Errors**
   - Check function logs
   - Verify API configurations
   - Test environment variables

3. **Performance Issues**
   - Review bundle size
   - Check asset optimization
   - Monitor Core Web Vitals

### Debug Commands

```bash
# View deployments
vercel ls

# Check logs
vercel logs [deployment-url]

# Inspect build
vercel inspect [deployment-url]

# Test locally
vercel dev
```

## Support and Documentation

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Deployment Guide**: [WiseTrip Deployment Docs](./DEPLOY.md)
- **Support**: team@wisetrip.us
- **Status Page**: [status.wisetrip.us](https://status.wisetrip.us)