# Netlify Messaging Fix - Complete Guide

## Problem Identified

The messaging feature was failing on Netlify because the WebSocket connection was using a **hardcoded URL** instead of the environment-based backend URL.

**Hardcoded URL:** `wss://hrms-backend-t38z.onrender.com` ❌
**Should be:** Dynamic URL from `VITE__BASEURL` environment variable ✅

## Changes Made

### 1. **Dynamic WebSocket URL Construction**

- Changed from hardcoded `wss://hrms-backend-t38z.onrender.com` to dynamic URL construction
- Now automatically converts `https://api-hrms-backend.kyptronix.us` to `wss://api-hrms-backend.kyptronix.us`
- Works for both local (ws://) and production (wss://) environments

### 2. **Improved Error Handling**

- Added proper WebSocket state validation before sending messages
- Better error messages for debugging
- Graceful fallback with user notifications

### 3. **Fixed Reconnection Logic**

- Reconnection now uses the same dynamic URL
- Prevents hardcoded URL issues during reconnects

## Environment Variables - Verify Setup

### Local Development (.env)

```
VITE__BASEURL=https://api-hrms-backend.kyptronix.us
```

### Production on Netlify (.env.production)

```
VITE__BASEURL=https://api-hrms-backend.kyptronix.us
```

### Netlify Environment Variables

Add these in Netlify Dashboard → Site Settings → Build & Deploy → Environment:

```
VITE__BASEURL=https://api-hrms-backend.kyptronix.us
```

## Testing Steps

1. **Local Testing:**

   ```bash
   npm run dev
   # Test message sending - should work
   ```

2. **Production Testing:**

   - Push code to main branch
   - Netlify will auto-deploy
   - Test messaging on the hosted site
   - Check browser DevTools Console for connection logs

3. **Debugging:**
   - Open browser Console (F12)
   - Look for logs: `"Connecting to WebSocket:"`
   - Should show: `"Connecting to WebSocket: wss://api-hrms-backend.kyptronix.us"`

## Common Issues & Solutions

### Issue: "Connection not ready"

- **Cause:** WebSocket still establishing
- **Fix:** Wait a moment and try again

### Issue: "Connection lost"

- **Cause:** Backend unreachable
- **Fix:** Check if backend is running and accessible from `https://api-hrms-backend.kyptronix.us`

### Issue: Message appears locally but not on Netlify

- **Cause:** Environment variables not set on Netlify
- **Fix:** Add `VITE__BASEURL` to Netlify environment variables

## Next Steps

1. Commit and push the changes:

   ```bash
   git add .
   git commit -m "Fix: Dynamic WebSocket URL for Netlify messaging"
   git push origin main
   ```

2. Verify Netlify deployment completes successfully

3. Test messaging on the live Netlify URL

4. Check browser console for WebSocket connection logs
