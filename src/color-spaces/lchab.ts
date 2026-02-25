/* eslint-disable no-magic-numbers */
import { TVector3, RadiansToDegrees } from '@pawells/math-extended';
import { AssertInstanceOf, AssertNumber } from './assert.js';
import { ColorSpace } from './_color-space.js';
import { Lab } from './lab.js';
import { ColorSpaceManager } from './manager.js';
import { ColorError } from '../error.js';

type TLCHabComponentSelection = 'L' | 'C' | 'H';

/**
 * Represents a color in the CIE LCHab (Lightness, Chroma, Hue) color space.
 *
 * LCHab is a cylindrical representation of the CIE L*a*b* color space that transforms
 * the Cartesian coordinates (L*, a*, b*) into polar coordinates (L*, C*, H*), making
 * color manipulation more intuitive for human perception and color design workflows.
 *
 * ## Color Components
 * - **L (Lightness)**: 0-100, where 0 is absolute black and 100 is diffuse white
 * - **C (Chroma)**: 0+ (theoretically unbounded), representing color intensity/saturation
 * - **H (Hue)**: 0-360 degrees, representing the angle on the color wheel
 *
 * ## Key Advantages
 * - **Perceptually uniform**: Equal distances in LCHab space correspond to roughly equal perceptual differences
 * - **Intuitive manipulation**: Easier to adjust lightness, saturation, and hue independently
 * - **Color harmony**: Facilitates creation of harmonious color schemes using hue relationships
 * - **Gamut mapping**: Better for color space transformations and gamut boundary calculations
 *
 * ## Common Use Cases
 * - Color palette generation and harmonization
 * - Perceptually uniform color interpolation
 * - Color difference calculations (Delta E)
 * - Print and display color management
 * - Accessibility contrast ratio analysis
 *
 * @example Basic color creation and manipulation
 * ```typescript
 * // Create a medium blue color
 * const blue = new LCHab(50, 60, 270);
 * console.log(blue.ToString()); // "LCHab(50, 60, 270)"
 *
 * // Adjust individual components
 * blue.L = 75; // Make lighter
 * blue.C = 80; // Make more saturated
 * blue.H = 240; // Shift hue towards purple
 * ```
 *
 * @example Color harmony and palette generation
 * ```typescript
 * const baseColor = new LCHab(60, 50, 120); // Green
 *
 * // Create complementary color (opposite hue)
 * const complement = new LCHab(baseColor.L, baseColor.C, (baseColor.H + 180) % 360);
 *
 * // Create triadic harmony
 * const triad1 = new LCHab(baseColor.L, baseColor.C, (baseColor.H + 120) % 360);
 * const triad2 = new LCHab(baseColor.L, baseColor.C, (baseColor.H + 240) % 360);
 * ```
 *
 * @example Converting from Lab coordinate space
 * ```typescript
 * const labColor = new Lab(50, 20, -30);
 * const lchColor = LCHab.From(labColor);
 * console.log(`Converted: ${lchColor.ToString()}`);
 * ```
 */
@ColorSpaceManager.Register({
	name: 'LCHab',
	description: 'Represents a color in the CIE LCHab color space.',
	converters: [
		'Lab',
	],
})
export class LCHab extends ColorSpace {
	/** Internal array storing the LCHab component values [L, C, H] */
	protected override components: TVector3;

	/**
	 * Gets the Lightness component value (0-100).
	 *
	 * Lightness represents the perceptual brightness of the color, where:
	 * - 0 = absolute black (no light reflection)
	 * - 50 = middle gray (18% reflectance)
	 * - 100 = diffuse white (perfect diffuser)
	 *
	 * @example
	 * ```typescript
	 * const color = new LCHab(75, 40, 120);
	 * console.log(color.L); // 75 (fairly light)
	 * ```
	 */
	public get L(): number {
		return this.components[0];
	}

	/**
	 * Sets the Lightness component value.
	 *
	 * @param value - The Lightness value to set (0-100)
	 * @throws {ColorError} When value is outside valid range or not finite
	 *
	 * @example
	 * ```typescript
	 * const color = new LCHab(50, 30, 180);
	 * color.L = 25; // Make darker
	 * color.L = 85; // Make lighter
	 * ```
	 */
	public set L(value: number) {
		LCHab._AssertComponent('L', value);
		this.components[0] = value;
	}

	/**
	 * Gets the Chroma component value (0+).
	 *
	 * Chroma represents the colorfulness or saturation intensity of the color:
	 * - 0 = achromatic (no color, pure gray)
	 * - Low values (0-30) = muted, desaturated colors
	 * - Medium values (30-60) = moderately saturated colors
	 * - High values (60+) = vivid, highly saturated colors
	 *
	 * Note: Maximum achievable chroma varies by hue and lightness.
	 * Some hue/lightness combinations cannot reach high chroma values
	 * within the visible gamut.
	 *
	 * @example
	 * ```typescript
	 * const gray = new LCHab(50, 0, 0);     // No chroma = gray
	 * const pastel = new LCHab(80, 20, 45); // Low chroma = pastel
	 * const vivid = new LCHab(60, 80, 45);  // High chroma = vivid
	 * ```
	 */
	public get C(): number {
		return this.components[1];
	}

	/**
	 * Sets the Chroma component value.
	 *
	 * @param value - The Chroma value to set (0+, typically 0-100+ depending on color)
	 * @throws {ColorError} When value is negative or not finite
	 *
	 * @example
	 * ```typescript
	 * const color = new LCHab(60, 40, 210);
	 * color.C = 10;  // Desaturate (make more gray)
	 * color.C = 70;  // Saturate (make more vivid)
	 * color.C = 0;   // Remove all color (pure gray)
	 * ```
	 */
	public set C(value: number) {
		LCHab._AssertComponent('C', value);
		this.components[1] = value;
	}	/**
	 * Gets the Hue component value (0-360 degrees).
	 *
	 * Hue represents the dominant wavelength or color family:
	 * - 0°/360° = Red
	 * - 60° = Yellow
	 * - 120° = Green
	 * - 180° = Cyan
	 * - 240° = Blue
	 * - 300° = Magenta
	 *
	 * Hue angles form a continuous circle, so 0° and 360° represent
	 * the same color. The hue component is most meaningful when
	 * chroma is greater than 0 (for achromatic colors, hue is undefined).
	 *
	 * @example
	 * ```typescript
	 * const red = new LCHab(50, 60, 0);     // Pure red hue
	 * const yellow = new LCHab(90, 80, 60); // Yellow hue
	 * const blue = new LCHab(40, 70, 240);  // Blue hue
	 *
	 * console.log(red.H);    // 0
	 * console.log(yellow.H); // 60
	 * console.log(blue.H);   // 240
	 * ```
	 */

	public get H(): number {
		return this.components[2];
	}

	/**
	 * Sets the Hue component value.
	 *
	 * @param value - The Hue value to set (0-360 degrees)
	 * @throws {ColorError} When value is outside valid range or not finite
	 *
	 * @example
	 * ```typescript
	 * const color = new LCHab(60, 50, 120); // Start with green
	 * color.H = 0;     // Change to red
	 * color.H = 240;   // Change to blue
	 * color.H = 60;    // Change to yellow
	 *
	 * // Create color variations by shifting hue
	 * const baseHue = 180;
	 * color.H = (baseHue + 30) % 360; // Shift hue by 30 degrees
	 * ```
	 */
	public set H(value: number) {
		LCHab._AssertComponent('H', value);
		this.components[2] = value;
	}

	/**
	 * Creates a new LCHab color instance.
	 *
	 * All parameters are validated to ensure they fall within acceptable ranges.
	 * Invalid values will throw a ColorError during construction.
	 *
	 * @param l - Lightness component (0-100, default: 0)
	 *            0 = absolute black, 100 = diffuse white
	 * @param c - Chroma component (0+, default: 0)
	 *            0 = achromatic (gray), higher values = more saturated
	 * @param h - Hue component (0-360 degrees, default: 0)
	 *            0/360 = red, 120 = green, 240 = blue
	 *
	 * @throws {ColorError} When any parameter is outside valid range or not finite
	 *
	 * @example Basic construction
	 * ```typescript
	 * const black = new LCHab();              // LCHab(0, 0, 0)
	 * const white = new LCHab(100, 0, 0);     // Pure white
	 * const red = new LCHab(50, 60, 0);       // Medium red
	 * const blue = new LCHab(40, 70, 240);    // Vivid blue
	 * ```
	 *
	 * @example Color design workflow
	 * ```typescript
	 * // Start with a base color
	 * const baseColor = new LCHab(60, 50, 120); // Medium green
	 *
	 * // Create variations by adjusting individual components
	 * const lighter = new LCHab(80, 50, 120);   // Lighter version
	 * const muted = new LCHab(60, 25, 120);     // Desaturated version
	 * const warm = new LCHab(60, 50, 90);       // Warmer hue
	 * ```
	 */
	constructor(l: number = 0, c: number = 0, h: number = 0) {
		super();
		this.components = [0, 0, 0]; // Initialize to defaults
		this.L = l; // Use setters for validation
		this.C = c;
		this.H = h;
	}

	/**
	 * Returns a string representation of the LCHab color.
	 *
	 * The format follows the pattern "LCHab(L, C, H)" where values are
	 * displayed with their natural precision (no forced decimal places).
	 *
	 * @returns A string in the format "LCHab(L, C, H)"
	 *
	 * @example
	 * ```typescript
	 * const color = new LCHab(65.5, 42.3, 127.8);
	 * console.log(color.ToString()); // "LCHab(65.5, 42.3, 127.8)"
	 *
	 * const simple = new LCHab(50, 30, 180);
	 * console.log(simple.ToString()); // "LCHab(50, 30, 180)"
	 * ```
	 */
	public override ToString(): string {
		return `LCHab(${this.L}, ${this.C}, ${this.H})`;
	}	/**
	 * Type guard assertion function that validates if a value is an instance of LCHab.
	 *
	 * This method performs comprehensive validation by first checking if the value
	 * is an instance of LCHab, then validating that all component values are within
	 * their valid ranges and are finite numbers.
	 *
	 * @param color - The value to validate as an LCHab instance
	 * @throws {ColorError} When the value is not an instance of LCHab
	 * @throws {ColorError} When L component is not finite or outside range [0, ∞)
	 * @throws {ColorError} When C component is not finite or outside range [0, ∞)
	 * @throws {ColorError} When H component is not finite or outside range [0, 360]
	 *
	 * @example Type narrowing with validation
	 * ```typescript
	 * function processColor(value: unknown) {
	 *   LCHab.Assert(value); // value is now typed as LCHab
	 *
	 *   // Safe to use LCHab properties after assertion
	 *   console.log(`Lightness: ${value.L}`);
	 *   console.log(`Chroma: ${value.C}`);
	 *   console.log(`Hue: ${value.H}`);
	 * }
	 * ```
	 *
	 * @example Error handling in validation
	 * ```typescript
	 * try {
	 *   const unknownValue = getUserInput();
	 *   LCHab.Assert(unknownValue);
	 *   // Process valid LCHab color
	 * } catch (error) {
	 *   console.error('Invalid LCHab color:', error.message);
	 * }
	 * ```
	 */

	public static override Assert(color: unknown): asserts color is LCHab {
		AssertInstanceOf(color, LCHab, { class: ColorError, message: 'Expected instance of LCHab' });
		const lchabColor = color as LCHab;
		LCHab._AssertComponent('L', lchabColor);
		LCHab._AssertComponent('C', lchabColor);
		LCHab._AssertComponent('H', lchabColor);
	}

	/**
	 * Validates that an object is a valid LCHab color instance.
	 *
	 * This method provides a non-throwing validation approach that returns
	 * a boolean result instead of throwing errors. It internally uses the
	 * Assert method to perform validation but catches any errors and returns
	 * false instead of propagating them.
	 *
	 * @param color - The object to validate
	 * @returns `true` if the object is a valid LCHab color, `false` otherwise
	 *
	 * @example Conditional processing based on validation
	 * ```typescript
	 * function processColorSafely(input: unknown) {
	 *   if (LCHab.Validate(input)) {
	 *     // TypeScript knows input is LCHab here
	 *     console.log(`Valid LCHab: ${input.ToString()}`);
	 *     return input;
	 *   } else {
	 *     console.log('Invalid color input, using default');
	 *     return new LCHab(50, 0, 0); // Default gray
	 *   }
	 * }
	 * ```
	 *
	 * @example Filtering arrays of potential colors
	 * ```typescript
	 * const mixedData: unknown[] = [
	 *   new LCHab(60, 40, 120),
	 *   'invalid',
	 *   new LCHab(30, 50, 240),
	 *   null,
	 *   new LCHab(80, 20, 60)
	 * ];
	 *
	 * const validColors = mixedData.filter(LCHab.Validate) as LCHab[];
	 * console.log(`Found ${validColors.length} valid LCHab colors`);
	 * ```
	 */
	public static override Validate(color: unknown): boolean {
		try {
			LCHab.Assert(color);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Converts a color from another color space to LCHab.
	 *
	 * Currently supports conversion from:
	 * - Lab (CIE L*a*b*) color space
	 *
	 * This method serves as the main entry point for color space conversions
	 * to LCHab, automatically detecting the source color type and applying
	 * the appropriate conversion algorithm.
	 *
	 * @param color - The Lab color to convert
	 * @returns A new LCHab color instance
	 * @throws {ColorError} When the input color type is not supported
	 *
	 * @example Converting from Lab
	 * ```typescript
	 * const labColor = new Lab(50, 20, -30);
	 * const lchColor = LCHab.From(labColor);
	 * console.log(lchColor.ToString()); // "LCHab(50, 36.06, 303.69)"
	 * ```
	 *
	 * @example Batch conversion workflow
	 * ```typescript
	 * const labColors = [
	 *   new Lab(60, 15, 25),
	 *   new Lab(40, -10, 30),
	 *   new Lab(80, 5, -15)
	 * ];
	 *
	 * const lchColors = labColors.map(lab => LCHab.From(lab));
	 * console.log(`Converted ${lchColors.length} colors to LCHab`);
	 * ```
	 */
	public static From(color: Lab): LCHab {
		if (color instanceof Lab) return LCHab.FromLab(color);
		throw new ColorError('Cannot convert to LCHab');
	}

	/**
	 * Converts a Lab color to LCHab using cylindrical coordinate transformation.
	 *
	 * This conversion transforms the Cartesian coordinates (L*, a*, b*) of Lab
	 * color space into the polar coordinates (L*, C*, H*) of LCHab space:
	 *
	 * - L (Lightness): Remains unchanged from Lab
	 * - C (Chroma): Calculated as √(a² + b²) - the distance from the neutral axis
	 * - H (Hue): Calculated as atan2(b, a) converted to degrees - the angle from the a* axis
	 *
	 * @param color - The Lab color to convert (must be a validated Lab instance)
	 * @returns A new LCHab color instance with equivalent appearance
	 * @throws {ColorError} When the input Lab color is invalid
	 */
	public static FromLab(color: Lab): LCHab {
		Lab.Validate(color);

		let h = 360;

		if (color.A !== 0 || color.B !== 0) {
			h = Math.atan2(color.B, color.A);
			h = h > 0 ? RadiansToDegrees(h) : 360 + RadiansToDegrees(h);
		}

		const c = Math.sqrt(Math.pow(color.A, 2) + Math.pow(color.B, 2));

		return new LCHab(color.L, c, h);
	}

	/**
	 * Converts a Lab color to LCHab using cylindrical coordinate transformation.
	 *
	 * This conversion transforms the Cartesian coordinates (L*, a*, b*) of Lab
	 * color space into the polar coordinates (L*, C*, H*) of LCHab space:
	 *
	 * ## Mathematical Transformation
	 * - **L (Lightness)**: Remains unchanged from Lab
	 * - **C (Chroma)**: Calculated as √(a² + b²) - the distance from the neutral axis
	 * - **H (Hue)**: Calculated as atan2(b, a) converted to degrees - the angle from the a* axis
	 *
	 * ## Special Cases
	 * - When both a* and b* are 0 (achromatic colors), hue is set to 360° by convention
	 * - Negative hue angles are normalized to positive values by adding 360°
	 * - The conversion preserves perceptual uniformity from the original Lab space
	 *
	 * @param color - The Lab color to convert (must be a valid Lab instance)
	 * @returns A new LCHab color instance with equivalent appearance
	 *
	 * @internal This method is private and used internally by the From method
	 *
	 * @example Mathematical relationship demonstration
	 * ```typescript
	 * // Lab color with specific a* and b* values
	 * const lab = new Lab(50, 30, 40);  // L=50, a*=30, b*=40
	 * const lch = LCHab.FromLab(lab);
	 *
	 * // Verify mathematical relationships:
	 * // C = √(30² + 40²) = √(900 + 1600) = √2500 = 50
	 * console.log(lch.C); // 50
	 *
	 * // H = atan2(40, 30) * 180/π ≈ 53.13°
	 * console.log(lch.H); // ≈ 53.13
	 *
	 * // L remains the same
	 * console.log(lch.L); // 50
	 * ```
	 *
	 * @example Achromatic color handling
	 * ```typescript
	 * const grayLab = new Lab(50, 0, 0);     // Pure gray
	 * const grayLch = LCHab.FromLab(grayLab);
	 * console.log(grayLch.C); // 0 (no chroma)
	 * console.log(grayLch.H); // 360 (convention for undefined hue)
	 * ```
	 */
	private static _AssertComponent(component: TLCHabComponentSelection, color: LCHab): void;
	private static _AssertComponent(component: TLCHabComponentSelection, value: number): void;
	private static _AssertComponent(component: TLCHabComponentSelection, colorOrValue: LCHab | number): void {
		switch (component) {
			case 'L': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.L;
				AssertNumber(value, { finite: true, gte: 0, lte: 100 }, { class: ColorError, message: 'Channel(L) must be in range [0, 100].' });
				break;
			}
			case 'C': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.C;
				AssertNumber(value, { finite: true, gte: 0 }, { class: ColorError, message: 'Channel(C) must be a finite number greater than or equal to 0.' });
				break;
			}
			case 'H': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.H;
				AssertNumber(value, { finite: true, gte: 0, lte: 360 }, { class: ColorError, message: 'Channel(H) must be in range [0, 360].' });
				break;
			}
			default:
				throw new ColorError(`Unknown LCHab component: ${component}`);
		}
	}

	/**
	 * Asserts that a value is a valid LCHab color instance and throws an error if it's not.
	 *
	 * This method provides both runtime validation and TypeScript type narrowing.
	 * After calling this method, TypeScript will treat the parameter as a LCHab
	 * instance, enabling safe property access.
	 *
	 * The validation checks:
	 * - The value is an instance of LCHab
	 * - L component is non-negative and finite
	 * - C component is non-negative and finite
	 * - H component is between 0-360 degrees and finite
	 *
	 * @param color - The value to assert as LCHab
	 * @throws {TypeError} When the value is not a LCHab instance
	 * @throws {ColorError} When component values are invalid
	 *
	 * @example
	 * ```typescript
	 * try {
	 *   const unknownValue = getUserInput();
	 *   LCHab.Assert(unknownValue);
	 *   // Process valid LCHab color
	 * } catch (error) {
	 *   console.error('Invalid LCHab color:', error.message);
	 * }
	 * ```
	 */
}
