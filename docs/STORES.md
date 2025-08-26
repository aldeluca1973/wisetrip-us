# WiseTrip - Mobile App Store Deployment

This guide covers building and deploying WiseTriip as mobile applications to iOS App Store and Google Play Store using Capacitor.

## Capacitor Configuration

WiseTrip is configured for mobile deployment using Ionic Capacitor, which wraps the web application in native mobile containers.

### Current Setup Status

✅ **Capacitor Installed**: Core dependencies added  
✅ **PWA Ready**: Service worker and manifest configured  
✅ **Responsive Design**: Mobile-optimized UI  
🚧 **Platform Setup**: iOS/Android projects need initialization  

## Prerequisites

### Development Environment

**macOS (for iOS development):**
- Xcode 14+
- iOS Simulator
- Apple Developer Account ($99/year)

**Windows/macOS/Linux (for Android):**
- Android Studio
- Android SDK (API 33+)
- Java Development Kit 11+
- Google Play Console Account ($25 one-time)

### Required Dependencies

```bash
# Capacitor Core (already installed)
npm install @capacitor/core @capacitor/cli

# Platform specific
npm install @capacitor/ios @capacitor/android

# Optional plugins
npm install @capacitor/camera @capacitor/geolocation @capacitor/storage
```

## Initial Capacitor Setup

### 1. Initialize Capacitor

```bash
cd wisetrip-complete

# Initialize Capacitor (if not done)
npx cap init WiseTrip com.wisetrip.app --web-dir=dist

# Build web assets
npm run build

# Add platforms
npx cap add ios
npx cap add android
```

### 2. Configure capacitor.config.ts

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wisetrip.app',
  appName: 'WiseTrip',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#4F46E5',
      showSpinner: false
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;
```

## iOS App Store Deployment

### 1. iOS Project Setup

```bash
# Sync web assets to iOS
npx cap sync ios

# Open in Xcode
npx cap open ios
```

### 2. Xcode Configuration

**App Information:**
- **Bundle Identifier**: `com.wisetrip.app`
- **Display Name**: `WiseTrip`
- **Version**: `1.0.0`
- **Build Number**: `1`

**Capabilities to Enable:**
- Associated Domains (for deep linking)
- Push Notifications
- Camera Usage (for AR features)
- Location Services (for travel features)

### 3. Info.plist Configuration

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>WiseTrip uses location to provide personalized travel recommendations.</string>

<key>NSCameraUsageDescription</key>
<string>WiseTrip uses camera for trip photos and AR features.</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>WiseTrip needs access to save and share trip photos.</string>
```

### 4. App Store Connect Setup

1. **Create App Record**
   - App Name: WiseTrip
   - Bundle ID: com.wisetrip.app
   - SKU: wisetrip-2025
   - Primary Language: English

2. **App Information**
   - Category: Travel
   - Subcategory: Trip Planning
   - Content Rating: 4+

3. **App Store Metadata**
   ```
   Title: WiseTrip - Smart Travel Planner
   
   Subtitle: AI-Powered Itineraries & Price Locks
   
   Description:
   Transform your travel planning with WiseTrip's intelligent AI assistant. 
   Create personalized itineraries, discover hidden gems with our Inspire Me 
   feature, and save money with transparent price locks.
   
   Key Features:
   • AI-Generated Itineraries
   • Travel Inspiration Engine  
   • Price Lock Transparency
   • Group Voting & Planning
   • Offline Trip Exports
   • Trust-Verified Businesses
   
   Keywords: travel,planning,AI,itinerary,vacation,trip,inspiration,booking
   ```

4. **Screenshots Required**
   - iPhone 6.7": 3 screenshots
   - iPhone 6.5": 3 screenshots  
   - iPhone 5.5": 3 screenshots
   - iPad Pro 12.9": 3 screenshots

### 5. TestFlight Beta

```bash
# Archive for TestFlight
# In Xcode: Product > Archive
# Upload to App Store Connect
# Distribute via TestFlight
```

### 6. App Store Review

**Review Guidelines Compliance:**
- App provides unique value (AI travel planning)
- No restricted content
- Privacy policy included
- Terms of service available
- Age-appropriate content rating

## Google Play Store Deployment

### 1. Android Project Setup

```bash
# Sync web assets to Android
npx cap sync android

# Open in Android Studio
npx cap open android
```

### 2. Android Studio Configuration

**App Module (app/build.gradle):**
```gradle
android {
    compileSdkVersion 34
    defaultConfig {
        applicationId "com.wisetrip.app"
        minSdkVersion 22
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
}
```

**Permissions (AndroidManifest.xml):**
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

### 3. Signing Configuration

```bash
# Generate signing key
keytool -genkey -v -keystore wisetrip-release-key.keystore -name wisetrip -keyalg RSA -keysize 2048 -validity 10000

# Configure signing in build.gradle
signingConfigs {
    release {
        keyAlias 'wisetrip'
        keyPassword '[password]'
        storeFile file('wisetrip-release-key.keystore')
        storePassword '[password]'
    }
}
```

### 4. Google Play Console Setup

1. **Create Application**
   - App Name: WiseTrip
   - Default Language: English (US)
   - Category: Travel & Local

2. **Store Listing**
   ```
   Title: WiseTrip: AI Travel Planner
   
   Short Description:
   Smart travel planning with AI itineraries, price locks, and group voting.
   
   Full Description:
   Plan smarter trips with WiseTrip's AI-powered travel assistant. Get 
   personalized itineraries, discover inspiring destinations, and save 
   money with transparent pricing.
   
   ✨ KEY FEATURES:
   • AI Itinerary Generation - Smart day-by-day trip plans
   • Inspire Me Mode - Discover your next adventure  
   • Price Lock Guarantee - Lock in prices and track savings
   • Group Voting - Make decisions together
   • Offline Exports - Download trips for offline access
   • Trust Verification - Verified businesses and experiences
   ```

3. **Graphic Assets**
   - App Icon: 512x512 PNG
   - Feature Graphic: 1024x500 PNG
   - Screenshots: 1080x1920 or 1920x1080 PNG (3-8 images)
   - Video (optional): YouTube URL

### 5. App Bundle Generation

```bash
# In Android Studio
# Build > Generate Signed Bundle/APK
# Select Android App Bundle
# Choose release signing configuration
# Generate AAB file
```

### 6. Play Console Upload

1. **Upload AAB** to internal testing
2. **Complete Store Listing** information
3. **Set Content Rating** (Everyone)
4. **Configure Pricing** (Free)
5. **Review Release** and publish to internal testing

## Progressive Web App (PWA)

### Current PWA Features

✅ **Web App Manifest**: App metadata configured  
✅ **Service Worker**: Offline capabilities  
✅ **Responsive Design**: Mobile-optimized  
✅ **Install Prompt**: Add to homescreen  

### PWA Manifest (public/manifest.json)

```json
{
  "name": "WiseTrip - Smart Travel Planner",
  "short_name": "WiseTrip",
  "description": "AI-powered travel planning with personalized itineraries",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#4F46E5",
  "theme_color": "#4F46E5",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## Mobile-Specific Features

### Native Plugin Integration

```typescript
// Camera integration
import { Camera, CameraResultType } from '@capacitor/camera';

export const takePhoto = async () => {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: CameraResultType.Uri
  });
  return image.webPath;
};

// Geolocation
import { Geolocation } from '@capacitor/geolocation';

export const getCurrentPosition = async () => {
  const coordinates = await Geolocation.getCurrentPosition();
  return {
    lat: coordinates.coords.latitude,
    lng: coordinates.coords.longitude
  };
};
```

### Mobile UI Optimizations

1. **Touch Interactions**
   - Larger tap targets (44px minimum)
   - Smooth scrolling
   - Pull-to-refresh support

2. **Performance**
   - Lazy loading for images
   - Virtual scrolling for long lists
   - Optimized bundle splitting

3. **Offline Support**
   - Cache critical resources
   - Offline indicators
   - Data synchronization

## App Store Optimization (ASO)

### Keywords Strategy

**iOS App Store:**
- travel planning
- AI itinerary
- vacation planner
- trip organizer
- travel assistant

**Google Play:**
- travel planning app
- AI travel planner
- itinerary generator
- vacation organizer
- smart travel

### Visual Assets

**Required Images:**
1. App icon (multiple sizes)
2. Screenshot series showing key features
3. Feature graphics for store listing
4. Optional promo video

## Release Process

### 1. Pre-Release Checklist

- [ ] Web build optimized and tested
- [ ] Mobile responsiveness verified
- [ ] Native features working
- [ ] Store listings completed
- [ ] App metadata finalized
- [ ] Legal pages accessible

### 2. Beta Testing

- **iOS**: TestFlight (internal/external testing)
- **Android**: Internal testing track
- **Web**: Staging environment

### 3. Production Release

1. **Submit for Review**
   - iOS: 1-7 days review time
   - Android: Few hours to 3 days

2. **Monitor Release**
   - Download metrics
   - Crash reports
   - User feedback

3. **Post-Launch**
   - User acquisition campaigns
   - App store optimization
   - Regular updates

## Maintenance & Updates

### Update Strategy

1. **Web Updates**: Instant (current deployment)
2. **Mobile Updates**: App store approval required
3. **Hot Fixes**: Capacitor Live Updates (optional)

### Version Management

```json
// package.json
{
  "version": "1.0.0", // Major.Minor.Patch
  "versionCode": 1     // Android version code
}
```

---

📱 **Mobile Deployment Ready!**

WiseTrip is configured for mobile deployment with Capacitor. Follow platform-specific guides above to publish to app stores.