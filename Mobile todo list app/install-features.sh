#!/bin/bash

echo "🚀 Installing MobileTodo Pro Features..."
echo ""

# Navigate to project directory
cd "$(dirname "$0")/MobileTodoList"

echo "📦 Installing core dependencies..."
npm install --save \
  @react-native-async-storage/async-storage@^1.21.0 \
  @react-native-community/netinfo@^11.2.1 \
  react-native-vision-camera@^3.6.17

echo ""
echo "📦 Installing optional dependencies (recommended)..."
npm install --save --legacy-peer-deps \
  react-native-mlkit-ocr \
  react-native-iap \
  react-native-siri-shortcut \
  react-native-watch-connectivity

echo ""
echo "🍎 Installing iOS pods..."
cd ios
pod install
cd ..

echo ""
echo "✅ Installation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Review IMPLEMENTATION_COMPLETE.md for feature guide"
echo "2. Add camera permissions to Info.plist"
echo "3. Test services: npm test"
echo "4. Run on iOS: npm run ios"
echo ""
echo "🎉 You now have 18 world-class features ready to use!"
