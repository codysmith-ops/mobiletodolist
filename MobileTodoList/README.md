## Mobile Todo List (iOS-first)

- Voice-first capture (in-app speech-to-text) plus text entry
- Navigation preference (Apple, Google, Waze) with one-tap directions
- Location-aware reminders: alerts fire when you are ~5–10 minutes away (approx. ETA from current GPS)
- Deadstock Zero purple palette (#5159B0 / #818CF8 / #1E293B)

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

- Add item: enter title/notes; optional location label and lat/lng (for ETA). Save.
- Voice add: tap "Voice add" to dictate; tap again to stop; title auto-fills.
- Navigation: choose default app under "Navigation preference"; tap Navigate on a task or confirm a proximity alert to open directions.
- Proximity alerts: with location permission "Always", the app polls location and pops an alert when ETA is between 5–10 minutes. Confirm opens directions; Ignore keeps the item pending.

### Permissions

- Location: request "Always Allow" so proximity checks work in foreground; background geofencing requires additional native setup not included here.
- Microphone/Speech: required for in-app voice dictation.

### Testing

```bash
npm test
```

Jest is configured with basic mocks for voice and geolocation in `jest.setup.js`.
