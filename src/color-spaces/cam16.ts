/* eslint-disable no-magic-numbers */
import {
	DegreesToRadians,
	TVector3,
	MatrixMultiply,
	NormalizeDegrees,
	RadiansToDegrees,
	VectorMultiply,
	VectorAbs,
	Clamp,
	AssertVector3,
} from '@pawells/math-extended';
import { AssertInstanceOf, AssertNumber } from './assert.js';
import { CAM16ViewingConditions } from './cam16-viewing-conditions.js';
import { ColorSpace } from './_color-space.js';
import { XYZ } from './xyz.js';
import { ColorSpaceManager } from './manager.js';
import { ColorError } from '../error.js';

import { HCT } from './hct.js';
type TCAM16ComponentSelection = 'H' | 'HRadians' | 'C' | 'J' | 'Q' | 'M' | 'S';

/**
 * Implementation of the CAM16 color appearance model.
 *
 * CAM16 (Color Appearance Model 2016) is an advanced color model that aims to
 * predict how a color appears to human observers under different viewing conditions.
 * It is an improvement over the earlier CIECAM02 model, offering better performance
 * while being computationally less complex.
 *
 * The CAM16 model represents colors using six components:
 * - H (Hue): Angular dimension representing the color's quality (red, yellow, green, etc.)
 * - C (Chroma): Colorfulness relative to brightness of a similarly illuminated area
 * - J (Lightness): Brightness relative to the brightness of a white area
 * - Q (Brightness): Perceived intensity of light
 * - M (Colorfulness): Perceived color intensity
 * - S (Saturation): Colorfulness relative to brightness
 *
 * Additionally, the class provides UCS (Uniform Color Space) transformations
 * through JS, AS, BS coordinates for perceptually uniform color calculations.
 */
@ColorSpaceManager.Register({
	name: 'CAM16',
	description: 'CAM16 (Color Appearance Model 2016) is an advanced color model that aims to predict how a color appears to human observers under different viewing conditions.',
	converters: [
		'HCT',
		'XYZ',
	],
})
export class CAM16 extends ColorSpace {
	/**
		 * The six components of the CAM16 color model:
		 * [0]: H (Hue), [1]: C (Chroma), [2]: J (Lightness),
		 * [3]: Q (Brightness), [4]: M (Colorfulness), [5]: S (Saturation)
		 */
	protected override components: [number, number, number, number, number, number];

	/**
	 * Gets the hue component (H) in degrees.
	 * Hue is the attribute of visual sensation according to which an area
	 * appears to be similar to one of the colors: red, yellow, green, and blue,
	 * or to a combination of adjacent pairs of these colors.
	 * @returns Hue value in the range [0, 360) degrees
	 */
	public get H(): number {
		return this.components[0];
	}

	/**
	 * Sets the hue component (H) in degrees.
	 * @param value Hue value in the range [0, 360) degrees
	 * @throws ColorError if value is outside the valid range or not finite
	 */
	public set H(value: number) {
		CAM16._AssertComponent('H', value);
		this.components[0] = value;
	}

	/**
	 * Gets the hue component in radians.
	 * @returns Hue value in the range [0, 2π) radians
	 */
	public get HRadians(): number {
		return DegreesToRadians(this.H);
	}

	/**
	 * Sets the hue component in radians.
	 * @param value Hue value in the range [0, 2π) radians
	 * @throws ColorError if value is outside the valid range or not finite
	 */
	public set HRadians(value: number) {
		CAM16._AssertComponent('HRadians', value);
		this.components[0] = RadiansToDegrees(value);
	}

	/**
	 * Gets the chroma component (C).
	 * Chroma represents the colorfulness relative to the brightness of a white area.
	 * @returns Chroma value (non-negative)
	 */
	public get C(): number {
		return this.components[1];
	}

	/**
	 * Sets the chroma component (C).
	 * @param value Chroma value (must be non-negative and finite)
	 * @throws ColorError if value is negative or not finite
	 */
	public set C(value: number) {
		CAM16._AssertComponent('C', value);
		this.components[1] = value;
	}

	/**
	 * Gets the lightness component (J).
	 * Lightness represents the brightness relative to the brightness of a white area.
	 * @returns Lightness value in the range [0, 100]
	 */
	public get J(): number {
		return this.components[2];
	}

	/**
	 * Sets the lightness component (J).
	 * @param value Lightness value in the range [0, 100]
	 * @throws ColorError if value is outside the valid range or not finite
	 */
	public set J(value: number) {
		CAM16._AssertComponent('J', value);
		this.components[2] = value;
	}

	/**
	 * Gets the brightness component (Q).
	 * Brightness represents the perceived intensity of light.
	 * @returns Brightness value (non-negative)
	 */
	public get Q(): number {
		return this.components[3];
	}

	/**
	 * Sets the brightness component (Q).
	 * @param value Brightness value (must be non-negative and finite)
	 * @throws ColorError if value is negative or not finite
	 */
	public set Q(value: number) {
		CAM16._AssertComponent('Q', value);
		this.components[3] = value;
	}

	/**
	 * Gets the colorfulness component (M).
	 * Colorfulness represents the perceived color intensity.
	 * @returns Colorfulness value (non-negative)
	 */
	public get M(): number {
		return this.components[4];
	}

	/**
	 * Sets the colorfulness component (M).
	 * @param value Colorfulness value (must be non-negative and finite)
	 * @throws ColorError if value is negative or not finite
	 */
	public set M(value: number) {
		CAM16._AssertComponent('M', value);
		this.components[4] = value;
	}

	/**
	 * Gets the saturation component (S).
	 * Saturation represents the colorfulness relative to the brightness of a similarly illuminated area.
	 * @returns Saturation value (non-negative)
	 */
	public get S(): number {
		return this.components[5];
	}

	/**
	 * Sets the saturation component (S).
	 * @param value Saturation value (must be non-negative and finite)
	 * @throws ColorError if value is negative or not finite
	 */
	public set S(value: number) {
		CAM16._AssertComponent('S', value);
		this.components[5] = value;
	}

	/**
	 * Gets the CAM16-UCS J coordinate.
	 * @returns CAM16-UCS J coordinate
	 */
	public get JS(): number {
		return (1.0 + (100.0 * 0.007)) * this.J / (1.0 + (0.007 * this.J));
	}

	/**
	 * Gets the CAM16-UCS M coordinate.
	 * @returns CAM16-UCS M coordinate
	 */
	public get MS(): number {
		return Math.log(1.0 + (0.0228 * this.M)) / 0.0228;
	}

	/**
	 * Gets the CAM16-UCS a coordinate.
	 * @returns CAM16-UCS a coordinate
	 */
	public get AS(): number {
		return this.MS * Math.cos(this.HRadians);
	}

	/**
	 * Gets the CAM16-UCS b coordinate.
	 * @returns CAM16-UCS b coordinate
	 */
	public get BS(): number {
		return this.MS * Math.sin(this.HRadians);
	}

	/**
	 * Constructs a new CAM16 color object.
	 * @param hue Hue value in degrees (default: 0)
	 * @param chroma Chroma value (default: 0)
	 * @param j Lightness value (default: 0)
	 * @param q Brightness value (default: 0)
	 * @param m Colorfulness value (default: 0)
	 * @param s Saturation value (default: 0)
	 */
	constructor(hue: number = 0, chroma: number = 0, j: number = 0, q: number = 0, m: number = 0, s: number = 0) {
		super();
		this.components = [0, 0, 0, 0, 0, 0]; // Initialize with defaults
		// Use setters to validate component values
		this.H = hue;
		this.C = chroma;
		this.J = j;
		this.Q = q;
		this.M = m;
		this.S = s;
	}

	/**
	 * Returns a string representation of the CAM16 color object.
	 * @returns String representation of the CAM16 color object
	 */
	public override ToString(): string {
		return `CAM16(${this.H}, ${this.C}, ${this.J}, ${this.Q}, ${this.M}, ${this.S}, ${this.JS}, ${this.AS}, ${this.BS})`;
	}

	/**
	 * Returns a copy of the first 5 color components as an array.
	 * The CAM16 tests expect ToArray() to return only H, C, J, Q, M (5 components).
	 * @returns A new array containing the first 5 color component values
	 */
	public override ToArray(): number[] {
		return [this.H, this.C, this.J, this.Q, this.M];
	}

	/**
	 * Creates a deep clone of this CAM16 color instance.
	 * @returns A new CAM16 instance with the same values
	 */
	public override Clone(): this {
		return new CAM16(this.H, this.C, this.J, this.Q, this.M) as this;
	}

	/**
	 * Type guard assertion function that validates if a value is an instance of CAM16.
	 * Throws a TypeError if the provided value is not a CAM16 instance, or a ColorError
	 * if any CAM16 component values are outside their valid ranges.
	 *
	 * @param color - The value to validate as a CAM16 color instance
	 * @throws {TypeError} Throws if the value is not an instance of CAM16
	 * @throws {ColorError} Throws if H (hue) is not in range [0, 360) degrees
	 * @throws {ColorError} Throws if C (chroma) is negative or not finite
	 * @throws {ColorError} Throws if J (lightness) is not in range [0, 100] or not finite
	 * @throws {ColorError} Throws if Q (brightness) is negative or not finite
	 * @throws {ColorError} Throws if M (colorfulness) is negative or not finite
	 * @throws {ColorError} Throws if S (saturation) is negative or not finite
	 *
	 * @example
	 * ```typescript
	 * function processCAM16Color(value: unknown) {
	 *   CAM16.Assert(value);
	 *   // value is now typed as CAM16
	 *   console.log(`Hue: ${value.H}, Chroma: ${value.C}, Lightness: ${value.J}`);
	 * }
	 *
	 * const validColor = new CAM16(180, 50, 75, 80, 40, 60);
	 * processCAM16Color(validColor); // Success
	 *
	 * processCAM16Color({ H: 180 }); // Throws TypeError
	 * processCAM16Color(new CAM16(400, 50, 75)); // Throws ColorError
	 * ```
	 */
	public static override Assert(color: unknown): asserts color is CAM16 {
		AssertInstanceOf(color, CAM16, { message: 'Not a CAM16 Object' });
		const cam16Color = color as CAM16;
		CAM16._AssertComponent('H', cam16Color.H);
		CAM16._AssertComponent('C', cam16Color.C);
		CAM16._AssertComponent('J', cam16Color.J);
		CAM16._AssertComponent('Q', cam16Color.Q);
		CAM16._AssertComponent('M', cam16Color.M);
		CAM16._AssertComponent('S', cam16Color.S);
	}

	/**
	 * Validates if the given object is a valid CAM16 color instance.
	 * @param color - The object to validate as a CAM16 color instance
	 * @returns true if the object is a valid CAM16 instance, false otherwise
	 */
	public static override Validate(color: unknown): boolean {
		try {
			CAM16.Assert(color);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Validates a single CAM16 component value by name.
	 * @param component - The component name ('H', 'HRadians', 'C', 'J', 'Q', 'M', 'S')
	 * @param colorOrValue - The value to validate (either a number or CAM16 object)
	 * @throws {ColorError} If the value is out of range or not a number
	 */
	private static _AssertComponent(component: TCAM16ComponentSelection, color: CAM16): void;
	private static _AssertComponent(component: TCAM16ComponentSelection, value: number): void;
	private static _AssertComponent(component: TCAM16ComponentSelection, colorOrValue: CAM16 | number): void {
		switch (component) {
			case 'H': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.H;
				AssertNumber(value, { gte: 0, lt: 360, finite: true }, { class: ColorError, message: 'Channel(H) must be in range [0, 360)' });
				break;
			}
			case 'HRadians': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.HRadians;
				AssertNumber(value, { gte: 0, lt: 2 * Math.PI, finite: true }, { class: ColorError, message: 'Channel(HRadians) must be in range [0, 2π)' });
				break;
			}
			case 'C': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.C;
				AssertNumber(value, { gte: 0, finite: true }, { class: ColorError, message: 'Channel(C) must be non-negative' });
				break;
			}
			case 'J': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.J;
				AssertNumber(value, { gte: 0, lte: 100, finite: true }, { class: ColorError, message: 'Channel(J) must be in range [0, 100]' });
				break;
			}
			case 'Q': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.Q;
				AssertNumber(value, { gte: 0, finite: true }, { class: ColorError, message: 'Channel(Q) must be non-negative' });
				break;
			}
			case 'M': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.M;
				AssertNumber(value, { gte: 0, finite: true }, { class: ColorError, message: 'Channel(M) must be non-negative' });
				break;
			}
			case 'S': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.S;
				AssertNumber(value, { gte: 0, finite: true }, { class: ColorError, message: 'Channel(S) must be non-negative' });
				break;
			}
			default:
				throw new ColorError(`Unknown CAM16 component: ${component}`);
		}
	}

	public static From(color: XYZ | HCT | ColorSpace): CAM16 {
		if (color instanceof XYZ) return CAM16.FromXYZ(color);
		if (color instanceof HCT) return CAM16.FromHCT(color);
		throw new ColorError('Cannot Convert to CAM16');
	}

	/**
	 * Converts an XYZ color object to a CAM16 color object.
	 * @param color XYZ color object
	 * @param viewingConditions Viewing conditions (default: CAM16ViewingConditions.DefaultSrgb)
	 * @returns CAM16 color object
	 */
	public static FromXYZ(color: XYZ, viewingConditions: CAM16ViewingConditions = CAM16ViewingConditions.DefaultSrgb): CAM16 {
		return CAM16._FromXyz(color, viewingConditions);
	}

	/**
	 * Converts an HCT color to CAM16.
	 * @param color HCT color object
	 * @returns CAM16 color object
	 */
	public static FromHCT(color: HCT): CAM16 {
		// Convert HCT to RGB then to XYZ then to CAM16
		const rgb = color.ToRGB();
		const xyz = XYZ.FromRGB(rgb);
		return CAM16.FromXYZ(xyz);
	}

	/**
	 * Converts an XYZ color object to a CAM16 color object.
	 * @param xyz XYZ color object
	 * @param viewingConditions Viewing conditions (default: CAM16ViewingConditions.DefaultSrgb)
	 * @returns CAM16 color object
	 */
	private static _FromXyz(xyz: XYZ, viewingConditions: CAM16ViewingConditions = CAM16ViewingConditions.DefaultSrgb): CAM16 {
		// Convert XYZ to Linear RGB using the transformation matrix
		const linearRGB = MatrixMultiply(
			[
				[0.401288, 0.650173, -0.051461],
				[-0.250268, 1.204414, 0.045854],
				[-0.002079, 0.048952, 0.953127],
			],
			xyz.ToArray(),
		);

		// Apply chromatic adaptation (discount illuminant)
		const D = VectorMultiply(linearRGB, viewingConditions.RGBAdaptationFactors);
		AssertVector3(D);

		// Apply post-adaptation non-linear response compression using VectorAbs for optimization
		const dAbsolute = VectorAbs(D);
		AssertVector3(dAbsolute);

		const AF: TVector3 = [
			Math.pow(viewingConditions.LuminanceAdaptationFactor * dAbsolute[0] / 100.0, 0.42),
			Math.pow(viewingConditions.LuminanceAdaptationFactor * dAbsolute[1] / 100.0, 0.42),
			Math.pow(viewingConditions.LuminanceAdaptationFactor * dAbsolute[2] / 100.0, 0.42),
		];

		const A: TVector3 = [
			Math.sign(D[0]) * 400.0 * AF[0] / (AF[0] + 27.13),
			Math.sign(D[1]) * 400.0 * AF[1] / (AF[1] + 27.13),
			Math.sign(D[2]) * 400.0 * AF[2] / (AF[2] + 27.13),
		];

		// Calculate opponent color coordinates
		const a = ((11.0 * A[0]) + (-12.0 * A[1]) + A[2]) / 11.0; // redness-greenness
		const b = (A[0] + A[1] - (2.0 * A[2])) / 9.0;             // yellowness-blueness

		// Calculate auxiliary components
		const u = ((20.0 * A[0]) + (20.0 * A[1]) + (21.0 * A[2])) / 20.0;
		const p2 = ((40.0 * A[0]) + (20.0 * A[1]) + A[2]) / 20.0;

		// Calculate hue angle and normalize to [0, 360) range
		const atan2 = Math.atan2(b, a);
		const atanDegrees = RadiansToDegrees(atan2);
		const hue = NormalizeDegrees(atanDegrees);

		// Calculate achromatic response
		// Calculate CAM16 lightness and brightness - optimize using Clamp to ensure valid range
		const ac = p2 * viewingConditions.BrightnessNonlinearityFactor;
		const acRatio = Clamp(ac / viewingConditions.AchromaticWhiteResponse, 1e-10, Number.MAX_VALUE);
		const J = Clamp(100.0 * Math.pow(acRatio, viewingConditions.SurroundImpactFactor * viewingConditions.ExponentialNonlinearityFactor), 0, 100);
		const Q = (4.0 / viewingConditions.SurroundImpactFactor) * Math.sqrt(J / 100.0) * (viewingConditions.AchromaticWhiteResponse + 4.0) * viewingConditions.LuminanceAdaptationFactorRoot;
		// Prepare for calculating colorfulness - optimize hue normalization
		const huePrime = hue < 20.14 ? hue + 360 : hue;
		const eHue = (1.0 / 4.0) * (Math.cos(DegreesToRadians(huePrime + RadiansToDegrees(2.0))) + 3.8);
		const p1 = 50000.0 / 13.0 * eHue * viewingConditions.ChromaticInductionFactor * viewingConditions.ChromaticNonlinearityFactor;
		// Calculate color magnitude with optimization
		const colorMagnitude = Math.sqrt((a * a) + (b * b));
		const t = p1 * colorMagnitude / (u + 0.305);
		const alpha = Math.pow(Clamp(t, 0, Number.MAX_VALUE), 0.9) * Math.pow(1.64 - Math.pow(0.29, viewingConditions.BackgroundLuminanceFactor), 0.73);

		// Calculate CAM16 chroma, colorfulness, saturation with bounds checking
		const C = Clamp(alpha * Math.sqrt(J / 100.0), 0, Number.MAX_VALUE);
		const M = Clamp(C * viewingConditions.LuminanceAdaptationFactorRoot, 0, Number.MAX_VALUE);
		const s = Clamp(50.0 * Math.sqrt((alpha * viewingConditions.SurroundImpactFactor) / (viewingConditions.AchromaticWhiteResponse + 4.0)), 0, Number.MAX_VALUE);

		return new CAM16(hue, C, J, Q, M, s);
	}
}
