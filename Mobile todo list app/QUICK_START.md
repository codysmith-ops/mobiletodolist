# 🚀 QUICK START GUIDE

## ⚡ Get Running in 10 Minutes

### Step 1: Get Free API Keys (5 min)

1. **Google Places** (Required for store search)
   - Go to: https://console.cloud.google.com/
   - Create project → Enable "Places API"
   - Create credentials → API Key
   - Copy to `.env`: `GOOGLE_PLACES_API_KEY=your_key`

2. **Firebase** (Required for real-time features)
   - Go to: https://console.firebase.google.com/
   - Create project
   - Add iOS app (bundle: `com.mobiletodolist`)
   - Download `GoogleService-Info.plist` → Place in `ios/MobileTodoList/`
   - Copy Web API key to `.env`: `FIREBASE_API_KEY=your_key`

3. **Spoonacular** (Optional - meal planning)
   - Go to: https://spoonacular.com/food-api
   - Sign up (150 free requests/day)
   - Copy to `.env`: `SPOONACULAR_API_KEY=your_key`

4. **OpenWeather** (Optional - weather suggestions)
   - Go to: https://openweathermap.org/api
   - Sign up (1000 free requests/day)
   - Copy to `.env`: `OPENWEATHER_API_KEY=your_key`

### Step 2: Install & Run (5 min)

```bash
cd MobileTodoList

# Setup environment
cp .env.example .env
# Edit .env and add your API keys

# Run setup script
./setup-apis.sh

# Open in Xcode
open ios/MobileTodoList.xcworkspace

# Press Cmd+R to run!
```

---

## 📱 What Works Out of the Box

### With API Keys:
- ✅ Real store search with Google Places
- ✅ Receipt scanning with ML Kit
- ✅ Meal planning with 200k+ recipes
- ✅ Weather-based suggestions
- ✅ Real-time shared lists
- ✅ Cashback offers
- ✅ In-app purchases

### Without API Keys (Mock Mode):
- ✅ Basic shopping lists
- ✅ Local price tracking
- ✅ Route optimization
- ✅ Budget tracking
- ✅ All UI features

---

## 🎯 Priority API Keys

**Must Have (for full functionality):**
1. Google Places - Store search
2. Firebase - Real-time sync

**Nice to Have:**
3. Spoonacular - Meal planning
4. OpenWeather - Smart suggestions

**Premium Features:**
5. Rakuten/Honey - Cashback
6. Stripe/Venmo - Payments
7. Cloud Vision - Advanced OCR

---

## 🔥 Test It Out

### Test Store Search:
1. Open app
2. Search for "milk"
3. See nearby stores (with API key) or mock data

### Test Receipt Scanning:
1. Take a photo of a receipt
2. Tap "Scan Receipt"
3. See items automatically added

### Test Meal Planning:
1. Go to "Meal Planning"
2. Search "pasta recipes"
3. Add to meal plan
4. Generate shopping list

### Test Weather Suggestions:
1. Open app (location permission needed)
2. Check "Smart Suggestions"
3. See weather-based recommendations

---

## 💡 Tips

- **No API keys?** The app still works with mock data
- **Rate limits?** All services cache results intelligently
- **Errors?** Check console logs - services log clearly what's missing
- **Testing?** Each service has built-in fallbacks

---

## 📚 Full Documentation

- [API_INTEGRATIONS_COMPLETE.md](../API_INTEGRATIONS_COMPLETE.md) - Complete API guide
- [COMPLETE_FEATURE_AUDIT.md](../COMPLETE_FEATURE_AUDIT.md) - All features listed
- `.env.example` - All configuration options

---

## 🆘 Troubleshooting

**"GoogleService-Info.plist not found"**
→ Download from Firebase Console and add to `ios/MobileTodoList/`

**"API key invalid"**
→ Check `.env` file and restart app

**"Camera not working"**
→ Add camera permission to `Info.plist`

**"Pods not installing"**
→ Run `cd ios && pod install --repo-update`

---

## ✨ You're Ready!

The app is **production-ready** with all core features working.

Launch it, test it, and start customizing! 🚀
