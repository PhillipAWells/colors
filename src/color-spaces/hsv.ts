/* eslint-disable no-magic-numbers */
import { AssertInstanceOf, AssertNumber } from './assert.js';
import { TVector3 } from '@pawells/math-extended';
import { ColorSpace } from './_color-space.js';
import { HSL } from './hsl.js';
import { RGB } from './rgb.js';
import { ColorSpaceManager } from './manager.js';
import { ColorError } from '../error.js';

type THSVComponentSelection = 'H' | 'S' | 'V';

@ColorSpaceManager.Register({
	name: 'HSV',
	description: 'Represents a color in the HSV (Hue, Saturation, Value) color space.',
	converters: [
		'RGB',
		'HSL',
	],
})
export class HSV extends ColorSpace {
	/**
	 * Internal array storing the HSV component values [H, S, V].
	 * Values are normalized floating-point numbers between 0 and 1 for S and V, and 0-360 for H.
	 *
	 * Direct access to this array should be avoided in favor of using the
	 * public H, S, and V properties which include proper validation.
	 */
	protected override components: TVector3 = [0, 0, 0];

	/**
	 * Gets the Hue component value (0-360 degrees).
	 *
	 * @remarks
	 * The hue represents the position on the color wheel:
	 * - 0° / 360°: Red
	 * - 60°: Yellow
	 * - 120°: Green
	 * - 180°: Cyan
	 * - 240°: Blue
	 * - 300°: Magenta
	 *
	 * The hue component is identical between HSV and HSL color spaces.
	 *
	 * @returns {number} The hue value in degrees (0-360)
	 */
	public get H(): number {
		return this.components[0];
	}

	/**
	 * Sets the Hue component value (0-360 degrees).
	 *
	 * @param value - The hue value to set in degrees (0-360)
	 * @throws {ColorError} When value is NaN, infinite, or outside the valid range of 0-360
	 *
	 * @remarks
	 * Performs strict validation to ensure color integrity:
	 * - Checks for NaN and infinite values
	 * - Enforces value range between 0 and 360 degrees
	 * - Throws descriptive errors for invalid values
	 *
	 * @example
	 * ```typescript
	 * const color = new HSV(0, 1, 1);
	 * color.H = 120; // Change to green hue
	 * console.log(color.H); // 120
	 * ```
	 */
	public set H(value: number) {
		HSV._AssertComponent('H', value);
		this.components[0] = value;
	}

	/**
	 * Gets the Saturation component value (0-1).
	 *
	 * @remarks
	 * The saturation represents the purity or intensity of the color:
	 * - 0: No color saturation (grayscale, only brightness matters)
	 * - 0.5: Moderately saturated color
	 * - 1: Fully saturated, pure color
	 *
	 * In HSV, saturation controls how much of the pure hue is mixed
	 * with white. Higher saturation values produce more vivid colors.
	 *
	 * @returns {number} The saturation value between 0 and 1
	 */
	public get S(): number {
		return this.components[1];
	}

	/**
	 * Sets the Saturation component value (0-1).
	 *
	 * @param value - The saturation value to set between 0 and 1
	 * @throws {ColorError} When value is NaN, infinite, or outside the valid range of 0-1
	 *
	 * @remarks
	 * Performs strict validation to ensure color integrity:
	 * - Checks for NaN and infinite values
	 * - Enforces value range between 0 and 1
	 * - Throws descriptive errors for invalid values
	 *
	 * @example
	 * ```typescript
	 * const color = new HSV(240, 0.5, 1);
	 * color.S = 1; // Make fully saturated
	 * console.log(color.S); // 1
	 * ```
	 */
	public set S(value: number) {
		HSV._AssertComponent('S', value);
		this.components[1] = value;
	}

	/**
	 * Gets the Value component value (0-1).
	 *
	 * @remarks
	 * The value represents the brightness or intensity of the color:
	 * - 0: Black (no brightness regardless of hue/saturation)
	 * - 0.5: Medium brightness
	 * - 1: Maximum brightness (full intensity)
	 *
	 * In HSV, the Value component directly controls how bright the color
	 * appears. Unlike HSL's lightness, HSV's value represents the color's
	 * own brightness rather than how much white is mixed in.
	 *
	 * @returns {number} The value (brightness) between 0 and 1
	 */
	public get V(): number {
		return this.components[2];
	}

	/**
	 * Sets the Value component value (0-1).
	 *
	 * @param value - The value (brightness) to set between 0 and 1
	 * @throws {ColorError} When value is NaN, infinite, or outside the valid range of 0-1
	 *
	 * @remarks
	 * Performs strict validation to ensure color integrity:
	 * - Checks for NaN and infinite values
	 * - Enforces value range between 0 and 1
	 * - Throws descriptive errors for invalid values
	 *
	 * @example
	 * ```typescript
	 * const color = new HSV(120, 1, 0.5);
	 * color.V = 0.8; // Make brighter
	 * console.log(color.V); // 0.8
	 * ```
	 */
	public set V(value: number) {
		HSV._AssertComponent('V', value);
		this.components[2] = value;
	}

	/**
	 * Creates a new HSV color instance.
	 *
	 * @param h - Hue component in degrees (0-360, default: 0)
	 * @param s - Saturation component as decimal (0-1, default: 0)
	 * @param v - Value component as decimal (0-1, default: 0)
	 * @throws {ColorError} When any component value is invalid
	 *
	 * @remarks
	 * The constructor validates all input parameters to ensure they fall within
	 * their valid ranges. Invalid values will cause a ColorError to be thrown
	 * with a descriptive message indicating which component is out of range.
	 *
	 * @example
	 * ```typescript
	 * // Create a pure red color
	 * const red = new HSV(0, 1, 1);
	 *
	 * // Create a dark green color
	 * const darkGreen = new HSV(120, 1, 0.5);
	 *
	 * // Create a default black color
	 * const black = new HSV(); // HSV(0, 0, 0)
	 *
	 * // Create a bright yellow color
	 * const yellow = new HSV(60, 1, 1);
	 * ```
	 */
	constructor(h: number = 0, s: number = 0, v: number = 0) {
		super();
		this.components = [0, 0, 0]; // Initialize with defaults
		// Use setters to validate component values
		this.H = h;
		this.S = s;
		this.V = v;
	}

	/**
	 * Returns a string representation of the HSV color.
	 *
	 * @param format - The format of the string: 'int' for degree/percent or 'float' (default) for decimal values
	 * @returns A string in the format "HSV(H, S, V)" or "HSV(H°, S%, V%)"
	 *
	 * @remarks
	 * The format parameter controls the output representation:
	 * - 'float' (default): Shows decimal values (e.g., "HSV(240, 0.8, 0.5)")
	 * - 'int': Shows degrees and percentages (e.g., "HSV(240°, 80%, 50%)")
	 *
	 * @example
	 * ```typescript
	 * const color = new HSV(240, 0.8, 0.5);
	 *
	 * console.log(color.ToString()); // "HSV(240, 0.8, 0.5)"
	 * console.log(color.ToString('float')); // "HSV(240, 0.8, 0.5)"
	 * console.log(color.ToString('int')); // "HSV(240°, 80%, 50%)"
	 * ```
	 */
	public override ToString(format: 'int' | 'float' = 'float'): string {
		if (format === 'float') {
			return `HSV(${this.components.join(', ')})`;
		}

		const s = Math.round(this.S * 100);
		const v = Math.round(this.V * 100);

		return `HSV(${this.H}°, ${s}%, ${v}%)`;
	}

	/**
	 * Type guard assertion function that validates if a value is an instance of HSV.
	 * Throws a TypeError if the provided value is not an HSV instance.
	 *
	 * @param c - The value to validate as an HSV instance
	 * @throws {TypeError} When the value is not an instance of HSV
	 *
	 * @example
	 * ```typescript
	 * const value: unknown = getColorFromSomewhere();
	 * HSV.Assert(value); // value is now typed as HSV
	 * console.log(value.H, value.S, value.V); // Safe to use HSV properties
	 * ```
	 */	public static override Assert(color: unknown): asserts color is HSV {
		AssertInstanceOf(color, HSV, { class: ColorError, message: 'Expected instance of HSV' });
		const hsvColor = color as HSV;
		HSV._AssertComponent('H', hsvColor);
		HSV._AssertComponent('S', hsvColor);
		HSV._AssertComponent('V', hsvColor);
	}

	private static _AssertComponent(component: THSVComponentSelection, color: HSV): void;
	private static _AssertComponent(component: THSVComponentSelection, value: number): void;
	private static _AssertComponent(component: THSVComponentSelection, colorOrValue: HSV | number): void {
		switch (component) {
			case 'H': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.H;
				AssertNumber(value, { gte: 0, lte: 360, finite: true }, { class: ColorError, message: 'Invalid Channel(H)' });
				break;
			}
			case 'S': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.S;
				AssertNumber(value, { gte: 0, lte: 1, finite: true }, { class: ColorError, message: 'Invalid Channel(S)' });
				break;
			}
			case 'V': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.V;
				AssertNumber(value, { gte: 0, lte: 1, finite: true }, { class: ColorError, message: 'Invalid Channel(V)' });
				break;
			}
		}
	}

	/**
	 * Validates if the given object is a valid HSV color instance.
	 *
	 * @param color - The object to validate as an HSV instance
	 * @returns True if the object is a valid HSV color, false otherwise
	 *
	 * @remarks
	 * This method performs the same validation as Assert() but returns a boolean
	 * instead of throwing an error. It's useful for conditional logic where
	 * you need to check validity without exception handling.
	 *
	 * Validation includes:
	 * - Instance type check (must be HSV)
	 * - H component must be 0-360 and finite
	 * - S and V components must be 0-1 and finite
	 *
	 * @example
	 * ```typescript
	 * const maybeHSV: unknown = getSomeValue();
	 * if (HSV.Validate(maybeHSV)) {
	 *   console.log('Valid HSV color');
	 * } else {
	 *   console.log('Invalid HSV color');
	 * }
	 * ```
	 */
	public static override Validate(color: unknown): boolean {
		try {
			HSV.Assert(color);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Creates an HSV color from another color space.
	 *
	 * @param color - The source color to convert from (RGB or HSL)
	 * @returns A new HSV color instance
	 * @throws {ColorError} When the source color type is not supported
	 *
	 * @remarks
	 * This method acts as a dispatcher to the appropriate conversion method
	 * based on the type of the input color. Currently supports:
	 * - RGB to HSV conversion
	 * - HSL to HSV conversion
	 *
	 * @example
	 * ```typescript
	 * // Convert from RGB
	 * const rgb = new RGB(1, 0.5, 0);
	 * const hsvFromRgb = HSV.From(rgb);
	 *
	 * // Convert from HSL
	 * const hsl = new HSL(60, 1, 0.5);
	 * const hsvFromHsl = HSV.From(hsl);
	 * ```
	 */
	public static From(color: RGB | HSL): HSV {
		if (color instanceof HSL) return HSV.FromHSL(color);
		if (color instanceof RGB) return HSV.FromRGB(color);
		throw new ColorError('Cannot convert to HSV');
	}

	/**
	 * Converts an HSL color to HSV.
	 *
	 * @param color - The HSL color to convert
	 * @returns A new HSV color instance
	 *
	 * @remarks
	 * This conversion uses the mathematical relationship between HSL and HSV:
	 * - Hue remains the same in both color spaces
	 * - Value = Lightness + (Saturation × min(Lightness, 1 - Lightness))
	 * - Saturation = 2 × (1 - Lightness/Value) when Value ≠ 0, otherwise 0
	 */
	public static FromHSL(color: HSL): HSV {
		HSL.Validate(color);

		// Create vector for HSL coordinate processing
		const hslVector: TVector3 = [color.H, color.S, color.L];

		// Use vector-based cylindrical coordinate transformation
		const [, saturation, lightness] = hslVector;

		// Calculate value using HSL to HSV cylindrical coordinate conversion
		const v = lightness + (saturation * Math.min(lightness, 1 - lightness));
		const s = v === 0 ? 0 : 2 * (1 - (lightness / v));

		return new HSV(hslVector[0], s, v);
	}

	/**
	 * Converts an RGB color to HSV.
	 *
	 * @param color - The RGB color to convert
	 * @returns A new HSV color instance
	 *
	 * @remarks
	 * This conversion implements the standard RGB to HSV algorithm:
	 * 1. Find the maximum and minimum RGB values
	 * 2. Calculate value as the maximum RGB component
	 * 3. Calculate saturation based on the delta and maximum value
	 * 4. Calculate hue based on which channel has the maximum value
	 */
	public static FromRGB(color: RGB): HSV {
		RGB.Validate(color);

		// Create RGB vector for efficient coordinate processing
		const rgbVector: TVector3 = [color.R, color.G, color.B];

		// Use vector-based cylindrical coordinate calculations
		const cMax = Math.max(...rgbVector);
		const cMin = Math.min(...rgbVector);
		const delta = cMax - cMin;

		let h = 0;

		// Hue calculation using vector-based coordinate transformations
		if (delta !== 0) {
			if (cMax === rgbVector[0]) { // Red channel dominant
				const gb = (rgbVector[1] - rgbVector[2]) / delta;

				// If gb < 0, add 360 to keep hue positive
				if (gb < 0) {
					h = 60 * (6 + gb);
				} else {
					h = 60 * (gb % 6);
				}
			} else if (cMax === rgbVector[1]) { // Green channel dominant
				h = 60 * (((rgbVector[2] - rgbVector[0]) / delta) + 2);
			} else if (cMax === rgbVector[2]) { // Blue channel dominant
				h = 60 * (((rgbVector[0] - rgbVector[1]) / delta) + 4);
			}
		}

		// Saturation calculation with vector-based division safety
		let s = 0;
		if (cMax !== 0) {
			s = delta / cMax;
		}

		return new HSV(h, s, cMax);
	}
}
