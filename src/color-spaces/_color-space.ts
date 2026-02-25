import { IMatrix, MatrixTranspose, VectorLERP } from '@pawells/math-extended';
import { TConstructorFunction } from './assert.js';
import { ColorSpaceManager, IColorSpaceMetadata } from './manager.js';
import { ColorError } from '../error.js';

/**
 * Abstract base class representing a color space.
 *
 * Color spaces are mathematical models describing the way colors can be represented
 * as tuples of numbers, typically as three or four values (e.g., RGB, CMYK, HSL).
 * This class provides the foundation for implementing various color space representations.
 */
export abstract class ColorSpace {
	/**
	 * Abstract property for color components array.
	 * Each derived color space must implement this with the appropriate number of components.
	 *
	 * @protected
	 * @remarks
	 * **Encapsulation Rationale:**
	 * This property is intentionally protected rather than public to enforce proper validation
	 * and maintain color integrity. Direct array manipulation could bypass validation logic,
	 * leading to invalid color states.
	 *
	 * **Access Patterns:**
	 * - **Public Access:** Use component-specific getters/setters (e.g., `R`, `G`, `B` for RGB)
	 *   which include validation to ensure values remain within valid ranges.
	 * - **Array Access:** Use `ToArray()` method which returns a safe copy of the components.
	 * - **Test Access:** Use `GetComponentsForTesting()` method (marked @internal) for unit tests
	 *   that need to verify internal state without triggering validation.
	 *
	 * **Why Validation Through Setters:**
	 * Each color space has specific valid ranges for its components (e.g., RGB: 0-1, HSL H: 0-360).
	 * By routing all modifications through validated setters, we guarantee that:
	 * - Component values always remain within valid ranges
	 * - Invalid values throw descriptive errors immediately
	 * - Color instances maintain mathematical consistency
	 * - Conversions between color spaces produce reliable results
	 *
	 * @example
	 * ```typescript
	 * // ❌ WRONG: Cannot access Components directly (protected)
	 * // const rgb = new RGB(1, 0, 0);
	 * // rgb.Components[0] = 2; // Compile error + would bypass validation
	 *
	 * // ✅ CORRECT: Use validated setters
	 * const rgb = new RGB(1, 0, 0);
	 * rgb.R = 0.5; // Validated - throws error if out of range [0, 1]
	 *
	 * // ✅ CORRECT: Get safe copy of components
	 * const components = rgb.ToArray(); // Returns [0.5, 0, 0]
	 * components[0] = 999; // Safe - modifying copy doesn't affect original
	 * ```
	 */
	protected abstract components: number[];

	/**
	 * Gets the metadata for this color space type.
	 * Metadata is stored using reflect-metadata and contains registration information.
	 */
	protected get Metadata(): IColorSpaceMetadata {
		return ColorSpaceManager.GetMetadata(this.constructor as TConstructorFunction<ColorSpace>);
	}

	/**
	 * Type guard assertion function that validates if a value is an instance of ColorSpace.
	 * Throws a TypeError if the provided value is not a ColorSpace instance.
	 *
	 * @param c - The value to validate as a ColorSpace instance
	 * @throws {TypeError} When the value is not an instance of ColorSpace
	 *
	 * @example
	 * ```typescript
	 * const value: unknown = getRgbColor();
	 * ColorSpace.Assert(value); // value is now typed as ColorSpace
	 * console.log(value.ToString()); // Safe to use ColorSpace methods
	 * ```
	 */
	public static Assert(c: unknown): asserts c is ColorSpace {
		if (!(c instanceof ColorSpace)) {
			throw new ColorError(`Expected instance of ColorSpace, got ${typeof c}`);
		}
	}

	/**
	 * Determines whether a value is a ColorSpace instance.
	 *
	 * @param color - The value to validate as a ColorSpace instance
	 * @returns True if the value is a ColorSpace instance, false otherwise
	 */
	public static Validate(color: unknown): boolean {
		try {
			ColorSpace.Assert(color);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Provides direct access to the internal Components array for unit testing purposes.
	 *
	 * @internal
	 * @returns The internal Components array (not a copy) - direct reference to protected property
	 *
	 * @remarks
	 * **Test-Only Access Pattern:**
	 * This method intentionally bypasses encapsulation to enable thorough unit testing
	 * of internal color state without triggering validation logic. It should NEVER be
	 * used in production code.
	 *
	 * **Why This Exists:**
	 * - Unit tests need to verify exact internal state after operations
	 * - `ToArray()` returns a copy, making reference equality tests impossible
	 * - Some tests need to verify that operations modify the internal array correctly
	 * - Validation in setters can interfere with testing edge cases
	 *
	 * **Security:**
	 * - Marked `@internal` to exclude from public API documentation
	 * - TypeScript visibility is `public` only because tests run externally
	 * - Linting rules should flag usage outside of test files
	 *
	 * @example
	 * ```typescript
	 * // ✅ CORRECT: Use in unit tests only
	 * describe('RGB color space', () => {
	 *   it('should store components correctly', () => {
	 *     const rgb = new RGB(0.5, 0.3, 0.8);
	 *     const components = rgb.GetComponentsForTesting();
	 *     expect(components).toEqual([0.5, 0.3, 0.8]);
	 *     expect(components).toBe(rgb.GetComponentsForTesting()); // Same reference
	 *   });
	 * });
	 *
	 * // ❌ WRONG: Never use in production code
	 * // const rgb = new RGB(1, 0, 0);
	 * // const components = rgb.GetComponentsForTesting();
	 * // components[0] = 999; // Bypasses validation - creates invalid state!
	 * ```
	 */
	public GetComponentsForTesting(): number[] {
		return this.components;
	}

	/**
	 * Converts the color to a string representation.
	 * Each derived class must implement this method based on its color space format.
	 *
	 * @returns A string representation of the color in its specific format
	 */
	public abstract ToString(): string;
	/**
	 * Returns a copy of the color components as an array.
	 *
	 * @returns A new array containing the color component values
	 */
	public ToArray(): number[] {
		return [...this.components];
	}

	/**
	 * Transforms the color components into a matrix representation.
	 * Useful for color space transformations and calculations.
	 *
	 * @returns A matrix containing the color components
	 */
	public ToMatrix(): IMatrix {
		return MatrixTranspose([this.ToArray()]);
	}

	/**
	 * Converts this color space instance to another color space type.
	 *
	 * Performs automatic color space conversion using the ColorSpaceManager's
	 * conversion system. This method provides a convenient interface for converting
	 * between different color spaces without needing to know the specific conversion
	 * algorithms or intermediate steps required.
	 *
	 * @template T - The target color space type that extends ColorSpace
	 * @param format - Constructor/class reference for the target color space type
	 *   Must be a registered color space constructor (e.g., RGB, HSL, LAB)
	 *
	 * @returns A new color space instance of the requested type with equivalent color values
	 *
	 * @throws {ColorError} When the target color space is not registered
	 * @throws {ColorError} When no conversion path exists between the color spaces
	 * @throws {ColorError} When the conversion process fails due to invalid color values
	 *
	 * @example
	 * ```typescript
	 * // Convert between common color spaces with type safety
	 * const rgb = new RGB(0.8, 0.4, 0.2);
	 * const hsl = rgb.Convert(HSL);  // Returns HSL instance
	 * const lab = rgb.Convert(LAB);  // Returns LAB instance
	 *
	 * console.log(`RGB: ${rgb.ToString()}`);
	 * console.log(`HSL: ${hsl.ToString()}`);
	 * console.log(`LAB: ${lab.ToString()}`);
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Chain conversions for color analysis
	 * const originalHSV = new HSV(240, 0.8, 0.9);
	 * const viaRGB = originalHSV.Convert(RGB);
	 * const finalLAB = viaRGB.Convert(LAB);
	 *
	 * console.log(`HSV → RGB → LAB: ${finalLAB.ToString()}`);
	 * console.log(`L*: ${finalLAB.L}, a*: ${finalLAB.A}, b*: ${finalLAB.B}`);
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Dynamic conversion with error handling
	 * function safeConvert<T extends ColorSpace>(
	 *     color: ColorSpace,
	 *     targetType: TConstructorFunction<T>
	 * ): T | null {
	 *     try {
	 *         return color.Convert(targetType);
	 *     } catch (error) {
	 *         console.error(`Conversion failed:`, error.message);
	 *         return null;
	 *     }
	 * }
	 *
	 * const cmyk = new CMYK(0.2, 0.8, 0.3, 0.1);
	 * const rgb = safeConvert(cmyk, RGB);
	 * if (rgb) {
	 *     console.log(`Converted: ${rgb.ToString()}`);
	 * }
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Batch conversion for color palette processing
	 * const palette: ColorSpace[] = [
	 *     new RGB(1, 0, 0),
	 *     new HSL(120, 1, 0.5),
	 *     new HSV(240, 1, 1)
	 * ];
	 *
	 * const rgbPalette = palette.map(color => {
	 *     // Convert all colors to RGB for consistent processing
	 *     return color instanceof RGB ? color : color.Convert(RGB);
	 * });
	 *
	 * rgbPalette.forEach((color, index) => {
	 *     console.log(`Palette ${index}: ${color.ToString()}`);
	 * });
	 * ```
	 *
	 * @remarks
	 * This method leverages the ColorSpaceManager's conversion graph to automatically
	 * find and execute the optimal conversion path. Some conversions may require
	 * intermediate steps through other color spaces (e.g., HSL → RGB → LAB) while
	 * others can be performed directly. The method handles all routing automatically
	 * and ensures mathematical precision throughout the conversion process.
	 *
	 * The generic type parameter T ensures type safety at compile time, so the
	 * returned value is correctly typed as the target color space type.
	 */
	public Convert<T extends ColorSpace>(format: TConstructorFunction<T>): T {
		return ColorSpaceManager.Convert(this, format);
	}

	/**
	 * Creates a deep clone of this color space instance.
	 *
	 * This method creates a new instance of the same color space type with identical
	 * component values. The cloned instance is completely independent of the original,
	 * allowing modifications without affecting the source color.
	 *
	 * @returns A new color space instance with the same type and values
	 *
	 * @example
	 * ```typescript
	 * const original = new RGB(0.8, 0.4, 0.2);
	 * const cloned = original.Clone();
	 *
	 * // Cloned instance is independent
	 * console.log(original.ToString()); // "RGB(0.8, 0.4, 0.2)"
	 * console.log(cloned.ToString());   // "RGB(0.8, 0.4, 0.2)"
	 * console.log(original === cloned); // false
	 * ```
	 *
	 * @remarks
	 * This method provides a safe way to duplicate color instances, ensuring that
	 * the cloned color maintains proper color space metadata and can be used with
	 * all ColorSpace methods including Convert() and ColorSpaceManager operations.
	 */
	public Clone(): this {
		const CTOR = this.constructor as TConstructorFunction<this>;
		return new CTOR(...this.ToArray());
	}

	/**
	 * Linearly interpolates between this color and another color in the same color space.
	 *
	 * @param color - The target color to interpolate towards
	 * @param t - Interpolation factor between 0 (this color) and 1 (target color)
	 * @returns A new color instance representing the interpolated color
	 * @throws {Error} When attempting to interpolate between different color space types
	 */
	public LERP<TColorSpace extends ColorSpace>(color: TColorSpace, t: number): TColorSpace {
		if (this.constructor !== color.constructor) {
			throw new Error('Cannot interpolate between different color spaces');
		}

		const CTOR = this.Metadata.Ctor;

		const a = this.ToArray();
		const b = color.ToArray();
		const result = VectorLERP(a, b, t);

		return new CTOR(...result) as TColorSpace;
	}
}
