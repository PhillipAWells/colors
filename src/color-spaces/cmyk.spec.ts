import { CMY } from './cmy.js';
import { CMYK } from './cmyk.js';
import { RGB } from './rgb.js';
import { ColorError } from '../error.js';

describe('Color CMYK', () => {
	describe('Constructor and Validation', () => {
		it('should create a CMYK color with default values', () => {
			const color = new CMYK();
			expect(color.C).toBe(0);
			expect(color.M).toBe(0);
			expect(color.Y).toBe(0);
			expect(color.K).toBe(0);
		});

		it('should create a CMYK color with specified values', () => {
			const color = new CMYK(0.2, 0.4, 0.6, 0.8);
			expect(color.C).toBe(0.2);
			expect(color.M).toBe(0.4);
			expect(color.Y).toBe(0.6);
			expect(color.K).toBe(0.8);
		});

		it('should throw error when creating a CMYK color with invalid values', () => {
			expect(() => new CMYK(-0.1, 0.5, 0.5, 0.5)).toThrow(ColorError);
			expect(() => new CMYK(0.5, 1.1, 0.5, 0.5)).toThrow(ColorError);
			expect(() => new CMYK(0.5, 0.5, -0.1, 0.5)).toThrow(ColorError);
			expect(() => new CMYK(0.5, 0.5, 0.5, 1.1)).toThrow(ColorError);
		});

		it('should validate a CMYK color object correctly', () => {
			const color = new CMYK(0.3, 0.5, 0.7, 0.2);
			expect(CMYK.Validate(color)).toBe(true);
			expect(CMYK.Validate({})).toBe(false);

			// Create an invalid color for testing validation
			const invalidColor = new CMYK(0.3, 0.5, 0.7, 0.2);
			invalidColor.GetComponentsForTesting()[0] = -0.1;
			expect(CMYK.Validate(invalidColor)).toBe(false);

			invalidColor.GetComponentsForTesting()[0] = 0.3;
			invalidColor.GetComponentsForTesting()[1] = 1.1;
			expect(CMYK.Validate(invalidColor)).toBe(false);

			invalidColor.GetComponentsForTesting()[1] = 0.5;
			invalidColor.GetComponentsForTesting()[2] = Number.NaN;
			expect(CMYK.Validate(invalidColor)).toBe(false);

			invalidColor.GetComponentsForTesting()[2] = 0.7;
			invalidColor.GetComponentsForTesting()[3] = Number.NaN;
			expect(CMYK.Validate(invalidColor)).toBe(false);
		});
	});

	describe('Getters and Setters', () => {
		it('should set and get the C component correctly', () => {
			const color = new CMYK();
			color.C = 0.25;
			expect(color.C).toBe(0.25);
			expect(() => {
				color.C = -0.1;
			}).toThrow(ColorError);
			expect(() => {
				color.C = 1.1;
			}).toThrow(ColorError);
		});

		it('should set and get the M component correctly', () => {
			const color = new CMYK();
			color.M = 0.75;
			expect(color.M).toBe(0.75);
			expect(() => {
				color.M = -0.1;
			}).toThrow(ColorError);
			expect(() => {
				color.M = 1.1;
			}).toThrow(ColorError);
		});

		it('should set and get the Y component correctly', () => {
			const color = new CMYK();
			color.Y = 0.5;
			expect(color.Y).toBe(0.5);
			expect(() => {
				color.Y = -0.1;
			}).toThrow(ColorError);
			expect(() => {
				color.Y = 1.1;
			}).toThrow(ColorError);
		});

		it('should set and get the K component correctly', () => {
			const color = new CMYK();
			color.K = 0.6;
			expect(color.K).toBe(0.6);
			expect(() => {
				color.K = -0.1;
			}).toThrow(ColorError);
			expect(() => {
				color.K = 1.1;
			}).toThrow(ColorError);
		});
	});

	describe('String Representation', () => {
		it('should represent a CMYK color as a string with percentage by default', () => {
			const color = new CMYK(0.2, 0.4, 0.6, 0.8);
			expect(color.ToString()).toBe('CMYK(20%, 40%, 60%, 80%)');
		});

		it('should represent a CMYK color as a string with float values when specified', () => {
			const color = new CMYK(0.2, 0.4, 0.6, 0.8);
			expect(color.ToString('float')).toBe('CMYK(0.2, 0.4, 0.6, 0.8)');
		});
	});

	describe('Conversion', () => {
		test('Convert from CMY', () => {
			// Test case 1: Pure black (CMY 1,1,1)
			const cmy1 = new CMY(1, 1, 1);
			const cmyk1 = CMYK.From(cmy1);
			expect(cmyk1.C).toBe(0);
			expect(cmyk1.M).toBe(0);
			expect(cmyk1.Y).toBe(0);
			expect(cmyk1.K).toBe(1);

			// Test case 2: Pure cyan
			const cmy2 = new CMY(1, 0, 0);
			const cmyk2 = CMYK.From(cmy2);
			expect(cmyk2.C).toBe(1);
			expect(cmyk2.M).toBe(0);
			expect(cmyk2.Y).toBe(0);
			expect(cmyk2.K).toBe(0);

			// Test case 3: Pure magenta
			const cmy3 = new CMY(0, 1, 0);
			const cmyk3 = CMYK.From(cmy3);
			expect(cmyk3.C).toBe(0);
			expect(cmyk3.M).toBe(1);
			expect(cmyk3.Y).toBe(0);
			expect(cmyk3.K).toBe(0);

			// Test case 4: Pure yellow
			const cmy4 = new CMY(0, 0, 1);
			const cmyk4 = CMYK.From(cmy4);
			expect(cmyk4.C).toBe(0);
			expect(cmyk4.M).toBe(0);
			expect(cmyk4.Y).toBe(1);
			expect(cmyk4.K).toBe(0);

			// Test case 5: Mixed CMY with black component
			const cmy5 = new CMY(0.6, 0.7, 0.8);
			const cmyk5 = CMYK.From(cmy5);
			expect(cmyk5.C).toBeCloseTo(0);
			expect(cmyk5.M).toBeCloseTo(0.25);
			expect(cmyk5.Y).toBeCloseTo(0.5);
			expect(cmyk5.K).toBeCloseTo(0.6);

			// Test case 6: No color (white)
			const cmy6 = new CMY(0, 0, 0);
			const cmyk6 = CMYK.From(cmy6);
			expect(cmyk6.C).toBe(0);
			expect(cmyk6.M).toBe(0);
			expect(cmyk6.Y).toBe(0);
			expect(cmyk6.K).toBe(0);
		});

		test('Convert from RGB', () => {
			// Test case 1: Pure black (RGB 0,0,0)
			const rgb1 = new RGB(0, 0, 0);
			const cmyk1 = CMYK.From(rgb1);
			expect(cmyk1.C).toBe(0);
			expect(cmyk1.M).toBe(0);
			expect(cmyk1.Y).toBe(0);
			expect(cmyk1.K).toBe(1);

			// Test case 2: Pure white (RGB 1,1,1)
			const rgb2 = new RGB(1, 1, 1);
			const cmyk2 = CMYK.From(rgb2);
			expect(cmyk2.C).toBe(0);
			expect(cmyk2.M).toBe(0);
			expect(cmyk2.Y).toBe(0);
			expect(cmyk2.K).toBe(0);

			// Test case 3: Pure red (RGB 1,0,0)
			const rgb3 = new RGB(1, 0, 0);
			const cmyk3 = CMYK.From(rgb3);
			expect(cmyk3.C).toBe(0);
			expect(cmyk3.M).toBe(1);
			expect(cmyk3.Y).toBe(1);
			expect(cmyk3.K).toBe(0);

			// Test case 4: Pure green (RGB 0,1,0)
			const rgb4 = new RGB(0, 1, 0);
			const cmyk4 = CMYK.From(rgb4);
			expect(cmyk4.C).toBe(1);
			expect(cmyk4.M).toBe(0);
			expect(cmyk4.Y).toBe(1);
			expect(cmyk4.K).toBe(0);

			// Test case 5: Pure blue (RGB 0,0,1)
			const rgb5 = new RGB(0, 0, 1);
			const cmyk5 = CMYK.From(rgb5);
			expect(cmyk5.C).toBe(1);
			expect(cmyk5.M).toBe(1);
			expect(cmyk5.Y).toBe(0);
			expect(cmyk5.K).toBe(0);

			// Test case 6: Mixed RGB values
			const rgb6 = new RGB(0.5, 0.3, 0.7);
			const cmyk6 = CMYK.From(rgb6);
			expect(cmyk6.C).toBeCloseTo(0.28571);
			expect(cmyk6.M).toBeCloseTo(0.57143);
			expect(cmyk6.Y).toBeCloseTo(0);
			expect(cmyk6.K).toBeCloseTo(0.3);

			// Test case 7: Gray value (RGB 0.5,0.5,0.5)
			const rgb7 = new RGB(0.5, 0.5, 0.5);
			const cmyk7 = CMYK.From(rgb7);
			expect(cmyk7.C).toBe(0);
			expect(cmyk7.M).toBe(0);
			expect(cmyk7.Y).toBe(0);
			expect(cmyk7.K).toBe(0.5);
		});

		test('should throw error when converting from an unsupported color type', () => {
			// @ts-expect-error - Testing invalid conversion
			expect(() => CMYK.From({})).toThrow(new ColorError('Cannot Convert to CMYK'));
		});
	});
});

describe('Clone method', () => {
	describe('should create a new CMYK instance with same values', () => {
		it('creates a clone with identical values', () => {
			const original = new CMYK(0.2, 0.4, 0.6, 0.8);
			const cloned = original.Clone();
			expect(cloned).toBeInstanceOf(CMYK);
			expect(cloned).not.toBe(original);
			expect(cloned.C).toBe(original.C);
			expect(cloned.M).toBe(original.M);
			expect(cloned.Y).toBe(original.Y);
			expect(cloned.K).toBe(original.K);
		});
	});

	describe('should create independent instances', () => {
		it('modifies the clone without affecting the original', () => {
			const original = new CMYK(0.2, 0.4, 0.6, 0.8);
			const cloned = original.Clone();
			cloned.C = 0.8;
			cloned.M = 0.1;
			cloned.Y = 0.3;
			cloned.K = 0.5;
			expect(original.C).toBe(0.2);
			expect(original.M).toBe(0.4);
			expect(original.Y).toBe(0.6);
			expect(original.K).toBe(0.8);
			expect(cloned.C).toBe(0.8);
			expect(cloned.M).toBe(0.1);
			expect(cloned.Y).toBe(0.3);
			expect(cloned.K).toBe(0.5);
		});
	});

	describe('should preserve component array values', () => {
		it('cloned ToArray matches original', () => {
			const original = new CMYK(0.2, 0.4, 0.6, 0.8);
			const cloned = original.Clone();
			expect(cloned.ToArray()).toEqual(original.ToArray());
			expect(cloned.ToArray()).toEqual([0.2, 0.4, 0.6, 0.8]);
		});
	});

	describe('should work with boundary values', () => {
		it('clones black and white correctly', () => {
			const black = new CMYK(0, 0, 0, 1);
			const white = new CMYK(0, 0, 0, 0);
			const clonedBlack = black.Clone();
			const clonedWhite = white.Clone();
			expect(clonedBlack.ToArray()).toEqual([0, 0, 0, 1]);
			expect(clonedWhite.ToArray()).toEqual([0, 0, 0, 0]);
		});
	});

	describe('should return correct type', () => {
		it('returns a CMYK instance', () => {
			const original = new CMYK(0.2, 0.4, 0.6, 0.8);
			const cloned = original.Clone();
			expect(cloned).toBeInstanceOf(CMYK);
			expect(cloned.constructor).toBe(CMYK);
		});
	});
});
