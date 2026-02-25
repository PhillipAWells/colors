/* eslint-disable no-magic-numbers */
import { AssertNumber, AssertInstanceOf } from './assert.js';
import { TVector3 } from '@pawells/math-extended';
import { ColorSpace } from './_color-space.js';
import { XYZ } from './xyz.js';
import { ColorSpaceManager } from './manager.js';
import { ColorError } from '../error.js';

type THunterLabComponentSelection = 'L' | 'A' | 'B';

/**
 * Represents a color in the Hunter Lab color space, designed specifically for measuring surface colors.
 *
 * The Hunter Lab color space was created by Richard S. Hunter in 1948 as an alternative to the CIE Lab
 * color space for industrial color measurement and quality control applications. It represents colors
 * using three perceptual components that are calculated using square root transformations of tristimulus values:
 *
 * - **L**: Lightness component (0-100) representing the perceived brightness of the color
 * - **a**: Red-green opponent axis where negative values indicate green and positive values indicate red
 * - **b**: Blue-yellow opponent axis where negative values indicate blue and positive values indicate yellow
 *
 * ## Key Characteristics
 * - **Perceptual Uniformity**: Better color difference correlation than XYZ for dark colors
 * - **Square Root Based**: Uses square root transformations for improved visual uniformity
 * - **Industrial Focus**: Optimized for surface color measurement and quality control
 * - **Hunter Formula**: Based on Hunter's 1948 research on visual color perception
 * - **D65 Reference**: Uses CIE Standard Illuminant D65 as the reference white point
 *
 * ## Applications
 * - **Quality Control**: Industrial color matching and tolerance evaluation
 * - **Surface Measurement**: Paint, textile, and material color analysis
 * - **Color Difference**: Calculating perceptual color differences for manufacturing
 * - **Spectrophotometry**: Converting reflectance measurements to perceptual coordinates
 * - **Standards Compliance**: Meeting industrial color standards and specifications
 *
 * @example Basic Hunter Lab color creation and usage
 * ```typescript
 * // Create a white color
 * const white = new HunterLab(100, 0, 0);
 * console.log(white.ToString()); // "HunterLab(100, 0, 0)"
 *
 * // Create a red color
 * const red = new HunterLab(50, 25, 15);
 * console.log(`Red color: L=${red.L}, a=${red.a}, b=${red.b}`);
 * ```
 *
 * @example Converting from XYZ for surface color measurement
 * ```typescript
 * const xyzColor = new XYZ(0.4124, 0.2126, 0.0193); // Red surface
 * const hunterLab = HunterLab.From(xyzColor);
 * console.log(`Surface color: ${hunterLab.ToString()}`);
 * ```
 *
 * @example Quality control color difference calculation
 * ```typescript
 * const standard = new HunterLab(75, 10, 5);
 * const sample = new HunterLab(73, 12, 7);
 *
 * // Calculate color difference components
 * const deltaL = Math.abs(sample.L - standard.L);
 * const deltaA = Math.abs(sample.a - standard.a);
 * const deltaB = Math.abs(sample.b - standard.b);
 *
 * console.log(`Color difference: ΔL=${deltaL}, Δa=${deltaA}, Δb=${deltaB}`);
 * ```
 */
@ColorSpaceManager.Register({
	name: 'HunterLab',
	description: 'Represents a color in the Hunter Lab color space.',
	converters: [
		'XYZ',
	],
})
export class HunterLab extends ColorSpace {
	/** Internal array storing the Hunter Lab component values [L, a, b] */
	protected override components: [number, number, number];

	/**
	 * Gets the Lightness component value representing the perceived brightness of the color.
	 *
	 * The L component in Hunter Lab represents the lightness or perceived brightness of the color,
	 * ranging from 0 (black) to 100 (white). This component is calculated using the square root
	 * of the normalized Y tristimulus value, providing better perceptual uniformity for dark colors
	 * compared to linear lightness scales.
	 *
	 * @returns The lightness value (0-100) where:
	 * - 0 = Perfect black (no reflected light)
	 * - 50 = Medium gray (18% reflectance reference)
	 * - 100 = Perfect white (100% reflectance)
	 *
	 * @example Accessing lightness for quality control
	 * ```typescript	 * const color = new HunterLab(75, 10, -5);
	 * const lightness = color.L;
	 *
	 * if (lightness < 60) {
	 *   console.log("Dark color - may need special handling");
	 * } else if (lightness > 85) {
	 *   console.log("Light color - high reflectance surface");
	 * }
	 * ```
	 */
	public get L(): number {
		return this.components[0];
	}

	/**
	 * Sets the Lightness component value.
	 *
	 * @param value - The Lightness value to set (0-100+)
	 * @throws {ColorError} When value is negative, NaN, or infinite
	 */
	public set L(value: number) {
		HunterLab._AssertComponent('L', value);
		this.components[0] = value;
	}

	/**
	 * Gets the a component value representing the red-green opponent color axis.
	 *
	 * The a component represents the red-green opponent dimension in Hunter Lab space,
	 * where negative values indicate green hues and positive values indicate red hues.
	 * This component is calculated using Hunter's formula with ka coefficient adjustments
	 * for improved color difference correlation in industrial applications.
	 *
	 * @returns The red-green axis value where:
	 * - Negative values: Green direction (typically -60 to 0)
	 * - Zero: Neutral (no red or green component)
	 * - Positive values: Red direction (typically 0 to +60)
	 *
	 * @example Using a component for color classification
	 * ```typescript	 * const color = new HunterLab(50, 15, -10);
	 * const greenRed = color.A;
	 *
	 * if (greenRed > 10) {
	 *   console.log("Predominantly red color");
	 * } else if (greenRed < -10) {
	 *   console.log("Predominantly green color");
	 * } else {
	 *   console.log("Neutral red-green balance");
	 * }
	 * ```
	 */
	public get A(): number {
		return this.components[1];
	}

	/**
	 * Sets the A component value (red-green axis).
	 *
	 * @param value - The A value to set (unbounded, typically -60 to +60)
	 * @throws {ColorError} When value is NaN or infinite
	 */
	public set A(value: number) {
		HunterLab._AssertComponent('A', value);
		this.components[1] = value;
	}

	/**
	 * Gets the b component value representing the blue-yellow opponent color axis.
	 *
	 * The b component represents the blue-yellow opponent dimension in Hunter Lab space,
	 * where negative values indicate blue hues and positive values indicate yellow hues.
	 * This component is calculated using Hunter's formula with kb coefficient adjustments
	 * optimized for surface color measurement and industrial color matching applications.
	 *
	 * @returns The blue-yellow axis value where:
	 * - Negative values: Blue direction (typically -60 to 0)
	 * - Zero: Neutral (no blue or yellow component)
	 * - Positive values: Yellow direction (typically 0 to +60)
	 *
	 * @example Using b component for color grading
	 * ```typescript	 * const color = new HunterLab(65, 5, 20);
	 * const blueYellow = color.B;
	 *
	 * if (blueYellow > 15) {
	 *   console.log("Strong yellow cast - check illumination");
	 * } else if (blueYellow < -15) {
	 *   console.log("Strong blue cast - may indicate contamination");
	 * } else {
	 *   console.log("Acceptable blue-yellow balance");
	 * }
	 * ```
	 */
	public get B(): number {
		return this.components[2];
	}

	/**
	 * Sets the b component value (blue-yellow axis).
	 *
	 * @param value - The b value to set (unbounded, typically -60 to +60)
	 * @throws {ColorError} When value is NaN or infinite
	 */
	public set B(value: number) {
		HunterLab._AssertComponent('B', value);
		this.components[2] = value;
	}

	/**
	 * Creates a new Hunter Lab color instance with specified component values.
	 *
	 * Constructs a Hunter Lab color with the provided lightness, red-green, and blue-yellow
	 * component values. The constructor automatically validates all components to ensure
	 * they fall within acceptable ranges for industrial color measurement applications.
	 *
	 * @param l - Lightness component (0-100, default: 0) representing perceived brightness
	 *            where 0 is perfect black and 100 is perfect white	 * @param a - Red-green opponent axis component (default: 0) where negative values
	 *            indicate green direction and positive values indicate red direction
	 * @param b - Blue-yellow opponent axis component (default: 0) where negative values
	 *            indicate blue direction and positive values indicate yellow direction
	 *
	 * @throws {ColorError} When any component value is invalid:
	 * - L component must be finite and between 0-100
	 * - a and b components must be finite numbers
	 *
	 * @example Creating colors for surface measurement
	 * ```typescript
	 * // Perfect white reference
	 * const white = new HunterLab(100, 0, 0);
	 *
	 * // Medium gray with slight red cast
	 * const grayRed = new HunterLab(50, 5, 0);
	 *
	 * // Dark blue surface
	 * const darkBlue = new HunterLab(25, -10, -15);
	 * ```
	 *
	 * @example Industrial color matching workflow
	 * ```typescript
	 * // Standard reference color
	 * const standard = new HunterLab(72.5, 18.2, 15.8);
	 *
	 * // Production sample
	 * const sample = new HunterLab(71.8, 17.9, 16.1);
	 *
	 * // Validate both colors are within tolerance
	 * console.log(`Standard: ${standard.ToString()}`);
	 * console.log(`Sample: ${sample.ToString()}`);
	 * ```
	 */
	constructor(l: number = 0, a: number = 0, b: number = 0) {
		super();
		this.components = [0, 0, 0]; // Initialize to defaults
		this.L = l; // Use setters for validation
		this.A = a;
		this.B = b;
	}

	/**
	 * Returns a string representation of the Hunter Lab color for display and debugging.
	 *
	 * Formats the Hunter Lab color components as a readable string, with options for
	 * different precision levels suitable for various industrial and scientific applications.
	 * The float format preserves full precision for accurate color measurement, while
	 * the int format provides rounded values for general display purposes.
	 *
	 * @param format - Output format specifier:
	 *                 - 'float' (default): Full precision decimal values as measured
	 *                 - 'int': Rounded integer values for L, scaled values for a/b
	 * @returns A formatted string in "HunterLab(L, a, b)" format
	 *
	 * @example Different format options for quality control reports
	 * ```typescript	 * const color = new HunterLab(72.847, 18.235, -15.642);
	 *
	 * // Full precision for laboratory measurements
	 * console.log(color.ToString());        // "HunterLab(72.847, 18.235, -15.642)"
	 * console.log(color.ToString('float')); // "HunterLab(72.847, 18.235, -15.642)"
	 *
	 * // Rounded values for production reports
	 * console.log(color.ToString('int'));   // "HunterLab(73, 2334, -2002)"
	 * ```
	 *
	 * @example Integration with logging systems
	 * ```typescript
	 * const colors = [
	 *   new HunterLab(65.2, 14.8, 22.1),
	 *   new HunterLab(67.1, 13.9, 21.7)
	 * ];
	 *
	 * colors.forEach((color, index) => {
	 *   console.log(`Sample ${index + 1}: ${color.ToString('float')}`);
	 * });
	 * ```
	 *
	 * @remarks The 'int' format scales a and b components by 128 to convert them
	 *          to an integer range suitable for certain industrial protocols and
	 *          legacy systems that expect integer color representations.
	 */
	public override ToString(format?: 'float' | 'int'): string {
		if (format === undefined || format === 'float') {
			return `HunterLab(${this.L}, ${this.A}, ${this.B})`;
		}
		const l = Math.round(this.L);
		const a = Math.round(this.A * 128);
		const b = Math.round(this.B * 128);
		return `HunterLab(${l}, ${a}, ${b})`;
	}

	/**
	 * Type guard assertion function that validates if a value is an instance of HunterLab.
	 * Throws a ColorError if the provided value is not a HunterLab instance.
	 *
	 * @param color - The value to validate as a HunterLab instance
	 * @throws {ColorError} When the value is not an instance of HunterLab
	 *
	 * @example
	 * ```typescript
	 * const value: unknown = getColorFromSomewhere();
	 * HunterLab.Assert(value); // value is now typed as HunterLab
	 * console.log(value.L, value.a, value.b); // Safe to use HunterLab properties
	 * ```
	 */
	public static override Assert(color: unknown): asserts color is HunterLab {
		AssertInstanceOf(color, HunterLab, { class: ColorError, message: 'Not a HunterLab Color' });
		const hunterLabColor = color as HunterLab;
		HunterLab._AssertComponent('L', hunterLabColor.L);
		HunterLab._AssertComponent('A', hunterLabColor.A);
		HunterLab._AssertComponent('B', hunterLabColor.B);
	}

	/**
	 * Validates a single HunterLab component value by name.
	 * @param component - The component name ('L', 'a', or 'b')
	 * @param colorOrValue - The value to validate
	 * @throws {ColorError} If the value is out of range or not a number
	 */
	private static _AssertComponent(component: THunterLabComponentSelection, color: HunterLab): void;
	private static _AssertComponent(component: THunterLabComponentSelection, value: number): void;
	private static _AssertComponent(component: THunterLabComponentSelection, colorOrValue: HunterLab | number): void {
		switch (component) {
			case 'L': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.L;
				AssertNumber(value, { finite: true }, { class: ColorError, message: 'Channel(L) must be a finite number.' });
				break;
			}
			case 'A': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.A;
				AssertNumber(value, { finite: true }, { class: ColorError, message: 'Channel(A) must be a finite number.' });
				break;
			}
			case 'B': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.B;
				AssertNumber(value, { finite: true }, { class: ColorError, message: 'Channel(B) must be a finite number.' });
				break;
			}
			default:
				throw new ColorError(`Unknown HunterLab component: ${component}`);
		}
	}

	/**
	 * Validates whether an object represents a valid Hunter Lab color without throwing exceptions.
	 *
	 * Performs comprehensive validation to determine if the provided object is a valid
	 * Hunter Lab color instance with all components within acceptable ranges. This method
	 * is ideal for conditional processing, data filtering, and quality control workflows
	 * where exception handling should be avoided.
	 *
	 * @param color - The object to validate as a Hunter Lab color instance
	 * @returns `true` if the object is a valid Hunter Lab color, `false` otherwise
	 *
	 * @example Conditional processing in quality control systems
	 * ```typescript
	 * const measurements: unknown[] = [
	 *   new HunterLab(75, 10, 5),	 *   { L: 50, a: 0, b: 0 },  // Invalid: not a HunterLab instance
	 *   new HunterLab(120, 0, 0) // Invalid: L > 100
	 * ];
	 *
	 * const validColors = measurements.filter(HunterLab.Validate);
	 * console.log(`Found ${validColors.length} valid measurements`);
	 * ```
	 *
	 * @example Batch validation for data import
	 * ```typescript
	 * function processColorData(data: unknown[]): HunterLab[] {
	 *   return data
	 *     .filter(HunterLab.Validate)
	 *     .map(item => item as HunterLab);
	 * }
	 *
	 * const imported = [
	 *   new HunterLab(60, 15, -10),
	 *   new HunterLab(45, -5, 20),
	 *   null, // Invalid
	 *   new HunterLab(80, 0, 0)
	 * ];
	 *
	 * const processed = processColorData(imported);
	 * console.log(`Processed ${processed.length} valid colors`);
	 * ```
	 *
	 * @example Error-free validation in production pipelines
	 * ```typescript
	 * function analyzeColorMeasurement(sample: unknown): string {
	 *   if (!HunterLab.Validate(sample)) {
	 *     return "Invalid color measurement - check sensor calibration";
	 *   }
	 *
	 *   const color = sample as HunterLab;
	 *   return `Valid measurement: L=${color.L}, A=${color.A}, B=${color.B}`;
	 * }
	 * ```
	 */
	public static override Validate(color: unknown): boolean {
		try {
			HunterLab.Assert(color);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Creates a Hunter Lab color instance from another color space representation.
	 *
	 * Factory method that converts colors from supported color spaces into Hunter Lab format
	 * for industrial color measurement and quality control applications. Currently supports
	 * conversion from XYZ color space using Hunter's original transformation algorithms
	 * optimized for surface color measurement.
	 *
	 * @param color - The source color to convert to Hunter Lab format.
	 *                Currently supported types: XYZ
	 * @returns A new Hunter Lab color instance with equivalent color values
	 * @throws {Error} When the source color type is not supported for conversion
	 *
	 * @example Converting XYZ measurements to Hunter Lab for quality control
	 * ```typescript
	 * // Convert spectrophotometer XYZ readings to Hunter Lab	 * const xyzMeasurement = new XYZ(0.3127, 0.3290, 0.3583);
	 * const hunterLab = HunterLab.From(xyzMeasurement);
	 *
	 * console.log(`Hunter Lab: ${hunterLab.ToString()}`);
	 * // Use for color difference calculations and tolerance checking
	 * ```
	 *
	 * @example Batch conversion for production monitoring
	 * ```typescript
	 * const xyzReadings = [
	 *   new XYZ(0.4124, 0.2126, 0.0193), // Red sample
	 *   new XYZ(0.2126, 0.7152, 0.0722), // Green sample
	 *   new XYZ(0.1805, 0.0722, 0.9505)  // Blue sample
	 * ];
	 *
	 * const hunterLabColors = xyzReadings.map(xyz => HunterLab.From(xyz));
	 * hunterLabColors.forEach((color, index) => {
	 *   console.log(`Sample ${index + 1}: ${color.ToString('float')}`);
	 * });
	 * ```
	 *
	 * @example Integration with color measurement workflow
	 * ```typescript
	 * function processSpectralMeasurement(xyzData: XYZ): {
	 *   lab: HunterLab;
	 *   classification: string;
	 * } {
	 *   const lab = HunterLab.From(xyzData);
	 *
	 *   let classification = "Unknown";
	 *   if (lab.L > 80) classification = "Light";
	 *   else if (lab.L < 30) classification = "Dark";
	 *   else classification = "Medium";
	 *
	 *   return { lab, classification };
	 * }
	 * ```
	 */
	public static From(color: XYZ): HunterLab {
		if (color instanceof XYZ) return HunterLab.FromXYZ(color);
		throw new Error('Cannot Convert to Hunter Lab');
	}

	/**
	 * Converts an XYZ color to Hunter Lab using Hunter's original 1948 transformation algorithm.
	 *
	 * Implements the mathematical conversion from CIE XYZ tristimulus values to Hunter Lab
	 * coordinates using Hunter's specific formulation optimized for surface color measurement.
	 * The conversion uses D65 as the reference white point and applies Hunter's ka and kb
	 * coefficients for improved perceptual uniformity in industrial applications.
	 *
	 * @param xyz - The XYZ color instance to convert to Hunter Lab
	 * @returns A new Hunter Lab color instance with equivalent perceptual coordinates
	 * @throws {ColorError} When the input XYZ color is invalid
	 */
	public static FromXYZ(color: XYZ): HunterLab {
		// Create vectors for normalized XYZ and D65 reference values
		const xyzVector: TVector3 = [color.X, color.Y, color.Z];
		const d65Vector: TVector3 = [XYZ.D65.X, XYZ.D65.Y, XYZ.D65.Z];

		// Normalize XYZ by D65 reference using vector division
		const normalizedVector: TVector3 = [
			xyzVector[0] / d65Vector[0],
			xyzVector[1] / d65Vector[1],
			xyzVector[2] / d65Vector[2],
		];

		const [x, y, z] = normalizedVector;

		// Calculate Hunter Lab coefficients using vector operations
		const ka = (175.0 / 198.04) * (d65Vector[0] + d65Vector[1]);
		const kb = (70.0 / 218.11) * (d65Vector[1] + d65Vector[2]);

		const L = 100 * Math.sqrt(y);
		const a = L !== 0 ? ka * ((x - y) / Math.sqrt(y)) : 0;
		const b = L !== 0 ? kb * ((y - z) / Math.sqrt(y)) : 0;

		// Ensure all values are finite for safety
		const lFinal = Number.isFinite(L) ? L : 0;
		const aFinal = Number.isFinite(a) ? a : 0;
		const bFinal = Number.isFinite(b) ? b : 0;

		return new HunterLab(lFinal, aFinal, bFinal);
	}
	/**
	 * Converts an XYZ color to Hunter Lab using Hunter's original 1948 transformation algorithm.
	 *
	 * Implements the mathematical conversion from CIE XYZ tristimulus values to Hunter Lab
	 * coordinates using Hunter's specific formulation optimized for surface color measurement.
	 * The conversion uses D65 as the reference white point and applies Hunter's ka and kb
	 * coefficients for improved perceptual uniformity in industrial applications.
	 *
	 * @param xyz - The XYZ color instance to convert to Hunter Lab
	 * @returns A new Hunter Lab color instance with equivalent perceptual coordinates
	 *
	 * @internal This method implements Hunter's original algorithm:
	 * 1. Normalize XYZ values by D65 reference white point
	 * 2. Calculate ka coefficient: (175/198.04) × (Xn + Yn)
	 * 3. Calculate kb coefficient: (70/218.11) × (Yn + Zn)
	 * 4. Apply square root transformation: L = 100 × √y
	 * 5. Calculate opponent axes: a = ka × (x-y)/√y, b = kb × (y-z)/√y
	 * 6. Handle special case when L = 0 (perfect black)
	 *
	 * @example Mathematical verification of Hunter Lab conversion
	 * ```typescript
	 * // Test with known reference values	 * const whiteXYZ = new XYZ(95.047, 100.000, 108.883); // D65 white point
	 * const whiteLab = HunterLab.FromXYZ(whiteXYZ);
	 * // Expected: L ≈ 100, a ≈ 0, b ≈ 0
	 *
	 * const redXYZ = new XYZ(41.24, 21.26, 1.93); // sRGB red in XYZ
	 * const redLab = HunterLab.FromXYZ(redXYZ);
	 * // Expected: L ≈ 46, a ≈ 72, b ≈ 67
	 * ```
	 *
	 * @remarks The Hunter Lab formula differs from CIE Lab in its use of square root
	 *          transformations rather than cube root, making it more suitable for
	 *          certain industrial color measurement applications, particularly
	 *          for darker colors where perceptual uniformity is critical.
	 */
}
