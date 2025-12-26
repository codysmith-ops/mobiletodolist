
# 20-Step Mobile Todo List Build Plan

## Project: Location-Aware Shopping & Task Management App with Store Inventory Search

### Phase 1: Foundation & Setup (Steps 1-4)

#### ✅ Step 1: Project Initialization
- [x] Create React Native project with TypeScript
- [x] Set up iOS workspace with CocoaPods
- [x] Configure Metro bundler
- [x] Install core dependencies (React Native, TypeScript)

#### ✅ Step 2: State Management & Theme
- [x] Implement Zustand store (`src/store.ts`)
- [x] Create Task interface with location, navigation, and completion tracking
- [x] Define theme system (`src/theme.ts`) with Deadstock Zero palette
- [x] Set up navigation preferences (Apple Maps, Google Maps, Waze)

#### ✅ Step 3: Development Environment
- [x] Configure Jest for testing (`jest.config.js`, `jest.setup.js`)
- [x] Set up TypeScript configuration (`tsconfig.json`)
- [x] Configure Babel for React Native (`babel.config.js`)
- [x] Set up Metro config for assets

#### ✅ Step 4: iOS Native Setup
- [x] Configure Podfile with required dependencies
- [x] Install ML Kit OCR for text recognition
- [x] Set up permissions (Location, Camera, Microphone)
- [x] Configure Info.plist with usage descriptions

---

### Phase 2: Core Features (Steps 5-8)

#### ✅ Step 5: Basic Todo Functionality
- [x] Create task input form (title, notes)
- [x] Implement add task with validation
- [x] Build task list with FlatList
- [x] Add toggle complete/incomplete
- [x] Implement delete task functionality

#### ✅ Step 6: Location Features
- [x] Integrate Geolocation API
- [x] Request location permissions (Always/WhenInUse)
- [x] Capture current position
- [x] Add location label and coordinates to tasks
- [x] Display location status in UI

#### ✅ Step 7: Voice Input Integration
- [x] Create useVoiceInput hook (`src/hooks/useVoiceInput.ts`)
- [x] Implement speech-to-text with Voice module
- [x] Add voice recording UI (start/stop buttons)
- [x] Auto-fill title from voice transcript
- [x] Handle microphone permissions

#### ✅ Step 8: Camera & OCR
- [x] Integrate react-native-image-picker
- [x] Implement ML Kit OCR for text recognition
- [x] Extract product brand and details from images
- [x] Display captured images in UI
- [x] Auto-fill form fields from OCR results

---

### Phase 3: Smart Features (Steps 9-12)

#### ✅ Step 9: Proximity Alerts
- [x] Implement ETA calculation using haversine formula
- [x] Monitor user position continuously
- [x] Trigger alerts when 5-10 minutes away from task location
- [x] Show proximity alerts with navigation options
- [x] Track alerted tasks to prevent duplicates

#### ✅ Step 10: Navigation Integration
- [x] Support multiple navigation apps (Apple Maps, Google Maps, Waze)
- [x] Build deep links for each navigation provider
- [x] Add navigation preference selector
- [x] Persist navigation preference in store
- [x] One-tap navigation from tasks and alerts

#### ✅ Step 11: Route Planning
- [x] Implement nearest-neighbor route optimization algorithm
- [x] Calculate optimal multi-stop routes from current location
- [x] Display route plan with distances and order
- [x] Show total route distance
- [x] Provide navigation for each stop in sequence

#### ✅ Step 12: Store Search Service
- [x] Create store search service (`src/services/storeSearch.ts`)
- [x] Implement mock data for 5 retailers (Target, Walmart, Whole Foods, Safeway, Amazon)
- [x] Add parallel search across all stores
- [x] Calculate distances to store locations
- [x] Return unified StoreResult format

---

### Phase 4: Store Integration (Steps 13-16)

#### ✅ Step 13: Store Search UI
- [x] Add "Search stores" button
- [x] Implement auto-search after OCR extraction
- [x] Display loading state during search
- [x] Show store results with cards/badges
- [x] Handle empty results gracefully

#### ✅ Step 14: Availability Display
- [x] Create availability badges (In Stock, Low Stock, Out of Stock, Check Store)
- [x] Color-code status (green, yellow, red, gray)
- [x] Show store logos/icons
- [x] Display product pricing
- [x] Add click-through links to product pages

#### ✅ Step 15: Location-Based Store Features
- [x] Sort results by distance from user
- [x] Display distance in km/meters
- [x] Show nearest store for each retailer
- [x] Integrate with user's current location
- [x] Update distances as position changes

#### ⬜ Step 16: Real API Integration
- [ ] Set up API keys for Target RedCard API
- [ ] Integrate Walmart Open API
- [ ] Connect Amazon Product Advertising API
- [ ] Add Google Maps Places API for store locations
- [ ] Implement rate limiting and caching
- [ ] Set up backend proxy for web scraping (if needed)
- [ ] Add error handling for API failures
- [ ] Configure environment variables for production

---

### Phase 5: Polish & Production (Steps 17-20)

#### ⬜ Step 17: Background Location (Advanced)
- [ ] Set up iOS background location tracking
- [ ] Configure geofencing for proximity alerts
- [ ] Implement background task handling
- [ ] Add battery optimization
- [ ] Test background permissions and reliability

#### ⬜ Step 18: Offline Support
- [ ] Implement AsyncStorage for task persistence
- [ ] Cache store search results
- [ ] Queue actions for offline sync
- [ ] Show offline indicators
- [ ] Sync data when connection restored

#### ⬜ Step 19: Testing & Quality
- [ ] Write unit tests for store search
- [ ] Add integration tests for voice input
- [ ] Test OCR accuracy with various products
- [ ] Validate navigation deep links
- [ ] Test proximity alerts in real scenarios
- [ ] Performance optimization (FlatList, memoization)
- [ ] Accessibility improvements (VoiceOver, dynamic type)

#### ⬜ Step 20: Production Deployment
- [ ] Configure app icons and splash screens
- [ ] Set up code signing and provisioning profiles
- [ ] Create App Store screenshots
- [ ] Write App Store description
- [ ] Submit for TestFlight beta testing
- [ ] Address App Store review feedback
- [ ] Production release to App Store

---

## Current Status: Step 15 Complete ✅

**Next Steps:**
1. **Step 16**: Integrate real retail APIs (Target, Walmart, Amazon)
2. **Step 17**: Add background location tracking for geofencing
3. **Step 18**: Implement offline support with AsyncStorage
4. **Step 19**: Comprehensive testing suite
5. **Step 20**: Prepare for App Store submission

---

## Key Documents

- **Feature Summary**: [FEATURE_SUMMARY.md](MobileTodoList/FEATURE_SUMMARY.md)
- **API Integration Guide**: [STORE_API_INTEGRATION.md](MobileTodoList/STORE_API_INTEGRATION.md)
- **Project Setup**: [.github/copilot-instructions.md](.github/copilot-instructions.md)
- **README**: [MobileTodoList/README.md](MobileTodoList/README.md)

---

## Technical Stack

- **Framework**: React Native + TypeScript
- **State**: Zustand
- **Location**: @react-native-community/geolocation, geolib
- **Voice**: @react-native-voice/voice
- **Camera**: react-native-image-picker
- **OCR**: react-native-mlkit-ocr
- **Store Search**: Custom service with mock data (transition to real APIs)
- **Testing**: Jest + React Native Testing Library

---

## Design System

- **Primary**: #5159B0 (Deadstock Purple)
- **Secondary**: #818CF8 (Light Purple)
- **Accent**: #1E293B (Dark Slate)
- **Success**: #10B981 (Green)
- **Warning**: #F59E0B (Amber)
- **Error**: #EF4444 (Red)

---

## Priority Implementation Order

### Immediate (Step 16)
Replace mock data with real retail APIs:
1. Walmart Open API (easiest - public API available)
2. Amazon Product Advertising API (requires affiliate account)
3. Target RedCard API or web scraping proxy
4. Google Maps Places API for store locations
5. Implement caching layer to reduce API calls

### Short-term (Steps 17-18)
1. Background location for true proximity alerts
2. Offline persistence for reliability

### Long-term (Steps 19-20)
1. Comprehensive testing
2. App Store deployment

---

## Notes

- **Mock Data**: Currently using simulated store responses with 300ms delay
- **Location**: Real GPS tracking implemented, background mode not yet configured
- **Voice**: Fully functional with iOS Speech Recognition
- **OCR**: ML Kit integration complete and tested
- **Navigation**: Deep links working for all three providers
- **Route Planning**: Nearest-neighbor algorithm implemented and functional
