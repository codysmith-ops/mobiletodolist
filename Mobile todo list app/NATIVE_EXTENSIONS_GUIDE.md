# 🎯 Native iOS Extensions - Implementation Guide

This guide walks you through implementing the native iOS extensions that complement the React Native app.

---

## 📋 Prerequisites

- Xcode 15+
- iOS 17+ SDK
- React Native 0.73+
- CocoaPods installed
- Apple Developer Account (for testing on device)

---

## 1️⃣ WidgetKit Extension - Home Screen Widgets

### What It Does:
- Shows shopping list on home screen
- Displays active deals
- Shows budget progress
- Quick add button for frequent items

### Implementation Steps:

#### Step 1: Create Widget Extension in Xcode

```bash
# Open Xcode workspace
open ios/MobileTodoList.xcworkspace
```

**In Xcode:**
1. File → New → Target
2. Select "Widget Extension"
3. Name: `ShoppingWidgets`
4. Language: Swift
5. Include Configuration Intent: ✓
6. Click Finish

#### Step 2: Configure App Group

**In Xcode:**
1. Select MobileTodoList target
2. Signing & Capabilities → + Capability → App Groups
3. Add group: `group.com.mobiletodolist.widgets`
4. Select ShoppingWidgets target
5. Add same App Group

#### Step 3: Create Widget Swift Code

Create `ios/ShoppingWidgets/ShoppingWidget.swift`:

```swift
import WidgetKit
import SwiftUI

struct ShoppingListEntry: TimelineEntry {
    let date: Date
    let listName: String
    let items: [ShoppingItem]
    let itemCount: Int
}

struct ShoppingItem: Codable {
    let name: String
    let completed: Bool
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> ShoppingListEntry {
        ShoppingListEntry(
            date: Date(),
            listName: "My List",
            items: [],
            itemCount: 0
        )
    }
    
    func getSnapshot(in context: Context, completion: @escaping (ShoppingListEntry) -> ()) {
        let entry = loadWidgetData()
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let entry = loadWidgetData()
        let timeline = Timeline(entries: [entry], policy: .atEnd)
        completion(timeline)
    }
    
    private func loadWidgetData() -> ShoppingListEntry {
        guard let sharedDefaults = UserDefaults(suiteName: "group.com.mobiletodolist.widgets"),
              let jsonString = sharedDefaults.string(forKey: "widget_data"),
              let jsonData = jsonString.data(using: .utf8),
              let widgetData = try? JSONDecoder().decode(WidgetData.self, from: jsonData) else {
            return ShoppingListEntry(date: Date(), listName: "No List", items: [], itemCount: 0)
        }
        
        return ShoppingListEntry(
            date: Date(),
            listName: widgetData.shoppingList.name,
            items: widgetData.shoppingList.items,
            itemCount: widgetData.shoppingList.itemCount
        )
    }
}

struct ShoppingWidgetView: View {
    var entry: Provider.Entry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(entry.listName)
                .font(.headline)
                .foregroundColor(.primary)
            
            if entry.items.isEmpty {
                Text("No items")
                    .font(.caption)
                    .foregroundColor(.secondary)
            } else {
                ForEach(entry.items.prefix(5), id: \.name) { item in
                    HStack {
                        Image(systemName: item.completed ? "checkmark.circle.fill" : "circle")
                            .foregroundColor(item.completed ? .green : .gray)
                        Text(item.name)
                            .font(.caption)
                            .strikethrough(item.completed)
                    }
                }
            }
            
            Text("\(entry.itemCount) items")
                .font(.caption2)
                .foregroundColor(.secondary)
        }
        .padding()
    }
}

@main
struct ShoppingWidget: Widget {
    let kind: String = "ShoppingWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            ShoppingWidgetView(entry: entry)
        }
        .configurationDisplayName("Shopping List")
        .description("View your shopping list at a glance")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
```

Create `WidgetData.swift`:

```swift
struct WidgetData: Codable {
    let shoppingList: ShoppingListData
    let deals: DealsData
    let budget: BudgetData
    let quickAdd: QuickAddData
}

struct ShoppingListData: Codable {
    let name: String
    let itemCount: Int
    let items: [ShoppingItem]
}

struct DealsData: Codable {
    let count: Int
    let topDeals: [Deal]
}

struct Deal: Codable {
    let store: String
    let discount: String
}

struct BudgetData: Codable {
    let spent: Double
    let remaining: Double
    let percentage: Double
}

struct QuickAddData: Codable {
    let recentItems: [String]
    let suggestions: [String]
}
```

#### Step 4: Create Native Module Bridge

Create `ios/WidgetBridge.swift`:

```swift
import Foundation

@objc(WidgetBridge)
class WidgetBridge: NSObject {
    
    @objc
    func updateWidgetData(_ appGroup: String, data: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        guard let sharedDefaults = UserDefaults(suiteName: appGroup) else {
            rejecter("ERROR", "Failed to access app group", nil)
            return
        }
        
        sharedDefaults.set(data, forKey: "widget_data")
        sharedDefaults.synchronize()
        
        resolver(true)
    }
    
    @objc
    func getWidgetData(_ appGroup: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        guard let sharedDefaults = UserDefaults(suiteName: appGroup) else {
            rejecter("ERROR", "Failed to access app group", nil)
            return
        }
        
        let data = sharedDefaults.string(forKey: "widget_data")
        resolver(data)
    }
    
    @objc
    func reloadAllTimelines(_ resolve: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
            resolve(true)
        } else {
            rejecter("ERROR", "Widgets require iOS 14+", nil)
        }
    }
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
}
```

Create `ios/WidgetBridge.m`:

```objc
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(WidgetBridge, NSObject)

RCT_EXTERN_METHOD(updateWidgetData:(NSString *)appGroup
                  data:(NSString *)data
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getWidgetData:(NSString *)appGroup
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(reloadAllTimelines:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
```

#### Step 5: Update from React Native

```typescript
import {widgetBridgeService} from './services/widgetBridge.service';

// Update shopping list widget
await widgetBridgeService.updateShoppingListWidget('Groceries', [
  {name: 'Milk', completed: false},
  {name: 'Bread', completed: true},
  {name: 'Eggs', completed: false},
]);
```

---

## 2️⃣ Siri Intents Extension - Voice Shortcuts

### What It Does:
- "Hey Siri, add milk to my shopping list"
- "Hey Siri, show my groceries"
- "Hey Siri, find deals near me"

### Implementation Steps:

#### Step 1: Create Intents Extension

**In Xcode:**
1. File → New → Target
2. Select "Intents Extension"
3. Name: `ShoppingIntents`
4. Click Finish

#### Step 2: Create Intent Definition

1. File → New → File → SiriKit Intent Definition File
2. Name: `Intents.intentdefinition`
3. Click "+" → Add Intent
4. Configure intents:
   - `AddItemIntent`
   - `ViewListIntent`
   - `FindDealsIntent`

#### Step 3: Implement Intent Handler

Create `ios/ShoppingIntents/IntentHandler.swift`:

```swift
import Intents

class IntentHandler: INExtension {
    
    override func handler(for intent: INIntent) -> Any {
        switch intent {
        case is AddItemIntent:
            return AddItemIntentHandler()
        case is ViewListIntent:
            return ViewListIntentHandler()
        case is FindDealsIntent:
            return FindDealsIntentHandler()
        default:
            fatalError("Unhandled intent type: \(intent)")
        }
    }
}

class AddItemIntentHandler: NSObject, AddItemIntentHandling {
    func handle(intent: AddItemIntent, completion: @escaping (AddItemIntentResponse) -> Void) {
        guard let itemName = intent.itemName else {
            completion(AddItemIntentResponse(code: .failure, userActivity: nil))
            return
        }
        
        // Add item to shared defaults
        let sharedDefaults = UserDefaults(suiteName: "group.com.mobiletodolist.widgets")
        var items = (sharedDefaults?.array(forKey: "pending_items") as? [String]) ?? []
        items.append(itemName)
        sharedDefaults?.set(items, forKey: "pending_items")
        
        let response = AddItemIntentResponse(code: .success, userActivity: nil)
        response.itemName = itemName
        completion(response)
    }
}
```

#### Step 4: Use in React Native

```typescript
import {siriBridgeService} from './services/siriBridge.service';

// Donate shortcut when user adds item
await siriBridgeService.donateAddItem('Milk', 'Groceries');

// Handle intent when Siri activates it
siriBridgeService.handleSiriIntent({
  type: 'addItem',
  parameters: {itemName: 'Milk', listName: 'Groceries'}
});
```

---

## 3️⃣ watchOS App - Apple Watch Companion

### Step 1: Add watchOS Target

1. File → New → Target → watchOS → Watch App
2. Name: `MobileTodoList Watch App`
3. Include Notification Scene: ✓

### Step 2: Create Watch Views

```swift
import SwiftUI

struct ContentView: View {
    @State private var items: [String] = []
    
    var body: some View {
        List(items, id: \.self) { item in
            Text(item)
        }
        .onAppear {
            loadItems()
        }
    }
    
    func loadItems() {
        // Load from WatchConnectivity
    }
}
```

---

## 4️⃣ Live Activities - Dynamic Island

### Implementation:

```swift
import ActivityKit

struct ShoppingSessionAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var itemsCollected: Int
        var totalItems: Int
        var currentStore: String
    }
    
    var sessionName: String
}

// Start Live Activity
let attributes = ShoppingSessionAttributes(sessionName: "Grocery Run")
let contentState = ShoppingSessionAttributes.ContentState(
    itemsCollected: 0,
    totalItems: 10,
    currentStore: "Whole Foods"
)

let activity = try? Activity<ShoppingSessionAttributes>.request(
    attributes: attributes,
    contentState: contentState
)
```

---

## 5️⃣ ARKit Integration

See separate guide: [ARKit_IMPLEMENTATION.md](ARKit_IMPLEMENTATION.md)

---

## 🧪 Testing

### Test Widgets:
1. Long press home screen → Add Widget → MobileTodoList
2. Update data from app
3. Widget should refresh automatically

### Test Siri:
1. Settings → Siri & Search → Shortcuts
2. Your shortcuts should appear
3. "Hey Siri, [your phrase]"

### Test Watch:
1. Pair Apple Watch with iPhone
2. Build watchOS scheme
3. App installs automatically

---

## 📚 Resources

- [WidgetKit Documentation](https://developer.apple.com/documentation/widgetkit)
- [SiriKit Documentation](https://developer.apple.com/documentation/sirikit)
- [ActivityKit Documentation](https://developer.apple.com/documentation/activitykit)
- [WatchKit Documentation](https://developer.apple.com/documentation/watchkit)

---

## ✅ Checklist

- [ ] WidgetKit extension created
- [ ] App Group configured
- [ ] Widget Bridge module working
- [ ] Siri Intents extension created
- [ ] Intent definitions configured
- [ ] watchOS target added
- [ ] Live Activities implemented
- [ ] All tested on device

---

**Estimated Time:** 40-60 hours for all extensions

**Priority Order:**
1. WidgetKit (highest user value)
2. Siri Shortcuts (great UX)
3. Live Activities (iOS 16+ only)
4. watchOS App (if Watch users)
5. ARKit (advanced feature)
