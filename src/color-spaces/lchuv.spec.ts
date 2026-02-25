import { LCHuv } from './lchuv.js';
import { LUV } from './luv.js';

describe('Color LCHuv', () => {
	test('Created and Defaults', () => {
		const color = new LCHuv();
		expect(color.L).toBe(0);
		expect(color.C).toBe(0);
		expect(color.H).toBe(0);
	});

	test('Constructor with values', () => {
		const color = new LCHuv(50, 25, 300);
		expect(color.L).toBe(50);
		expect(color.C).toBe(25);
		expect(color.H).toBe(300);
	});

	test('Validation errors', () => {
		expect(() => new LCHuv(Number.NaN, 0, 0)).toThrow('Channel(L) must be in range [0, 100].');
		expect(() => new LCHuv(0, Number.NaN, 0)).toThrow('Channel(C) must be a finite number greater than or equal to 0.');
		expect(() => new LCHuv(0, 0, Number.NaN)).toThrow('Channel(H) must be in range [0, 360].');
		expect(() => new LCHuv(-1, 0, 0)).toThrow('Channel(L) must be in range [0, 100].');
		expect(() => new LCHuv(0, -1, 0)).toThrow('Channel(C) must be a finite number greater than or equal to 0.');
		expect(() => new LCHuv(0, 0, 400)).toThrow('Channel(H) must be in range [0, 360].');
	});

	test('Getters and Setters', () => {
		const color = new LCHuv();
		color.L = 60;
		color.C = 15;
		color.H = 180;
		expect(color.L).toBe(60);
		expect(color.C).toBe(15);
		expect(color.H).toBe(180);
	});

	test('ToString', () => {
		expect(new LCHuv(10, 5, 90).ToString()).toBe('LCHuv(10, 5, 90)');
	});

	test('Conversion from LUV', () => {
		const luv = new LUV(70, 0, 0);
		const lch = LCHuv.From(luv);
		expect(lch.L).toBe(70);
		expect(lch.C).toBeCloseTo(0);
		expect(lch.H).toBe(360);
	});

	test('Unsupported conversion error', () => {
		// @ts-expect-error invalid
		expect(() => LCHuv.From({})).toThrow('Cannot convert to LCHuv');
	});
});

describe('Clone method', () => {
	test('should create a new LCHuv instance with same values', () => {
		const original = new LCHuv(50, 25, 300);
		const cloned = original.Clone();
		expect(cloned).toBeInstanceOf(LCHuv);
		expect(cloned).not.toBe(original);
		expect(cloned.L).toBe(original.L);
		expect(cloned.C).toBe(original.C);
		expect(cloned.H).toBe(original.H);
	});

	test('should create independent instances', () => {
		const original = new LCHuv(50, 25, 300);
		const cloned = original.Clone();
		cloned.L = 80;
		cloned.C = 10;
		cloned.H = 90;
		expect(original.L).toBe(50);
		expect(original.C).toBe(25);
		expect(original.H).toBe(300);
		expect(cloned.L).toBe(80);
		expect(cloned.C).toBe(10);
		expect(cloned.H).toBe(90);
	});

	test('should preserve component array values', () => {
		const original = new LCHuv(50, 25, 300);
		const cloned = original.Clone();
		expect(cloned.ToArray()).toEqual(original.ToArray());
		expect(cloned.ToArray()).toEqual([50, 25, 300]);
	});

	test('should work with boundary values', () => {
		const zero = new LCHuv(0, 0, 0);
		const max = new LCHuv(100, 100, 360);
		const clonedZero = zero.Clone();
		const clonedMax = max.Clone();
		expect(clonedZero.ToArray()).toEqual([0, 0, 0]);
		expect(clonedMax.ToArray()).toEqual([100, 100, 360]);
	});

	test('should return correct type', () => {
		const original = new LCHuv(50, 25, 300);
		const cloned = original.Clone();
		expect(cloned).toBeInstanceOf(LCHuv);
		expect(cloned.constructor).toBe(LCHuv);
	});
});
