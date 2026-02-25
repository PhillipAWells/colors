/* eslint-disable no-magic-numbers */
import { AssertNumber, AssertInstanceOf } from './assert.js';
import { TVector3 } from '@pawells/math-extended';
import { ColorSpace } from './_color-space.js';
import { XYZ } from './xyz.js';
import { LCHuv } from './lchuv.js';
import { ColorSpaceManager } from './manager.js';
import { ColorError } from '../error.js';

type TLUVComponentSelection = 'L' | 'U' | 'V';

/**
 * Represents a color in the CIE LUV (Lightness, u*, v*) color space.
 *
 * The CIE LUV color space is a perceptually uniform color space adopted by the
 * International Commission on Illumination (CIE) in 1976, designed to provide
 * better perceptual uniformity than the foundational XYZ color space, particularly
 * for additive color systems and light sources.
 *
 * ## Color Components
 * - **L (Lightness)**: 0-100, where 0 is absolute black and 100 is diffuse white
 * - **U (u*)**: Red-green opponent axis (typically -134 to +220)
 *   - Negative values: greenish colors
 *   - Positive values: reddish/magenta colors
 * - **V (v*)**: Blue-yellow opponent axis (typically -140 to +122)
 *   - Negative values: bluish colors
 *   - Positive values: yellowish colors
 *
 * ## Key Characteristics
 * - **Perceptual uniformity**: Equal Euclidean distances correspond to roughly equal perceptual differences
 * - **Additive optimization**: Designed for RGB displays, projectors, and light sources
 * - **D65 reference**: Uses D65 standard illuminant as the reference white point
 * - **Light source focus**: Better suited for emissive objects than reflective surfaces
 * - **CIE standard**: Official CIE recommendation for uniform color spaces
 *
 * ## Applications and Use Cases
 * - **Display technology**: Monitor calibration, TV standards, digital projectors
 * - **Color difference**: Delta E calculations for light sources and displays
 * - **Computer graphics**: 3D rendering, image processing, color interpolation
 * - **Digital imaging**: Color management pipelines for photography and video
 * - **Color measurement**: Scientific colorimetry of self-luminous objects
 * - **Quality control**: Display manufacturing and calibration standards
 *
 * ## Relationship to Other Spaces
 * - **XYZ**: LUV is derived from XYZ with perceptual corrections applied
 * - **LCHuv**: Polar coordinate representation of LUV (more intuitive for design)
 * - **Lab**: Alternative perceptually uniform space optimized for surface colors
 * - **RGB**: LUV provides better interpolation than direct RGB operations
 *
 * @example Basic color creation and manipulation
 * ```typescript
 * // Create colors for display applications
 * const white = new LUV(100, 0, 0);        // Pure white
 * const red = new LUV(53, 175, 37);        // Vivid red for displays
 * const green = new LUV(88, -83, 107);     // Bright green
 * const blue = new LUV(32, 9, -130);       // Deep blue
 *
 * console.log(red.ToString()); // "LUV(53, 175, 37)"
 * ```
 *
 * @example Display color management workflow
 * ```typescript
 * // Convert from XYZ for display optimization
 * const xyzColor = new XYZ(0.45, 0.35, 0.15);
 * const luvColor = LUV.From(xyzColor);
 *
 * // Adjust for display characteristics
 * luvColor.L = Math.min(luvColor.L * 1.1, 100); // Boost brightness
 * luvColor.U = luvColor.U * 0.95; // Slight desaturation
 * luvColor.V = luvColor.V * 0.95;
 *
 * console.log(`Optimized: ${luvColor.ToString()}`);
 * ```
 *
 * @example Color difference calculations
 * ```typescript
 * const color1 = new LUV(70, 25, 40);
 * const color2 = new LUV(72, 22, 45);
 *
 * // Calculate Delta E (Euclidean distance in LUV space)
 * const deltaE = Math.sqrt(
 *   Math.pow(color2.L - color1.L, 2) +
 *   Math.pow(color2.U - color1.U, 2) +
 *   Math.pow(color2.V - color1.V, 2)
 * );
 * console.log(`Color difference: ${deltaE.toFixed(2)}`);
 * ```
 *
 * @example Color interpolation for smooth transitions
 * ```typescript
 * const startColor = new LUV(40, 60, -20);  // Dark blue-green
 * const endColor = new LUV(80, -30, 70);    // Light yellow-green
 *
 * // Create smooth gradient with 5 steps
 * const gradient = [];
 * for (let i = 0; i <= 4; i++) {
 *   const t = i / 4;
 *   const interpolated = new LUV(
 *     startColor.L + t * (endColor.L - startColor.L),
 *     startColor.U + t * (endColor.U - startColor.U),
 *     startColor.V + t * (endColor.V - startColor.V)
 *   );
 *   gradient.push(interpolated);
 * }
 * ```
 */
@ColorSpaceManager.Register({
	name: 'LUV',
	description: 'Represents a color in the CIE LUV color space.',
	converters: [
		'XYZ',
		'LCHuv',
	],
})
export class LUV extends ColorSpace {
	/** Internal array storing the LUV component values [L, U, V] */
	protected override components: [number, number, number];

	/**
	 * Gets the Lightness component value (0-100).
	 *
	 * Lightness in LUV represents the perceptual brightness, designed to be
	 * more perceptually uniform than the Y component of XYZ. The scale is
	 * calibrated such that equal numerical differences correspond to roughly
	 * equal perceptual differences in brightness.
	 *
	 * - 0 = absolute black (no light)
	 * - 18 = typical black level for displays
	 * - 50 = middle gray
	 * - 100 = diffuse white (reference illuminant)
	 *
	 * @example
	 * ```typescript
	 * const color = new LUV(75, 25, -15);
	 * console.log(color.L); // 75 (fairly bright)
	 *
	 * // Typical lightness ranges for different applications
	 * const shadow = new LUV(15, 5, 8);     // Dark shadow
	 * const midtone = new LUV(50, 20, -10); // Middle gray
	 * const highlight = new LUV(90, -5, 15); // Bright highlight
	 * ```
	 */
	public get L(): number {
		return this.components[0];
	}

	/**
	 * Sets the Lightness component value.
	 *
	 * @param value - The Lightness value to set (0-100, values above 100 may be valid for HDR)
	 * @throws {ColorError} When value is negative or not finite
	 *
	 * @example
	 * ```typescript
	 * const color = new LUV(60, 30, 20);
	 * color.L = 80;  // Increase brightness
	 * color.L = 25;  // Decrease brightness
	 *
	 * // HDR applications may use values above 100
	 * color.L = 150; // High dynamic range brightness
	 * ```
	 */
	public set L(value: number) {
		LUV._AssertComponent('L', value);
		this.components[0] = value;
	}

	/**
	 * Gets the U component value (red-green opponent axis).
	 *
	 * The u* component represents the red-green opponent dimension in the
	 * perceptually uniform LUV space. This axis is calibrated for optimal
	 * discrimination of red-green color differences in additive systems.
	 *
	 * **Typical ranges and meanings:**
	 * - Negative values (-134 to 0): Greenish colors
	 * - Zero (0): Neutral (no red-green bias)
	 * - Positive values (0 to +220): Reddish/magenta colors
	 *
	 * **Color examples:**
	 * - Pure red display primary: ~+175
	 * - Pure green display primary: ~-83
	 * - Neutral grays: ~0
	 * - Magenta: High positive values (+100 to +220)
	 *
	 * @example
	 * ```typescript
	 * const red = new LUV(53, 175, 37);     // High positive U = red bias
	 * const green = new LUV(88, -83, 107);  // High negative U = green bias
	 * const neutral = new LUV(50, 0, 0);    // Zero U = no red-green bias
	 *
	 * console.log(red.U);     // 175 (strongly red)
	 * console.log(green.U);   // -83 (strongly green)
	 * console.log(neutral.U); // 0 (neutral)
	 * ```
	 */
	public get U(): number {
		return this.components[1];
	}

	/**
	 * Sets the U component value.
	 *
	 * @param value - The U value to set (typically -134 to +220, but unbounded)
	 * @throws {ColorError} When value is not finite
	 *
	 * @example
	 * ```typescript
	 * const color = new LUV(60, 50, 30);
	 * color.U = -40;  // Shift toward green
	 * color.U = 80;   // Shift toward red/magenta
	 * color.U = 0;    // Remove red-green bias
	 *
	 * // Extreme values for highly saturated colors
	 * color.U = 200;  // Very intense red/magenta
	 * color.U = -120; // Very intense green
	 * ```
	 */
	public set U(value: number) {
		LUV._AssertComponent('U', value);
		this.components[1] = value;
	}

	/**
	 * Gets the V component value (blue-yellow opponent axis).
	 *
	 * The v* component represents the blue-yellow opponent dimension in the
	 * perceptually uniform LUV space. This axis is calibrated for optimal
	 * discrimination of blue-yellow color differences in additive systems.
	 *
	 * **Typical ranges and meanings:**
	 * - Negative values (-140 to 0): Bluish colors
	 * - Zero (0): Neutral (no blue-yellow bias)
	 * - Positive values (0 to +122): Yellowish colors
	 *
	 * **Color examples:**
	 * - Pure blue display primary: ~-130
	 * - Pure yellow: ~+107
	 * - Neutral grays: ~0
	 * - Sky blue: Moderate negative values (-40 to -80)
	 * - Golden yellow: High positive values (+80 to +122)
	 *
	 * @example
	 * ```typescript
	 * const blue = new LUV(32, 9, -130);    // High negative V = blue bias
	 * const yellow = new LUV(97, -21, 94);  // High positive V = yellow bias
	 * const neutral = new LUV(50, 0, 0);    // Zero V = no blue-yellow bias
	 *
	 * console.log(blue.V);    // -130 (strongly blue)
	 * console.log(yellow.V);  // 94 (strongly yellow)
	 * console.log(neutral.V); // 0 (neutral)
	 * ```
	 */
	public get V(): number {
		return this.components[2];
	}

	/**
	 * Sets the V component value.
	 *
	 * @param value - The V value to set (typically -140 to +122, but unbounded)
	 * @throws {ColorError} When value is not finite
	 *
	 * @example
	 * ```typescript
	 * const color = new LUV(60, 30, 20);
	 * color.V = -60;  // Shift toward blue
	 * color.V = 80;   // Shift toward yellow
	 * color.V = 0;    // Remove blue-yellow bias
	 *
	 * // Extreme values for highly saturated colors
	 * color.V = 120;  // Very intense yellow
	 * color.V = -140; // Very intense blue
	 * ```
	 */
	public set V(value: number) {
		LUV._AssertComponent('V', value);
		this.components[2] = value;
	}

	/**
	 * Creates a new LUV color instance.
	 *
	 * All parameters are validated to ensure they are finite numbers.
	 * The LUV color space is particularly well-suited for additive color
	 * systems and provides perceptually uniform color representation.
	 *
	 * @param l - Lightness component (0-100, values above 100 valid for HDR, default: 0)
	 *            0 = absolute black, 100 = diffuse white
	 * @param u - u* component (typically -134 to +220, default: 0)
	 *            Negative = greenish, Positive = reddish/magenta, 0 = neutral
	 * @param v - v* component (typically -140 to +122, default: 0)
	 *            Negative = bluish, Positive = yellowish, 0 = neutral
	 *
	 * @throws {ColorError} When any parameter is not finite or L is negative
	 *
	 * @example Basic construction for display applications
	 * ```typescript
	 * const black = new LUV();                    // LUV(0, 0, 0) - absolute black
	 * const white = new LUV(100, 0, 0);           // Pure white
	 * const red = new LUV(53, 175, 37);           // Vivid red display primary
	 * const green = new LUV(88, -83, 107);        // Bright green display primary
	 * const blue = new LUV(32, 9, -130);          // Deep blue display primary
	 * ```
	 *
	 * @example Color design and manipulation
	 * ```typescript
	 * // Create colors for digital content
	 * const warmHighlight = new LUV(85, 15, 25);  // Warm light tone
	 * const coolShadow = new LUV(25, -10, -20);   // Cool dark tone
	 * const vibrantAccent = new LUV(70, 60, 80);  // Saturated warm color
	 *
	 * // Neutral colors for UI design
	 * const lightGray = new LUV(80, 0, 0);        // Light neutral
	 * const mediumGray = new LUV(50, 0, 0);       // Medium neutral
	 * const darkGray = new LUV(20, 0, 0);         // Dark neutral
	 * ```
	 *
	 * @example Scientific and measurement applications
	 * ```typescript
	 * // Define colors for color difference measurements
	 * const reference = new LUV(60, 25, 30);      // Reference color
	 * const sample1 = new LUV(62, 27, 32);        // Slight variation
	 * const sample2 = new LUV(58, 23, 28);        // Another variation
	 *
	 * // Calculate perceptual differences using Euclidean distance
	 * const deltaE1 = Math.sqrt(
	 *   Math.pow(sample1.L - reference.L, 2) +
	 *   Math.pow(sample1.U - reference.U, 2) +
	 *   Math.pow(sample1.V - reference.V, 2)
	 * );
	 * ```
	 *
	 * @example HDR and extended range applications
	 * ```typescript
	 * // HDR content may exceed standard range
	 * const hdrWhite = new LUV(200, 0, 0);        // HDR bright white
	 * const hdrSun = new LUV(300, 50, 80);        // Extremely bright yellow
	 * const neonSign = new LUV(120, 150, -100);   // Bright neon magenta
	 * ```
	 */
	constructor(l: number = 0, u: number = 0, v: number = 0) {
		super();
		this.components = [0, 0, 0]; // Initialize to defaults
		this.L = l; // Use setters for validation
		this.U = u;
		this.V = v;
	}

	/**
	 * Returns a string representation of the LUV color.
	 *
	 * The format follows the pattern "LUV(L, U, V)" where values are
	 * displayed with their natural precision (no forced decimal places).
	 * This representation is particularly useful for debugging color
	 * workflows and scientific color analysis.
	 *
	 * @returns A string in the format "LUV(L, U, V)"
	 *
	 * @example
	 * ```typescript
	 * const color = new LUV(65.5, 42.3, -27.8);
	 * console.log(color.ToString()); // "LUV(65.5, 42.3, -27.8)"
	 *
	 * const simple = new LUV(50, 30, -20);
	 * console.log(simple.ToString()); // "LUV(50, 30, -20)"
	 *
	 * // Useful for scientific logging and analysis
	 * const measurements = [
	 *   new LUV(70, 25, 15),
	 *   new LUV(72, 22, 18),
	 *   new LUV(68, 28, 12)
	 * ];
	 * measurements.forEach((color, i) => {
	 *   console.log(`Sample ${i + 1}: ${color.ToString()}`);
	 * });
	 * ```
	 */
	public override ToString(): string {
		return `LUV(${this.L}, ${this.U}, ${this.V})`;
	}	/**
	 * Type guard assertion function that validates if a value is an instance of LUV.
	 *
	 * This method performs comprehensive validation by first checking if the value
	 * is an instance of LUV, then validating that all component values are finite
	 * numbers with appropriate constraints. The validation ensures the color is
	 * suitable for perceptually uniform color calculations and display applications.
	 *
	 * @param color - The value to validate as a LUV instance
	 * @throws {ColorError} When the value is not an instance of LUV
	 * @throws {ColorError} When L component is not finite or negative
	 * @throws {ColorError} When U component is not finite
	 * @throws {ColorError} When V component is not finite
	 *
	 * @example Type narrowing with validation
	 * ```typescript
	 * function processLUVColor(value: unknown) {
	 *   LUV.Assert(value); // value is now typed as LUV
	 *
	 *   // Safe to use LUV properties after assertion
	 *   console.log(`Lightness: ${value.L}`);
	 *   console.log(`u* (red-green): ${value.U}`);
	 *   console.log(`v* (blue-yellow): ${value.V}`);
	 *
	 *   // Calculate perceptual metrics
	 *   const chroma = Math.sqrt(value.U * value.U + value.V * value.V);
	 *   const hue = Math.atan2(value.V, value.U) * 180 / Math.PI;
	 *
	 *   return { lightness: value.L, chroma, hue };
	 * }
	 * ```
	 *
	 * @example Error handling in color measurement pipeline
	 * ```typescript
	 * function validateColorMeasurement(measurement: unknown) {
	 *   try {
	 *     LUV.Assert(measurement);
	 *
	 *     // Process valid measurement
	 *     return {
	 *       valid: true,
	 *       color: measurement,
	 *       deltaE: calculateDeltaE(measurement, referenceColor)
	 *     };
	 *   } catch (error) {
	 *     console.error('Invalid LUV measurement:', error.message);
	 *     return {
	 *       valid: false,
	 *       error: error.message,
	 *       fallback: new LUV(50, 0, 0) // Neutral gray fallback
	 *     };
	 *   }
	 * }
	 * ```
	 *
	 * @example Batch validation for scientific analysis
	 * ```typescript
	 * function processColorDataset(dataset: unknown[]) {
	 *   const validMeasurements: LUV[] = [];
	 *   const errors: string[] = [];
	 *
	 *   for (const [index, item] of dataset.entries()) {
	 *     try {
	 *       LUV.Assert(item);
	 *       validMeasurements.push(item);
	 *     } catch (error) {
	 *       errors.push(`Sample ${index}: ${error.message}`);
	 *     }
	 *   }
	 *
	 *   return { validMeasurements, errors };
	 * }
	 * ```
	 */

	public static override Assert(color: unknown): asserts color is LUV {
		AssertInstanceOf(color, LUV, { class: ColorError, message: 'Not a LUV Color' });
		LUV._AssertComponent('L', color);
		LUV._AssertComponent('U', color);
		LUV._AssertComponent('V', color);
	}

	private static _AssertComponent(component: TLUVComponentSelection, color: LUV): void;
	private static _AssertComponent(component: TLUVComponentSelection, value: number): void;
	private static _AssertComponent(component: TLUVComponentSelection, colorOrValue: LUV | number): void {
		switch (component) {
			case 'L': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.L;
				AssertNumber(value, { finite: true, gte: 0 }, { class: ColorError, message: 'Channel(L) must be a finite number greater than or equal to 0.' });
				break;
			}
			case 'U': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.U;
				AssertNumber(value, { finite: true }, { class: ColorError, message: 'Channel(U) must be a finite number.' });
				break;
			}
			case 'V': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.V;
				AssertNumber(value, { finite: true }, { class: ColorError, message: 'Channel(V) must be a finite number.' });
				break;
			}
		}
	}

	/**
	 * Converts a color from another color space to LUV.
	 *
	 * Currently supports conversion from:
	 * - XYZ (CIE XYZ tristimulus values)
	 * - LCHuv (Polar coordinate representation of LUV)
	 *
	 * This method serves as the main entry point for color space conversions
	 * to LUV, automatically detecting the source color type and applying
	 * the appropriate conversion algorithm optimized for perceptually uniform
	 * color representation and additive color systems.
	 *
	 * @param color - The color to convert (XYZ or LCHuv)
	 * @returns A new LUV color instance
	 * @throws {ColorError} When the input color type is not supported
	 *
	 * @example Converting from XYZ for colorimetric applications
	 * ```typescript
	 * const xyzColor = new XYZ(0.45, 0.35, 0.25);
	 * const luvColor = LUV.From(xyzColor);
	 * console.log(luvColor.ToString()); // "LUV(65.48, 42.31, 28.79)"
	 *
	 * // Use converted color for perceptual analysis
	 * const chroma = Math.sqrt(luvColor.U * luvColor.U + luvColor.V * luvColor.V);
	 * const hue = Math.atan2(luvColor.V, luvColor.U) * 180 / Math.PI;
	 * ```
	 *
	 * @example Converting from LCHuv for design workflows
	 * ```typescript
	 * const lchColor = new LCHuv(70, 50, 120); // Designed in polar coordinates
	 * const luvColor = LUV.From(lchColor);     // Convert to Cartesian for calculation
	 * console.log(luvColor.ToString());        // "LUV(70, -25, 43.3)"
	 *
	 * // Use Cartesian coordinates for interpolation
	 * const targetColor = new LUV(80, -30, 50);
	 * const interpolated = interpolateLUV(luvColor, targetColor, 0.5);
	 * ```
	 *
	 * @example Batch conversion for color management pipeline
	 * ```typescript
	 * const xyzColors = [
	 *   new XYZ(0.20, 0.15, 0.10),  // Dark color
	 *   new XYZ(0.60, 0.50, 0.40),  // Medium color
	 *   new XYZ(0.85, 0.75, 0.65)   // Light color
	 * ];
	 *
	 * const luvColors = xyzColors.map(xyz => LUV.From(xyz));
	 * console.log(`Converted ${luvColors.length} colors to perceptually uniform LUV`);
	 *
	 * // Analyze perceptual differences
	 * for (let i = 1; i < luvColors.length; i++) {
	 *   const prev = luvColors[i - 1];
	 *   const curr = luvColors[i];
	 *   const deltaE = Math.sqrt(
	 *     Math.pow(curr.L - prev.L, 2) +
	 *     Math.pow(curr.U - prev.U, 2) +
	 *     Math.pow(curr.V - prev.V, 2)
	 *   );
	 *   console.log(`Delta E ${i}: ${deltaE.toFixed(2)}`);
	 * }
	 * ```
	 *
	 * @example Scientific measurement and analysis
	 * ```typescript
	 * function analyzeColorSample(xyzMeasurement: XYZ) {
	 *   const luvColor = LUV.From(xyzMeasurement);
	 *
	 *   // Calculate perceptual metrics
	 *   const lightness = luvColor.L;
	 *   const chroma = Math.sqrt(luvColor.U * luvColor.U + luvColor.V * luvColor.V);
	 *   const hue = Math.atan2(luvColor.V, luvColor.U) * 180 / Math.PI;
	 *
	 *   // Compare to reference standard
	 *   const reference = LUV.From(referenceXYZ);
	 *   const deltaE = Math.sqrt(
	 *     Math.pow(luvColor.L - reference.L, 2) +
	 *     Math.pow(luvColor.U - reference.U, 2) +
	 *     Math.pow(luvColor.V - reference.V, 2)
	 *   );
	 *
	 *   return {
	 *     luv: luvColor,
	 *     lightness,
	 *     chroma,
	 *     hue,
	 *     deltaE,
	 *     withinTolerance: deltaE < 2.0
	 *   };
	 * }
	 * ```
	 */
	public static From(color: LCHuv | XYZ): LUV {
		if (color instanceof XYZ) return LUV.FromXYZ(color);
		if (color instanceof LCHuv) return LUV.FromLCHuv(color);
		throw new ColorError('Cannot convert to LUV');
	}

	/**
	 * Converts an XYZ color to LUV using the CIE-standardized transformation.
	 *
	 * This method implements the official CIE 1976 (L*u*v*) conversion algorithm,
	 * which transforms XYZ tristimulus values into the perceptually uniform LUV
	 * color space. The conversion uses D65 as the reference white point and applies
	 * the cube root transformation for lightness and the chromaticity-based
	 * calculation for the u* and v* opponent axes.
	 *
	 * @param color - The XYZ color to convert
	 * @returns A new LUV color instance with perceptually uniform coordinates
	 * @throws {ColorError} When the input XYZ color is invalid
	 */
	public static FromXYZ(color: XYZ): LUV {
		XYZ.Validate(color);

		// Create vector for color coordinates and reference white
		const colorVector: TVector3 = [color.X, color.Y, color.Z];
		const referenceVector: TVector3 = [XYZ.D65.X, XYZ.D65.Y, XYZ.D65.Z];

		// Calculate chromaticity denominators using vector operations
		const colorDenominator = colorVector[0] + (15 * colorVector[1]) + (3 * colorVector[2]);
		const referenceDenominator = referenceVector[0] + (15 * referenceVector[1]) + (3 * referenceVector[2]);

		// Calculate u' and v' chromaticity coordinates with safety checks
		const u1 = colorDenominator !== 0 ? (4 * colorVector[0]) / colorDenominator : 0;
		const v1 = colorDenominator !== 0 ? (9 * colorVector[1]) / colorDenominator : 0;

		// Calculate reference white chromaticity coordinates
		const ru = (4 * referenceVector[0]) / referenceDenominator;
		const rv = (9 * referenceVector[1]) / referenceDenominator;

		// Apply cube root transformation for lightness
		let y1 = colorVector[1] / 100;

		if (y1 > 0.008856) {
			y1 = Math.pow(y1, 1 / 3);
		} else {
			y1 = (7.787 * y1) + (16 / 116);
		}

		// Calculate final LUV coordinates
		const l = (116 * y1) - 16;
		const u = 13 * l * (u1 - ru);
		const v = 13 * l * (v1 - rv);

		return new LUV(l, u, v);
	}

	/**
	 * Converts an LCHuv color to LUV using polar-to-Cartesian coordinate transformation.
	 *
	 * This method transforms cylindrical LCHuv coordinates (Lightness, Chroma, Hue)
	 * into Cartesian LUV coordinates (L*, u*, v*), enabling direct mathematical
	 * operations such as interpolation, averaging, and Euclidean distance calculations.
	 * The transformation preserves the lightness component while converting the
	 * polar chroma and hue components into orthogonal u* and v* coordinates.
	 *
	 * @param color - The LCHuv color to convert in polar coordinates
	 * @returns A new LUV color instance with Cartesian coordinates
	 * @throws {ColorError} When the input LCHuv color is invalid
	 */
	public static FromLCHuv(color: LCHuv): LUV {
		LCHuv.Validate(color);

		const { L } = color;
		const u = color.C * Math.cos(color.H * Math.PI / 180);
		const v = color.C * Math.sin(color.H * Math.PI / 180);

		return new LUV(L, u, v);
	}

	/**
	 * Converts an LCHuv color to LUV using polar-to-Cartesian coordinate transformation.
	 *
	 * This method transforms cylindrical LCHuv coordinates (Lightness, Chroma, Hue)
	 * into Cartesian LUV coordinates (L*, u*, v*), enabling direct mathematical
	 * operations such as interpolation, averaging, and Euclidean distance calculations.
	 * The transformation preserves the lightness component while converting the
	 * polar chroma and hue components into orthogonal u* and v* coordinates.
	 *
	 * **Mathematical Process:**
	 * - L* component remains unchanged (lightness is identical in both spaces)
	 * - u* = C * cos(H°) where C is chroma and H is hue in degrees
	 * - v* = C * sin(H°) converting polar to Cartesian coordinates
	 * - Hue angle H is converted from degrees to radians for trigonometric functions
	 *
	 * **Coordinate System:**
	 * - Positive u* axis: Red/magenta direction (0° hue)
	 * - Positive v* axis: Yellow direction (90° hue)
	 * - Negative u* axis: Green direction (180° hue)
	 * - Negative v* axis: Blue direction (270° hue)
	 *
	 * @param color - The LCHuv color to convert in polar coordinates
	 * @returns A new LUV color instance with Cartesian coordinates
	 * @throws {ColorError} When the input LCHuv color is invalid
	 *
	 * @internal
	 *
	 * @example Color harmony and design calculations
	 * ```typescript
	 * // Convert complementary colors from polar to Cartesian
	 * const primaryLCH = new LCHuv(60, 50, 30);   // Orange-red in polar
	 * const primaryLUV = LUV.FromLCHuv(primaryLCH);
	 * console.log(primaryLUV.ToString()); // "LUV(60, 43.3, 25)"
	 *
	 * const complementaryLCH = new LCHuv(60, 50, 210); // Complement at +180°
	 * const complementaryLUV = LUV.FromLCHuv(complementaryLCH);
	 * console.log(complementaryLUV.ToString()); // "LUV(60, -43.3, -25)"
	 * ```
	 *
	 * @example Interpolation workflow with coordinate conversion
	 * ```typescript
	 * // Design workflow: polar design → Cartesian interpolation
	 * const startDesign = new LCHuv(40, 60, 120);  // Green-ish color
	 * const endDesign = new LCHuv(80, 40, 60);     // Orange-ish color
	 *
	 * // Convert to Cartesian for smooth interpolation
	 * const startLUV = LUV.FromLCHuv(startDesign);
	 * const endLUV = LUV.FromLCHuv(endDesign);
	 *
	 * // Linear interpolation in Cartesian space avoids hue discontinuities
	 * const midpointLUV = new LUV(
	 *   (startLUV.L + endLUV.L) / 2,
	 *   (startLUV.U + endLUV.U) / 2,
	 *   (startLUV.V + endLUV.V) / 2
	 * );
	 * ```
	 *
	 * @example Verification of coordinate transformation
	 * ```typescript
	 * // Verify round-trip conversion accuracy
	 * const originalLCH = new LCHuv(70, 45, 135); // Purple-pink
	 * const convertedLUV = LUV.FromLCHuv(originalLCH);
	 *
	 * // Manual calculation verification
	 * const expectedU = 45 * Math.cos(135 * Math.PI / 180); // ≈ -31.82
	 * const expectedV = 45 * Math.sin(135 * Math.PI / 180); // ≈ 31.82
	 * console.log(`Expected: LUV(70, ${expectedU.toFixed(2)}, ${expectedV.toFixed(2)})`);
	 * console.log(`Actual: ${convertedLUV.ToString()}`);
	 * ```
	 */
}
