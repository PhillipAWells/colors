import 'reflect-metadata';
import { ColorSpace } from './_color-space.js';
import { ColorSpaceManager } from './manager.js';

// Concrete implementation of ColorSpace for testing
@ColorSpaceManager.Register({
	name: 'TestColorSpace',
	description: 'A test color space',
	converters: ['AnotherColorSpace'], // TestColorSpace can convert to AnotherColorSpace
})
class TestColorSpace extends ColorSpace {
	protected components: number[];

	constructor(c1: number, c2: number, c3: number) {
		super();
		this.components = [c1, c2, c3];
	}

	public override ToString(): string {
		return `TestColorSpace(${this.components.join(', ')})`;
	}
}
// Another concrete implementation for conversion tests
@ColorSpaceManager.Register({
	name: 'AnotherColorSpace',
	description: 'Another test color space',
	converters: [], // AnotherColorSpace does not convert to anything directly
})
class AnotherColorSpace extends ColorSpace {
	protected components: number[];

	constructor(c1: number, c2: number, c3: number) {
		super();
		this.components = [c1, c2, c3];
	}

	public override ToString(): string {
		return `AnotherColorSpace(${this.components.join(', ')})`;
	}

	public static From(input: TestColorSpace): AnotherColorSpace {
		const arr = input.ToArray();
		const c1 = arr[0] ?? 0;
		const c2 = arr[1] ?? 0;
		const c3 = arr[2] ?? 0;
		return new AnotherColorSpace(c1 * 2, c2 * 2, c3 * 2);
	}
}
describe('ColorSpace', () => {
	beforeEach(() => {
		// Clear the registry before each test to ensure a clean state
		ColorSpaceManager.ClearRegistry();
		// Re-register the necessary color spaces for each test
		ColorSpaceManager.Register({ name: 'TestColorSpace', description: 'A test color space', converters: ['AnotherColorSpace'] })(TestColorSpace);
		ColorSpaceManager.Register({ name: 'AnotherColorSpace', description: 'Another test color space', converters: [] })(AnotherColorSpace);
	});

	it('should return correct metadata', () => {
		const metadata = ColorSpaceManager.GetMetadata(TestColorSpace);
		expect(metadata.name).toBe('TestColorSpace');
		expect(metadata.description).toBe('A test color space');
		expect(metadata.Ctor).toBe(TestColorSpace);
		expect(metadata.converters).toEqual(['AnotherColorSpace']);
	});

	it('should return components as an array', () => {
		const color = new TestColorSpace(1, 2, 3);
		expect(color.ToArray()).toEqual([1, 2, 3]);
	});

	it('should return components as a transposed matrix', () => {
		const color = new TestColorSpace(1, 2, 3);
		const matrix = color.ToMatrix();
		expect(matrix).toEqual([[1], [2], [3]]);
		expect(matrix.length).toBe(3);
		if (matrix[0]) { // Add check for possibly undefined
			expect(matrix[0].length).toBe(1);
		}
	});

	it('should convert to another color space using ColorSpaceManager.Convert', () => {
		const color = new TestColorSpace(1, 2, 3);
		const convertedColor = color.Convert(AnotherColorSpace);
		expect(convertedColor).toBeInstanceOf(AnotherColorSpace);
		expect(convertedColor.ToArray()).toEqual([2, 4, 6]); // Based on From method in AnotherColorSpace
	});

	it('should linearly interpolate between two colors', () => {
		const color1 = new TestColorSpace(0, 0, 0);
		const color2 = new TestColorSpace(10, 20, 30);

		const lerpedColor = color1.LERP(color2, 0.5);
		expect(lerpedColor).toBeInstanceOf(TestColorSpace);
		expect(lerpedColor.ToArray()).toEqual([5, 10, 15]);

		const lerpedColor2 = color1.LERP(color2, 0);
		expect(lerpedColor2.ToArray()).toEqual([0, 0, 0]);

		const lerpedColor3 = color1.LERP(color2, 1);
		expect(lerpedColor3.ToArray()).toEqual([10, 20, 30]);
	});
});
