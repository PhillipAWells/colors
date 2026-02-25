import { AssertInstanceOf, AssertNumber } from './assert.js';
import { TVector3 } from '@pawells/math-extended';
import { ColorSpace } from './_color-space.js';
import { XYZ } from './xyz.js';
import { ColorSpaceManager } from './manager.js';
import { ColorError } from '../error.js';

type TXyYComponentSelection = 'x' | 'y' | 'Y';

/**
 * Represents a color in the CIE XyY color space.
 *
 * The XyY color space is a fundamental transformation of the CIE XYZ color space that
 * separates chromaticity information (x,y coordinates) from luminance (Y component).
 * This separation enables independent manipulation of color appearance and brightness,
 * making it essential for color science applications and chromaticity analysis.
 *
 * ## Components
 * - **x**: Red/Green chromaticity coordinate (0-1, normalized X component)
 * - **y**: Green chromaticity coordinate (0-1, normalized Y component)
 * - **Y**: Absolute luminance (0+, identical to XYZ Y component)
 *
 * ## Key Characteristics
 * - Chromaticity coordinates (x,y) are device-independent and perceptually significant
 * - Enables visualization on 2D chromaticity diagrams (CIE 1931, CIE 1976)
 * - Standard representation for illuminants, primaries, and color gamut boundaries
 * - Y component preserves absolute luminance information from XYZ space
 * - Mathematical relationship: x + y + z = 1 (where z is the implicit blue coordinate)
 *
 * ## Applications
 * - **Chromaticity Analysis**: Plotting colors on horseshoe-shaped chromaticity diagrams
 * - **Illuminant Definition**: Specifying standard light sources (D65, A, F series)
 * - **Gamut Mapping**: Defining display and printer color capabilities
 * - **Color Matching**: Metamerism studies and color matching functions
 * - **Standards Development**: CIE standard observer and illuminant specifications
 *
 * @example Basic Usage
 * ```typescript * // Create XyY color for D65 white point
 * const d65White = new XyY(0.3127, 0.3290, 100.0);
 * console.log(d65White.ToString()); // "XyY(0.3127, 0.329, 100)"
 *
 * // Access chromaticity coordinates
 * console.log(`Chromaticity: (${d65White.X}, ${d65White.Y1})`);
 * console.log(`Luminance: ${d65White.Y2}`);
 * ```
 *
 * @example Chromaticity Analysis
 * ```typescript
 * // Convert from XYZ to analyze chromaticity
 * const xyz = new XYZ(95.047, 100.0, 108.883); // D65 white
 * const xyy = XyY.FromXYZ(xyz);
 *
 * // Check if color falls within sRGB gamut
 * const isWithinSRGB = xyy.X >= 0 && xyy.X <= 1 &&
 *                      xyy.Y1 >= 0 && xyy.Y1 <= 1;
 * ```
 *
 * @example Standard Illuminants
 * ```typescript
 * // Define standard illuminants using XyY
 * const illuminantA = new XyY(0.4476, 0.4074, 100); // Tungsten
 * const illuminantD65 = new XyY(0.3127, 0.3290, 100); // Daylight
 * const illuminantF2 = new XyY(0.3721, 0.3751, 100); // Fluorescent
 *
 * // Use for color temperature analysis
 * const colorTemp = calculateCCT(illuminantA.X, illuminantA.Y1);
 * ```
 *
 * @remarks
 * The XyY color space is fundamental to colorimetry and forms the basis for
 * chromaticity diagrams used throughout color science. While x and y coordinates
 * are normalized (sum to ≤1), the Y component retains absolute luminance values,
 * making this space ideal for applications requiring both chromaticity precision
 * and photometric accuracy.
 */
@ColorSpaceManager.Register({
	name: 'XyY',
	description: 'Represents a color in the CIE XyY color space.',
	converters: [
		'XYZ',
	],
})
export class XyY extends ColorSpace {
	/** Internal array storing the XyY component values [x, y, Y] */
	protected override components: [number, number, number];	/**
	 * Gets the x chromaticity coordinate.
	 *
	 * The x coordinate represents the red/green chromaticity component in the
	 * CIE chromaticity diagram. This normalized coordinate indicates the
	 * relative contribution of the X tristimulus value to the total.
	 *
	 * ## Value Range
	 * - **Range**: 0.0 to 1.0 (normalized)
	 * - **Typical**: 0.0 to ~0.8 for most visible colors
	 * - **Pure Red**: ~0.735 (700nm monochromatic)
	 * - **D65 White**: 0.3127
	 *
	 * ## Color Theory
	 * Higher x values indicate colors with greater red content relative to
	 * green and blue. Combined with y coordinate, defines the chromaticity
	 * independent of luminance.
	 *
	 * @returns The x chromaticity coordinate (0.0-1.0)
	 *
	 * @example Basic Usage
	 * ```typescript
	 * const color = new XyY(0.3127, 0.3290, 100);
	 * console.log(color.X); // 0.3127 (D65 white point)
	 * ```
	 *
	 * @example Chromaticity Analysis
	 * ```typescript
	 * const red = new XyY(0.735, 0.265, 50);
	 * if (red.X > 0.5) {
	 *   console.log('Red-dominant chromaticity');
	 * }
	 * ```
	 */

	public get X(): number {
		return this.components[0];
	}

	/**
	 * Sets the x chromaticity coordinate.
	 *
	 * Updates the red/green chromaticity component with validation to ensure
	 * the value falls within the valid range for CIE chromaticity coordinates.
	 *
	 * @param value - The x chromaticity coordinate to set (0.0-1.0, must be finite and non-negative)
	 * @throws {ColorError} When value is negative, infinite, or NaN
	 *
	 * @example Basic Assignment
	 * ```typescript
	 * const color = new XyY();
	 * color.X = 0.3127; // D65 white point x coordinate
	 * ```
	 *
	 * @example Validation Handling
	 * ```typescript
	 * try {
	 *   color.X = -0.1; // Invalid: negative value
	 * } catch (error) {
	 *   console.error('Invalid x coordinate:', error.message);
	 * }
	 * ```
	 */
	public set X(value: number) {
		XyY.AssertComponent('x', value);
		this.components[0] = value;
	}

	/**
	 * Gets the y chromaticity coordinate.
	 *
	 * The y coordinate represents the green chromaticity component in the
	 * CIE chromaticity diagram. This normalized coordinate indicates the
	 * relative contribution of the Y tristimulus value to the total and
	 * correlates with luminance efficiency.
	 *
	 * ## Value Range
	 * - **Range**: 0.0 to 1.0 (normalized)
	 * - **Typical**: 0.0 to ~0.8 for most visible colors
	 * - **Pure Green**: ~0.835 (546nm monochromatic)
	 * - **D65 White**: 0.3290
	 * - **Peak Luminance**: ~0.83 (maximum photopic sensitivity)
	 *
	 * ## Color Theory
	 * Higher y values indicate colors with greater green content and
	 * luminance efficiency. The y coordinate is directly related to the
	 * photopic luminosity function of human vision.
	 *
	 * @returns The y chromaticity coordinate (0.0-1.0)
	 *
	 * @example Basic Usage
	 * ```typescript
	 * const color = new XyY(0.3127, 0.3290, 100);
	 * console.log(color.Y1); // 0.3290 (D65 white point)
	 * ```
	 *
	 * @example Luminance Efficiency
	 * ```typescript
	 * const green = new XyY(0.3, 0.6, 80);
	 * if (green.Y1 > 0.5) {
	 *   console.log('High luminance efficiency color');
	 * }
	 * ```
	 */
	public get Y1(): number {
		return this.components[1];
	}

	/**
	 * Sets the y chromaticity coordinate.
	 *
	 * Updates the green chromaticity component with validation to ensure
	 * the value falls within the valid range for CIE chromaticity coordinates.
	 *
	 * @param value - The y chromaticity coordinate to set (0.0-1.0, must be finite and non-negative)
	 * @throws {ColorError} When value is negative, infinite, or NaN
	 *
	 * @example Basic Assignment
	 * ```typescript
	 * const color = new XyY();
	 * color.Y1 = 0.3290; // D65 white point y coordinate
	 * ```
	 *
	 * @example Luminance-Efficient Colors
	 * ```typescript
	 * const efficient = new XyY();
	 * efficient.Y1 = 0.8; // High luminance efficiency
	 * console.log('Luminance efficiency:', efficient.Y1);
	 * ```
	 */
	public set Y1(value: number) {
		XyY.AssertComponent('y', value);
		this.components[1] = value;
	}

	/**
	 * Gets the Y luminance component.
	 *
	 * The Y component represents absolute luminance in cd/m² (candelas per
	 * square meter) and is identical to the Y component in XYZ color space.
	 * This photometric quantity directly correlates with perceived brightness.
	 *
	 * ## Value Range
	 * - **Range**: 0.0+ (theoretically unbounded)
	 * - **Typical Display**: 0.1 to 100 cd/m²
	 * - **HDR Content**: 0.01 to 10,000 cd/m²
	 * - **Paper White**: ~80-100 cd/m²
	 * - **Peak White**: 100+ cd/m²
	 *
	 * ## Photometric Meaning
	 * - **0**: Complete darkness (no light emission)
	 * - **18**: Typical 18% gray card reflectance
	 * - **100**: Reference diffuse white reflector
	 * - **>100**: Self-luminous sources (displays, LEDs)
	 *
	 * @returns The Y luminance component (cd/m², 0.0+)
	 *
	 * @example Basic Usage
	 * ```typescript
	 * const color = new XyY(0.3127, 0.3290, 100);
	 * console.log(color.Y2); // 100 (reference white luminance)
	 * ```
	 *
	 * @example Luminance Categories
	 * ```typescript
	 * const dark = new XyY(0.3, 0.3, 5);   // Dark color
	 * const mid = new XyY(0.3, 0.3, 50);   // Mid-tone
	 * const bright = new XyY(0.3, 0.3, 95); // Bright color
	 *
	 * console.log(`Brightness: ${bright.Y2 > 80 ? 'High' : 'Low'}`);
	 * ```
	 */
	public get Y2(): number {
		return this.components[2];
	}

	/**
	 * Sets the Y luminance component.
	 *
	 * Updates the absolute luminance value with validation to ensure
	 * the value is non-negative and finite. This component directly
	 * affects the perceived brightness of the color.
	 *
	 * @param value - The Y luminance to set (cd/m², must be finite and non-negative)
	 * @throws {ColorError} When value is negative, infinite, or NaN
	 *
	 * @example Basic Assignment
	 * ```typescript
	 * const color = new XyY();
	 * color.Y2 = 100; // Reference white luminance
	 * ```
	 *
	 * @example Dynamic Range Applications
	 * ```typescript
	 * const hdr = new XyY(0.3127, 0.3290, 0);
	 * hdr.Y2 = 1000; // HDR bright highlight
	 * hdr.Y2 = 0.1;  // HDR deep shadow
	 * ```
	 */
	public set Y2(value: number) {
		XyY.AssertComponent('Y', value);
		this.components[2] = value;
	}

	/**
	 * Creates a new XyY color instance.
	 *
	 * Constructs a color in the CIE XyY color space with specified chromaticity
	 * coordinates and luminance. All parameters are validated for range and
	 * finite values during construction.
	 *
	 * @param x - x chromaticity coordinate (0.0-1.0, default: 0.0)
	 * @param y - y chromaticity coordinate (0.0-1.0, default: 0.0)
	 * @param y2 - Y luminance component (cd/m², 0.0+, default: 0.0)
	 * @throws {ColorError} When any parameter is negative, infinite, or NaN
	 *
	 * @example Basic Construction
	 * ```typescript	 * // Black color (no chromaticity, no luminance)
	 * const black = new XyY();
	 *
	 * // D65 white point
	 * const white = new XyY(0.3127, 0.3290, 100);
	 *
	 * // Custom color with specific chromaticity
	 * const custom = new XyY(0.4, 0.5, 75);
	 * ```
	 *
	 * @example Standard Illuminants
	 * ```typescript
	 * // CIE standard illuminants
	 * const illuminantA = new XyY(0.4476, 0.4074, 100);   // Tungsten
	 * const illuminantD50 = new XyY(0.3457, 0.3585, 100); // Daylight 5000K
	 * const illuminantD65 = new XyY(0.3127, 0.3290, 100); // Daylight 6500K
	 * ```
	 *
	 * @example Color Science Applications
	 * ```typescript
	 * // Primary colors for color matching experiments
	 * const redPrimary = new XyY(0.735, 0.265, 50);
	 * const greenPrimary = new XyY(0.274, 0.717, 50);
	 * const bluePrimary = new XyY(0.167, 0.009, 50);
	 *
	 * // Gamut boundary analysis
	 * const colors = [redPrimary, greenPrimary, bluePrimary];
	 * const gamutArea = calculateChromaticityArea(colors);
	 * ```
	 */
	constructor(x: number = 0, y: number = 0, y2: number = 0) {
		super();
		this.components = [0, 0, 0]; // Initialize to defaults
		this.X = x; // Use setters for validation
		this.Y1 = y;
		this.Y2 = y2;
	}

	/**
	 * Returns a string representation of the XyY color.
	 *
	 * Generates a human-readable string representation following the standard
	 * format "XyY(x, y, Y)" with comma-separated component values. Useful for
	 * debugging, logging, and displaying color information.
	 *
	 * @returns A string in the format "XyY(x, y, Y)" where each component
	 *          is displayed with JavaScript's default number formatting
	 *
	 * @example Basic Usage
	 * ```typescript
	 * const white = new XyY(0.3127, 0.3290, 100);	 * console.log(white.ToString()); // "XyY(0.3127, 0.329, 100)"
	 *
	 * const red = new XyY(0.735, 0.265, 50);
	 * console.log(red.ToString()); // "XyY(0.735, 0.265, 50)"
	 * ```
	 *
	 * @example Debugging and Logging
	 * ```typescript
	 * const colors = [
	 *   new XyY(0.3127, 0.3290, 100), // D65 white
	 *   new XyY(0.4476, 0.4074, 100), // Illuminant A
	 * ];
	 *
	 * colors.forEach((color, index) => {
	 *   console.log(`Color ${index}: ${color.ToString()}`);
	 * });
	 * ```
	 */
	public override ToString(): string {
		return `XyY(${this.components.join(', ')})`;
	}

	/**
	 * Type guard assertion function that validates if a value is an instance of XyY.
	 * Throws a TypeError if the provided value is not an XyY instance.
	 *
	 * @param color - The value to validate as an XyY instance
	 * @throws {TypeError} When the value is not an instance of XyY
	 *
	 * @example
	 * ```typescript
	 * const value: unknown = getColorFromSomewhere();
	 * XyY.Assert(value); // value is now typed as XyY
	 * console.log(value.X, value.Y1, value.Y2); // Safe to use XyY properties
	 * ```
	 */
	public static override Assert(color: unknown): asserts color is XyY {
		AssertInstanceOf(color, XyY, { class: ColorError, message: 'Not a XyY Color' });
		XyY.AssertComponent('x', color.X);
		XyY.AssertComponent('y', color.Y1);
		XyY.AssertComponent('Y', color.Y2);
	}

	/**
	 * Validates a single XyY component value by name.
	 * @param name - The component name ('x', 'y', or 'Y')
	 * @param colorOrValue - The value to validate
	 * @throws {ColorError} If the value is out of range or not a number
	 */
	protected static AssertComponent(name: TXyYComponentSelection, color: XyY): void;
	protected static AssertComponent(name: TXyYComponentSelection, value: number): void;
	protected static AssertComponent(name: TXyYComponentSelection, colorOrValue: XyY | number): void {
		switch (name) {
			case 'x': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.X;
				AssertNumber(value, { finite: true, gte: 0, lte: 1 }, { class: ColorError, message: 'Channel(X) must be a finite number between 0 and 1.' });
				break;
			}
			case 'y': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.Y1;
				AssertNumber(value, { finite: true, gte: 0, lte: 1 }, { class: ColorError, message: 'Channel(Y1) must be a finite number between 0 and 1.' });
				break;
			}
			case 'Y': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.Y2;
				AssertNumber(value, { finite: true, gte: 0 }, { class: ColorError, message: 'Channel(Y2) must be a finite number greater than or equal to 0.' });
				break;
			}
			default:
				throw new ColorError(`Unknown XyY component: ${name}`);
		}
	}

	/**
	 * Validates that an object is a valid XyY color instance.
	 *
	 * Performs comprehensive validation to determine if the provided object
	 * is a properly constructed XyY color with valid component values.
	 * Returns a boolean result for conditional processing and filtering operations.
	 *
	 * @param color - The object to validate as an XyY color instance
	 * @returns `true` if the object is a valid XyY color, `false` otherwise
	 *
	 * @example Basic Validation
	 * ```typescript
	 * const validColor = new XyY(0.3127, 0.3290, 100);
	 * const invalidObject = { x: 0.3, y: 0.3, Y: 50 };
	 *
	 * console.log(XyY.Validate(validColor));   // true
	 * console.log(XyY.Validate(invalidObject)); // false
	 * console.log(XyY.Validate(null));         // false
	 * ```
	 *
	 * @example Conditional Processing
	 * ```typescript
	 * function processColor(color: unknown) {
	 *   if (XyY.Validate(color)) {
	 *     // color is now known to be XyY type
	 *     console.log(`Processing XyY: ${color.ToString()}`);
	 *     return color.Y2; // Safe to access properties
	 *   }
	 *   return null;
	 * }
	 * ```
	 *
	 * @example Array Filtering
	 * ```typescript
	 * const mixedArray: unknown[] = [
	 *   new XyY(0.3, 0.3, 50),
	 *   new RGB(255, 0, 0),
	 *   { invalid: 'object' },
	 *   new XyY(0.4, 0.5, 75)
	 * ];
	 *
	 * const XyYColors = mixedArray.filter(XyY.Validate);
	 * console.log(`Found ${XyYColors.length} XyY colors`);
	 * ```
	 */
	public static override Validate(color: unknown): boolean {
		try {
			XyY.Assert(color);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Creates an XyY color from another color space.
	 *
	 * Factory method that converts colors from supported color spaces into
	 * XyY representation. Currently supports conversion from XYZ color space,
	 * which is the natural source for XyY transformation.
	 *
	 * @param color - The source color to convert (currently supports XYZ)
	 * @returns A new XyY color instance with equivalent chromaticity and luminance
	 * @throws {ColorError} When the source color type is not supported
	 *
	 * @example XYZ Conversion
	 * ```typescript
	 * const xyz = new XYZ(95.047, 100.0, 108.883); // D65 white
	 * const xyy = XyY.From(xyz);
	 * console.log(xyy.ToString()); // "XyY(0.3127, 0.329, 100)"
	 * ```
	 *
	 * @example Batch Conversion
	 * ```typescript
	 * const xyzColors = [
	 *   new XYZ(95.047, 100.0, 108.883), // White
	 *   new XYZ(41.24, 21.26, 1.93),     // Red
	 *   new XYZ(35.76, 71.52, 11.92)     // Green
	 * ];
	 *
	 * const XyYColors = xyzColors.map(xyz => XyY.From(xyz));
	 * console.log(`Converted ${XyYColors.length} colors to XyY`);
	 * ```
	 *
	 * @example Error Handling
	 * ```typescript
	 * try {
	 *   const rgb = new RGB(255, 0, 0);
	 *   const xyy = XyY.From(rgb); // Not supported directly
	 * } catch (error) {
	 *   console.error('Conversion failed:', error.message);
	 *   // Convert via XYZ first: RGB -> XYZ -> XyY
	 * }
	 * ```
	 */
	/**
	 * Converts an XYZ color to XyY.
	 * @param color - The XYZ color to convert.
	 * @returns A new XyY color instance.
	 */
	public static FromXYZ(color: XYZ): XyY {
		XYZ.Validate(color);

		// Create XYZ vector for better type safety and optimization
		const xyzVector: TVector3 = [color.X, color.Y, color.Z];

		// Calculate sum for normalization with safety check
		const sum = xyzVector[0] + xyzVector[1] + xyzVector[2];

		// Initialize result vector for chromaticity coordinates
		const chromaticityResult: TVector3 = [0, 0, color.Y]; // Y component (luminance) is unchanged

		// Avoid division by zero when sum is zero (black point case)
		if (Math.abs(sum) > Number.EPSILON) {
			// Use vector operations for normalized coordinate calculation
			const normalizedVector: TVector3 = [xyzVector[0] / sum, xyzVector[1] / sum, xyzVector[2] / sum];
			const [x] = normalizedVector; // x chromaticity
			chromaticityResult[0] = x;
			const [, y] = normalizedVector; // y chromaticity
			chromaticityResult[1] = y;
		}

		// Ensure finite values - replace any NaN or infinite values with 0
		const finalResult: TVector3 = [
			Number.isFinite(chromaticityResult[0]) ? chromaticityResult[0] : 0,
			Number.isFinite(chromaticityResult[1]) ? chromaticityResult[1] : 0,
			Number.isFinite(chromaticityResult[2]) ? chromaticityResult[2] : 0,
		];

		return new XyY(finalResult[0], finalResult[1], finalResult[2]);
	}

	public static From(color: XYZ): XyY {
		if (color instanceof XYZ) return XyY.FromXYZ(color);
		throw new ColorError('Cannot Convert to XyY');
	}
}
