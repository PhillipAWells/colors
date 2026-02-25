/* eslint-disable no-magic-numbers */
import { AssertInstanceOf, AssertNumber } from './assert.js';
import { TVector3, VectorSubtract } from '@pawells/math-extended';
import { ColorSpace } from './_color-space.js';
import { LCHab } from './lchab.js';
import { XYZ } from './xyz.js';
import { HCT } from './hct.js';
import { ColorSpaceManager } from './manager.js';
import { ColorError } from '../error.js';

type TLabComponentSelection = 'L' | 'A' | 'B';

/**
 * Represents a color in the CIE L*a*b* (CIELAB) color space.
 *
 * The CIE L*a*b* color space is designed to be perceptually uniform,
 * meaning equal changes in values should produce equal changes in
 * perceived color difference. It consists of three components:
 *
 * @remarks
 * CIELAB is particularly useful for:
 * - Color difference calculations (Delta E measurements)
 * - Device-independent color representation
 * - Color matching and quality control in printing and manufacturing
 * - Perceptual color manipulation and analysis
 * - Scientific color research and colorimetry
 *
 * Component Ranges and Meanings:
 * - L* (Lightness): [0, 100] where 0 = black and 100 = white
 * - a* (Green-Red): [-∞, +∞] typically [-128, +127] where negative = green, positive = red
 * - b* (Blue-Yellow): [-∞, +∞] typically [-128, +127] where negative = blue, positive = yellow
 *
 * The a* and b* axes are theoretically unbounded but practically constrained
 * by the gamut of real colors and the reference white point used.
 *
 * @example
 * ```typescript
 * // Create a neutral gray
 * const gray = new Lab(50, 0, 0);
 *
 * // Create a red color
 * const red = new Lab(53, 80, 67);
 *
 * // Create a green color
 * const green = new Lab(46, -51, 49);
 *
 * // Calculate color difference (requires Delta E function)
 * const deltaE = calculateDeltaE(red, green);
 *
 * // Convert to other color spaces
 * const xyz = red.ToXYZ();
 * const lchab = red.ToLCHab();
 * ```
 */
@ColorSpaceManager.Register({
	name: 'Lab',
	description: 'Represents a color in the CIE L*a*b* (CIELAB) color space.',
	converters: [
		'HCT',
		'XYZ',
		'LCHab',
	],
})
export class Lab extends ColorSpace {
	/**
	 * Internal array storing the LAB component values [L*, a*, b*].
	 * Values are floating-point numbers.
	 * @remarks
	 * - Index 0: L* (Lightness) component (0-100)
	 * - Index 1: a* (Green-Red) component (unbounded, typically -128 to +127)
	 * - Index 2: b* (Blue-Yellow) component (unbounded, typically -128 to +127)
	 *
	 * Direct access to this array should be avoided in favor of using the
	 * public L, a, and b properties which include proper validation where needed.
	 */
	protected override components: TVector3;

	/**
	 * Gets the Lightness (L*) component value (0-100).
	 *
	 * @remarks
	 * The L* component represents the perceived lightness of the color:
	 * - 0: Absolute black (no lightness)
	 * - 50: Medium gray (18% reflectance)
	 * - 100: Perfect white (100% reflectance)
	 *
	 * L* values correspond to human perception of lightness more accurately
	 * than linear luminance values, using a cube root function to match
	 * the non-linear response of human vision.
	 *
	 * @returns {number} The L* lightness value (0-100)
	 */
	public get L(): number {
		return this.components[0];
	}

	/**
	 * Sets the Lightness (L*) component value.
	 *
	 * @param value - The L* lightness value (typically 0-100)
	 *
	 * @remarks
	 * While L* values outside 0-100 are mathematically possible, they represent
	 * colors that cannot be displayed or printed. Most practical applications
	 * keep L* values within the 0-100 range.
	 *
	 * @example
	 * ```typescript
	 * const color = new Lab(50, 0, 0);
	 * color.L = 75; // Make lighter
	 * console.log(color.L); // 75
	 * ```
	 */
	public set L(value: number) {
		Lab._AssertComponent('L', value);
		this.components[0] = value;
	}	/**
	 * Gets the a* component value (green-red axis).
	 *
	 * @remarks
	 * The a* component represents the green-red color opponent dimension:
	 * - Negative values: Green direction (more green)
	 * - Zero: Neutral (no green or red bias)
	 * - Positive values: Red direction (more red)
	 *
	 * Typical range is approximately -128 to +127, though values outside
	 * this range are mathematically valid but may represent colors outside
	 * the gamut of real colorants or display devices.
	 *
	 * @returns {number} The a* green-red component value
	 */

	public get A(): number {
		return this.components[1];
	}

	/**
	 * Sets the a* component value (green-red axis).
	 *
	 * @param value - The a* green-red value to set
	 *
	 * @remarks
	 * Values are unbounded but typically fall within -128 to +127 for
	 * real-world colors. Extreme values may represent colors that cannot
	 * be reproduced by physical colorants or display technologies.
	 *
	 * @example
	 * ```typescript
	 * const color = new Lab(50, 0, 0);
	 * color.A = 30; // Add red component
	 * color.A = -20; // Add green component instead
	 * ```
	 */
	public set A(value: number) {
		Lab._AssertComponent('A', value);
		this.components[1] = value;
	}

	/**
	 * Gets the b* component value (blue-yellow axis).
	 *
	 * @remarks
	 * The b* component represents the blue-yellow color opponent dimension:
	 * - Negative values: Blue direction (more blue)
	 * - Zero: Neutral (no blue or yellow bias)
	 * - Positive values: Yellow direction (more yellow)
	 *
	 * Typical range is approximately -128 to +127, though values outside
	 * this range are mathematically valid but may represent colors outside
	 * the gamut of real colorants or display devices.
	 *
	 * @returns {number} The b* blue-yellow component value
	 */
	public get B(): number {
		return this.components[2];
	}

	/**
	 * Sets the b* component value (blue-yellow axis).
	 *
	 * @param value - The b* blue-yellow value to set
	 *
	 * @remarks
	 * Values are unbounded but typically fall within -128 to +127 for
	 * real-world colors. Extreme values may represent colors that cannot
	 * be reproduced by physical colorants or display technologies.
	 *
	 * @example
	 * ```typescript
	 * const color = new Lab(50, 0, 0);
	 * color.B = 25; // Add yellow component
	 * color.B = -15; // Add blue component instead
	 * ```
	 */
	public set B(value: number) {
		Lab._AssertComponent('B', value);
		this.components[2] = value;
	}

	/**
	 * Creates a new Lab color instance.
	 *
	 * @param l - Lightness component (0-100, default: 0)
	 * @param a - Green-red component (unbounded, typically -128 to +127, default: 0)
	 * @param b - Blue-yellow component (unbounded, typically -128 to +127, default: 0)
	 * @throws {ColorError} When validation fails for invalid component values
	 *
	 * @remarks
	 * The constructor creates a new Lab color and validates the input parameters.
	 * While a* and b* values are theoretically unbounded, practical applications
	 * typically use values within the -128 to +127 range.
	 *
	 * @example
	 * ```typescript
	 * // Create a neutral gray
	 * const gray = new Lab(50, 0, 0);
	 *
	 * // Create a red color
	 * const red = new Lab(53, 80, 67);
	 *
	 * // Create a pure white
	 * const white = new Lab(100, 0, 0);
	 *
	 * // Create default black color
	 * const black = new Lab(); // Lab(0, 0, 0)
	 * ```
	 */
	constructor(l: number = 0, a: number = 0, b: number = 0) {
		super();
		this.components = [0, 0, 0]; // Initialize with defaults
		// Use setters to validate component values
		this.L = l;
		this.A = a;
		this.B = b;
	}	/**
	 * Returns a string representation of the Lab color.
	 *
	 * @param format - Output format: 'float' (default) for decimal values or 'int' for scaled integer values
	 * @returns A string in the format "Lab(L, a, b)"
	 *
	 * @remarks
	 * The format parameter controls the output representation:
	 * - 'float' (default): Shows actual decimal values (e.g., "Lab(53.2, 80.1, 67.2)")
	 * - 'int': Shows rounded L and scaled a/b values (e.g., "Lab(53, 103, 86)")
	 *
	 * In 'int' format, a and b values are multiplied by 128 to convert from
	 * the typical -1 to +1 range to -128 to +127 range commonly used in 8-bit representations.
	 *
	 * @example
	 * ```typescript
	 * const color = new Lab(53.2, 0.625, 0.525);
	 *
	 * console.log(color.ToString()); // "Lab(53.2, 0.625, 0.525)"
	 * console.log(color.ToString('float')); // "Lab(53.2, 0.625, 0.525)"
	 * console.log(color.ToString('int')); // "Lab(53, 80, 67)"
	 * ```
	 */

	public override ToString(format?: 'float' | 'int'): string {
		if (format === undefined || format === 'float') {
			return `Lab(${this.L}, ${this.A}, ${this.B})`;
		}

		const l = Math.round(this.L);
		const a = Math.round(this.A * 128);
		const b = Math.round(this.B * 128);

		return `Lab(${l}, ${a}, ${b})`;
	}

	/**
	 * Type guard assertion function that validates if a value is an instance of Lab.
	 * Throws a TypeError if the provided value is not an Lab instance.
	 *
	 * @param c - The value to validate as an Lab instance
	 * @throws {TypeError} When the value is not an instance of Lab
	 *
	 * @example
	 * ```typescript
	 * const value: unknown = getColorFromSomewhere();
	 * Lab.Assert(value); // value is now typed as Lab
	 * console.log(value.L, value.a, value.b); // Safe to use Lab properties
	 * ```
	 */	public static override Assert(color: unknown): asserts color is Lab {
		AssertInstanceOf(color, Lab, { class: ColorError, message: 'Not a Lab Color' });
		const labColor = color as Lab;
		Lab._AssertComponent('L', labColor);
		Lab._AssertComponent('A', labColor);
		Lab._AssertComponent('B', labColor);
	}

	/**
	 * Validates that an object is a valid Lab color.
	 *
	 * @param color - The object to validate as a Lab instance
	 * @returns True if the object is a valid Lab color, false otherwise
	 *
	 * @remarks
	 * This method performs the same validation as Assert() but returns a boolean
	 * instead of throwing an error. It's useful for conditional logic where
	 * you need to check validity without exception handling.
	 *
	 * Validation includes:
	 * - Instance type check (must be Lab)
	 * - L component must be 0-100 and finite
	 * - a and b components must be finite numbers (unbounded)
	 *
	 * @example
	 * ```typescript
	 * const maybeLab: unknown = getSomeValue();
	 * if (Lab.Validate(maybeLab)) {
	 *   console.log('Valid Lab color');
	 * } else {
	 *   console.log('Invalid Lab color');
	 * }
	 * ```
	 */
	public static override Validate(color: unknown): boolean {
		try {
			Lab.Assert(color);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Creates a Lab color from another color space.
	 *
	 * @param color - The source color to convert from (LCHab or XYZ)
	 * @returns A new Lab color instance
	 * @throws {ColorError} When the source color type is not supported
	 *
	 * @remarks
	 * This method acts as a dispatcher to the appropriate conversion method
	 * based on the type of the input color. Currently supports:
	 * - LCHab to Lab conversion (cylindrical to rectangular coordinates)
	 * - XYZ to Lab conversion (using CIE standard transformation)
	 *
	 * @example
	 * ```typescript
	 * // Convert from XYZ
	 * const xyz = new XYZ(0.25, 0.20, 0.15);
	 * const labFromXyz = Lab.From(xyz);
	 *
	 * // Convert from LCHab
	 * const lchab = new LCHab(50, 25, 45);
	 * const labFromLchab = Lab.From(lchab);
	 * ```
	 */
	public static From(color: LCHab | XYZ | HCT | ColorSpace): Lab {
		if (color instanceof LCHab) return Lab.FromLCHab(color);
		if (color instanceof XYZ) return Lab.FromXYZ(color);
		if (color instanceof HCT) return Lab.FromHCT(color);
		throw new ColorError('Cannot convert to Lab');
	}

	/**
	 * Converts an XYZ color to Lab.
	 * @param color - The XYZ color to convert.
	 * @returns A new Lab color instance.
	 */
	public static FromXYZ(color: XYZ): Lab {
		XYZ.Validate(color);

		// Constants for XYZ to Lab conversion (D65 white point)
		const EPSILON = 0.008856; // 216/24389
		const KAPPA = 7.787; // Slope for linear portion
		const THRESHOLD = 16 / 116; // Threshold for linear vs cubic transformation

		// Reference white point (D65)
		const XN = 95.047;
		const YN = 100.0;
		const ZN = 108.883;

		// Normalize XYZ values by reference white
		const xr = color.X / XN;
		const yr = color.Y / YN;
		const zr = color.Z / ZN;

		// Apply companding function
		const fx = xr > EPSILON ? Math.cbrt(xr) : (KAPPA * xr) + THRESHOLD;
		const fy = yr > EPSILON ? Math.cbrt(yr) : (KAPPA * yr) + THRESHOLD;
		const fz = zr > EPSILON ? Math.cbrt(zr) : (KAPPA * zr) + THRESHOLD;

		// Calculate Lab components
		const L = (116 * fy) - 16;
		const a = 500 * (fx - fy);
		const b = 200 * (fy - fz);

		return new Lab(L, a, b);
	}

	/**
	 * Converts an LCHab color to Lab.
	 * @param color - The LCHab color to convert.
	 * @returns A new Lab color instance.
	 */
	public static FromLCHab(color: LCHab): Lab {
		LCHab.Validate(color);

		const l = color.L;
		const a = color.C * Math.cos(color.H * Math.PI / 180);
		const b = color.C * Math.sin(color.H * Math.PI / 180);

		return new Lab(l, a, b);
	}

	/**
	 * Converts an HCT color to Lab.
	 * @param color - The HCT color to convert.
	 * @returns A new Lab color instance.
	 */
	public static FromHCT(color: HCT): Lab {
		// Convert HCT to RGB then to XYZ then to Lab
		const rgb = color.ToRGB();
		const xyz = XYZ.FromRGB(rgb);
		return Lab.FromXYZ(xyz);
	}

	/**
	 * Converts an XYZ color to Lab using the CIE standard transformation.
	 * @param color - The XYZ color to convert.
	 * @returns A new Lab color instance.
	 */
	/**
	 * Converts an LCHab color to Lab using polar to Cartesian coordinate transformation.
	 *
	 * @param color - The LCHab color to convert
	 * @returns A new Lab color instance
	 *
	 * @remarks	 * This conversion transforms from polar coordinates (LCH) to
	 * Cartesian coordinates (Lab) using the standard mathematical relationships:
	 *
	 * - L* remains unchanged (lightness is the same in both spaces)
	 * - a* = C* × cos(H°) where C* is chroma and H° is hue in degrees
	 * - b* = C* × sin(H°) where the hue angle is converted to radians
	 *
	 * This is the inverse of the Lab to LCHab conversion and allows
	 * for round-trip conversions without loss of precision.
	 *
	 * @example
	 * ```typescript
	 * const lchab = new LCHab(50, 25, 45); // L=50, C=25, H=45°
	 * const lab = Lab.FromLCHab(lchab);
	 * console.log(lab.L); // 50 (unchanged)
	 * console.log(lab.a); // ~17.68 (25 * cos(45°))
	 * console.log(lab.b); // ~17.68 (25 * sin(45°))
	 * ```
	 */
	/**
	 * Calculates the color difference (Delta E CIE 1976) between this Lab color and another.
	 *
	 * @param other - The other Lab color to compare against
	 * @returns The Delta E CIE76 value (0 = identical colors, higher = more different)
	 *
	 * @remarks
	 * Delta E CIE 1976 is the simplest color difference formula, calculated as
	 * the Euclidean distance in Lab space:
	 *
	 * ΔE*76 = √[(ΔL*)² + (Δa*)² + (Δb*)²]
	 *
	 * Interpretation guidelines:
	 * - 0-1: Not perceptible by human eyes
	 * - 1-2: Perceptible through close observation
	 * - 2-10: Perceptible at a glance
	 * - 11-49: Colors are more similar than opposite
	 * - 100: Colors are exact opposite
	 *
	 * @example
	 * ```typescript
	 * const red = new Lab(53, 80, 67);
	 * const pink = new Lab(70, 30, 20);
	 * const deltaE = red.DeltaE76(pink);
	 * console.log(`Color difference: ${deltaE.toFixed(2)}`);
	 * ```
	 */
	public DeltaE76(other: Lab): number {
		Lab.Assert(other);

		// Delta E CIE 1976 is simply the Euclidean distance in Lab space
		const deltaL = this.L - other.L;
		const deltaA = this.A - other.A;
		const deltaB = this.B - other.B;

		return Math.sqrt((deltaL * deltaL) + (deltaA * deltaA) + (deltaB * deltaB));
	}

	/**
	 * Calculates the color difference (Delta E CIE 1994) between this Lab color and another.
	 * @param other - The other Lab color to compare against
	 * @param textiles - Whether to use textiles weighting factors (default: false)
	 * @returns The Delta E CIE94 value
	 */
	public DeltaE94(other: Lab, textiles: boolean = false): number {
		Lab.Assert(other);

		const deltaL = this.L - other.L;
		const deltaA = this.A - other.A;
		const deltaB = this.B - other.B;

		const c1 = Math.sqrt((this.A * this.A) + (this.B * this.B));
		const c2 = Math.sqrt((other.A * other.A) + (other.B * other.B));
		const deltaC = c1 - c2;

		const deltaH = Math.sqrt((deltaA * deltaA) + (deltaB * deltaB) - (deltaC * deltaC));

		const kL = textiles ? 2 : 1;
		const kC = 1;
		const kH = 1;
		const k1 = textiles ? 0.048 : 0.045;
		const k2 = textiles ? 0.014 : 0.015;

		const sL = 1;
		const sC = 1 + (k1 * c1);
		const sH = 1 + (k2 * c1);

		const lTerm = deltaL / (kL * sL);
		const cTerm = deltaC / (kC * sC);
		const hTerm = deltaH / (kH * sH);

		return Math.sqrt((lTerm * lTerm) + (cTerm * cTerm) + (hTerm * hTerm));
	}

	/**
	 * Calculates the color difference (Delta E CIE 2000) between this Lab color and another.
	 *
	 * @param other - The other Lab color to compare against
	 * @returns The Delta E CIE2000 value (0 = identical colors, higher = more different)
	 *
	 * @remarks
	 * Delta E CIE 2000 (CIEDE2000) is the most sophisticated and accurate color
	 * difference formula available. It addresses several limitations of previous
	 * formulas and provides the best correlation with visual perception.
	 *
	 * Key improvements over CIE94:
	 * - Better performance for blue colors
	 * - Improved handling of gray colors
	 * - Better correlation with visual assessment
	 * - Rotation term for blue region
	 * - Interactive term between chroma and hue differences
	 *
	 * The formula is complex but provides industry-standard accuracy for:
	 * - Quality control in printing and manufacturing
	 * - Color matching applications
	 * - Scientific color research
	 * - Professional color grading
	 *
	 * @example
	 * ```typescript
	 * const color1 = new Lab(50, 2.5, -25);
	 * const color2 = new Lab(50, 0, -25);
	 * const deltaE2000 = color1.DeltaE2000(color2);
	 * console.log(`CIEDE2000: ${deltaE2000.toFixed(2)}`);
	 * ```
	 */
	public DeltaE2000(other: Lab): number {
		Lab.Assert(other);

		// Use vector operations for initial component extraction
		const thisVector: TVector3 = [this.L, this.A, this.B];
		const otherVector: TVector3 = [other.L, other.A, other.B];

		const [l1, a1, b1] = thisVector;
		const [l2, a2, b2] = otherVector;

		// Calculate chroma values using vector operations for a*b* components
		const thisChromaVector: TVector3 = [0, a1, b1];
		const otherChromaVector: TVector3 = [0, a2, b2];

		const c1 = Math.sqrt((thisChromaVector[1] * thisChromaVector[1]) + (thisChromaVector[2] * thisChromaVector[2]));
		const c2 = Math.sqrt((otherChromaVector[1] * otherChromaVector[1]) + (otherChromaVector[2] * otherChromaVector[2]));
		const cMean = (c1 + c2) / 2;

		// Calculate a' values with chroma correction
		const g = 0.5 * (1 - Math.sqrt(Math.pow(cMean, 7) / (Math.pow(cMean, 7) + Math.pow(25, 7))));
		const a1Prime = a1 * (1 + g);
		const a2Prime = a2 * (1 + g);

		// Recalculate chroma with corrected a' values using vector operations
		const correctedChroma1Vector: TVector3 = [0, a1Prime, b1];
		const correctedChroma2Vector: TVector3 = [0, a2Prime, b2];

		const c1Prime = Math.sqrt((correctedChroma1Vector[1] * correctedChroma1Vector[1]) + (correctedChroma1Vector[2] * correctedChroma1Vector[2]));
		const c2Prime = Math.sqrt((correctedChroma2Vector[1] * correctedChroma2Vector[1]) + (correctedChroma2Vector[2] * correctedChroma2Vector[2]));

		// Calculate hue angles in degrees
		const h1Prime = Math.atan2(b1, a1Prime) * 180 / Math.PI;
		const h2Prime = Math.atan2(b2, a2Prime) * 180 / Math.PI;

		// Ensure hue values are positive
		const h1PrimeNorm = h1Prime < 0 ? h1Prime + 360 : h1Prime;
		const h2PrimeNorm = h2Prime < 0 ? h2Prime + 360 : h2Prime;

		// Calculate differences using vector operations
		const deltaVector = VectorSubtract(otherVector, thisVector);
		const [deltaL] = deltaVector;
		const deltaC = c2Prime - c1Prime;

		// Calculate hue difference
		let deltaH: number;
		const absDeltaH = Math.abs(h2PrimeNorm - h1PrimeNorm);
		if (c1Prime * c2Prime === 0) {
			deltaH = 0;
		} else if (absDeltaH <= 180) {
			deltaH = h2PrimeNorm - h1PrimeNorm;
		} else if (h2PrimeNorm > h1PrimeNorm) {
			deltaH = h2PrimeNorm - h1PrimeNorm - 360;
		} else {
			deltaH = h2PrimeNorm - h1PrimeNorm + 360;
		}

		const deltaHPrime = 2 * Math.sqrt(c1Prime * c2Prime) * Math.sin(deltaH * Math.PI / 360);

		// Calculate mean values
		const lMean = (l1 + l2) / 2;
		const cMeanPrime = (c1Prime + c2Prime) / 2;

		let hMeanPrime: number;
		if (c1Prime * c2Prime === 0) {
			hMeanPrime = h1PrimeNorm + h2PrimeNorm;
		} else if (absDeltaH <= 180) {
			hMeanPrime = (h1PrimeNorm + h2PrimeNorm) / 2;
		} else if (h1PrimeNorm + h2PrimeNorm < 360) {
			hMeanPrime = (h1PrimeNorm + h2PrimeNorm + 360) / 2;
		} else {
			hMeanPrime = (h1PrimeNorm + h2PrimeNorm - 360) / 2;
		}		// Calculate weighting functions
		const term1 = 0.17 * Math.cos((hMeanPrime - 30) * Math.PI / 180);
		const term2 = 0.24 * Math.cos(2 * hMeanPrime * Math.PI / 180);
		const term3 = 0.32 * Math.cos(((3 * hMeanPrime) + 6) * Math.PI / 180);
		const term4 = 0.20 * Math.cos(((4 * hMeanPrime) - 63) * Math.PI / 180);
		const t = 1 - term1 + term2 + term3 - term4;

		const deltaTheta = 30 * Math.exp(-Math.pow((hMeanPrime - 275) / 25, 2));

		const rc = 2 * Math.sqrt(Math.pow(cMeanPrime, 7) / (Math.pow(cMeanPrime, 7) + Math.pow(25, 7)));
		const sl = 1 + ((0.015 * Math.pow(lMean - 50, 2)) / Math.sqrt(20 + Math.pow(lMean - 50, 2)));
		const sc = 1 + (0.045 * cMeanPrime);
		const sh = 1 + (0.015 * cMeanPrime * t);

		const rt = -Math.sin(2 * deltaTheta * Math.PI / 180) * rc;

		// Calculate final Delta E 2000
		const deltaLTerm = deltaL / sl;
		const deltaCTerm = deltaC / sc;
		const deltaHTerm = deltaHPrime / sh;

		return Math.sqrt((deltaLTerm * deltaLTerm) + (deltaCTerm * deltaCTerm) + (deltaHTerm * deltaHTerm) + (rt * deltaCTerm * deltaHTerm));
	}

	private static _AssertComponent(component: TLabComponentSelection, color: Lab): void;
	private static _AssertComponent(component: TLabComponentSelection, value: number): void;
	private static _AssertComponent(component: TLabComponentSelection, colorOrValue: Lab | number): void {
		switch (component) {
			case 'L': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.L;
				AssertNumber(value, { finite: true, gte: 0, lte: 100 }, { class: ColorError, message: 'Channel(L) must be in range [0, 100].' });
				break;
			}
			case 'A': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.A;
				AssertNumber(value, { finite: true }, { class: ColorError, message: 'Channel(a) must be a finite number.' });
				break;
			}
			case 'B': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.B;
				AssertNumber(value, { finite: true }, { class: ColorError, message: 'Channel(b) must be a finite number.' });
				break;
			}
		}
	}

	/**
	 * Asserts that an object is a valid Lab color instance.
	 * @param color - The color to assert as Lab
	 * @throws {TypeError} When the object is not a Lab instance
	 * @throws {ColorError} When component values are invalid
	 *
	 * @remarks
	 * This method provides both runtime validation and TypeScript type narrowing.
	 * After calling this method, TypeScript will treat the parameter as a Lab instance.
	 * Validation ensures all components are within proper ranges and finite.
	 *
	 * @example
	 * ```typescript
	 * const value: unknown = getColorFromSomewhere();
	 * Lab.Assert(value); // value is now typed as Lab
	 * console.log(value.L, value.a, value.b); // Safe to use Lab properties
	 * ```
	 */
}
