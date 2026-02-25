import { YUV } from './yuv.js';
import { RGB } from './rgb.js';
import { YIQ } from './yiq.js';
import { ColorError } from '../error.js';

describe('Color YUV', () => {
	describe('constructor', () => {
		test('should create black color by default', () => {
			const color = new YUV();
			expect(color.Y).toBe(0);
			expect(color.U).toBe(0);
			expect(color.V).toBe(0);
			expect(color.Standard).toBe('BT709');
		});

		test('should create color with specified components', () => {
			const color = new YUV(0.5, 0.25, -0.25);
			expect(color.Y).toBe(0.5);
			expect(color.U).toBe(0.25);
			expect(color.V).toBe(-0.25);
			expect(color.Standard).toBe('BT709');
		});

		test('should accept standard parameter', () => {
			const color = new YUV(0.5, 0.25, -0.25, 'BT470');
			expect(color.Y).toBe(0.5);
			expect(color.U).toBe(0.25);
			expect(color.V).toBe(-0.25);
			expect(color.Standard).toBe('BT470');
		});

		test('should throw error for invalid component values', () => {
			expect(() => new YUV(-0.1, 0, 0)).toThrow('Channel(Y) must be in range [0, 1]');
			expect(() => new YUV(1.1, 0, 0)).toThrow('Channel(Y) must be in range [0, 1]');
			expect(() => new YUV(0, -0.6, 0)).toThrow(new ColorError('Channel(U) must be in range [-0.5, 0.5]'));
			expect(() => new YUV(0, 0.6, 0)).toThrow(new ColorError('Channel(U) must be in range [-0.5, 0.5]'));
			expect(() => new YUV(0, 0, -0.6)).toThrow(new ColorError('Channel(V) must be in range [-0.5, 0.5]'));
			expect(() => new YUV(0, 0, 0.6)).toThrow(new ColorError('Channel(V) must be in range [-0.5, 0.5]'));
			expect(() => new YUV(0, NaN, 0)).toThrow(new ColorError('Channel(U) must be in range [-0.5, 0.5]'));
		});
	});

	describe('component getters and setters', () => {
		let color: YUV;
		beforeEach(() => {
			color = new YUV(0.5, 0.1, -0.1);
		});

		test('should get component values correctly', () => {
			expect(color.Y).toBe(0.5);
			expect(color.U).toBe(0.1);
			expect(color.V).toBe(-0.1);
		});

		test('should set component values correctly', () => {
			color.Y = 0.75;
			color.U = 0.3;
			color.V = -0.3;

			expect(color.Y).toBe(0.75);
			expect(color.U).toBe(0.3);
			expect(color.V).toBe(-0.3);
		});

		test('should throw error when setting invalid values', () => {
			expect(() => {
				color.Y = -0.1;
			}).toThrow(new ColorError('Channel(Y) must be in range [0, 1]'));

			expect(() => {
				color.Y = 1.1;
			}).toThrow(new ColorError('Channel(Y) must be in range [0, 1]'));

			expect(() => {
				color.U = -0.6;
			}).toThrow(new ColorError('Channel(U) must be in range [-0.5, 0.5]'));

			expect(() => {
				color.U = 0.6;
			}).toThrow(new ColorError('Channel(U) must be in range [-0.5, 0.5]'));

			expect(() => {
				color.V = -0.6;
			}).toThrow(new ColorError('Channel(V) must be in range [-0.5, 0.5]'));

			expect(() => {
				color.V = 0.6;
			}).toThrow(new ColorError('Channel(V) must be in range [-0.5, 0.5]'));

			expect(() => {
				color.Y = NaN;
			}).toThrow(new ColorError('Channel(Y) must be in range [0, 1]'));
		});
	});

	describe('ToString', () => {
		test('should format correctly', () => {
			const color = new YUV(0.5, 0.25, -0.25);
			expect(color.ToString()).toBe('YUV(0.5, 0.25, -0.25)');
		});
	});

	describe('Validate', () => {
		test('should validate correct YUV color', () => {
			const color = new YUV(0.5, 0.25, -0.25);
			expect(YUV.Validate(color)).toBe(true);
		});

		test('should return false for non-YUV objects', () => {
			expect(YUV.Validate({})).toBe(false);
			expect(YUV.Validate(null)).toBe(false);
			expect(YUV.Validate(undefined)).toBe(false);
		});

		test('should return false for invalid component values', () => {
			const makeColor = (y: number, u: number, v: number): any => {
				const color = new YUV(0.5, 0.1, 0.1);
				// Using as any to bypass type safety for testing
				Object.defineProperty(color, 'Y', { value: y });
				Object.defineProperty(color, 'U', { value: u });
				Object.defineProperty(color, 'V', { value: v });
				return color;
			};
			expect(YUV.Validate(makeColor(-0.1, 0, 0))).toBe(false);
			expect(YUV.Validate(makeColor(1.1, 0, 0))).toBe(false);
			expect(YUV.Validate(makeColor(0.5, -0.6, 0))).toBe(false);
			expect(YUV.Validate(makeColor(0.5, 0.6, 0))).toBe(false);
			expect(YUV.Validate(makeColor(0.5, 0, -0.6))).toBe(false);
			expect(YUV.Validate(makeColor(0.5, 0, 0.6))).toBe(false);
		});
	});

	describe('Assert', () => {
		test('should not throw for valid YUV color', () => {
			const color = new YUV(0.5, 0.25, -0.25);
			expect(() => YUV.Assert(color)).not.toThrow();
		});

		test('should throw for non-YUV objects', () => {
			expect(() => YUV.Assert({})).toThrow('Not a YUV Color');
			expect(() => YUV.Assert(null)).toThrow('Not a YUV Color');
			expect(() => YUV.Assert(undefined)).toThrow('Not a YUV Color');
		});

		test('should throw for invalid component values', () => {
			const color = new YUV(0.5, 0.1, 0.1);
			color.GetComponentsForTesting()[0] = Number.NaN;
			expect(() => YUV.Assert(color)).toThrow('Channel(Y) must be in range [0, 1]');
		});
	});

	describe('Setter validation for non-finite values', () => {
		test('should throw ColorError for non-finite values in setters', () => {
			const color = new YUV();
			// Test Y setter
			expect(() => color.Y = Number.NaN).toThrow('Channel(Y) must be in range [0, 1]');
			expect(() => color.Y = Number.POSITIVE_INFINITY).toThrow('Channel(Y) must be in range [0, 1]');
			expect(() => color.Y = Number.NEGATIVE_INFINITY).toThrow('Channel(Y) must be in range [0, 1]');

			// Test U setter
			expect(() => color.U = Number.NaN).toThrow('Channel(U) must be in range [-0.5, 0.5]');
			expect(() => color.U = Number.POSITIVE_INFINITY).toThrow('Channel(U) must be in range [-0.5, 0.5]');
			expect(() => color.U = Number.NEGATIVE_INFINITY).toThrow('Channel(U) must be in range [-0.5, 0.5]');

			// Test V setter
			expect(() => color.V = Number.NaN).toThrow('Channel(V) must be in range [-0.5, 0.5]');
			expect(() => color.V = Number.POSITIVE_INFINITY).toThrow('Channel(V) must be in range [-0.5, 0.5]');
			expect(() => color.V = Number.NEGATIVE_INFINITY).toThrow('Channel(V) must be in range [-0.5, 0.5]');
		});
	});

	describe('Color Space Conversions', () => {
		test('should convert from RGB with BT709 standard', () => {
			const rgb = new RGB(0.5, 0.25, 0.75); // Purple-ish color
			const yuv = YUV.From(rgb);
			expect(yuv.Standard).toBe('BT709');
			expect(yuv.Y).toBeGreaterThanOrEqual(0);
			expect(yuv.Y).toBeLessThanOrEqual(1);
			expect(yuv.U).toBeGreaterThanOrEqual(-0.5);
			expect(yuv.U).toBeLessThanOrEqual(0.5);
			expect(yuv.V).toBeGreaterThanOrEqual(-0.5);
			expect(yuv.V).toBeLessThanOrEqual(0.5);
		});

		test('should convert from RGB with BT470 standard', () => {
			const rgb = new RGB(0.5, 0.25, 0.75); // Purple-ish color
			const yuv = YUV.FromRGB(rgb, 'BT470');
			expect(yuv.Standard).toBe('BT470');
			expect(yuv.Y).toBeGreaterThanOrEqual(0);
			expect(yuv.Y).toBeLessThanOrEqual(1);
			expect(yuv.U).toBeGreaterThanOrEqual(-0.5);
			expect(yuv.U).toBeLessThanOrEqual(0.5);
			expect(yuv.V).toBeGreaterThanOrEqual(-0.5);
			expect(yuv.V).toBeLessThanOrEqual(0.5);
		});

		test('should convert from YIQ', () => {
			const yiq = new YIQ(0.5, 0.25, 0.25);
			const yuv = YUV.From(yiq);
			expect(yuv.Y).toBe(0.5); // Y value should be preserved
			expect(yuv.U).toBeGreaterThanOrEqual(-0.5);
			expect(yuv.U).toBeLessThanOrEqual(0.5);
			expect(yuv.V).toBeGreaterThanOrEqual(-0.5);
			expect(yuv.V).toBeLessThanOrEqual(0.5);
		});

		test('should preserve luminance when converting from RGB', () => {
			// Test with different RGB colors
			const testCases = [
				new RGB(0, 0, 0),     // Black
				new RGB(1, 1, 1),     // White
				new RGB(0.5, 0.5, 0.5), // Gray
				new RGB(1, 0, 0),     // Red
				new RGB(0, 1, 0),     // Green
				new RGB(0, 0, 1),      // Blue
			];

			for (const rgb of testCases) {
				const yuv = YUV.From(rgb);
				const calculatedY = (0.2126 * rgb.R) + (0.7152 * rgb.G) + (0.0722 * rgb.B); // BT709 luma
				expect(yuv.Y).toBeCloseTo(calculatedY, 4);
			}
		});

		test('should round-trip conversions with RGB and YIQ', () => {
			// Test conversion RGB -> YUV -> RGB
			const rgb = new RGB(0.7, 0.3, 0.5);
			const yuv = YUV.From(rgb);
			const rgb2 = RGB.FromYUV(yuv);
			expect(rgb2.R).toBeCloseTo(rgb.R, 0);
			expect(rgb2.G).toBeCloseTo(rgb.G, 0);
			expect(rgb2.B).toBeCloseTo(rgb.B, 0);

			// Test conversion YIQ -> YUV -> YIQ
			const yiq = new YIQ(0.6, 0.2, 0.1);
			const yuv2 = YUV.From(yiq);
			const yiq2 = YIQ.From(yuv2);
			expect(yiq2.Y).toBeCloseTo(yiq.Y, 4);
			expect(yiq2.I).toBeCloseTo(yiq.I, 4);
			expect(yiq2.Q).toBeCloseTo(yiq.Q, 4);
		});
	});
	describe('Clone method', () => {
		it('should create a new YUV instance with same values', () => {
			const original = new YUV(0.5, 0.3, -0.2, 'BT470');
			const cloned = original.Clone();
			expect(cloned).toBeInstanceOf(YUV);
			expect(cloned).not.toBe(original);
			expect(cloned.Y).toBe(original.Y);
			expect(cloned.U).toBe(original.U);
			expect(cloned.V).toBe(original.V);
			expect(cloned.Standard).toBe(original.Standard);
		});

		it('should create independent instances', () => {
			const original = new YUV(0.5, 0.1, 0.1);
			const cloned = original.Clone();
			expect(cloned.GetComponentsForTesting()).not.toBe(original.GetComponentsForTesting());
			expect(cloned.GetComponentsForTesting()).toEqual(original.GetComponentsForTesting());
		});

		it('should preserve the component array values', () => {
			const original = new YUV(0.4, 0.5, -0.5);
			const cloned = original.Clone();
			expect(cloned.GetComponentsForTesting()).not.toBe(original.GetComponentsForTesting());
			expect(cloned.GetComponentsForTesting()).toEqual(original.GetComponentsForTesting());
		});

		it('should clone correctly with boundary/extreme values', () => {
			const values = [
				[0, -0.5, -0.5],
				[1, 0.5, 0.5],
				[0.5, 0, 0],
				[Number.EPSILON, -0.5 + Number.EPSILON, 0.5 - Number.EPSILON],
			];

			for (const [y, u, v] of values) {
				const original = new YUV(y, u, v);
				const cloned = original.Clone();
				expect(cloned.Y).toBe(y);
				expect(cloned.U).toBe(u);
				expect(cloned.V).toBe(v);
			}
		});

		it('should return correct type', () => {
			const original = new YUV(0.1, 0.2, 0.3);
			const cloned = original.Clone();
			expect(cloned).toBeInstanceOf(YUV);
		});
	});
});
