/* eslint-disable no-magic-numbers */
import { DegreesToRadians, IMatrix3, TVector3, MatrixMultiply, MatrixInverse, VectorDot, VectorMultiply } from '@pawells/math-extended';
import { AssertInstanceOf, AssertNumber } from './assert.js';
import { ColorSpace } from './_color-space.js';
import { CAM16ViewingConditions } from './cam16-viewing-conditions.js';
import { CAM16 } from './cam16.js';
import { HunterLab } from './hunterlab.js';
import { Lab } from './lab.js';
import { LMS } from './lms.js';
import { LUV } from './luv.js';
import { RGB } from './rgb.js';
import { XyY } from './xyy.js';
import { ColorSpaceManager } from './manager.js';
import { ColorError } from '../error.js';

type TXYZComponentSelection = 'X' | 'Y' | 'Z';
import { HCT } from './hct.js';

/**
 * Represents a color in the CIE XYZ color space.
 *
 * The CIE XYZ color space is one of the first mathematically defined color spaces,
 * created by the International Commission on Illumination (CIE) in 1931. It serves as:
 * - A device-independent reference color space
 * - The foundation for most other color spaces
 * - A bridge between physical light measurements and perceived colors
 * - The basis for colorimetric calculations and color difference measurements
 *
 * @remarks
 * XYZ is particularly important because:
 * - It's based on human color vision research and the CIE standard observer
 * - It provides a "universal translator" between different color spaces
 * - Y component directly corresponds to luminance (perceived brightness)
 * - It enables accurate color reproduction across different devices and media
 * - Most color science calculations use XYZ as an intermediate step
 *
 * Component Meanings:
 * - X: Roughly corresponds to red stimulation (but not exactly red)
 * - Y: Luminance component (brightness) - matches human sensitivity
 * - Z: Roughly corresponds to blue stimulation (but not exactly blue)
 *
 * All components are positive values, typically in the range 0-100+ for common colors,
 * though values can exceed 100 for very bright or highly saturated colors.
 *
 * @example
 * ```typescript
 * // Create a white color using D65 illuminant
 * const white = XYZ.D65;
 * console.log(white.Y); // 100 (full luminance)
 *
 * // Create a custom color
 * const color = new XYZ(25.5, 30.2, 15.8);
 *
 * // Convert to other color spaces
 * const rgb = color.ToRGB();
 * const lab = color.ToLab();
 * const luv = color.ToLUV();
 *
 * // Use for color calculations
 * const luminance = color.Y; // Direct luminance access
 * ```
 */
@ColorSpaceManager.Register({
	name: 'XYZ',
	description: 'Represents a color in the CIE XYZ color space.',
	converters: [
		'CAM16',
		'HCT',
		'HunterLab',
		'Lab',
		'LMS',
		'LUV',
		'RGB',
		'XyY',
	],
})
export class XYZ extends ColorSpace {	/**
	 * Standard D65 illuminant as an XYZ reference white point.
	 *
	 * @remarks
	 * D65 represents a standard daylight with a correlated color temperature of 6504K,
	 * commonly used as a reference point for color calculations including:
	 * - White point for color temperature conversions
	 * - Reference illuminant for Lab color space conversions
	 * - Standard for sRGB color space definition
	 * - Basis for chromatic adaptation calculations
	 *
	 * The values (95.047, 100, 108.883) represent the XYZ coordinates
	 * of the perfect reflecting diffuser under D65 illumination.
	 *
	 * @returns {XYZ} The D65 reference white point
	 *
	 * @example
	 * ```typescript
	 * const whitePoint = XYZ.D65;
	 * console.log(whitePoint.X); // 95.047
	 * console.log(whitePoint.Y); // 100.000
	 * console.log(whitePoint.Z); // 108.883
	 *
	 * // Use for chromatic adaptation
	 * const adaptedColor = adaptToWhitePoint(someColor, XYZ.D65);
	 * ```
	 */
	public static get D65(): XYZ {
		return new XYZ(95.047, 100, 108.883);
	}

	/**
	 * Internal array storing the XYZ component values [X, Y, Z].
	 * Values are normalized floating-point numbers.
	 * - Index 0: X component (roughly red-related)
	 * - Index 1: Y component (luminance)
	 * - Index 2: Z component (roughly blue-related)
	 *
	 * Direct access to this array should be avoided in favor of using the
	 * public X, Y, and Z properties which include proper validation.
	 */
	protected override components: [number, number, number];

	/**
	 * Gets the X component value (0+).
	 *
	 * @remarks
	 * The X component loosely corresponds to the red-sensitive response
	 * but is not directly equivalent to red color. It represents the
	 * magnitude of the stimulus that would be seen by the long-wavelength
	 * cone cells in human vision.
	 *
	 * X values are always non-negative and typically range from 0 to 95+
	 * for common colors, though brighter or more saturated colors can
	 * exceed this range.
	 *
	 * @returns {number} The X component value (0 or positive)
	 */
	public get X(): number {
		return this.components[0];
	}

	/**
	 * Sets the X component value.
	 *
	 * @param value - The X value to set (must be non-negative and finite)
	 * @throws {ColorError} When value is negative, NaN, or infinite
	 *
	 * @remarks
	 * Performs strict validation to ensure color integrity:
	 * - Checks for NaN and infinite values
	 * - Enforces non-negative values (X cannot be negative)
	 * - Throws descriptive errors for invalid values
	 *
	 * @example
	 * ```typescript
	 * const color = new XYZ(50, 60, 70);
	 * color.X = 25.5; // Set new X value
	 * console.log(color.X); // 25.5
	 * ```
	 */
	public set X(value: number) {
		XYZ._AssertComponent('X', value);
		this.components[0] = value;
	}

	/**
	 * Gets the Y component value (0+).
	 *
	 * @remarks
	 * The Y component represents the luminance (brightness) of the color	 * and directly corresponds to human perception of brightness. This is
	 * the most important component for many color calculations because:
	 *
	 * - It matches the luminosity function of human vision
	 * - Used directly in contrast ratio calculations
	 * - Basis for gamma correction and display calibration
	 * - Key component in many color difference formulas
	 *
	 * Y values typically range from 0 (black) to 100 (reference white),
	 * though values can exceed 100 for very bright light sources.
	 *
	 * @returns {number} The Y luminance component value (0 or positive)
	 */
	public get Y(): number {
		return this.components[1];
	}

	/**
	 * Sets the Y component value.
	 *
	 * @param value - The Y luminance value to set (must be non-negative and finite)
	 * @throws {ColorError} When value is negative, NaN, or infinite
	 *
	 * @remarks
	 * Performs strict validation to ensure color integrity:
	 * - Checks for NaN and infinite values
	 * - Enforces non-negative values (Y cannot be negative)
	 * - Throws descriptive errors for invalid values
	 *
	 * Since Y represents luminance, setting it to 0 creates pure black,
	 * while values around 100 represent very bright colors.
	 *
	 * @example
	 * ```typescript
	 * const color = new XYZ(50, 60, 70);
	 * color.Y = 80; // Increase brightness	 * console.log(color.Y); // 80
	 *
	 * // Create black by setting Y to 0
	 * color.Y = 0;
	 * ```
	 */
	public set Y(value: number) {
		XYZ._AssertComponent('Y', value);
		this.components[1] = value;
	}

	/**
	 * Gets the Z component value (0+).
	 *
	 * @remarks
	 * The Z component loosely corresponds to the blue-sensitive response
	 * but is not directly equivalent to blue color. It represents the
	 * magnitude of the stimulus that would be seen by the short-wavelength
	 * cone cells in human vision.
	 *
	 * Z values are always non-negative and typically range from 0 to 108+
	 * for common colors (note: D65 white point has Z=108.883), though
	 * brighter or more saturated colors can exceed this range.
	 *
	 * @returns {number} The Z component value (0 or positive)
	 */
	public get Z(): number {
		return this.components[2];
	}

	/**
	 * Sets the Z component value.
	 *
	 * @param value - The Z value to set (must be non-negative and finite)
	 * @throws {ColorError} When value is negative, NaN, or infinite
	 *
	 * @remarks
	 * Performs strict validation to ensure color integrity:
	 * - Checks for NaN and infinite values
	 * - Enforces non-negative values (Z cannot be negative)
	 * - Throws descriptive errors for invalid values
	 *
	 * @example
	 * ```typescript
	 * const color = new XYZ(50, 60, 70);
	 * color.Z = 85.5; // Set new Z value
	 * console.log(color.Z); // 85.5
	 * ```
	 */
	public set Z(value: number) {
		XYZ._AssertComponent('Z', value);
		this.components[2] = value;
	}

	/**
	 * Creates a new XYZ color instance.
	 *
	 * @param x - X component (0 or positive, default: 0)
	 * @param y - Y component representing luminance (0 or positive, default: 0)
	 * @param z - Z component (0 or positive, default: 0)
	 * @throws {ColorError} When any component value is invalid
	 *
	 * @remarks
	 * The constructor validates all input parameters to ensure they are:
	 * - Non-negative (XYZ components cannot be negative)
	 * - Finite numbers (no NaN or infinity values)
	 * - Properly formed for color calculations
	 *
	 * Component ranges are theoretically unbounded but typically:
	 * - X: 0 to ~95 for standard colors
	 * - Y: 0 to 100+ (luminance, where 100 is reference white)
	 * - Z: 0 to ~108 for standard colors
	 *
	 * @example
	 * ```typescript
	 * // Create a black color (all zeros)
	 * const black = new XYZ(); // XYZ(0, 0, 0)
	 *
	 * // Create the D65 white reference
	 * const white = new XYZ(95.047, 100, 108.883);
	 *
	 * // Create a custom color
	 * const color = new XYZ(25.5, 30.2, 15.8);
	 *
	 * // Create a bright color (Y > 100)
	 * const bright = new XYZ(120, 150, 135);
	 * ```
	 */
	constructor(x: number = 0, y: number = 0, z: number = 0) {
		super();
		this.components = [0, 0, 0]; // Initialize to defaults
		this.X = x; // Use setters for validation
		this.Y = y;
		this.Z = z;
	}

	/**
	 * Returns a string representation of the XYZ color.
	 *
	 * @returns A string in the format "XYZ(X, Y, Z)"
	 *
	 * @remarks
	 * The string representation shows the exact floating-point values
	 * for all three components, making it suitable for debugging,
	 * logging, and displaying precise color values.
	 *
	 * @example
	 * ```typescript
	 * const color = new XYZ(25.047, 30.123, 15.456);
	 * console.log(color.ToString()); // "XYZ(25.047, 30.123, 15.456)"
	 *
	 * const white = XYZ.D65;
	 * console.log(white.ToString()); // "XYZ(95.047, 100, 108.883)"
	 * ```
	 */
	public override ToString(): string {
		return `XYZ(${this.X}, ${this.Y}, ${this.Z})`;
	}

	/**
	 * Type guard assertion function that validates if a value is an instance of XYZ.
	 * Throws a ColorError if the provided value is not a XYZ instance.
	 *
	 * @param color - The value to validate as a XYZ instance
	 * @throws {ColorError} When the value is not an instance of XYZ
	 *
	 * @example
	 * ```typescript
	 * const value: unknown = getColorFromSomewhere();
	 * XYZ.Assert(value); // value is now typed as XYZ
	 * console.log(value.X, value.Y, value.Z); // Safe to use XYZ properties
	 * ```
	 */
	public static override Assert(color: unknown): asserts color is XYZ {
		AssertInstanceOf(color, XYZ, { class: ColorError, message: 'Not a XYZ Color' });
		XYZ._AssertComponent('X', color);
		XYZ._AssertComponent('Y', color);
		XYZ._AssertComponent('Z', color);
	}

	private static _AssertComponent(component: TXYZComponentSelection, color: XYZ): void;
	private static _AssertComponent(component: TXYZComponentSelection, value: number): void;
	private static _AssertComponent(component: TXYZComponentSelection, colorOrValue: XYZ | number): void {
		switch (component) {
			case 'X': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.X;
				AssertNumber(value, { gte: 0, finite: true }, { class: ColorError, message: 'Channel(X) must be a non-negative finite number.' });
				break;
			}
			case 'Y': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.Y;
				AssertNumber(value, { gte: 0, finite: true }, { class: ColorError, message: 'Channel(Y) must be a non-negative finite number.' });
				break;
			}
			case 'Z': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.Z;
				AssertNumber(value, { gte: 0, finite: true }, { class: ColorError, message: 'Channel(Z) must be a non-negative finite number.' });
				break;
			}
		}
	}

	/**
	 * Validates that an object is a valid XYZ color.
	 *
	 * @param color - The object to validate as an XYZ instance
	 * @returns True if the object is a valid XYZ color, false otherwise
	 *
	 * @remarks
	 * This method performs the same validation as Assert() but returns a boolean
	 * instead of throwing an error. It's useful for conditional logic where
	 * you need to check validity without exception handling.
	 *
	 * Validation includes:
	 * - Instance type check (must be XYZ)
	 * - All components (X, Y, Z) must be non-negative and finite
	 *
	 * @example
	 * ```typescript
	 * const maybeXYZ: unknown = getSomeValue();
	 * if (XYZ.Validate(maybeXYZ)) {
	 *   console.log('Valid XYZ color');
	 * } else {
	 *   console.log('Invalid XYZ color');
	 * }
	 * ```
	 */
	public static override Validate(color: unknown): boolean {
		try {
			XYZ.Assert(color);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Creates an XYZ color from another color space.
	 *
	 * @param color - The source color to convert from (CAM16, HunterLab, Lab, LMS, LUV, RGB, or XyY)
	 * @returns A new XYZ color instance
	 * @throws {ColorError} When the source color type is not supported
	 *
	 * @remarks
	 * This method acts as a dispatcher to the appropriate conversion method
	 * based on the type of the input color. XYZ serves as a central hub
	 * in the color conversion system, as most color spaces can be converted
	 * to and from XYZ using well-defined mathematical transformations.
	 *
	 * Supported conversions:
	 * - CAM16 → XYZ (color appearance model to tristimulus)
	 * - HunterLab → XYZ (alternative Lab space to tristimulus)
	 * - Lab → XYZ (perceptual uniform space to tristimulus)
	 * - LMS → XYZ (cone response space to tristimulus)
	 * - LUV → XYZ (perceptual uniform space to tristimulus)
	 * - RGB → XYZ (additive color to tristimulus)
	 * - XyY → XYZ (chromaticity coordinates to tristimulus)
	 *
	 * @example
	 * ```typescript
	 * // Convert from RGB
	 * const rgb = new RGB(1, 0.5, 0);
	 * const xyzFromRgb = XYZ.From(rgb);
	 *
	 * // Convert from Lab
	 * const lab = new Lab(50, 25, -25);
	 * const xyzFromLab = XYZ.From(lab);
	 *
	 * // Convert from XyY chromaticity
	 * const xyy = new XyY(0.3127, 0.3290, 100);
	 * const xyzFromXyY = XYZ.From(xyy);
	 * ```
	 */
	public static From(color: CAM16 | HunterLab | Lab | LMS | LUV | RGB | XyY | HCT | ColorSpace): XYZ {
		if (color instanceof CAM16) return XYZ.FromCAM16(color);
		if (color instanceof HunterLab) return XYZ.FromHunterLab(color);
		if (color instanceof Lab) return XYZ.FromLab(color);
		if (color instanceof LMS) return XYZ.FromLMS(color);
		if (color instanceof LUV) return XYZ.FromLUV(color);
		if (color instanceof RGB) return XYZ.FromRGB(color);
		if (color instanceof XyY) return XYZ.FromXyY(color);
		if (color instanceof HCT) return XYZ.FromHCT(color);
		throw new ColorError('Cannot convert to XYZ');
	}

	/**
	 * Converts a CAM16 color to XYZ.
	 * @param color - The CAM16 color to convert.
	 * @returns A new XYZ color instance.
	 */
	public static FromCAM16(color: CAM16): XYZ {
		return XYZ._FromCam16(color);
	}

	/**
	 * Converts a HunterLab color to XYZ.
	 * @param color - The HunterLab color to convert.
	 * @returns A new XYZ color instance.
	 */
	public static FromHunterLab(color: HunterLab): XYZ {
		return XYZ._FromHunterLab(color);
	}

	/**
	 * Converts a Lab color to XYZ.
	 * @param color - The Lab color to convert.
	 * @returns A new XYZ color instance.
	 */
	public static FromLab(color: Lab): XYZ {
		return XYZ._FromLab(color);
	}

	/**
	 * Converts an LMS color to XYZ.
	 * @param color - The LMS color to convert.
	 * @returns A new XYZ color instance.
	 */
	public static FromLMS(color: LMS): XYZ {
		return XYZ._FromLms(color);
	}

	/**
	 * Converts a LUV color to XYZ.
	 * @param color - The LUV color to convert.
	 * @returns A new XYZ color instance.
	 */
	public static FromLUV(color: LUV): XYZ {
		return XYZ._FromLuv(color);
	}

	/**
	 * Converts an RGB color to XYZ.
	 * @param color - The RGB color to convert.
	 * @returns A new XYZ color instance.
	 */
	public static FromRGB(color: RGB): XYZ {
		return XYZ._FromRgb(color);
	}

	/**
	 * Converts an XyY color to XYZ.
	 * @param color - The XyY color to convert.
	 * @returns A new XYZ color instance.
	 */
	public static FromXyY(color: XyY): XYZ {
		return XYZ._FromXyY(color);
	}

	/**
	 * Converts an HCT color to XYZ.
	 * @param color - The HCT color to convert.
	 * @returns A new XYZ color instance.
	 */
	public static FromHCT(color: HCT): XYZ {
		// Convert HCT to RGB then to XYZ
		const rgb = color.ToRGB();
		return XYZ.FromRGB(rgb);
	}

	/**
	 * Converts a CAM16 color to XYZ using the inverse CAM16 color appearance model.
	 *
	 * @param color - The CAM16 color to convert
	 * @returns A new XYZ color instance
	 *
	 * @remarks
	 * This conversion implements the reverse of the CAM16 color appearance model,
	 * transforming from a perceptual space back to the physical XYZ tristimulus space.
	 * The process involves several complex mathematical steps:
	 *
	 * 1. Calculate alpha from CAM16 chroma and lightness
	 * 2. Compute the t parameter using the alpha value
	 * 3. Convert hue from degrees to radians for trigonometric calculations
	 * 4. Apply the eccentricity factor and viewing conditions
	 * 5. Calculate intermediate RGB values in the adapted space
	 * 6. Transform through the CAM16 adaptation matrix
	 * 7. Apply inverse chromatic adaptation to reach final XYZ
	 *
	 * The conversion uses the default sRGB viewing conditions and assumes
	 * standard observer and illuminant conditions.
	 *
	 * @example
	 * ```typescript
	 * const cam16 = new CAM16(50, 25, 45); // J=50, C=25, H=45°
	 * const xyz = XYZ.FromCAM16(cam16);
	 * console.log(xyz.X, xyz.Y, xyz.Z); // Corresponding XYZ values
	 * ```
	 */
	private static _FromCam16(color: CAM16): XYZ {
		CAM16.Validate(color);

		const viewingConditions = CAM16ViewingConditions.DefaultSrgb;
		const alpha = color.C === 0.0 || color.J === 0.0 ? 0.0 : color.C / Math.sqrt(color.J / 100.0);

		const t = Math.pow(Math.max(0, alpha / Math.pow(1.64 - Math.pow(0.29, viewingConditions.BackgroundLuminanceFactor), 0.73)), 1.0 / 0.9);
		const hRad = DegreesToRadians(color.H);

		const eHue = 0.25 * (Math.cos(hRad + 2.0) + 3.8);
		const ac = viewingConditions.AchromaticWhiteResponse * Math.pow(color.J / 100.0, 1.0 / viewingConditions.SurroundImpactFactor / viewingConditions.ExponentialNonlinearityFactor);
		const p1 = eHue * (50000.0 / 13.0) * viewingConditions.ChromaticInductionFactor * viewingConditions.ChromaticNonlinearityFactor;
		const p2 = ac / viewingConditions.BrightnessNonlinearityFactor;

		const hSin = Math.sin(hRad);
		const hCos = Math.cos(hRad);
		const denominator = (23.0 * p1) + (11 * t * hCos) + (108.0 * t * hSin);
		const gamma = Math.abs(denominator) > Number.EPSILON ? 23.0 * (p2 + 0.305) * t / denominator : 0.0;
		const a = gamma * hCos;
		const b = gamma * hSin;

		// Calculate RGB in CAM16 adaptation space using matrix multiplication
		const rgbACoefficients: IMatrix3 = [
			[460.0, 451.0, 288.0],
			[460.0, -891.0, -261.0],
			[460.0, -220.0, -6300.0],
		];

		const rgbAInput: number[][] = [[p2], [a], [b]];
		const rgbAMatrix = MatrixMultiply(rgbACoefficients, rgbAInput);

		const rA = (rgbAMatrix[0]?.[0] ?? 0) / 1403.0;
		const gA = (rgbAMatrix[1]?.[0] ?? 0) / 1403.0;
		const bA = (rgbAMatrix[2]?.[0] ?? 0) / 1403.0;
		// Calculate RGB after chromatic adaptation with improved safety checks
		const calcCompressedComponent = (component: number): number => {
			const absComponent = Math.abs(component);
			const denominator = 400.0 - absComponent;

			if (Math.abs(denominator) <= Number.EPSILON) {
				return 0.0; // Handle division by zero
			}

			const base = Math.max(0, (27.13 * absComponent) / denominator);
			return Math.sign(component) * (100.0 / viewingConditions.LuminanceAdaptationFactor) * Math.pow(base, 1.0 / 0.42);
		};

		const rC = calcCompressedComponent(rA);
		const gC = calcCompressedComponent(gA);
		const bC = calcCompressedComponent(bA);
		// Apply chromatic adaptation factors with safety checks
		const rF = viewingConditions.RGBAdaptationFactors[0] !== 0 ? rC / viewingConditions.RGBAdaptationFactors[0] : 0;
		const gF = viewingConditions.RGBAdaptationFactors[1] !== 0 ? gC / viewingConditions.RGBAdaptationFactors[1] : 0;
		const bF = viewingConditions.RGBAdaptationFactors[2] !== 0 ? bC / viewingConditions.RGBAdaptationFactors[2] : 0;

		const transformMatrix: IMatrix3 = [
			[1.86206786, -1.01125463, 0.14918677],
			[0.38752654, 0.62144744, -0.00897398],
			[-0.01584150, -0.03412294, 1.04996444],
		];

		// Create RGB vector for matrix transformation
		const rgbVector: TVector3 = [rF, gF, bF];

		// Use VectorDot for matrix-vector multiplication instead of MatrixMultiply
		const xyzResult: TVector3 = [
			VectorDot(transformMatrix[0], rgbVector),
			VectorDot(transformMatrix[1], rgbVector),
			VectorDot(transformMatrix[2], rgbVector),
		];

		// Scale result from 0-1 to 0-100 range (D65 white point expects 0-100 scale)
		return new XYZ(xyzResult[0] * 100, xyzResult[1] * 100, xyzResult[2] * 100);
	}

	/**
	 * Converts a HunterLab color to XYZ
	 * @param color - The HunterLab color to convert
	 * @returns A new XYZ color instance
	 *
	 * This conversion reverses the Hunter Lab transformation,
	 * converting back to XYZ using the D65 reference white point.
	 */
	private static _FromHunterLab(color: HunterLab): XYZ {
		HunterLab.Validate(color);

		const { D65 } = XYZ;

		const ka = (175.0 / 198.04) * (D65.Y + D65.X);
		const kb = (70.0 / 218.11) * (D65.Y + D65.Z);

		// Calculate intermediate values
		const y = Math.pow(color.L / D65.Y, 2) * 100.0;
		const x = ((color.A / ka * Math.sqrt(y / D65.Y)) + (y / D65.Y)) * D65.X;
		const z = -1 * ((color.B / kb * Math.sqrt(y / D65.Y)) - (y / D65.Y)) * D65.Z;

		// Create result vector for consistency with other methods
		const xyzResult: TVector3 = [x, y, z];

		return new XYZ(xyzResult[0], xyzResult[1], xyzResult[2]);
	}

	/**
	 * Converts a Lab color to XYZ using the CIE standard transformation.
	 *
	 * @param color - The Lab color to convert
	 * @returns A new XYZ color instance
	 *
	 * @remarks
	 * This conversion implements the inverse of the Lab to XYZ transformation,
	 * using the CIE standard formulae with D65 reference white point. The process:
	 *	 * 1. **Intermediate Calculations**:
	 *    - y = (L* + 16) / 116
	 *    - x = (a* / 500) + y
	 *    - z = y - (b* / 200)
	 *
	 * 2. **Inverse Companding**: Apply the inverse of the Lab companding function:
	 *    - If t³ > ε (0.008856): use t³
	 *    - Otherwise: use (t - 16/116) / κ where κ = 7.787
	 *
	 * 3. **Scale by Reference White**: Multiply by D65 reference values
	 *    - X = x × Xn (95.047)	 *    - Y = y × Yn (100.000)
	 *    - Z = z × Zn (108.883)
	 *
	 * This conversion is the mathematical inverse of XYZ to Lab and enables
	 * round-trip conversions with minimal precision loss.
	 *
	 * @example
	 * ```typescript
	 * // Convert a Lab color back to XYZ
	 * const lab = new Lab(50, 25, -25); // Medium lightness, red-green
	 * const xyz = XYZ.FromLab(lab);
	 * console.log(xyz.X, xyz.Y, xyz.Z); // Corresponding XYZ values
	 *
	 * // Round-trip conversion should preserve values
	 * const originalXYZ = new XYZ(25, 30, 40);
	 * const lab2 = originalXYZ.ToLab();
	 * const backToXYZ = XYZ.FromLab(lab2);
	 * // backToXYZ should be very close to originalXYZ
	 * ```
	 */
	private static _FromLab(color: Lab): XYZ {
		Lab.Validate(color);

		// Constants for Lab to XYZ conversion
		const EPSILON = 0.008856; // 216/24389
		const KAPPA = 7.787; // Slope for linear portion
		const THRESHOLD = 16 / 116; // Threshold for linear vs cubic transformation

		const y = (color.L + 16) / 116;
		const x = (color.A / 500) + y;
		const z = y - (color.B / 200);

		// Apply inverse companding transformation using vector for consistency
		const xyzIntermediate: TVector3 = [x, y, z];
		const xyzNormalized: TVector3 = xyzIntermediate.map((component) => {
			if (Math.pow(component, 3) > EPSILON) {
				return Math.pow(component, 3);
			} else {
				return (component - THRESHOLD) / KAPPA;
			}
		}) as TVector3;

		// Scale by reference white point (D65) using vector multiplication
		const whitePoint = XYZ.D65;
		const whitePointVector: TVector3 = [whitePoint.X, whitePoint.Y, whitePoint.Z];
		const xyzResult = VectorMultiply(xyzNormalized, whitePointVector);

		return new XYZ(xyzResult[0], xyzResult[1], xyzResult[2]);
	}

	/**
	 * Converts an LMS color to XYZ
	 * @param color - The LMS color to convert
	 * @returns A new XYZ color instance
	 *
	 * This conversion applies the inverse of the Hunt-Pointer-Estevez
	 * transformation matrix to convert from cone response to XYZ.
	 */	private static _FromLms(color: LMS): XYZ {
		LMS.Validate(color);

		const conversionMatrix: IMatrix3 = [
			[0.4002, 0.7096, -0.1098],
			[-0.5648, 1.3902, 0.1746],
			[0.0030, 0.0571, 0.8090],
		];

		// Create LMS vector for better type safety
		const lmsVector: TVector3 = [color.L, color.M, color.S];

		// Use MatrixInverse and VectorDot for cleaner matrix operations
		const inverseMatrix = MatrixInverse(conversionMatrix);

		// Ensure matrix inverse succeeded and has proper structure
		if (!inverseMatrix?.[0] || !inverseMatrix[1] || !inverseMatrix[2]) {
			throw new ColorError('Matrix inverse failed during LMS to XYZ conversion');
		}

		const xyzResult: TVector3 = [
			VectorDot(inverseMatrix[0], lmsVector),
			VectorDot(inverseMatrix[1], lmsVector),
			VectorDot(inverseMatrix[2], lmsVector),
		];

		// Scale result from 0-1 to 0-100 range (D65 white point expects 0-100 scale)
		return new XYZ(xyzResult[0] * 100, xyzResult[1] * 100, xyzResult[2] * 100);
	}

	/**
	 * Converts a LUV color to XYZ
	 * @param color - The LUV color to convert
	 * @returns A new XYZ color instance
	 *
	 * This conversion implements the reverse of the CIE LUV transformation,
	 * using the D65 reference white point.
	 */
	private static _FromLuv(color: LUV): XYZ {
		LUV.Validate(color);

		// Constants for LUV to XYZ conversion
		const EPSILON = 216 / 24389;
		const KAPPA = 24389 / 27;

		const whitePoint = XYZ.D65;
		const ru = (4 * whitePoint.X) / (whitePoint.X + (15 * whitePoint.Y) + (3 * whitePoint.Z));
		const rv = (9 * whitePoint.Y) / (whitePoint.X + (15 * whitePoint.Y) + (3 * whitePoint.Z));

		let y = color.L / KAPPA;

		if (color.L > KAPPA * EPSILON) {
			y = Math.pow((color.L + 16) / 116, 3);
		}

		// Calculate intermediate values with division by zero protection
		const uDenominator = color.U + (13 * color.L * ru);
		const vDenominator = color.V + (13 * color.L * rv);

		let x = 0;
		let z = 0;

		if (Math.abs(uDenominator) > Number.EPSILON && Math.abs(vDenominator) > Number.EPSILON) {
			const d = y * (((39 * color.L) / vDenominator) - 5);
			const c = -1 / 3;
			const b = -5 * y;
			const a = (1 / 3) * (((52 * color.L) / uDenominator) - 1);

			if (Math.abs(a - c) > Number.EPSILON) {
				x = (d - b) / (a - c);
				z = (x * a) + b;
			}
		}

		// Ensure finite values and scale to 0-100 range
		x = Number.isFinite(x) ? x * 100 : 0;
		y = Number.isFinite(y) ? y * 100 : 0;
		z = Number.isFinite(z) ? z * 100 : 0;

		return new XYZ(x, y, z);
	}

	/**
	 * Converts an RGB color to XYZ using the sRGB color space standard.
	 *
	 * @param color - The RGB color to convert
	 * @returns A new XYZ color instance
	 *
	 * @remarks
	 * This conversion implements the standard sRGB to XYZ transformation
	 * following the ITU-R BT.709 specification. The process involves:
	 *
	 * 1. **Gamma Correction (Linearization)**: Convert sRGB gamma-encoded values
	 *    to linear RGB values using the sRGB inverse companding function:
	 *    - For values ≤ 0.04045: linear = sRGB / 12.92
	 *    - For values > 0.04045: linear = ((sRGB + 0.055) / 1.055)^2.4
	 *
	 * 2. **Matrix Transformation**: Apply the ITU-R BT.709 RGB to XYZ matrix:
	 *    ```
	 *    [X]   [0.4124564  0.3575761  0.1804375] [R_linear]
	 *    [Y] = [0.2126729  0.7151522  0.0721750] [G_linear]
	 *    [Z]   [0.0193339  0.1191920  0.9503041] [B_linear]
	 *    ```
	 *
	 * The resulting XYZ values assume D65 illuminant and the CIE 1931
	 * 2° standard observer, which are the standard reference conditions
	 * for sRGB color space.
	 *
	 * @example
	 * ```typescript
	 * // Convert pure red
	 * const red = new RGB(1, 0, 0);
	 * const xyzRed = XYZ.FromRGB(red);
	 * console.log(xyzRed.X); // ~41.25 (red component)
	 * console.log(xyzRed.Y); // ~21.27 (luminance)
	 * console.log(xyzRed.Z); // ~1.93 (blue component)
	 *
	 * // Convert white
	 * const white = new RGB(1, 1, 1);
	 * const xyzWhite = XYZ.FromRGB(white);
	 * // Should approximately equal XYZ.D65
	 * ```
	 */
	private static _FromRgb(color: RGB): XYZ {
		RGB.Validate(color);

		// Constants for sRGB gamma correction
		const GAMMA_THRESHOLD = 0.04045;
		const GAMMA_LINEAR_FACTOR = 12.92;
		const GAMMA_POWER = 2.4;
		const GAMMA_OFFSET = 0.055;
		const GAMMA_SCALE = 1.055;

		// Apply inverse sRGB companding (gamma correction)
		const linearizeComponent = (component: number): number => {
			return component <= GAMMA_THRESHOLD ? component / GAMMA_LINEAR_FACTOR : Math.pow((component + GAMMA_OFFSET) / GAMMA_SCALE, GAMMA_POWER);
		};

		// Create linear RGB vector using TVector3 for better type safety
		const linearRGB: TVector3 = [
			linearizeComponent(color.R),
			linearizeComponent(color.G),
			linearizeComponent(color.B),
		];

		// Apply sRGB to XYZ transformation matrix (ITU-R BT.709 standard)
		const sRGBToXYZMatrix: IMatrix3 = [
			[0.4124564, 0.3575761, 0.1804375],
			[0.2126729, 0.7151522, 0.0721750],
			[0.0193339, 0.1191920, 0.9503041],
		];

		// Use VectorDot for matrix-vector multiplication - more efficient and cleaner
		const xyzResult: TVector3 = [
			VectorDot(sRGBToXYZMatrix[0], linearRGB),
			VectorDot(sRGBToXYZMatrix[1], linearRGB),
			VectorDot(sRGBToXYZMatrix[2], linearRGB),
		];

		// Scale result from 0-1 to 0-100 range (D65 white point expects 0-100 scale)
		return new XYZ(xyzResult[0] * 100, xyzResult[1] * 100, xyzResult[2] * 100);
	}	/**
	 * Converts an XyY color to XYZ using chromaticity coordinate transformation.
	 *
	 * @param color - The XyY color to convert
	 * @returns A new XYZ color instance
	 *
	 * @remarks
	 * This conversion transforms from chromaticity coordinates (x,y) plus
	 * luminance (Y) back to the full XYZ tristimulus values using the
	 * standard mathematical relationships:
	 *
	 * - X = (x × Y) / y
	 * - Y = Y (unchanged, as it represents luminance in both spaces)
	 * - Z = ((1 - x - y) × Y) / y
	 *
	 * The XyY color space represents the same colors as XYZ but separates
	 * chromaticity (color appearance) from luminance (brightness), making
	 * it useful for color mixing and display applications.
	 *
	 * Special case: When y = 0, the conversion results in pure black (XYZ = 0,0,0)
	 * as the chromaticity is undefined.
	 *
	 * @example
	 * ```typescript
	 * // Convert from XyY chromaticity representation
	 * const xyy = new XyY(0.3127, 0.3290, 100); // D65 white point
	 * const xyz = XYZ.FromXyY(xyy);
	 * console.log(xyz.X); // ~95.047
	 * console.log(xyz.Y); // 100.000
	 * console.log(xyz.Z); // ~108.883
	 * // Should approximately equal XYZ.D65
	 * ```
	 */

	private static _FromXyY(color: XyY): XYZ {
		XyY.Validate(color);

		// Initialize result vector
		const xyzResult: TVector3 = [0, color.Y2, 0]; // Y component (luminance) is unchanged

		// Avoid division by zero when Y1 (y chromaticity) is zero
		if (Math.abs(color.Y1) > Number.EPSILON) {
			xyzResult[0] = color.X * color.Y2 / color.Y1;
			xyzResult[2] = (1 - color.X - color.Y1) * (color.Y2 / color.Y1);
		}

		// Ensure finite values - replace any NaN or infinite values with 0
		const finalResult: TVector3 = [
			Number.isFinite(xyzResult[0]) ? xyzResult[0] : 0,
			Number.isFinite(xyzResult[1]) ? xyzResult[1] : 0,
			Number.isFinite(xyzResult[2]) ? xyzResult[2] : 0,
		];

		return new XYZ(finalResult[0], finalResult[1], finalResult[2]);
	}
}
