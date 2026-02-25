/* eslint-disable no-magic-numbers */
import { AssertInstanceOf, AssertNumber } from './assert.js';
import { TVector3 } from '@pawells/math-extended';
import { ColorSpace } from './_color-space.js';
import { HSV } from './hsv.js';
import { RGB } from './rgb.js';
import { ColorSpaceManager } from './manager.js';
import { ColorError } from '../error.js';

type THSLComponentSelection = 'H' | 'S' | 'L';

/**
 * Represents a color in the HSL (Hue, Saturation, Lightness) color space.
 *
 * The HSL color model is a cylindrical-coordinate representation of colors
 * that is often considered more intuitive than the RGB model for color selection
 * and manipulation. It represents colors through their perceptual attributes:
 *
 * @remarks
 * HSL is particularly useful for:
 * - Color picking interfaces where users adjust hue, saturation, and lightness independently
 * - Creating color harmonies and palettes
 * - Implementing color adjustments (brightening, darkening, desaturating)
 * - Accessibility calculations where lightness is a key factor
 *
 * Component Ranges:
 * - H (Hue): [0, 360] degrees on the color wheel (red=0°, green=120°, blue=240°)
 * - S (Saturation): [0, 1] where 0 = grayscale and 1 = fully saturated color
 * - L (Lightness): [0, 1] where 0 = black, 0.5 = normal color, 1 = white
 *
 * @example
 * ```typescript
 * // Create a pure red color
 * const red = new HSL(0, 1, 0.5);
 *
 * // Create a desaturated blue
 * const grayishBlue = new HSL(240, 0.3, 0.6);
 *
 * // Create a dark green
 * const darkGreen = new HSL(120, 0.8, 0.3);
 *
 * // Convert to RGB for display
 * const rgb = red.ToRGB();
 * console.log(`RGB: ${rgb.R}, ${rgb.G}, ${rgb.B}`);
 *
 * // Adjust lightness
 * const lighterColor = new HSL(red.H, red.S, Math.min(red.L + 0.2, 1));
 * ```
 */
@ColorSpaceManager.Register({
	name: 'HSL',
	description: 'Represents a color in the HSL (Hue, Saturation, Lightness) color space.',
	converters: [
		'RGB',
		'HSV',
	],
})
export class HSL extends ColorSpace {
	/**
	 * Internal array storing the HSL component values [H, S, L].
	 * Values are normalized floating-point numbers between 0 and 1.
	 *
	 * Direct access to this array should be avoided in favor of using the
	 * public H, S, and L properties which include proper validation.
	 */
	protected override components: [number, number, number];

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
	 * @returns {number} The hue value in degrees (0-360)
	 */
	public get H(): number {
		return this.components[0];
	}

	/**
	 * Sets the Hue component value (0-360 degrees).
	 *
	 * @param value - The new hue value in degrees (0-360)
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
	 * const color = new HSL(0, 1, 0.5);
	 * color.H = 120; // Change to green hue
	 * console.log(color.H); // 120
	 * ```
	 */
	public set H(value: number) {
		HSL._AssertComponent('H', value);
		this.components[0] = value;
	}

	/**
	 * Gets the Saturation component value (0-1).
	 *
	 * @remarks
	 * The saturation represents the intensity or purity of the color:
	 * - 0: No saturation (grayscale, only lightness matters)
	 * - 0.5: Moderately saturated color
	 * - 1: Fully saturated, pure color
	 *
	 * @returns {number} The saturation value between 0 and 1
	 */
	public get S(): number {
		return this.components[1];
	}

	/**
	 * Sets the Saturation component value (0-1).
	 *
	 * @param value - The new saturation value between 0 and 1
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
	 * const color = new HSL(240, 0.5, 0.5);
	 * color.S = 1; // Make fully saturated
	 * console.log(color.S); // 1
	 * ```
	 */
	public set S(value: number) {
		HSL._AssertComponent('S', value);
		this.components[1] = value;
	}

	/**
	 * Gets the Lightness component value (0-1).
	 *
	 * @remarks
	 * The lightness represents the perceived brightness of the color:
	 * - 0: Black (no lightness)
	 * - 0.5: Normal color brightness (pure hue)
	 * - 1: White (maximum lightness)
	 *
	 * Unlike brightness in other color models, lightness in HSL maintains
	 * the hue and saturation characteristics as it approaches white or black.
	 *
	 * @returns {number} The lightness value between 0 and 1
	 */
	public get L(): number {
		return this.components[2];
	}

	/**
	 * Sets the Lightness component value (0-1).
	 *
	 * @param value - The new lightness value between 0 and 1
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
	 * const color = new HSL(240, 1, 0.3);
	 * color.L = 0.7; // Make lighter
	 * console.log(color.L); // 0.7
	 * ```
	 */
	public set L(value: number) {
		HSL._AssertComponent('L', value);
		this.components[2] = value;
	}

	/**
	 * Creates a new HSL color instance.
	 *
	 * @param h - Hue component in degrees (0-360, default: 0)
	 * @param s - Saturation component as decimal (0-1, default: 0)
	 * @param l - Lightness component as decimal (0-1, default: 0)
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
	 * const red = new HSL(0, 1, 0.5);
	 *
	 * // Create a light blue color
	 * const lightBlue = new HSL(240, 0.8, 0.7);
	 *
	 * // Create a default black color
	 * const black = new HSL(); // HSL(0, 0, 0)
	 *
	 * // Create a specific gray color
	 * const gray = new HSL(0, 0, 0.5);
	 * ```
	 */
	constructor(h: number = 0, s: number = 0, l: number = 0) {
		super();
		this.components = [0, 0, 0]; // Initialize with defaults
		// Use setters to validate component values
		this.H = h;
		this.S = s;
		this.L = l;
	}

	/**
	 * Returns a string representation of the HSL color.
	 *
	 * @param format - Output format: 'int' for degree/percentage or 'float' (default) for decimal values
	 * @returns A string in the format "HSL(H, S, L)" or "HSL(H°, S%, L%)"
	 *
	 * @remarks
	 * The format parameter controls the output representation:
	 * - 'float' (default): Shows decimal values (e.g., "HSL(240, 0.8, 0.5)")
	 * - 'int': Shows degrees and percentages (e.g., "HSL(240°, 80%, 50%)")
	 *
	 * @example
	 * ```typescript
	 * const color = new HSL(240, 0.8, 0.5);
	 *
	 * console.log(color.ToString()); // "HSL(240, 0.8, 0.5)"
	 * console.log(color.ToString('float')); // "HSL(240, 0.8, 0.5)"
	 * console.log(color.ToString('int')); // "HSL(240°, 80%, 50%)"
	 * ```
	 */
	public override ToString(format?: 'int' | 'float'): string {
		if (format === undefined || format === 'float') {
			return `HSL(${this.H}, ${this.S}, ${this.L})`;
		}

		const s = Math.round(this.S * 100);
		const l = Math.round(this.L * 100);

		return `HSL(${this.H}°, ${s}%, ${l}%)`;
	}

	/**
	 * Type guard assertion function that validates if a value is an instance of HSL.
	 * Throws a TypeError if the provided value is not an HSL instance.
	 *
	 * @param c - The value to validate as an HSL instance
	 * @throws {TypeError} When the value is not an instance of HSL
	 *
	 * @example
	 * ```typescript
	 * const value: unknown = getColorFromSomewhere();
	 * HSL.Assert(value); // value is now typed as HSL
	 * console.log(value.H, value.S, value.L); // Safe to use HSL properties
	 * ```
	 */	public static override Assert(color: unknown): asserts color is HSL {
		AssertInstanceOf(color, HSL, { class: ColorError, message: 'Expected instance of HSL' });
		const hslColor = color as HSL;
		HSL._AssertComponent('H', hslColor);
		HSL._AssertComponent('S', hslColor);
		HSL._AssertComponent('L', hslColor);
	}

	private static _AssertComponent(component: THSLComponentSelection, color: HSL): void;
	private static _AssertComponent(component: THSLComponentSelection, value: number): void;
	private static _AssertComponent(component: THSLComponentSelection, colorOrValue: HSL | number): void {
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
			case 'L': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.L;
				AssertNumber(value, { gte: 0, lte: 1, finite: true }, { class: ColorError, message: 'Invalid Channel(L)' });
				break;
			}
		}
	}

	/**
	 * Validates that an object is a valid HSL color.
	 *
	 * @param color - The object to validate as an HSL instance
	 * @returns True if the object is a valid HSL color, false otherwise
	 *
	 * @remarks
	 * This method performs the same validation as Assert() but returns a boolean
	 * instead of throwing an error. It's useful for conditional logic where
	 * you need to check validity without exception handling.
	 *
	 * @example
	 * ```typescript
	 * const maybeHSL: unknown = getSomeValue();
	 * if (HSL.Validate(maybeHSL)) {
	 *   // Safe to use as HSL (though TypeScript won't narrow the type)
	 *   console.log('Valid HSL color');
	 * } else {
	 *   console.log('Invalid HSL color');
	 * }
	 * ```
	 */
	public static override Validate(color: unknown): boolean {
		try {
			HSL.Assert(color);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Creates an HSL color from another color space.
	 *
	 * @param color - The source color to convert from (RGB or HSV)
	 * @returns A new HSL color instance
	 * @throws {ColorError} When the source color type is not supported
	 *
	 * @remarks
	 * This method acts as a dispatcher to the appropriate conversion method
	 * based on the type of the input color. Currently supports:
	 * - RGB to HSL conversion
	 * - HSV to HSL conversion
	 *
	 * @example
	 * ```typescript
	 * // Convert from RGB
	 * const rgb = new RGB(1, 0.5, 0);
	 * const hslFromRgb = HSL.From(rgb);
	 *
	 * // Convert from HSV
	 * const hsv = new HSV(60, 1, 1);
	 * const hslFromHsv = HSL.From(hsv);
	 * ```
	 */
	public static From(color: RGB | HSV): HSL {
		if (color instanceof RGB) return HSL.FromRGB(color);
		if (color instanceof HSV) return HSL.FromHSV(color);
		throw new ColorError('Cannot convert to HSL');
	}

	/**
	 * Converts an HSV color to HSL.
	 *
	 * @param color - The HSV color to convert
	 * @returns A new HSL color instance
	 *
	 * @remarks
	 * This conversion uses the mathematical relationship between HSV and HSL:
	 * - Hue remains the same in both color spaces
	 * - Lightness = Value - (Value × Saturation ÷ 2)
	 * - Saturation = (Value - Lightness) ÷ min(Lightness, 1 - Lightness)
	 */
	public static FromHSV(color: HSV): HSL {
		HSV.Validate(color);

		// Create HSV vector for enhanced cylindrical coordinate transformations
		const hsvVector: TVector3 = [color.H, color.S, color.V];

		// Calculate lightness using vector-optimized HSV to HSL conversion
		const lightness = hsvVector[2] - (hsvVector[2] * hsvVector[1] / 2);

		// Calculate saturation using vector operations for cylindrical coordinate conversion
		const denominator = Math.min(lightness, 1 - lightness);
		let saturation = denominator !== 0 ? (hsvVector[2] - lightness) / denominator : 0;

		// Handle NaN case for cylindrical coordinate safety
		if (Number.isNaN(saturation)) saturation = 0;

		// Create result vector with validated cylindrical coordinates
		const hslResult: TVector3 = [hsvVector[0], saturation, lightness]; // [H, S, L]

		// Ensure finite values for all cylindrical coordinate components
		const finalHSL: TVector3 = [
			Number.isFinite(hslResult[0]) ? hslResult[0] : 0,
			Number.isFinite(hslResult[1]) ? hslResult[1] : 0,
			Number.isFinite(hslResult[2]) ? hslResult[2] : 0,
		];

		return new HSL(finalHSL[0], finalHSL[1], finalHSL[2]);
	}

	/**
	 * Converts an RGB color to HSL.
	 *
	 * @param color - The RGB color to convert
	 * @returns A new HSL color instance
	 *
	 * @remarks
	 * This conversion implements the standard RGB to HSL algorithm:
	 * 1. Find the maximum and minimum RGB values
	 * 2. Calculate lightness as (max + min) / 2
	 * 3. Calculate saturation based on the delta and lightness
	 * 4. Calculate hue based on which channel has the maximum value
	 */
	public static FromRGB(color: RGB): HSL {
		RGB.Validate(color);

		// Create RGB vector for enhanced type safety and vector operations
		const rgbVector: TVector3 = [color.R, color.G, color.B];

		// Use vector operations for min/max calculations - more efficient for cylindrical coordinate analysis
		const cMax = Math.max(rgbVector[0], rgbVector[1], rgbVector[2]);
		const cMin = Math.min(rgbVector[0], rgbVector[1], rgbVector[2]);
		const delta = cMax - cMin;

		// Initialize result vector for HSL components
		const hslResult: TVector3 = [0, 0, 0]; // [H, S, L]		// Calculate lightness using vector-based coordinate operations
		hslResult[2] = (cMax + cMin) / 2; // L = (max + min) / 2

		// Calculate hue using cylindrical coordinate transformations
		if (delta !== 0) {
			// Determine hue based on dominant color channel using vector indexing
			if (cMax === rgbVector[0]) { // Red is dominant
				const gb = (rgbVector[1] - rgbVector[2]) / delta;
				if (gb < 0) {
					hslResult[0] = 60 * (6 + gb);
				} else {
					hslResult[0] = 60 * (gb % 6);
				}
			} else if (cMax === rgbVector[1]) { // Green is dominant
				hslResult[0] = 60 * (((rgbVector[2] - rgbVector[0]) / delta) + 2);
			} else if (cMax === rgbVector[2]) { // Blue is dominant
				hslResult[0] = 60 * (((rgbVector[0] - rgbVector[1]) / delta) + 4);
			}

			// Calculate saturation using vector-optimized lightness calculation
			hslResult[1] = delta / (1 - Math.abs((2 * hslResult[2]) - 1));
		}

		// Ensure finite values for cylindrical coordinate safety
		const finalHSL: TVector3 = [
			Number.isFinite(hslResult[0]) ? hslResult[0] : 0,
			Number.isFinite(hslResult[1]) ? hslResult[1] : 0,
			Number.isFinite(hslResult[2]) ? hslResult[2] : 0,
		];

		return new HSL(finalHSL[0], finalHSL[1], finalHSL[2]);
	}
}
