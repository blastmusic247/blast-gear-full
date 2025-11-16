# API Keys and Credentials - Quick Reference

## 🔑 What You Need to Get Before Deploying

### 1. Stripe (Payment Processing) - CRITICAL
**Where:** https://dashboard.stripe.com/apikeys

**You Need:**
- ✅ Secret Key (starts with `sk_test_` or `sk_live_`)
- ✅ Publishable Key (starts with `pk_test_` or `pk_live_`)

**For Webhooks:** https://dashboard.stripe.com/webhooks
- ✅ Webhook Secret (starts with `whsec_`)

**Current Status:** Using test keys (need to get LIVE keys for production)

---

### 2. Gmail SMTP (Order Confirmation Emails) - CRITICAL
**Where:** https://myaccount.google.com/apppasswords

**Steps:**
1. Enable 2-factor authentication on your Gmail account
2. Go to App Passwords page
3. Select "Mail" and "Other" (name it "BLAST Gear")
4. Copy the 16-character password (format: xxxx xxxx xxxx xxxx)

**You Need:**
- ✅ Your Gmail address
- ✅ 16-character app password

**Current Status:** You have credentials configured

---

### 3. Google reCAPTCHA (Spam Protection) - Already Configured
**Where:** https://www.google.com/recaptcha/admin

**You Have:**
- ✅ Site Key: `6LfPUQYsAAAAADvrLwXHXKb1NHWvX05SR3ByfIZA`
- ✅ Secret Key: (in your .env file)

**Action:** When deploying to new domain, add that domain in reCAPTCHA admin console

---

### 4. MongoDB (Database) - Required
**Options:**

**Option A: MongoDB Atlas (Free)** - Recommended
- Website: https://www.mongodb.com/cloud/atlas
- Free tier: 512MB storage
- Get connection string

**Option B: Self-hosted**
- Install MongoDB on your server
- Connection string: `mongodb://localhost:27017`

**You Need:**
- ✅ MongoDB connection URL (MONGO_URL)
- ✅ Database name (currently: test_database)

---

### 5. Admin Account
**Current Credentials:**
- Username: `admin`
- Password: `admin123`
- Password Hash: `$2b$12$jmP9Me.KjkEt22qmRiRgVuzKCIc9ArVtgyhPAW82WZxlN/MJu0zXi`

**⚠️ IMPORTANT:** Change this password before going live!

---

## Quick Setup Order

1. **First:** Set up MongoDB (Atlas or self-hosted)
2. **Second:** Get Stripe keys (test first, then live)
3. **Third:** Create Gmail app password
4. **Fourth:** Update .env files with all keys
5. **Fifth:** Import your database data
6. **Sixth:** Test everything locally
7. **Finally:** Deploy to production

---

## .env File Templates

### Backend .env
```
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net
DB_NAME=blast_gear
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$12$jmP9Me.KjkEt22qmRiRgVuzKCIc9ArVtgyhPAW82WZxlN/MJu0zXi
RECAPTCHA_SECRET_KEY=your_secret_key_here
GMAIL_USER=youremail@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
STRIPE_SECRET_KEY=sk_live_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Frontend .env
```
REACT_APP_BACKEND_URL=https://your-backend-url.com
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_key_here
REACT_APP_RECAPTCHA_SITE_KEY=6LfPUQYsAAAAADvrLwXHXKb1NHWvX05SR3ByfIZA
REACT_APP_LOGO_URL=/BLAST Gear logo.png
```

---

## Testing Checklist

Before going live, test:
- [ ] Admin login works
- [ ] Products display correctly
- [ ] Add to cart works
- [ ] Checkout process with Stripe test card (4242 4242 4242 4242)
- [ ] Order confirmation email received
- [ ] Admin receives order notification email
- [ ] Promo code applies correctly
- [ ] Gallery images upload
- [ ] Order tracking works
- [ ] Contact form works
- [ ] Mobile responsive design

**Stripe Test Cards:** https://stripe.com/docs/testing#cards
