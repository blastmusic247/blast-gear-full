# GitHub Push Protection - Stripe Keys Exposed

## Issue
GitHub detected Stripe Test API Secret Key in `backend/.env:5` across multiple commits and is blocking push operations.

## Root Cause
The `.env` file containing Stripe secret keys was accidentally committed to the git repository history. Even though `.gitignore` now properly excludes `.env` files, the keys remain in the git history.

## Solution Steps

### Step 1: Rotate Your Stripe API Keys (CRITICAL)
Since the keys have been exposed in git history, you should rotate them for security:

1. Go to your [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Navigate to **Developers → API Keys**
3. Click **"Roll key"** for both:
   - Secret key (starts with `sk_test_...`)
   - Publishable key (starts with `pk_test_...`)
4. Copy the new keys

### Step 2: Update Your Application with New Keys

Update the following files with your new Stripe keys:

**Backend** (`/app/backend/.env`):
```env
STRIPE_SECRET_KEY=sk_test_YOUR_NEW_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

**Frontend** (`/app/frontend/.env`):
```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_NEW_PUBLISHABLE_KEY_HERE
```

After updating, restart the backend:
```bash
sudo supervisorctl restart backend
```

### Step 3: Push to GitHub Using Emergent's "Save to Github" Feature

⚠️ **IMPORTANT**: Do NOT use `git push` command directly. Instead:

1. Use the **"Save to Github"** feature in the Emergent platform
2. This feature is available in your chat interface
3. It will handle the git operations safely and correctly

### Step 4: Verify .gitignore (Already Configured ✅)

Your `.gitignore` file already correctly excludes `.env` files:
```
*.env
*.env.*
```

This prevents future accidental commits of environment files.

## Prevention

✅ `.gitignore` is properly configured
✅ Always use environment variables for secrets
✅ Never commit `.env` files
✅ Use "Save to Github" feature for git operations
✅ Regularly rotate API keys in production

## Summary

1. **Rotate Stripe keys** in your Stripe Dashboard (for security)
2. **Update .env files** with new keys in both backend and frontend
3. **Restart backend** service
4. **Use "Save to Github"** feature to push your code (not `git push`)

The exposed keys in git history will no longer be valid once you rotate them, making this a non-issue for security.
