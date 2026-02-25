import { CAM16 } from './cam16.js';
import { XYZ } from './xyz.js';
import { ColorError } from '../error.js';
import { CAM16ViewingConditions } from './cam16-viewing-conditions.js';

describe('Color Space - CAM16', () => {
	describe('Constructor and Validation', () => {
		it('should create default CAM16 color', () => {
			const color = new CAM16();
			expect(color.H).toBe(0);
			expect(color.C).toBe(0);
			expect(color.J).toBe(0);
			expect(color.Q).toBe(0);
			expect(color.M).toBe(0);
			expect(color.S).toBe(0);
		});

		it('should create CAM16 with specific values', () => {
			const color = new CAM16(120, 40, 80, 20, 10, 5);
			expect(color.H).toBe(120);
			expect(color.C).toBe(40);
			expect(color.J).toBe(80);
			expect(color.Q).toBe(20);
			expect(color.M).toBe(10);
			expect(color.S).toBe(5);
		});

		it('should throw ColorError for invalid constructor values', () => {
			// Constructor now validates and throws for invalid values
			expect(() => new CAM16(Number.NaN, 0, 0, 0, 0, 0)).toThrow(ColorError);
			expect(() => new CAM16(0, Number.NaN, 0, 0, 0, 0)).toThrow(ColorError);
			expect(() => new CAM16(0, 0, Number.NaN, 0, 0, 0)).toThrow(ColorError);
			expect(() => new CAM16(0, 0, 0, Number.NaN, 0, 0)).toThrow(ColorError);
			expect(() => new CAM16(0, 0, 0, 0, Number.NaN, 0)).toThrow(ColorError);
			expect(() => new CAM16(0, 0, 0, 0, 0, Number.NaN)).toThrow(ColorError);

			expect(() => new CAM16(-1, 0, 0, 0, 0, 0)).toThrow(ColorError);
			expect(() => new CAM16(0, -1, 0, 0, 0, 0)).toThrow(ColorError);
			expect(() => new CAM16(0, 0, -1, 0, 0, 0)).toThrow(ColorError);
			expect(() => new CAM16(0, 0, 0, -1, 0, 0)).toThrow(ColorError);
			expect(() => new CAM16(0, 0, 0, 0, -1, 0)).toThrow(ColorError);
			expect(() => new CAM16(0, 0, 0, 0, 0, -1)).toThrow(ColorError);
		});

		it('should throw ColorError for constructor boundary values', () => {
			// Test H (hue) boundaries - should be [0, 360)
			expect(() => new CAM16(360, 0, 0, 0, 0, 0)).toThrow(ColorError);
			expect(() => new CAM16(-0.1, 0, 0, 0, 0, 0)).toThrow(ColorError);

			// Test J (lightness) boundaries - should be [0, 100]
			expect(() => new CAM16(0, 0, 100.1, 0, 0, 0)).toThrow(ColorError);
			expect(() => new CAM16(0, 0, -0.1, 0, 0, 0)).toThrow(ColorError);

			// Test infinity values
			expect(() => new CAM16(Infinity, 0, 0, 0, 0, 0)).toThrow(ColorError);
			expect(() => new CAM16(0, Infinity, 0, 0, 0, 0)).toThrow(ColorError);
			expect(() => new CAM16(0, 0, Infinity, 0, 0, 0)).toThrow(ColorError);
			expect(() => new CAM16(0, 0, 0, Infinity, 0, 0)).toThrow(ColorError);
			expect(() => new CAM16(0, 0, 0, 0, Infinity, 0)).toThrow(ColorError);
			expect(() => new CAM16(0, 0, 0, 0, 0, Infinity)).toThrow(ColorError);
		});

		it('should accept valid constructor boundary values', () => {
			// Test valid boundary values
			expect(() => new CAM16(0, 0, 0, 0, 0, 0)).not.toThrow();
			expect(() => new CAM16(359.99, 0, 0, 0, 0, 0)).not.toThrow();
			expect(() => new CAM16(0, 0, 100, 0, 0, 0)).not.toThrow();
			expect(() => new CAM16(180, 50, 50, 25, 30, 40)).not.toThrow();
		});
	});

	describe('Getters and Setters', () => {
		it('should set and get components correctly', () => {
			const color = new CAM16();
			color.H = 200;
			color.C = 30;
			color.J = 90;
			color.Q = 15;
			color.M = 25;
			color.S = 35;
			expect(color.H).toBe(200);
			expect(color.C).toBe(30);
			expect(color.J).toBe(90);
			expect(color.Q).toBe(15);
			expect(color.M).toBe(25);
			expect(color.S).toBe(35);
		});

		it('should set and get HRadians correctly', () => {
			const color = new CAM16();
			const radianValue = Math.PI; // 180 degrees
			color.HRadians = radianValue;
			expect(color.HRadians).toBeCloseTo(radianValue, 10);
			expect(color.H).toBeCloseTo(180, 10);
		});

		it('should throw for out-of-range sets', () => {
			const color = new CAM16();
			expect(() => color.H = 360).toThrow(ColorError);
			expect(() => color.C = -1).toThrow(ColorError);
			expect(() => color.J = 101).toThrow(ColorError);
			expect(() => color.Q = -1).toThrow(ColorError);
			expect(() => color.M = -1).toThrow(ColorError);
			expect(() => color.S = -1).toThrow(ColorError);
		});

		it('should throw ColorError for non-finite values in setters', () => {
			const color = new CAM16();
			// Test NaN values
			expect(() => color.H = NaN).toThrow(ColorError);
			expect(() => color.C = NaN).toThrow(ColorError);
			expect(() => color.J = NaN).toThrow(ColorError);
			expect(() => color.Q = NaN).toThrow(ColorError);
			expect(() => color.M = NaN).toThrow(ColorError);
			expect(() => color.S = NaN).toThrow(ColorError);
			// Test Infinity values
			expect(() => color.H = Infinity).toThrow(ColorError);
			expect(() => color.C = Infinity).toThrow(ColorError);
			expect(() => color.J = Infinity).toThrow(ColorError);
			expect(() => color.Q = Infinity).toThrow(ColorError);
			expect(() => color.M = Infinity).toThrow(ColorError);
			expect(() => color.S = Infinity).toThrow(ColorError);
			// Test -Infinity values
			expect(() => color.H = -Infinity).toThrow(ColorError);
			expect(() => color.C = -Infinity).toThrow(ColorError);
			expect(() => color.J = -Infinity).toThrow(ColorError);
			expect(() => color.Q = -Infinity).toThrow(ColorError);
			expect(() => color.M = -Infinity).toThrow(ColorError);
			expect(() => color.S = -Infinity).toThrow(ColorError);
		});

		it('should throw ColorError for HRadians setter with invalid values', () => {
			const color = new CAM16();
			// Test out-of-range values
			expect(() => color.HRadians = 2 * Math.PI).toThrow(ColorError);
			expect(() => color.HRadians = -1).toThrow(ColorError);
			// Test non-finite values
			expect(() => color.HRadians = NaN).toThrow(ColorError);
			expect(() => color.HRadians = Infinity).toThrow(ColorError);
			expect(() => color.HRadians = -Infinity).toThrow(ColorError);
		});
	});

	describe('String Representation', () => {
		it('should return correct string with default values', () => {
			const color = new CAM16();
			expect(color.ToString()).toBe('CAM16(0, 0, 0, 0, 0, 0, 0, 0, 0)');
		});
	});

	describe('Conversion from XYZ', () => {
		it('should convert black to black', () => {
			const cam = CAM16.From(new XYZ(0, 0, 0));
			expect(cam.H).toBeCloseTo(0);
			expect(cam.C).toBeCloseTo(0);
			expect(cam.J).toBeCloseTo(0);
			expect(cam.Q).toBeCloseTo(0);
			expect(cam.M).toBeCloseTo(0);
			expect(cam.S).toBeCloseTo(0);
		});

		it('should convert D65 white to near white', () => {
			const { X, Y, Z } = XYZ.D65;
			const cam = CAM16.From(new XYZ(X, Y, Z));
			expect(cam.C).toBeCloseTo(2.86903697, 6);
			expect(cam.M).toBeCloseTo(2.265054822, 6);
			expect(cam.S).toBeCloseTo(12.068257348, 6);
			expect(cam.J).toBeCloseTo(100, 6);
		});
	});
	describe('Static Validate and From', () => {
		describe('Assert Method', () => {
			it('should pass for valid CAM16 objects', () => {
				const validColor = new CAM16(180, 50, 75, 80, 40, 60);
				expect(() => CAM16.Assert(validColor)).not.toThrow();
			});

			it('should throw Error for non-CAM16 objects', () => {
				expect(() => CAM16.Assert({})).toThrow('Not a CAM16 Object');
				expect(() => CAM16.Assert(null)).toThrow('Not a CAM16 Object');
				expect(() => CAM16.Assert(undefined)).toThrow('Not a CAM16 Object');
				expect(() => CAM16.Assert('not a color')).toThrow('Not a CAM16 Object');
				expect(() => CAM16.Assert(42)).toThrow('Not a CAM16 Object');
			});

			it('should throw ColorError for invalid H (hue) values', () => {
				const validColor1 = new CAM16(180, 50, 75, 80, 40, 60);
				const validColor2 = new CAM16(180, 50, 75, 80, 40, 60);
				const validColor3 = new CAM16(180, 50, 75, 80, 40, 60);
				// Manually set invalid values to bypass constructor validation
				// @ts-expect-error accessing private for testing
				validColor1.components[0] = -1;
				// @ts-expect-error accessing private for testing
				validColor2.components[0] = 360;
				// @ts-expect-error accessing private for testing
				validColor3.components[0] = Number.NaN;

				expect(() => CAM16.Assert(validColor1)).toThrow(ColorError);
				expect(() => CAM16.Assert(validColor2)).toThrow(ColorError);
				expect(() => CAM16.Assert(validColor3)).toThrow(ColorError);
			});

			it('should throw ColorError for invalid C (chroma) values', () => {
				const validColor1 = new CAM16(180, 50, 75, 80, 40, 60);
				const validColor2 = new CAM16(180, 50, 75, 80, 40, 60);
				// Manually set invalid values to bypass constructor validation
				// @ts-expect-error accessing private for testing
				validColor1.components[1] = -1;
				// @ts-expect-error accessing private for testing
				validColor2.components[1] = Number.NaN;
				expect(() => CAM16.Assert(validColor1)).toThrow(ColorError);
				expect(() => CAM16.Assert(validColor2)).toThrow(ColorError);
			});

			it('should throw ColorError for invalid J (lightness) values', () => {
				const validColor1 = new CAM16(180, 50, 75, 80, 40, 60);
				const validColor2 = new CAM16(180, 50, 75, 80, 40, 60);
				const validColor3 = new CAM16(180, 50, 75, 80, 40, 60);
				// Manually set invalid values to bypass constructor validation
				// @ts-expect-error accessing private for testing
				validColor1.components[2] = -1;
				// @ts-expect-error accessing private for testing
				validColor2.components[2] = 101;
				// @ts-expect-error accessing private for testing
				validColor3.components[2] = Number.NaN;
				expect(() => CAM16.Assert(validColor1)).toThrow(ColorError);
				expect(() => CAM16.Assert(validColor2)).toThrow(ColorError);
				expect(() => CAM16.Assert(validColor3)).toThrow(ColorError);
			});

			it('should throw ColorError for invalid Q (brightness) values', () => {
				const validColor1 = new CAM16(180, 50, 75, 80, 40, 60);
				const validColor2 = new CAM16(180, 50, 75, 80, 40, 60);
				// Manually set invalid values to bypass constructor validation
				// @ts-expect-error accessing private for testing
				validColor1.components[3] = -1;
				// @ts-expect-error accessing private for testing
				validColor2.components[3] = Number.NaN;
				expect(() => CAM16.Assert(validColor1)).toThrow(ColorError);
				expect(() => CAM16.Assert(validColor2)).toThrow(ColorError);
			});

			it('should throw ColorError for invalid M (colorfulness) values', () => {
				const validColor1 = new CAM16(180, 50, 75, 80, 40, 60);
				const validColor2 = new CAM16(180, 50, 75, 80, 40, 60);
				// Manually set invalid values to bypass constructor validation
				// @ts-expect-error accessing private for testing
				validColor1.components[4] = -1;
				// @ts-expect-error accessing private for testing
				validColor2.components[4] = Number.NaN;
				expect(() => CAM16.Assert(validColor1)).toThrow(ColorError);
				expect(() => CAM16.Assert(validColor2)).toThrow(ColorError);
			});

			it('should throw ColorError for invalid S (saturation) values', () => {
				const validColor1 = new CAM16(180, 50, 75, 80, 40, 60);
				const validColor2 = new CAM16(180, 50, 75, 80, 40, 60);
				// Manually set invalid values to bypass constructor validation
				// @ts-expect-error accessing private for testing
				validColor1.components[5] = -1;
				// @ts-expect-error accessing private for testing
				validColor2.components[5] = Number.NaN;
				expect(() => CAM16.Assert(validColor1)).toThrow(ColorError);
				expect(() => CAM16.Assert(validColor2)).toThrow(ColorError);
			});
		});

		describe('Validate Method', () => {
			it('should return false for invalid validate input', () => {
				expect(CAM16.Validate({} as any)).toBe(false);
			});

			it('should return true for valid CAM16 colors', () => {
				const validColor = new CAM16(180, 50, 75, 80, 40, 60);
				expect(CAM16.Validate(validColor)).toBe(true);
			});

			it('should return false for invalid CAM16 colors', () => {
				const invalidColor = { h: 400, c: 50, j: 75, q: 80, m: 40, s: 60 };
				expect(CAM16.Validate(invalidColor)).toBe(false);
			});

			it('should return false for CAM16 objects with invalid values', () => {
				const validColor1 = new CAM16(180, 50, 75, 80, 40, 60);
				const validColor2 = new CAM16(180, 50, 75, 80, 40, 60);
				const validColor3 = new CAM16(180, 50, 75, 80, 40, 60);
				// Manually set invalid values to bypass constructor validation
				// @ts-expect-error accessing private for testing
				validColor1.components[0] = -1;
				// @ts-expect-error accessing private for testing
				validColor2.components[0] = 360;
				// @ts-expect-error accessing private for testing
				validColor3.components[0] = Number.NaN;

				expect(() => CAM16.Assert(validColor1)).toThrow(ColorError);
				expect(() => CAM16.Assert(validColor2)).toThrow(ColorError);
				expect(() => CAM16.Assert(validColor3)).toThrow(ColorError);
			});
		});

		describe('From Method', () => {
			it('should throw on invalid From input', () => {
				// @ts-expect-error invalid conversion
				expect(() => CAM16.From({})).toThrow('Cannot Convert to CAM16');
			});
		});
	});

	describe('CAM16 Viewing Conditions Coverage', () => {
		it('should cover labInvf else branch with low backgroundLstar', () => {
			// Test constructor with low backgroundLstar to trigger the else branch
			// in labInvf function (line 20 in cam16-viewing-conditions.ts)

			// Use a low backgroundLstar (< 8) to trigger ft3 <= e condition in labInvf
			const conditions = new CAM16ViewingConditions(
				undefined,  // whitePoint (uses default D65)
				undefined,  // adaptingLuminance (uses default)
				5.0,        // backgroundLstar - low value to trigger else branch
				undefined,  // surround (uses default)
				undefined,   // discountingIlluminant (uses default)
			);			// Just verify the object was created successfully
			expect(conditions).toBeDefined();
			expect(typeof conditions.N).toBe('number');
		});
	});

	describe('Clone method', () => {
		test('should create a new CAM16 instance with same values', () => {
			const original = new CAM16(50, 20, 30, 0.8, 0.9);
			const cloned = original.Clone();
			expect(cloned).toBeInstanceOf(CAM16);
			expect(cloned).not.toBe(original);
			expect(cloned.H).toBe(original.H);
			expect(cloned.C).toBe(original.C);
			expect(cloned.J).toBe(original.J);
			expect(cloned.Q).toBe(original.Q);
			expect(cloned.M).toBe(original.M);
		});
		test('should create independent instances', () => {
			const original = new CAM16(50, 20, 30, 0.8, 0.9);
			const cloned = original.Clone();
			// Modify the cloned instance
			cloned.H = 180;
			cloned.C = 0.5;
			cloned.J = 60;
			cloned.Q = 1.2;
			cloned.M = 0.7;
			// Original should remain unchanged
			expect(original.H).toBe(50);
			expect(original.C).toBe(20);
			expect(original.J).toBe(30);
			expect(original.Q).toBe(0.8);
			expect(original.M).toBe(0.9);
			// Cloned should have new values
			expect(cloned.H).toBe(180);
			expect(cloned.C).toBe(0.5);
			expect(cloned.J).toBe(60);
			expect(cloned.Q).toBe(1.2);
			expect(cloned.M).toBe(0.7);
		});
		test('should preserve component array values', () => {
			const original = new CAM16(50, 20, 30, 0.8, 0.9);
			const cloned = original.Clone();
			expect(cloned.ToArray()).toEqual(original.ToArray());
			expect(cloned.ToArray()).toEqual([50, 20, 30, 0.8, 0.9]);
		});
		test('should work with boundary values', () => {
			const black = new CAM16(0, 0, 0, 0, 0);
			const white = new CAM16(100, 0, 0, 1, 360);
			const clonedBlack = black.Clone();
			const clonedWhite = white.Clone();
			expect(clonedBlack.ToArray()).toEqual([0, 0, 0, 0, 0]);
			expect(clonedWhite.ToArray()).toEqual([100, 0, 0, 1, 360]);
		});
		test('should return correct type', () => {
			const original = new CAM16(50, 20, 30, 0.8, 0.9);
			const cloned = original.Clone();
			expect(cloned).toBeInstanceOf(CAM16);
			expect(cloned.constructor).toBe(CAM16);
		});
	});
});
