# BLAST Gear - Complete Deployment Checklist

## ✅ What You Have in GitHub
- All source code (frontend React + backend Python)
- All components, pages, and routes
- Package dependencies (package.json, requirements.txt)
- Static files and styling
- BLAST Gear logo

## ⚠️ CRITICAL: What's NOT in GitHub (You Must Recreate These!)

### 1. Environment Variables (.env files)

**Backend `/backend/.env`:**
```env
# MongoDB Connection
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$12$jmP9Me.KjkEt22qmRiRgVuzKCIc9ArVtgyhPAW82WZxlN/MJu0zXi

# reCAPTCHA (Get from: https://www.google.com/recaptcha/admin)
RECAPTCHA_SECRET_KEY=6LfPUQYsAAAAAL8vF2rB0E7E8yYXQZQHZKZQHZKZ

# Gmail SMTP (Get from: Gmail App Passwords)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password

# Stripe (Get from: https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

**Frontend `/frontend/.env`:**
```env
# Backend API URL (Update for your hosting)
REACT_APP_BACKEND_URL=http://localhost:8001

# Stripe (Get from: https://dashboard.stripe.com/apikeys)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY

# reCAPTCHA (Get from: https://www.google.com/recaptcha/admin)
REACT_APP_RECAPTCHA_SITE_KEY=6LfPUQYsAAAAADvrLwXHXKb1NHWvX05SR3ByfIZA

# Logo
REACT_APP_LOGO_URL=/BLAST Gear logo.png
```

### 2. MongoDB Database Data

**Collections Exported:**
- ✅ Products: 3 items (your t-shirt listings)
- ✅ Promo Codes: 1 code
- ✅ Orders: 0 (all deleted/tested)
- ✅ Gallery Images: 0 (none uploaded yet)

**Export Files Created:**
- `/app/products_export.json` - Your 3 products
- `/app/promo_codes_export.json` - Your promo code
- `/app/mongodb_backup/` - Full binary backup

**To Import on New Server:**
```bash
# Method 1: Using JSON exports
mongoimport --uri="YOUR_MONGO_URL" --collection=products --file=products_export.json --jsonArray
mongoimport --uri="YOUR_MONGO_URL" --collection=promo_codes --file=promo_codes_export.json --jsonArray

# Method 2: Using binary backup
mongorestore --uri="YOUR_MONGO_URL" /path/to/mongodb_backup/
```

### 3. Uploaded Images/Files

**Location:** `/frontend/public/uploads/`
**Status:** Check if you have any uploaded product images or gallery photos here
**Action:** Copy these files to your new server in the same location

### 4. Admin Password

**Current Password:** `admin123`
**Current Username:** `admin`

**Important:** The password hash in .env corresponds to `admin123`. If you want a different password:
```python
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
print(pwd_context.hash("your_new_password"))
```

---

## 🔑 API Keys You Need to Get

### 1. **Stripe Keys** (Required for Payments)
- Go to: https://dashboard.stripe.com/apikeys
- Get: Secret Key (sk_test_...) and Publishable Key (pk_test_...)
- Go to: https://dashboard.stripe.com/webhooks
- Create webhook endpoint, get: Webhook Secret (whsec_...)

### 2. **Gmail App Password** (Required for Order Emails)
- Go to: https://myaccount.google.com/apppasswords
- Create new app password for "Mail"
- Copy the 16-character password (no spaces)

### 3. **Google reCAPTCHA** (Already have keys in .env above)
- If you need new ones: https://www.google.com/recaptcha/admin
- Add your domain when deploying

### 4. **MongoDB Connection** (Database)
- If using MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Create free cluster, get connection string
- Replace `MONGO_URL` in backend .env

---

## 🚀 Deployment Steps for Hostinger (or any host)

### Step 1: Choose Your Hosting Setup

**Option A: Hostinger VPS** (Recommended)
- Get VPS with Ubuntu
- Install Node.js, Python, MongoDB, Nginx
- Deploy both frontend and backend

**Option B: Split Hosting** (Easier)
- Frontend: Vercel (free) or Netlify
- Backend: Railway, Render, or Fly.io
- Database: MongoDB Atlas (free tier)

### Step 2: Install Dependencies

**Backend:**
```bash
cd backend
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
npm run build
```

### Step 3: Configure Environment Variables
- Create `.env` files in both `/backend` and `/frontend`
- Copy the templates above
- Replace with your actual keys

### Step 4: Import Database
```bash
mongorestore --uri="YOUR_MONGO_URL" mongodb_backup/
```

### Step 5: Update CORS and URLs
- In `backend/server.py`, update CORS origins to include your domain
- Update `REACT_APP_BACKEND_URL` in frontend .env to your backend URL

### Step 6: Test Locally First
```bash
# Backend
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001

# Frontend (new terminal)
cd frontend
npm start
```

### Step 7: Deploy
- Build frontend: `npm run build`
- Serve frontend: Use Nginx or hosting platform
- Run backend: Use systemd service or platform's process manager
- Configure reverse proxy to route `/api` to backend

---

## ⚠️ Security Checklist Before Going Live

- [ ] Change admin password from `admin123`
- [ ] Use LIVE Stripe keys (not test keys)
- [ ] Enable reCAPTCHA on production domain
- [ ] Set up HTTPS/SSL certificate (required for Stripe)
- [ ] Rotate all API keys if any were exposed
- [ ] Set strong MongoDB password
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging

---

## 📝 Important Notes

1. **Database:** Your current database is `test_database` with 3 products and 1 promo code
2. **Admin Login:** username=`admin`, password=`admin123`
3. **Stripe:** Currently using test keys (sk_test_..., pk_test_...)
4. **Email:** Configure Gmail SMTP for order notifications
5. **Images:** Product images are in `/frontend/public/uploads/`

---

## 🆘 Need Help?

If you encounter issues:
1. Check logs: Backend errors will show in console/logs
2. Check browser console: Frontend errors visible in DevTools
3. Test Stripe with test cards: https://stripe.com/docs/testing
4. MongoDB connection issues: Verify connection string and whitelist IP
5. CORS errors: Update allowed origins in backend

---

## Current Database Contents

**Products (3):**
1. Classic BLAST Tee
2. Vintage Wave Shirt
3. Urban Edge Tee

**Promo Code (1):**
- Code: TESTPROMO
- Discount: 20%
- Type: Percentage

**Note:** Export files are available in:
- `/app/products_export.json`
- `/app/promo_codes_export.json`
- `/app/mongodb_backup/` (binary backup)
