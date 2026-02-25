import { CMY } from './cmy.js';
import { CMYK } from './cmyk.js';
import { RGB } from './rgb.js';
import { ColorError } from '../error.js';

describe('Color CMY', () => {
	describe('Constructor and Validation', () => {
		it('should create a CMY color with default values', () => {
			const color = new CMY();
			expect(color.C).toBe(0);
			expect(color.M).toBe(0);
			expect(color.Y).toBe(0);
		});

		it('should create a CMY color with specified values', () => {
			const color = new CMY(0.2, 0.4, 0.6);
			expect(color.C).toBe(0.2);
			expect(color.M).toBe(0.4);
			expect(color.Y).toBe(0.6);
		});

		it('should throw error when creating a CMY color with invalid values', () => {
			expect(() => new CMY(-0.1, 0.5, 0.5)).toThrow(ColorError);
			expect(() => new CMY(0.5, 1.1, 0.5)).toThrow(ColorError);
			expect(() => new CMY(0.5, 0.5, -0.1)).toThrow(ColorError);
		});

		it('should validate a CMY color object correctly', () => {
			const color = new CMY(0.3, 0.5, 0.7);
			expect(CMY.Validate(color)).toBe(true);
			expect(CMY.Validate({})).toBe(false);

			// Create an invalid color for testing validation
			const invalidColor = new CMY(0.3, 0.5, 0.7);
			invalidColor.GetComponentsForTesting()[0] = -0.1;
			expect(CMY.Validate(invalidColor)).toBe(false);

			invalidColor.GetComponentsForTesting()[0] = 0.3;
			invalidColor.GetComponentsForTesting()[1] = 1.1;
			expect(CMY.Validate(invalidColor)).toBe(false);

			invalidColor.GetComponentsForTesting()[1] = 0.5;
			invalidColor.GetComponentsForTesting()[2] = Number.NaN;
			expect(CMY.Validate(invalidColor)).toBe(false);
		});

		it('should test Assert method with valid CMY objects', () => {
			const validColor = new CMY(0.3, 0.5, 0.7);
			expect(() => CMY.Assert(validColor)).not.toThrow();
		});

		it('should test Assert method with non-CMY objects', () => {
			expect(() => CMY.Assert({})).toThrow('Invalid CMY Color Instance');
			expect(() => CMY.Assert('not a color')).toThrow('Invalid CMY Color Instance');
			expect(() => CMY.Assert(null)).toThrow('Invalid CMY Color Instance');
			expect(() => CMY.Assert(undefined)).toThrow('Invalid CMY Color Instance');
			expect(() => CMY.Assert(42)).toThrow('Invalid CMY Color Instance');
		});

		it('should test Assert method with invalid component values', () => {
			// Test invalid C component
			const invalidC = new CMY(0.3, 0.5, 0.7);
			invalidC.GetComponentsForTesting()[0] = -0.1;
			expect(() => CMY.Assert(invalidC)).toThrow('Channel(C) must be in range [0, 1].');

			invalidC.GetComponentsForTesting()[0] = 1.1;
			expect(() => CMY.Assert(invalidC)).toThrow('Channel(C) must be in range [0, 1].');

			invalidC.GetComponentsForTesting()[0] = Number.NaN;
			expect(() => CMY.Assert(invalidC)).toThrow('Channel(C) must be in range [0, 1].');
			// Test invalid M component
			const invalidM = new CMY(0.3, 0.5, 0.7);
			invalidM.GetComponentsForTesting()[1] = -0.1;
			expect(() => CMY.Assert(invalidM)).toThrow('Channel(M) must be in range [0, 1].');

			invalidM.GetComponentsForTesting()[1] = 1.1;
			expect(() => CMY.Assert(invalidM)).toThrow('Channel(M) must be in range [0, 1].');

			invalidM.GetComponentsForTesting()[1] = Number.NaN;
			expect(() => CMY.Assert(invalidM)).toThrow('Channel(M) must be in range [0, 1].');

			// Test invalid Y component
			const invalidY = new CMY(0.3, 0.5, 0.7);
			invalidY.GetComponentsForTesting()[2] = -0.1;
			expect(() => CMY.Assert(invalidY)).toThrow('Channel(Y) must be in range [0, 1].');

			invalidY.GetComponentsForTesting()[2] = 1.1;
			expect(() => CMY.Assert(invalidY)).toThrow('Channel(Y) must be in range [0, 1].');

			invalidY.GetComponentsForTesting()[2] = Number.NaN;
			expect(() => CMY.Assert(invalidY)).toThrow('Channel(Y) must be in range [0, 1].');
		});
	});

	describe('Getters and Setters', () => {
		it('should set and get the C component correctly', () => {
			const color = new CMY();
			color.C = 0.25;
			expect(color.C).toBe(0.25);
			expect(() => {
				color.C = -0.1;
			}).toThrow();
			expect(() => {
				color.C = 1.1;
			}).toThrow();
		});

		it('should set and get the M component correctly', () => {
			const color = new CMY();
			color.M = 0.75;
			expect(color.M).toBe(0.75);
			expect(() => {
				color.M = -0.1;
			}).toThrow();
			expect(() => {
				color.M = 1.1;
			}).toThrow();
		});

		it('should set and get the Y component correctly', () => {
			const color = new CMY();
			color.Y = 0.5;
			expect(color.Y).toBe(0.5);
			expect(() => {
				color.Y = -0.1;
			}).toThrow();
			expect(() => {
				color.Y = 1.1;
			}).toThrow();
		});

		it('should throw ColorError for non-finite values in setters', () => {
			const color = new CMY();
			// Test C component with non-finite values
			expect(() => {
				color.C = Number.NaN;
			}).toThrow('Channel(C) must be in range [0, 1].');
			expect(() => {
				color.C = Number.POSITIVE_INFINITY;
			}).toThrow('Channel(C) must be in range [0, 1].');
			expect(() => {
				color.C = Number.NEGATIVE_INFINITY;
			}).toThrow('Channel(C) must be in range [0, 1].');
			// Test M component with non-finite values
			expect(() => {
				color.M = Number.NaN;
			}).toThrow('Channel(M) must be in range [0, 1].');
			expect(() => {
				color.M = Number.POSITIVE_INFINITY;
			}).toThrow('Channel(M) must be in range [0, 1].');
			expect(() => {
				color.M = Number.NEGATIVE_INFINITY;
			}).toThrow('Channel(M) must be in range [0, 1].');

			// Test Y component with non-finite values
			expect(() => {
				color.Y = Number.NaN;
			}).toThrow('Channel(Y) must be in range [0, 1].');
			expect(() => {
				color.Y = Number.POSITIVE_INFINITY;
			}).toThrow('Channel(Y) must be in range [0, 1].');
			expect(() => {
				color.Y = Number.NEGATIVE_INFINITY;
			}).toThrow('Channel(Y) must be in range [0, 1].');
		});
	});

	describe('String Representation', () => {
		it('should represent a CMY color as a string with percentage by default', () => {
			const color = new CMY(0.2, 0.4, 0.6);
			expect(color.ToString()).toBe('CMY(20%, 40%, 60%)');
		});

		it('should represent a CMY color as a string with float values when specified', () => {
			const color = new CMY(0.2, 0.4, 0.6);
			expect(color.ToString('float')).toBe('CMY(0.2, 0.4, 0.6)');
		});
	});

	describe('Conversion', () => {
		test('Convert from CMYK', () => {
			// Test case 1: Pure black (K=1)
			const cmyk1 = new CMYK(0, 0, 0, 1);
			const cmy1 = CMY.From(cmyk1);
			expect(cmy1.C).toBe(1);
			expect(cmy1.M).toBe(1);
			expect(cmy1.Y).toBe(1);

			// Test case 2: Pure cyan
			const cmyk2 = new CMYK(1, 0, 0, 0);
			const cmy2 = CMY.From(cmyk2);
			expect(cmy2.C).toBeCloseTo(1);
			expect(cmy2.M).toBeCloseTo(0);
			expect(cmy2.Y).toBeCloseTo(0);

			// Test case 3: Pure magenta
			const cmyk3 = new CMYK(0, 1, 0, 0);
			const cmy3 = CMY.From(cmyk3);
			expect(cmy3.C).toBeCloseTo(0);
			expect(cmy3.M).toBeCloseTo(1);
			expect(cmy3.Y).toBeCloseTo(0);

			// Test case 4: Pure yellow
			const cmyk4 = new CMYK(0, 0, 1, 0);
			const cmy4 = CMY.From(cmyk4);
			expect(cmy4.C).toBeCloseTo(0);
			expect(cmy4.M).toBeCloseTo(0);
			expect(cmy4.Y).toBeCloseTo(1);

			// Test case 5: Mixed CMYK with black
			const cmyk5 = new CMYK(0.5, 0.3, 0.7, 0.2);
			const cmy5 = CMY.From(cmyk5);
			expect(cmy5.C).toBeCloseTo(0.6);
			expect(cmy5.M).toBeCloseTo(0.44);
			expect(cmy5.Y).toBeCloseTo(0.76);

			// Test case 6: No ink (white)
			const cmyk6 = new CMYK(0, 0, 0, 0);
			const cmy6 = CMY.From(cmyk6);
			expect(cmy6.C).toBe(0);
			expect(cmy6.M).toBe(0);
			expect(cmy6.Y).toBe(0);
		});

		test('Convert from RGB', () => {
			// Test case 1: Pure black (RGB 0,0,0)
			const rgb1 = new RGB(0, 0, 0);
			const cmy1 = CMY.From(rgb1);
			expect(cmy1.C).toBe(1);
			expect(cmy1.M).toBe(1);
			expect(cmy1.Y).toBe(1);

			// Test case 2: Pure white (RGB 1,1,1)
			const rgb2 = new RGB(1, 1, 1);
			const cmy2 = CMY.From(rgb2);
			expect(cmy2.C).toBe(0);
			expect(cmy2.M).toBe(0);
			expect(cmy2.Y).toBe(0);

			// Test case 3: Pure red (RGB 1,0,0)
			const rgb3 = new RGB(1, 0, 0);
			const cmy3 = CMY.From(rgb3);
			expect(cmy3.C).toBe(0);
			expect(cmy3.M).toBe(1);
			expect(cmy3.Y).toBe(1);

			// Test case 4: Pure green (RGB 0,1,0)
			const rgb4 = new RGB(0, 1, 0);
			const cmy4 = CMY.From(rgb4);
			expect(cmy4.C).toBe(1);
			expect(cmy4.M).toBe(0);
			expect(cmy4.Y).toBe(1);

			// Test case 5: Pure blue (RGB 0,0,1)
			const rgb5 = new RGB(0, 0, 1);
			const cmy5 = CMY.From(rgb5);
			expect(cmy5.C).toBe(1);
			expect(cmy5.M).toBe(1);
			expect(cmy5.Y).toBe(0);

			// Test case 6: Mixed RGB values
			const rgb6 = new RGB(0.3, 0.6, 0.9);
			const cmy6 = CMY.From(rgb6);
			expect(cmy6.C).toBeCloseTo(0.7);
			expect(cmy6.M).toBeCloseTo(0.4);
			expect(cmy6.Y).toBeCloseTo(0.1);

			// Test case 7: Gray value (RGB 0.5,0.5,0.5)
			const rgb7 = new RGB(0.5, 0.5, 0.5);
			const cmy7 = CMY.From(rgb7);
			expect(cmy7.C).toBe(0.5);
			expect(cmy7.M).toBe(0.5);
			expect(cmy7.Y).toBe(0.5);
		});

		test('should throw error when converting from an unsupported color type', () => {
			expect(() => CMY.From({} as RGB | CMYK)).toThrow('Cannot Convert to CMY');
		});
	});
});

describe('Clone method', () => {
	describe('should create a new CMY instance with same values', () => {
		it('creates a clone with identical values', () => {
			const original = new CMY(0.2, 0.4, 0.6);
			const cloned = original.Clone();
			expect(cloned).toBeInstanceOf(CMY);
			expect(cloned).not.toBe(original);
			expect(cloned.C).toBe(original.C);
			expect(cloned.M).toBe(original.M);
			expect(cloned.Y).toBe(original.Y);
		});
	});

	describe('should create independent instances', () => {
		it('modifies the clone without affecting the original', () => {
			const original = new CMY(0.2, 0.4, 0.6);
			const cloned = original.Clone();
			cloned.C = 0.8;
			cloned.M = 0.1;
			cloned.Y = 0.3;
			expect(original.C).toBe(0.2);
			expect(original.M).toBe(0.4);
			expect(original.Y).toBe(0.6);
			expect(cloned.C).toBe(0.8);
			expect(cloned.M).toBe(0.1);
			expect(cloned.Y).toBe(0.3);
		});
	});

	describe('should preserve component array values', () => {
		it('cloned ToArray matches original', () => {
			const original = new CMY(0.2, 0.4, 0.6);
			const cloned = original.Clone();
			expect(cloned.ToArray()).toEqual(original.ToArray());
			expect(cloned.ToArray()).toEqual([0.2, 0.4, 0.6]);
		});
	});

	describe('should work with boundary values', () => {
		it('clones black and white correctly', () => {
			const black = new CMY(0, 0, 0);
			const white = new CMY(1, 1, 1);
			const clonedBlack = black.Clone();
			const clonedWhite = white.Clone();
			expect(clonedBlack.ToArray()).toEqual([0, 0, 0]);
			expect(clonedWhite.ToArray()).toEqual([1, 1, 1]);
		});
	});

	describe('should return correct type', () => {
		it('returns a CMY instance', () => {
			const original = new CMY(0.2, 0.4, 0.6);
			const cloned = original.Clone();
			expect(cloned).toBeInstanceOf(CMY);
			expect(cloned.constructor).toBe(CMY);
		});
	});
});
