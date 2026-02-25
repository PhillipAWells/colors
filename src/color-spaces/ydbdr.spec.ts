import { YDbDr } from './ydbdr.js';

describe('Color YDbDr', () => {
	describe('Constructor and Validation', () => {
		it('should create default YDbDr color', () => {
			const color = new YDbDr();
			expect(color.Y).toBe(0);
			expect(color.Db).toBe(0);
			expect(color.Dr).toBe(0);
		});

		it('should create YDbDr with specified values', () => {
			const color = new YDbDr(0.7, -0.3, 0.3);
			expect(color.Y).toBe(0.7);
			expect(color.Db).toBe(-0.3);
			expect(color.Dr).toBe(0.3);
		});

		it('should throw error for invalid constructor values', () => {
			expect(() => new YDbDr(Number.NaN, 0, 0)).toThrow('Channel(Y) must be in range [0,1].');
			expect(() => new YDbDr(0, Number.NaN, 0)).toThrow('Channel(Db) must be in range [-4/3,4/3].');
			expect(() => new YDbDr(0, 0, Number.NaN)).toThrow('Channel(Dr) must be in range [-4/3,4/3].');

			expect(() => new YDbDr(-0.1, 0, 0)).toThrow('Channel(Y) must be in range [0,1].');
			expect(() => new YDbDr(1.1, 0, 0)).toThrow('Channel(Y) must be in range [0,1].');
			expect(() => new YDbDr(0, -1.6, 0)).toThrow('Channel(Db) must be in range [-4/3,4/3].');
			expect(() => new YDbDr(0, 1.6, 0)).toThrow('Channel(Db) must be in range [-4/3,4/3].');
			expect(() => new YDbDr(0, 0, -1.6)).toThrow('Channel(Dr) must be in range [-4/3,4/3].');
			expect(() => new YDbDr(0, 0, 1.6)).toThrow('Channel(Dr) must be in range [-4/3,4/3].');
		});
	});

	describe('Getters and Setters', () => {
		it('should set and get components correctly', () => {
			const color = new YDbDr();
			color.Y = 1;
			color.Db = 0.5;
			color.Dr = -0.5;
			expect(color.Y).toBe(1);
			expect(color.Db).toBe(0.5);
			expect(color.Dr).toBe(-0.5);
		});

		it('should throw for invalid sets', () => {
			const color = new YDbDr();
			expect(() => color.Y = -0.1).toThrow('Channel(Y) must be in range [0,1].');
			expect(() => color.Y = 1.1).toThrow('Channel(Y) must be in range [0,1].');
			expect(() => color.Db = -1.6).toThrow('Channel(Db) must be in range [-4/3,4/3].');
			expect(() => color.Db = 1.6).toThrow('Channel(Db) must be in range [-4/3,4/3].');
			expect(() => color.Dr = -1.6).toThrow('Channel(Dr) must be in range [-4/3,4/3].');
			expect(() => color.Dr = 1.6).toThrow('Channel(Dr) must be in range [-4/3,4/3].');
		});
	});

	describe('String Representation', () => {
		it('should return correct string', () => {
			const color = new YDbDr(0.2, -0.2, 0.2);
			expect(color.ToString()).toBe('YDbDr(0.2, -0.2, 0.2)');
		});
	});

	describe('Static Validate', () => {
		it('should return false for invalid input', () => {
			expect(YDbDr.Validate({} as any)).toBe(false);
		});

		it('should return false for NaN components', () => {
			const color = new YDbDr();
			color.GetComponentsForTesting()[0] = Number.NaN;
			expect(YDbDr.Validate(color)).toBe(false);
			color.GetComponentsForTesting()[0] = 0;
			color.GetComponentsForTesting()[1] = Number.NaN;
			expect(YDbDr.Validate(color)).toBe(false);
			color.GetComponentsForTesting()[1] = 0;
			color.GetComponentsForTesting()[2] = Number.NaN;
			expect(YDbDr.Validate(color)).toBe(false);
		});

		it('should return true for valid YDbDr color', () => {
			const color = new YDbDr(0.5, 0.3, -0.2);
			expect(YDbDr.Validate(color)).toBe(true);
		});
	});

	describe('Static Assert', () => {
		it('should throw for non-YDbDr objects', () => {
			expect(() => YDbDr.Assert({})).toThrow('Not a YDbDr Color');
			expect(() => YDbDr.Assert('invalid')).toThrow('Not a YDbDr Color');
			expect(() => YDbDr.Assert(null)).toThrow('Not a YDbDr Color');
		});

		it('should throw for invalid component values', () => {
			const color = new YDbDr();
			color.GetComponentsForTesting()[0] = Number.NaN;
			expect(() => YDbDr.Assert(color)).toThrow('Channel(Y) must be in range [0,1].');

			const color2 = new YDbDr();
			color2.GetComponentsForTesting()[1] = Number.NaN;
			expect(() => YDbDr.Assert(color2)).toThrow('Channel(Db) must be in range [-4/3,4/3].');

			const color3 = new YDbDr();
			color3.GetComponentsForTesting()[2] = Number.NaN;
			expect(() => YDbDr.Assert(color3)).toThrow('Channel(Dr) must be in range [-4/3,4/3].');
		});

		it('should not throw for valid YDbDr colors', () => {
			const color = new YDbDr(0.5, 0.3, -0.2);
			expect(() => YDbDr.Assert(color)).not.toThrow();
		});
	});

	describe('Setter validation for non-finite values', () => {
		it('should throw ColorError for non-finite values in setters', () => {
			const color = new YDbDr();
			// Test Y setter
			expect(() => color.Y = Number.NaN).toThrow('Channel(Y) must be in range [0,1].');
			expect(() => color.Y = Number.POSITIVE_INFINITY).toThrow('Channel(Y) must be in range [0,1].');
			expect(() => color.Y = Number.NEGATIVE_INFINITY).toThrow('Channel(Y) must be in range [0,1].');

			// Test Db setter
			expect(() => color.Db = Number.NaN).toThrow('Channel(Db) must be in range [-4/3,4/3].');
			expect(() => color.Db = Number.POSITIVE_INFINITY).toThrow('Channel(Db) must be in range [-4/3,4/3].');
			expect(() => color.Db = Number.NEGATIVE_INFINITY).toThrow('Channel(Db) must be in range [-4/3,4/3].');

			// Test Dr setter
			expect(() => color.Dr = Number.NaN).toThrow('Channel(Dr) must be in range [-4/3,4/3].');
			expect(() => color.Dr = Number.POSITIVE_INFINITY).toThrow('Channel(Dr) must be in range [-4/3,4/3].');
			expect(() => color.Dr = Number.NEGATIVE_INFINITY).toThrow('Channel(Dr) must be in range [-4/3,4/3].');
		});
	});
	describe('Clone method', () => {
		it('should create a new YDbDr instance with same values', () => {
			const original = new YDbDr(0.7, -0.3, 0.3);
			const cloned = original.Clone();
			expect(cloned).toBeInstanceOf(YDbDr);
			expect(cloned).not.toBe(original);
			expect(cloned.Y).toBe(original.Y);
			expect(cloned.Db).toBe(original.Db);
			expect(cloned.Dr).toBe(original.Dr);
		});

		it('should create independent instances', () => {
			const original = new YDbDr(0.1, 0.2, 0.3);
			const cloned = original.Clone();
			cloned.Y = 0.9;
			cloned.Db = -1.0;
			cloned.Dr = 1.0;
			expect(original.Y).toBe(0.1);
			expect(original.Db).toBe(0.2);
			expect(original.Dr).toBe(0.3);
			expect(cloned.Y).toBe(0.9);
			expect(cloned.Db).toBe(-1.0);
			expect(cloned.Dr).toBe(1.0);
		});

		it('should preserve the component array values', () => {
			const original = new YDbDr(0.4, 0.5, -0.5);
			const cloned = original.Clone();
			expect(cloned.GetComponentsForTesting()).not.toBe(original.GetComponentsForTesting());
			expect(cloned.GetComponentsForTesting()).toEqual(original.GetComponentsForTesting());
		});

		it('should clone correctly with boundary/extreme values', () => {
			const values = [
				[0, -4 / 3, -4 / 3],
				[1, 4 / 3, 4 / 3],
				[0.5, 0, 0],
				[Number.EPSILON, (-4 / 3) + Number.EPSILON, (4 / 3) - Number.EPSILON],
			];

			for (const [y, db, dr] of values) {
				const original = new YDbDr(y, db, dr);
				const cloned = original.Clone();
				expect(cloned.Y).toBe(y);
				expect(cloned.Db).toBe(db);
				expect(cloned.Dr).toBe(dr);
			}
		});

		it('should return correct type', () => {
			const original = new YDbDr(0.1, 0.2, 0.3);
			const cloned = original.Clone();
			expect(cloned).toBeInstanceOf(YDbDr);
		});
	});
});
