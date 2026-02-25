# Colors

[![npm](https://img.shields.io/npm/v/@pawells/colors)](https://www.npmjs.com/package/@pawells/colors)
[![GitHub Release](https://img.shields.io/github/v/release/PhillipAWells/colors)](https://github.com/PhillipAWells/colors/releases)
[![CI](https://github.com/PhillipAWells/colors/actions/workflows/ci.yml/badge.svg)](https://github.com/PhillipAWells/colors/actions/workflows/ci.yml)
[![Node](https://img.shields.io/badge/node-%3E%3D24-brightgreen)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![GitHub Sponsors](https://img.shields.io/github/sponsors/PhillipAWells?style=social)](https://github.com/sponsors/PhillipAWells)

TypeScript color space management and conversion library. ESM-only, no runtime dependencies, targets ES2022.

Supports 20+ color spaces with automatic conversion path finding, color interpolation, color scaling, and 150+ pre-defined W3C colors.

## Installation

```bash
npm install @pawells/colors
# or
yarn add @pawells/colors
```

## Usage

```typescript
import { Colors, ColorSpaces, ColorError } from '@pawells/colors';

// Create colors
const rgb = new ColorSpaces.RGB(1, 0, 0);       // Red (normalized 0-1)
const hsl = new ColorSpaces.HSL(0, 1, 0.5);     // Red in HSL

// Convert between any two color spaces
const lab = rgb.Convert(ColorSpaces.Lab);
const hct = rgb.Convert(ColorSpaces.HCT);

// Parse from hex
const orange = ColorSpaces.RGB.FromHex('#FF8000');

// String representations
console.log(rgb.ToString('hex'));  // "#ff0000"
console.log(rgb.ToString('int'));  // "RGB(255, 0, 0)"
console.log(hsl.ToString('int')); // "HSL(0°, 100%, 50%)"

// Access pre-defined W3C colors
const skyBlue = Colors.W3C.SkyBlue;
const tomato  = Colors.W3C.Tomato;

// Color interpolation
const mid = rgb.LERP(new ColorSpaces.RGB(0, 0, 1), 0.5); // 50% between red and blue

// Color scales / gradients
const scale = Colors.Scale(
  [Colors.W3C.Red, Colors.W3C.Blue],
  [0, 0.25, 0.5, 0.75, 1]
);
// scale[0.5] → color halfway between red and blue
```

## API

### `ColorSpaces` — Color Space Classes

All color space classes extend the `ColorSpace` base and share a common interface.

#### Common Methods (all color spaces)

| Method | Description |
|--------|-------------|
| `Convert<T>(format)` | Convert to any other color space |
| `LERP(color, t)` | Linear interpolation between two colors |
| `Clone()` | Deep clone the color instance |
| `ToString(format?)` | String representation |
| `ToArray()` | Returns component values as an array |
| `ToMatrix()` | Returns component values as a matrix |

#### Static Methods (all color spaces)

| Method | Description |
|--------|-------------|
| `ColorSpace.Assert(value)` | Assert the value is a `ColorSpace` instance (throws on failure) |
| `ColorSpace.Validate(value)` | Returns `true` if value is a valid `ColorSpace` |

#### Supported Color Spaces

| Class | Description | Components |
|-------|-------------|------------|
| `RGB` | Red, Green, Blue | r, g, b (0–1 normalized) |
| `HSL` | Hue, Saturation, Lightness | h (0–360°), s, l (0–1) |
| `HSV` | Hue, Saturation, Value | h (0–360°), s, v (0–1) |
| `CMY` | Cyan, Magenta, Yellow | c, m, y (0–1) |
| `CMYK` | Cyan, Magenta, Yellow, Black | c, m, y, k (0–1) |
| `Lab` | CIELAB perceptual | L* (0–100), a*, b* |
| `LCHab` | Cylindrical Lab | L, C, H |
| `Luv` | CIE Luv | L, u, v |
| `LCHuv` | Cylindrical Luv | L, C, H |
| `XYZ` | CIE XYZ device-independent | X, Y, Z |
| `Xyy` | CIE xyY chromaticity | x, y, Y |
| `HCT` | Material Design Hue-Chroma-Tone | h, c, t |
| `LMS` | Cone fundamentals | L, M, S |
| `HunterLab` | Hunter perceptual | L, a, b |
| `CAM16` | Color appearance model | view-condition-aware |
| `YCbCr` | Luma + chroma (BT.601 / BT.709) | Y, Cb, Cr |
| `YDbDr` | SECAM standard | Y, Db, Dr |
| `YIQ` | NTSC standard | Y, I, Q |
| `YPbPr` | Component video (BT.601 / BT.709 / BT.2020) | Y, Pb, Pr |
| `YUV` | Component video (BT.470 / BT.709) | Y, U, V |

#### `RGB` — Additional Static Methods

| Method | Description |
|--------|-------------|
| `RGB.FromHex(hex)` | Parse a hex color string (e.g. `#FF8000`) |
| `RGB.FromHSL(hsl)` | Convert from HSL |
| `RGB.FromHSV(hsv)` | Convert from HSV |
| `RGB.FromCMY(cmy)` | Convert from CMY |
| `RGB.FromCMYK(cmyk)` | Convert from CMYK |
| `RGB.FromXYZ(xyz)` | Convert from XYZ |
| `RGB.FromYCbCr(ycbcr)` | Convert from YCbCr |
| `RGB.FromYDbDr(ydbdr)` | Convert from YDbDr |
| `RGB.FromYIQ(yiq)` | Convert from YIQ |
| `RGB.FromYPbPr(ypbpr)` | Convert from YPbPr |
| `RGB.FromYUV(yuv)` | Convert from YUV |
| `RGB.FromHCT(hct)` | Convert from HCT |

---

### `Colors` — Utility Class

#### `Colors.W3C`

Pre-instantiated `RGB` instances for all standard CSS/W3C named colors (~150 colors).

```typescript
Colors.W3C.Black       // RGB(0, 0, 0)
Colors.W3C.White       // RGB(1, 1, 1)
Colors.W3C.Red         // RGB(1, 0, 0)
Colors.W3C.SkyBlue
Colors.W3C.HotPink
Colors.W3C.Tomato
// ... and ~145 more
```

#### `Colors.Scale<C>(color, values?)`

Create smooth color gradients by interpolating between colors.

```typescript
// From a single color
const scale = Colors.Scale(Colors.W3C.Red);

// From an array of colors (evenly spaced)
const scale = Colors.Scale([Colors.W3C.Red, Colors.W3C.Green, Colors.W3C.Blue]);

// From an array with explicit positions
const scale = Colors.Scale(
  [Colors.W3C.Red, Colors.W3C.Blue],
  [0, 0.25, 0.5, 0.75, 1]
);

// Returns TColorScale<C> = Record<number, C>
console.log(scale[0.5]); // Color at 50% position
```

---

### `ColorError`

Custom error class thrown for invalid component values, unsupported conversions, and other color operation failures.

---

## Development

```bash
yarn install        # Install dependencies
yarn build          # Compile TypeScript → ./build/
yarn dev            # Build + run
yarn watch          # Watch mode
yarn typecheck      # Type check without building
yarn lint           # ESLint
yarn lint:fix       # ESLint with auto-fix
yarn test           # Run tests
yarn test:ui        # Interactive Vitest UI
yarn test:coverage  # Tests with coverage report
```

## Requirements

- Node.js >= 24.0.0

## License

MIT — See [LICENSE](./LICENSE) for details.
