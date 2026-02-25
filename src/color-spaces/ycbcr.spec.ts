import { YCbCr } from './ycbcr.js';
import { RGB } from './rgb.js';
import { ColorError } from '../error.js';

describe('Color YCbCr', () => {
	describe('Constructor and Validation', () => {
		test('should create default YCbCr color with BT.709 standard', () => {
			const color = new YCbCr();
			expect(color.Y).toBe(0);
			expect(color.Cb).toBe(0);
			expect(color.Cr).toBe(0);
			expect(color.Standard).toBe('BT709');
		});

		test('should create YCbCr with specified values using BT.709', () => {
			const color = new YCbCr(0.5, 0.25, -0.25);
			expect(color.Y).toBe(0.5);
			expect(color.Cb).toBe(0.25);
			expect(color.Cr).toBe(-0.25);
			expect(color.Standard).toBe('BT709');
		});

		test('should create YCbCr with BT.601 standard', () => {
			const color = new YCbCr(0.5, 0.25, -0.25, 'BT601');
			expect(color.Y).toBe(0.5);
			expect(color.Cb).toBe(0.25);
			expect(color.Cr).toBe(-0.25);
			expect(color.Standard).toBe('BT601');
		});

		test('should throw for invalid initial values', () => {
			expect(() => new YCbCr(Number.NaN, 0, 0)).toThrow(new ColorError('Channel(Y) must be in range [0, 1].'));
			expect(() => new YCbCr(0, Number.NaN, 0)).toThrow(new ColorError('Channel(Cb) must be in range [-0.5, 0.5].'));
			expect(() => new YCbCr(0, 0, Number.NaN)).toThrow(new ColorError('Channel(Cr) must be in range [-0.5, 0.5].'));

			expect(() => new YCbCr(-0.1, 0, 0)).toThrow(new ColorError('Channel(Y) must be in range [0, 1].'));
			expect(() => new YCbCr(1.1, 0, 0)).toThrow(new ColorError('Channel(Y) must be in range [0, 1].'));
			expect(() => new YCbCr(0, -0.6, 0)).toThrow(new ColorError('Channel(Cb) must be in range [-0.5, 0.5].'));
			expect(() => new YCbCr(0, 0.6, 0)).toThrow(new ColorError('Channel(Cb) must be in range [-0.5, 0.5].'));
			expect(() => new YCbCr(0, 0, -0.6)).toThrow(new ColorError('Channel(Cr) must be in range [-0.5, 0.5].'));
			expect(() => new YCbCr(0, 0, 0.6)).toThrow(new ColorError('Channel(Cr) must be in range [-0.5, 0.5].'));
		});
	});

	describe('Getters and Setters', () => {
		test('should set and get components correctly', () => {
			const color = new YCbCr();
			color.Y = 1;
			color.Cb = -0.5;
			color.Cr = 0.5;
			expect(color.Y).toBe(1);
			expect(color.Cb).toBe(-0.5);
			expect(color.Cr).toBe(0.5);
		});

		test('should throw on invalid sets', () => {
			const color = new YCbCr();
			expect(() => {
				color.Y = -0.1;
			}).toThrow(new ColorError('Channel(Y) must be in range [0, 1].'));
			expect(() => {
				color.Y = 1.1;
			}).toThrow(new ColorError('Channel(Y) must be in range [0, 1].'));
			expect(() => {
				color.Cb = -0.6;
			}).toThrow(new ColorError('Channel(Cb) must be in range [-0.5, 0.5].'));
			expect(() => {
				color.Cb = 0.6;
			}).toThrow(new ColorError('Channel(Cb) must be in range [-0.5, 0.5].'));
			expect(() => {
				color.Cr = -0.6;
			}).toThrow(new ColorError('Channel(Cr) must be in range [-0.5, 0.5].'));
			expect(() => {
				color.Cr = 0.6;
			}).toThrow(new ColorError('Channel(Cr) must be in range [-0.5, 0.5].'));
		});

		test('should maintain standard value after component changes', () => {
			const color = new YCbCr(0, 0, 0, 'BT601');
			color.Y = 0.5;
			color.Cb = 0.2;
			color.Cr = -0.2;
			expect(color.Standard).toBe('BT601');
		});
	});

	describe('String Representation', () => {
		test('should return correct string', () => {
			const color = new YCbCr(0.1, 0.2, 0.3);
			expect(color.ToString()).toBe('YCbCr(0.1, 0.2, 0.3)');
		});
	});

	describe('Static Validate', () => {
		test('should return false for invalid validate input', () => {
			expect(YCbCr.Validate({} as any)).toBe(false);
		});

		test('should validate correct YCbCr color', () => {
			const color = new YCbCr(0.5, 0.2, -0.2);
			expect(() => YCbCr.Validate(color)).not.toThrow();
		});
	});

	describe('Color Space Conversion', () => {
		describe('RGB to YCbCr', () => {
			test('should convert pure red RGB to YCbCr using BT.709', () => {
				const rgb = new RGB(1, 0, 0);
				const ycbcr = YCbCr.From(rgb);
				expect(ycbcr.Y).toBeCloseTo(0.2126, 4);
				expect(ycbcr.Cb).toBeCloseTo(-0.1146, 4);
				expect(ycbcr.Cr).toBeCloseTo(0.5, 4);
				expect(ycbcr.Standard).toBe('BT709');
			});

			test('should convert pure green RGB to YCbCr using BT.709', () => {
				const rgb = new RGB(0, 1, 0);
				const ycbcr = YCbCr.From(rgb);
				expect(ycbcr.Y).toBeCloseTo(0.7152, 4);
				expect(ycbcr.Cb).toBeCloseTo(-0.3854, 4);
				expect(ycbcr.Cr).toBeCloseTo(-0.4542, 4);
				expect(ycbcr.Standard).toBe('BT709');
			});

			test('should convert pure blue RGB to YCbCr using BT.709', () => {
				const rgb = new RGB(0, 0, 1);
				const ycbcr = YCbCr.From(rgb);
				expect(ycbcr.Y).toBeCloseTo(0.0722, 4);
				expect(ycbcr.Cb).toBeCloseTo(0.5, 4);
				expect(ycbcr.Cr).toBeCloseTo(-0.0458, 4);
				expect(ycbcr.Standard).toBe('BT709');
			});

			test('should convert pure red RGB to YCbCr using BT.601', () => {
				const rgb = new RGB(1, 0, 0);
				const ycbcr = YCbCr.FromRGB(rgb, 'BT601');
				expect(ycbcr.Y).toBeCloseTo(0.299, 4);
				expect(ycbcr.Cb).toBeCloseTo(-0.1687, 4);
				expect(ycbcr.Cr).toBeCloseTo(0.5, 4);
				expect(ycbcr.Standard).toBe('BT601');
			});

			test('should convert white RGB to YCbCr', () => {
				const rgb = new RGB(1, 1, 1);
				const ycbcr = YCbCr.From(rgb);
				expect(ycbcr.Y).toBeCloseTo(1, 4);
				expect(ycbcr.Cb).toBeCloseTo(0, 4);
				expect(ycbcr.Cr).toBeCloseTo(0, 4);
			});

			test('should convert black RGB to YCbCr', () => {
				const rgb = new RGB(0, 0, 0);
				const ycbcr = YCbCr.From(rgb);
				expect(ycbcr.Y).toBeCloseTo(0, 4);
				expect(ycbcr.Cb).toBeCloseTo(0, 4);
				expect(ycbcr.Cr).toBeCloseTo(0, 4);
			});

			test('should throw for invalid RGB input', () => {
				expect(() => YCbCr.From({} as any)).toThrow(new ColorError('Not a RGB Color'));
			});
		});

		describe('FromRGB Method', () => {
			test('should apply gamma correction correctly', () => {
				const rgb = new RGB(0.04, 0.04, 0.04); // Test near the linear segment threshold
				const ycbcr = YCbCr.FromRGB(rgb);
				expect(ycbcr.Y).toBeCloseTo(0.00309, 4);
				expect(ycbcr.Cb).toBeCloseTo(0, 4);
				expect(ycbcr.Cr).toBeCloseTo(0, 4);
			});

			test('should handle RGB values at gamma correction threshold', () => {
				const rgb = new RGB(0.04045, 0.04045, 0.04045); // Exact threshold value
				const ycbcr = YCbCr.FromRGB(rgb);
				expect(ycbcr.Y).toBeCloseTo(0.00313, 4);
				expect(ycbcr.Cb).toBeCloseTo(0, 4);
				expect(ycbcr.Cr).toBeCloseTo(0, 4);
			});

			test('should throw for invalid RGB color', () => {
				expect(() => {
					const invalidRgb = new RGB(-1, 0, 0);
					YCbCr.FromRGB(invalidRgb);
				}).toThrow(ColorError);
			});
		});
	});
	describe('Clone method', () => {
		test('should create a new YCbCr instance with same values', () => {
			const original = new YCbCr(0.5, 0.25, -0.25, 'BT601');
			const cloned = original.Clone();
			expect(cloned).toBeInstanceOf(YCbCr);
			expect(cloned).not.toBe(original);
			expect(cloned.Y).toBe(original.Y);
			expect(cloned.Cb).toBe(original.Cb);
			expect(cloned.Cr).toBe(original.Cr);
			expect(cloned.Standard).toBe(original.Standard);
		});

		test('should create independent instances', () => {
			const original = new YCbCr(0.1, 0.2, 0.3);
			const cloned = original.Clone();
			cloned.Y = 0.9;
			cloned.Cb = -0.4;
			cloned.Cr = 0.4;
			expect(original.Y).toBe(0.1);
			expect(original.Cb).toBe(0.2);
			expect(original.Cr).toBe(0.3);
			expect(cloned.Y).toBe(0.9);
			expect(cloned.Cb).toBe(-0.4);
			expect(cloned.Cr).toBe(0.4);
		});

		test('should preserve the component array values', () => {
			const original = new YCbCr(0.4, 0.5, -0.5);
			const cloned = original.Clone();
			expect(cloned.GetComponentsForTesting()).not.toBe(original.GetComponentsForTesting());
			expect(cloned.GetComponentsForTesting()).toEqual(original.GetComponentsForTesting());
		});

		test('should clone correctly with boundary/extreme values', () => {
			const values = [
				[0, -0.5, -0.5],
				[1, 0.5, 0.5],
				[0.5, 0, 0],
				[Number.EPSILON, -0.5 + Number.EPSILON, 0.5 - Number.EPSILON],
			];

			for (const [y, cb, cr] of values) {
				const original = new YCbCr(y, cb, cr);
				const cloned = original.Clone();
				expect(cloned.Y).toBe(y);
				expect(cloned.Cb).toBe(cb);
				expect(cloned.Cr).toBe(cr);
			}
		});

		test('should return correct type', () => {
			const original = new YCbCr(0.1, 0.2, 0.3);
			const cloned = original.Clone();
			expect(cloned).toBeInstanceOf(YCbCr);
		});
	});
});
