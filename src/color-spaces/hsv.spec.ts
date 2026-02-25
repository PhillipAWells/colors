import { HSV } from './hsv.js';
import { RGB } from './rgb.js';
import { HSL } from './hsl.js';

describe('Color HSV', () => {
	describe('Constructor and Validation', () => {
		it('should create a HSV color with default values', () => {
			const color = new HSV();
			expect(color.H).toBe(0);
			expect(color.S).toBe(0);
			expect(color.V).toBe(0);
		});

		it('should create a HSV color with specified values', () => {
			const color = new HSV(180, 0.5, 0.75);
			expect(color.H).toBe(180);
			expect(color.S).toBe(0.5);
			expect(color.V).toBe(0.75);
		});

		it('should throw error when creating HSV with invalid values', () => {
			expect(() => new HSV(-1, 0, 0)).toThrow();
			expect(() => new HSV(361, 0, 0)).toThrow();
			expect(() => new HSV(0, -0.1, 0)).toThrow();
			expect(() => new HSV(0, 1.1, 0)).toThrow();
			expect(() => new HSV(0, 0, -0.1)).toThrow();
			expect(() => new HSV(0, 0, 1.1)).toThrow();
		});

		it('should validate HSV object correctly', () => {
			const color = new HSV(100, 0.3, 0.4);
			expect(HSV.Validate(color)).toBe(true);
			expect(HSV.Validate({})).toBe(false);

			color.GetComponentsForTesting()[0] = NaN;
			expect(HSV.Validate(color)).toBe(false);

			color.GetComponentsForTesting()[0] = 100;
			color.GetComponentsForTesting()[1] = 2;
			expect(HSV.Validate(color)).toBe(false);

			color.GetComponentsForTesting()[1] = 0.3;
			color.GetComponentsForTesting()[2] = Number.NaN;
			expect(HSV.Validate(color)).toBe(false);
		});
	});

	describe('Getters and Setters', () => {
		it('should set and get H correctly', () => {
			const color = new HSV();
			color.H = 360;
			expect(color.H).toBe(360);
			expect(() => {
				color.H = -1;
			}).toThrow();
			expect(() => {
				color.H = 361;
			}).toThrow();
		});

		it('should set and get S correctly', () => {
			const color = new HSV();
			color.S = 0.8;
			expect(color.S).toBe(0.8);
			expect(() => {
				color.S = -0.1;
			}).toThrow();
			expect(() => {
				color.S = 1.1;
			}).toThrow();
		});

		it('should set and get V correctly', () => {
			const color = new HSV();
			color.V = 0.6;
			expect(color.V).toBe(0.6);
			expect(() => {
				color.V = -0.1;
			}).toThrow();
			expect(() => {
				color.V = 1.1;
			}).toThrow();
		});
	});

	describe('String Representation', () => {
		it('should represent HSV in float by default', () => {
			const c = new HSV(120, 0.25, 0.5);
			expect(c.ToString()).toBe('HSV(120, 0.25, 0.5)');
		});

		it('should represent HSV in int format when specified', () => {
			const c = new HSV(120, 0.256, 0.754);
			expect(c.ToString('int')).toBe('HSV(120°, 26%, 75%)');
		});
	});

	describe('Conversion', () => {
		test('Convert from RGB', () => {
			// black
			const v1 = HSV.From(new RGB(0, 0, 0));
			expect(v1.H).toBe(0);
			expect(v1.S).toBe(0);
			expect(v1.V).toBe(0);

			// white
			const v2 = HSV.From(new RGB(1, 1, 1));
			expect(v2.H).toBe(0);
			expect(v2.S).toBe(0);
			expect(v2.V).toBe(1);

			// red
			const v3 = HSV.From(new RGB(1, 0, 0));
			expect(v3.H).toBe(0);
			expect(v3.S).toBe(1);
			expect(v3.V).toBe(1);

			// green
			const v4 = HSV.From(new RGB(0, 1, 0));
			expect(v4.H).toBe(120);
			expect(v4.S).toBe(1);
			expect(v4.V).toBe(1);

			// blue
			const v5 = HSV.From(new RGB(0, 0, 1));
			expect(v5.H).toBe(240);
			expect(v5.S).toBe(1);
			expect(v5.V).toBe(1);

			// arbitrary
			const v6 = HSV.From(new RGB(0.3, 0.6, 0.9));
			expect(v6.H).toBeCloseTo(210, 0);
			expect(v6.S).toBeCloseTo(0.6667, 4);
			expect(v6.V).toBe(0.9);
		});

		test('Convert from HSL', () => {
			// black
			const h1 = HSV.From(new HSL(0, 0, 0));
			expect(h1.H).toBe(0);
			expect(h1.S).toBe(0);
			expect(h1.V).toBe(0);

			// white
			const h2 = HSV.From(new HSL(0, 0, 1));
			expect(h2.H).toBe(0);
			expect(h2.S).toBe(0);
			expect(h2.V).toBe(1);

			// red
			const h3 = HSV.From(new HSL(0, 1, 0.5));
			expect(h3.H).toBe(0);
			expect(h3.S).toBe(1);
			expect(h3.V).toBe(1);

			// arbitrary
			const h4 = HSV.From(new HSL(120, 0.5, 0.4));
			expect(h4.H).toBe(120);
			expect(h4.S).toBeCloseTo(0.6667, 4);
			expect(h4.V).toBeCloseTo(0.6);
		});

		test('should throw when converting invalid type', () => {
			// @ts-expect-error: passing invalid object type to test error handling
			expect(() => HSV.From({})).toThrow('Cannot convert to HSV');
		});
	});

	describe('Clone method', () => {
		test('should create a new HSV instance with same values', () => {
			const original = new HSV(240, 0.8, 0.6);
			const cloned = original.Clone();
			expect(cloned).toBeInstanceOf(HSV);
			expect(cloned).not.toBe(original);
			expect(cloned.H).toBe(original.H);
			expect(cloned.S).toBe(original.S);
			expect(cloned.V).toBe(original.V);
		});

		test('should create independent instances', () => {
			const original = new HSV(120, 0.5, 0.4);
			const cloned = original.Clone();
			// Modify the cloned instance
			cloned.H = 360;
			cloned.S = 1.0;
			cloned.V = 0.8;

			// Original should remain unchanged
			expect(original.H).toBe(120);
			expect(original.S).toBe(0.5);
			expect(original.V).toBe(0.4);

			// Cloned should have new values
			expect(cloned.H).toBe(360);
			expect(cloned.S).toBe(1.0);
			expect(cloned.V).toBe(0.8);
		});

		test('should preserve component array values', () => {
			const original = new HSV(180, 0.75, 0.25);
			const cloned = original.Clone();
			expect(cloned.ToArray()).toEqual(original.ToArray());
			expect(cloned.ToArray()).toEqual([180, 0.75, 0.25]);
		});

		test('should work with boundary values', () => {
			const black = new HSV(0, 0, 0);
			const white = new HSV(0, 0, 1);
			const saturated = new HSV(360, 1, 0.5);

			const clonedBlack = black.Clone();
			const clonedWhite = white.Clone();
			const clonedSaturated = saturated.Clone();
			expect(clonedBlack.ToArray()).toEqual([0, 0, 0]);
			expect(clonedWhite.ToArray()).toEqual([0, 0, 1]);
			expect(clonedSaturated.ToArray()).toEqual([360, 1, 0.5]);
		});

		test('should return correct type', () => {
			const original = new HSV(90, 0.6, 0.3);
			const cloned = original.Clone();
			// TypeScript type check
			expect(cloned).toBeInstanceOf(HSV);
			// Runtime type check
			expect(cloned.constructor).toBe(HSV);
		});
	});
});
