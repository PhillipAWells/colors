import { LMS } from './lms.js';
import { XYZ } from './xyz.js';

describe('Color LMS', () => {
	test('Created and Defaults', () => {
		const defaultColor = new LMS();
		expect(defaultColor.L).toBe(0);
		expect(defaultColor.M).toBe(0);
		expect(defaultColor.S).toBe(0);
		expect(defaultColor.ToArray()).toStrictEqual([0, 0, 0]);

		const color = new LMS(10, 20, 30);
		expect(color.L).toBe(10);
		expect(color.M).toBe(20);
		expect(color.S).toBe(30);
	});

	test('ToString', () => {
		const color = new LMS(1, 2, 3);
		expect(color.ToString()).toBe('LMS(1, 2, 3)');
	});

	test('Validation and Setters', () => {
		const color = new LMS(5, 6, 7);
		// valid sets
		expect(() => {
			color.L = 0;
			color.M = 1;
			color.S = 2;
		}).not.toThrow();
		expect(color.L).toBe(0);
		expect(color.M).toBe(1);
		expect(color.S).toBe(2);
		// invalid sets
		expect(() => {
			color.L = -1;
		}).toThrow('Channel(L) must be a finite number greater than or equal to 0.');
		expect(() => {
			color.M = -1;
		}).toThrow('Channel(M) must be a finite number greater than or equal to 0.');
		expect(() => {
			color.S = -1;
		}).toThrow('Channel(S) must be a finite number greater than or equal to 0.');
		// invalid constructor
		expect(() => new LMS(Number.NaN, 0, 0)).toThrow('Channel(L) must be a finite number greater than or equal to 0.');
	});

	describe('Conversion', () => {
		test('Convert from XYZ', () => {
			const whiteXYZ = new XYZ(XYZ.D65.X, XYZ.D65.Y, XYZ.D65.Z);
			const whiteLMS = LMS.From(whiteXYZ);
			expect(whiteLMS.L).toBeCloseTo(97.04245600000002, 4);

			// black
			const blackLMS = LMS.From(new XYZ(0, 0, 0));
			expect(blackLMS.L).toBeCloseTo(0);
			expect(blackLMS.M).toBeCloseTo(0);
			expect(blackLMS.S).toBeCloseTo(0);
		});
		test('Unsupported conversion error', () => {
			// @ts-expect-error invalid
			expect(() => LMS.From({})).toThrow('Cannot Convert to LMS');
		});
	});
});

describe('Clone method', () => {
	test('should create a new LMS instance with same values', () => {
		const original = new LMS(10, 20, 30);
		const cloned = original.Clone();
		expect(cloned).toBeInstanceOf(LMS);
		expect(cloned).not.toBe(original);
		expect(cloned.L).toBe(original.L);
		expect(cloned.M).toBe(original.M);
		expect(cloned.S).toBe(original.S);
	});

	test('should create independent instances', () => {
		const original = new LMS(10, 20, 30);
		const cloned = original.Clone();
		cloned.L = 80;
		cloned.M = 10;
		cloned.S = 90;
		expect(original.L).toBe(10);
		expect(original.M).toBe(20);
		expect(original.S).toBe(30);
		expect(cloned.L).toBe(80);
		expect(cloned.M).toBe(10);
		expect(cloned.S).toBe(90);
	});

	test('should preserve component array values', () => {
		const original = new LMS(10, 20, 30);
		const cloned = original.Clone();
		expect(cloned.ToArray()).toEqual(original.ToArray());
		expect(cloned.ToArray()).toEqual([10, 20, 30]);
	});

	test('should work with boundary values', () => {
		const zero = new LMS(0, 0, 0);
		const max = new LMS(100, 100, 100);
		const clonedZero = zero.Clone();
		const clonedMax = max.Clone();
		expect(clonedZero.ToArray()).toEqual([0, 0, 0]);
		expect(clonedMax.ToArray()).toEqual([100, 100, 100]);
	});

	test('should return correct type', () => {
		const original = new LMS(10, 20, 30);
		const cloned = original.Clone();
		expect(cloned).toBeInstanceOf(LMS);
		expect(cloned.constructor).toBe(LMS);
	});
});
