/* eslint-disable no-magic-numbers */
import { AssertVector3, IMatrix3, MatrixMultiply, MatrixTranspose } from '@pawells/math-extended';
import { AssertNumber, AssertInstanceOf } from './assert.js';
import { ColorSpace } from './_color-space.js';
import { XYZ } from './xyz.js';
import { ColorSpaceManager } from './manager.js';
import { ColorError } from '../error.js';

type TLMSComponentSelection = 'L' | 'M' | 'S';

/**
 * Represents a color in the LMS color space.
 *
 * The LMS color space is based on the response of the three types of cone cells
 * in the human retina: Long (L), Medium (M), and Short (S) wavelength sensitive cones.
 * This color space is useful for color science applications and understanding
 * human color perception.
 */
@ColorSpaceManager.Register({
	name: 'LMS',
	description: 'Represents a color in the LMS color space.',
	converters: [
		'XYZ',
	],
})
export class LMS extends ColorSpace {
	/**
	 * Internal array storing the LMS component values [L, M, S].
	 * Values are floating-point numbers representing cone responses.
	 * Each component represents the integrated response of specific cone types:
	 * - Index 0: L-cone response (long wavelength, ~564-580nm peak)
	 * - Index 1: M-cone response (medium wavelength, ~534-545nm peak)
	 * - Index 2: S-cone response (short wavelength, ~420-440nm peak)
	 */
	protected override components: [number, number, number];

	/**
	 * Gets the Long wavelength (L-cone) response component value.
	 *
	 * The L component represents the integrated response of long-wavelength sensitive
	 * cone cells in the human retina. These cones have peak sensitivity around 564-580nm
	 * and are primarily responsible for detecting red-orange light.
	 *
	 * @returns The L-cone response value (≥ 0)
	 *
	 * @example
	 * ```typescript
	 * const lms = new LMS(45.2, 38.1, 12.7);
	 * console.log(lms.L); // 45.2
	 * ```
	 */
	public get L(): number {
		return this.components[0];
	}

	/**
	 * Sets the Long wavelength (L-cone) response component value.
	 *
	 * @param value - The L-cone response value to set (must be finite and ≥ 0)
	 * @throws {ColorError} When value is negative, infinite, or NaN
	 *
	 * @example
	 * ```typescript
	 * const lms = new LMS();
	 * lms.L = 50.5; // Valid
	 * lms.L = -10;  // Throws ColorError: Channel(L) Out of Range
	 * ```
	 */
	public set L(value: number) {
		LMS._AssertComponent('L', value);
		this.components[0] = value;
	}

	/**
	 * Gets the Medium wavelength (M-cone) response component value.
	 *
	 * The M component represents the integrated response of medium-wavelength sensitive
	 * cone cells in the human retina. These cones have peak sensitivity around 534-545nm
	 * and are primarily responsible for detecting green light.
	 *
	 * @returns The M-cone response value (≥ 0)
	 *
	 * @example
	 * ```typescript
	 * const lms = new LMS(45.2, 38.1, 12.7);
	 * console.log(lms.M); // 38.1
	 * ```
	 */
	public get M(): number {
		return this.components[1];
	}

	/**
	 * Sets the Medium wavelength (M-cone) response component value.
	 *
	 * @param value - The M-cone response value to set (must be finite and ≥ 0)
	 * @throws {ColorError} When value is negative, infinite, or NaN
	 *
	 * @example
	 * ```typescript
	 * const lms = new LMS();
	 * lms.M = 42.3; // Valid
	 * lms.M = NaN;  // Throws ColorError: Channel(M) Out of Range
	 * ```
	 */
	public set M(value: number) {
		LMS._AssertComponent('M', value);
		this.components[1] = value;
	}

	/**
	 * Gets the Short wavelength (S-cone) response component value.
	 *
	 * The S component represents the integrated response of short-wavelength sensitive
	 * cone cells in the human retina. These cones have peak sensitivity around 420-440nm
	 * and are primarily responsible for detecting blue-violet light.
	 *
	 * @returns The S-cone response value (≥ 0)
	 *
	 * @example
	 * ```typescript
	 * const lms = new LMS(45.2, 38.1, 12.7);
	 * console.log(lms.S); // 12.7
	 * ```
	 */
	public get S(): number {
		return this.components[2];
	}

	/**
	 * Sets the Short wavelength (S-cone) response component value.
	 *
	 * @param value - The S-cone response value to set (must be finite and ≥ 0)
	 * @throws {ColorError} When value is negative, infinite, or NaN
	 *
	 * @example
	 * ```typescript
	 * const lms = new LMS();
	 * lms.S = 15.8; // Valid
	 * lms.S = Infinity; // Throws ColorError: Channel(S) Out of Range
	 * ```
	 */
	public set S(value: number) {
		LMS._AssertComponent('S', value);
		this.components[2] = value;
	}

	/**
	 * Creates a new LMS color instance with specified cone response values.
	 *
	 * Each parameter represents the integrated response of specific cone photoreceptors
	 * in the human retina to incoming light. Values are automatically validated to ensure
	 * they are finite and non-negative.
	 *
	 * @param l - Long wavelength (L-cone) response value (≥ 0, default: 0)
	 * @param m - Medium wavelength (M-cone) response value (≥ 0, default: 0)
	 * @param s - Short wavelength (S-cone) response value (≥ 0, default: 0)
	 *
	 * @throws {ColorError} When any parameter is negative, infinite, or NaN
	 *
	 * @example Creating LMS colors
	 * ```typescript
	 * // Default black (no cone response)
	 * const black = new LMS();
	 *
	 * // Specific cone responses
	 * const color = new LMS(45.2, 38.1, 12.7);
	 *
	 * // High L-cone response (reddish perception)
	 * const reddish = new LMS(80, 20, 5);
	 * ```
	 */
	constructor(l: number = 0, m: number = 0, s: number = 0) {
		super();
		this.components = [0, 0, 0]; // Initialize to defaults
		this.L = l; // Use setters for validation
		this.M = m;
		this.S = s;
	}

	/**
	 * Returns a string representation of the LMS color.
	 *
	 * The format shows the three cone response values in scientific notation
	 * when appropriate, maintaining precision for color science applications.
	 *
	 * @returns A string in the format "LMS(L, M, S)"
	 *
	 * @example
	 * ```typescript
	 * const lms = new LMS(45.234, 38.167, 12.89);
	 * console.log(lms.ToString()); // "LMS(45.234, 38.167, 12.89)"
	 *
	 * const small = new LMS(0.001, 0.002, 0.0005);
	 * console.log(small.ToString()); // "LMS(0.001, 0.002, 0.0005)"
	 * ```
	 */
	public override ToString(): string {
		return `LMS(${this.L}, ${this.M}, ${this.S})`;
	}

	/**
	 * Type guard assertion function that validates and narrows an unknown value to LMS type.
	 *
	 * This function performs comprehensive validation of an object to ensure it is a valid
	 * LMS color instance with proper cone response values. It validates both the object
	 * structure (instanceof LMS) and the numeric properties (finite, non-negative values).
	 *
	 * The assertion provides TypeScript type narrowing, allowing the value to be safely
	 * used as an LMS instance after successful validation.
	 *
	 * @param color - The value to validate and narrow to LMS type
	 *
	 * @throws {ColorError} When the value is not an instance of LMS
	 * @throws {ColorError} When L component is not a finite, non-negative number
	 * @throws {ColorError} When M component is not a finite, non-negative number
	 * @throws {ColorError} When S component is not a finite, non-negative number
	 *
	 * @example Type narrowing with assertion
	 * ```typescript
	 * function processColor(value: unknown) {
	 *   LMS.Assert(value); // value is now typed as LMS
	 *
	 *   // Safe to use LMS properties after assertion
	 *   console.log(`L-cone: ${value.L}`);
	 *   console.log(`M-cone: ${value.M}`);
	 *   console.log(`S-cone: ${value.S}`);
	 * }
	 *
	 * // Usage with different input types
	 * const validLMS = new LMS(50, 40, 15);
	 * processColor(validLMS); // Success
	 *
	 * processColor({ L: 50, M: 40, S: 15 }); // Throws: Not a LMS Color
	 * processColor(new LMS(-10, 40, 15));    // Throws: Channel(L) Not a Number
	 * ```
	 */
	public static override Assert(color: unknown): asserts color is LMS {
		AssertInstanceOf(color, LMS, { class: ColorError, message: 'Not a LMS Color' });
		LMS._AssertComponent('L', color);
		LMS._AssertComponent('M', color);
		LMS._AssertComponent('S', color);
	}

	private static _AssertComponent(component: TLMSComponentSelection, color: LMS): void;
	private static _AssertComponent(component: TLMSComponentSelection, value: number): void;
	private static _AssertComponent(component: TLMSComponentSelection, colorOrValue: LMS | number): void {
		switch (component) {
			case 'L': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.L;
				AssertNumber(value, { gte: 0 }, { class: ColorError, message: 'Channel(L) must be a finite number greater than or equal to 0.' });
				break;
			}
			case 'M': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.M;
				AssertNumber(value, { gte: 0 }, { class: ColorError, message: 'Channel(M) must be a finite number greater than or equal to 0.' });
				break;
			}
			case 'S': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.S;
				AssertNumber(value, { gte: 0 }, { class: ColorError, message: 'Channel(S) must be a finite number greater than or equal to 0.' });
				break;
			}
		}
	}

	/**
	 * Validates whether an unknown value is a valid LMS color instance.
	 *
	 * This method provides a non-throwing validation check for LMS color objects.
	 * It internally uses the Assert method but catches any validation errors and
	 * returns a boolean result instead of throwing exceptions.
	 *
	 * Use this method when you need to check validity without exception handling,
	 * or when implementing conditional logic based on color validity.
	 *
	 * @param color - The value to validate as an LMS color
	 * @returns `true` if the value is a valid LMS color, `false` otherwise
	 *
	 * @example Conditional validation
	 * ```typescript
	 * function processIfValid(value: unknown) {
	 *   if (LMS.Validate(value)) {
	 *     // TypeScript knows this is LMS after successful validation
	 *     const lms = value as LMS;
	 *     console.log(`Valid LMS: ${lms.ToString()}`);
	 *   } else {
	 *     console.log('Invalid LMS color provided');
	 *   }
	 * }
	 *
	 * // Test with various inputs
	 * processIfValid(new LMS(50, 40, 15));     // true - valid LMS
	 * processIfValid({ L: 50, M: 40, S: 15 }); // false - not LMS instance
	 * processIfValid('invalid');               // false - wrong type
	 * ```
	 */
	public static override Validate(color: unknown): boolean {
		try {
			LMS.Assert(color);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Factory method for creating LMS color instances from other color spaces.
	 *
	 * Currently supports conversion from XYZ color space using the Hunt-Pointer-Estevez
	 * transformation matrix. This method provides a standardized interface for color
	 * space conversions while maintaining type safety.
	 *
	 * @param color - The source color to convert (currently supports XYZ)
	 * @returns A new LMS color instance representing the same color
	 *
	 * @throws {ColorError} When the input color type is not supported for conversion
	 *
	 * @example Converting from XYZ
	 * ```typescript
	 * // Create an XYZ color (e.g., D65 white point)
	 * const xyzWhite = new XYZ(95.047, 100.0, 108.883);
	 *
	 * // Convert to LMS
	 * const lmsWhite = LMS.From(xyzWhite);
	 * console.log(lmsWhite.ToString()); // Shows LMS cone responses for white
	 *
	 * // Identity conversion (LMS to LMS)
	 * const existingLMS = new LMS(50, 40, 15);
	 * const sameLMS = LMS.From(existingLMS); // Returns same instance
	 * console.log(existingLMS === sameLMS); // true
	 * ```
	 */
	public static From(color: XYZ): LMS {
		if (color instanceof LMS) return color;
		if (color instanceof XYZ) return LMS.FromXYZ(color);
		throw new ColorError('Cannot Convert to LMS');
	}

	/**
	 * Converts an XYZ color to LMS using the Hunt-Pointer-Estevez transformation matrix.
	 *
	 * This method implements the standard conversion from CIE XYZ tristimulus values
	 * to LMS cone response values using the Hunt-Pointer-Estevez transformation matrix.
	 * The matrix is specifically adapted for the D65 standard illuminant (daylight).
	 *
	 * @param color - The XYZ color to convert (must be valid XYZ instance)
	 * @returns A new LMS color instance with corresponding cone responses
	 * @throws {ColorError} When the input XYZ color is invalid
	 */
	public static FromXYZ(color: XYZ): LMS {
		XYZ.Validate(color);

		// Hunt-Pointer-Estevez transformation matrix for D65 illuminant
		const conversion: IMatrix3 = [
			[0.4002, 0.7096, -0.1098],
			[-0.5648, 1.3902, 0.1746],
			[0.0030, 0.0571, 0.8090],
		];

		// Convert XYZ to matrix form and apply transformation
		const xyz = color.ToMatrix();
		const [lms] = MatrixTranspose(MatrixMultiply(conversion, xyz));
		AssertVector3(lms);

		return new LMS(lms[0], lms[1], lms[2]);
	}
}
