# Qamar Performance Guide

## Bundle Size Targets
- Total bundle: < 30MB
- JavaScript bundle: < 5MB
- Assets: < 25MB

## Measuring Bundle Size
```bash
npm run bundle:analyze
```
Output shows total size, assets directory, and JS bundle breakdown.

## FlatList Optimizations (Applied)

### VerseReaderScreen
Already optimized with:
- `windowSize={7}` — render 7 viewport heights of content
- `maxToRenderPerBatch={10}` — render 10 items per JS frame
- `removeClippedSubviews` — unmount off-screen items

### HifzDashboardScreen
Uses `ScrollView` with `.slice(0, 5)` to limit due verses shown — no FlatList needed.

### Best Practices for New FlatLists
```typescript
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  // Performance props:
  maxToRenderPerBatch={8}
  windowSize={5}
  removeClippedSubviews={true}
  initialNumToRender={5}
  // If items have fixed height:
  getItemLayout={(data, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
/>
```

## Console.log Removal (Already Configured)

`babel.config.js` removes console.logs in production builds:
```javascript
process.env.NODE_ENV === "production" && [
  "transform-remove-console",
  { exclude: ["error", "warn"] },
]
```
`console.error` and `console.warn` are preserved in all environments.

## Launch Time Targets
- Target: < 2s on iPhone 12 / Pixel 5
- Hermes enabled via `newArchEnabled: true` in app.json (React Native new architecture)
- React 19 + React Compiler enabled via `experiments.reactCompiler: true`

## Profiling Tools
- **iOS:** Xcode Instruments → Time Profiler
- **Android:** Android Studio → CPU Profiler
- **React re-renders:** React DevTools Profiler (run `npx react-devtools`)
- **Bundle:** `npm run bundle:analyze`

## Asset Compression
Run when adding new PNG assets:
```bash
chmod +x scripts/compress-assets.sh
./scripts/compress-assets.sh
```
Compresses PNGs with pngquant at 65-80% quality (visually lossless).

## Hermes + React Compiler
Both enabled by default in Expo SDK 54 with `newArchEnabled: true`.
No additional configuration needed.
- Hermes: Bytecode compilation = faster startup, lower memory
- React Compiler: Automatic memoization = fewer re-renders
