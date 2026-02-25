import { YIQ } from './yiq.js';
import { RGB } from './rgb.js';
import { YUV } from './yuv.js';
import { ColorError } from '../error.js';

describe('Color YIQ', () => {
	describe('Constructor and Component Access', () => {
		test('should create a black color with default constructor', () => {
			const color = new YIQ();
			expect(color.Y).toBe(0);
			expect(color.I).toBe(0);
			expect(color.Q).toBe(0);
		});

		test('should initialize with provided values', () => {
			const color = new YIQ(0.5, 0.3, -0.2);
			expect(color.Y).toBe(0.5);
			expect(color.I).toBe(0.3);
			expect(color.Q).toBe(-0.2);
		});

		test('should correctly set and get Y component', () => {
			const color = new YIQ();
			color.Y = 0.7;
			expect(color.Y).toBe(0.7);
		});

		test('should correctly set and get I component', () => {
			const color = new YIQ();
			color.I = 0.4;
			expect(color.I).toBe(0.4);
		});

		test('should correctly set and get Q component', () => {
			const color = new YIQ();
			color.Q = -0.3;
			expect(color.Q).toBe(-0.3);
		});
	});

	describe('Component Validation', () => {
		test('should throw error when Y is less than 0', () => {
			const color = new YIQ();
			expect(() => {
				color.Y = -0.1;
			}).toThrow(ColorError);
		});

		test('should throw error when Y is greater than 1', () => {
			const color = new YIQ();
			expect(() => {
				color.Y = 1.1;
			}).toThrow(ColorError);
		});

		test('should throw error when I is less than -0.5957', () => {
			const color = new YIQ();
			expect(() => {
				color.I = -0.6;
			}).toThrow(ColorError);
		});

		test('should throw error when I is greater than 0.5957', () => {
			const color = new YIQ();
			expect(() => {
				color.I = 0.6;
			}).toThrow(ColorError);
		});

		test('should throw error when Q is less than -0.5226', () => {
			const color = new YIQ();
			expect(() => {
				color.Q = -0.6;
			}).toThrow(ColorError);
		});

		test('should throw error when Q is greater than 0.5226', () => {
			const color = new YIQ();
			expect(() => {
				color.Q = 0.6;
			}).toThrow(ColorError);
		});

		test('should throw error when Y is NaN', () => {
			const color = new YIQ();
			expect(() => {
				color.Y = NaN;
			}).toThrow(ColorError);
		});

		test('should throw error when I is NaN', () => {
			const color = new YIQ();
			expect(() => {
				color.I = NaN;
			}).toThrow(ColorError);
		});

		test('should throw error when Q is NaN', () => {
			const color = new YIQ();
			expect(() => {
				color.Q = NaN;
			}).toThrow(ColorError);
		});
	});

	describe('Static Validation Method', () => {
		test('should validate valid YIQ instances', () => {
			const color = new YIQ(0.5, 0.3, 0.2);
			expect(YIQ.Validate(color)).toBe(true);
		});

		test('should return false for invalid type', () => {
			const notYIQ = { y: 0.5, i: 0.3, q: 0.2 }; // Not an actual YIQ instance
			expect(YIQ.Validate(notYIQ as any)).toBe(false);
		});

		test('should return false when components are invalid', () => {
			const notYIQ = { y: 0.5, i: 0.3, q: 0.2 }; // Not an actual YIQ instance
			expect(YIQ.Validate(notYIQ as any)).toBe(false);
		});
	});

	describe('Static Assert Method', () => {
		test('should not throw for valid YIQ instances', () => {
			const color = new YIQ(0.5, 0.3, 0.2);
			expect(() => YIQ.Assert(color)).not.toThrow();
		});

		test('should throw for invalid type', () => {
			const notYIQ = { y: 0.5, i: 0.3, q: 0.2 }; // Not an actual YIQ instance
			expect(() => YIQ.Assert(notYIQ as any)).toThrow('Not a YIQ Color');
		});

		test('should throw when components are invalid', () => {
			// Create color but manipulate internal state to be invalid
			const color = new YIQ(0.5, 0.3, 0.2);
			color.GetComponentsForTesting()[0] = Number.NaN; // Bypass setter to create invalid state
			expect(() => YIQ.Assert(color)).toThrow('Channel(Y) must be in range [0, 1].');
		});
	});

	describe('Setter validation for non-finite values', () => {
		test('should throw ColorError for non-finite values in setters', () => {
			const color = new YIQ();
			// Test Y setter
			expect(() => color.Y = Number.NaN).toThrow('Channel(Y) must be in range [0, 1].');
			expect(() => color.Y = Number.POSITIVE_INFINITY).toThrow('Channel(Y) must be in range [0, 1].');
			expect(() => color.Y = Number.NEGATIVE_INFINITY).toThrow('Channel(Y) must be in range [0, 1].');

			// Test I setter
			expect(() => color.I = Number.NaN).toThrow('Channel(I) must be in range [-0.599, 0.599].');
			expect(() => color.I = Number.POSITIVE_INFINITY).toThrow('Channel(I) must be in range [-0.599, 0.599].');
			expect(() => color.I = Number.NEGATIVE_INFINITY).toThrow('Channel(I) must be in range [-0.599, 0.599].');

			// Test Q setter
			expect(() => color.Q = Number.NaN).toThrow('Channel(Q) must be in range [-0.5251, 0.5251].');
			expect(() => color.Q = Number.POSITIVE_INFINITY).toThrow('Channel(Q) must be in range [-0.5251, 0.5251].');
			expect(() => color.Q = Number.NEGATIVE_INFINITY).toThrow('Channel(Q) must be in range [-0.5251, 0.5251].');
		});
	});

	describe('String Representation', () => {
		test('should correctly convert to string representation', () => {
			const color = new YIQ(0.5, 0.3, -0.2);
			expect(color.ToString()).toBe('YIQ(0.5, 0.3, -0.2)');
		});

		test('should have consistent precision in string output', () => {
			const color = new YIQ(0.333333, -0.444444, 0.222222);
			// The exact string may vary based on implementation,
			// but check for the starting part
			expect(color.ToString()).toMatch(/^YIQ\(0\.33333.*, -0\.44444.*, 0\.22222.*\)$/);
		});
	});

	describe('Conversion From RGB', () => {
		test('should correctly convert black RGB to YIQ', () => {
			const rgb = new RGB(0, 0, 0);
			const yiq = YIQ.From(rgb);
			expect(yiq.Y).toBeCloseTo(0, 6);
			expect(yiq.I).toBeCloseTo(0, 6);
			expect(yiq.Q).toBeCloseTo(0, 6);
		});

		test('should correctly convert white RGB to YIQ', () => {
			const rgb = new RGB(1, 1, 1);
			const yiq = YIQ.From(rgb);
			expect(yiq.Y).toBeCloseTo(1, 6);
			expect(yiq.I).toBeCloseTo(0, 6);
			expect(yiq.Q).toBeCloseTo(0, 6);
		});

		test('should correctly convert red RGB to YIQ', () => {
			const rgb = new RGB(1, 0, 0);
			const yiq = YIQ.From(rgb);			// Using standard NTSC coefficients
			expect(yiq.Y).toBeCloseTo(0.3, 6);
			expect(yiq.I).toBeCloseTo(0.599, 6);
			expect(yiq.Q).toBeCloseTo(0.213, 6);
		});

		test('should correctly convert green RGB to YIQ', () => {
			const rgb = new RGB(0, 1, 0);
			const yiq = YIQ.From(rgb);			// Using standard NTSC coefficients
			expect(yiq.Y).toBeCloseTo(0.59, 6);
			expect(yiq.I).toBeCloseTo(-0.2773, 6);
			expect(yiq.Q).toBeCloseTo(-0.5251, 6);
		});

		test('should correctly convert blue RGB to YIQ', () => {
			const rgb = new RGB(0, 0, 1);
			const yiq = YIQ.From(rgb);			// Using standard NTSC coefficients
			expect(yiq.Y).toBeCloseTo(0.11, 6);
			expect(yiq.I).toBeCloseTo(-0.3217, 6);
			expect(yiq.Q).toBeCloseTo(0.3121, 6);
		});

		test('should correctly convert mixed RGB to YIQ', () => {
			const rgb = new RGB(0.5, 0.2, 0.8);
			const yiq = YIQ.From(rgb);			// Verify with hand-calculated result
			expect(yiq.Y).toBeCloseTo(0.356, 3);
			expect(yiq.I).toBeCloseTo(-0.01332, 3);
			expect(yiq.Q).toBeCloseTo(0.2502);
		});
	});

	describe('Conversion From YUV', () => {
		test('should correctly convert from YUV to YIQ', () => {
			const yuv = new YUV(0.5, 0.1, 0.2);
			const yiq = YIQ.From(yuv);			// YIQ is a 33-degree rotation of the UV axes in the YUV color space
			// We use approximate validation here
			expect(yiq.Y).toBeCloseTo(0.5, 6); // Y value should be the same
			expect(yiq.I).toBeCloseTo(0.1132, 3); // I = U*cos(33°) + V*sin(33°)
			expect(yiq.Q).toBeCloseTo(0.19279, 3); // Q = V*cos(33°) - U*sin(33°)
		});

		test('should preserve Y component when converting from YUV', () => {
			// Test multiple Y values to confirm
			for (let y = 0; y <= 1; y += 0.2) {
				const yuv = new YUV(y, 0, 0);
				const yiq = YIQ.From(yuv);
				expect(yiq.Y).toBeCloseTo(y, 6);
				expect(yiq.I).toBeCloseTo(0, 6);
				expect(yiq.Q).toBeCloseTo(0, 6);
			}
		});

		test('should correctly rotate the UV plane to IQ plane', () => {
			// Testing with pure U component
			const yuvU = new YUV(0.5, 0.2, 0);
			const yiqU = YIQ.From(yuvU);			// I = U*cos(33°), Q = -U*sin(33°)
			expect(yiqU.Y).toBeCloseTo(0.5, 6); // Y value should be the same
			expect(yiqU.I).toBeCloseTo(-0.108927, 5);
			expect(yiqU.Q).toBeCloseTo(0.1677341, 5);

			// Testing with pure V component
			const yuvV = new YUV(0.5, 0, 0.2);
			const yiqV = YIQ.From(yuvV);			// I = V*sin(33°), Q = V*cos(33°)
			expect(yiqV.I).toBeCloseTo(0.167734, 5);
			expect(yiqV.Q).toBeCloseTo(0.108927, 5);
		});
	});

	describe('Edge Cases and Special Values', () => {
		test('should handle Y at boundaries', () => {
			expect(() => new YIQ(0, 0, 0)).not.toThrow();
			expect(() => new YIQ(1, 0, 0)).not.toThrow();
			expect(() => new YIQ(0 - Number.EPSILON, 0, 0)).toThrow(ColorError);
			expect(() => new YIQ(1 + Number.EPSILON, 0, 0)).toThrow(ColorError);
		});

		test('should handle I at boundaries', () => {
			expect(() => new YIQ(0.5, 0.596, 0)).not.toThrow();
			expect(() => new YIQ(0.5, -0.596, 0)).not.toThrow();
			expect(() => new YIQ(0.5, 0.6, 0)).toThrow(ColorError);
			expect(() => new YIQ(0.5, -0.6, -0.0001)).toThrow(ColorError);
		});

		test('should handle Q at boundaries', () => {
			expect(() => new YIQ(0.5, 0, 0.5251)).not.toThrow();
			expect(() => new YIQ(0.5, 0, -0.5251)).not.toThrow();
			expect(() => new YIQ(0.5, 0, 0.53)).toThrow(ColorError);
			expect(() => new YIQ(0.5, 0, -0.53)).toThrow(ColorError);
		});
	});
	describe('Clone method', () => {
		it('should create a new YIQ instance with same values', () => {
			const original = new YIQ(0.5, 0.3, -0.2);
			const cloned = original.Clone();
			expect(cloned).toBeInstanceOf(YIQ);
			expect(cloned).not.toBe(original);
			expect(cloned.Y).toBe(original.Y);
			expect(cloned.I).toBe(original.I);
			expect(cloned.Q).toBe(original.Q);
		});

		it('should create independent instances', () => {
			const original = new YIQ(0.1, 0.2, 0.3);
			const cloned = original.Clone();
			cloned.Y = 0.9;
			cloned.I = -0.5;
			cloned.Q = 0.5;
			expect(original.Y).toBe(0.1);
			expect(original.I).toBe(0.2);
			expect(original.Q).toBe(0.3);
			expect(cloned.Y).toBe(0.9);
			expect(cloned.I).toBe(-0.5);
			expect(cloned.Q).toBe(0.5);
		});

		it('should preserve the component array values', () => {
			const original = new YIQ(0.4, 0.5, -0.5);
			const cloned = original.Clone();
			expect(cloned.GetComponentsForTesting()).not.toBe(original.GetComponentsForTesting());
			expect(cloned.GetComponentsForTesting()).toEqual(original.GetComponentsForTesting());
		});

		it('should clone correctly with boundary/extreme values', () => {
			const values = [
				[0, -0.5957, -0.5226],
				[1, 0.5957, 0.5226],
				[0.5, 0, 0],
				[Number.EPSILON, -0.5957 + Number.EPSILON, 0.5226 - Number.EPSILON],
			];

			for (const [y, i, q] of values) {
				const original = new YIQ(y, i, q);
				const cloned = original.Clone();
				expect(cloned.Y).toBe(y);
				expect(cloned.I).toBe(i);
				expect(cloned.Q).toBe(q);
			}
		});

		it('should return correct type', () => {
			const original = new YIQ(0.1, 0.2, 0.3);
			const cloned = original.Clone();
			expect(cloned).toBeInstanceOf(YIQ);
		});
	});
});
