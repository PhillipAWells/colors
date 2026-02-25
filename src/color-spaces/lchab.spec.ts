import { LCHab } from './lchab.js';
import { Lab } from './lab.js';

describe('Color LCHab', () => {
	describe('Constructor and Validation', () => {
		it('should create an LCHab color with default values', () => {
			const color = new LCHab();
			expect(color.L).toBe(0);
			expect(color.C).toBe(0);
			expect(color.H).toBe(0);
		});

		it('should create an LCHab color with specified values', () => {
			const color = new LCHab(50, 20, 180);
			expect(color.L).toBe(50);
			expect(color.C).toBe(20);
			expect(color.H).toBe(180);
		});

		it('should throw error when creating with invalid values', () => {
			expect(() => new LCHab(Number.NaN, 0, 0)).toThrow('Channel(L) must be in range [0, 100].');
			expect(() => new LCHab(0, Number.NaN, 0)).toThrow('Channel(C) must be a finite number greater than or equal to 0.');
			expect(() => new LCHab(0, 0, Number.NaN)).toThrow('Channel(H) must be in range [0, 360].');
			expect(() => new LCHab(-1, 0, 0)).toThrow('Channel(L) must be in range [0, 100].');
			expect(() => new LCHab(0, -1, 0)).toThrow('Channel(C) must be a finite number greater than or equal to 0.');
			expect(() => new LCHab(0, 0, -10)).toThrow('Channel(H) must be in range [0, 360].');
			expect(() => new LCHab(0, 0, 400)).toThrow('Channel(H) must be in range [0, 360].');
		});
	});

	describe('Getters and Setters', () => {
		it('should set and get L, C, H components correctly', () => {
			const color = new LCHab();
			color.L = 60;
			color.C = 15;
			color.H = 270;
			expect(color.L).toBe(60);
			expect(color.C).toBe(15);
			expect(color.H).toBe(270);
		});
	});

	describe('String Representation', () => {
		it('should represent an LCHab color as a string', () => {
			const color = new LCHab(40, 10, 90);
			expect(color.ToString()).toBe('LCHab(40, 10, 90)');
		});
	});

	describe('Conversion', () => {
		test('Convert from Lab', () => {
			const lab = new Lab(60, 0, 0);
			const lch = LCHab.From(lab);
			expect(lch.L).toBe(lab.L);
			expect(lch.C).toBeCloseTo(0);
			expect(lch.H).toBe(360);

			const lab2 = new Lab(50, 10, 10);
			const lch2 = LCHab.From(lab2);
			const expectedC = Math.sqrt((10 * 10) + (10 * 10));
			const expectedH = Math.atan2(10, 10) * 180 / Math.PI;
			expect(lch2.L).toBe(50);
			expect(lch2.C).toBeCloseTo(expectedC);
			expect(lch2.H).toBeCloseTo(expectedH);
		});

		test('should throw error when converting from unsupported type', () => {
			// @ts-expect-error - invalid conversion
			expect(() => LCHab.From({})).toThrow('Cannot convert to LCHab');
		});
	});
});

describe('Clone method', () => {
	test('should create a new LCHab instance with same values', () => {
		const original = new LCHab(50, 20, 180);
		const cloned = original.Clone();
		expect(cloned).toBeInstanceOf(LCHab);
		expect(cloned).not.toBe(original);
		expect(cloned.L).toBe(original.L);
		expect(cloned.C).toBe(original.C);
		expect(cloned.H).toBe(original.H);
	});

	test('should create independent instances', () => {
		const original = new LCHab(50, 20, 180);
		const cloned = original.Clone();
		cloned.L = 80;
		cloned.C = 10;
		cloned.H = 90;
		expect(original.L).toBe(50);
		expect(original.C).toBe(20);
		expect(original.H).toBe(180);
		expect(cloned.L).toBe(80);
		expect(cloned.C).toBe(10);
		expect(cloned.H).toBe(90);
	});

	test('should preserve component array values', () => {
		const original = new LCHab(50, 20, 180);
		const cloned = original.Clone();
		expect(cloned.ToArray()).toEqual(original.ToArray());
		expect(cloned.ToArray()).toEqual([50, 20, 180]);
	});

	test('should work with boundary values', () => {
		const zero = new LCHab(0, 0, 0);
		const max = new LCHab(100, 100, 360);
		const clonedZero = zero.Clone();
		const clonedMax = max.Clone();
		expect(clonedZero.ToArray()).toEqual([0, 0, 0]);
		expect(clonedMax.ToArray()).toEqual([100, 100, 360]);
	});

	test('should return correct type', () => {
		const original = new LCHab(50, 20, 180);
		const cloned = original.Clone();
		expect(cloned).toBeInstanceOf(LCHab);
		expect(cloned.constructor).toBe(LCHab);
	});
});
