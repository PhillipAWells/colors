import { HunterLab } from './hunterlab.js';
import { XYZ } from './xyz.js';

describe('Color HunterLab', () => {
	test('Created', () => {
		const defaultColor = new HunterLab();
		expect(defaultColor).toBeDefined();
		expect(defaultColor).toBeInstanceOf(HunterLab);
		expect(defaultColor.L).toBe(0);
		expect(defaultColor.A).toBe(0);
		expect(defaultColor.B).toBe(0);
		expect(defaultColor.ToArray()).toStrictEqual([0, 0, 0]);

		const color = new HunterLab(50, 25, -25);
		expect(color.L).toBe(50);
		expect(color.A).toBe(25);
		expect(color.B).toBe(-25);
	});

	test('To String', () => {
		const color = new HunterLab(50.5, 0.5, -0.5);
		expect(color.ToString()).toBe('HunterLab(50.5, 0.5, -0.5)');
		expect(color.ToString('int')).toBe('HunterLab(51, 64, -64)');
	});

	test('Validation', () => {
		expect(() => new HunterLab(50, 0, 0)).not.toThrow();
		expect(() => new HunterLab(Number.NaN, 0, 0)).toThrow('Channel(L) must be a finite number.');
		expect(() => new HunterLab(0, Number.NaN, 0)).toThrow('Channel(A) must be a finite number.');
		expect(() => new HunterLab(0, 0, Number.NaN)).toThrow('Channel(B) must be a finite number.');
		// Negative values should be allowed as the implementation only checks for finite numbers
		expect(() => new HunterLab(-1, 0, 0)).not.toThrow();
		expect(() => new HunterLab(101, 0, 0)).not.toThrow();
		// Test Validate method returns boolean instead of throwing
		expect(HunterLab.Validate({})).toBe(false);
		expect(HunterLab.Validate(new HunterLab(50, 0, 0))).toBe(true);
	});

	describe('Conversion', () => {
		test('Convert from XYZ', () => {
			const whiteXYZ = new XYZ(XYZ.D65.X, XYZ.D65.Y, XYZ.D65.Z);
			const whiteHL = HunterLab.From(whiteXYZ);
			expect(whiteHL.L).toBeCloseTo(100);
			expect(whiteHL.A).toBeCloseTo(0);
			expect(whiteHL.B).toBeCloseTo(0);

			const blackXYZ = new XYZ(0, 0, 0);
			const blackHL = HunterLab.From(blackXYZ);
			expect(blackHL.L).toBeCloseTo(0);
			expect(blackHL.A).toBeCloseTo(0);
			expect(blackHL.B).toBeCloseTo(0);
		});

		test('should throw error when converting from an unsupported type', () => {
			// @ts-expect-error - Testing invalid conversion
			expect(() => HunterLab.From({})).toThrow('Cannot Convert to Hunter Lab');
		});
	});
});

describe('Clone method', () => {
	test('should create a new HunterLab instance with same values', () => {
		const original = new HunterLab(50, 25, -25);
		const cloned = original.Clone();
		expect(cloned).toBeInstanceOf(HunterLab);
		expect(cloned).not.toBe(original);
		expect(cloned.L).toBe(original.L);
		expect(cloned.A).toBe(original.A);
		expect(cloned.B).toBe(original.B);
	});

	test('should create independent instances', () => {
		const original = new HunterLab(50, 25, -25);
		const cloned = original.Clone();
		cloned.L = 80;
		cloned.A = 10;
		cloned.B = -10;
		expect(original.L).toBe(50);
		expect(original.A).toBe(25);
		expect(original.B).toBe(-25);
		expect(cloned.L).toBe(80);
		expect(cloned.A).toBe(10);
		expect(cloned.B).toBe(-10);
	});

	test('should preserve component array values', () => {
		const original = new HunterLab(50, 25, -25);
		const cloned = original.Clone();
		expect(cloned.ToArray()).toEqual(original.ToArray());
		expect(cloned.ToArray()).toEqual([50, 25, -25]);
	});

	test('should work with boundary values', () => {
		const zero = new HunterLab(0, 0, 0);
		const neg = new HunterLab(-1, -1, -1);
		const pos = new HunterLab(101, 1, 1);
		const clonedZero = zero.Clone();
		const clonedNeg = neg.Clone();
		const clonedPos = pos.Clone();
		expect(clonedZero.ToArray()).toEqual([0, 0, 0]);
		expect(clonedNeg.ToArray()).toEqual([-1, -1, -1]);
		expect(clonedPos.ToArray()).toEqual([101, 1, 1]);
	});

	test('should return correct type', () => {
		const original = new HunterLab(50, 25, -25);
		const cloned = original.Clone();
		expect(cloned).toBeInstanceOf(HunterLab);
		expect(cloned.constructor).toBe(HunterLab);
	});
});
