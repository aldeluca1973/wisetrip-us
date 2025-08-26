# WiseTrip - API Documentation

This comprehensive guide covers all API endpoints, authentication, and integration patterns for WiseTrip.

## Base Configuration

### API Base URLs

**Supabase API**: `https://mbrzrpstrzicaxqqfftk.supabase.co`  
**Database API**: `https://mbrzrpstrzicaxqqfftk.supabase.co/rest/v1`  
**Auth API**: `https://mbrzrpstrzicaxqqfftk.supabase.co/auth/v1`  
**Edge Functions**: `https://mbrzrpstrzicaxqqfftk.supabase.co/functions/v1`  

### Authentication

```javascript
// API Headers
const headers = {
  'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1icnpycHN0cnppY2F4cXFmZnRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQxOTc3NTYsImV4cCI6MjAzOTc3Mzc1Nn0.QmU1yVGJP6rsPBGz5krcGHKMkvNME5GKvMdGzf6GV2Y',
  'Authorization': `Bearer ${userToken}`, // For authenticated requests
  'Content-Type': 'application/json'
};
```

## Authentication API

### Sign Up

```javascript
POST /auth/v1/signup
{
  "email": "user@example.com",
  "password": "securepassword123"
}

// Response
{
  "access_token": "jwt-token",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "refresh-jwt",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "email_confirmed_at": null,
    "created_at": "2025-08-24T06:19:19Z"
  }
}
```

### Sign In

```javascript
POST /auth/v1/token?grant_type=password
{
  "email": "user@example.com",
  "password": "securepassword123"
}

// Response - Same as signup
```

### Refresh Token

```javascript
POST /auth/v1/token?grant_type=refresh_token
{
  "refresh_token": "refresh-jwt-token"
}
```

### Sign Out

```javascript
POST /auth/v1/logout
// Requires Authorization header
```

## Database API (REST)

### Users & Profiles

#### Get User Profile

```javascript
GET /rest/v1/profiles?user_id=eq.{user_id}&select=*

// Response
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "display_name": "Demo User",
    "travel_style": "cultural",
    "preferred_budget": "mid-range",
    "travel_preferences": {
      "accommodation": "hotel",
      "transportation": "any",
      "interests": ["culture", "food", "history"]
    }
  }
]
```

#### Update Profile

```javascript
PATCH /rest/v1/profiles?user_id=eq.{user_id}
{
  "display_name": "New Name",
  "travel_style": "adventure",
  "travel_preferences": {
    "accommodation": "hostel",
    "interests": ["adventure", "nature"]
  }
}
```

### Trips Management

#### Get User Trips

```javascript
GET /rest/v1/trips?user_id=eq.{user_id}&select=*,trip_days(id,day_number,title,date,activities(*))

// Response
[
  {
    "id": "uuid",
    "title": "Amazing Paris Adventure",
    "destination": "Paris, France",
    "start_date": "2025-09-15",
    "end_date": "2025-09-22",
    "budget": 2500.00,
    "currency": "USD",
    "status": "planning",
    "is_public": true,
    "trip_days": [
      {
        "id": "uuid",
        "day_number": 1,
        "title": "Arrival Day",
        "date": "2025-09-15",
        "activities": [
          {
            "id": "uuid",
            "title": "Louvre Museum Visit",
            "location": "Rue de Rivoli, 75001 Paris",
            "start_time": "09:00:00",
            "end_time": "12:00:00",
            "cost": 17.00,
            "category": "cultural"
          }
        ]
      }
    ]
  }
]
```

#### Create New Trip

```javascript
POST /rest/v1/trips
{
  "title": "Summer in Tokyo",
  "description": "Exploring Japanese culture and cuisine",
  "destination": "Tokyo, Japan",
  "start_date": "2025-07-01",
  "end_date": "2025-07-10",
  "budget": 3000,
  "currency": "USD",
  "is_public": false
}
```

#### Update Trip

```javascript
PATCH /rest/v1/trips?id=eq.{trip_id}
{
  "status": "active",
  "budget": 3500
}
```

#### Delete Trip

```javascript
DELETE /rest/v1/trips?id=eq.{trip_id}
```

### Inspirations

#### Get Inspirations

```javascript
GET /rest/v1/inspirations?theme=eq.romantic&order=likes_count.desc&limit=10

// Response
[
  {
    "id": "uuid",
    "title": "Sunset Romance in Santorini",
    "description": "A dreamy escape to the Greek islands",
    "destination": "Santorini, Greece",
    "theme": "romantic",
    "season": "spring-summer",
    "image_urls": ["/images/inspirations/santorini-sunset.jpg"],
    "inspiration_data": {
      "estimated_budget": 2800,
      "currency": "EUR",
      "duration_days": 5,
      "difficulty_level": "easy"
    },
    "likes_count": 127
  }
]
```

#### Filter Inspirations

```javascript
// By theme
GET /rest/v1/inspirations?theme=eq.adventure

// By season
GET /rest/v1/inspirations?season=eq.winter

// By destination (case-insensitive)
GET /rest/v1/inspirations?destination=ilike.*bali*

// Multiple filters
GET /rest/v1/inspirations?theme=eq.cultural&season=eq.spring&order=likes_count.desc
```

### Price Locks

#### Get User Price Locks

```javascript
GET /rest/v1/price_locks?user_id=eq.{user_id}&select=*,businesses(name,type,address)

// Response
[
  {
    "id": "uuid",
    "original_price": 450.00,
    "locked_price": 425.00,
    "currency": "USD",
    "lock_expires_at": "2025-09-10T23:59:59Z",
    "status": "active",
    "booking_reference": "CRILLON-LOCK-20250824-001",
    "businesses": {
      "name": "Hotel de Crillon Paris",
      "type": "hotel",
      "address": "10 Place de la Concorde, 75008 Paris"
    }
  }
]
```

#### Create Price Lock

```javascript
POST /rest/v1/price_locks
{
  "business_id": "uuid",
  "original_price": 300.00,
  "locked_price": 275.00,
  "currency": "USD",
  "lock_expires_at": "2025-09-01T23:59:59Z",
  "booking_reference": "HOTEL-LOCK-001"
}
```

### Businesses & Trust Flags

#### Get Verified Businesses

```javascript
GET /rest/v1/businesses?verified=eq.true&select=*,trust_flags(*)

// Response
[
  {
    "id": "uuid",
    "name": "Hotel de Crillon Paris",
    "type": "hotel",
    "address": "10 Place de la Concorde, 75008 Paris",
    "verified": true,
    "trust_flags": {
      "rating": 4.8,
      "reviews": 1247,
      "price_range": "luxury"
    }
  }
]
```

#### Search Businesses

```javascript
// By type
GET /rest/v1/businesses?type=eq.restaurant

// By location
GET /rest/v1/businesses?address=ilike.*paris*

// By verification status
GET /rest/v1/businesses?verified=eq.true
```

### Voting Sessions

#### Get Active Polls

```javascript
GET /rest/v1/voting_sessions?active=eq.true

// Response
[
  {
    "id": "uuid",
    "title": "Paris Dinner Choice",
    "description": "Which restaurant should we choose?",
    "options": [
      "Le Comptoir du Relais - Traditional French Bistro",
      "Le Meurice - Michelin Star Fine Dining",
      "L'As du Fallafel - Famous Street Food"
    ],
    "votes": {"0": 3, "1": 7, "2": 2},
    "anonymous": true,
    "expires_at": "2025-09-10T23:59:59Z"
  }
]
```

## AI Edge Functions

### 1. Generate Itinerary

```javascript
POST /functions/v1/generate-itinerary
{
  "destination": "Paris, France",
  "duration": 7,
  "budget": 2500,
  "currency": "USD",
  "preferences": ["cultural", "food", "museums"],
  "travel_style": "mid-range",
  "group_size": 2
}

// Response
{
  "itinerary": {
    "title": "7-Day Cultural Paris Experience",
    "total_budget": 2500,
    "days": [
      {
        "day": 1,
        "title": "Arrival & City Center",
        "activities": [
          {
            "time": "09:00",
            "activity": "Check-in at Hotel",
            "location": "Central Paris",
            "cost": 0,
            "description": "Settle in and prepare for exploration"
          }
        ]
      }
    ]
  },
  "recommendations": [
    "Book museum tickets in advance",
    "Try local bistros for authentic experience"
  ]
}
```

### 2. Optimize Itinerary

```javascript
POST /functions/v1/optimize-itinerary
{
  "trip_id": "uuid",
  "optimization_type": "time", // "time", "cost", "experience"
  "constraints": {
    "max_daily_budget": 200,
    "preferred_start_time": "09:00",
    "mobility_needs": ["walking_friendly"]
  }
}

// Response
{
  "optimization": {
    "changes_made": 5,
    "time_saved": "2 hours",
    "cost_reduction": 150,
    "improvements": [
      "Reorganized day 2 to reduce travel time",
      "Found better value restaurant options",
      "Optimized museum visits for efficiency"
    ]
  },
  "updated_itinerary": {
    // Optimized itinerary structure
  }
}
```

### 3. Generate Packing List

```javascript
POST /functions/v1/generate-packing-list
{
  "destination": "Tokyo, Japan",
  "duration": 10,
  "season": "summer",
  "activities": ["cultural", "dining", "shopping", "temples"],
  "weather_conditions": "hot_humid",
  "accommodation_type": "hotel"
}

// Response
{
  "packing_list": {
    "categories": {
      "clothing": {
        "essentials": [
          "Lightweight, breathable shirts (7)",
          "Comfortable walking shoes",
          "Light jacket for AC indoors",
          "Modest clothing for temples"
        ],
        "optional": ["Dress shoes for fine dining"]
      },
      "electronics": {
        "essentials": [
          "Phone charger",
          "Universal adapter (Type A/B)",
          "Portable battery pack"
        ]
      },
      "documents": {
        "required": [
          "Passport",
          "Travel insurance",
          "Accommodation confirmations"
        ]
      },
      "health_hygiene": {
        "recommended": [
          "Sunscreen (SPF 50+)",
          "Insect repellent",
          "Cooling towels"
        ]
      }
    }
  },
  "tips": [
    "Pack light fabrics for humid weather",
    "Bring cash - many places don't accept cards"
  ]
}
```

### 4. Inspire Me

```javascript
POST /functions/v1/inspire-me
{
  "theme": "adventure", // optional
  "budget_range": "mid-range", // optional
  "season": "winter", // optional
  "interests": ["mountains", "skiing", "culture"],
  "style": "surprise-me"
}

// Response
{
  "inspiration": {
    "title": "Alpine Adventure in Swiss Alps",
    "destination": "Zermatt, Switzerland",
    "description": "Experience world-class skiing with breathtaking mountain views and cozy alpine culture.",
    "inspiration_text": "Picture yourself carving through pristine powder as the iconic Matterhorn towers above you. After an exhilarating day on the slopes, warm up with fondue and local wine in a charming mountain chalet.",
    "estimated_budget": 3500,
    "currency": "USD",
    "duration_days": 8,
    "best_months": ["December", "January", "February", "March"],
    "difficulty_level": "moderate",
    "highlights": [
      "Matterhorn views",
      "World-class skiing",
      "Swiss alpine culture",
      "Mountain cuisine"
    ]
  },
  "related_experiences": [
    "Ski lessons with certified instructors",
    "Mountain railway journeys",
    "Traditional Swiss spa treatments"
  ]
}
```

### 5. Price Lock Monitor

```javascript
POST /functions/v1/price-lock-monitor
{
  "user_id": "uuid",
  "check_type": "expiring_soon", // "all", "expiring_soon", "price_changes"
  "notification_preferences": {
    "email": true,
    "push": false
  }
}

// Response
{
  "monitoring_result": {
    "total_locks": 4,
    "expiring_soon": 1,
    "price_changes_detected": 0,
    "total_savings": 125.50,
    "alerts": [
      {
        "lock_id": "uuid",
        "type": "expiring_soon",
        "message": "Price lock for Hotel Plaza expires in 6 hours",
        "action_required": "Book now to secure locked price"
      }
    ]
  },
  "recommendations": [
    "Consider booking expiring price locks",
    "Enable notifications for better monitoring"
  ]
}
```

### 6. Concierge Answer

```javascript
POST /functions/v1/concierge-answer
{
  "question": "What's the best way to get from Charles de Gaulle Airport to central Paris?",
  "context": {
    "trip_id": "uuid", // optional
    "destination": "Paris, France",
    "user_preferences": {
      "budget_conscious": true,
      "travel_style": "mid-range"
    }
  }
}

// Response
{
  "answer": {
    "main_response": "The best ways to get from Charles de Gaulle (CDG) to central Paris depend on your budget and time preferences. Here are your top options:",
    "options": [
      {
        "method": "RER B Train",
        "cost": "€10.30",
        "duration": "45-60 minutes",
        "pros": ["Most economical", "Direct connection"],
        "cons": ["Can be crowded", "May require transfers"]
      },
      {
        "method": "Taxi/Uber",
        "cost": "€50-70",
        "duration": "45-90 minutes",
        "pros": ["Door-to-door service", "Comfortable"],
        "cons": ["More expensive", "Traffic dependent"]
      },
      {
        "method": "Airport Shuttle Bus",
        "cost": "€12-17",
        "duration": "60-75 minutes",
        "pros": ["Good value", "Luggage space"],
        "cons": ["Multiple stops", "Less frequent"]
      }
    ],
    "recommendation": "Based on your mid-range preferences, I recommend the RER B train for its balance of cost and convenience. Purchase tickets in advance and validate before boarding.",
    "additional_tips": [
      "Avoid rush hours (7-9 AM, 5-7 PM) if possible",
      "Keep valuables secure on public transport",
      "Consider a Navigo weekly pass if staying longer"
    ]
  },
  "related_info": [
    "Paris public transport system overview",
    "Airport pickup services in Paris",
    "First-time visitor tips for Paris"
  ]
}
```

## Error Handling

### Standard Error Response

```javascript
// HTTP 400/401/403/500 responses
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Missing required parameter: destination",
    "details": {
      "parameter": "destination",
      "expected": "string",
      "received": null
    }
  }
}
```

### Common Error Codes

- `UNAUTHORIZED` - Invalid or missing authentication
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource doesn't exist
- `VALIDATION_ERROR` - Invalid input data
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server-side error
- `SERVICE_UNAVAILABLE` - Temporary service issue

## Rate Limiting

### Limits by API Type

**Database API**: 100 requests/minute per user  
**Auth API**: 60 requests/hour per IP  
**Edge Functions**: 1000 requests/hour per user  
**File Storage**: 200 requests/minute per user  

### Rate Limit Headers

```javascript
// Response headers
{
  'X-RateLimit-Limit': '100',
  'X-RateLimit-Remaining': '87',
  'X-RateLimit-Reset': '1693123200'
}
```

## SDK Usage Examples

### JavaScript/TypeScript Client

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mbrzrpstrzicaxqqfftk.supabase.co',
  'your-anon-key'
);

// Authentication
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Database operations
const { data: trips } = await supabase
  .from('trips')
  .select('*, trip_days(*, activities(*))')
  .eq('user_id', user.id);

// Edge Functions
const { data: inspiration } = await supabase.functions.invoke('inspire-me', {
  body: { theme: 'adventure' }
});
```

### React Integration

```jsx
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error:', error);
    } else {
      setTrips(data);
    }
    setLoading(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {trips.map(trip => (
        <div key={trip.id}>
          <h3>{trip.title}</h3>
          <p>{trip.destination}</p>
        </div>
      ))}
    </div>
  );
}
```

## Webhooks

### Database Webhooks

```javascript
// Listen to real-time changes
const subscription = supabase
  .channel('trips_channel')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'trips'
  }, (payload) => {
    console.log('Change received!', payload);
  })
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

### Custom Webhooks

Create Edge Functions for external webhook handling:

```typescript
// webhook-handler/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

serve(async (req) => {
  const signature = req.headers.get('webhook-signature');
  const body = await req.text();
  
  // Verify webhook signature
  if (!verifySignature(body, signature)) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Process webhook data
  const data = JSON.parse(body);
  // Handle the webhook...
  
  return new Response('OK', { status: 200 });
});
```

---

🚀 **API Integration Complete!**

This API documentation covers all endpoints and integration patterns for WiseTrip. For additional support, check the Supabase documentation or contact the development team.