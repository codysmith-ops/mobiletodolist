## Mobile Todo List (iOS-first)

A location-aware, voice-enabled shopping and task management app with retail store inventory search.

### Key Features

- **Voice-first capture**: In-app speech-to-text plus text entry
- **Smart navigation**: Choose between Apple Maps, Google Maps, or Waze for one-tap directions
- **Location-aware reminders**: Auto-alerts when you're ~5–10 minutes away from a task location
- **Camera + OCR**: Take photos of products to auto-extract brand and details via ML Kit
- **Store inventory search**: Compare prices and availability across Target, Walmart, grocery stores, and Amazon
- **Proximity-based sorting**: Results sorted by nearest store with item in stock
- **Route optimization**: Plan efficient multi-stop routes using nearest-neighbor algorithm
- **Deadstock Zero design**: Purple palette (#5159B0 / #818CF8 / #1E293B)

### Run

```bash
npm start      # Metro
npm run ios    # iOS simulator
```

If you add new native deps run CocoaPods in `ios/`:

```bash
cd ios && bundle install && bundle exec pod install
```

### Features and flows

- **Add item**: Enter title/notes; optional location label and lat/lng for ETA-based reminders
- **Voice add**: Tap "Voice add" to dictate; tap again to stop; title auto-fills from transcript
- **Camera capture**: Tap "📸 Take photo" to scan product labels; OCR extracts brand and details
- **Store search**: Tap "🔍 Search stores" or auto-search after photo OCR to find prices and availability
- **Navigation**: Choose default app under "Navigation preference"; tap Navigate on a task or confirm a proximity alert to open directions
- **Proximity alerts**: With location permission "Always", the app monitors GPS and pops an alert when ETA is 5–10 minutes. Confirm opens directions; Ignore keeps item pending
- **Route planning**: Tap "Plan route" to optimize your stops using nearest-neighbor from current location
- **Store results**: View in-stock status, prices, nearest store location, and distance; tap to open product page

### Permissions

- **Location** ("Always Allow"): Required for proximity checks and distance-based store sorting; background geofencing needs additional native setup not included here
- **Microphone/Speech**: Required for in-app voice dictation
- **Camera**: Required to take photos of product labels for OCR text extraction

### Store Search

See [STORE_API_INTEGRATION.md](STORE_API_INTEGRATION.md) for:
- Integration guides for Target, Walmart, Amazon, and grocery store APIs
- Web scraping fallback options
- Store locator API examples (Google Maps Places, retailer-specific)
- Environment setup and API key configuration

Current implementation uses mock data. Replace with real APIs for production.

### Testing

```bash
npm test
```

Jest is configured with basic mocks for voice and geolocation in `jest.setup.js`.
