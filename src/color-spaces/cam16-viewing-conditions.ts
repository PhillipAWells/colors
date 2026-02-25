/* eslint-disable no-magic-numbers */
import { Clamp, TVector3, LinearInterpolation, VectorMultiply, VectorAdd, VectorDot } from '@pawells/math-extended';
import { XYZ } from './xyz.js';

/**
 * Inverse function for Lab color space calculations.
 * Used internally for CAM16 viewing conditions computations.
 *
 * @param ft - Input value for Lab inverse transformation
 * @returns Transformed value for Lab calculations
 * @internal
 */
function labInvf(ft: number): number {
	// CIE LAB constants from color space standard
	const LAB_EPSILON = 216.0 / 24389.0;
	const LAB_KAPPA = 24389.0 / 27.0;
	const LAB_INVERSE_COEFFICIENT = 116;
	const LAB_INVERSE_OFFSET = 16;
	const LAB_EXPONENT = 3;

	const ft3 = Math.pow(ft, LAB_EXPONENT);
	if (ft3 > LAB_EPSILON) {
		return ft3;
	}
	return ((LAB_INVERSE_COEFFICIENT * ft) - LAB_INVERSE_OFFSET) / LAB_KAPPA;
}

/**
 * Converts L* (lightness) value to Y component of XYZ color space.
 * Used internally for CAM16 viewing conditions calculations.
 *
 * @param lstar - L* lightness value from Lab color space
 * @returns Y component value for XYZ color space
 * @internal
 */
function yFromLstar(lstar: number): number {
	const LAB_INVERSE_COEFFICIENT = 116;
	const LAB_INVERSE_OFFSET = 16;
	const XYZ_Y_SCALE = 100.0;
	return XYZ_Y_SCALE * labInvf((lstar + LAB_INVERSE_OFFSET) / LAB_INVERSE_COEFFICIENT);
}

/**
 * CAM16 viewing conditions class that defines the environment parameters for color appearance calculations.
 *
 * CAM16 (Color Appearance Model 2016) requires specific viewing conditions to accurately predict
 * color appearance. This class encapsulates all the parameters needed to define the viewing
 * environment, including illumination, adaptation, and surround conditions.
 *
 * The viewing conditions affect how colors appear to human observers and are essential for
 * accurate color appearance modeling. Different viewing conditions can make the same physical
 * color appear different to the human visual system.
 *
 * @example
 * ```typescript
 * // Use default sRGB viewing conditions
 * const defaultConditions = CAM16_Viewing_Conditions.DefaultSrgb;
 *
 * // Create custom viewing conditions
 * const customConditions = new CAM16_Viewing_Conditions(
 *   XYZ.D65,     // White point
 *   50,          // Adapting luminance
 *   30,          // Background L*
 *   1.5,         // Surround factor
 *   false        // Discounting illuminant
 * );
 * ```
 *
 * @remarks
 * - The class automatically calculates all derived parameters from the input conditions
 * - Uses Bradford chromatic adaptation for accurate color adaptation modeling
 * - Supports various surround conditions (dim, average, dark)
 * - Default sRGB conditions are optimized for typical computer displays
 */
export class CAM16ViewingConditions {
	/** Background luminance factor */
	public BackgroundLuminanceFactor: number;

	/** Background luminance factor (alias for BackgroundLuminanceFactor) */
	public get N(): number {
		return this.BackgroundLuminanceFactor;
	}

	/** Achromatic response of the white point */
	public AchromaticWhiteResponse: number;

	/** Brightness nonlinearity factor */
	public BrightnessNonlinearityFactor: number;

	/** Chromatic nonlinearity factor */
	public ChromaticNonlinearityFactor: number;

	/** Impact of surrounding conditions */
	public SurroundImpactFactor: number;

	/** Chromatic induction factor */
	public ChromaticInductionFactor: number;

	/** RGB adaptation factors for chromatic adaptation */
	public RGBAdaptationFactors: TVector3;

	/** Luminance adaptation factor */
	public LuminanceAdaptationFactor: number;

	/** Fourth root of the luminance adaptation factor */
	public LuminanceAdaptationFactorRoot: number;

	/** Base exponential nonlinearity */
	public ExponentialNonlinearityFactor: number;

	/**
	 * Default viewing conditions optimized for sRGB displays.
	 * These conditions represent typical computer monitor viewing environments
	 * with standard illumination and surround conditions.
	 *
	 * @returns Default CAM16 viewing conditions for sRGB
	 */
	public static get DefaultSrgb(): CAM16ViewingConditions {
		return new CAM16ViewingConditions();
	}

	/**
	 * Creates a new CAM16ViewingConditions instance with specified viewing parameters.
	 *
	 * @param whitePoint - The reference white point in XYZ color space (default: D65 illuminant)
	 *   Defines the color of the illumination source. Common values include D65 (daylight),
	 *   D50 (horizon light), and A (incandescent light).
	 * @param adaptingLuminance - The luminance of the adapting field in cd/m² (default: ~64 cd/m²)
	 *   Represents the average luminance level the eye has adapted to. Typical values:
	 *   - Dim: 10-50 cd/m²
	 *   - Average: 50-200 cd/m²
	 *   - Bright: 200+ cd/m²
	 * @param backgroundLstar - The L* lightness of the background (default: 50)
	 *   Represents the lightness of the area surrounding the color. Range: 0-100
	 *   - 0: Black background
	 *   - 50: Medium gray background (typical)
	 *   - 100: White background
	 * @param surround - The surround condition factor (default: 2.0)
	 *   Describes the relative luminance of the surround:
	 *   - 0.8: Dim surround (e.g., movie theater)
	 *   - 1.0: Average surround (e.g., typical viewing)
	 *   - 2.0: Dark surround (e.g., projection in dark room)
	 * @param discountingIlluminant - Whether to discount the illuminant (default: false)
	 *   When true, assumes complete chromatic adaptation to the illuminant.
	 *   When false, uses partial adaptation based on luminance level.
	 *
	 * @example
	 * ```typescript
	 * // Default sRGB viewing conditions
	 * const defaultConditions = new CAM16ViewingConditions();
	 *
	 * // Custom viewing conditions for a dim environment
	 * const dimConditions = new CAM16ViewingConditions(
	 *   XYZ.D65,    // D65 white point
	 *   30,         // Low adapting luminance
	 *   40,         // Darker background
	 *   0.8,        // Dim surround
	 *   false       // Partial adaptation
	 * );
	 *
	 * // Bright viewing conditions with complete adaptation
	 * const brightConditions = new CAM16ViewingConditions(
	 *   XYZ.D65,    // D65 white point
	 *   200,        // High adapting luminance
	 *   60,         // Lighter background
	 *   1.0,        // Average surround
	 *   true        // Complete adaptation
	 * );
	 * ```
	 *
	 * @remarks
	 * The constructor automatically calculates all derived parameters needed for
	 * CAM16 color appearance calculations, including:
	 * - RGB adaptation factors using Bradford chromatic adaptation
	 * - Luminance adaptation factors
	 * - Nonlinearity factors for brightness and chroma
	 * - Achromatic response of the white point
	 */
	constructor(whitePoint: XYZ = XYZ.D65, adaptingLuminance: number = (200.0 / Math.PI) * yFromLstar(50.0) / 100.0, backgroundLstar: number = 50.0, surround = 2.0, discountingIlluminant: boolean = false) {
		// CAM16 constants
		const SURROUND_BASELINE = 0.8;
		const SURROUND_SCALE = 10.0;
		const SURROUND_THRESHOLD = 0.9;
		const SURROUND_BRIGHT_MIN = 0.59;
		const SURROUND_BRIGHT_MAX = 0.69;
		const SURROUND_DIM_MIN = 0.525;
		const SURROUND_DIM_MAX = 0.59;
		const ADAPTATION_EXPONENT_FACTOR = 3.6;
		const ADAPTATION_EXPONENT_OFFSET = 42.0;
		const ADAPTATION_EXPONENT_SCALE = 92.0;
		const LUMINANCE_CONSTANT = 5.0;
		const RGB_Y_SCALE = 100.0;
		const LUMINANCE_ADAPTATION_EXPONENT = 0.25;
		const EXPONENTIAL_NONLINEARITY = 1.48;
		const BRIGHTNESS_NONLINEARITY = 0.725;
		const BRIGHTNESS_EXPONENT = 0.2;
		const RGB_POWER_EXPONENT = 0.42;
		const RGB_A_CONSTANT = 27.13;
		const RGB_A_SCALE = 400.0;
		const ACHROMATIC_WEIGHTS: TVector3 = [2.0, 1.0, 0.05];

		const xyz = whitePoint;

		// XYZ to RGB matrix transformation (Bradford chromatic adaptation matrix)
		const xyzToRgbMatrix: [TVector3, TVector3, TVector3] = [
			[0.401288, 0.650173, -0.051461],
			[-0.250268, 1.204414, 0.045854],
			[-0.002079, 0.048952, 0.953127],
		];

		// Convert XYZ white point to RGB using matrix-vector multiplication
		const xyzVector: TVector3 = [xyz.X, xyz.Y, xyz.Z];
		const rgbW: TVector3 = [
			VectorDot(xyzToRgbMatrix[0], xyzVector),
			VectorDot(xyzToRgbMatrix[1], xyzVector),
			VectorDot(xyzToRgbMatrix[2], xyzVector),
		];

		const f = SURROUND_BASELINE + (surround / SURROUND_SCALE);
		this.SurroundImpactFactor = f >= SURROUND_THRESHOLD ? LinearInterpolation(SURROUND_BRIGHT_MIN, SURROUND_BRIGHT_MAX, (f - SURROUND_THRESHOLD) * SURROUND_SCALE) : LinearInterpolation(SURROUND_DIM_MIN, SURROUND_DIM_MAX, (f - SURROUND_BASELINE) * SURROUND_SCALE);

		const adaptationFactor = discountingIlluminant ? 1.0 : f * (1.0 - ((1.0 / ADAPTATION_EXPONENT_FACTOR) * Math.exp((-adaptingLuminance - ADAPTATION_EXPONENT_OFFSET) / ADAPTATION_EXPONENT_SCALE)));
		const d = Clamp(adaptationFactor, 0, 1);
		this.ChromaticInductionFactor = f;

		// Calculate RGB D vector using vector operations
		const dVector: TVector3 = [d, d, d];
		const oneVector: TVector3 = [1.0, 1.0, 1.0];
		const rgbWInverse: TVector3 = [RGB_Y_SCALE / rgbW[0], RGB_Y_SCALE / rgbW[1], RGB_Y_SCALE / rgbW[2]];
		const onMinusD: TVector3 = VectorAdd(oneVector, VectorMultiply(dVector, [-1, -1, -1]));
		this.RGBAdaptationFactors = VectorAdd(VectorMultiply(dVector, rgbWInverse), onMinusD);

		const k = 1.0 / ((LUMINANCE_CONSTANT * adaptingLuminance) + 1.0);
		const k4 = Math.pow(k, 4);
		const k4F = 1.0 - k4;
		this.LuminanceAdaptationFactor = (k4 * adaptingLuminance) + (0.1 * k4F * k4F * Math.cbrt(LUMINANCE_CONSTANT * adaptingLuminance));
		this.LuminanceAdaptationFactorRoot = Math.pow(this.LuminanceAdaptationFactor, LUMINANCE_ADAPTATION_EXPONENT);
		this.BackgroundLuminanceFactor = yFromLstar(backgroundLstar) / whitePoint.Y;
		this.ExponentialNonlinearityFactor = EXPONENTIAL_NONLINEARITY + Math.sqrt(this.BackgroundLuminanceFactor);
		this.BrightnessNonlinearityFactor = BRIGHTNESS_NONLINEARITY / Math.pow(this.BackgroundLuminanceFactor, BRIGHTNESS_EXPONENT);
		this.ChromaticNonlinearityFactor = this.BrightnessNonlinearityFactor;

		// Calculate RGB A factors using vector operations
		const flVector: TVector3 = [this.LuminanceAdaptationFactor, this.LuminanceAdaptationFactor, this.LuminanceAdaptationFactor];
		const hundredInverseVector: TVector3 = [1.0 / RGB_Y_SCALE, 1.0 / RGB_Y_SCALE, 1.0 / RGB_Y_SCALE];
		const rgbFactorsInput = VectorMultiply(VectorMultiply(flVector, this.RGBAdaptationFactors), VectorMultiply(rgbW, hundredInverseVector));

		const rgbAFactors: TVector3 = [
			Math.pow(rgbFactorsInput[0], RGB_POWER_EXPONENT),
			Math.pow(rgbFactorsInput[1], RGB_POWER_EXPONENT),
			Math.pow(rgbFactorsInput[2], RGB_POWER_EXPONENT),
		];

		// Calculate RGB A using vector operations
		const constantVector: TVector3 = [RGB_A_CONSTANT, RGB_A_CONSTANT, RGB_A_CONSTANT];
		const fourHundredVector: TVector3 = [RGB_A_SCALE, RGB_A_SCALE, RGB_A_SCALE];
		const rgbADenominator = VectorAdd(rgbAFactors, constantVector);
		const rgbA: TVector3 = [
			(fourHundredVector[0] * rgbAFactors[0]) / rgbADenominator[0],
			(fourHundredVector[1] * rgbAFactors[1]) / rgbADenominator[1],
			(fourHundredVector[2] * rgbAFactors[2]) / rgbADenominator[2],
		];

		// Calculate achromatic response using dot product
		this.AchromaticWhiteResponse = VectorDot(ACHROMATIC_WEIGHTS, rgbA) * this.BrightnessNonlinearityFactor;
	}
}
