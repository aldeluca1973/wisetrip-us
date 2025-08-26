# Vercel Domain Configuration Guide

## DNS Setup for wisetrip.us

### Step 1: Add Domain to Vercel Project
1. Go to Vercel Dashboard → Your WiseTrip Project
2. Navigate to Settings → Domains
3. Add domain: `wisetrip.us`
4. Add domain: `www.wisetrip.us`

### Step 2: Configure DNS at GoDaddy

**Required DNS Records:**
```
Type    Name/Host   Value                    TTL
A       @           76.76.19.19             600
CNAME   www         cname.vercel-dns.com    600
```

**Alternative (recommended):**
```
Type    Name/Host   Value                    TTL  
ALIAS   @           cname.vercel-dns.com    600
CNAME   www         cname.vercel-dns.com    600
```

### Step 3: Vercel Configuration
1. Set `wisetrip.us` as primary domain
2. Configure redirect: `www.wisetrip.us` → `wisetrip.us`
3. Enable automatic SSL certificate
4. Update environment variables:
   ```bash
   APP_BASE_URL=https://wisetrip.us
   VERCEL_ENV=production
   ```

### Step 4: Verification
- Wait 5-15 minutes for DNS propagation
- Check SSL certificate is active (green lock)
- Verify redirects work correctly
- Test application functionality

## Environment Variables for Production

```bash
# Core Application
APP_BASE_URL=https://wisetrip.us
VERCEL_ENV=production

# When backend is deployed, add:
# SUPABASE_URL=[production_supabase_url]
# SUPABASE_ANON_KEY=[production_anon_key]
# STRIPE_PUBLISHABLE_KEY=[production_stripe_key]
```

## Post-Deployment Checklist
- [ ] Domain resolves to correct IP
- [ ] SSL certificate active
- [ ] WWW redirect working
- [ ] Application loads without errors
- [ ] Performance scores maintained
- [ ] Analytics tracking updated (if applicable)

---
**Status:** Ready for domain cutover  
**Estimated DNS propagation:** 5-15 minutes