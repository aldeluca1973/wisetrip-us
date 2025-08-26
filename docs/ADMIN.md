# WiseTrip - Administration Guide

This guide covers administrative functions, user management, and system maintenance for WiseTrip.

## Admin Dashboard Access

### Supabase Admin Panel

**URL**: https://supabase.com/dashboard/project/mbrzrpstrzicaxqqfftk  
**Access**: Project owner credentials required

**Key Sections:**
- **Database**: Schema management, data browser
- **Authentication**: User management, settings
- **Edge Functions**: Function logs, monitoring
- **Storage**: File management, policies
- **API**: Usage statistics, rate limiting

## User Management

### User Authentication

**Current Users in System:**
- Demo User: `demo@wisetrip.com` (for testing)
- Production users via Supabase Auth

### User Administration Tasks

#### 1. View All Users

```sql
-- In Supabase SQL Editor
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.last_sign_in_at,
  p.display_name,
  p.travel_style
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
ORDER BY u.created_at DESC;
```

#### 2. User Activity Analytics

```sql
-- User trip activity
SELECT 
  COUNT(*) as total_trips,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_trips,
  AVG(budget) as avg_budget
FROM trips
GROUP BY user_id;

-- Popular destinations
SELECT destination, COUNT(*) as trip_count
FROM trips
GROUP BY destination
ORDER BY trip_count DESC;
```

#### 3. User Account Actions

**Disable User Account:**
```sql
-- In Supabase Auth panel or SQL
UPDATE auth.users 
SET banned_until = NOW() + INTERVAL '30 days'
WHERE email = 'user@example.com';
```

**Reset User Password:**
```javascript
// Via Supabase API
const { error } = await supabase.auth.admin.generateLink({
  type: 'recovery',
  email: 'user@example.com'
});
```

### Profile Management

#### View User Profiles

```sql
SELECT 
  p.*,
  u.email,
  u.email_confirmed_at
FROM profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE p.display_name IS NOT NULL;
```

#### Update User Preferences

```sql
UPDATE profiles 
SET travel_preferences = '{
  "accommodation": "hotel",
  "transportation": "any", 
  "interests": ["culture", "food", "adventure"]
}'
WHERE user_id = '[user-id]';
```

## Content Management

### Trip Management

#### Monitor Trip Activity

```sql
-- Recent trips
SELECT 
  t.title,
  t.destination,
  t.status,
  t.budget,
  u.email as creator
FROM trips t
JOIN auth.users u ON t.user_id = u.id
WHERE t.created_at >= NOW() - INTERVAL '7 days'
ORDER BY t.created_at DESC;
```

#### Trip Moderation

```sql
-- Flag inappropriate content
UPDATE trips 
SET status = 'under_review'
WHERE id = '[trip-id]';

-- Remove public visibility
UPDATE trips 
SET is_public = false
WHERE id = '[trip-id]';
```

### Business & Partnership Management

#### View Partner Businesses

```sql
SELECT 
  b.name,
  b.type,
  b.verified,
  b.trust_flags,
  COUNT(pl.id) as price_locks_count
FROM businesses b
LEFT JOIN price_locks pl ON b.id = pl.business_id
GROUP BY b.id, b.name, b.type, b.verified, b.trust_flags
ORDER BY price_locks_count DESC;
```

#### Verify Business

```sql
-- Mark business as verified
UPDATE businesses 
SET 
  verified = true,
  trust_flags = jsonb_set(
    COALESCE(trust_flags, '{}'),
    '{verified_date}',
    to_jsonb(NOW())
  )
WHERE id = '[business-id]';
```

#### Tourist Office Management

```sql
-- View tourist office statistics
SELECT 
  name,
  region,
  plan,
  created_at,
  CASE 
    WHEN plan = 'enterprise' THEN '$299/month'
    WHEN plan = 'pro' THEN '$99/month'
    ELSE 'Free'
  END as billing
FROM tourist_offices
ORDER BY 
  CASE plan 
    WHEN 'enterprise' THEN 1 
    WHEN 'pro' THEN 2 
    ELSE 3 
  END;
```

### Inspiration Content Management

#### Monitor Inspiration Engagement

```sql
-- Popular inspirations
SELECT 
  title,
  destination,
  theme,
  likes_count,
  created_at
FROM inspirations
ORDER BY likes_count DESC
LIMIT 10;
```

#### Content Moderation

```sql
-- Remove inappropriate inspiration
DELETE FROM inspirations 
WHERE id = '[inspiration-id]';

-- Feature inspiration
UPDATE inspirations 
SET likes_count = likes_count + 100
WHERE id = '[inspiration-id]';
```

## System Monitoring

### Database Performance

#### Monitor Query Performance

```sql
-- Slow queries (requires pg_stat_statements extension)
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

#### Database Size Monitoring

```sql
-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### API Usage Analytics

#### Edge Function Monitoring

**Supabase Dashboard Metrics:**
- Function invocations per hour/day
- Average execution time
- Error rates and logs
- Memory usage patterns

#### Database API Usage

```sql
-- Track API usage by endpoint (if logging enabled)
SELECT 
  method,
  path,
  COUNT(*) as requests,
  AVG(duration_ms) as avg_duration
FROM api_logs 
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY method, path
ORDER BY requests DESC;
```

### Error Monitoring

#### Application Errors

**Edge Function Logs:**
```bash
# View function logs
supabase functions logs generate-itinerary --level error
supabase functions logs inspire-me --level warn
```

#### Database Error Monitoring

```sql
-- Check for failed operations
SELECT 
  level,
  message,
  timestamp
FROM logs 
WHERE level IN ('ERROR', 'FATAL')
AND timestamp >= NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC;
```

## Security Management

### Row Level Security (RLS)

#### Verify RLS Policies

```sql
-- Check RLS status on tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public';

-- View active policies
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public';
```

#### Update Security Policies

```sql
-- Example: Restrict trip editing to owners
CREATE POLICY "Users can update own trips"
ON trips FOR UPDATE
USING (auth.uid() = user_id);

-- Enable RLS on table
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
```

### API Key Management

**Supabase API Keys:**
- **Anon Key**: Safe for frontend (rate limited)
- **Service Role Key**: Server-side only (full access)

**Key Rotation Process:**
1. Generate new keys in Supabase dashboard
2. Update environment variables
3. Deploy application with new keys
4. Monitor for any authentication issues

### Audit Logging

#### Enable Audit Logs

```sql
-- Create audit log table
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID,
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Backup & Recovery

### Database Backups

**Automated Backups (Supabase):**
- Daily automated backups
- 7-day retention for free tier
- Point-in-time recovery available

**Manual Backup:**
```bash
# Export specific tables
pg_dump -h db.[project].supabase.co \
  -U postgres \
  -d postgres \
  --table=public.trips \
  --table=public.profiles \
  > wisetrip_backup.sql
```

### Data Recovery Procedures

#### Restore Single Record

```sql
-- Restore deleted trip from backup
INSERT INTO trips (id, user_id, title, destination, ...)
SELECT id, user_id, title, destination, ...
FROM backup_trips 
WHERE id = '[trip-id]';
```

#### Bulk Data Recovery

```sql
-- Restore multiple records
INSERT INTO trips 
SELECT * FROM backup_trips 
WHERE created_at >= '2025-08-01' 
AND created_at < '2025-08-24';
```

## Performance Optimization

### Database Optimization

#### Index Management

```sql
-- Create performance indexes
CREATE INDEX idx_trips_user_id_status ON trips(user_id, status);
CREATE INDEX idx_inspirations_theme_likes ON inspirations(theme, likes_count DESC);
CREATE INDEX idx_businesses_type_verified ON businesses(type, verified);

-- Monitor index usage
SELECT 
  indexrelname,
  idx_tup_read,
  idx_tup_fetch,
  idx_scan
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;
```

#### Query Optimization

```sql
-- Analyze query plans
EXPLAIN ANALYZE 
SELECT t.*, p.display_name 
FROM trips t
JOIN profiles p ON t.user_id = p.user_id
WHERE t.destination ILIKE '%paris%';
```

### Application Performance

#### Monitoring Metrics

1. **Response Times**
   - API endpoint latency
   - Database query times
   - Edge function execution

2. **Resource Usage**
   - Database connections
   - Storage utilization
   - Function memory usage

3. **User Experience**
   - Page load times
   - Error rates
   - Conversion metrics

## Maintenance Tasks

### Daily Tasks

- [ ] Check error logs for critical issues
- [ ] Monitor API usage and rate limits
- [ ] Verify backup completion
- [ ] Review user signup activity

### Weekly Tasks

- [ ] Analyze performance metrics
- [ ] Review user feedback and ratings
- [ ] Update content moderation
- [ ] Check business partnership status

### Monthly Tasks

- [ ] Database performance analysis
- [ ] Security audit and updates
- [ ] Usage analytics review
- [ ] Backup restoration test
- [ ] Documentation updates

## Troubleshooting

### Common Issues

#### 1. Authentication Problems

**Symptoms**: Users can't sign in
**Diagnosis**:
```sql
-- Check failed sign-in attempts
SELECT email, created_at 
FROM auth.users 
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC;
```

**Solutions**:
- Verify email confirmation
- Check SMTP settings
- Review rate limiting

#### 2. Database Connection Issues

**Symptoms**: Application timeouts
**Diagnosis**: Check connection pool in Supabase dashboard
**Solutions**:
- Optimize queries
- Implement connection pooling
- Scale database if needed

#### 3. Edge Function Errors

**Symptoms**: AI features not working
**Diagnosis**: Check function logs
**Solutions**:
- Verify OpenAI API key
- Check function timeout settings
- Review error handling

### Emergency Procedures

#### System Outage Response

1. **Immediate Actions**
   - Check Supabase status page
   - Verify application health
   - Enable maintenance mode if needed

2. **Communication**
   - Update status page
   - Notify users via email/social media
   - Provide ETA for resolution

3. **Recovery**
   - Execute rollback if needed
   - Monitor system stability
   - Conduct post-mortem analysis

---

⚙️ **Administrative Access Complete!**

For technical support or critical issues, contact the development team with relevant logs and error details.