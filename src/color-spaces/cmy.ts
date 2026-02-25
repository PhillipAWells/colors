/* eslint-disable no-magic-numbers */
import { AssertInstanceOf, AssertNumber } from './assert.js';
import { TVector3 } from '@pawells/math-extended';
import { ColorSpace } from './_color-space.js';
import { CMYK } from './cmyk.js';
import { ColorSpaceManager } from './manager.js';
import { RGB } from './rgb.js';
import { ColorError } from '../error.js';

type TCMYComponentSelection = 'C' | 'M' | 'Y';

/**
 * Represents a color in the CMY (Cyan, Magenta, Yellow) color space.
 *
 * The CMY color model is a subtractive color system used in color printing,
 * where cyan, magenta, and yellow inks are combined to produce various colors.
 * Each component (C, M, Y) typically ranges from 0 to 1.
 *
 * @see {@link https://en.wikipedia.org/wiki/CMY_color_model | Wikipedia: CMY Color Model}
 */
@ColorSpaceManager.Register({
	name: 'CMY',
	description: 'Represents a color in the CMY (Cyan, Magenta, Yellow) color space.',
	converters: [
		'RGB',
		'CMYK',
	],
})
export class CMY extends ColorSpace {
	/**
	 * Internal array storing the CMY component values [C, M, Y].
	 * Values are normalized floating-point numbers between 0 and 1.
	 *
	 * Direct access to this array should be avoided in favor of using the
	 * public C, M, and Y properties which include proper validation.
	 */
	protected override components: TVector3;

	/**
	 * Gets the Cyan component value (0-1).
	 *
	 * @remarks
	 * The cyan component represents the amount of cyan ink needed:
	 * - 0: No cyan ink (white/paper color for this channel)
	 * - 1: Full cyan ink coverage (maximum cyan intensity)
	 *
	 * Cyan is the complement of red in subtractive color mixing.
	 * Mathematically: C = 1 - R (where R is the red component in RGB).
	 *
	 * @returns {number} The cyan component value between 0 and 1
	 *
	 * @example
	 * ```typescript
	 * const color = new CMY(0.7, 0.3, 0.1);
	 * console.log(color.C); // 0.7 (70% cyan coverage)
	 * ```
	 */
	public get C(): number {
		return this.components[0];
	}	/**
	 * Sets the Cyan component value (0-1).
	 *
	 * @param value - The new cyan component value between 0 and 1
	 * @throws {ColorError} When value is NaN, infinite, or outside the valid range of 0-1
	 *
	 * @example
	 * ```typescript
	 * const color = new CMY(0.3, 0.5, 0.2);
	 * color.C = 0.8; // Increase cyan coverage
	 * console.log(color.C); // 0.8
	 * ```
	 */

	public set C(value: number) {
		CMY._AssertComponent('C', value);
		this.components[0] = value;
	}

	/**
	 * Gets the Magenta component value (0-1).
	 *
	 * @remarks
	 * The magenta component represents the amount of magenta ink needed:
	 * - 0: No magenta ink (white/paper color for this channel)
	 * - 1: Full magenta ink coverage (maximum magenta intensity)
	 *
	 * Magenta is the complement of green in subtractive color mixing.
	 * Mathematically: M = 1 - G (where G is the green component in RGB).
	 *
	 * @returns {number} The magenta component value between 0 and 1
	 *
	 * @example
	 * ```typescript
	 * const color = new CMY(0.2, 0.8, 0.1);
	 * console.log(color.M); // 0.8 (80% magenta coverage)
	 * ```
	 */
	public get M(): number {
		return this.components[1];
	}	/**
	 * Sets the Magenta component value (0-1).
	 *
	 * @param value - The new magenta component value between 0 and 1
	 * @throws {ColorError} When value is NaN, infinite, or outside the valid range of 0-1
	 *
	 * @example
	 * ```typescript
	 * const color = new CMY(0.3, 0.2, 0.6);
	 * color.M = 0.9; // Increase magenta coverage
	 * console.log(color.M); // 0.9
	 * ```
	 */

	public set M(value: number) {
		CMY._AssertComponent('M', value);
		this.components[1] = value;
	}

	/**
	 * Gets the Yellow component value (0-1).
	 *
	 * @remarks
	 * The yellow component represents the amount of yellow ink needed:
	 * - 0: No yellow ink (white/paper color for this channel)
	 * - 1: Full yellow ink coverage (maximum yellow intensity)
	 *
	 * Yellow is the complement of blue in subtractive color mixing.
	 * Mathematically: Y = 1 - B (where B is the blue component in RGB).
	 *
	 * @returns {number} The yellow component value between 0 and 1
	 *
	 * @example
	 * ```typescript
	 * const color = new CMY(0.1, 0.3, 0.9);
	 * console.log(color.Y); // 0.9 (90% yellow coverage)
	 * ```
	 */
	public get Y(): number {
		return this.components[2];
	}	/**
	 * Sets the Yellow component value (0-1).
	 *
	 * @param value - The new yellow component value between 0 and 1
	 * @throws {ColorError} When value is NaN, infinite, or outside the valid range of 0-1
	 *
	 * @example
	 * ```typescript
	 * const color = new CMY(0.4, 0.6, 0.2);
	 * color.Y = 1; // Maximum yellow coverage
	 * console.log(color.Y); // 1
	 * ```
	 */

	public set Y(value: number) {
		CMY._AssertComponent('Y', value);
		this.components[2] = value;
	}

	/**
	 * Creates a new CMY color instance with specified ink coverage values.
	 *
	 * @param c - Cyan component value (0-1, default: 0)
	 *   - 0: No cyan ink coverage
	 *   - 1: Full cyan ink coverage
	 * @param m - Magenta component value (0-1, default: 0)
	 *   - 0: No magenta ink coverage
	 *   - 1: Full magenta ink coverage
	 * @param y - Yellow component value (0-1, default: 0)
	 *   - 0: No yellow ink coverage
	 *   - 1: Full yellow ink coverage
	 *
	 * @throws {ColorError} When any component value is NaN, infinite, or outside the range 0-1
	 *
	 * @example
	 * ```typescript
	 * // White (no ink coverage)
	 * const white = new CMY(); // CMY(0, 0, 0)
	 *
	 * // Primary CMY colors
	 * const cyan = new CMY(1, 0, 0);    // Pure cyan
	 * const magenta = new CMY(0, 1, 0); // Pure magenta
	 * const yellow = new CMY(0, 0, 1);  // Pure yellow
	 *
	 * // Secondary colors (RGB primaries in CMY)
	 * const red = new CMY(0, 1, 1);   // Red = M + Y
	 * const green = new CMY(1, 0, 1); // Green = C + Y
	 * const blue = new CMY(1, 1, 0);  // Blue = C + M
	 *
	 * // Black (theoretical - all inks)
	 * const black = new CMY(1, 1, 1);
	 *
	 * // Custom color
	 * const brown = new CMY(0.3, 0.8, 1);
	 * ```
	 *
	 * @remarks
	 * All component values are automatically validated during construction.
	 * CMY colors are ideal for color theory analysis and as an intermediate
	 * step in RGB-to-CMYK conversions.
	 */
	constructor(c: number = 0, m: number = 0, y: number = 0) {
		super();
		this.components = [0, 0, 0]; // Initialize with defaults
		// Use setters to validate component values
		this.C = c;
		this.M = m;
		this.Y = y;
	}

	/**
	 * Returns a string representation of the CMY color in human-readable format.
	 *
	 * @param format - Output format specification (optional)
	 *   - 'percent': Display values as percentages (0%-100%) - default
	 *   - 'float': Display values as floating-point numbers (0.0-1.0)
	 *
	 * @returns A formatted string representation of the CMY color
	 *   - Percent format: "CMY(C%, M%, Y%)" where values are 0-100
	 *   - Float format: "CMY(C, M, Y)" where values are 0.0-1.0
	 *
	 * @example
	 * ```typescript
	 * const color = new CMY(0.7, 0.3, 0.9);
	 *
	 * // Default percentage format
	 * console.log(color.ToString()); // "CMY(70%, 30%, 90%)"
	 * console.log(color.ToString('percent')); // "CMY(70%, 30%, 90%)"
	 *
	 * // Float format for calculations
	 * console.log(color.ToString('float')); // "CMY(0.7, 0.3, 0.9)"
	 *
	 * // Primary colors examples
	 * const cyan = new CMY(1, 0, 0);
	 * console.log(cyan.ToString()); // "CMY(100%, 0%, 0%)"
	 *
	 * const red = new CMY(0, 1, 1); // RGB red as CMY
	 * console.log(red.ToString()); // "CMY(0%, 100%, 100%)"
	 * ```
	 *
	 * @remarks
	 * The percentage format is commonly used in graphic design applications,
	 * while the float format is preferred for mathematical calculations and
	 * color space conversions.
	 */
	public override ToString(format?: 'percent' | 'float'): string {
		if (format !== undefined && format === 'float') {
			return `CMY(${this.C}, ${this.M}, ${this.Y})`;
		}

		return `CMY(${this.C * 100}%, ${this.M * 100}%, ${this.Y * 100}%)`;
	}

	/**
	 * Type guard assertion function that validates if a value is a valid CMY color instance.
	 *
	 * This method performs comprehensive validation including:
	 * - Instance type checking (must be CMY)
	 * - Component value validation (C, M, Y must be 0-1)
	 * - Finite number validation (no NaN or infinite values)
	 *
	 * @param color - The value to validate as a CMY color instance
	 *
	 * @throws {ColorError} When the value is not an instance of CMY
	 * @throws {ColorError} When any component (C, M, Y) is invalid:
	 *   - Values outside the range 0-1
	 *   - NaN or infinite values
	 *   - Non-numeric values
	 *
	 * @example
	 * ```typescript
	 * function processColor(color: unknown) {
	 *   CMY.Assert(color); // TypeScript now knows color is CMY
	 *
	 *   // Safe to access CMY properties
	 *   console.log(`Ink Coverage: C=${color.C}, M=${color.M}, Y=${color.Y}`);
	 *
	 *   // Convert to RGB for display
	 *   const rgb = color.ToRGB();
	 *   console.log(`RGB equivalent: ${rgb.ToString()}`);
	 * }
	 *
	 * // Valid usage
	 * const validColor = new CMY(0.7, 0.3, 0.9);
	 * processColor(validColor); // ✓ Passes validation
	 *
	 * // Invalid usage examples
	 * try {
	 *   processColor("not a color"); // ✗ Throws: Invalid CMY Color Instance
	 * } catch (error) {
	 *   console.error(error.message);
	 * }
	 *
	 * try {
	 *   processColor({}); // ✗ Throws: Invalid CMY Color Instance
	 * } catch (error) {
	 *   console.error(error.message);
	 * }
	 * ```
	 *
	 * @remarks
	 * This method is typically used in API boundaries and data validation
	 * scenarios where the type of incoming data is uncertain. It provides
	 * both runtime validation and TypeScript type narrowing.
	 */
	public static override Assert(color: unknown): asserts color is CMY {
		AssertInstanceOf(color, CMY, { class: ColorError, message: 'Invalid CMY Color Instance' });
		const cmyColor = color as CMY;
		CMY._AssertComponent('C', cmyColor);
		CMY._AssertComponent('M', cmyColor);
		CMY._AssertComponent('Y', cmyColor);
	}

	private static _AssertComponent(component: TCMYComponentSelection, color: CMY): void;
	private static _AssertComponent(component: TCMYComponentSelection, value: number): void;
	private static _AssertComponent(component: TCMYComponentSelection, colorOrValue: CMY | number): void {
		switch (component) {
			case 'C': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.C;
				AssertNumber(value, { gte: 0, lte: 1, finite: true }, { class: ColorError, message: 'Channel(C) must be in range [0, 1].' });
				break;
			}
			case 'M': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.M;
				AssertNumber(value, { gte: 0, lte: 1, finite: true }, { class: ColorError, message: 'Channel(M) must be in range [0, 1].' });
				break;
			}
			case 'Y': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.Y;
				AssertNumber(value, { gte: 0, lte: 1, finite: true }, { class: ColorError, message: 'Channel(Y) must be in range [0, 1].' });
				break;
			}
		}
	}

	/**
	 * Validates whether an unknown value is a valid CMY color instance.
	 *
	 * This method performs the same validation as Assert() but returns a boolean
	 * result instead of throwing an error, making it suitable for conditional
	 * logic and non-throwing validation scenarios.
	 *
	 * @param color - The value to validate as a CMY color instance
	 *
	 * @returns `true` if the value is a valid CMY color instance, `false` otherwise
	 *
	 * @example
	 * ```typescript
	 * // Safe validation without exceptions
	 * function analyzeColor(color: unknown): string {
	 *   if (CMY.Validate(color)) {
	 *     return `CMY ink coverage: C=${color.C * 100}%, M=${color.M * 100}%, ` +
	 *            `Y=${color.Y * 100}%`;
	 *   }
	 *   return "Not a valid CMY color";
	 * }
	 *
	 * // Test with various inputs
	 * const validColor = new CMY(0.7, 0.3, 0.9);
	 * console.log(analyzeColor(validColor)); // Valid analysis
	 *
	 * console.log(analyzeColor("invalid")); // "Not a valid CMY color"
	 * console.log(analyzeColor(null)); // "Not a valid CMY color"
	 * console.log(analyzeColor({})); // "Not a valid CMY color"
	 *
	 * // Useful for filtering arrays
	 * const mixedArray: unknown[] = [
	 *   new CMY(1, 0, 0),     // Valid cyan
	 *   "not a color",        // Invalid
	 *   new CMY(0, 1, 0),     // Valid magenta
	 *   42,                   // Invalid
	 *   new CMY(0, 0, 1)      // Valid yellow
	 * ];
	 *
	 * const validColors = mixedArray.filter(CMY.Validate);
	 * console.log(`Found ${validColors.length} valid CMY colors`);
	 * ```
	 *
	 * @remarks
	 * This method is preferred over Assert() when you need to handle invalid
	 * values gracefully without exception handling. It's particularly useful
	 * for data filtering, conditional processing, and user input validation.
	 */
	public static override Validate(color: unknown): boolean {
		try {
			CMY.Assert(color);
			return true;
		} catch {
			return false;
		}
	}

	public static From(color: CMYK | RGB): CMY {
		if (color instanceof RGB) return CMY.FromRGB(color);
		if (color instanceof CMYK) return CMY.FromCMYK(color);
		throw new ColorError('Cannot Convert to CMY');
	}

	/**
	 * Converts a CMYK color to CMY
	 * @param color CMYK color to convert
	 * @returns A new CMY color
	 */
	public static FromCMYK(color: CMYK): CMY {
		return CMY._FromCmyk(color);
	}

	/**
	 * Converts an RGB color to CMY
	 * @param color RGB color to convert
	 * @returns A new CMY color
	 *
	 * CMY is the inverse of RGB: CMY(c,m,y) = 1-RGB(r,g,b)
	 */
	public static FromRGB(color: RGB): CMY {
		return CMY._FromRgb(color);
	}

	/**
	 * Converts a CMYK color to CMY
	 * @param color CMYK color to convert
	 * @returns A new CMY color
	 */
	private static _FromCmyk(color: CMYK): CMY {
		CMYK.Validate(color);

		const k = color.K;
		const c = (color.C * (1 - k)) + k;
		const m = (color.M * (1 - k)) + k;
		const y = (color.Y * (1 - k)) + k;

		return new CMY(c, m, y);
	}

	/**
	 * Converts an RGB color to CMY
	 * @param color RGB color to convert
	 * @returns A new CMY color
	 *
	 * CMY is the inverse of RGB: CMY(c,m,y) = 1-RGB(r,g,b)
	 */
	private static _FromRgb(color: RGB): CMY {
		RGB.Validate(color);

		const c = 1 - color.R;
		const m = 1 - color.G;
		const y = 1 - color.B;

		return new CMY(c, m, y);
	}
}
