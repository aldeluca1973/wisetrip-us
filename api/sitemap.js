// Vercel API Route: Dynamic Sitemap
export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : 'https://wisetrip.us';
  
  const pages = [
    { url: '', changefreq: 'daily', priority: 1.0 },
    { url: '/inspire', changefreq: 'daily', priority: 0.9 },
    { url: '/trips', changefreq: 'weekly', priority: 0.8 },
    { url: '/price-locks', changefreq: 'daily', priority: 0.8 },
    { url: '/b2b', changefreq: 'monthly', priority: 0.7 },
    { url: '/providers', changefreq: 'weekly', priority: 0.6 },
    { url: '/auth', changefreq: 'monthly', priority: 0.5 }
  ];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>`
  )
  .join('\n')}
</urlset>`;
  
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
  res.status(200).send(sitemap);
}