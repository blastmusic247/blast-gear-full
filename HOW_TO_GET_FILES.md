# How to Get Your Files

## 📁 Files Created for You

All these files are in your `/app` directory on Emergent:

### 1. Documentation (Must-Read!)
- **DEPLOYMENT_CHECKLIST.md** - Complete deployment guide
- **API_KEYS_NEEDED.md** - Where to get all API keys
- **HOW_TO_GET_FILES.md** - This file

### 2. Database Exports (Your Data!)
- **products_export.json** - 3 products
- **promo_codes_export.json** - 1 promo code
- **gallery_images_export.json** - Empty (no images uploaded)
- **mongodb_backup/** folder - Full database backup

---

## 🔄 How to Get These Files

### Method 1: Save to GitHub Again (EASIEST)
1. Click the **"Save to GitHub"** button in your chat
2. Push to your repository
3. All new files will be included
4. Then clone/pull your GitHub repo to get everything

### Method 2: View in VS Code (Built-in)
1. Look for the file explorer on the left side
2. Navigate to `/app` folder
3. Click on each file to view
4. Copy contents manually

### Method 3: Download from GitHub After Push
Once you save to GitHub:
```bash
git clone [your-repo-url]
cd [your-repo]
# All files will be there including:
# - DEPLOYMENT_CHECKLIST.md
# - API_KEYS_NEEDED.md
# - products_export.json
# - promo_codes_export.json
# - mongodb_backup/
```

---

## 📋 Your Database Contents (Quick Reference)

### Products (3 items):
1. **Classic Vintage Tee** - $34.99
2. **Minimalist Black Tee** - $29.99
3. **Geometric Pattern Tee** - $37.99

All have sizes: XS, S, M, L, XL, XXL

### Promo Code (1):
- **Code:** TESTPROMO
- **Type:** Percentage
- **Discount:** 20%
- **Usage Limit:** 100 uses
- **Status:** Active

---

## ⚡ Quick Start After Download

1. **Clone from GitHub:**
   ```bash
   git clone [your-repo-url]
   cd blast-gear
   ```

2. **Create .env files** (templates in DEPLOYMENT_CHECKLIST.md)

3. **Import database:**
   ```bash
   mongoimport --uri="YOUR_MONGO_URL" --collection=products --file=products_export.json --jsonArray
   mongoimport --uri="YOUR_MONGO_URL" --collection=promo_codes --file=promo_codes_export.json --jsonArray
   ```

4. **Install and run:**
   ```bash
   # Backend
   cd backend
   pip install -r requirements.txt
   uvicorn server:app --reload
   
   # Frontend (new terminal)
   cd frontend
   npm install
   npm start
   ```

---

## 💡 Pro Tip

Save to GitHub NOW while everything is fresh. Then you'll have:
- ✅ All code
- ✅ All documentation
- ✅ Database exports
- ✅ Everything needed to deploy

Just click "Save to GitHub" → Push → Done! 🎉
