// Travel Provider Adapters - Mock Implementation
// Simulates multiple travel providers with comparison capabilities

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Max-Age': '86400'
};

// Mock provider configurations
const PROVIDERS = {
  expedia: {
    name: 'Expedia',
    reliability: 0.92,
    avg_response_time: 850,
    commission: 0.15,
    strengths: ['Hotels', 'Flights', 'Packages'],
    api_endpoint: 'https://api.expedia.com/v1',
    rate_limit: 1000
  },
  booking: {
    name: 'Booking.com',
    reliability: 0.95,
    avg_response_time: 720,
    commission: 0.18,
    strengths: ['Hotels', 'Apartments'],
    api_endpoint: 'https://api.booking.com/v1',
    rate_limit: 800
  },
  airbnb: {
    name: 'Airbnb',
    reliability: 0.88,
    avg_response_time: 1200,
    commission: 0.12,
    strengths: ['Apartments', 'Experiences', 'Unique Stays'],
    api_endpoint: 'https://api.airbnb.com/v2',
    rate_limit: 500
  },
  amadeus: {
    name: 'Amadeus',
    reliability: 0.97,
    avg_response_time: 450,
    commission: 0.08,
    strengths: ['Flights', 'Hotels', 'Car Rental'],
    api_endpoint: 'https://api.amadeus.com/v2',
    rate_limit: 2000
  },
  viator: {
    name: 'Viator',
    reliability: 0.90,
    avg_response_time: 950,
    commission: 0.20,
    strengths: ['Tours', 'Activities', 'Experiences'],
    api_endpoint: 'https://api.viator.com/v1',
    rate_limit: 600
  }
};

// Mock data generators
function generateMockFlightResults(destination, dates, passengers) {
  const airlines = ['Delta', 'American', 'United', 'Lufthansa', 'Emirates'];
  const results = [];
  
  for (let i = 0; i < 5; i++) {
    results.push({
      id: `flight_${Date.now()}_${i}`,
      airline: airlines[Math.floor(Math.random() * airlines.length)],
      departure_time: '08:30',
      arrival_time: '14:45',
      duration: '6h 15m',
      stops: Math.random() > 0.6 ? 0 : 1,
      price: Math.floor(Math.random() * 800) + 200,
      currency: 'USD',
      availability: Math.random() > 0.2 ? 'available' : 'limited',
      booking_class: ['Economy', 'Premium Economy', 'Business'][Math.floor(Math.random() * 3)]
    });
  }
  return results;
}

function generateMockHotelResults(destination, dates, guests) {
  const hotelNames = ['Grand Plaza', 'City Center Hotel', 'Luxury Resort', 'Business Inn', 'Boutique Suites'];
  const results = [];
  
  for (let i = 0; i < 5; i++) {
    results.push({
      id: `hotel_${Date.now()}_${i}`,
      name: hotelNames[Math.floor(Math.random() * hotelNames.length)],
      stars: Math.floor(Math.random() * 3) + 3,
      rating: (Math.random() * 2 + 3).toFixed(1),
      price_per_night: Math.floor(Math.random() * 300) + 80,
      currency: 'USD',
      amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Spa'].slice(0, Math.floor(Math.random() * 3) + 2),
      location: 'City Center',
      availability: Math.random() > 0.15 ? 'available' : 'sold_out',
      cancellation: Math.random() > 0.3 ? 'free' : 'restricted'
    });
  }
  return results;
}

function generateMockActivityResults(destination) {
  const activities = [
    'City Walking Tour', 'Museum Visit', 'Food & Wine Tasting', 
    'Adventure Sports', 'Cultural Experience', 'Nature Excursion'
  ];
  const results = [];
  
  for (let i = 0; i < 4; i++) {
    results.push({
      id: `activity_${Date.now()}_${i}`,
      title: activities[Math.floor(Math.random() * activities.length)],
      duration: `${Math.floor(Math.random() * 6) + 2} hours`,
      price: Math.floor(Math.random() * 150) + 25,
      currency: 'USD',
      rating: (Math.random() * 1.5 + 3.5).toFixed(1),
      reviews_count: Math.floor(Math.random() * 500) + 50,
      category: ['Culture', 'Adventure', 'Food', 'Nature'][Math.floor(Math.random() * 4)],
      availability: Math.random() > 0.1 ? 'available' : 'booking_required'
    });
  }
  return results;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { action, provider_ids, search_params } = await req.json();
    
    if (action === 'compare_providers') {
      const { destination, check_in, check_out, guests = 2, search_type = 'hotels' } = search_params;
      
      if (!destination) {
        throw new Error('destination is required');
      }

      const results = {};
      const performance_metrics = {};
      const selectedProviders = provider_ids || Object.keys(PROVIDERS);
      
      // Simulate API calls to each provider
      for (const providerId of selectedProviders) {
        const provider = PROVIDERS[providerId];
        if (!provider) continue;
        
        const startTime = Date.now();
        
        // Simulate network delay
        await new Promise(resolve => 
          setTimeout(resolve, Math.random() * 500 + 200)
        );
        
        const responseTime = Date.now() - startTime;
        const isSuccess = Math.random() < provider.reliability;
        
        if (isSuccess) {
          let mockResults = [];
          
          switch (search_type) {
            case 'flights':
              mockResults = generateMockFlightResults(destination, { check_in, check_out }, guests);
              break;
            case 'hotels':
              mockResults = generateMockHotelResults(destination, { check_in, check_out }, guests);
              break;
            case 'activities':
              mockResults = generateMockActivityResults(destination);
              break;
            default:
              mockResults = generateMockHotelResults(destination, { check_in, check_out }, guests);
          }
          
          results[providerId] = {
            provider_name: provider.name,
            success: true,
            results_count: mockResults.length,
            results: mockResults,
            price_range: {
              min: Math.min(...mockResults.map(r => r.price || r.price_per_night)),
              max: Math.max(...mockResults.map(r => r.price || r.price_per_night))
            }
          };
        } else {
          results[providerId] = {
            provider_name: provider.name,
            success: false,
            error: 'Provider temporarily unavailable',
            results_count: 0,
            results: []
          };
        }
        
        performance_metrics[providerId] = {
          response_time_ms: responseTime,
          success_rate: provider.reliability,
          commission_rate: provider.commission,
          strengths: provider.strengths,
          rate_limit_remaining: provider.rate_limit - Math.floor(Math.random() * 100)
        };
      }
      
      // Generate comparison analytics
      const successfulProviders = Object.keys(results).filter(id => results[id].success);
      const totalResults = successfulProviders.reduce((sum, id) => sum + results[id].results_count, 0);
      const avgResponseTime = successfulProviders.length > 0 
        ? successfulProviders.reduce((sum, id) => sum + performance_metrics[id].response_time_ms, 0) / successfulProviders.length 
        : 0;
      
      const comparison_summary = {
        total_providers_queried: selectedProviders.length,
        successful_responses: successfulProviders.length,
        total_results_found: totalResults,
        average_response_time_ms: Math.round(avgResponseTime),
        best_price_provider: null,
        fastest_provider: null,
        most_results_provider: null
      };
      
      // Find best performers
      if (successfulProviders.length > 0) {
        const priceComparison = successfulProviders.map(id => ({
          id,
          min_price: results[id].price_range?.min || Infinity
        }));
        comparison_summary.best_price_provider = priceComparison.sort((a, b) => a.min_price - b.min_price)[0]?.id;
        
        const speedComparison = successfulProviders.map(id => ({
          id,
          response_time: performance_metrics[id].response_time_ms
        }));
        comparison_summary.fastest_provider = speedComparison.sort((a, b) => a.response_time - b.response_time)[0]?.id;
        
        const resultsComparison = successfulProviders.map(id => ({
          id,
          count: results[id].results_count
        }));
        comparison_summary.most_results_provider = resultsComparison.sort((a, b) => b.count - a.count)[0]?.id;
      }
      
      return new Response(JSON.stringify({
        success: true,
        search_type,
        destination,
        timestamp: new Date().toISOString(),
        providers: results,
        performance_metrics,
        comparison_summary
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
      
    } else if (action === 'get_provider_status') {
      // Return current status of all providers
      const providerStatus = {};
      
      for (const [id, provider] of Object.entries(PROVIDERS)) {
        providerStatus[id] = {
          name: provider.name,
          status: Math.random() > 0.1 ? 'operational' : 'degraded',
          last_check: new Date().toISOString(),
          avg_response_time: provider.avg_response_time + Math.floor(Math.random() * 200 - 100),
          current_reliability: provider.reliability,
          rate_limit_status: {
            remaining: provider.rate_limit - Math.floor(Math.random() * 200),
            limit: provider.rate_limit,
            reset_time: new Date(Date.now() + 3600000).toISOString()
          },
          strengths: provider.strengths
        };
      }
      
      return new Response(JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        providers: providerStatus,
        summary: {
          total_providers: Object.keys(PROVIDERS).length,
          operational: Object.values(providerStatus).filter(p => p.status === 'operational').length,
          degraded: Object.values(providerStatus).filter(p => p.status === 'degraded').length
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
      
    } else if (action === 'get_comparison_analytics') {
      // Return analytics about provider performance over time
      const analytics = {
        providers: {},
        time_period: '24h',
        generated_at: new Date().toISOString()
      };
      
      for (const [id, provider] of Object.entries(PROVIDERS)) {
        analytics.providers[id] = {
          name: provider.name,
          requests_handled: Math.floor(Math.random() * 5000) + 1000,
          success_rate: provider.reliability + (Math.random() * 0.06 - 0.03),
          avg_response_time: provider.avg_response_time + Math.floor(Math.random() * 200 - 100),
          commission_earned: Math.floor(Math.random() * 2000) + 500,
          top_search_types: provider.strengths,
          error_rate: 1 - provider.reliability,
          uptime_percentage: 99.5 + Math.random() * 0.5
        };
      }
      
      return new Response(JSON.stringify({
        success: true,
        analytics
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    throw new Error('Invalid action specified');
    
  } catch (error) {
    console.error('Provider adapters error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});