import { Lab } from './lab.js';
import { XYZ } from './xyz.js';
import { LCHab } from './lchab.js';

// Tests for Lab (CIELAB) color space
describe('Color Lab', () => {
	describe('Constructor and Validation', () => {
		it('should create a Lab color with default values', () => {
			const color = new Lab();
			expect(color.L).toBe(0);
			expect(color.A).toBe(0);
			expect(color.B).toBe(0);
		});

		it('should create a Lab color with specified values', () => {
			const color = new Lab(50, -10, 20);
			expect(color.L).toBe(50);
			expect(color.A).toBe(-10);
			expect(color.B).toBe(20);
		});

		it('should throw error when creating a Lab color with invalid numbers', () => {
			expect(() => new Lab(Number.NaN, 0, 0)).toThrow('Channel(L) must be in range [0, 100].');
			expect(() => new Lab(0, Number.NaN, 0)).toThrow('Channel(a) must be a finite number.');
			expect(() => new Lab(0, 0, Number.NaN)).toThrow('Channel(b) must be a finite number.');
		});

		it('should validate a Lab color object correctly', () => {
			const color = new Lab(10, 20, 30);
			expect(Lab.Validate(color)).toBe(true);
			// Using a non-Lab object should return false
			expect(Lab.Validate({} as Lab)).toBe(false);
			// tamper values
			color.GetComponentsForTesting()[0] = Number.NaN;
			expect(Lab.Validate(color)).toBe(false);
		});
	});

	describe('Getters and Setters', () => {
		it('should set and get L, a, b components correctly', () => {
			const color = new Lab();
			color.L = 70;
			color.A = -30;
			color.B = 15;
			expect(color.L).toBe(70);
			expect(color.A).toBe(-30);
			expect(color.B).toBe(15);
		});
	});

	describe('String Representation', () => {
		it('should represent a Lab color as string in float format by default', () => {
			const color = new Lab(50.5, 0.25, -0.75);
			expect(color.ToString()).toBe('Lab(50.5, 0.25, -0.75)');
		});

		it('should represent a Lab color as string in int format when specified', () => {
			const color = new Lab(50.5, 0.5, -0.5);
			// a,b multiplied by 128 then rounded: 64 and -64
			expect(color.ToString('int')).toBe('Lab(51, 64, -64)');
		});
	});

	describe('Conversion', () => {
		test('Convert from XYZ', () => {
			const whiteXYZ = new XYZ(XYZ.D65.X, XYZ.D65.Y, XYZ.D65.Z);
			const whiteLab = Lab.From(whiteXYZ);
			expect(whiteLab.L).toBeCloseTo(100);
			expect(whiteLab.A).toBeCloseTo(0);
			expect(whiteLab.B).toBeCloseTo(0);

			const blackXYZ = new XYZ(0, 0, 0);
			const blackLab = Lab.From(blackXYZ);
			expect(blackLab.L).toBeCloseTo(0);
			expect(blackLab.A).toBeCloseTo(0);
			expect(blackLab.B).toBeCloseTo(0);
		});

		test('Convert from LCHab', () => {
			const src = new LCHab(60, 10, 0);
			const lab = Lab.From(src);
			expect(lab.L).toBe(src.L);
			expect(lab.A).toBeCloseTo(src.C * Math.cos(src.H * Math.PI / 180));
			expect(lab.B).toBeCloseTo(src.C * Math.sin(src.H * Math.PI / 180));
		});

		test('should throw error when converting from unsupported type', () => {
			// @ts-expect-error invalid conversion
			expect(() => Lab.From({})).toThrow('Cannot convert to Lab');
		});
	});
	describe('Delta E Calculations', () => {
		describe('DeltaE76 (CIE 1976)', () => {
			test('should return 0 for identical colors', () => {
				const color1 = new Lab(50, 25, -25);
				const color2 = new Lab(50, 25, -25);
				expect(color1.DeltaE76(color2)).toBe(0);
			});

			test('should calculate basic Delta E76 correctly', () => {
				// White vs Black - maximum lightness difference
				const white = new Lab(100, 0, 0);
				const black = new Lab(0, 0, 0);
				expect(white.DeltaE76(black)).toBe(100);
			});

			test('should calculate Delta E76 for known color pairs', () => {
				// Test with known Lab values and calculated Delta E
				const red = new Lab(53.24, 80.09, 67.20);
				const green = new Lab(46.23, -51.70, 49.90);
				const deltaE = red.DeltaE76(green);
				expect(deltaE).toBeCloseTo(133.11, 2); // Calculated reference value
			});

			test('should handle small differences precisely', () => {
				const color1 = new Lab(50, 2, 2);
				const color2 = new Lab(50, 0, 0);
				const deltaE = color1.DeltaE76(color2);
				expect(deltaE).toBeCloseTo(Math.sqrt(8), 6); // √(2² + 2²) = √8
			});

			test('should validate input Lab object', () => {
				const color = new Lab(50, 0, 0);
				expect(() => color.DeltaE76({} as Lab)).toThrow('Not a Lab Color');
			});

			test('should handle negative a* and b* values', () => {
				const color1 = new Lab(50, -30, -20);
				const color2 = new Lab(50, 30, 20);
				const deltaE = color1.DeltaE76(color2);
				expect(deltaE).toBeCloseTo(Math.sqrt(3600 + 1600), 6); // √(60² + 40²)
			});
		});

		describe('DeltaE94 (CIE 1994)', () => {
			test('should return 0 for identical colors', () => {
				const color1 = new Lab(50, 25, -25);
				const color2 = new Lab(50, 25, -25);
				expect(color1.DeltaE94(color2)).toBe(0);
				expect(color1.DeltaE94(color2, true)).toBe(0); // textiles mode
			});

			test('should calculate Delta E94 for achromatic colors', () => {
				// Gray colors (a=0, b=0) - only lightness difference
				const gray1 = new Lab(50, 0, 0);
				const gray2 = new Lab(60, 0, 0);
				const deltaE94Graphics = gray1.DeltaE94(gray2);
				const deltaE94Textiles = gray1.DeltaE94(gray2, true);				// With graphics mode (kL=1), Delta E94 = 10
				expect(deltaE94Graphics).toBeCloseTo(10, 6);
				// With textiles mode (kL=2), Delta E94 = 5
				expect(deltaE94Textiles).toBeCloseTo(5, 6);
			});

			test('should handle different weighting factors for textiles vs graphics', () => {
				const color1 = new Lab(50, 20, 30);
				const color2 = new Lab(55, 25, 35);

				const deltaE94Graphics = color1.DeltaE94(color2, false);
				const deltaE94Textiles = color1.DeltaE94(color2, true);				// Textiles mode should generally give lower values due to kL=2
				expect(deltaE94Textiles).toBeLessThan(deltaE94Graphics);
			});

			test('should calculate Delta E94 with known reference values', () => {
				// Test case for Delta E94 calculation
				const color1 = new Lab(50.0, 2.6, -79.7);
				const color2 = new Lab(50.0, 0.0, -82.7);
				const deltaE94 = color1.DeltaE94(color2);
				expect(deltaE94).toBeCloseTo(1.37, 2); // Calculated reference value
			});

			test('should handle high chroma colors correctly', () => {
				// High chroma should affect the weighting functions
				const highChroma1 = new Lab(50, 60, 80);
				const highChroma2 = new Lab(50, 65, 85);
				const deltaE = highChroma1.DeltaE94(highChroma2);
				expect(deltaE).toBeGreaterThan(0);
				expect(deltaE).toBeLessThan(10); // Should be reasonable
			});

			test('should validate input Lab object', () => {
				const color = new Lab(50, 0, 0);
				expect(() => color.DeltaE94({} as Lab)).toThrow('Not a Lab Color');
			});
		});

		describe('DeltaE2000 (CIEDE2000)', () => {
			test('should return 0 for identical colors', () => {
				const color1 = new Lab(50, 25, -25);
				const color2 = new Lab(50, 25, -25);
				expect(color1.DeltaE2000(color2)).toBe(0);
			});

			test('should calculate Delta E2000 for achromatic colors', () => {
				// Pure gray colors - only lightness difference
				const gray1 = new Lab(50, 0, 0);
				const gray2 = new Lab(60, 0, 0);
				const deltaE2000 = gray1.DeltaE2000(gray2);
				expect(deltaE2000).toBeCloseTo(9.47, 2); // Calculated value with CIEDE2000 weighting
			});

			test('should handle the blue region correction', () => {
				// Test colors in blue region where CIEDE2000 has special handling
				const blue1 = new Lab(50, 0, -25);
				const blue2 = new Lab(50, 5, -25);
				const deltaE2000 = blue1.DeltaE2000(blue2);
				expect(deltaE2000).toBeGreaterThan(0);
				expect(deltaE2000).toBeLessThan(10);
			});

			test('should calculate Delta E2000 with known reference values', () => {
				// Test case for CIEDE2000 calculation
				const color1 = new Lab(50.0, 2.5, -25.0);
				const color2 = new Lab(50.0, 0.0, -25.0);
				const deltaE2000 = color1.DeltaE2000(color2);
				expect(deltaE2000).toBeCloseTo(2.27, 2); // Calculated CIEDE2000 value
			});

			test('should handle gray colors with zero chroma', () => {
				// Special case where chroma is zero
				const neutral1 = new Lab(50, 0, 0);
				const neutral2 = new Lab(50, 0.1, 0);
				const deltaE2000 = neutral1.DeltaE2000(neutral2);
				expect(deltaE2000).toBeGreaterThan(0);
				expect(deltaE2000).toBeLessThan(1);
			});

			test('should handle rotation term for interactive chroma-hue', () => {
				// Test the RT (rotation term) calculation
				const color1 = new Lab(60, 20, 15);
				const color2 = new Lab(60, 25, 20);
				const deltaE2000 = color1.DeltaE2000(color2);
				expect(deltaE2000).toBeGreaterThan(0);
				expect(deltaE2000).toBeLessThan(15);
			});

			test('should handle large hue differences correctly', () => {
				// Test hue difference calculation across 180° boundary
				const color1 = new Lab(50, 20, 0); // ~0° hue
				const color2 = new Lab(50, -20, 0); // ~180° hue
				const deltaE2000 = color1.DeltaE2000(color2);
				expect(deltaE2000).toBeGreaterThan(0);
			});

			test('should validate input Lab object', () => {
				const color = new Lab(50, 0, 0);
				expect(() => color.DeltaE2000({} as Lab)).toThrow('Not a Lab Color');
			});

			test('should handle extreme chroma values', () => {
				// Test with very high chroma values
				const highChroma1 = new Lab(50, 100, 100);
				const highChroma2 = new Lab(50, 105, 105);
				const deltaE2000 = highChroma1.DeltaE2000(highChroma2);
				expect(deltaE2000).toBeGreaterThan(0);
				expect(deltaE2000).toBeLessThan(20);
			});
		});

		describe('Delta E Method Comparisons', () => {
			test('should show different results between Delta E methods', () => {
				const color1 = new Lab(50, 20, 30);
				const color2 = new Lab(55, 25, 35);

				const deltaE76 = color1.DeltaE76(color2);
				const deltaE94 = color1.DeltaE94(color2);
				const deltaE2000 = color1.DeltaE2000(color2);				// All should be positive and different
				expect(deltaE76).toBeGreaterThan(0);
				expect(deltaE94).toBeGreaterThan(0);
				expect(deltaE2000).toBeGreaterThan(0);

				// They should generally give different results
				expect(deltaE76).not.toBe(deltaE94);
				expect(deltaE94).not.toBe(deltaE2000);
			});

			test('should maintain consistency for very small differences', () => {
				const color1 = new Lab(50, 0, 0);
				const color2 = new Lab(50.01, 0.01, 0.01); // Tiny difference

				const deltaE76 = color1.DeltaE76(color2);
				const deltaE94 = color1.DeltaE94(color2);
				const deltaE2000 = color1.DeltaE2000(color2);				// All should be very small but positive
				expect(deltaE76).toBeGreaterThan(0);
				expect(deltaE76).toBeLessThan(0.1);
				expect(deltaE94).toBeGreaterThan(0);
				expect(deltaE94).toBeLessThan(0.1);
				expect(deltaE2000).toBeGreaterThan(0);
				expect(deltaE2000).toBeLessThan(0.1);
			});
		});
		describe('Clone method', () => {
			test('should create a new Lab instance with same values', () => {
				const original = new Lab(50, 25, -25);
				const cloned = original.Clone();
				expect(cloned).toBeInstanceOf(Lab);
				expect(cloned).not.toBe(original);
				expect(cloned.L).toBe(original.L);
				expect(cloned.A).toBe(original.A);
				expect(cloned.B).toBe(original.B);
			});
			test('should create independent instances', () => {
				const original = new Lab(10, 20, 30);
				const cloned = original.Clone();
				cloned.L = 100;
				cloned.A = -128;
				cloned.B = 127;
				expect(original.L).toBe(10);
				expect(original.A).toBe(20);
				expect(original.B).toBe(30);
				expect(cloned.L).toBe(100);
				expect(cloned.A).toBe(-128);
				expect(cloned.B).toBe(127);
			});
			test('should preserve component array values', () => {
				const original = new Lab(50, 0, 0);
				const cloned = original.Clone();
				expect(cloned.ToArray()).toEqual(original.ToArray());
				expect(cloned.ToArray()).toEqual([50, 0, 0]);
			});
			test('should work with boundary values', () => {
				const black = new Lab(0, 0, 0);
				const white = new Lab(100, 0, 0);
				const clonedBlack = black.Clone();
				const clonedWhite = white.Clone();
				expect(clonedBlack.ToArray()).toEqual([0, 0, 0]);
				expect(clonedWhite.ToArray()).toEqual([100, 0, 0]);
			});
			test('should return correct type', () => {
				const original = new Lab(60, -30, 15);
				const cloned = original.Clone();
				expect(cloned).toBeInstanceOf(Lab);
				expect(cloned.constructor).toBe(Lab);
			});
		});
	});
});
