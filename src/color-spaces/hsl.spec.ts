import { HSL } from './hsl.js';
import { RGB } from './rgb.js';
import { HSV } from './hsv.js';

describe('Color HSL', () => {
	describe('Constructor and Validation', () => {
		it('should create an HSL color with default values', () => {
			const color = new HSL();
			expect(color.H).toBe(0);
			expect(color.S).toBe(0);
			expect(color.L).toBe(0);
		});

		it('should create an HSL color with specified values', () => {
			const color = new HSL(180, 0.5, 0.75);
			expect(color.H).toBe(180);
			expect(color.S).toBe(0.5);
			expect(color.L).toBe(0.75);
		});

		it('should throw error when creating an HSL color with invalid values', () => {
			expect(() => new HSL(-1, 0.5, 0.5)).toThrow();
			expect(() => new HSL(361, 0.5, 0.5)).toThrow();
			expect(() => new HSL(0, -0.1, 0.5)).toThrow();
			expect(() => new HSL(0, 1.1, 0.5)).toThrow();
			expect(() => new HSL(0, 0.5, -0.1)).toThrow();
			expect(() => new HSL(0, 0.5, 1.1)).toThrow();
		});

		it('should validate an HSL color object correctly', () => {
			const color = new HSL(100, 0.3, 0.4);
			expect(HSL.Validate(color)).toBe(true);
			expect(HSL.Validate({})).toBe(false);

			const invalid = new HSL(100, 0.3, 0.4);
			invalid.GetComponentsForTesting()[0] = NaN;
			expect(HSL.Validate(invalid)).toBe(false);

			invalid.GetComponentsForTesting()[0] = 100;
			invalid.GetComponentsForTesting()[1] = 2;
			expect(HSL.Validate(invalid)).toBe(false);

			invalid.GetComponentsForTesting()[1] = 0.3;
			invalid.GetComponentsForTesting()[2] = -1;
			expect(HSL.Validate(invalid)).toBe(false);
		});
	});

	describe('Getters and Setters', () => {
		it('should set and get the H component correctly', () => {
			const color = new HSL();
			color.H = 360;
			expect(color.H).toBe(360);
			expect(() => {
				color.H = -1;
			}).toThrow();
			expect(() => {
				color.H = 361;
			}).toThrow();
		});

		it('should set and get the S component correctly', () => {
			const color = new HSL();
			color.S = 0.8;
			expect(color.S).toBe(0.8);
			expect(() => {
				color.S = -0.1;
			}).toThrow();
			expect(() => {
				color.S = 1.1;
			}).toThrow();
		});

		it('should set and get the L component correctly', () => {
			const color = new HSL();
			color.L = 0.2;
			expect(color.L).toBe(0.2);
			expect(() => {
				color.L = -0.1;
			}).toThrow();
			expect(() => {
				color.L = 1.1;
			}).toThrow();
		});
	});

	describe('String Representation', () => {
		it('should represent HSL in float format by default', () => {
			const c = new HSL(200, 0.25, 0.5);
			expect(c.ToString()).toBe('HSL(200, 0.25, 0.5)');
		});

		it('should represent HSL in int format when specified', () => {
			const c = new HSL(200, 0.255, 0.755);
			expect(c.ToString('int')).toBe('HSL(200°, 26%, 76%)');
		});
	});

	describe('Conversion', () => {
		test('Convert from RGB', () => {
			// black
			const h1 = HSL.From(new RGB(0, 0, 0));
			expect(h1.H).toBe(0);
			expect(h1.S).toBe(0);
			expect(h1.L).toBe(0);

			// white
			const h2 = HSL.From(new RGB(1, 1, 1));
			expect(h2.H).toBe(0);
			expect(h2.S).toBe(0);
			expect(h2.L).toBe(1);

			// red
			const h3 = HSL.From(new RGB(1, 0, 0));
			expect(h3.H).toBe(0);
			expect(h3.S).toBe(1);
			expect(h3.L).toBe(0.5);

			// green
			const h4 = HSL.From(new RGB(0, 1, 0));
			expect(h4.H).toBe(120);
			expect(h4.S).toBe(1);
			expect(h4.L).toBe(0.5);

			// blue
			const h5 = HSL.From(new RGB(0, 0, 1));
			expect(h5.H).toBe(240);
			expect(h5.S).toBe(1);
			expect(h5.L).toBe(0.5);

			// arbitrary
			const h6 = HSL.From(new RGB(0.3, 0.6, 0.9));
			// lightness = (0.9+0.3)/2 = 0.6;
			// delta = 0.6; s = delta/(1 - |2L-1|)=0.6/(1-0.2)=0.6/0.8=0.75;
			// hue: between blue and others => approx 210
			expect(h6.L).toBeCloseTo(0.6);
			expect(h6.S).toBeCloseTo(0.75);
			expect(h6.H).toBeCloseTo(210, 0);
		});

		test('Convert from HSV', () => {
			// black
			const v1 = HSL.From(new HSV(0, 0, 0));
			expect(v1.H).toBe(0);
			expect(v1.S).toBe(0);
			expect(v1.L).toBe(0);

			// white
			const v2 = HSL.From(new HSV(0, 0, 1));
			expect(v2.H).toBe(0);
			expect(v2.S).toBe(0);
			expect(v2.L).toBe(1);

			// red
			const v3 = HSL.From(new HSV(0, 1, 1));
			expect(v3.H).toBe(0);
			expect(v3.S).toBe(1);
			expect(v3.L).toBe(0.5);

			// arbitrary v: HSV(60, 0.5, 0.8)
			// l = 0.8 - (0.8*0.5/2)=0.8 - 0.2=0.6; s=(0.8-0.6)/min(0.6,0.4)=0.2/0.4=0.5
			const v4 = HSL.From(new HSV(60, 0.5, 0.8));
			expect(v4.H).toBe(60);
			expect(v4.S).toBeCloseTo(0.5);
			expect(v4.L).toBeCloseTo(0.6);
		});

		test('should throw error when converting from unsupported type', () => {
			// @ts-expect-error - testing invalid conversion from non-color object
			expect(() => HSL.From({})).toThrow('Cannot convert to HSL');
		});
	});

	describe('Clone method', () => {
		test('should create a new HSL instance with same values', () => {
			const original = new HSL(240, 0.8, 0.6);
			const cloned = original.Clone();
			expect(cloned).toBeInstanceOf(HSL);
			expect(cloned).not.toBe(original);
			expect(cloned.H).toBe(original.H);
			expect(cloned.S).toBe(original.S);
			expect(cloned.L).toBe(original.L);
		});

		test('should create independent instances', () => {
			const original = new HSL(120, 0.5, 0.4);
			const cloned = original.Clone();
			// Modify the cloned instance
			cloned.H = 360;
			cloned.S = 1.0;
			cloned.L = 0.8;

			// Original should remain unchanged
			expect(original.H).toBe(120);
			expect(original.S).toBe(0.5);
			expect(original.L).toBe(0.4);

			// Cloned should have new values
			expect(cloned.H).toBe(360);
			expect(cloned.S).toBe(1.0);
			expect(cloned.L).toBe(0.8);
		});

		test('should preserve component array values', () => {
			const original = new HSL(180, 0.75, 0.25);
			const cloned = original.Clone();
			expect(cloned.ToArray()).toEqual(original.ToArray());
			expect(cloned.ToArray()).toEqual([180, 0.75, 0.25]);
		});

		test('should work with boundary values', () => {
			const black = new HSL(0, 0, 0);
			const white = new HSL(0, 0, 1);
			const saturated = new HSL(360, 1, 0.5);

			const clonedBlack = black.Clone();
			const clonedWhite = white.Clone();
			const clonedSaturated = saturated.Clone();
			expect(clonedBlack.ToArray()).toEqual([0, 0, 0]);
			expect(clonedWhite.ToArray()).toEqual([0, 0, 1]);
			expect(clonedSaturated.ToArray()).toEqual([360, 1, 0.5]);
		});

		test('should return correct type', () => {
			const original = new HSL(90, 0.6, 0.3);
			const cloned = original.Clone();
			// TypeScript type check
			expect(cloned).toBeInstanceOf(HSL);
			// Runtime type check
			expect(cloned.constructor).toBe(HSL);
		});
	});
});
