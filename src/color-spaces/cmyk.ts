/* eslint-disable no-magic-numbers */
import { AssertInstanceOf, AssertNumber } from './assert.js';
import { TVector4 } from '@pawells/math-extended';
import { ColorSpace } from './_color-space.js';
import { CMY } from './cmy.js';
import { ColorSpaceManager } from './manager.js';
import { RGB } from './rgb.js';
import { ColorError } from '../error.js';

type TCMYKComponentSelection = 'C' | 'M' | 'Y' | 'K';

/**
 * Represents a color in the CMYK (Cyan, Magenta, Yellow, Key/Black) color space.
 *
 * The CMYK color model is a subtractive color model used primarily in color printing
 * and publishing. Unlike additive color models (RGB), CMYK works by subtracting
 * specific wavelengths of light from white light, which is how printed inks work.
 *
 * @remarks
 * CMYK is essential for:
 * - Commercial printing and publishing industry
 * - Offset printing, digital printing, and screen printing
 * - Color separation for printing processes
 * - Achieving accurate color reproduction in print media
 * - Professional graphic design and prepress workflows
 *
 * Component Ranges and Meanings:
 * - C (Cyan): [0, 1] where 0 = no cyan ink and 1 = full cyan coverage
 * - M (Magenta): [0, 1] where 0 = no magenta ink and 1 = full magenta coverage
 * - Y (Yellow): [0, 1] where 0 = no yellow ink and 1 = full yellow coverage
 * - K (Key/Black): [0, 1] where 0 = no black ink and 1 = full black coverage
 *
 * The "K" component represents black ink, which is added because:
 * - Pure black cannot be achieved by mixing CMY inks alone
 * - Using black ink is more economical than mixing three colors
 * - Black ink provides better text sharpness and contrast
 * - Reduces ink consumption and drying time
 *
 * @example
 * ```typescript
 * // Create pure black using only K component
 * const black = new CMYK(0, 0, 0, 1);
 *
 * // Create pure cyan
 * const cyan = new CMYK(1, 0, 0, 0);
 *
 * // Create a rich black (common in printing)
 * const richBlack = new CMYK(0.3, 0.3, 0.3, 1);
 *
 * // Create a brown color
 * const brown = new CMYK(0.2, 0.8, 1, 0.1);
 *
 * // Convert to RGB for screen display
 * const rgb = brown.ToRGB();
 * console.log(`RGB: ${rgb.R}, ${rgb.G}, ${rgb.B}`);
 * ```
 */
@ColorSpaceManager.Register({
	name: 'CMYK',
	description: 'Represents a color in the CMYK (Cyan, Magenta, Yellow, Key/Black) color space.',
	converters: [
		'CMY',
		'RGB',
	],
})
export class CMYK extends ColorSpace {
	/**
	 * Internal array storing the CMYK component values [C, M, Y, K].
	 * Values are normalized floating-point numbers between 0 and 1.
	 * - Index 0: Cyan component (0-1)
	 * - Index 1: Magenta component (0-1)
	 * - Index 2: Yellow component (0-1)
	 * - Index 3: Key/Black component (0-1)
	 *
	 * Direct access to this array should be avoided in favor of using the
	 * public C, M, Y, and K properties which include proper validation.
	 */
	protected override components: TVector4;

	/**
	 * Gets the Cyan component value (0-1).
	 *
	 * @remarks
	 * The cyan component represents the amount of cyan ink coverage:
	 * - 0: No cyan ink (white/paper color for this channel)
	 * - 1: Full cyan ink coverage (maximum cyan intensity)
	 *
	 * Cyan is the complement of red in subtractive color mixing.
	 * Higher cyan values subtract more red light from white light.
	 *
	 * @returns {number} The cyan component value between 0 and 1
	 */
	public get C(): number {
		return this.components[0];
	}

	/**
	 * Sets the Cyan component value (0-1).
	 *
	 * @param value - The new cyan component value between 0 and 1
	 * @throws {ColorError} When value is NaN, infinite, or outside the valid range of 0-1
	 *
	 * @example
	 * ```typescript
	 * const color = new CMYK(0.5, 0.3, 0.8, 0.1);
	 * color.C = 0.8; // Increase cyan coverage
	 * console.log(color.C); // 0.8
	 * ```
	 */
	public set C(value: number) {
		CMYK._AssertComponent('C', value);
		this.components[0] = value;
	}

	/**
	 * Gets the Magenta component value (0-1).
	 *
	 * @remarks
	 * The magenta component represents the amount of magenta ink coverage:
	 * - 0: No magenta ink (white/paper color for this channel)
	 * - 1: Full magenta ink coverage (maximum magenta intensity)
	 *
	 * Magenta is the complement of green in subtractive color mixing.
	 * Higher magenta values subtract more green light from white light.
	 *
	 * @returns {number} The magenta component value between 0 and 1
	 */
	public get M(): number {
		return this.components[1];
	}

	/**
	 * Sets the Magenta component value (0-1).
	 *
	 * @param value - The new magenta component value between 0 and 1
	 * @throws {ColorError} When value is NaN, infinite, or outside the valid range of 0-1
	 *
	 * @example
	 * ```typescript
	 * const color = new CMYK(0.2, 0.5, 0.8, 0.1);
	 * color.M = 0.9; // Increase magenta coverage
	 * console.log(color.M); // 0.9
	 * ```
	 */
	public set M(value: number) {
		CMYK._AssertComponent('M', value);
		this.components[1] = value;
	}

	/**
	 * Gets the Yellow component value (0-1).
	 *
	 * @remarks
	 * The yellow component represents the amount of yellow ink coverage:
	 * - 0: No yellow ink (white/paper color for this channel)
	 * - 1: Full yellow ink coverage (maximum yellow intensity)
	 *
	 * Yellow is the complement of blue in subtractive color mixing.
	 * Higher yellow values subtract more blue light from white light.
	 *
	 * @returns {number} The yellow component value between 0 and 1
	 */
	public get Y(): number {
		return this.components[2];
	}

	/**
	 * Sets the Yellow component value (0-1).
	 *
	 * @param value - The new yellow component value between 0 and 1
	 * @throws {ColorError} When value is NaN, infinite, or outside the valid range of 0-1
	 *
	 * @example
	 * ```typescript
	 * const color = new CMYK(0.2, 0.3, 0.5, 0.1);
	 * color.Y = 1; // Maximum yellow coverage
	 * console.log(color.Y); // 1
	 * ```
	 */
	public set Y(value: number) {
		CMYK._AssertComponent('Y', value);
		this.components[2] = value;
	}

	/**
	 * Gets the Key/Black component value (0-1).
	 *
	 * @remarks
	 * The Key (K) component represents black ink coverage:
	 * - 0: No black ink (color determined by CMY components only)
	 * - 1: Full black ink coverage (pure black)
	 *
	 * Black ink is crucial in CMYK printing because:
	 * - CMY alone cannot produce true black (results in muddy brown)
	 * - Black ink provides sharp text and deep shadows
	 * - More economical than using high amounts of CMY inks
	 * - Reduces ink consumption and improves drying times
	 *
	 * @returns {number} The black component value between 0 and 1
	 */
	public get K(): number {
		return this.components[3];
	}

	/**
	 * Sets the Key/Black component value (0-1).
	 *
	 * @param value - The new black component value between 0 and 1
	 * @throws {ColorError} When value is NaN, infinite, or outside the valid range of 0-1
	 *
	 * @remarks
	 * In professional printing, black values are often combined with
	 * small amounts of CMY to create "rich blacks" for deeper saturation.
	 *
	 * @example
	 * ```typescript	 * const color = new CMYK(0.2, 0.3, 0.1, 0.5);
	 * color.K = 1; // Pure black
	 * console.log(color.K); // 1
	 *
	 * // Rich black (common in printing)
	 * color.K = 1;
	 * color.C = 0.3;
	 * color.M = 0.3;
	 * color.Y = 0.3;
	 * ```
	 */
	public set K(value: number) {
		CMYK._AssertComponent('K', value);
		this.components[3] = value;
	}

	/**
	 * Creates a new CMYK color instance with specified ink coverage values.
	 *
	 * @param c - Cyan component value (0-1, default: 0)
	 *   - 0: No cyan ink coverage
	 *   - 1: Full cyan ink coverage	 * @param m - Magenta component value (0-1, default: 0)
	 *   - 0: No magenta ink coverage
	 *   - 1: Full magenta ink coverage
	 * @param y - Yellow component value (0-1, default: 0)
	 *   - 0: No yellow ink coverage
	 *   - 1: Full yellow ink coverage
	 * @param k - Key/Black component value (0-1, default: 0)
	 *   - 0: No black ink coverage
	 *   - 1: Full black ink coverage
	 *
	 * @throws {ColorError} When any component value is NaN, infinite, or outside the range 0-1
	 *
	 * @example
	 * ```typescript
	 * // White (no ink coverage)
	 * const white = new CMYK(); // CMYK(0, 0, 0, 0)
	 *
	 * // Pure black using only K component
	 * const black = new CMYK(0, 0, 0, 1);
	 *
	 * // Rich black (common in professional printing)
	 * const richBlack = new CMYK(0.3, 0.3, 0.3, 1);
	 *
	 * // Primary colors in CMYK
	 * const cyan = new CMYK(1, 0, 0, 0);
	 * const magenta = new CMYK(0, 1, 0, 0);
	 * const yellow = new CMYK(0, 0, 1, 0);
	 *
	 * // A brown color for printing
	 * const brown = new CMYK(0.2, 0.8, 1, 0.1);
	 * ```
	 *
	 * @remarks
	 * All component values are automatically validated during construction.
	 * Values outside the 0-1 range or non-finite values will throw a ColorError.
	 * The constructor creates colors suitable for professional printing workflows.
	 */
	constructor(c: number = 0, m: number = 0, y: number = 0, k: number = 0) {
		super();
		this.components = [0, 0, 0, 0]; // Initialize with defaults
		// Use setters to validate component values
		this.C = c;
		this.M = m;
		this.Y = y;
		this.K = k;
	}

	/**
	 * Returns a string representation of the CMYK color in human-readable format.
	 *
	 * @param format - Output format specification (optional)
	 *   - 'percent': Display values as percentages (0%-100%) - default
	 *   - 'float': Display values as floating-point numbers (0.0-1.0)
	 *
	 * @returns A formatted string representation of the CMYK color
	 *   - Percent format: "CMYK(C%, M%, Y%, K%)" where values are 0-100
	 *   - Float format: "CMYK(C, M, Y, K)" where values are 0.0-1.0
	 *
	 * @example
	 * ```typescript
	 * const color = new CMYK(0.5, 0.3, 0.8, 0.1);
	 *
	 * // Default percentage format
	 * console.log(color.ToString()); // "CMYK(50%, 30%, 80%, 10%)"
	 * console.log(color.ToString('percent')); // "CMYK(50%, 30%, 80%, 10%)"
	 *
	 * // Float format for technical applications
	 * console.log(color.ToString('float')); // "CMYK(0.5, 0.3, 0.8, 0.1)"
	 *
	 * // Rich black example
	 * const richBlack = new CMYK(0.3, 0.3, 0.3, 1);
	 * console.log(richBlack.ToString()); // "CMYK(30%, 30%, 30%, 100%)"
	 * ```
	 *
	 * @remarks
	 * The percentage format is commonly used in graphic design applications
	 * and print specifications, while the float format is preferred for
	 * technical calculations and API integrations.
	 */
	public override ToString(format?: 'percent' | 'float'): string {
		if (format !== undefined && format === 'float') {
			return `CMYK(${this.C}, ${this.M}, ${this.Y}, ${this.K})`;
		}
		const c = Math.round(this.C * 100);
		const m = Math.round(this.M * 100);
		const y = Math.round(this.Y * 100);
		const k = Math.round(this.K * 100);
		return `CMYK(${c}%, ${m}%, ${y}%, ${k}%)`;
	}

	/**
	 * Type guard assertion function that validates if a value is a valid CMYK color instance.
	 *
	 * This method performs comprehensive validation including:
	 * - Instance type checking (must be CMYK)
	 * - Component value validation (C, M, Y, K must be 0-1)
	 * - Finite number validation (no NaN or infinite values)
	 *
	 * @param color - The value to validate as a CMYK color instance
	 *
	 * @throws {ColorError} When the value is not an instance of CMYK
	 * @throws {ColorError} When any component (C, M, Y, K) is invalid:
	 *   - Values outside the range 0-1
	 *   - NaN or infinite values
	 *   - Non-numeric values
	 *
	 * @example
	 * ```typescript	 * function processColor(color: unknown) {
	 *   CMYK.Assert(color); // TypeScript now knows color is CMYK
	 *
	 *   // Safe to access CMYK properties
	 *   console.log(`Ink Coverage: C=${color.C}, M=${color.M}, Y=${color.Y}, K=${color.K}`);
	 *
	 *   // Convert to RGB for display
	 *   const rgb = color.ToRGB();
	 * }
	 *	 * // Valid usage
	 * const validColor = new CMYK(0.5, 0.3, 0.8, 0.1);
	 * processColor(validColor); // ✓ Passes validation
	 *
	 * // Invalid usage examples
	 * try {
	 *   processColor("not a color"); // ✗ Throws: Not a CMYK Color
	 * } catch (error) {
	 *   console.error(error.message);
	 * }
	 *
	 * try {
	 *   const invalidColor = new CMYK(2, 0.5, 0.3, 0.1); // Invalid C value
	 *   // Note: This would throw during construction, not during Assert
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
	public static override Assert(color: unknown): asserts color is CMYK {
		AssertInstanceOf(color, CMYK, { class: ColorError, message: 'Not a CMYK Color' });
		const cmykColor = color as CMYK;
		CMYK._AssertComponent('C', cmykColor);
		CMYK._AssertComponent('M', cmykColor);
		CMYK._AssertComponent('Y', cmykColor);
		CMYK._AssertComponent('K', cmykColor);
	}

	private static _AssertComponent(component: TCMYKComponentSelection, color: CMYK): void;
	private static _AssertComponent(component: TCMYKComponentSelection, value: number): void;
	private static _AssertComponent(component: TCMYKComponentSelection, colorOrValue: CMYK | number): void {
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
			case 'K': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.K;
				AssertNumber(value, { gte: 0, lte: 1, finite: true }, { class: ColorError, message: 'Channel(K) must be in range [0, 1].' });
				break;
			}
		}
	}

	/**
	 * Validates whether an unknown value is a valid CMYK color instance.
	 *
	 * This method performs the same validation as Assert() but returns a boolean
	 * result instead of throwing an error, making it suitable for conditional
	 * logic and non-throwing validation scenarios.
	 *
	 * @param color - The value to validate as a CMYK color instance
	 *
	 * @returns `true` if the value is a valid CMYK color instance, `false` otherwise
	 *
	 * @example
	 * ```typescript
	 * // Safe validation without exceptions
	 * function analyzeColor(color: unknown): string {
	 *   if (CMYK.Validate(color)) {
	 *     return `CMYK ink coverage: C=${color.C * 100}%, M=${color.M * 100}%, ` +
	 *            `Y=${color.Y * 100}%, K=${color.K * 100}%`;
	 *   }
	 *   return "Not a valid CMYK color";
	 * }
	 *
	 * // Test with various inputs
	 * const validColor = new CMYK(0.5, 0.3, 0.8, 0.1);
	 * console.log(analyzeColor(validColor)); // Valid analysis
	 *
	 * console.log(analyzeColor("invalid")); // "Not a valid CMYK color"
	 * console.log(analyzeColor(null)); // "Not a valid CMYK color"
	 * console.log(analyzeColor({})); // "Not a valid CMYK color"
	 *
	 * // Useful for filtering arrays
	 * const mixedArray: unknown[] = [
	 *   new CMYK(1, 0, 0, 0),
	 *   "not a color",
	 *   new CMYK(0, 1, 0, 0),
	 *   42
	 * ];
	 *
	 * const validColors = mixedArray.filter(CMYK.Validate);
	 * console.log(`Found ${validColors.length} valid CMYK colors`);
	 * ```
	 *
	 * @remarks
	 * This method is preferred over Assert() when you need to handle invalid
	 * values gracefully without exception handling. It's particularly useful
	 * for data filtering, conditional processing, and user input validation.
	 */
	public static override Validate(color: unknown): boolean {
		try {
			CMYK.Assert(color);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Creates a new CMYK color by converting from another supported color space.
	 *
	 * This factory method automatically detects the input color space type and
	 * applies the appropriate conversion algorithm to produce an equivalent
	 * CMYK representation suitable for printing applications.
	 *
	 * @param color - The source color to convert from
	 *   - CMY: Converted using K-value extraction algorithm
	 *   - RGB: Converted using standard RGB-to-CMYK transformation
	 *
	 * @returns A new CMYK color instance representing the converted color
	 *
	 * @throws {ColorError} When the input color type is not supported or invalid:
	 *   - Unsupported color space types
	 *   - Invalid component values in source color
	 *   - Color validation failures
	 *
	 * @example
	 * ```typescript
	 * // Convert from RGB
	 * const redRGB = new RGB(1, 0, 0);
	 * const redCMYK = CMYK.From(redRGB);
	 * console.log(redCMYK.ToString()); // CMYK(0%, 100%, 100%, 0%)
	 *
	 * // Convert from CMY
	 * const cyanCMY = new CMY(1, 0, 0);
	 * const cyanCMYK = CMYK.From(cyanCMY);
	 * console.log(cyanCMYK.ToString()); // CMYK(100%, 0%, 0%, 0%)
	 *
	 * // Convert white from RGB
	 * const whiteRGB = new RGB(1, 1, 1);
	 * const whiteCMYK = CMYK.From(whiteRGB);
	 * console.log(whiteCMYK.ToString()); // CMYK(0%, 0%, 0%, 0%)
	 *
	 * // Convert black from RGB
	 * const blackRGB = new RGB(0, 0, 0);
	 * const blackCMYK = CMYK.From(blackRGB);
	 * console.log(blackCMYK.ToString()); // CMYK(0%, 0%, 0%, 100%)
	 *
	 * // Error handling for unsupported types
	 * try {
	 *   const invalid = CMYK.From("not a color" as any);
	 * } catch (error) {
	 *   console.error(error.message); // "Cannot Convert to CMYK"
	 * }
	 * ```
	 *
	 * @remarks
	 * The conversion algorithms implemented here are optimized for printing
	 * workflows and follow industry-standard formulas. RGB-to-CMYK conversion
	 * produces colors suitable for process printing, while CMY-to-CMYK
	 * conversion extracts the optimal black component for ink efficiency.
	 */
	public static From(color: CMY | RGB): CMYK {
		if (color instanceof RGB) return CMYK._FromRgb(color);
		if (color instanceof CMY) return CMYK.FromCMY(color);
		throw new ColorError('Cannot Convert to CMYK');
	}

	/**
	 * Converts a CMY color to CMYK using the K-value extraction algorithm.
	 *
	 * This conversion extracts the common minimum value from CMY components
	 * to become the K (black) component, then adjusts the remaining CMY
	 * values accordingly. This process optimizes ink usage in printing by
	 * replacing overlapping CMY inks with more economical black ink.
	 *
	 * @param color - The CMY color to convert, must be a validated CMY instance
	 * @returns A new CMYK color instance with optimized ink distribution
	 * @throws {ColorError} When the input CMY color is invalid
	 */
	public static FromCMY(color: CMY): CMYK {
		return CMYK._FromCmy(color);
	}

	/**
	 * Converts an RGB color to CMYK using the standard RGB-to-CMYK transformation.
	 *
	 * This conversion transforms additive RGB values (light-based) to subtractive
	 * CMYK values (ink-based) suitable for printing. The algorithm extracts the
	 * black component from the darkest RGB channel and distributes the remaining
	 * color information across CMY components.
	 *
	 * @param color - The RGB color to convert, must be a validated RGB instance
	 * @returns A new CMYK color instance optimized for printing
	 * @throws {ColorError} When the input RGB color is invalid
	 */
	public static FromRGB(color: RGB): CMYK {
		return CMYK._FromRgb(color);
	}

	/**
	 * Converts a CMY color to CMYK using the K-value extraction algorithm.
	 *
	 * This conversion extracts the common minimum value from CMY components
	 * to become the K (black) component, then adjusts the remaining CMY
	 * values accordingly. This process optimizes ink usage in printing by
	 * replacing overlapping CMY inks with more economical black ink.
	 *
	 * @param color - The CMY color to convert, must be a validated CMY instance
	 *
	 * @returns A new CMYK color instance with optimized ink distribution
	 *
	 * @throws {ColorError} When the input CMY color is invalid
	 *
	 * @example
	 * ```typescript
	 * // Convert a pure gray from CMY
	 * const grayCMY = new CMY(0.5, 0.5, 0.5);
	 * const grayCMYK = CMYK.FromCMY(grayCMY);
	 * console.log(grayCMYK.ToString()); // CMYK(0%, 0%, 0%, 50%)
	 * // Note: Gray becomes pure K component for efficiency
	 *
	 * // Convert a dark brown color
	 * const brownCMY = new CMY(0.3, 0.8, 1.0);
	 * const brownCMYK = CMYK.FromCMY(brownCMY);
	 * console.log(brownCMYK.ToString()); // CMYK(0%, 71%, 100%, 30%)
	 * // Note: 30% K extracted, remaining CMY adjusted
	 *
	 * // Pure black case
	 * const blackCMY = new CMY(1, 1, 1);
	 * const blackCMYK = CMYK.FromCMY(blackCMY);
	 * console.log(blackCMYK.ToString()); // CMYK(0%, 0%, 0%, 100%)
	 * ```
	 *
	 * @remarks
	 * **Algorithm Details:**
	 * 1. Extract K = min(C, M, Y) - the common minimum becomes black ink
	 * 2. If K = 1, return pure black CMYK(0, 0, 0, 1)
	 * 3. Otherwise, adjust remaining components: C = (C - K) / (1 - K)
	 * 4. Apply same adjustment to M and Y components
	 *
	 * This algorithm is standard in the printing industry and ensures
	 * optimal ink usage while maintaining color accuracy.
	 *
	 * @internal This method is private and used internally by the From() method
	 */
	private static _FromCmy(color: CMY): CMYK {
		CMY.Validate(color);

		const k = Math.min(color.C, color.M, color.Y);

		if (k === 1) {
			return new CMYK(0, 0, 0, 1);
		}

		const c = (color.C - k) / (1 - k);
		const m = (color.M - k) / (1 - k);
		const y = (color.Y - k) / (1 - k);

		return new CMYK(c, m, y, k);
	}

	/**
	 * Converts an RGB color to CMYK using the standard RGB-to-CMYK transformation.
	 *
	 * This conversion transforms additive RGB values (light-based) to subtractive
	 * CMYK values (ink-based) suitable for printing. The algorithm extracts the
	 * black component from the darkest RGB channel and distributes the remaining
	 * color information across CMY components.
	 *
	 * @param color - The RGB color to convert, must be a validated RGB instance
	 *
	 * @returns A new CMYK color instance optimized for printing
	 *
	 * @throws {ColorError} When the input RGB color is invalid
	 *
	 * @example
	 * ```typescript
	 * // Convert primary RGB colors
	 * const redRGB = new RGB(1, 0, 0);
	 * const redCMYK = CMYK.FromRGB(redRGB);
	 * console.log(redCMYK.ToString()); // CMYK(0%, 100%, 100%, 0%)
	 *
	 * const greenRGB = new RGB(0, 1, 0);
	 * const greenCMYK = CMYK.FromRGB(greenRGB);
	 * console.log(greenCMYK.ToString()); // CMYK(100%, 0%, 100%, 0%)
	 *
	 * const blueRGB = new RGB(0, 0, 1);
	 * const blueCMYK = CMYK.FromRGB(blueRGB);
	 * console.log(blueCMYK.ToString()); // CMYK(100%, 100%, 0%, 0%)
	 *
	 * // Convert grayscale colors
	 * const grayRGB = new RGB(0.5, 0.5, 0.5);
	 * const grayCMYK = CMYK.FromRGB(grayRGB);
	 * console.log(grayCMYK.ToString()); // CMYK(0%, 0%, 0%, 50%)
	 *
	 * // Convert white and black
	 * const whiteRGB = new RGB(1, 1, 1);
	 * const whiteCMYK = CMYK.FromRGB(whiteRGB);
	 * console.log(whiteCMYK.ToString()); // CMYK(0%, 0%, 0%, 0%)
	 *
	 * const blackRGB = new RGB(0, 0, 0);
	 * const blackCMYK = CMYK.FromRGB(blackRGB);
	 * console.log(blackCMYK.ToString()); // CMYK(0%, 0%, 0%, 100%)
	 *
	 * // Convert a complex color
	 * const brownRGB = new RGB(0.6, 0.3, 0.1);
	 * const brownCMYK = CMYK.FromRGB(brownRGB);
	 * console.log(brownCMYK.ToString()); // Converted brown for printing
	 * ```
	 *
	 * @remarks
	 * **Algorithm Details:**
	 * 1. Calculate K = 1 - max(R, G, B) - extract black from darkest channel
	 * 2. If K ≠ 1, calculate CMY components:	 *    - C = (1 - R - K) / (1 - K)
	 *    - M = (1 - G - K) / (1 - K)
	 *    - Y = (1 - B - K) / (1 - K)
	 * 3. If K = 1 (pure black), set C = M = Y = 0
	 *
	 * This algorithm follows the industry-standard RGB-to-CMYK conversion
	 * formula and produces colors optimized for process printing (4-color CMYK).
	 * The conversion accounts for the subtractive nature of printing inks
	 * versus the additive nature of light-based RGB displays.
	 *
	 * @internal This method is private and used internally by the From() method
	 */
	private static _FromRgb(color: RGB): CMYK {
		RGB.Validate(color);

		const k = 1 - Math.max(color.R, color.G, color.B);

		const c = k !== 1 ? (1 - color.R - k) / (1 - k) : 0;
		const m = k !== 1 ? (1 - color.G - k) / (1 - k) : 0;
		const y = k !== 1 ? (1 - color.B - k) / (1 - k) : 0;

		return new CMYK(c, m, y, k);
	}
}
