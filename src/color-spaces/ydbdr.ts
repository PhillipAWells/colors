/* eslint-disable no-magic-numbers */
import { IMatrix3, MatrixMultiply } from '@pawells/math-extended';
import { AssertNumber, AssertInstanceOf } from './assert.js';
import { ColorSpace } from './_color-space.js';
import { ColorSpaceManager } from './manager.js';
import { RGB } from './rgb.js';
import { ColorError } from '../error.js';

type TYDbDrComponentSelection = 'Y' | 'Db' | 'Dr';

/**
 * Represents a color in the YDbDr color space, the luminance-chrominance encoding used in the SECAM analog television standard.
 *
 * ## Overview
 * The YDbDr color space is the color encoding system used in SECAM (Séquentiel Couleur avec Mémoire),
 * an analog television broadcast standard developed in France and used primarily in France, Eastern Europe,
 * and former Soviet Union countries. It separates color information into luminance and chrominance components
 * optimized for frequency modulation transmission.
 *
 * ## Components
 * - **Y**: Luminance component representing brightness and perceived lightness (range: 0 to 1)
 * - **Db**: Blue-difference chroma component for blue-yellow color axis (range: -4/3 to +4/3)
 * - **Dr**: Red-difference chroma component for red-cyan color axis (range: -4/3 to +4/3)
 *
 * ## Key Characteristics
 * - **SECAM-specific encoding**: Designed specifically for the SECAM broadcast system's requirements
 * - **Frequency modulation optimized**: Chroma components are optimized for FM transmission characteristics
 * - **Wide chroma range**: Uses ±4/3 scaling for chroma components (vs ±0.5 in YUV/YCbCr)
 * - **Sequential transmission**: Works with SECAM's sequential color transmission (alternating Db/Dr)
 * - **Analog-focused design**: Optimized for analog signal processing and transmission
 *
 * ## Applications
 * - Legacy SECAM television broadcast systems
 * - Analog video processing and transmission
 * - Historical video format conversion and restoration
 * - Color science research and broadcast standards analysis
 * - Video compression and encoding for SECAM-compatible systems
 *
 * ## Mathematical Foundation
 * The YDbDr transformation uses a linear transformation matrix specifically designed for SECAM:
 * ```
 * Y  = 0.299×R + 0.587×G + 0.114×B
 * Db = -0.45×R - 0.883×G + 1.333×B
 * Dr = -1.333×R + 1.116×G + 0.217×B
 * ```
 *
 * @example
 * ```typescript
 * // Basic YDbDr color creation
 * const white = new YDbDr(1, 0, 0);           // Pure white
 * const black = new YDbDr(0, 0, 0);           // Pure black
 * const gray = new YDbDr(0.5, 0, 0);          // Middle gray
 *  * // Colors with chrominance components
 * const blue = new YDbDr(0.114, 1.333, -1.116);  // Pure blue (max Db)
 * const red = new YDbDr(0.299, -0.45, -1.333);   // Pure red (max Dr)
 *
 * console.log(white.ToString()); // "YDbDr(1, 0, 0)"
 * ```
 *
 * @example
 * ```typescript
 * // SECAM broadcast color processing
 * const rgb = new RGB(0.8, 0.4, 0.2); * const ydbdr = YDbDr.FromRGB(rgb);
 *
 * // Access components for broadcast processing
 * const luminance = ydbdr.Y;     // Brightness information
 * const blueDiff = ydbdr.Db;     // Blue-difference chroma * const redDiff = ydbdr.Dr;      // Red-difference chroma
 *
 * // Sequential color transmission simulation
 * console.log(`Frame 1 - Y: ${luminance}, Db: ${blueDiff}`);
 * console.log(`Frame 2 - Y: ${luminance}, Dr: ${redDiff}`);
 * ```
 *
 * @example
 * ```typescript
 * // Video format conversion workflow
 * const videoColors = [
 *     new RGB(1, 0, 0),    // Red pixel
 *     new RGB(0, 1, 0),    // Green pixel
 *     new RGB(0, 0, 1)     // Blue pixel * ];
 *
 * const secamColors = videoColors.map(rgb => YDbDr.FromRGB(rgb));
 *
 * // Process for SECAM transmission
 * secamColors.forEach((color, index) => {
 *     console.log(`Pixel ${index}: ${color.ToString()}`);
 *     console.log(`  Luminance: ${color.Y.toFixed(3)}`);
 *     console.log(`  Chroma Db: ${color.Db.toFixed(3)}`);
 *     console.log(`  Chroma Dr: ${color.Dr.toFixed(3)}`);
 * });
 * ```
 *
 * @remarks
 * YDbDr differs from other YUV-family color spaces primarily in its chroma scaling factors,
 * which are specifically optimized for SECAM's frequency modulation requirements. The ±4/3
 * range for chroma components is significantly wider than the typical ±0.5 range used in
 * digital video standards like YCbCr.
 */
@ColorSpaceManager.Register({
	name: 'YDbDr',
	description: 'Represents a color in the YDbDr color space used in the SECAM analog television standard.',
	converters: [],
})
export class YDbDr extends ColorSpace {
	/**
	 * Maximum value for the Db and Dr components (4/3 or approximately 1.333)
	 * This value is specific to the SECAM standard and differs from other YUV-like color spaces
	 */
	public static readonly MAX = 4 / 3;

	/**
	 * Minimum value for the Db and Dr components (-4/3 or approximately -1.333)
	 * This value is specific to the SECAM standard and differs from other YUV-like color spaces
	 */
	public static readonly MIN = -4 / 3;

	/** Internal array storing the YDbDr component values in order [Y, Db, Dr] */
	protected override components: [number, number, number];

	/**
	 * Gets the Y (luminance) component value.
	 *
	 * The Y component represents the luminance (brightness) of the color, carrying the
	 * primary visual information. It's calculated using the standard luminance formula
	 * that weights RGB components according to human visual sensitivity.
	 *
	 * @returns The Y component value in the range [0, 1]
	 *   - 0: Complete darkness (black)
	 *   - 1: Maximum brightness (white)
	 *   - 0.5: Middle gray
	 *
	 * @example
	 * ```typescript
	 * const color = new YDbDr(0.8, 0.2, -0.1);
	 * console.log(color.Y); // 0.8 (bright color)
	 *
	 * const white = new YDbDr(1, 0, 0);
	 * console.log(white.Y); // 1 (maximum brightness)
	 *
	 * const black = new YDbDr(0, 0, 0);
	 * console.log(black.Y); // 0 (no brightness)
	 * ```
	 */
	public get Y(): number {
		return this.components[0];
	}

	/**
	 * Sets the Y (luminance/brightness) component value.
	 *
	 * Controls the luminance (brightness) component of the color. This is the most
	 * visually significant component as it carries the primary brightness information
	 * that the human eye is most sensitive to.
	 *
	 * @param value - The Y value to set, must be in the range [0, 1]
	 *   - 0: Complete darkness (black)
	 *   - 1: Maximum brightness (white)
	 *   - Values between 0 and 1: Various gray levels
	 *
	 * @throws {ColorError} When value is outside the valid range [0, 1] or not finite
	 *
	 * @example
	 * ```typescript
	 * const color = new YDbDr(0.5, 0, 0);
	 * color.Y = 0.8;  // Make the color brighter
	 * console.log(color.Y); // 0.8
	 *
	 * // Error cases
	 * try {
	 *     color.Y = 1.5;  // Throws ColorError: Channel(Y) Out of Range
	 * } catch (error) {
	 *     console.error(error.message);
	 * }
	 * ```
	 */
	public set Y(value: number) {
		YDbDr._AssertComponent('Y', value);
		this.components[0] = value;
	}

	/**
	 * Gets the Db (blue-difference chroma) component value.
	 *
	 * The Db component represents the blue-difference chrominance, encoding color
	 * information along the blue-yellow axis. In SECAM, this component is transmitted
	 * on alternating lines and is optimized for frequency modulation.
	 *
	 * @returns The Db component value in the range [-4/3, +4/3]
	 *   - -4/3 (-1.333): Maximum yellow bias
	 *   - 0: No blue-yellow bias (achromatic)
	 *   - +4/3 (+1.333): Maximum blue bias
	 *
	 * @example
	 * ```typescript
	 * const blue = new YDbDr(0.114, 1.333, -1.116);
	 * console.log(blue.Db); // 1.333 (maximum blue component)
	 *
	 * const yellow = new YDbDr(0.886, -1.333, 1.116);
	 * console.log(yellow.Db); // -1.333 (maximum yellow component)
	 *
	 * const gray = new YDbDr(0.5, 0, 0);
	 * console.log(gray.Db); // 0 (no blue-yellow bias)
	 * ```
	 *
	 * @remarks
	 * The Db component uses SECAM's specific scaling factor of ±4/3, which is
	 * significantly larger than the ±0.5 range used in YUV and YCbCr systems.
	 * This wider range is optimized for SECAM's frequency modulation transmission.
	 */
	public get Db(): number {
		return this.components[1];
	}

	/**
	 * Sets the Db (blue-difference chroma) component value.
	 *
	 * Controls the blue-difference chrominance component along the blue-yellow axis.
	 * This component is crucial for SECAM color reproduction and is transmitted using
	 * frequency modulation on alternating scan lines.
	 *
	 * @param value - The Db value to set, must be in the range [-4/3, +4/3]
	 *   - -4/3 (-1.333): Maximum yellow bias
	 *   - 0: Neutral (no blue-yellow color bias)
	 *   - +4/3 (+1.333): Maximum blue bias
	 *
	 * @throws {ColorError} When value is outside the valid range [-4/3, +4/3] or not finite
	 *
	 * @example
	 * ```typescript
	 * const color = new YDbDr(0.5, 0, 0);
	 * color.Db = 1.0;  // Add blue bias
	 * console.log(color.Db); // 1.0
	 *
	 * color.Db = -0.8;  // Add yellow bias
	 * console.log(color.Db); // -0.8
	 *
	 * // Error cases
	 * try {
	 *     color.Db = 2.0;  // Throws ColorError: Channel(Db) Out of Range
	 * } catch (error) {
	 *     console.error(error.message);
	 * }
	 * ```
	 */
	public set Db(value: number) {
		YDbDr._AssertComponent('Db', value);
		this.components[1] = value;
	}

	/**
	 * Gets the Dr (red-difference chroma) component value.
	 *
	 * The Dr component represents the red-difference chrominance, encoding color
	 * information along the red-cyan axis. In SECAM, this component alternates with
	 * Db transmission and is optimized for analog frequency modulation.
	 *
	 * @returns The Dr component value in the range [-4/3, +4/3]
	 *   - -4/3 (-1.333): Maximum cyan bias
	 *   - 0: No red-cyan bias (achromatic)
	 *   - +4/3 (+1.333): Maximum red bias
	 *
	 * @example
	 * ```typescript
	 * const red = new YDbDr(0.299, -0.45, 1.333);
	 * console.log(red.Dr); // 1.333 (maximum red component)
	 *
	 * const cyan = new YDbDr(0.701, 0.45, -1.333);
	 * console.log(cyan.Dr); // -1.333 (maximum cyan component)
	 *
	 * const gray = new YDbDr(0.5, 0, 0);
	 * console.log(gray.Dr); // 0 (no red-cyan bias)
	 * ```
	 *
	 * @remarks
	 * The Dr component uses SECAM's specific scaling factor of ±4/3, providing
	 * a wider dynamic range than typical digital video formats. This scaling is
	 * optimized for SECAM's sequential color transmission and FM characteristics.
	 */
	public get Dr(): number {
		return this.components[2];
	}

	/**
	 * Sets the Dr (red-difference chroma) component value.
	 *
	 * Controls the red-difference chrominance component along the red-cyan axis.
	 * This component works with Db in SECAM's sequential color transmission system,
	 * where Dr and Db are transmitted on alternating scan lines.
	 *
	 * @param value - The Dr value to set, must be in the range [-4/3, +4/3]
	 *   - -4/3 (-1.333): Maximum cyan bias
	 *   - 0: Neutral (no red-cyan color bias)
	 *   - +4/3 (+1.333): Maximum red bias
	 *
	 * @throws {ColorError} When value is outside the valid range [-4/3, +4/3] or not finite
	 *
	 * @example
	 * ```typescript
	 * const color = new YDbDr(0.5, 0, 0);
	 * color.Dr = 1.2;  // Add red bias
	 * console.log(color.Dr); // 1.2
	 *
	 * color.Dr = -1.0;  // Add cyan bias
	 * console.log(color.Dr); // -1.0
	 *
	 * // Error cases
	 * try {
	 *     color.Dr = -2.0;  // Throws ColorError: Channel(Dr) Out of Range
	 * } catch (error) {
	 *     console.error(error.message);
	 * }
	 * ```
	 */
	public set Dr(value: number) {
		YDbDr._AssertComponent('Dr', value);
		this.components[2] = value;
	}

	/**
	 * Creates a new YDbDr color instance with specified luminance and chrominance values.
	 *
	 * Constructs a YDbDr color with the provided Y (luminance), Db (blue-difference),
	 * and Dr (red-difference) components. All components are validated to ensure they
	 * fall within the valid ranges for the SECAM color space.
	 *
	 * @param y - Y (luminance) component value, range [0, 1] (default: 0)
	 *   - 0: Complete darkness (black)
	 *   - 1: Maximum brightness (white)
	 *   - 0.5: Middle gray
	 * @param db - Db (blue-difference chroma) component value, range [-4/3, +4/3] (default: 0)
	 *   - -4/3: Maximum yellow bias
	 *   - 0: No blue-yellow bias
	 *   - +4/3: Maximum blue bias
	 * @param dr - Dr (red-difference chroma) component value, range [-4/3, +4/3] (default: 0)
	 *   - -4/3: Maximum cyan bias
	 *   - 0: No red-cyan bias
	 *   - +4/3: Maximum red bias
	 *
	 * @throws {ColorError} When any component is outside its valid range or not finite
	 *
	 * @example
	 * ```typescript
	 * // Basic color creation
	 * const black = new YDbDr();                    // YDbDr(0, 0, 0)
	 * const white = new YDbDr(1, 0, 0);            // Pure white
	 * const gray = new YDbDr(0.5, 0, 0);           // Middle gray
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // SECAM broadcast colors
	 * const brightBlue = new YDbDr(0.3, 1.2, -0.8);   // Blue-biased color
	 * const warmRed = new YDbDr(0.4, -0.6, 1.1);      // Red-biased color
	 * const coolCyan = new YDbDr(0.6, 0.4, -1.0);     // Cyan-biased color
	 *
	 * // Validate all colors are properly constructed
	 * [brightBlue, warmRed, coolCyan].forEach(color => {
	 *     console.log(`${color.ToString()} - Valid: ${YDbDr.Validate(color)}`);
	 * });
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Error handling during construction
	 * try {
	 *     const invalid = new YDbDr(1.5, 0, 0);  // Y > 1
	 * } catch (error) {
	 *     console.error('Invalid Y component:', error.message);
	 * }
	 *
	 * try {
	 *     const invalid = new YDbDr(0.5, 2.0, 0);  // Db > 4/3
	 * } catch (error) {
	 *     console.error('Invalid Db component:', error.message);
	 * }
	 * ```
	 */
	constructor(y: number = 0, db: number = 0, dr: number = 0) {
		super();
		this.components = [0, 0, 0]; // Initialize to defaults
		this.Y = y; // Use setters for validation
		this.Db = db;
		this.Dr = dr;
	}

	/**
	 * Returns a string representation of the YDbDr color in a standardized format.
	 *
	 * Provides a human-readable string representation showing all three components
	 * in the format "YDbDr(Y, Db, Dr)". This format is useful for debugging,
	 * logging, and displaying color information in SECAM broadcast applications.
	 *
	 * @returns A string in the format "YDbDr(Y, Db, Dr)" where:
	 *   - Y is the luminance component [0, 1]
	 *   - Db is the blue-difference component [-4/3, +4/3]
	 *   - Dr is the red-difference component [-4/3, +4/3]
	 *
	 * @example
	 * ```typescript
	 * const white = new YDbDr(1, 0, 0);
	 * console.log(white.ToString()); // "YDbDr(1, 0, 0)"
	 *
	 * const blue = new YDbDr(0.114, 1.333, -1.116);
	 * console.log(blue.ToString()); // "YDbDr(0.114, 1.333, -1.116)"
	 *
	 * const custom = new YDbDr(0.75, -0.5, 0.8);
	 * console.log(custom.ToString()); // "YDbDr(0.75, -0.5, 0.8)"
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Debugging SECAM color processing
	 * const colors = [
	 *     new YDbDr(0.2, 0.8, 0.3),
	 *     new YDbDr(0.6, -0.4, 1.1),
	 *     new YDbDr(0.9, 0.1, -0.7)
	 * ];
	 *
	 * colors.forEach((color, index) => {
	 *     console.log(`Color ${index}: ${color.ToString()}`);
	 * });
	 * // Output:
	 * // Color 0: YDbDr(0.2, 0.8, 0.3)
	 * // Color 1: YDbDr(0.6, -0.4, 1.1)
	 * // Color 2: YDbDr(0.9, 0.1, -0.7)
	 * ```
	 */
	public override ToString(): string {
		return `YDbDr(${this.components.join(', ')})`;
	}	/**
	 * Type guard assertion function that validates if a value is a valid YDbDr instance.
	 *
	 * Performs comprehensive validation to ensure the provided value is a YDbDr instance
	 * with all components within their valid ranges. This function throws detailed errors
	 * for invalid values and provides TypeScript type narrowing for valid instances.
	 *
	 * Validation checks performed:
	 * - Instance validation: Confirms the value is a YDbDr object
	 * - Y component: Must be a finite number in range [0, 1]
	 * - Db component: Must be a finite number in range [-4/3, +4/3]
	 * - Dr component: Must be a finite number in range [-4/3, +4/3]
	 *
	 * @param color - The value to validate as a YDbDr instance
	 *
	 * @throws {ColorError} With message "Not a YDbDr Color" when value is not a YDbDr instance
	 * @throws {ColorError} With message "Invalid Channel(Y)" when Y component is invalid
	 * @throws {ColorError} With message "Invalid Channel(Db)" when Db component is invalid
	 * @throws {ColorError} With message "Invalid Channel(Dr)" when Dr component is invalid
	 *
	 * @example
	 * ```typescript
	 * // Type narrowing with valid YDbDr
	 * const value: unknown = new YDbDr(0.8, 0.5, -0.3);
	 * YDbDr.Assert(value); // No error, value is now typed as YDbDr
	 * console.log(value.Y, value.Db, value.Dr); // Safe to use YDbDr properties
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Error handling for invalid instances
	 * const invalidValues = [
	 *     "not a color",
	 *     new RGB(1, 0, 0),
	 *     new YDbDr(2.0, 0, 0),      // Y > 1
	 *     new YDbDr(0.5, 2.0, 0),    // Db > 4/3
	 *     new YDbDr(0.5, 0, -2.0)    // Dr < -4/3
	 * ];
	 *
	 * invalidValues.forEach((value, index) => {
	 *     try {
	 *         YDbDr.Assert(value);
	 *         console.log(`Value ${index}: Valid`);
	 *     } catch (error) {
	 *         console.error(`Value ${index}: ${error.message}`);
	 *     }
	 * });
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Batch validation for SECAM color processing
	 * function processSecamColors(colors: unknown[]): YDbDr[] {
	 *     const validColors: YDbDr[] = [];
	 *
	 *     for (const color of colors) {
	 *         try {
	 *             YDbDr.Assert(color);
	 *             validColors.push(color); // TypeScript knows this is YDbDr
	 *         } catch (error) {
	 *             console.warn(`Skipping invalid color: ${error.message}`);
	 *         }
	 *     }
	 *
	 *     return validColors;
	 * }
	 * ```
	 */

	public static override Assert(color: unknown): asserts color is YDbDr {
		AssertInstanceOf(color, YDbDr, { class: ColorError, message: 'Not a YDbDr Color' });
		YDbDr._AssertComponent('Y', color.Y);
		YDbDr._AssertComponent('Db', color.Db);
		YDbDr._AssertComponent('Dr', color.Dr);
	}

	/**
	 * Validates a single YDbDr component value by name.
	 * @param component - The component name ('Y', 'Db', or 'Dr')
	 * @param colorOrValue - The value to validate
	 * @throws {ColorError} If the value is out of range or not a number
	 */
	private static _AssertComponent(component: TYDbDrComponentSelection, color: YDbDr): void;
	private static _AssertComponent(component: TYDbDrComponentSelection, value: number): void;
	private static _AssertComponent(component: TYDbDrComponentSelection, colorOrValue:YDbDr | number): void {
		switch (component) {
			case 'Y': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.Y;
				AssertNumber(value, { gte: 0, lte: 1 }, { class: ColorError, message: 'Channel(Y) must be in range [0,1].' });
				break;
			}
			case 'Db': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.Db;
				AssertNumber(value, { gte: YDbDr.MIN, lte: YDbDr.MAX }, { class: ColorError, message: 'Channel(Db) must be in range [-4/3,4/3].' });
				break;
			}
			case 'Dr': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.Dr;
				AssertNumber(value, { gte: YDbDr.MIN, lte: YDbDr.MAX }, { class: ColorError, message: 'Channel(Dr) must be in range [-4/3,4/3].' });
				break;
			}
			default:
				throw new ColorError(`Unknown YDbDr component: ${component}`);
		}
	}

	/**
	 * Validates that an object is a valid YDbDr color with all components in correct ranges.
	 *
	 * Provides a non-throwing validation approach that returns a boolean result.
	 * This method is useful for conditional processing, filtering operations, and
	 * validation workflows where exceptions are not desired.
	 *
	 * Performs the same comprehensive validation as Assert() but returns false
	 * instead of throwing errors for invalid values.
	 *
	 * @param color - The object to validate as a YDbDr color
	 *
	 * @returns `true` if the object is a valid YDbDr instance with all components
	 *   within valid ranges, `false` otherwise
	 *
	 * @example
	 * ```typescript
	 * // Conditional processing based on validation
	 * const color1 = new YDbDr(0.8, 0.5, -0.3);
	 * const color2 = "not a color";
	 * const color3 = new YDbDr(2.0, 0, 0); // Invalid Y > 1
	 *
	 * console.log(YDbDr.Validate(color1)); // true
	 * console.log(YDbDr.Validate(color2)); // false
	 * console.log(YDbDr.Validate(color3)); // false
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Filtering valid colors from mixed array
	 * const mixedValues = [
	 *     new YDbDr(0.5, 0.2, -0.1),
	 *     "invalid",
	 *     new YDbDr(0.8, -0.3, 0.7),
	 *     new RGB(1, 0, 0),
	 *     new YDbDr(0.2, 1.0, 0.5)
	 * ];
	 *
	 * const validColors = mixedValues.filter(YDbDr.Validate);
	 * console.log(`Found ${validColors.length} valid YDbDr colors`);
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Quality control for SECAM color data import
	 * function importSecamColors(rawData: unknown[]): {
	 *     valid: YDbDr[],
	 *     invalid: unknown[],
	 *     stats: { total: number, validCount: number, invalidCount: number }
	 * } {
	 *     const valid: YDbDr[] = [];
	 *     const invalid: unknown[] = [];
	 *
	 *     for (const item of rawData) {
	 *         if (YDbDr.Validate(item)) {
	 *             valid.push(item as YDbDr);
	 *         } else {
	 *             invalid.push(item);
	 *         }
	 *     }
	 *
	 *     return {
	 *         valid,
	 *         invalid,
	 *         stats: {
	 *             total: rawData.length,
	 *             validCount: valid.length,
	 *             invalidCount: invalid.length
	 *         }
	 *     };
	 * }
	 * ```
	 */
	public static override Validate(color: unknown): boolean {
		try {
			YDbDr.Assert(color);
			return true;
		} catch {
			return false;
		}
	}	/**
	 * Converts a color from another color space to YDbDr using SECAM transformation algorithms.
	 *
	 * Provides a factory method for creating YDbDr colors from other color space representations.
	 * Currently supports conversion from RGB color space using the standard SECAM transformation
	 * matrix optimized for analog television broadcast.
	 *
	 * @param color - The source color to convert (currently supports RGB only)
	 *
	 * @returns A new YDbDr color instance with components calculated using SECAM algorithms
	 *
	 * @throws {ColorError} With message "Cannot convert to YCbCr" when the source color
	 *   type is not supported or conversion fails
	 *
	 * @example
	 * ```typescript
	 * // Basic RGB to YDbDr conversion
	 * const red = new RGB(1, 0, 0);
	 * const redYDbDr = YDbDr.From(red);
	 * console.log(redYDbDr.ToString()); // "YDbDr(0.299, -0.45, 1.333)"
	 *
	 * const green = new RGB(0, 1, 0);
	 * const greenYDbDr = YDbDr.From(green);
	 * console.log(greenYDbDr.ToString()); // "YDbDr(0.587, -0.883, 1.116)"
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Batch conversion for SECAM broadcast processing
	 * const rgbColors = [
	 *     new RGB(1, 0, 0),      // Red
	 *     new RGB(0, 1, 0),      // Green
	 *     new RGB(0, 0, 1),      // Blue
	 *     new RGB(1, 1, 0),      // Yellow
	 *     new RGB(1, 0, 1),      // Magenta
	 *     new RGB(0, 1, 1)       // Cyan
	 * ];
	 *
	 * const secamColors = rgbColors.map(rgb => YDbDr.From(rgb));
	 *
	 * secamColors.forEach((color, index) => {
	 *     console.log(`Color ${index}: ${color.ToString()}`);
	 *     console.log(`  Y: ${color.Y.toFixed(3)} (luminance)`);
	 *     console.log(`  Db: ${color.Db.toFixed(3)} (blue-diff)`);
	 *     console.log(`  Dr: ${color.Dr.toFixed(3)} (red-diff)`);
	 * });
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Error handling for unsupported color types
	 * try {
	 *     const hsv = new HSV(120, 1, 1);
	 *     const ydbdr = YDbDr.From(hsv as any); // Will throw error
	 * } catch (error) {
	 *     console.error('Conversion failed:', error.message);
	 *     // Convert to RGB first
	 *     const rgb = RGB.FromHSV(hsv);
	 *     const ydbdr = YDbDr.From(rgb);
	 *     console.log('Converted via RGB:', ydbdr.ToString());
	 * }
	 * ```
	 *
	 * @remarks
	 * The conversion process uses the standard SECAM transformation matrix that is
	 * specifically optimized for analog television broadcast. Future versions may
	 * support additional color space inputs by converting them to RGB first.
	 */

	public static From(color: RGB): YDbDr {
		if (color instanceof RGB) return YDbDr.FromRGB(color);
		throw new ColorError('Cannot convert to YCbCr');
	}

	/**
	 * Converts an RGB color to YDbDr using the SECAM standard transformation matrix.
	 *
	 * Performs the mathematical transformation from RGB to YDbDr color space using
	 * the transformation matrix specifically designed for the SECAM analog television
	 * broadcast standard. This conversion separates RGB into luminance (Y) and
	 * chrominance (Db, Dr) components optimized for frequency modulation transmission.
	 *
	 * ## Mathematical Transformation
	 * The conversion uses the SECAM transformation matrix:
	 * ```
	 * Y  = 0.299×R + 0.587×G + 0.114×B    (luminance)
	 * Db = -0.45×R - 0.883×G + 1.333×B    (blue-difference)
	 * Dr = -1.333×R + 1.116×G + 0.217×B   (red-difference)
	 * ```
	 *
	 * ## Algorithm Steps
	 * 1. Validate the input RGB color instance
	 * 2. Extract RGB component values as an array
	 * 3. Apply the SECAM transformation matrix multiplication
	 * 4. Create new YDbDr instance with calculated values
	 *
	 * @param color - The source RGB color to convert, must be a valid RGB instance
	 *
	 * @returns A new YDbDr color instance with components calculated using SECAM algorithms
	 *
	 * @throws {ColorError} When the RGB color is invalid or validation fails
	 *
	 * @example
	 * ```typescript
	 * // Primary color conversions
	 * const red = new RGB(1, 0, 0);
	 * const redYDbDr = YDbDr.FromRGB(red);
	 * console.log(redYDbDr.ToString()); // "YDbDr(0.299, -0.45, 1.333)"
	 *
	 * const green = new RGB(0, 1, 0);
	 * const greenYDbDr = YDbDr.FromRGB(green);
	 * console.log(greenYDbDr.ToString()); // "YDbDr(0.587, -0.883, 1.116)"
	 *
	 * const blue = new RGB(0, 0, 1);
	 * const blueYDbDr = YDbDr.FromRGB(blue);
	 * console.log(blueYDbDr.ToString()); // "YDbDr(0.114, 1.333, 0.217)"
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Verification of mathematical transformation
	 * const testColor = new RGB(0.8, 0.4, 0.2);
	 * const converted = YDbDr.FromRGB(testColor);
	 *
	 * // Manual calculation verification
	 * const expectedY = 0.299 * 0.8 + 0.587 * 0.4 + 0.114 * 0.2;
	 * const expectedDb = -0.45 * 0.8 - 0.883 * 0.4 + 1.333 * 0.2;
	 * const expectedDr = -1.333 * 0.8 + 1.116 * 0.4 + 0.217 * 0.2;
	 *
	 * console.log(`Calculated Y: ${converted.Y}, Expected: ${expectedY}`);
	 * console.log(`Calculated Db: ${converted.Db}, Expected: ${expectedDb}`);
	 * console.log(`Calculated Dr: ${converted.Dr}, Expected: ${expectedDr}`);
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // SECAM broadcast color processing pipeline
	 * const frameColors = [
	 *     new RGB(0.95, 0.85, 0.75),  // Skin tone
	 *     new RGB(0.2, 0.6, 0.3),     // Vegetation
	 *     new RGB(0.1, 0.4, 0.8),     // Sky blue
	 *     new RGB(0.8, 0.2, 0.1)      // Red object
	 * ];
	 *
	 * const secamFrame = frameColors.map(rgb => {
	 *     const ydbdr = YDbDr.FromRGB(rgb);
	 *     return {
	 *         original: rgb.ToString(),
	 *         secam: ydbdr.ToString(),
	 *         luminance: ydbdr.Y.toFixed(3),
	 *         blueChroma: ydbdr.Db.toFixed(3),
	 *         redChroma: ydbdr.Dr.toFixed(3)
	 *     };
	 * });
	 *
	 * secamFrame.forEach((pixel, index) => {
	 *     console.log(`Pixel ${index}:`);
	 *     console.log(`  RGB: ${pixel.original}`);
	 *     console.log(`  SECAM: ${pixel.secam}`);
	 *     console.log(`  Y=${pixel.luminance}, Db=${pixel.blueChroma}, Dr=${pixel.redChroma}`);
	 * });
	 * ```
	 *
	 * @internal
	 *
	 * @remarks
	 * This conversion is specifically optimized for SECAM broadcast requirements and
	 * uses different coefficients than standard YUV or YCbCr transformations. The
	 * resulting chrominance components have a wider dynamic range (±4/3) to accommodate
	 * SECAM's frequency modulation characteristics.
	 */
	public static FromRGB(color: RGB): YDbDr {
		RGB.Validate(color);

		const rgb = color.ToArray();

		const transformation: IMatrix3 = [
			[0.299, 0.587, 0.114],
			[-0.45, -0.883, 1.333],
			[-1.333, 1.116, 0.217],
		];

		const ydbdr = MatrixMultiply(transformation, rgb);

		return new YDbDr(ydbdr[0], ydbdr[1], ydbdr[2]);
	}
}
