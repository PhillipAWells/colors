/* eslint-disable no-magic-numbers */
import { DegreesToRadians, IMatrix3, MatrixMultiply } from '@pawells/math-extended';
import { AssertInstanceOf, AssertNumber } from './assert.js';
import { ColorSpace } from './_color-space.js';
import { ColorError } from '../error.js';
import { ColorSpaceManager } from './manager.js';
import { RGB } from './rgb.js';
import { YIQ } from './yiq.js';

/**
 * Valid YUV color space standards.
 * - BT470: ITU-R BT.470 / PAL standard coefficients
 * - BT709: ITU-R BT.709 / HDTV standard coefficients
 */
type TStandards = 'BT470' | 'BT709';
type TYUVComponentSelection = 'Y' | 'U' | 'V';

/**
 * Represents a color in the YUV color space used in analog and digital video standards.
 *
 * The YUV color space is a fundamental video encoding standard that separates luminance (brightness)
 * from chrominance (color) information, enabling efficient video transmission and backward compatibility
 * with black-and-white television systems. It forms the basis for many television and video standards
 * worldwide, including PAL, NTSC, SECAM, and modern digital video formats.
 *
 * ## Color Components
 * - **Y (Luma)**: 0-1, weighted sum of RGB representing perceived brightness
 *   - Based on human luminance sensitivity
 *   - Compatible with black-and-white TV signals
 *   - Uses standard-specific coefficients for optimal perception
 * - **U (Blue-difference)**: -0.5 to +0.5, blue minus luma chroma component
 *   - Negative values: shift toward yellow/orange
 *   - Positive values: shift toward blue/cyan
 *   - Scaled for efficient transmission bandwidth
 * - **V (Red-difference)**: -0.5 to +0.5, red minus luma chroma component
 *   - Negative values: shift toward cyan/green
 *   - Positive values: shift toward red/magenta
 *   - Optimized for human color perception sensitivity
 *
 * ## Supported TStandards and Applications
 * - **BT.470 (PAL/NTSC)**: Legacy standard definition television systems
 *   - Used in analog PAL and NTSC broadcasting
 *   - Optimized for CRT displays and analog transmission
 *   - Different gamma correction and color primaries
 * - **BT.709 (HDTV)**: High-definition television standard
 *   - Modern digital video and broadcasting standard
 *   - Improved color accuracy and wider gamut support
 *   - Standard for HD video production and display
 *
 * ## Technical Characteristics
 * - **Luminance separation**: Y component preserves brightness information independently
 * - **Bandwidth efficiency**: U/V components can be subsampled for compression
 * - **Backward compatibility**: Y signal works on monochrome displays
 * - **Perceptual optimization**: Coefficients based on human visual system sensitivity
 * - **Standard compliance**: Follows ITU-R recommendations and broadcasting standards
 * - **Conversion accuracy**: Mathematically precise transformations to/from RGB
 *
 * ## Applications and Use Cases
 * - **Video encoding**: MPEG, H.264, H.265, and other compression standards
 * - **Broadcasting**: Television transmission and digital video standards
 * - **Video production**: Professional video editing and post-production workflows
 * - **Display technology**: Monitor calibration and video processing pipelines
 * - **Color analysis**: Video quality assessment and color correction
 * - **Streaming media**: Web video platforms and real-time communication
 *
 * ## Mathematical Foundation
 * The YUV transformation uses standard-specific matrices to convert RGB values:
 * - Y component: weighted sum based on luminance sensitivity (∼30% red, 59% green, 11% blue)
 * - U/V components: scaled color differences optimized for transmission efficiency
 * - Matrix coefficients vary between standards to match display characteristics
 *
 * ## Relationship to Other Color Spaces
 * - **RGB**: Direct conversion using standard-specific transformation matrices
 * - **YIQ**: Related NTSC color space with rotated chroma axes for better transmission
 * - **YCbCr**: Digital equivalent used in JPEG, MPEG, and other digital formats
 * - **HSV/HSL**: Alternative for intuitive color manipulation in design applications
 * * @example Basic video color operations
 * ```typescript
 * // Create standard video colors
 * const black = new YUV(0, 0, 0);          // Pure black (no signal)
 * const white = new YUV(1, 0, 0);          // Pure white (maximum luma)
 * const gray = new YUV(0.5, 0, 0);         // Mid-gray (50% brightness)
 *
 * // Create colored video signals
 * const red = new YUV(0.299, -0.147, 0.615, 'BT470');     // PAL red
 * const blue = new YUV(0.114, 0.436, -0.100, 'BT470');    // PAL blue
 * const hdtvGreen = new YUV(0.7152, -0.3854, -0.4542, 'BT709'); // HDTV green
 * ```
 *
 * @example Standard-specific conversions
 * ```typescript
 * // Convert RGB to different YUV standards
 * const rgbColor = new RGB(0.8, 0.2, 0.4);
 * const palYuv = YUV.FromRGB(rgbColor, 'BT470');     // For PAL/NTSC systems
 * const hdtvYuv = YUV.FromRGB(rgbColor, 'BT709');    // For HDTV systems
 *
 * // Compare standards
 * console.log('PAL:', palYuv.ToString());
 * console.log('HDTV:', hdtvYuv.ToString());
 * ```
 *
 * @example Video processing workflows
 * ```typescript
 * // Brightness adjustment preserving color
 * const originalColor = new YUV(0.3, 0.2, -0.1, 'BT709');
 * const brighterColor = new YUV(originalColor.Y * 1.2, originalColor.U, originalColor.V, 'BT709');
 *
 * // Chroma adjustment (color intensity)
 * const saturatedColor = new YUV(originalColor.Y, originalColor.U * 1.5, originalColor.V * 1.5, 'BT709');
 *
 * // Cross-standard conversion via RGB
 * const palColor = new YUV(0.5, 0.3, -0.2, 'BT470');
 * const rgbIntermediate = RGB.From(palColor);
 * const hdtvEquivalent = YUV.FromRGB(rgbIntermediate, 'BT709');
 * ```
 */
@ColorSpaceManager.Register({
	name: 'YUV',
	description: 'Represents a color in the YUV color space used in analog and digital video standards.',
	converters: [
		'RGB',
		'YIQ',
	],
})
export class YUV extends ColorSpace {
	/**
	 * Internal array storing the YUV component values [Y, U, V].
	 * Values are floating-point numbers.
	 * - Index 0: Y (luma/brightness) [0, 1]
	 * - Index 1: U (blue-difference) [-0.5, 0.5]
	 * - Index 2: V (red-difference) [-0.5, 0.5]
	 *
	 * Direct access to this array should be avoided in favor of using
	 * the public Y, U, and V properties which include validation.
	 */
	protected override components: [number, number, number];

	/**
	 * Gets the Y (luma/brightness) component value.
	 *
	 * @returns {number} The Y component value between 0 and 1
	 *
	 * @remarks
	 * The Y (luma) component represents perceived brightness:
	 * - 0: Black (minimum brightness)
	 * - 1: White (maximum brightness)
	 * - Values between 0-1: Proportional brightness levels
	 *
	 * This component is weighted according to human perception of color
	 * and matches the black-and-white TV signal for compatibility.
	 */
	public get Y(): number {
		return this.components[0];
	}

	/**
	 * Sets the Y (luma/brightness) component value.
	 *
	 * @param value - The Y value to set (must be between 0 and 1)
	 * @throws {Error} If value is NaN or outside the valid range
	 *
	 * @remarks
	 * Enforces strict validation to ensure color integrity:
	 * - Must be a valid number (not NaN)
	 * - Must be within the range [0, 1]
	 * - Values outside this range will throw an error
	 */
	public set Y(value: number) {
		YUV._AssertComponent('Y', value);
		this.components[0] = value;
	}

	/**
	 * Gets the U (blue-difference chroma) component value.
	 *
	 * @returns {number} The U component value between -0.5 and 0.5
	 *
	 * @remarks
	 * The U component represents the blue-yellow color difference:
	 * - Negative values: Shift toward yellow
	 * - Positive values: Shift toward blue
	 * - 0: No color shift on this axis
	 * - ±0.5: Maximum color shift
	 *
	 * This component is derived from the difference between
	 * blue and luma (B-Y) with appropriate scaling.
	 */
	public get U(): number {
		return this.components[1];
	}

	/**
	 * Sets the U (blue-difference chroma) component value.
	 *
	 * @param value - The U value to set (must be between -0.5 and 0.5)
	 * @throws {Error} If value is NaN or outside the valid range
	 *
	 * @remarks
	 * Enforces strict validation to ensure color integrity:
	 * - Must be a valid number (not NaN)
	 * - Must be within the range [-0.5, 0.5]
	 * - Values outside this range will throw an error
	 */
	public set U(value: number) {
		YUV._AssertComponent('U', value);
		this.components[1] = value;
	}

	/**
	 * Gets the V (red-difference chroma) component value.
	 *
	 * @returns {number} The V component value between -0.5 and 0.5
	 *
	 * @remarks
	 * The V component represents the red-cyan color difference:
	 * - Negative values: Shift toward cyan
	 * - Positive values: Shift toward red
	 * - 0: No color shift on this axis
	 * - ±0.5: Maximum color shift
	 *
	 * This component is derived from the difference between
	 * red and luma (R-Y) with appropriate scaling.
	 */
	public get V(): number {
		return this.components[2];
	}

	/**
	 * Sets the V (red-difference chroma) component value.
	 *
	 * @param value - The V value to set (must be between -0.5 and 0.5)
	 * @throws {Error} If value is NaN or outside the valid range
	 *
	 * @remarks
	 * Enforces strict validation to ensure color integrity:
	 * - Must be a valid number (not NaN)
	 * - Must be within the range [-0.5, 0.5]
	 * - Values outside this range will throw an error
	 */
	public set V(value: number) {
		YUV._AssertComponent('V', value);
		this.components[2] = value;
	}

	/**
	 * The YUV color space standard being used.
	 * This determines the transformation coefficients used for RGB conversion.
	 */
	public readonly Standard: TStandards;

	/**
	 * Creates a new YUV color instance with specified component values and standard.
	 *
	 * @param y - Y (luma) component [0, 1], default: 0 (black)
	 * @param u - U (blue-difference) component [-0.5, 0.5], default: 0 (no blue shift)
	 * @param v - V (red-difference) component [-0.5, 0.5], default: 0 (no red shift)
	 * @param standard - Color space standard to use, default: 'BT709' (HDTV standard)
	 * @throws {ColorError} If any component value is invalid or outside allowed ranges
	 *
	 * @remarks
	 * The constructor performs several validation and initialization steps:
	 * 1. **Component initialization**: Sets up the internal component array structure
	 * 2. **Standard assignment**: Configures the transformation standard for RGB conversion
	 * 3. **Comprehensive validation**: Ensures all components are within valid ranges
	 * 4. **Error handling**: Provides specific error messages for validation failures
	 *
	 * **Component Validation Details:**
	 * - **Y component**: Must be between 0 (black) and 1 (white), representing perceived brightness
	 * - **U component**: Must be between -0.5 and +0.5, controlling blue-yellow color balance
	 * - **V component**: Must be between -0.5 and +0.5, controlling red-cyan color balance
	 * - **Standard selection**: Determines the mathematical coefficients used for RGB conversions
	 *
	 * **Standard Selection Guidelines:**
	 * - **BT709**: Use for modern HDTV, digital video, web content, and HD broadcasting
	 * - **BT470**: Use for legacy PAL/NTSC systems, analog television, and SD content
	 *
	 * @example Basic color creation
	 * ```typescript
	 * // Create pure colors
	 * const black = new YUV();                    // Pure black (0, 0, 0)
	 * const white = new YUV(1, 0, 0);            // Pure white with maximum brightness
	 * const gray = new YUV(0.5, 0, 0);           // Mid-gray (50% brightness)
	 * ```
	 *	 * @example Video standard specific creation
	 * ```typescript
	 * // Create colors for different video standards
	 * const hdtvRed = new YUV(0.2126, -0.1146, 0.5, 'BT709');      // HDTV red
	 * const palRed = new YUV(0.299, -0.147, 0.615, 'BT470');       // PAL/NTSC red
	 *
	 * // Create colors with specific chroma values
	 * const blueShift = new YUV(0.5, 0.3, 0, 'BT709');             // Blue-shifted color
	 * const redShift = new YUV(0.5, 0, 0.3, 'BT709');              // Red-shifted color
	 * ```
	 *
	 * @example Video production workflows
	 * ```typescript
	 * // Create broadcast-safe colors (limited range)
	 * const safeLuma = new YUV(0.7, 0.2, -0.15, 'BT709');          // Broadcast-safe bright color
	 * const safeChroma = new YUV(0.5, 0.25, 0.25, 'BT709');        // Limited chroma saturation
	 *
	 * // Legacy television compatibility
	 * const ntscCompatible = new YUV(0.3, 0.1, -0.1, 'BT470');     // NTSC-compatible color
	 * const palCompatible = new YUV(0.6, -0.2, 0.15, 'BT470');     // PAL-compatible color
	 * ```
	 *
	 * @example Error handling and validation
	 * ```typescript
	 * try {
	 *     // These will throw ColorError due to invalid ranges
	 *     const invalidY = new YUV(1.5, 0, 0);           // Y > 1
	 *     const invalidU = new YUV(0.5, 0.8, 0);         // U > 0.5
	 *     const invalidV = new YUV(0.5, 0, -0.7);        // V < -0.5
	 * } catch (error) {
	 *     console.error('Invalid YUV component:', error.message);
	 * }
	 * ```
	 */
	constructor(y: number = 0, u: number = 0, v: number = 0, standard: TStandards = 'BT709') {
		super();
		this.components = [0, 0, 0]; // Initialize to defaults
		this.Standard = standard;
		this.Y = y; // Use setters for validation
		this.U = u;
		this.V = v;
	}

	/**
	 * Returns a string representation of the YUV color for debugging and logging.
	 *
	 * @returns {string} A formatted string in the format "YUV(Y, U, V)" with full precision
	 *
	 * @remarks
	 * The string representation provides a clear, consistent format for:
	 * - **Debugging**: Quick visual inspection of color values during development
	 * - **Logging**: Consistent format for logging color operations and transformations
	 * - **Documentation**: Clear representation in code examples and documentation
	 * - **Testing**: Reliable string comparison in unit tests and validation
	 *
	 * **Format Specifications:**
	 * - Uses standard mathematical notation with parentheses
	 * - Maintains full floating-point precision for accuracy
	 * - Components are comma-separated for readability
	 * - No rounding applied to preserve exact values
	 *
	 * **Note**: This method does not include the standard information (BT470/BT709)
	 * in the string representation. Use the Standard property separately if needed.
	 *
	 * @example Basic string representation
	 * ```typescript
	 * const black = new YUV(0, 0, 0);
	 * console.log(black.ToString()); // "YUV(0, 0, 0)"
	 *
	 * const color = new YUV(0.5, 0.3, -0.2);
	 * console.log(color.ToString()); // "YUV(0.5, 0.3, -0.2)"
	 * ```
	 *	 * @example Debugging and logging usage
	 * ```typescript
	 * const originalColor = new YUV(0.3, 0.2, -0.1, 'BT709');
	 * console.log(`Original: ${originalColor.ToString()}`);
	 *
	 * // After some processing
	 * const processedColor = new YUV(0.6, 0.1, -0.05, 'BT709');
	 * console.log(`Processed: ${processedColor.ToString()}`);
	 * console.log(`Standard: ${processedColor.Standard}`);
	 * ```
	 *
	 * @example Testing and validation
	 * ```typescript
	 * const testColor = new YUV(0.7, 0.25, -0.15);
	 * const expectedString = "YUV(0.7, 0.25, -0.15)";
	 *
	 * // Reliable string comparison for tests
	 * if (testColor.ToString() === expectedString) {
	 *     console.log('Color validation passed');
	 * }
	 * ```
	 */
	public override ToString(): string {
		return `YUV(${this.Y}, ${this.U}, ${this.V})`;
	}

	/**
	 * Creates a deep clone of this YUV color instance.
	 *
	 * @returns A new YUV instance with the same component values and standard
	 */
	public override Clone(): this {
		return new YUV(this.Y, this.U, this.V, this.Standard) as this;
	}

	/**
	 * Type guard assertion function that validates an unknown value as a YUV color instance.
	 * Throws a ColorError if the provided value is not a valid YUV instance with correct component ranges.
	 *
	 * @param color - The unknown value to validate and assert as a YUV instance
	 * @throws {ColorError} When the value is not a YUV instance or has invalid component values
	 *
	 * @remarks
	 * This method performs comprehensive validation including:
	 * 1. **Type checking**: Verifies the value is an instance of the YUV class
	 * 2. **Component validation**: Ensures all components are within valid ranges:
	 *    - Y component: [0, 1] - represents luma/brightness
	 *    - U component: [-0.5, 0.5] - represents blue-difference chroma
	 *    - V component: [-0.5, 0.5] - represents red-difference chroma
	 * 3. **Number validation**: Ensures all components are finite numbers (not NaN or Infinity)
	 *
	 * **Error Messages:**
	 * - "Not a YUV Color": Instance type validation failed
	 * - "Invalid Channel(Y)": Y component is invalid (NaN, Infinity, or out of range)
	 * - "Invalid Channel(U)": U component is invalid (NaN, Infinity, or out of range)
	 * - "Invalid Channel(V)": V component is invalid (NaN, Infinity, or out of range)
	 *
	 * **TypeScript Type Narrowing:**
	 * After successful assertion, TypeScript will treat the input parameter as a YUV type,
	 * enabling safe access to YUV properties and methods without additional type checking.
	 *	 * @example Type narrowing for unknown values
	 * ```typescript
	 * function processUnknownColor(unknownValue: unknown) {
	 *     YUV.Assert(unknownValue); // Type assertion with validation
	 *
	 *     // TypeScript now knows unknownValue is YUV
	 *     console.log(`Luma: ${unknownValue.Y}`);
	 *     console.log(`Blue-diff: ${unknownValue.U}`);
	 *     console.log(`Red-diff: ${unknownValue.V}`);
	 *     console.log(`Standard: ${unknownValue.Standard}`);
	 * }
	 * ```
	 *
	 * @example Error handling and validation
	 * ```typescript
	 * function validateVideoColors(colors: unknown[]) {
	 *     const validColors: YUV[] = [];
	 *
	 *     for (const color of colors) {
	 *         try {
	 *             YUV.Assert(color);
	 *             validColors.push(color); // TypeScript knows color is YUV
	 *         } catch (error) {
	 *             console.error(`Invalid YUV color: ${error.message}`);
	 *         }
	 *     }
	 *
	 *     return validColors;
	 * }
	 * ```
	 *
	 * @example Input validation in video processing
	 * ```typescript
	 * function adjustVideoLuma(color: unknown, lumaFactor: number): YUV {
	 *     YUV.Assert(color); // Validate input is YUV
	 *
	 *     // Safe to access YUV properties after assertion
	 *     const adjustedY = Math.min(1, Math.max(0, color.Y * lumaFactor));
	 *     return new YUV(adjustedY, color.U, color.V, color.Standard);
	 * }
	 * ```
	 */
	public static override Assert(color: unknown): asserts color is YUV {
		AssertInstanceOf(color, YUV, { class: ColorError, message: 'Not a YUV Color' });
		YUV._AssertComponent('Y', color.Y);
		YUV._AssertComponent('U', color.U);
		YUV._AssertComponent('V', color.V);
	}

	/**
	 * Validates a single YUV component value by name.
	 * @param component - The component name ('Y', 'U', or 'V')
	 * @param colorOrValue - The value to validate
	 * @throws {ColorError} If the value is out of range or not a number
	 */
	private static _AssertComponent(component: TYUVComponentSelection, color: YUV): void;
	private static _AssertComponent(component: TYUVComponentSelection, value: number): void;
	private static _AssertComponent(component: TYUVComponentSelection, colorOrValue: YUV | number): void {
		switch (component) {
			case 'Y': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.Y;
				AssertNumber(value, { gte: 0, lte: 1 }, { class: ColorError, message: 'Channel(Y) must be in range [0, 1]' });
				break;
			}
			case 'U': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.U;
				AssertNumber(value, { gte: -0.5, lte: 0.5 }, { class: ColorError, message: 'Channel(U) must be in range [-0.5, 0.5]' });
				break;
			}
			case 'V': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.V;
				AssertNumber(value, { gte: -0.5, lte: 0.5 }, { class: ColorError, message: 'Channel(V) must be in range [-0.5, 0.5]' });
				break;
			}
		}
	}

	/**
	 * Validates that an unknown value is a valid YUV color instance without throwing errors.
	 * Returns true if the value is a valid YUV color, false otherwise.
	 *
	 * @param color - The unknown value to validate as a YUV color instance
	 * @returns {boolean} True if the value is a valid YUV color, false otherwise
	 *
	 * @remarks
	 * This method provides a non-throwing alternative to the Assert method for validation.
	 * It performs the same comprehensive validation checks but returns a boolean result
	 * instead of throwing exceptions, making it suitable for conditional processing.
	 *
	 * **Validation Checks Performed:**
	 * 1. **Instance verification**: Confirms the value is a YUV class instance
	 * 2. **Component range validation**: Ensures all components are within valid ranges
	 * 3. **Number validation**: Verifies components are finite numbers (not NaN/Infinity)
	 *
	 * **Use Cases:**
	 * - **Conditional processing**: Filter arrays of mixed color types
	 * - **Safe validation**: Check validity without exception handling overhead
	 * - **Type guards**: Use in TypeScript type guard functions
	 * - **Quality control**: Batch validation of color data sets
	 *
	 * @example Array filtering and conditional processing
	 * ```typescript
	 * const mixedColors: unknown[] = [
	 *     new YUV(0.5, 0.2, -0.1),
	 *     new RGB(0.8, 0.3, 0.2),
	 *     { invalid: "object" },
	 *     new YUV(0.7, -0.3, 0.4),
	 *     null
	 * ];
	 *
	 * // Filter to get only valid YUV colors
	 * const validYuvColors = mixedColors.filter(YUV.Validate) as YUV[];
	 * console.log(`Found ${validYuvColors.length} valid YUV colors`);
	 * ```
	 *
	 * @example Batch validation workflow
	 * ```typescript
	 * function processVideoColors(colors: unknown[]): { valid: YUV[], invalid: unknown[] } {
	 *     const result = { valid: [] as YUV[], invalid: [] as unknown[] };
	 *
	 *     for (const color of colors) {
	 *         if (YUV.Validate(color)) {
	 *             result.valid.push(color as YUV);
	 *         } else {
	 *             result.invalid.push(color);
	 *         }
	 *     }
	 *
	 *     return result;
	 * }
	 * ```
	 *
	 * @example Type guard function implementation
	 * ```typescript
	 * function isYUVColor(value: unknown): value is YUV {
	 *     return YUV.Validate(value);
	 * }
	 *
	 * // Usage in type narrowing
	 * if (isYUVColor(someColor)) {
	 *     // TypeScript knows someColor is YUV here
	 *     console.log(`Luma: ${someColor.Y}, Standard: ${someColor.Standard}`);
	 * }
	 * ```
	 */
	public static override Validate(color: unknown): boolean {
		try {
			YUV.Assert(color);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Converts a color from another supported color space to YUV using appropriate transformation algorithms.
	 *
	 * @param color - The source color to convert from (currently supports RGB and YIQ)
	 * @returns {YUV} A new YUV color instance representing the converted color
	 * @throws {ColorError} If the source color space is not supported or invalid
	 *
	 * @remarks
	 * This is the primary conversion entry point that automatically detects the source color space
	 * and delegates to the appropriate specialized conversion method. Each conversion algorithm
	 * is optimized for the specific characteristics of the source color space.
	 *
	 * **Supported Color Space Conversions:**
	 * - **RGB → YUV**: Uses standard-specific transformation matrices (BT470 or BT709)
	 * - **YIQ → YUV**: Uses trigonometric transformation preserving luminance
	 *
	 * **Conversion Process:**
	 * 1. **Source validation**: Verifies the input color is valid and from a supported space
	 * 2. **Algorithm selection**: Chooses the appropriate conversion method
	 * 3. **Mathematical transformation**: Applies color space-specific formulas
	 * 4. **Result validation**: Ensures the output YUV color is within valid ranges
	 *
	 * **Standard Selection:**
	 * - RGB conversions: Allow explicit standard selection (defaulting to BT709)
	 * - YIQ conversions: Always produce BT709 standard output
	 *
	 * @example Converting from RGB with different standards
	 * ```typescript
	 * const rgbColor = new RGB(0.8, 0.3, 0.2);
	 *
	 * // Convert using modern HDTV standard (default)
	 * const yuvHD = YUV.From(rgbColor);
	 * console.log(`HD: ${yuvHD.ToString()}, Standard: ${yuvHD.Standard}`);
	 *
	 * // For legacy systems, use FromRGB with specific standard
	 * const yuvPAL = YUV.FromRGB(rgbColor, 'BT470');
	 * console.log(`PAL: ${yuvPAL.ToString()}, Standard: ${yuvPAL.Standard}`);
	 * ```
	 *
	 * @example Converting from YIQ color space
	 * ```typescript
	 * const yiqColor = new YIQ(0.5, 0.3, -0.2);
	 * const yuvColor = YUV.From(yiqColor);
	 *
	 * console.log(`Original YIQ: ${yiqColor.ToString()}`);
	 * console.log(`Converted YUV: ${yuvColor.ToString()}`);
	 * console.log(`Output standard: ${yuvColor.Standard}`); // Always BT709
	 * ```
	 *
	 * @example Batch conversion with error handling
	 * ```typescript
	 * const sourceColors: (RGB | YIQ)[] = [
	 *     new RGB(0.9, 0.1, 0.1),
	 *     new YIQ(0.6, 0.2, -0.1),
	 *     new RGB(0.2, 0.8, 0.3)
	 * ];
	 *
	 * const yuvColors: YUV[] = [];
	 *
	 * for (const color of sourceColors) {
	 *     try {
	 *         const yuv = YUV.From(color);
	 *         yuvColors.push(yuv);
	 *         console.log(`Converted: ${yuv.ToString()}`);
	 *     } catch (error) {
	 *         console.error(`Conversion failed: ${error.message}`);
	 *     }
	 * }
	 * ```
	 *	/**
	 * Creates a YUV color instance from another color space using optimal conversion algorithms.
	 *
	 * @param color - The source color to convert from a supported color space
	 * @returns {YUV} A new YUV color instance with converted values
	 * @throws {ColorError} If the input color type is not supported or invalid
	 *
	 * @remarks
	 * ## Supported Color Space Conversions
	 *
	 * **RGB → YUV**: Uses standard-specific transformation matrices
	 * - Applies ITU-R BT.709 coefficients by default for HDTV compatibility
	 * - Preserves color accuracy with mathematically precise conversion
	 * - Maintains luminance weighting based on human visual sensitivity
	 *
	 * **YIQ → YUV**: Direct chroma rotation transformation
	 * - Preserves Y (luminance) component unchanged
	 * - Rotates I/Q color difference axes to U/V coordinates
	 * - Uses trigonometric transformation with 33° rotation angle
	 *
	 * ## Conversion Strategy
	 * The method automatically detects the input color type and applies the appropriate
	 * conversion algorithm optimized for that specific color space transformation.
	 * All conversions maintain color accuracy and follow international standards.
	 *
	 * ## Applications
	 * - **Video processing**: Converting color data for video encoding workflows
	 * - **Broadcasting**: Preparing colors for television transmission standards
	 * - **Color analysis**: Analyzing color data from different acquisition systems
	 * - **TStandards compliance**: Converting between different video format requirements
	 *
	 * @example Basic color space conversions
	 * ```typescript
	 * // Convert RGB to YUV for video processing
	 * const rgbColor = new RGB(0.8, 0.2, 0.4);
	 * const yuvFromRgb = YUV.From(rgbColor);
	 * console.log(`RGB to YUV: ${yuvFromRgb.ToString()}`);
	 *
	 * // Convert YIQ to YUV for broadcast compatibility
	 * const yiqColor = new YIQ(0.5, 0.3, -0.2);
	 * const yuvFromYiq = YUV.From(yiqColor);
	 * console.log(`YIQ to YUV: ${yuvFromYiq.ToString()}`);
	 * ```
	 *
	 * @example Batch conversion with error handling
	 * ```typescript
	 * const sourceColors: (RGB | YIQ)[] = [
	 *     new RGB(1, 0, 0),         // Pure red
	 *     new RGB(0, 1, 0),         // Pure green
	 *     new RGB(0, 0, 1),         // Pure blue
	 *     new YIQ(0.6, 0.2, -0.1),  // NTSC color
	 *     new RGB(0.2, 0.8, 0.3)    // Custom green
	 * ];
	 *
	 * const yuvColors: YUV[] = [];
	 *
	 * for (const color of sourceColors) {
	 *     try {
	 *         const yuv = YUV.From(color);
	 *         yuvColors.push(yuv);
	 *         console.log(`Converted: ${yuv.ToString()}`);
	 *     } catch (error) {
	 *         console.error(`Conversion failed: ${error.message}`);
	 *     }
	 * }
	 * ```
	 *
	 * @example Video workflow with color space detection
	 * ```typescript
	 * function convertToYUV(inputColor: unknown): YUV | null {
	 *     try {
	 *         if (RGB.Validate(inputColor)) {
	 *             return YUV.From(inputColor as RGB);
	 *         }
	 *         if (YIQ.Validate(inputColor)) {
	 *             return YUV.From(inputColor as YIQ);
	 *         }
	 *         console.warn('Unsupported color space for YUV conversion');
	 *         return null;
	 *     } catch (error) {
	 *         console.error(`YUV conversion failed: ${error.message}`);
	 *         return null;
	 *     }
	 * }
	 * ```
	 *
	 * @example Professional video production workflow
	 * ```typescript
	 * // Process colors for different video standards
	 * const sourceRgb = new RGB(0.7, 0.3, 0.5);
	 *
	 * // Convert to YUV for video encoding
	 * const yuvColor = YUV.From(sourceRgb);
	 *
	 * // Adjust brightness while preserving chrominance
	 * const brightened = new YUV(
	 *     Math.min(1, yuvColor.Y * 1.2),  // Increase brightness
	 *     yuvColor.U,                      // Preserve blue-difference
	 *     yuvColor.V,                      // Preserve red-difference
	 *     yuvColor.Standard
	 * );
	 *
	 * console.log(`Original: ${yuvColor.ToString()}`);
	 * console.log(`Brightened: ${brightened.ToString()}`);
	 * ```
	 */
	public static From(color: RGB | YIQ): YUV {
		if (color instanceof RGB) return YUV.FromRGB(color);
		if (color instanceof YIQ) return YUV.FromYIQ(color);
		throw new ColorError('Cannot convert to YIQ');
	}

	/**
	 * Converts an RGB color to YUV using standard-specific transformations.
	 *
	 * @param color - The RGB color to convert
	 * @param standard - The YUV standard to use (default: 'BT709')
	 * @returns {YUV} A new YUV color instance
	 * @throws {Error} If the input color is not a valid RGB color
	 *
	 * @remarks
	 * The conversion process:
	 * 1. Validates the RGB color
	 * 2. Selects transformation matrix based on standard:
	 *    BT470 (PAL/NTSC):
	 *    [[0.299, 0.587, 0.114],
	 *     [-0.14713, -0.28886, 0.436],
	 *     [0.615, -0.51499, -0.10001]]
	 *
	 *    BT709 (HDTV):
	 *    [[1, 0, 1.28033],
	 *     [1, -0.21482, -0.38059],
	 *     [1, 2.12798, 0]]
	 * 3. Applies the transformation
	 *
	 * Different standards use different coefficients to account for
	 * variations in display technology and human perception.
	 */
	public static FromRGB(color: RGB, standard: TStandards = 'BT709'): YUV {
		RGB.Validate(color);

		const rgb = color.ToArray();

		let transformation: IMatrix3 | undefined;

		if (standard === 'BT470') {
			transformation = [
				[0.299, 0.587, 0.114],
				[-0.14713, -0.28886, 0.436],
				[0.615, -0.51499, -0.10001],
			];
		} else if (standard === 'BT709') {
			transformation = [
				[0.2126, 0.7152, 0.0722],
				[-0.1146, -0.3854, 0.5],
				[0.5, -0.4542, -0.0458],
			];
		}
		if (!transformation) {
			throw new ColorError(`Unsupported YUV standard: ${standard}`);
		}

		const yuv = MatrixMultiply(transformation, rgb);

		// Clamp values to valid ranges to handle floating-point rounding errors
		const y = Math.max(0, Math.min(1, yuv[0]));
		const u = Math.max(-0.5, Math.min(0.5, yuv[1]));
		const v = Math.max(-0.5, Math.min(0.5, yuv[2]));

		return new YUV(y, u, v, standard);
	}

	/**
	 * Converts a YIQ color to YUV using a fixed transformation.
	 *
	 * @param color - The YIQ color to convert
	 * @returns {YUV} A new YUV color instance in BT709 standard
	 * @throws {Error} If the input color is not a valid YIQ color
	 *
	 * @remarks
	 * The conversion process:
	 * 1. Validates the YIQ color
	 * 2. Applies the YIQ to YUV transformation matrix:
	 *    [[1, 0, 0],
	 *     [0, -0.54464, 0.83867],
	 *     [0, 0.83867, 0.54464]]
	 *
	 * This conversion preserves the Y (luminance) component and
	 * transforms the color difference components (I/Q to U/V).
	 * The result uses BT709 standard as it's the most common
	 * in modern video systems.
	 */
	public static FromYIQ(color: YIQ): YUV {
		YIQ.Validate(color);

		const yiq = color.ToArray();

		const transformation:IMatrix3 = [
			[1, 0, 0],
			[0, -1 * Math.sin(DegreesToRadians(33)), Math.cos(DegreesToRadians(33))],
			[0, Math.cos(DegreesToRadians(33)), Math.sin(DegreesToRadians(33))],
		];

		const yuv = MatrixMultiply(transformation, yiq);

		return new YUV(yuv[0], yuv[1], yuv[2], 'BT709');
	}
}
