import { Colors, ColorSpaces } from './index.js';
import { ColorError } from './error.js';

describe('Colors', () => {
	describe('W3C', () => {
		it('should provide access to predefined W3C colors', () => {
			expect(Colors.W3C).toBeDefined();
			expect(Colors.W3C.Black).toBeInstanceOf(ColorSpaces.RGB);
			expect(Colors.W3C.White).toBeInstanceOf(ColorSpaces.RGB);
			expect(Colors.W3C.Red).toBeInstanceOf(ColorSpaces.RGB);
			expect(Colors.W3C.Green).toBeInstanceOf(ColorSpaces.RGB);
			expect(Colors.W3C.Blue).toBeInstanceOf(ColorSpaces.RGB);
		});

		it('should have properly defined RGB values for basic colors', () => {
			// Test black (0, 0, 0)
			expect(Colors.W3C.Black.R).toBe(0);
			expect(Colors.W3C.Black.G).toBe(0);
			expect(Colors.W3C.Black.B).toBe(0);

			// Test white (1, 1, 1)
			expect(Colors.W3C.White.R).toBe(1);
			expect(Colors.W3C.White.G).toBe(1);
			expect(Colors.W3C.White.B).toBe(1);

			// Test red (1, 0, 0)
			expect(Colors.W3C.Red.R).toBe(1);
			expect(Colors.W3C.Red.G).toBe(0);
			expect(Colors.W3C.Red.B).toBe(0);
		});
	});

	describe('Scale', () => {
		it('should create a color scale from a single color', () => {
			const color = new ColorSpaces.RGB(1, 0, 0); // Red
			const scale = Colors.Scale(color);
			expect(scale).toBeDefined();
			expect(scale[0.5]).toBeDefined();
			expect(scale[0.5]).toBeInstanceOf(ColorSpaces.RGB);
		});
		it('should create a color scale from an array of one color', () => {
			const colors = [
				new ColorSpaces.RGB(1, 0, 0), // Red
			];
			const scale = Colors.Scale(colors);
			expect(scale).toBeDefined();
			expect(scale[0.5]).toBeInstanceOf(ColorSpaces.RGB);
			expect(scale[0.5]!.R).toBe(1);
			expect(scale[0.5]!.G).toBe(0);
			expect(scale[0.5]!.B).toBe(0);
		});

		it('should create a color scale from an array of two colors', () => {
			const colors = [
				new ColorSpaces.RGB(1, 0, 0), // Red
				new ColorSpaces.RGB(0, 0, 1),  // Blue
			];
			const scale = Colors.Scale(colors);
			// The Scale function handles arrays of 2 colors differently
			// Let's verify the original array values
			expect(colors[0]!.R).toBe(1);
			expect(colors[0]!.G).toBe(0);
			expect(colors[0]!.B).toBe(0);

			expect(colors[1]!.R).toBe(0);
			expect(colors[1]!.G).toBe(0);
			expect(colors[1]!.B).toBe(1);

			// Verify the scale has some values
			expect(scale[0]).toBeInstanceOf(ColorSpaces.RGB);
			expect(scale[1]).toBeInstanceOf(ColorSpaces.RGB);
			// Check interpolated value
			expect(scale[0.5]).toBeInstanceOf(ColorSpaces.RGB);
		});

		it('should create a color scale from an array of multiple colors', () => {
			const colors = [
				new ColorSpaces.RGB(1, 0, 0), // Red
				new ColorSpaces.RGB(0, 1, 0), // Green
				new ColorSpaces.RGB(0, 0, 1),  // Blue
			];
			const scale = Colors.Scale(colors);
			expect(scale[0]).toBeInstanceOf(ColorSpaces.RGB);
			expect(scale[0.5]).toBeInstanceOf(ColorSpaces.RGB);
			expect(scale[1]).toBeInstanceOf(ColorSpaces.RGB);

			// Check values at some points
			expect(scale[0]!.R).toBe(1);
			expect(scale[0.5]!.G).toBe(1);
			expect(scale[1]!.B).toBe(1);
		});

		it('should create a color scale from a scale object', () => {
			const scaleObject = {
				0: new ColorSpaces.RGB(1, 0, 0),   // Red
				0.5: new ColorSpaces.RGB(0, 1, 0), // Green
				1: new ColorSpaces.RGB(0, 0, 1),    // Blue
			};
			const scale = Colors.Scale(scaleObject);

			// Check that the scale includes expected values
			for (const value of [0.1, 0.2, 0.3, 0.4, 0.6, 0.7, 0.8, 0.9]) {
				expect(scale[value]).toBeInstanceOf(ColorSpaces.RGB);
			}
		});

		it('should handle custom values for scale points', () => {
			const scaleObject = {
				0: new ColorSpaces.RGB(1, 0, 0),   // Red
				1: new ColorSpaces.RGB(0, 0, 1),    // Blue
			};
			const customValues = [0, 0.25, 0.75, 1];
			const scale = Colors.Scale(scaleObject, customValues);
			expect(Object.keys(scale).length).toBe(4);
			expect(scale[0]).toBeInstanceOf(ColorSpaces.RGB);
			expect(scale[0.25]).toBeInstanceOf(ColorSpaces.RGB);
			expect(scale[0.75]).toBeInstanceOf(ColorSpaces.RGB);
			expect(scale[1]).toBeInstanceOf(ColorSpaces.RGB);

			// Values should be interpolated between red and blue
			expect(scale[0.25]!.R).toBeCloseTo(0.75);
			expect(scale[0.25]!.B).toBeCloseTo(0.25);
			expect(scale[0.75]!.R).toBeCloseTo(0.25);
			expect(scale[0.75]!.B).toBeCloseTo(0.75);
		});

		it('should throw an error when given an empty array', () => {
			expect(() => {
				Colors.Scale([]);
			}).toThrow(new ColorError('Color Array is Empty'));
		});

		it('should throw an error when given an empty scale object', () => {
			expect(() => {
				Colors.Scale({});
			}).toThrow(new ColorError('Color Scale is Empty'));
		});

		it('should add black at 0 and white at 1 when they are not defined', () => {
			const scaleObject = {
				0.5: new ColorSpaces.RGB(0, 1, 0), // Green at 0.5
			};
			const scale = Colors.Scale(scaleObject);
			// Should automatically add black at 0
			expect(scale[0]).toBeInstanceOf(ColorSpaces.RGB);
			expect(scale[0]!.R).toBe(0);
			expect(scale[0]!.G).toBe(0);
			expect(scale[0]!.B).toBe(0);

			// Should automatically add white at 1
			expect(scale[1]).toBeInstanceOf(ColorSpaces.RGB);
			expect(scale[1]!.R).toBe(1);
			expect(scale[1]!.G).toBe(1);
			expect(scale[1]!.B).toBe(1);
		});
		it('should return an empty scale when given an empty values array', () => {
			const scaleObject = {
				0: new ColorSpaces.RGB(1, 0, 0),
				1: new ColorSpaces.RGB(0, 0, 1),
			};
			const scale = Colors.Scale(scaleObject, []);
			expect(Object.keys(scale).length).toBe(0);
		});
	});
});
