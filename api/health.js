// Vercel API Route: Health Check
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    region: process.env.VERCEL_REGION || 'unknown',
    deployment: {
      url: process.env.VERCEL_URL,
      git_commit: process.env.VERCEL_GIT_COMMIT_SHA,
      branch: process.env.VERCEL_GIT_COMMIT_REF
    },
    services: {
      supabase: process.env.VITE_SUPABASE_URL ? 'configured' : 'missing',
      stripe: process.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'configured' : 'missing',
      maps: process.env.VITE_GOOGLE_MAPS_API_KEY ? 'configured' : 'missing'
    },
    performance: {
      uptime: process.uptime(),
      memory_usage: process.memoryUsage(),
      node_version: process.version
    }
  };
  
  // Check if all critical services are configured
  const allServicesConfigured = Object.values(health.services).every(status => status === 'configured');
  
  res.status(allServicesConfigured ? 200 : 503).json({
    ...health,
    overall_status: allServicesConfigured ? 'healthy' : 'degraded'
  });
}