/* eslint-disable no-magic-numbers */
import { DegreesToRadians, IMatrix3, MatrixMultiply } from '@pawells/math-extended';
import { AssertNumber, AssertInstanceOf } from './assert.js';
import { ColorSpace } from './_color-space.js';
import { ColorSpaceManager } from './manager.js';
import { RGB } from './rgb.js';
import { YUV } from './yuv.js';
import { ColorError } from '../error.js';

type TYIQComponentSelection = 'Y' | 'I' | 'Q';

/**
 * Represents a color in the YIQ color space.
 *
 * YIQ is a color space used by the NTSC color TV system. It separates the color
 * information into luminance (Y) and two color-difference signals (I and Q).
 * This color space was designed for efficient transmission of color television signals.
 */
@ColorSpaceManager.Register({
	name: 'YIQ',
	description: 'Represents a color in the YIQ color space.',
	converters: [
		'RGB',
		'YUV',
	],
})
export class YIQ extends ColorSpace {
	/**
	 * Internal array storing the YIQ component values [Y, I, Q].
	 * Values are floating-point numbers.
	 * - Index 0: Y (luma/luminance) [0, 1]
	 * - Index 1: I (in-phase) [-0.5957, 0.5957]
	 * - Index 2: Q (quadrature) [-0.5226, 0.5226]
	 *
	 * Direct access to this array should be avoided in favor of using
	 * the public Y, I, and Q properties which include validation.
	 * These ranges match the NTSC standard specifications and ensure
	 * proper encoding of color information for television broadcasting.
	 */
	protected override components: [number, number, number];

	/**
	 * Gets the Y (luma/luminance) component value representing brightness information.
	 *
	 * @returns {number} The Y component value between 0 and 1
	 *
	 * @remarks
	 * The Y component represents the perceived brightness or luminance of the color,
	 * designed specifically for television broadcasting applications:
	 *
	 * **Value Ranges:**
	 * - `0`: Complete black (no luminance)
	 * - `1`: Pure white (maximum luminance)
	 * - `0.5`: Mid-gray (50% luminance)
	 *
	 * **Technical Details:**
	 * - Calculated using NTSC luminance coefficients: `0.3*R + 0.59*G + 0.11*B`
	 * - Weights match human visual perception sensitivity to different colors
	 * - Maintains backward compatibility with black and white television systems
	 * - Carries all brightness information needed for monochrome display
	 *
	 * **Applications:**
	 * - Black and white TV compatibility
	 * - Brightness-based image processing
	 * - Luma keying in video production
	 * - Grayscale conversion with perceptual accuracy
	 *
	 * @example
	 * ```typescript
	 * const color = new YIQ(0.7, 0.2, -0.1);
	 * console.log(`Brightness: ${color.Y}`); // 0.7 (fairly bright)
	 *
	 * // Extract brightness for B&W conversion
	 * const rgbColor = new RGB(0.8, 0.4, 0.2);
	 * const yiqColor = YIQ.From(rgbColor);
	 * const brightness = yiqColor.Y; // NTSC standard brightness
	 * ```
	 */
	public get Y(): number {
		return this.components[0];
	}

	/**
	 * Sets the Y (luma/luminance) component value with strict validation.
	 *
	 * @param value - The Y value to set (must be between 0 and 1)
	 * @throws {ColorError} If value is NaN, infinite, or outside the valid range [0, 1]
	 *
	 * @remarks
	 * Enforces strict validation to maintain television broadcasting standards:
	 * - Must be a finite number (no NaN or Infinity values)
	 * - Must be within the range [0, 1] to ensure valid brightness levels
	 * - Values outside this range will throw a `ColorError` with descriptive message
	 * - Validation follows NTSC technical specifications for luminance encoding
	 *
	 * **Error Conditions:**
	 * - `NaN` values: "Channel(Y) Out of Range"	 * - Infinite values: "Channel(Y) Out of Range"	 * - Values < 0 or > 1: "Channel(Y) Out of Range"
	 *
	 * @example
	 * ```typescript	 * const color = new YIQ();
	 *
	 * // Valid assignments
	 * color.Y = 0;     // Black
	 * color.Y = 0.5;   // Mid-gray
	 * color.Y = 1;     // White
	 *
	 * // Invalid assignments (will throw ColorError)
	 * try {
	 *     color.Y = -0.1;  // Below range
	 *     color.Y = 1.5;   // Above range
	 *     color.Y = NaN;   // Invalid number
	 * } catch (error) {
	 *     console.error('Invalid Y value:', error.message);
	 * }
	 * ```
	 */
	public set Y(value: number) {
		YIQ._AssertComponent('Y', value);
		this.components[0] = value;
	}	/**
	 * Gets the I (in-phase) component value representing orange-blue chrominance information.
	 *
	 * @returns {number} The I component value between -0.599 and 0.599
	 *
	 * @remarks
	 * The I (in-phase) component encodes color information along the orange-blue axis,
	 * specifically designed for NTSC television broadcasting with optimized bandwidth allocation:
	 *
	 * **Value Ranges:**
	 * - `-0.599`: Maximum blue shift (coolest tone)
	 * - `0`: Neutral (no orange-blue bias)
	 * - `+0.599`: Maximum orange shift (warmest tone)
	 *
	 * **Technical Details:**
	 * - Represents color differences along the orange-blue perceptual axis
	 * - Given higher bandwidth allocation in NTSC due to human visual sensitivity
	 * - Calculated using specific NTSC transformation coefficients
	 * - Range limits derived from RGB gamut boundaries in YIQ space
	 * - Critical for accurate skin tone reproduction in television
	 *
	 * **NTSC Engineering Context:**
	 * The I axis was positioned along the orange-blue direction because:
	 * - Human eyes are more sensitive to orange-blue variations than purple-green
	 * - Skin tones primarily vary along this axis, crucial for television content
	 * - Allowed NTSC to allocate more bandwidth to this component (1.3 MHz vs 0.4 MHz for Q)
	 * - Improved perceived color quality with limited transmission bandwidth
	 *
	 * @example
	 * ```typescript
	 * const color = new YIQ(0.5, 0.3, 0);
	 * console.log(`Orange-blue shift: ${color.I}`); // 0.3 (orange bias)
	 *
	 * // Demonstrate color temperature effects
	 * const warm = new YIQ(0.7, 0.4, 0);   // Warm/orange tone
	 * const cool = new YIQ(0.7, -0.4, 0);  // Cool/blue tone
	 * const neutral = new YIQ(0.7, 0, 0);  // Neutral gray
	 *
	 * // NTSC skin tone encoding
	 * const skinRgb = new RGB(0.9, 0.7, 0.6);
	 * const skinYiq = YIQ.From(skinRgb);
	 * console.log(`Skin I component: ${skinYiq.I}`); // Positive for orange bias
	 * ```
	 */

	public get I(): number {
		return this.components[1];
	}

	/**
	 * Sets the I (in-phase) component value with NTSC standard validation.
	 *
	 * @param value - The I value to set (must be between -0.599 and 0.599)
	 * @throws {ColorError} If value is NaN, infinite, or outside the valid range [-0.599, 0.599]
	 *
	 * @remarks
	 * Enforces strict validation according to NTSC technical specifications:
	 * - Must be a finite number (no NaN or Infinity values)
	 * - Must be within the range [-0.599, 0.599] as defined by NTSC standards
	 * - Values outside this range will throw a `ColorError` with descriptive message
	 * - Range limits ensure proper color encoding for television broadcasting
	 *
	 * **Error Conditions:**
	 * - `NaN` values: "Channel(I) Out of Range"
	 * - Infinite values: "Channel(I) Out of Range"
	 * - Values < -0.599 or > 0.599: "Channel(I) Out of Range"
	 *
	 * **Range Significance:**
	 * The ±0.599 range represents the maximum achievable orange-blue chrominance
	 * values when converting from the RGB color gamut to YIQ space, ensuring
	 * all valid RGB colors can be properly represented.
	 *
	 * @example
	 * ```typescript
	 * const color = new YIQ(0.5, 0, 0);
	 *
	 * // Valid assignments
	 * color.I = -0.599;  // Maximum blue
	 * color.I = 0;       // Neutral
	 * color.I = 0.599;   // Maximum orange
	 * color.I = 0.3;     // Moderate orange bias
	 *
	 * // Invalid assignments (will throw ColorError)
	 * try {
	 *     color.I = -0.7;   // Below NTSC range
	 *     color.I = 0.8;    // Above NTSC range
	 *     color.I = NaN;    // Invalid number
	 * } catch (error) {
	 *     console.error('Invalid I value:', error.message);
	 * }
	 *
	 * // Color temperature adjustment
	 * const warmColor = new YIQ(0.6, 0, 0);
	 * warmColor.I = 0.2;  // Add orange warmth
	 * ```
	 */
	public set I(value: number) {
		YIQ._AssertComponent('I', value);
		this.components[1] = value;
	}	/**
	 * Gets the Q (quadrature) component value representing purple-green chrominance information.
	 *
	 * @returns {number} The Q component value between -0.5251 and 0.5251
	 *
	 * @remarks
	 * The Q (quadrature) component encodes color information along the purple-green axis,
	 * specifically designed for NTSC television broadcasting with reduced bandwidth allocation:
	 *
	 * **Value Ranges:**
	 * - `-0.5251`: Maximum green shift (most natural tone)
	 * - `0`: Neutral (no purple-green bias)
	 * - `+0.5251`: Maximum purple shift (most vibrant tone)
	 *
	 * **Technical Details:**
	 * - Represents color differences along the purple-green perceptual axis
	 * - Given lower bandwidth allocation in NTSC (0.4 MHz vs 1.3 MHz for I component)
	 * - Calculated using specific NTSC transformation coefficients
	 * - Range limits derived from RGB gamut boundaries in YIQ space
	 * - Less critical for skin tone reproduction compared to I component
	 *
	 * **NTSC Engineering Context:**
	 * The Q axis was positioned along the purple-green direction because:
	 * - Human eyes are less sensitive to purple-green variations than orange-blue
	 * - Natural scenes typically have less variation along this axis
	 * - Allowed NTSC to reduce bandwidth allocation while maintaining acceptable quality
	 * - Enabled more efficient use of limited television broadcast spectrum
	 * - Contributed to overall system optimization for analog transmission
	 *
	 * @example
	 * ```typescript
	 * const color = new YIQ(0.5, 0, -0.2);
	 * console.log(`Purple-green shift: ${color.Q}`); // -0.2 (green bias)
	 *
	 * // Demonstrate color variation effects
	 * const purple = new YIQ(0.7, 0, 0.4);   // Purple/magenta tone
	 * const green = new YIQ(0.7, 0, -0.4);   // Green tone
	 * const neutral = new YIQ(0.7, 0, 0);    // Neutral gray
	 *
	 * // NTSC foliage encoding
	 * const leafRgb = new RGB(0.2, 0.6, 0.3);
	 * const leafYiq = YIQ.From(leafRgb);
	 * console.log(`Foliage Q component: ${leafYiq.Q}`); // Negative for green bias
	 *
	 * // Bandwidth-limited transmission simulation
	 * const originalColor = new YIQ(0.8, 0.3, 0.4);
	 * const reducedBandwidth = new YIQ(0.8, 0.3, 0.1); // Q reduced for transmission
	 * ```
	 */

	public get Q(): number {
		return this.components[2];
	}

	/**
	 * Sets the Q (quadrature) component value with NTSC standard validation.
	 *
	 * @param value - The Q value to set (must be between -0.5251 and 0.5251)
	 * @throws {ColorError} If value is NaN, infinite, or outside the valid range [-0.5251, 0.5251]
	 *
	 * @remarks
	 * Enforces strict validation according to NTSC technical specifications:
	 * - Must be a finite number (no NaN or Infinity values)
	 * - Must be within the range [-0.5251, 0.5251] as defined by NTSC standards
	 * - Values outside this range will throw a `ColorError` with descriptive message
	 * - Range limits ensure proper color encoding for television broadcasting
	 *
	 * **Error Conditions:**
	 * - `NaN` values: "Channel(Q) Out of Range"
	 * - Infinite values: "Channel(Q) Out of Range"
	 * - Values < -0.5251 or > 0.5251: "Channel(Q) Out of Range"
	 *
	 * **Range Significance:**
	 * The ±0.5251 range represents the maximum achievable purple-green chrominance
	 * values when converting from the RGB color gamut to YIQ space. This narrower
	 * range compared to the I component reflects the reduced bandwidth allocation
	 * in NTSC transmission for this less perceptually important axis.
	 *
	 * @example
	 * ```typescript
	 * const color = new YIQ(0.5, 0, 0);
	 *
	 * // Valid assignments
	 * color.Q = -0.5251;  // Maximum green
	 * color.Q = 0;        // Neutral
	 * color.Q = 0.5251;   // Maximum purple
	 * color.Q = -0.2;     // Moderate green bias
	 *
	 * // Invalid assignments (will throw ColorError)
	 * try {
	 *     color.Q = -0.6;    // Below NTSC range
	 *     color.Q = 0.7;     // Above NTSC range
	 *     color.Q = NaN;     // Invalid number
	 * } catch (error) {
	 *     console.error('Invalid Q value:', error.message);
	 * }
	 *
	 * // Natural scene color adjustment
	 * const skyColor = new YIQ(0.8, -0.1, 0);
	 * skyColor.Q = -0.1;  // Slight green bias for natural sky
	 * ```
	 */
	public set Q(value: number) {
		YIQ._AssertComponent('Q', value);
		this.components[2] = value;
	}	/**
	 * Creates a new YIQ color instance with specified component values.
	 *
	 * @param y - Y (luma/luminance) component [0, 1], default: 0 (black)
	 * @param i - I (in-phase) component [-0.599, 0.599], default: 0 (neutral orange-blue)
	 * @param q - Q (quadrature) component [-0.5251, 0.5251], default: 0 (neutral purple-green)
	 * @throws {ColorError} If any component value is invalid or out of NTSC range
	 *
	 * @remarks
	 * **Constructor Process:**
	 * 1. Accepts component values with sensible defaults (creates black if no parameters)
	 * 2. Initializes internal component array structure
	 * 3. Validates all components against NTSC specifications using `YIQ.Validate()`
	 * 4. Throws descriptive errors for any invalid values
	 *
	 * **Component Validation:**
	 * - **Y component**: Must be in range [0, 1] representing valid brightness levels
	 * - **I component**: Must be in range [-0.599, 0.599] per NTSC orange-blue encoding
	 * - **Q component**: Must be in range [-0.5251, 0.5251] per NTSC purple-green encoding
	 * - All components must be finite numbers (no NaN or Infinity values)
	 *
	 * **Default Behavior:**
	 * When called without parameters, creates a black color (Y=0, I=0, Q=0) which
	 * represents the absence of both luminance and chrominance information.
	 *
	 * @example
	 * ```typescript
	 * // Basic construction patterns
	 * const black = new YIQ();                    // Y=0, I=0, Q=0
	 * const gray = new YIQ(0.5);                  // Y=0.5, I=0, Q=0
	 * const white = new YIQ(1);                   // Y=1, I=0, Q=0
	 * const colored = new YIQ(0.7, 0.3, -0.2);   // Full specification
	 *
	 * // NTSC television color construction
	 * const ntscRed = new YIQ(0.299, 0.596, 0.211);     // NTSC red primary
	 * const ntscGreen = new YIQ(0.587, -0.275, -0.523); // NTSC green primary
	 * const ntscBlue = new YIQ(0.114, -0.321, 0.312);   // NTSC blue primary
	 *
	 * // Skin tone construction for television
	 * const lightSkin = new YIQ(0.8, 0.2, 0.1);   // Light skin tone
	 * const mediumSkin = new YIQ(0.6, 0.15, 0.05); // Medium skin tone
	 * const darkSkin = new YIQ(0.3, 0.1, 0.02);   // Dark skin tone
	 *
	 * // Error handling
	 * try {
	 *     const invalid = new YIQ(1.5, 0, 0);  // Y > 1, will throw
	 * } catch (error) {
	 *     console.error('Invalid YIQ construction:', error.message);
	 * }
	 *
	 * // Broadcasting workflow
	 * const testPattern = [
	 *     new YIQ(1, 0, 0),      // White bar
	 *     new YIQ(0.75, 0, 0),   // Light gray bar
	 *     new YIQ(0.5, 0, 0),    // Medium gray bar
	 *     new YIQ(0.25, 0, 0),   // Dark gray bar
	 *     new YIQ(0, 0, 0)       // Black bar
	 * ];
	 * ```
	 */

	constructor(y: number = 0, i: number = 0, q: number = 0) {
		super();
		this.components = [0, 0, 0]; // Initialize to defaults
		this.Y = y; // Use setters for validation
		this.I = i;
		this.Q = q;
	}

	/**
	 * Returns a string representation of the YIQ color in standard format.
	 *
	 * @returns {string} A string in the format "YIQ(Y, I, Q)" with full precision values
	 *
	 * @remarks
	 * **Output Format:**
	 * - Uses the standard notation: `YIQ(Y, I, Q)`
	 * - Components are separated by commas and spaces for readability
	 * - All values maintain their full precision (no rounding or truncation)
	 * - Negative values include the minus sign for I and Q components
	 *
	 * **Applications:**
	 * - Debug output and logging for NTSC color processing
	 * - Color value inspection during television signal analysis
	 * - Documentation and reports for broadcast color workflows
	 * - Educational display of NTSC color encoding values
	 * - Integration with color management systems and pipelines
	 *
	 * @example
	 * ```typescript
	 * // Basic string representation
	 * const gray = new YIQ(0.5, 0, 0);
	 * console.log(gray.ToString()); // "YIQ(0.5, 0, 0)"
	 *
	 * // Colored values with full precision
	 * const orange = new YIQ(0.7, 0.456, -0.123);
	 * console.log(orange.ToString()); // "YIQ(0.7, 0.456, -0.123)"
	 *
	 * // NTSC primary colors display
	 * const red = new YIQ(0.299, 0.596, 0.211);	 * const green = new YIQ(0.587, -0.275, -0.523);
	 * const blue = new YIQ(0.114, -0.321, 0.312);
	 *
	 * console.log('NTSC Primaries:');
	 * console.log(`Red: ${red.ToString()}`);
	 * console.log(`Green: ${green.ToString()}`);
	 * console.log(`Blue: ${blue.ToString()}`);
	 *
	 * // Broadcasting workflow logging
	 * const testColors = [new YIQ(1, 0, 0), new YIQ(0.5, 0.3, -0.2)];
	 * testColors.forEach((color, index) => {
	 *     console.log(`Test Color ${index + 1}: ${color.ToString()}`);
	 * });
	 * ```
	 */
	public override ToString(): string {
		return `YIQ(${this.components.join(', ')})`;
	}	/**
	 * Type guard assertion function that validates an unknown value as a YIQ color instance.
	 * Throws a ColorError if the value is not a valid YIQ color with proper NTSC component ranges.
	 *
	 * @param color - The unknown value to validate and assert as a YIQ instance
	 * @throws {ColorError} When the value is not a YIQ instance or has invalid component values
	 *
	 * @remarks
	 * **Validation Process:**
	 * This method performs comprehensive validation in the following order:
	 * 1. **Type Check**: Verifies the value is an instance of the YIQ class
	 * 2. **Y Component**: Validates luminance is in range [0, 1] and finite
	 * 3. **I Component**: Validates in-phase chrominance is in range [-0.599, 0.599] and finite
	 * 4. **Q Component**: Validates quadrature chrominance is in range [-0.5251, 0.5251] and finite
	 *
	 * **Error Messages:**
	 * - `"Not a YIQ Color"`: Wrong object type
	 * - `"Invalid Channel(Y)"`: Y component validation failed	 * - `"Invalid Channel(I)"`: I component validation failed
	 * - `"Invalid Channel(Q)"`: Q component validation failed
	 *
	 * **Type Narrowing:**
	 * After successful assertion, TypeScript will treat the parameter as a guaranteed
	 * YIQ instance, enabling safe access to all YIQ properties and methods.
	 *
	 * **Use Cases:**
	 * - Runtime type verification in NTSC color processing pipelines
	 * - Input validation for television broadcast color functions
	 * - Type narrowing in generic color space conversion systems
	 * - Error handling in color management workflows
	 * - Debugging and testing color space implementations
	 *
	 * @example
	 * ```typescript
	 * // Basic type assertion with unknown input
	 * function processNTSCColor(input: unknown) {
	 *     YIQ.Assert(input); // Throws if not valid YIQ
	 *     // input is now typed as YIQ
	 *     console.log(`Processing: Y=${input.Y}, I=${input.I}, Q=${input.Q}`);
	 *     return input.ToString();
	 * }
	 *
	 * // Safe color processing with validation
	 * const userInput: unknown = getUserColorInput();
	 * try {
	 *     YIQ.Assert(userInput);
	 *     const result = performNTSCAnalysis(userInput);
	 *     console.log('Analysis complete:', result);
	 * } catch (error) {
	 *     console.error('Invalid NTSC color:', error.message);
	 * }
	 *
	 * // Array validation for batch processing
	 * function validateNTSCColorArray(colors: unknown[]): YIQ[] {
	 *     return colors.map((color, index) => {
	 *         try {
	 *             YIQ.Assert(color);
	 *             return color;
	 *         } catch (error) {
	 *             throw new Error(`Invalid color at index ${index}: ${error.message}`);
	 *         }
	 *     });
	 * }
	 *
	 * // Color space conversion validation
	 * function convertToNTSC(input: unknown): YIQ {
	 *     if (input instanceof RGB) {
	 *         return YIQ.From(input);
	 *     }
	 *     YIQ.Assert(input); // Ensure it's already valid YIQ
	 *     return input;
	 * }
	 * ```
	 */

	public static override Assert(color: unknown): asserts color is YIQ {
		AssertInstanceOf(color, YIQ, { class: ColorError, message: 'Not a YIQ Color' });
		YIQ._AssertComponent('Y', color.Y);
		YIQ._AssertComponent('I', color.I);
		YIQ._AssertComponent('Q', color.Q);
	}

	/**
	 * Validates a single YIQ component value by name.
	 * @param component - The component name ('Y', 'I', or 'Q')
	 * @param color - The value to validate
	 * @throws {ColorError} If the value is out of range or not a number
	 */
	private static _AssertComponent(component: TYIQComponentSelection, color: YIQ): void;
	private static _AssertComponent(component: TYIQComponentSelection, value: number): void;
	private static _AssertComponent(component: TYIQComponentSelection, colorOrValue:YIQ | number): void {
		switch (component) {
			case 'Y': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.Y;
				AssertNumber(value, { gte: 0, lte: 1 }, { class: ColorError, message: 'Channel(Y) must be in range [0, 1].' });
				break;
			}
			case 'I': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.I;
				AssertNumber(value, { gte: -0.599, lte: 0.599 }, { class: ColorError, message: 'Channel(I) must be in range [-0.599, 0.599].' });
				break;
			}
			case 'Q': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.Q;
				AssertNumber(value, { gte: -0.5251, lte: 0.5251 }, { class: ColorError, message: 'Channel(Q) must be in range [-0.5251, 0.5251].' });
				break;
			}
			default:
				throw new ColorError(`Unknown YIQ component: ${component}`);
		}
	}

	/**
	 * Validates whether an unknown value represents a valid YIQ color with proper NTSC component ranges.
	 * Returns a boolean result without throwing exceptions, making it suitable for conditional processing.
	 *
	 * @param color - The unknown value to validate as a YIQ color
	 * @returns {boolean} `true` if the value is a valid YIQ color, `false` otherwise
	 *
	 * @remarks
	 * **Validation Criteria:**
	 * This method uses the same comprehensive validation as `YIQ.Assert()` but returns
	 * a boolean instead of throwing exceptions:
	 * 1. **Type Verification**: Must be an instance of the YIQ class
	 * 2. **Y Component**: Must be finite number in range [0, 1]
	 * 3. **I Component**: Must be finite number in range [-0.599, 0.599]
	 * 4. **Q Component**: Must be finite number in range [-0.5251, 0.5251]
	 *
	 * **Implementation Details:**
	 * - Internally calls `YIQ.Assert()` within a try-catch block
	 * - Returns `true` only if all validation passes without exceptions
	 * - Returns `false` for any validation failure (wrong type, invalid ranges, NaN, etc.)
	 * - No side effects or error logging - purely functional validation
	 *
	 * **Use Cases:**
	 * - Conditional color processing workflows
	 * - Array filtering for valid NTSC colors
	 * - Input validation in user interfaces
	 * - Quality control in color data pipelines
	 * - Non-throwing validation for performance-critical code
	 *
	 * @example
	 * ```typescript
	 * // Conditional processing based on validation
	 * function processIfValidNTSC(input: unknown) {
	 *     if (YIQ.Validate(input)) {
	 *         console.log(`Valid NTSC color: ${input.ToString()}`);
	 *         return performNTSCProcessing(input);
	 *     } else {
	 *         console.log('Invalid NTSC color, skipping...');
	 *         return null;
	 *     }
	 * }
	 *
	 * // Array filtering for valid colors
	 * const mixedInputs: unknown[] = [
	 *     new YIQ(0.5, 0.2, -0.1),  // Valid
	 *     { Y: 0.5, I: 0.2, Q: -0.1 }, // Invalid (not YIQ instance)
	 *     new YIQ(2, 0, 0),          // Invalid (Y > 1)
	 *     new YIQ(0.8, 0.3, 0.1)     // Valid
	 * ];
	 *
	 * const validNTSCColors = mixedInputs.filter(YIQ.Validate) as YIQ[];
	 * console.log(`Found ${validNTSCColors.length} valid NTSC colors`);
	 *
	 * // User input validation for TV color adjustment
	 * function validateUserNTSCInput(userColor: unknown): boolean {
	 *     const isValid = YIQ.Validate(userColor);
	 *     if (!isValid) {
	 *         showError('Please enter valid NTSC color values');
	 *     }
	 *     return isValid;
	 * }
	 *
	 * // Batch validation for color import
	 * function importNTSCColors(colors: unknown[]): { valid: YIQ[], invalid: number } {
	 *     const validColors: YIQ[] = [];
	 *     let invalidCount = 0;
	 *
	 *     colors.forEach((color, index) => {
	 *         if (YIQ.Validate(color)) {
	 *             validColors.push(color);
	 *         } else {
	 *             invalidCount++;
	 *             console.warn(`Invalid color at index ${index}`);
	 *         }
	 *     });
	 *
	 *     return { valid: validColors, invalid: invalidCount };
	 * }
	 *
	 * // Performance-critical validation loop
	 * function fastProcessNTSCArray(colors: unknown[]): YIQ[] {
	 *     const results: YIQ[] = [];
	 *     for (const color of colors) {
	 *         if (YIQ.Validate(color)) {
	 *             results.push(color); // No type assertion needed after validation
	 *         }
	 *     }
	 *     return results;
	 * }
	 * ```
	 */
	public static override Validate(color: unknown): boolean {
		try {
			YIQ.Assert(color);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Converts a color from another supported color space to YIQ using NTSC standard transformations.
	 *
	 * @param color - The source color to convert (must be RGB or YUV instance)
	 * @returns {YIQ} A new YIQ color instance with NTSC-compliant component values
	 * @throws {ColorError} If the source color space is not supported or input is invalid
	 *
	 * @remarks
	 * **Supported Conversions:**
	 * - **RGB → YIQ**: Uses NTSC standard transformation matrix with luminance coefficients
	 * - **YUV → YUV**: Uses 33-degree phase rotation to align chrominance axes
	 *
	 * **Conversion Process:**
	 * 1. **Input Validation**: Verifies the source color is valid and of supported type
	 * 2. **Type Detection**: Automatically determines conversion method based on input type
	 * 3. **Transformation**: Applies appropriate mathematical conversion algorithm
	 * 4. **Output Validation**: Ensures resulting YIQ values are within NTSC ranges
	 *
	 * **Mathematical Foundations:**
	 * - **RGB Conversion**: Applies NTSC-standardized linear transformation matrix
	 * - **YUV Conversion**: Performs precise trigonometric rotation maintaining luminance
	 * - **Precision**: All calculations use double-precision floating point for accuracy
	 * - **Standards Compliance**: Results conform to original NTSC technical specifications
	 *
	 * **Error Conditions:**
	 * - `"Cannot convert to YIQ"`: Unsupported source color space type
	 * - Validation errors from source color (forwarded from input validation)
	 * - Mathematical errors during transformation (rare, indicates invalid input)
	 *
	 * **Performance Considerations:**
	 * - RGB conversion: Single matrix multiplication (very fast)
	 * - YUV conversion: Trigonometric calculations (slightly slower but still efficient)
	 * - Results are immediately validated and ready for use
	 *
	 * @example
	 * ```typescript
	 * // RGB to YIQ conversion for NTSC television
	 * const rgbRed = new RGB(1, 0, 0);
	 * const ntscRed = YIQ.From(rgbRed);
	 * console.log(`NTSC Red: ${ntscRed.ToString()}`);
	 * // Result: "YIQ(0.299, 0.599, 0.213)"
	 *
	 * // YUV to YIQ conversion (phase rotation)
	 * const yuvColor = new YUV(0.5, 0.2, -0.1);
	 * const yiqColor = YIQ.From(yuvColor);
	 * console.log(`Phase rotated: ${yiqColor.ToString()}`);
	 *
	 * // Batch conversion for television color processing
	 * const rgbPrimaries = [
	 *     new RGB(1, 0, 0),  // Red
	 *     new RGB(0, 1, 0),  // Green
	 *     new RGB(0, 0, 1)   // Blue
	 * ];
	 * const ntscPrimaries = rgbPrimaries.map(rgb => YIQ.From(rgb));
	 * console.log('NTSC Color Bar:');
	 * ntscPrimaries.forEach((color, i) => {
	 *     console.log(`Primary ${i + 1}: ${color.ToString()}`);
	 * });
	 *
	 * // Color space pipeline with error handling
	 * function convertToNTSC(input: RGB | YUV): YIQ | null {
	 *     try {
	 *         const result = YIQ.From(input);
	 *         console.log(`Converted to NTSC: ${result.ToString()}`);
	 *         return result;
	 *     } catch (error) {
	 *         console.error('NTSC conversion failed:', error.message);
	 *         return null;
	 *     }
	 * }
	 *
	 * // Television broadcast workflow
	 * const broadcastColors = [
	 *     new RGB(0.8, 0.7, 0.6),  // Skin tone
	 *     new RGB(0.2, 0.8, 0.3),  // Grass green
	 *     new RGB(0.3, 0.5, 0.9)   // Sky blue
	 * ];
	 * const ntscBroadcast = broadcastColors.map(rgb => ({
	 *     original: rgb.ToString(),
	 *     ntsc: YIQ.From(rgb).ToString()
	 * }));
	 * ```
	 */
	public static From(color: RGB | YUV): YIQ {
		if (color instanceof RGB) return YIQ.FromRGB(color);
		if (color instanceof YUV) return YIQ.FromYUV(color);
		throw new ColorError('Cannot convert to YIQ');
	}	/**	 * Converts an RGB color to YIQ using the NTSC standard transformation matrix.
	 *
	 * @internal
	 * @param color - The RGB color to convert (must be a valid RGB instance)
	 * @returns {YIQ} A new YIQ color instance with NTSC-compliant values
	 * @throws {ColorError} If the input RGB color is invalid
	 *
	 * @remarks
	 * **NTSC Transformation Algorithm:**
	 *
	 * This method implements the original NTSC standard for converting RGB to YIQ using
	 * the standardized transformation matrix designed for television broadcasting:
	 *
	 * ```
	 * [Y]   [0.3     0.59    0.11   ] [R]
	 * [I] = [0.599  -0.2773 -0.3217 ] [G]
	 * [Q]   [0.213  -0.5251  0.3121 ] [B]
	 * ```
	 *
	 * **Matrix Coefficient Origins:**
	 * - **Y Row [0.3, 0.59, 0.11]**: NTSC luminance coefficients based on human visual sensitivity
	 *   - Green weighted highest (59%) due to peak eye sensitivity at ~555nm
	 *   - Red weighted moderately (30%) for balanced skin tone reproduction
	 *   - Blue weighted lowest (11%) reflecting lower visual sensitivity
	 * - **I Row [0.599, -0.2773, -0.3217]**: Orange-blue chrominance encoding
	 *   - Positive for red, negative for green/blue to create orange-blue axis
	 *   - Coefficients chosen to maximize skin tone accuracy in television
	 * - **Q Row [0.213, -0.5251, 0.3121]**: Purple-green chrominance encoding
	 *   - Orthogonal to I axis, optimized for complementary color information
	 *   - Lower magnitude coefficients reflect reduced bandwidth allocation
	 *
	 * **Conversion Process:**
	 * 1. **Validation**: Ensures input RGB color meets validity requirements
	 * 2. **Array Extraction**: Converts RGB to numerical array [R, G, B]
	 * 3. **Matrix Multiplication**: Applies NTSC transformation matrix
	 * 4. **YIQ Construction**: Creates new YIQ instance from transformed values
	 * 5. **Implicit Validation**: Constructor validates output ranges automatically
	 *
	 * **Mathematical Properties:**
	 * - **Linearity**: Transformation preserves linear color relationships
	 * - **Reversibility**: Mathematically invertible for round-trip conversions
	 * - **Gamut Preservation**: All valid RGB colors map to valid YIQ ranges
	 * - **Perceptual Optimization**: Luminance channel matches human brightness perception
	 *
	 * @example
	 * ```typescript
	 * // NTSC primary color conversions
	 * const rgbRed = new RGB(1, 0, 0);
	 * const ntscRed = YIQ.FromRGB(rgbRed);
	 * console.log(ntscRed.ToString()); // "YIQ(0.3, 0.599, 0.213)"
	 *
	 * const rgbGreen = new RGB(0, 1, 0);
	 * const ntscGreen = YIQ.FromRGB(rgbGreen);
	 * console.log(ntscGreen.ToString()); // "YIQ(0.59, -0.2773, -0.5251)"
	 *
	 * const rgbBlue = new RGB(0, 0, 1);
	 * const ntscBlue = YIQ.FromRGB(rgbBlue);
	 * console.log(ntscBlue.ToString()); // "YIQ(0.11, -0.3217, 0.3121)"
	 *
	 * // Skin tone conversion for television
	 * const skinTone = new RGB(0.9, 0.7, 0.6);
	 * const ntscSkin = YIQ.FromRGB(skinTone);
	 * console.log(`Skin in NTSC: Y=${ntscSkin.Y.toFixed(3)}, I=${ntscSkin.I.toFixed(3)}`);
	 * // Demonstrates positive I value for warm skin tones
	 *
	 * // Grayscale verification (I and Q should be ~0)
	 * const gray = new RGB(0.5, 0.5, 0.5);
	 * const ntscGray = YIQ.FromRGB(gray);
	 * console.log(`Gray: ${ntscGray.ToString()}`);
	 * // Should show I≈0, Q≈0, with Y=0.5
	 * ```
	 */

	public static FromRGB(color: RGB): YIQ {
		RGB.Validate(color);

		const rgb = color.ToArray();

		const transformation = [
			[0.3, 0.59, 0.11],
			[0.599, -0.2773, -0.3217],
			[0.213, -0.5251, 0.3121],
		];

		const yiq = MatrixMultiply(transformation, rgb);

		return new YIQ(yiq[0], yiq[1], yiq[2]);
	}	/**
	 * Converts a YUV color to YIQ using a precise 33-degree phase rotation transformation.
	 *
	 * @internal
	 * @param color - The YUV color to convert (must be a valid YUV instance)
	 * @returns {YIQ} A new YIQ color instance with properly rotated chrominance axes
	 * @throws {ColorError} If the input YUV color is invalid
	 *
	 * @remarks
	 * **Phase Rotation Algorithm:**
	 *
	 * This method converts YUV to YIQ by applying a 33-degree counterclockwise rotation
	 * to the UV chrominance plane, transforming it into the IQ plane as specified by
	 * the NTSC standard. The Y (luminance) component remains unchanged.
	 *
	 * **Transformation Matrix:**
	 * ```
	 * [Y]   [1    0              0             ] [Y]
	 * [I] = [0   -sin(33°)      cos(33°)       ] [U]
	 * [Q]   [0    cos(33°)      sin(33°)       ] [V]
	 * ```
	 *
	 * **Mathematical Details:**
	 * - **33° Rotation Angle**: Precisely chosen by NTSC engineers for optimal bandwidth allocation
	 * - **sin(33°) ≈ 0.5446**: Sine component for the rotation transformation
	 * - **cos(33°) ≈ 0.8387**: Cosine component for the rotation transformation
	 * - **Y Preservation**: Luminance channel passes through unchanged (identical in both spaces)
	 * - **Orthogonality**: I and Q axes remain perpendicular after rotation
	 *
	 * **Engineering Rationale:**
	 * The 33-degree rotation was specifically designed to:
	 * - **Align I-axis with orange-blue perception**: Places maximum human color sensitivity
	 *   along the I axis, allowing higher bandwidth allocation (1.3 MHz in NTSC)
	 * - **Align Q-axis with purple-green perception**: Places lower sensitivity colors
	 *   along the Q axis, enabling bandwidth reduction (0.4 MHz in NTSC)
	 * - **Optimize television transmission**: Balances perceptual quality with technical constraints
	 * - **Maintain mathematical precision**: Preserves color accuracy during conversion
	 *
	 * **Conversion Process:**
	 * 1. **Input Validation**: Ensures the YUV color meets validity requirements
	 * 2. **Array Extraction**: Converts YUV to numerical array [Y, U, V]
	 * 3. **Matrix Application**: Applies the 33-degree rotation transformation
	 * 4. **Precision Calculation**: Uses exact trigonometric functions for accuracy
	 * 5. **YIQ Construction**: Creates new YIQ instance from rotated values
	 * 6. **Range Verification**: Constructor automatically validates NTSC compliance
	 *
	 * **Color Science Context:**
	 * - **Perceptual Uniformity**: Both YUV and YIQ are perceptually-based color spaces
	 * - **Broadcast Origins**: Both were designed for television transmission systems
	 * - **Geometric Relationship**: YIQ is essentially YUV rotated in the chrominance plane
	 * - **Reversible Transformation**: Can be precisely reversed with +33° rotation
	 *
	 * @example
	 * ```typescript
	 * // Basic YUV to YIQ conversion
	 * const yuvColor = new YUV(0.5, 0.2, -0.1);
	 * const yiqColor = YIQ.FromYUV(yuvColor);
	 * console.log(`Original YUV: ${yuvColor.ToString()}`);
	 * console.log(`Rotated YIQ: ${yiqColor.ToString()}`);
	 * // Y component will be identical, I/Q will be rotated U/V
	 *
	 * // Demonstrate luminance preservation
	 * const testYUV = new YUV(0.7, 0.3, 0.1);
	 * const resultYIQ = YIQ.FromYUV(testYUV);
	 * console.log(`Luminance preserved: ${testYUV.Y === resultYIQ.Y}`); // true
	 *
	 * // Phase relationship verification
	 * const neutralYUV = new YUV(0.5, 0, 0);  // No chrominance
	 * const neutralYIQ = YIQ.FromYUV(neutralYUV);
	 * console.log(`Neutral conversion: ${neutralYIQ.ToString()}`);
	 * // Should show I≈0, Q≈0, with Y=0.5
	 *
	 * // NTSC color space pipeline
	 * const broadcastYUV = [
	 *     new YUV(0.8, 0.2, -0.1),   // Skin tone
	 *     new YUV(0.3, -0.1, 0.2),   // Foliage
	 *     new YUV(0.6, -0.2, -0.3)   // Sky
	 * ];
	 * const ntscRotated = broadcastYUV.map(yuv => ({
	 *     original: yuv.ToString(),
	 *     rotated: YIQ.FromYUV(yuv).ToString(),
	 *     luminance: yuv.Y
	 * }));
	 * console.log('NTSC Phase Rotation Results:', ntscRotated);
	 * ```
	 */

	public static FromYUV(color: YUV): YIQ {
		YUV.Validate(color);

		const yuv = color.ToArray();

		const transformation: IMatrix3 = [
			[1, 0, 0],
			[0, -1 * Math.sin(DegreesToRadians(33)), Math.cos(DegreesToRadians(33))],
			[0, Math.cos(DegreesToRadians(33)), Math.sin(DegreesToRadians(33))],
		];

		const yiq = MatrixMultiply(transformation, yuv);

		return new YIQ(yiq[0], yiq[1], yiq[2]);
	}
}
