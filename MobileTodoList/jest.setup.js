jest.mock('@react-native-voice/voice', () => ({
  onSpeechResults: null,
  onSpeechError: null,
  start: jest.fn(),
  stop: jest.fn(),
  destroy: jest.fn(() => Promise.resolve()),
  removeAllListeners: jest.fn(),
}));

jest.mock('@react-native-community/geolocation', () => ({
  requestAuthorization: jest.fn(),
  watchPosition: jest.fn(() => 1),
  clearWatch: jest.fn(),
}));
