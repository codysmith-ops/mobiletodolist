# API Setup Guide - Mobile Todo List App

## 🎯 Quick Start

Your app works **50-70% functional** without ANY API keys using intelligent fallbacks and demo data. Add these APIs to reach **100% functionality**:

## 🔑 Required APIs (for 100% functionality)

### 1. **Google Places API** (Adds +25% functionality)
**What it enables:**
- Real store locations near you
- Store hours and phone numbers  
- Live store ratings and reviews
- Accurate distance calculations
- Store photos and details

**How to get it:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Places API" and "Maps JavaScript API"
4. Go to Credentials → Create Credentials → API Key
5. Restrict key to iOS apps (optional but recommended)
6. Copy API key

**Cost:** Free tier: 25,000 requests/month (~800/day)

**Add to .env:**
```
GOOGLE_PLACES_API_KEY=AIzaSyC...your_key_here
```

---

### 2. **Spoonacular API** (Adds +15% functionality)
**What it enables:**
- 1M+ recipes with nutrition data
- Meal planning with auto-generated shopping lists
- Recipe search by ingredients you have
- Dietary filters (vegan, gluten-free, etc.)
- Ingredient substitutions

**How to get it:**
1. Go to [Spoonacular](https://spoonacular.com/food-api)
2. Sign up for free account
3. Go to Dashboard → API Keys
4. Copy your API key

**Cost:** Free tier: 150 requests/day

**Add to .env:**
```
SPOONACULAR_API_KEY=abc123...your_key_here
```

---

## 🌟 Optional APIs (enhance experience)

### 3. **OpenWeatherMap API** (Adds +3% functionality)
**What it enables:**
- Weather-based shopping suggestions
- "It's going to rain - buy umbrella"
- BBQ weather suggestions
- Seasonal product recommendations

**How to get it:**
1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for free account
3. Go to API keys tab
4. Copy your API key

**Cost:** Free tier: 1,000 requests/day

**Add to .env:**
```
OPENWEATHER_API_KEY=def456...your_key_here
```

---

### 4. **Firebase** (Adds +5% functionality)
**What it enables:**
- Cloud backup of all lists
- Cross-device sync
- User authentication
- Real-time collaboration
- Offline-first with auto-sync

**How to get it:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project
3. Add iOS app (bundle ID: com.mobiletodolist)
4. Download `GoogleService-Info.plist`
5. Copy configuration values

**Cost:** Free tier: Generous (1GB storage, 10GB/month transfer)

**Add to .env:**
```
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:ios:abcdef
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

---

### 5. **Stripe** (Adds +2% functionality)
**What it enables:**
- Bill splitting with card payments
- Reimbursement tracking
- Payment history
- Apple Pay integration

**How to get it:**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sign up for account
3. Get API keys from Developers → API keys
4. Use test keys for development

**Cost:** Free to integrate, 2.9% + 30¢ per transaction

**Add to .env:**
```
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_here
```

---

## 📊 Functionality Breakdown

| APIs Configured | Functionality Level | What Works |
|----------------|---------------------|------------|
| **None** | 50% ⚡ | Demo data, offline lists, basic features |
| **Google Places** | 75% 👍 | Real stores, accurate locations |
| **+ Spoonacular** | 90% ✨ | Full meal planning, recipes |
| **+ Weather** | 93% ✨ | Smart suggestions |
| **+ Firebase** | 98% 🎉 | Cloud sync, backup |
| **+ Stripe** | 100% 🎉 | Full payment features |

---

## 🚀 Setup Instructions

### Step 1: Copy the example file
```bash
cp .env.example .env
```

### Step 2: Add your API keys to `.env`
```bash
# Open in your editor
code .env

# Or use nano
nano .env
```

### Step 3: Install environment variable support
```bash
npm install react-native-dotenv --save-dev
```

### Step 4: Configure babel
Add to `babel.config.js`:
```javascript
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
    }],
  ],
};
```

### Step 5: Restart Metro bundler
```bash
# Kill existing Metro
npx react-native start --reset-cache
```

---

## ✅ Test Your Configuration

The app will show functionality level on launch:

```
🎉 Full functionality - all features enabled! (100%)
```

or

```
⚡ Basic - using demo data and fallbacks (50%)
Missing: Real store locations, Meal planning
```

---

## 💡 Pro Tips

1. **Start without any APIs** - The app works great with fallbacks!
2. **Add Google Places first** - Biggest impact on functionality
3. **Development vs Production** - Use different .env files:
   - `.env.development`
   - `.env.production`
4. **Keep keys secure** - Never commit `.env` to git!
5. **Budget-friendly** - All free tiers are generous for personal use

---

## 🆓 Stay on Free Tier

**Google Places:**
- Cache results locally
- Limit to 800 requests/day = 24,000/month (under free limit)

**Spoonacular:**
- 150/day limit
- Cache recipes for 24 hours
- Pre-load popular recipes

**Weather:**
- 1,000/day limit
- Update every 3 hours = 8/day per user

**Firebase:**
- Offline-first = minimal reads
- Batch writes
- Compress data

---

## 🎯 Recommended Minimum Setup

For **best experience** with **zero cost**:

```bash
# Just add these two (both have generous free tiers)
GOOGLE_PLACES_API_KEY=your_key
SPOONACULAR_API_KEY=your_key
```

This gives you **90% functionality** completely free! 🎉

---

## 🐛 Troubleshooting

**App not seeing .env values?**
```bash
# Clean and rebuild
npx react-native start --reset-cache
cd ios && pod install && cd ..
npx react-native run-ios
```

**API key errors?**
- Check key is active in provider dashboard
- Verify API is enabled (Google Cloud Console)
- Check for IP/app restrictions

**Still using demo data?**
- Verify .env file is in root directory
- Check babel.config.js has react-native-dotenv plugin
- Restart Metro bundler

---

## 📞 Support

Need help? Check:
- Google Places API: https://developers.google.com/maps/documentation/places
- Spoonacular: https://spoonacular.com/food-api/docs
- Firebase: https://firebase.google.com/docs
