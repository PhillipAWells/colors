import { LUV } from './luv.js';
import { XYZ } from './xyz.js';
import { LCHuv } from './lchuv.js';

describe('Color LUV', () => {
	test('Created and Defaults', () => {
		const color = new LUV();
		expect(color.L).toBe(0);
		expect(color.U).toBe(0);
		expect(color.V).toBe(0);
	});

	test('ToString', () => {
		const color = new LUV(10, 20, 30);
		expect(color.ToString()).toBe('LUV(10, 20, 30)');
	});

	test('Validation and Setters', () => {
		const color = new LUV(5, 6, 7);
		// valid sets
		expect(() => {
			color.L = 1;
			color.U = 2;
			color.V = 3;
		}).not.toThrow();
		expect(color.L).toBe(1);
		expect(color.U).toBe(2);
		expect(color.V).toBe(3);
		// negative U and V are valid in LUV space (opponent colors)
		expect(() => {
			color.U = -50;
			color.V = -30;
		}).not.toThrow();
		expect(color.U).toBe(-50);
		expect(color.V).toBe(-30);
		// invalid sets - only negative L and non-finite values
		expect(() => {
			color.L = -1;
		}).toThrow('Channel(L) must be a finite number greater than or equal to 0.');
		expect(() => {
			color.L = Number.NaN;
		}).toThrow('Channel(L) must be a finite number greater than or equal to 0.');
		expect(() => {
			color.U = Number.NaN;
		}).toThrow('Channel(U) must be a finite number.');
		expect(() => {
			color.V = Number.NaN;
		}).toThrow('Channel(V) must be a finite number.');
		expect(() => {
			color.L = Infinity;
		}).toThrow('Channel(L) must be a finite number greater than or equal to 0.');
		expect(() => {
			color.U = Infinity;
		}).toThrow('Channel(U) must be a finite number.');
		expect(() => {
			color.V = Infinity;
		}).toThrow('Channel(V) must be a finite number.');
		// invalid constructor
		expect(() => new LUV(Number.NaN, 0, 0)).toThrow('Channel(L) must be a finite number greater than or equal to 0.');
		expect(() => new LUV(0, Number.NaN, 0)).toThrow('Channel(U) must be a finite number.');
		expect(() => new LUV(0, 0, Number.NaN)).toThrow('Channel(V) must be a finite number.');
		expect(() => new LUV(-1, 0, 0)).toThrow('Channel(L) must be a finite number greater than or equal to 0.');
	});

	describe('Conversion', () => {
		test('Convert from XYZ', () => {
			const whiteXYZ = XYZ.D65;
			const luv = LUV.From(whiteXYZ);
			expect(luv.L).toBeCloseTo(100);
			// U,V near zero for white
			expect(luv.U).toBeCloseTo(0);
			expect(luv.V).toBeCloseTo(0);
		});

		test('Convert from LCHuv', () => {
			const lch = new LCHuv(50, 0, 0);
			const luv = LUV.From(lch);
			expect(luv.L).toBe(50);
			expect(luv.U).toBeCloseTo(0);
			expect(luv.V).toBeCloseTo(0);
		});

		test('Unsupported conversion error', () => {
			// @ts-expect-error invalid
			expect(() => LUV.From({})).toThrow('Cannot convert to LUV');
		});
	});
});

describe('Clone method', () => {
	test('should create a new LUV instance with same values', () => {
		const original = new LUV(10, 20, 30);
		const cloned = original.Clone();
		expect(cloned).toBeInstanceOf(LUV);
		expect(cloned).not.toBe(original);
		expect(cloned.L).toBe(original.L);
		expect(cloned.U).toBe(original.U);
		expect(cloned.V).toBe(original.V);
	});

	test('should create independent instances', () => {
		const original = new LUV(10, 20, 30);
		const cloned = original.Clone();
		cloned.L = 80;
		cloned.U = 10;
		cloned.V = 90;
		expect(original.L).toBe(10);
		expect(original.U).toBe(20);
		expect(original.V).toBe(30);
		expect(cloned.L).toBe(80);
		expect(cloned.U).toBe(10);
		expect(cloned.V).toBe(90);
	});

	test('should preserve component array values', () => {
		const original = new LUV(10, 20, 30);
		const cloned = original.Clone();
		expect(cloned.ToArray()).toEqual(original.ToArray());
		expect(cloned.ToArray()).toEqual([10, 20, 30]);
	});

	test('should work with boundary values', () => {
		const zero = new LUV(0, 0, 0);
		const neg = new LUV(0, -100, -100);
		const max = new LUV(100, 100, 100);
		const clonedZero = zero.Clone();
		const clonedNeg = neg.Clone();
		const clonedMax = max.Clone();
		expect(clonedZero.ToArray()).toEqual([0, 0, 0]);
		expect(clonedNeg.ToArray()).toEqual([0, -100, -100]);
		expect(clonedMax.ToArray()).toEqual([100, 100, 100]);
	});

	test('should return correct type', () => {
		const original = new LUV(10, 20, 30);
		const cloned = original.Clone();
		expect(cloned).toBeInstanceOf(LUV);
		expect(cloned.constructor).toBe(LUV);
	});
});
