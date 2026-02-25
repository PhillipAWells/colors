import { XyY } from './xyy.js';
import { XYZ } from './xyz.js';

describe('Color XyY', () => {
	describe('Constructor and Validation', () => {
		it('should create a XyY color with default values', () => {
			const color = new XyY();
			expect(color.X).toBe(0);
			expect(color.Y1).toBe(0);
			expect(color.Y2).toBe(0);
		});

		it('should create a XyY color with specified values', () => {
			const color = new XyY(0.1, 0.2, 0.3);
			expect(color.X).toBe(0.1);
			expect(color.Y1).toBe(0.2);
			expect(color.Y2).toBe(0.3);
		});

		it('should throw error when creating a XyY color with invalid values', () => {
			expect(() => new XyY(-0.1, 0, 0)).toThrow();
			expect(() => new XyY(0, -0.1, 0)).toThrow();
			expect(() => new XyY(0, 0, -0.1)).toThrow();
		});

		it('should validate a XyY color object correctly', () => {
			const color = new XyY(0.2, 0.3, 0.4);
			expect(XyY.Validate(color)).toBe(true);
			expect(XyY.Validate({})).toBe(false);

			const invalidColor = new XyY(0.2, 0.3, 0.4);
			// Negative x
			invalidColor.GetComponentsForTesting()[0] = -0.2;
			expect(XyY.Validate(invalidColor)).toBe(false);
			// NaN y
			invalidColor.GetComponentsForTesting()[0] = 0.2;
			invalidColor.GetComponentsForTesting()[1] = NaN;
			expect(XyY.Validate(invalidColor)).toBe(false);
			// Negative y
			invalidColor.GetComponentsForTesting()[1] = -0.1;
			expect(XyY.Validate(invalidColor)).toBe(false);
			// NaN Y
			invalidColor.GetComponentsForTesting()[1] = 0.3;
			invalidColor.GetComponentsForTesting()[2] = NaN;
			expect(XyY.Validate(invalidColor)).toBe(false);
			// Negative Y
			invalidColor.GetComponentsForTesting()[2] = -0.5;
			expect(XyY.Validate(invalidColor)).toBe(false);
		});
	});

	describe('Getters and Setters', () => {
		it('should set and get the X component correctly', () => {
			const color = new XyY();
			color.X = 0.5;
			expect(color.X).toBe(0.5);
			expect(() => {
				color.X = -0.1;
			}).toThrow('Channel(X) must be a finite number between 0 and 1.');
		});

		it('should set and get the Y1 component correctly', () => {
			const color = new XyY();
			color.Y1 = 0.6;
			expect(color.Y1).toBe(0.6);
			expect(() => {
				color.Y1 = -0.2;
			}).toThrow('Channel(Y1) must be a finite number between 0 and 1.');
		});

		it('should set and get the Y2 component correctly', () => {
			const color = new XyY();
			color.Y2 = 0.7;
			expect(color.Y2).toBe(0.7);
			expect(() => {
				color.Y2 = -0.3;
			}).toThrow('Channel(Y2) must be a finite number greater than or equal to 0.');
		});
	});

	describe('String Representation', () => {
		it('should represent a XyY color as a string', () => {
			const color = new XyY(0.1, 0.2, 0.3);
			expect(color.ToString()).toBe('XyY(0.1, 0.2, 0.3)');
		});
	});

	describe('Clone method', () => {
		it('should create a new instance with identical values', () => {
			const original = new XyY(0.25, 0.5, 0.75);
			const clone = original.Clone();
			expect(clone).not.toBe(original);
			expect(clone.X).toBe(original.X);
			expect(clone.Y1).toBe(original.Y1);
			expect(clone.Y2).toBe(original.Y2);
			expect(clone.ToString()).toBe(original.ToString());
		});

		it('should ensure independence of instances', () => {
			const original = new XyY(0.1, 0.2, 0.3);
			const clone = original.Clone();
			clone.X = 0.9;
			clone.Y1 = 0.8;
			clone.Y2 = 0.7;
			expect(original.X).toBe(0.1);
			expect(original.Y1).toBe(0.2);
			expect(original.Y2).toBe(0.3);
			expect(clone.X).toBe(0.9);
			expect(clone.Y1).toBe(0.8);
			expect(clone.Y2).toBe(0.7);
		});

		it('should preserve the component array values', () => {
			const original = new XyY(0.4, 0.5, 0.6);
			const clone = original.Clone();
			expect(clone.GetComponentsForTesting()).not.toBe(original.GetComponentsForTesting());
			expect(clone.GetComponentsForTesting()).toEqual(original.GetComponentsForTesting());
		});

		it('should clone correctly with boundary/extreme values', () => {
			const values = [
				[0, 0, 0],
				[1, 1, 1],
				[0.3127, 0.329, 100], // D65 white point
				[Number.EPSILON, 1 - Number.EPSILON, Number.MAX_VALUE],
			];

			for (const [x, y, Y] of values) {
				const original = new XyY(x, y, Y);
				const clone = original.Clone();
				expect(clone.X).toBe(x);
				expect(clone.Y1).toBe(y);
				expect(clone.Y2).toBe(Y);
			}
		});

		it('should return the correct type', () => {
			const original = new XyY(0.1, 0.2, 0.3);
			const clone = original.Clone();
			expect(clone).toBeInstanceOf(XyY);
		});
	});

	describe('Conversion', () => {
		test('Convert from XYZ', () => {
			const xyz1 = new XYZ(0, 0, 0);
			const xyY1 = XyY.From(xyz1);
			expect(xyY1.X).toBe(0);
			expect(xyY1.Y1).toBe(0);
			expect(xyY1.Y2).toBe(0);

			const xyz2 = new XYZ(1, 1, 1);
			const xyY2 = XyY.From(xyz2);
			expect(xyY2.X).toBeCloseTo(1 / 3);
			expect(xyY2.Y1).toBeCloseTo(1 / 3);
			expect(xyY2.Y2).toBe(1);

			const xyz3 = new XYZ(2, 3, 4);
			const xyY3 = XyY.From(xyz3);
			const sum = 2 + 3 + 4;
			expect(xyY3.X).toBeCloseTo(2 / sum);
			expect(xyY3.Y1).toBeCloseTo(3 / sum);
			expect(xyY3.Y2).toBe(3);
		});

		test('should throw error when converting from an unsupported color type', () => {
			// @ts-expect-error - Testing invalid conversion with non-color object
			expect(() => XyY.From({})).toThrow('Cannot Convert to XyY');
		});

		test('should throw error for unknown component in AssertComponent', () => {
			// Test the default case in AssertComponent by manipulating the protected method
			const color = new XyY(0.3, 0.3, 50);			// Use reflection to access protected method and test default case
			// @ts-expect-error - Accessing protected method for testing coverage
			expect(() => XyY.AssertComponent('invalid' as any, color)).toThrow('Unknown XyY component: invalid');
		});
	});
});
