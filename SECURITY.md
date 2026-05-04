# 🔒 Website Security Guide

## Security Features Implemented

### ✅ 1. Security Headers (next.config.js)
- **Strict-Transport-Security**: Forces HTTPS
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **X-XSS-Protection**: XSS filtering
- **Content-Security-Policy**: Prevents XSS/injection attacks
- **Referrer-Policy**: Controls referrer information
- **Permissions-Policy**: Limits browser features

### ✅ 2. Rate Limiting
- 100 requests per minute per IP
- Automatic reset after window expires
- Configurable limits

### ✅ 3. Input Sanitization
- XSS prevention
- HTML/script tag stripping
- Event handler removal

### ✅ 4. CORS Configuration
- Whitelist-based origin checking
- Safe HTTP methods only
- Security headers on responses

---

## Environment Variables (Vercel)

Set these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Required |
|----------|-------|----------|
| `EXPO_PUBLIC_SUPABASE_URL` | `https://ydnmhnutaitmbeybpwxc.supabase.co` | ✅ Yes |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your anon key | ✅ Yes |
| `STRIPE_SECRET_KEY` | `sk_live_xxx` | No (for payments) |

---

## ⚠️ CRITICAL: Existing Security Issues

Based on your SECURITY_AUDIT_REPORT.md:

### 1. Service Role Key Exposed 🔴
Your `.env` file contains the service role key which should NEVER be exposed.

**Action Required:**
1. Go to Supabase Dashboard → Settings → API
2. Click "Rotate" on the Service Role key
3. Remove `EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` from any client-side code

### 2. .env File in Git 🔴
Add `.env` to your `.gitignore` immediately.

### 3. Hardcoded Fallback Keys
Your code has fallback keys like:
```typescript
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY || 'eyJhbGci...'
```

**Fix:** Remove fallback keys - let the app fail if env vars are missing.

---

## Deployment Checklist

Before deploying to production:

- [ ] Rotate all API keys in Supabase
- [ ] Add `.env` to `.gitignore`
- [ ] Set environment variables in Vercel
- [ ] Enable RLS policies on all tables
- [ ] Test rate limiting
- [ ] Verify CSP headers work
- [ ] Test from mobile (different origin)

---

## Monitoring

Add these to track security events:

### Sentry (already configured in your app)
```bash
npm install @sentry/nextjs
```

### Vercel Analytics
- Built-in DDoS protection
- Traffic monitoring
- Anomaly alerts
