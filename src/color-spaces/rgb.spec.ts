import { RGB } from './rgb.js';
import { XYZ } from './xyz.js';
import { ColorError } from '../error.js';
import { ColorSpaces } from './index.js';

describe('Color RGB', () => {
	describe('constructor', () => {
		test('should create black color by default', () => {
			const color = new RGB();
			expect(color.R).toBe(0);
			expect(color.G).toBe(0);
			expect(color.B).toBe(0);
		});

		test('should create color with specified components', () => {
			const color = new RGB(0.5, 0.25, 0.75);
			expect(color.R).toBe(0.5);
			expect(color.G).toBe(0.25);
			expect(color.B).toBe(0.75);
		});

		test('should throw error for invalid component values', () => {
			expect(() => new RGB(-0.1, 0, 0)).toThrow('Channel(R) must be in range [0, 1].');
			expect(() => new RGB(0, 1.1, 0)).toThrow('Channel(G) must be in range [0, 1].');
			expect(() => new RGB(0, 0, NaN)).toThrow('Channel(B) must be in range [0, 1].');
		});
	});

	describe('component getters and setters', () => {
		let color: RGB;
		beforeEach(() => {
			color = new RGB(0.5, 0.5, 0.5);
		});

		test('should get component values correctly', () => {
			expect(color.R).toBe(0.5);
			expect(color.G).toBe(0.5);
			expect(color.B).toBe(0.5);
		});

		test('should set component values correctly', () => {
			color.R = 0.25;
			color.G = 0.75;
			color.B = 1;

			expect(color.R).toBe(0.25);
			expect(color.G).toBe(0.75);
			expect(color.B).toBe(1);
		});

		test('should throw error when setting invalid values', () => {
			expect(() => {
				color.R = -0.1;
			}).toThrow('Channel(R) must be in range [0, 1].');
			expect(() => {
				color.G = 1.1;
			}).toThrow('Channel(G) must be in range [0, 1].');
			expect(() => {
				color.B = NaN;
			}).toThrow('Channel(B) must be in range [0, 1].');
		});
	});

	describe('ToString', () => {
		const color = new RGB(1, 0.5, 0);
		test('should format as float by default', () => {
			expect(color.ToString()).toBe('RGB(1, 0.5, 0)');
		});

		test('should format as integers', () => {
			expect(color.ToString('int')).toBe('RGB(255, 128, 0)');
		});

		test('should format as hex', () => {
			expect(color.ToString('hex')).toBe('#ff8000');
		});
	});

	describe('Validate', () => {
		test('should return true for correct RGB color', () => {
			const color = new RGB(0.5, 0.5, 0.5);
			expect(RGB.Validate(color)).toBe(true);
		});

		test('should return false for non-RGB objects', () => {
			expect(RGB.Validate({})).toBe(false);
			expect(RGB.Validate(null)).toBe(false);
			expect(RGB.Validate(undefined)).toBe(false);
		});
	});

	describe('Color Space Conversions', () => {
		test('should convert to/from XYZ', () => {
			const rgb = new RGB(0.5, 0.25, 0.75);
			const xyz = rgb.Convert(ColorSpaces.XYZ);
			const converted = RGB.From(xyz);
			expect(converted.R).toBeCloseTo(rgb.R, 6);
			expect(converted.G).toBeCloseTo(rgb.G, 6);
			expect(converted.B).toBeCloseTo(rgb.B, 6);
		});

		test('should convert to/from HSL', () => {
			const rgb = new RGB(1, 0, 0); // Pure red
			const hsl = rgb.Convert(ColorSpaces.HSL);
			const converted = RGB.From(hsl);
			expect(converted.R).toBeCloseTo(1, 6);
			expect(converted.G).toBeCloseTo(0, 6);
			expect(converted.B).toBeCloseTo(0, 6);
		});

		test('should convert to/from HSV', () => {
			const rgb = new RGB(0, 1, 0); // Pure green
			const hsv = rgb.Convert(ColorSpaces.HSV);
			const converted = RGB.From(hsv);
			expect(converted.R).toBeCloseTo(0, 6);
			expect(converted.G).toBeCloseTo(1, 6);
			expect(converted.B).toBeCloseTo(0, 6);
		});

		test('should convert to/from CMYK', () => {
			const rgb = new RGB(0.5, 0.25, 0.75);
			const cmyk = rgb.Convert(ColorSpaces.CMYK);
			const converted = RGB.From(cmyk);
			expect(converted.R).toBeCloseTo(rgb.R, 7);
			expect(converted.G).toBeCloseTo(rgb.G, 7);
			expect(converted.B).toBeCloseTo(rgb.B, 7);
		});

		test('should convert to/from YCbCr (BT.601)', () => {
			const rgb = new RGB(0.5, 0.25, 0.75);
			const ycbcr = rgb.Convert(ColorSpaces.YCbCr);
			const converted = RGB.From(ycbcr);
			expect(converted.R).toBeCloseTo(rgb.R, 7);
			expect(converted.G).toBeCloseTo(rgb.G, 7);
			expect(converted.B).toBeCloseTo(rgb.B, 7);
		});

		test('should convert to/from YDbDr', () => {
			const rgb = new RGB(0.5, 0.25, 0.75);
			const ydbdr = rgb.Convert(ColorSpaces.YDbDr);
			const converted = RGB.From(ydbdr);
			expect(converted.R).toBeCloseTo(rgb.R, 7);
			expect(converted.G).toBeCloseTo(rgb.G, 7);
			expect(converted.B).toBeCloseTo(rgb.B, 7);
		});

		test('should convert to/from YIQ', () => {
			const rgb = new RGB(0.5, 0.25, 0.75);
			const yiq = rgb.Convert(ColorSpaces.YIQ);
			const converted = RGB.From(yiq);
			expect(converted.R).toBeCloseTo(rgb.R, 2);
			expect(converted.G).toBeCloseTo(rgb.G, 2);
			expect(converted.B).toBeCloseTo(rgb.B, 2);
		});

		test('should convert to/from YUV (BT.470)', () => {
			const rgb = new RGB(0.5, 0.25, 0.75);
			const yuv = rgb.Convert(ColorSpaces.YUV);
			const converted = RGB.From(yuv);
			expect(converted.R).toBeCloseTo(rgb.R, 0);
			expect(converted.G).toBeCloseTo(rgb.G, 0);
			expect(converted.B).toBeCloseTo(rgb.B, 0);
		});

		test('should convert to/from CMY', () => {
			const rgb = new RGB(0.5, 0.25, 0.75);
			const cmy = rgb.Convert(ColorSpaces.CMY);
			const converted = RGB.From(cmy);
			expect(converted.R).toBeCloseTo(rgb.R, 6);
			expect(converted.G).toBeCloseTo(rgb.G, 6);
			expect(converted.B).toBeCloseTo(rgb.B, 6);
		});

		test('should convert CMY to RGB using complementary formula', () => {
			// Test the direct complementary conversion: Red = 1 - Cyan, Green = 1 - Magenta, Blue = 1 - Yellow
			const testCases = [
				{ c: 0, m: 0, y: 0, expectedR: 1, expectedG: 1, expectedB: 1 }, // White
				{ c: 1, m: 1, y: 1, expectedR: 0, expectedG: 0, expectedB: 0 }, // Black
				{ c: 0, m: 1, y: 1, expectedR: 1, expectedG: 0, expectedB: 0 }, // Red
				{ c: 1, m: 0, y: 1, expectedR: 0, expectedG: 1, expectedB: 0 }, // Green
				{ c: 1, m: 1, y: 0, expectedR: 0, expectedG: 0, expectedB: 1 }, // Blue
				{ c: 0.5, m: 0.25, y: 0.75, expectedR: 0.5, expectedG: 0.75, expectedB: 0.25 }, // Mixed color
			];
			testCases.forEach(({ c, m, y, expectedR, expectedG, expectedB }) => {
				const cmy = new ColorSpaces.CMY(c, m, y);
				const rgb = RGB.From(cmy);
				expect(rgb.R).toBeCloseTo(expectedR, 6);
				expect(rgb.G).toBeCloseTo(expectedG, 6);
				expect(rgb.B).toBeCloseTo(expectedB, 6);
			});
		});

		test('should handle HSL hue sector edge cases', () => {
			// Test edge cases for hue sector calculations in HSL conversion
			const edgeCases = [
				{ r: 1, g: 0, b: 0 }, // Red (hue = 0°)
				{ r: 1, g: 1, b: 0 }, // Yellow (hue = 60°)
				{ r: 0, g: 1, b: 0 }, // Green (hue = 120°)
				{ r: 0, g: 1, b: 1 }, // Cyan (hue = 180°)
				{ r: 0, g: 0, b: 1 }, // Blue (hue = 240°)
				{ r: 1, g: 0, b: 1 }, // Magenta (hue = 300°)
				{ r: 0.5, g: 0.5, b: 0.5 }, // Gray (no hue)
			];
			edgeCases.forEach(({ r, g, b }) => {
				const rgb = new RGB(r, g, b);
				const hsl = rgb.Convert(ColorSpaces.HSL);
				const converted = RGB.From(hsl);
				expect(converted.R).toBeCloseTo(r, 6);
				expect(converted.G).toBeCloseTo(g, 6);
				expect(converted.B).toBeCloseTo(b, 6);
			});
		});

		test('should handle HSV hue sector edge cases', () => {
			// Test edge cases for hue sector calculations in HSV conversion
			const edgeCases = [
				{ r: 1, g: 0, b: 0 }, // Red (hue = 0°)
				{ r: 1, g: 1, b: 0 }, // Yellow (hue = 60°)
				{ r: 0, g: 1, b: 0 }, // Green (hue = 120°)
				{ r: 0, g: 1, b: 1 }, // Cyan (hue = 180°)
				{ r: 0, g: 0, b: 1 }, // Blue (hue = 240°)
				{ r: 1, g: 0, b: 1 }, // Magenta (hue = 300°)
				{ r: 0, g: 0, b: 0 }, // Black (no hue, value = 0)
			];
			edgeCases.forEach(({ r, g, b }) => {
				const rgb = new RGB(r, g, b);
				const hsv = rgb.Convert(ColorSpaces.HSV);
				const converted = RGB.From(hsv);
				expect(converted.R).toBeCloseTo(r, 6);
				expect(converted.G).toBeCloseTo(g, 6);
				expect(converted.B).toBeCloseTo(b, 6);
			});
		});

		test('should handle YCbCr conversion edge cases', () => {
			// Test edge cases for YCbCr conversions including boundary values
			const edgeCases = [
				{ r: 0, g: 0, b: 0 }, // Black
				{ r: 1, g: 1, b: 1 }, // White
				{ r: 1, g: 0, b: 0 }, // Pure red
				{ r: 0, g: 1, b: 0 }, // Pure green
				{ r: 0, g: 0, b: 1 }, // Pure blue
				{ r: 0.5, g: 0.5, b: 0.5 }, // Middle gray
			];
			edgeCases.forEach(({ r, g, b }) => {
				const rgb = new RGB(r, g, b);
				const ycbcr = rgb.Convert(ColorSpaces.YCbCr);
				const converted = RGB.From(ycbcr);
				expect(converted.R).toBeCloseTo(r, 5);
				expect(converted.G).toBeCloseTo(g, 5);
				expect(converted.B).toBeCloseTo(b, 5);
			});
		});

		test('should handle YUV conversion edge cases', () => {
			// Test edge cases for YUV conversions including boundary values
			const edgeCases = [
				{ r: 0, g: 0, b: 0 }, // Black
				{ r: 1, g: 1, b: 1 }, // White
				{ r: 1, g: 0, b: 0 }, // Pure red
				{ r: 0, g: 1, b: 0 }, // Pure green
				{ r: 0, g: 0, b: 1 }, // Pure blue
			];
			edgeCases.forEach(({ r, g, b }) => {
				const rgb = new RGB(r, g, b);
				const yuv = rgb.Convert(ColorSpaces.YUV);
				const converted = RGB.From(yuv);
				// YUV has lower precision as noted in existing tests
				expect(converted.R).toBeCloseTo(r, 0);
				expect(converted.G).toBeCloseTo(g, 0);
				expect(converted.B).toBeCloseTo(b, 0);
			});
		});

		test('should convert to/from YPbPr', () => {
			const rgb = new RGB(0.5, 0.25, 0.75);
			const ypbpr = rgb.Convert(ColorSpaces.YPbPr);
			const converted = RGB.From(ypbpr);
			expect(converted.R).toBeCloseTo(rgb.R, 5);
			expect(converted.G).toBeCloseTo(rgb.G, 5);
			expect(converted.B).toBeCloseTo(rgb.B, 5);
		});

		test('should throw error for unsupported From conversion', () => {
			class UnsupportedColorSpace extends ColorSpaces.ColorSpace {
				protected components: [number] = [0];

				constructor() {
					super();
				}

				public override ToArray(): number[] {
					return this.components;
				}

				public ToString(): string {
					return 'Unsupported';
				}
			}

			expect(() => RGB.From(new UnsupportedColorSpace() as any)).toThrow(new ColorError('Cannot convert to RGB'));
		});
	});

	describe('FromHex', () => {
		test('should parse 6-digit hex strings with # prefix', () => {
			const color = RGB.FromHex('#FF8000');
			expect(color.R).toBe(1);
			expect(color.G).toBeCloseTo(0.502, 3);
			expect(color.B).toBe(0);
		});

		test('should parse 6-digit hex strings without # prefix', () => {
			const color = RGB.FromHex('FF8000');
			expect(color.R).toBe(1);
			expect(color.G).toBeCloseTo(0.502, 3);
			expect(color.B).toBe(0);
		});

		test('should parse 3-digit hex strings with # prefix', () => {
			const color = RGB.FromHex('#F80');
			expect(color.R).toBe(1);
			expect(color.G).toBeCloseTo(0.533, 3); // 0x88 / 255
			expect(color.B).toBe(0);
		});

		test('should parse 3-digit hex strings without # prefix', () => {
			const color = RGB.FromHex('F80');
			expect(color.R).toBe(1);
			expect(color.G).toBeCloseTo(0.533, 3);
			expect(color.B).toBe(0);
		});

		test('should handle uppercase and lowercase hex digits', () => {
			const upper = RGB.FromHex('#FF8000');
			const lower = RGB.FromHex('#ff8000');
			expect(upper.R).toBe(lower.R);
			expect(upper.G).toBe(lower.G);
			expect(upper.B).toBe(lower.B);
		});

		test('should parse black and white correctly', () => {
			const black = RGB.FromHex('#000000');
			expect(black.R).toBe(0);
			expect(black.G).toBe(0);
			expect(black.B).toBe(0);

			const white = RGB.FromHex('#FFFFFF');
			expect(white.R).toBe(1);
			expect(white.G).toBe(1);
			expect(white.B).toBe(1);
		});

		test('should throw error for invalid hex strings', () => {
			expect(() => RGB.FromHex('')).toThrow('Invalid hex color format');
			expect(() => RGB.FromHex('#')).toThrow('Invalid hex color format');
			expect(() => RGB.FromHex('#12')).toThrow('Invalid hex color format');
			expect(() => RGB.FromHex('#12345')).toThrow('Invalid hex color format');
			expect(() => RGB.FromHex('#GGGGGG')).toThrow('Invalid hex color format');
			expect(() => RGB.FromHex('invalid')).toThrow('Invalid hex color format');
		});

		test('should throw error for non-string input', () => {
			expect(() => RGB.FromHex(123 as any)).toThrow('Hex string must be a string');
			expect(() => RGB.FromHex(null as any)).toThrow('Hex string must be a string');
			expect(() => RGB.FromHex(undefined as any)).toThrow('Hex string must be a string');
		});
	});

	describe('From (with hex string support)', () => {
		test('should accept hex strings', () => {
			const color = RGB.From('#FF8000');
			expect(color.R).toBe(1);
			expect(color.G).toBeCloseTo(0.502, 3);
			expect(color.B).toBe(0);
		});

		test('should still accept color space instances', () => {
			const xyz = new XYZ(0.5, 0.4, 0.3);
			const rgb = RGB.From(xyz);
			expect(rgb).toBeInstanceOf(RGB);
		});
	});

	describe('Clone method', () => {
		test('should create a new RGB instance with same values', () => {
			const original = new RGB(0.8, 0.4, 0.2);
			const cloned = original.Clone();
			expect(cloned).toBeInstanceOf(RGB);
			expect(cloned).not.toBe(original);
			expect(cloned.R).toBe(original.R);
			expect(cloned.G).toBe(original.G);
			expect(cloned.B).toBe(original.B);
		});

		test('should create independent instances', () => {
			const original = new RGB(0.5, 0.5, 0.5);
			const cloned = original.Clone();
			// Modify the cloned instance
			cloned.R = 1.0;
			cloned.G = 0.0;
			cloned.B = 0.0;

			// Original should remain unchanged
			expect(original.R).toBe(0.5);
			expect(original.G).toBe(0.5);
			expect(original.B).toBe(0.5);

			// Cloned should have new values
			expect(cloned.R).toBe(1.0);
			expect(cloned.G).toBe(0.0);
			expect(cloned.B).toBe(0.0);
		});

		test('should preserve component array values', () => {
			const original = new RGB(0.25, 0.75, 0.95);
			const cloned = original.Clone();
			expect(cloned.ToArray()).toEqual(original.ToArray());
			expect(cloned.ToArray()).toEqual([0.25, 0.75, 0.95]);
		});

		test('should work with boundary values', () => {
			const black = new RGB(0, 0, 0);
			const white = new RGB(1, 1, 1);

			const clonedBlack = black.Clone();
			const clonedWhite = white.Clone();
			expect(clonedBlack.ToArray()).toEqual([0, 0, 0]);
			expect(clonedWhite.ToArray()).toEqual([1, 1, 1]);
		});

		test('should return correct type', () => {
			const original = new RGB(0.3, 0.6, 0.9);
			const cloned = original.Clone();
			// TypeScript type check
			expect(cloned).toBeInstanceOf(RGB);
			// Runtime type check
			expect(cloned.constructor).toBe(RGB);
		});
	});
});
