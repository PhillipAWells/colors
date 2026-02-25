import { YPbPr } from './ypbpr.js';
import { RGB } from './rgb.js';

describe('Color YPbPr', () => {
	describe('Constructor and Component Access', () => {
		test('should create a black color with default constructor', () => {
			const color = new YPbPr();
			expect(color.Y).toBe(0);
			expect(color.Pb).toBe(0);
			expect(color.Pr).toBe(0);
			expect(color.Standard).toBe('BT2020'); // Default standard
		});

		test('should initialize with provided values', () => {
			const color = new YPbPr(0.5, 0.3, -0.2, 'BT709');
			expect(color.Y).toBe(0.5);
			expect(color.Pb).toBe(0.3);
			expect(color.Pr).toBe(-0.2);
			expect(color.Standard).toBe('BT709');
		});

		test('should correctly set and get Y component', () => {
			const color = new YPbPr();
			color.Y = 0.7;
			expect(color.Y).toBe(0.7);
		});

		test('should correctly set and get Pb component', () => {
			const color = new YPbPr();
			color.Pb = 0.4;
			expect(color.Pb).toBe(0.4);
		});

		test('should correctly set and get Pr component', () => {
			const color = new YPbPr();
			color.Pr = -0.3;
			expect(color.Pr).toBe(-0.3);
		});
	});

	describe('Component Validation', () => {
		test('should throw error when Y is less than 0', () => {
			const color = new YPbPr();
			expect(() => {
				color.Y = -0.1;
			}).toThrow('Channel(Y) must be in range [0, 1].');
		});

		test('should throw error when Y is greater than 1', () => {
			const color = new YPbPr();
			expect(() => {
				color.Y = 1.1;
			}).toThrow('Channel(Y) must be in range [0, 1].');
		});

		test('should throw error when Pb is less than -0.5', () => {
			const color = new YPbPr();
			expect(() => {
				color.Pb = -0.6;
			}).toThrow('Channel(Pb) must be in range [-0.5, 0.5].');
		});

		test('should throw error when Pb is greater than 0.5', () => {
			const color = new YPbPr();
			expect(() => {
				color.Pb = 0.6;
			}).toThrow('Channel(Pb) must be in range [-0.5, 0.5].');
		});

		test('should throw error when Pr is less than -0.5', () => {
			const color = new YPbPr();
			expect(() => {
				color.Pr = -0.6;
			}).toThrow('Channel(Pr) must be in range [-0.5, 0.5].');
		});

		test('should throw error when Pr is greater than 0.5', () => {
			const color = new YPbPr();
			expect(() => {
				color.Pr = 0.6;
			}).toThrow('Channel(Pr) must be in range [-0.5, 0.5].');
		});
	});

	describe('Static Validation Method', () => {
		test('should validate a valid YPbPr color without throwing', () => {
			const color = new YPbPr(0.5, 0.2, -0.2);
			expect(YPbPr.Validate(color)).toBe(true);
		});

		test('should return false for non-YPbPr object', () => {
			expect(YPbPr.Validate({})).toBe(false);
		});

		test('should return false for NaN in Y component', () => {
			const color = new YPbPr(0.5, 0.2, -0.2);

			Object.defineProperty(color, 'Y', { get: function Get() {
				return NaN;
			} });
			expect(YPbPr.Validate(color)).toBe(false);
		});

		test('should return false for NaN in Pb component', () => {
			const color = new YPbPr(0.5, 0.2, -0.2);

			Object.defineProperty(color, 'Pb', { get: function Get() {
				return NaN;
			} });
			expect(YPbPr.Validate(color)).toBe(false);
		});

		test('should return false for NaN in Pr component', () => {
			const color = new YPbPr(0.5, 0.2, -0.2);

			Object.defineProperty(color, 'Pr', { get: function Get() {
				return NaN;
			} });
			expect(YPbPr.Validate(color)).toBe(false);
		});
	});

	describe('Static Assert Method', () => {
		test('should not throw for valid YPbPr color', () => {
			const color = new YPbPr(0.5, 0.2, -0.2);
			expect(() => YPbPr.Assert(color)).not.toThrow();
		});

		test('should throw for non-YPbPr object', () => {
			expect(() => YPbPr.Assert({})).toThrow('Not a YPbPr Color');
		});

		test('should throw for NaN in Y component', () => {
			const color = new YPbPr(0.5, 0.2, -0.2);

			Object.defineProperty(color, 'Y', { get: function Get() {
				return NaN;
			} });
			expect(() => YPbPr.Assert(color)).toThrow('Channel(Y) must be in range [0, 1].');
		});

		test('should throw for NaN in Pb component', () => {
			const color = new YPbPr(0.5, 0.2, -0.2);

			Object.defineProperty(color, 'Pb', { get: function Get() {
				return NaN;
			} });
			expect(() => YPbPr.Assert(color)).toThrow('Channel(Pb) must be in range [-0.5, 0.5].');
		});

		test('should throw for NaN in Pr component', () => {
			const color = new YPbPr(0.5, 0.2, -0.2);

			Object.defineProperty(color, 'Pr', { get: function Get() {
				return NaN;
			} });
			expect(() => YPbPr.Assert(color)).toThrow('Channel(Pr) must be in range [-0.5, 0.5].');
		});
	});

	describe('Setter validation for non-finite values', () => {
		test('should throw ColorError for non-finite values in setters', () => {
			const color = new YPbPr();
			// Test Y setter
			expect(() => color.Y = Number.NaN).toThrow('Channel(Y) must be in range [0, 1].');
			expect(() => color.Y = Number.POSITIVE_INFINITY).toThrow('Channel(Y) must be in range [0, 1].');
			expect(() => color.Y = Number.NEGATIVE_INFINITY).toThrow('Channel(Y) must be in range [0, 1].');

			// Test Pb setter
			expect(() => color.Pb = Number.NaN).toThrow('Channel(Pb) must be in range [-0.5, 0.5].');
			expect(() => color.Pb = Number.POSITIVE_INFINITY).toThrow('Channel(Pb) must be in range [-0.5, 0.5].');
			expect(() => color.Pb = Number.NEGATIVE_INFINITY).toThrow('Channel(Pb) must be in range [-0.5, 0.5].');

			// Test Pr setter
			expect(() => color.Pr = Number.NaN).toThrow('Channel(Pr) must be in range [-0.5, 0.5].');
			expect(() => color.Pr = Number.POSITIVE_INFINITY).toThrow('Channel(Pr) must be in range [-0.5, 0.5].');
			expect(() => color.Pr = Number.NEGATIVE_INFINITY).toThrow('Channel(Pr) must be in range [-0.5, 0.5].');
		});
	});

	describe('ToString Method', () => {
		test('should return correct string representation', () => {
			const color = new YPbPr(0.3, 0.1, -0.2);
			expect(color.ToString()).toBe('YPbPr(0.3, 0.1, -0.2)');
		});
	});

	describe('FromRGB Conversion', () => {
		test('should correctly convert from RGB using BT601 standard', () => {
			// Create a known RGB color using the BT601 standard
			const rgb = new RGB(0.5, 0.5, 0.5);

			// Convert to YPbPr
			const ypbpr = YPbPr.FromRGB(rgb, 'BT601');			// BT601 matrix should convert mid-gray to Y=0.5, Pb=0, Pr=0
			expect(ypbpr.Y).toBeCloseTo(0.5, 5);
			expect(ypbpr.Pb).toBeCloseTo(0, 5);
			expect(ypbpr.Pr).toBeCloseTo(0, 5);
			expect(ypbpr.Standard).toBe('BT601');
		});

		test('should correctly convert from RGB using BT709 standard', () => {
			// Create a known RGB color using the BT709 standard
			const rgb = new RGB(1, 0, 0); // Pure red

			// Convert to YPbPr
			const ypbpr = YPbPr.FromRGB(rgb, 'BT709');			// Expected values for pure red in BT709
			expect(ypbpr.Y).toBeCloseTo(0.2126, 4); // Luma component for red
			expect(ypbpr.Pb).toBeCloseTo(-0.1146, 4); // Blue-difference for red
			expect(ypbpr.Pr).toBeCloseTo(0.5, 4); // Red-difference for red
			expect(ypbpr.Standard).toBe('BT709');
		});

		test('should correctly convert from RGB using BT2020 standard', () => {
			// Create a known RGB color using the BT2020 standard
			const rgb = new RGB(0, 1, 0); // Pure green

			// Convert to YPbPr
			const ypbpr = YPbPr.FromRGB(rgb, 'BT2020');			// Expected values for pure green in BT2020
			expect(ypbpr.Y).toBeCloseTo(0.6780, 4); // Luma component for green
			expect(ypbpr.Pb).toBeCloseTo(-0.3604, 4); // Blue-difference for green
			expect(ypbpr.Pr).toBeCloseTo(-0.4598, 4); // Red-difference for green
			expect(ypbpr.Standard).toBe('BT2020');
		});

		test('should handle the RGB to YPbPr conversion for black color', () => {
			const rgb = new RGB(0, 0, 0);
			const ypbpr = YPbPr.FromRGB(rgb);
			expect(ypbpr.Y).toBeCloseTo(0, 5);
			expect(ypbpr.Pb).toBeCloseTo(0, 5);
			expect(ypbpr.Pr).toBeCloseTo(0, 5);
		});

		test('should handle the RGB to YPbPr conversion for white color', () => {
			const rgb = new RGB(1, 1, 1);
			const ypbpr = YPbPr.FromRGB(rgb);
			expect(ypbpr.Y).toBeCloseTo(1, 5);
			expect(ypbpr.Pb).toBeCloseTo(0, 5);
			expect(ypbpr.Pr).toBeCloseTo(0, 5);
		});

		test('should throw error for unrecognized standard', () => {
			// Create an RGB object with invalid standard using Object.defineProperty
			const rgb = new RGB(0.5, 0.5, 0.5);
			// @ts-expect-error - Testing invalid standard
			expect(() => YPbPr.FromRGB(rgb, 'INVALID')).toThrow('Unrecognized YPbPr Standard');
		});
	});

	describe('From Generic Conversion', () => {
		test('should convert from RGB using From method', () => {
			const rgb = new RGB(0.2, 0.4, 0.6);
			const ypbpr = YPbPr.From(rgb);			// Verify conversion happened correctly
			expect(ypbpr).toBeInstanceOf(YPbPr);
			expect(ypbpr.Standard).toBe('BT2020'); // Default standard
		});
	});

	describe('Matrix Transformation Accuracy', () => {
		test('should use correct BT601 transformation matrix', () => {
			// Red in RGB
			const rgb = new RGB(1, 0, 0);
			const ypbpr = YPbPr.FromRGB(rgb, 'BT601');
			expect(ypbpr.Y).toBeCloseTo(0.299, 5);
			expect(ypbpr.Pb).toBeCloseTo(-0.168736, 5);
			expect(ypbpr.Pr).toBeCloseTo(0.5, 5);
		});

		test('should use correct BT709 transformation matrix', () => {
			// Green in RGB
			const rgb = new RGB(0, 1, 0);
			const ypbpr = YPbPr.FromRGB(rgb, 'BT709');
			expect(ypbpr.Y).toBeCloseTo(0.7152, 5);
			expect(ypbpr.Pb).toBeCloseTo(-0.385428, 5);
			expect(ypbpr.Pr).toBeCloseTo(-0.454153, 5);
		});

		test('should use correct BT2020 transformation matrix', () => {
			// Blue in RGB
			const rgb = new RGB(0, 0, 1);
			const ypbpr = YPbPr.FromRGB(rgb, 'BT2020');
			expect(ypbpr.Y).toBeCloseTo(0.0593, 5);
			expect(ypbpr.Pb).toBeCloseTo(0.5, 5);
			expect(ypbpr.Pr).toBeCloseTo(-0.04022, 5);
		});
	});
	describe('Clone method', () => {
		it('should create a new YPbPr instance with same values', () => {
			const original = new YPbPr(0.5, 0.3, -0.2, 'BT709');
			const cloned = original.Clone();
			expect(cloned).toBeInstanceOf(YPbPr);
			expect(cloned).not.toBe(original);
			expect(cloned.Y).toBe(original.Y);
			expect(cloned.Pb).toBe(original.Pb);
			expect(cloned.Pr).toBe(original.Pr);
			expect(cloned.Standard).toBe(original.Standard);
		});

		it('should create independent instances', () => {
			const original = new YPbPr(0.1, 0.2, 0.3);
			const cloned = original.Clone();
			cloned.Y = 0.9;
			cloned.Pb = -0.4;
			cloned.Pr = 0.4;
			expect(original.Y).toBe(0.1);
			expect(original.Pb).toBe(0.2);
			expect(original.Pr).toBe(0.3);
			expect(cloned.Y).toBe(0.9);
			expect(cloned.Pb).toBe(-0.4);
			expect(cloned.Pr).toBe(0.4);
		});

		it('should preserve the component array values', () => {
			const original = new YPbPr(0.4, 0.5, -0.5);
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

			for (const [y, pb, pr] of values) {
				const original = new YPbPr(y, pb, pr);
				const cloned = original.Clone();
				expect(cloned.Y).toBe(y);
				expect(cloned.Pb).toBe(pb);
				expect(cloned.Pr).toBe(pr);
			}
		});

		it('should return correct type', () => {
			const original = new YPbPr(0.1, 0.2, 0.3);
			const cloned = original.Clone();
			expect(cloned).toBeInstanceOf(YPbPr);
		});
	});
});
