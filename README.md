# react-native-nitro-view-shot

React Native view capture library built with Nitro Modules. Faster than traditional bridge-based solutions with synchronous capture support and zero serialization overhead.

[![Version](https://img.shields.io/npm/v/react-native-nitro-view-shot?style=for-the-badge)](https://www.npmjs.com/package/react-native-nitro-view-shot)
[![npm monthly](https://img.shields.io/npm/dm/react-native-nitro-view-shot?style=for-the-badge)](https://www.npmjs.com/package/react-native-nitro-view-shot)
[![Discord](https://img.shields.io/badge/Discord-Join%20Server-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/7KXUyHjz)
[![License](https://img.shields.io/npm/l/react-native-nitro-view-shot?style=for-the-badge)](https://github.com/patrickkabwe/react-native-nitro-view-shot/LICENSE)

## Features

- **Synchronous capture API** - Direct JSI calls without bridge serialization overhead
- **Multiple output formats** - Support for PNG, JPG, and WebP (WebP not supported on iOS)
- **Flexible output options** - File path or base64 string encoding
- **Automatic mount-time capture** - Capture views as soon as they're laid out
- **Efficient file management** - Automatic asynchronous cleanup of old captures
- **Lean native implementation** - Direct native rendering without extra view wrappers
- **Familiar API** - Similar to `react-native-view-shot` but optimized with Nitro Modules

## Requirements

- React Native v0.76.0 or higher
- Node 18.0.0 or higher

> [!IMPORTANT]  
> To support Nitro Views you need React Native v0.78.0 or higher.

## Installation

```bash
bun add react-native-nitro-view-shot react-native-nitro-modules
```

## Usage

### Capture on mount

```tsx
import NitroViewShot from 'react-native-nitro-view-shot'

export function MountCaptureExample() {
  return (
    <NitroViewShot
      options={{ fileName: 'welcome-card' }}
      captureMode="mount"
      onCapture={(path) => console.log('Captured to:', path)}
    >
      <View collapsable={false}>{/* ...content... */}</View>
    </NitroViewShot>
  )
}
```

### Manual capture via ref

```tsx
import NitroViewShot, { type NitroViewShotRef } from 'react-native-nitro-view-shot'

const Example = () => {
  const shotRef = useRef<NitroViewShotRef>(null)

  return (
    <>
      <NitroViewShot
        ref={shotRef}
        options={{ fileName: 'profile-card', output: 'base64' }}
        onCapture={(result) => console.log('Got capture:', result)}
      >
        <View collapsable={false}>{/* ... */}</View>
      </NitroViewShot>
      <Button
        title="Capture"
        onPress={() => {
          shotRef.current?.captureAsync({ fileName: 'profile-card', output: 'base64' })
        }}
      />
    </>
  )
}
```

### Capture an arbitrary ref

```tsx
import { captureRef } from 'react-native-nitro-view-shot'

const viewRef = useRef<View>(null)

const onPress = () => {
  const path = captureRef(viewRef, { fileName: 'inline-card' })
  console.log(path)
}

// In your render:
<View ref={viewRef} collapsable={false}>
  {/* ...content... */}
</View>
```

## API

**Component**

| Prop | Type | Description |
| --- | --- | --- |
| `options` | `ViewShotOptions` | Default options for captures. |
| `captureMode?` | `'mount' \| 'none'` | `mount` captures once layout is available; `none` requires manual trigger. |
| `onCapture?` | `(result: string) => void` | Called after each capture (async or sync). |

**Ref methods (`NitroViewShotRef`)**

| Method | Signature | Description |
| --- | --- | --- |
| `capture` | `(options?: ViewShotOptions) => string` | Synchronous capture; returns result immediately. |
| `captureAsync` | `(options?: ViewShotOptions) => Promise<string>` | Promise-based capture for async flows. |

**Top-level helpers**

| Function | Signature | Description |
| --- | --- | --- |
| `captureRef` | `(ref, options: ViewShotOptions) => string` | Synchronous capture of an arbitrary ref. |
| `captureRefAsync` | `(ref, options: ViewShotOptions) => Promise<string>` | Promise-based capture of an arbitrary ref. |

**ViewShotOptions**

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `fileName` | `string` | — | Required. Filename; extension inferred from `format` if missing. |
| `format` | `'png' \| 'jpg' \| 'webp'` | `png` | Image format (iOS does not support `webp`). |
| `quality` | `number` | `1.0` | `0.0`–`1.0`, used for JPG/WEBP. |
| `output` | `'file' \| 'base64'` | `file` | Where to deliver the capture. |

## Why NitroViewShot instead of react-native-view-shot?

React Native already has [react-native-view-shot](https://github.com/gre/react-native-view-shot). NitroViewShot keeps the familiar API shape but leans on Nitro modules/JSI for a faster, more predictable experience:

- **Synchronous capture option**: `capture` can return immediately because there is no legacy bridge hop; `react-native-view-shot` only exposes promise-based calls.
- **Capture as soon as views mount**: `captureMode: 'mount'` fires after layout without writing your own `onLayout`/`setTimeout` plumbing to avoid zero-size captures.
- **Lean native path**: Uses `UIGraphicsImageRenderer` on iOS and direct `Canvas` drawing on Android with no extra view wrappers beyond the component itself.

## Notes

- **Important for Android**: Add `collapsable={false}` to the View you want to capture. Android optimizes away views without children, which can cause capture failures. This prop prevents that optimization.
- Files are written to a `react-native-nitro-view-shot` cache folder inside the platform temp directory; old captures are automatically deleted asynchronously to keep storage clean.
- Mount captures wait for a non-zero layout before running to avoid invalid-size errors.
- File deletion happens asynchronously in the background, ensuring fast capture performance without blocking operations.

## License

MIT © Patrick Kabwe

## Credits

Bootstrapped with [create-nitro-module](https://github.com/patrickkabwe/create-nitro-module).

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

> 💬 For quick support, join our [Discord channel](https://discord.gg/7KXUyHjz)
