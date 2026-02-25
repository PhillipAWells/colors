/* eslint-disable no-magic-numbers */
import { TVector3, RadiansToDegrees } from '@pawells/math-extended';
import { AssertInstanceOf, AssertNumber } from './assert.js';
import { ColorSpace } from './_color-space.js';
import { LUV } from './luv.js';
import { ColorSpaceManager } from './manager.js';
import { ColorError } from '../error.js';

type TLCHuvComponentSelection = 'L' | 'C' | 'H';

/**
 * Represents a color in the CIE LCHuv (Lightness, Chroma, Hue) color space.
 *
 * LCHuv is a cylindrical representation of the CIE LUV color space that transforms
 * the Cartesian coordinates (L*, u*, v*) into polar coordinates (L*, C*uv, H*uv),
 * providing a more intuitive interface for color manipulation based on perceptual
 * uniformity for light sources and self-luminous objects.
 *
 * ## Color components
 * - **L (Lightness)**: 0-100, where 0 is absolute black and 100 is diffuse white
 * - **C (Chroma)**: 0+ (theoretically unbounded), representing color intensity/saturation
 * - **H (Hue)**: 0-360 degrees, representing the angle on the color wheel
 *
 * ## Key Characteristics
 * - **Light source optimization**: More accurate for emissive displays and light sources than LCHab
 * - **Perceptual uniformity**: Equal distances correspond to roughly equal perceptual differences
 * - **Display applications**: Better suited for monitor calibration and digital color workflows
 * - **Additive color systems**: Optimized for RGB-based systems and light-emitting displays
 *
 * ## Differences from LCHab
 * - LCHuv is derived from LUV (optimized for light sources)
 * - LCHab is derived from Lab (optimized for surface colors)
 * - LCHuv performs better for additive color systems
 * - LCHab performs better for subtractive color systems (printing)
 *
 * ## Common Use Cases
 * - Monitor and display color management
 * - Digital imaging and screen-based applications
 * - Light source color specification
 * - Color difference calculations for emissive objects
 * - Television and digital video color standards
 *
 * @example Basic color creation and manipulation
 * ```typescript
 * // Create a vibrant cyan color for digital display
 * const cyan = new LCHuv(70, 60, 180);
 * console.log(cyan.ToString()); // "LCHuv(70, 60, 180)"
 *
 * // Adjust individual components for screen optimization
 * cyan.L = 85; // Increase brightness for display
 * cyan.C = 75; // Boost saturation for vivid appearance
 * cyan.H = 190; // Fine-tune hue for target display
 * ```
 *
 * @example Digital color harmony and palette generation
 * ```typescript
 * const baseColor = new LCHuv(60, 50, 240); // Digital blue
 *
 * // Create complementary color for UI design
 * const complement = new LCHuv(baseColor.L, baseColor.C, (baseColor.H + 180) % 360);
 *
 * // Create analogous colors for digital palette
 * const analogous1 = new LCHuv(baseColor.L, baseColor.C, (baseColor.H + 30) % 360);
 * const analogous2 = new LCHuv(baseColor.L, baseColor.C, (baseColor.H - 30 + 360) % 360);
 * ```
 *
 * @example Converting from LUV coordinate space
 * ```typescript
 * const luvColor = new LUV(50, 20, -30);
 * const lchuvColor = LCHuv.From(luvColor);
 * console.log(`Converted: ${lchuvColor.ToString()}`);
 * ```
 *
 * @example Display color management workflow
 * ```typescript
 * // Define colors for different display contexts
 * const uiPrimary = new LCHuv(65, 70, 220);    // Strong blue for UI
 * const uiSecondary = new LCHuv(75, 45, 160);  // Lighter purple for accents
 * const warning = new LCHuv(80, 85, 60);       // Bright yellow-orange
 *
 * // Adjust for different display brightness levels
 * const dimmed = new LCHuv(uiPrimary.L * 0.7, uiPrimary.C, uiPrimary.H);
 * ```
 */
@ColorSpaceManager.Register({
	name: 'LCHuv',
	description: 'Represents a color in the CIE LCHuv color space.',
	converters: [
		'LUV',
	],
})
export class LCHuv extends ColorSpace {
	/** Internal array storing the LCHuv component values [L, C, H] */
	protected override components: TVector3;

	/**
	 * Gets the Lightness component value (0+).
	 *
	 * Lightness in LCHuv represents the perceptual brightness optimized for
	 * light sources and emissive displays, where:
	 * - 0 = absolute black (no light emission)
	 * - 50 = middle gray (moderate luminance)
	 * - 100 = diffuse white (maximum standard luminance)
	 *
	 * Unlike surface-based lightness, LCHuv lightness is calibrated for
	 * self-luminous objects and display technologies.
	 *
	 * @example
	 * ```typescript
	 * const displayColor = new LCHuv(85, 60, 200);
	 * console.log(displayColor.L); // 85 (bright for screen display)
	 *
	 * // Typical display brightness ranges
	 * const dim = new LCHuv(30, 40, 120);      // Dim screen setting
	 * const normal = new LCHuv(70, 50, 120);   // Normal brightness
	 * const bright = new LCHuv(95, 45, 120);   // High brightness mode
	 * ```
	 */
	public get L(): number {
		return this.components[0];
	}

	/**
	 * Sets the Lightness component value.
	 *
	 * @param value - The Lightness value to set (0+, typically 0-100)
	 * @throws {ColorError} When value is negative or not finite
	 *
	 * @example
	 * ```typescript
	 * const color = new LCHuv(60, 40, 280);
	 * color.L = 85;  // Increase brightness for display
	 * color.L = 25;  // Reduce for low-light conditions
	 *
	 * // Dynamic brightness adjustment
	 * const baseBrightness = 70;
	 * color.L = baseBrightness * 1.2; // Increase by 20%
	 * ```
	 */
	public set L(value: number) {
		LCHuv._AssertComponent('L', value);
		this.components[0] = value;
	}

	/**
	 * Gets the Chroma component value (0+).
	 *
	 * Chroma in LCHuv represents the colorfulness or saturation intensity
	 * optimized for light sources and display technologies:
	 * - 0 = achromatic (no color, pure gray/white light)
	 * - Low values (0-25) = muted, desaturated colors (pastels)
	 * - Medium values (25-60) = moderately saturated colors
	 * - High values (60+) = vivid, highly saturated colors (pure spectral)
	 *
	 * Maximum achievable chroma varies significantly by hue and lightness.
	 * Display gamuts (sRGB, P3, Rec.2020) limit the maximum chroma
	 * achievable for specific hue/lightness combinations.
	 *
	 * @example
	 * ```typescript
	 * const white = new LCHuv(100, 0, 0);      // Pure white light
	 * const pastel = new LCHuv(80, 20, 300);   // Soft lavender
	 * const vivid = new LCHuv(60, 80, 120);    // Intense green
	 *
	 * // Display gamut considerations
	 * const srgbMax = new LCHuv(70, 75, 240);  // Near sRGB blue limit
	 * const p3Color = new LCHuv(65, 90, 30);   // P3 gamut red-orange
	 * ```
	 */
	public get C(): number {
		return this.components[1];
	}

	/**
	 * Sets the Chroma component value.
	 *
	 * @param value - The Chroma value to set (0+, practical range typically 0-150)
	 * @throws {ColorError} When value is negative or not finite
	 *
	 * @example
	 * ```typescript
	 * const color = new LCHuv(70, 50, 180);
	 * color.C = 10;  // Desaturate (make more neutral)
	 * color.C = 85;  // Saturate (make more vivid)
	 * color.C = 0;   // Remove all color (pure gray/white)
	 *
	 * // Gamut-aware saturation adjustment
	 * const maxChroma = getDisplayMaxChroma(color.L, color.H);
	 * color.C = Math.min(targetChroma, maxChroma); // Stay within gamut
	 * ```
	 */
	public set C(value: number) {
		LCHuv._AssertComponent('C', value);
		this.components[1] = value;
	}

	/**
	 * Gets the Hue component value (0-360 degrees).
	 *
	 * Hue in LCHuv represents the dominant wavelength or color family,
	 * calibrated for light sources and display technologies:
	 * - 0°/360° = Red (display primary)
	 * - 60° = Yellow
	 * - 120° = Green (display primary)
	 * - 180° = Cyan
	 * - 240° = Blue (display primary)
	 * - 300° = Magenta
	 *
	 * The hue angles in LCHuv may differ slightly from LCHab due to
	 * different reference illuminants and optimization for light sources
	 * versus surface colors. Hue is most meaningful when chroma > 0.
	 *
	 * @example
	 * ```typescript
	 * const red = new LCHuv(60, 70, 0);      // Display red primary
	 * const green = new LCHuv(80, 65, 120);  // Display green primary
	 * const blue = new LCHuv(45, 85, 240);   // Display blue primary
	 *
	 * // Digital color wheel navigation
	 * const baseHue = 200;
	 * const triadic1 = new LCHuv(70, 60, (baseHue + 120) % 360);
	 * const triadic2 = new LCHuv(70, 60, (baseHue + 240) % 360);
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
	 * const color = new LCHuv(65, 55, 180); // Start with cyan
	 * color.H = 0;     // Change to red
	 * color.H = 120;   // Change to green
	 * color.H = 240;   // Change to blue
	 *
	 * // Smooth hue transitions for animations
	 * const frames = 60;
	 * for (let i = 0; i < frames; i++) {
	 *   color.H = (i / frames) * 360; // Full rotation
	 *   renderFrame(color);
	 * }
	 * ```
	 */
	public set H(value: number) {
		LCHuv._AssertComponent('H', value);
		this.components[2] = value;
	}	/**
	 * Creates a new LCHuv color instance.
	 *
	 * All parameters are validated to ensure they fall within acceptable ranges.
	 * Invalid values will throw a ColorError during construction. The constructor
	 * is optimized for light source and display color specifications.
	 *
	 * @param l - Lightness component (0+, typically 0-100, default: 0)
	 *            0 = no light emission, 100 = standard white luminance
	 * @param c - Chroma component (0+, practical range 0-150, default: 0)
	 *            0 = achromatic (gray/white), higher values = more saturated
	 * @param h - Hue component (0-360 degrees, default: 0)
	 *            0/360 = red, 120 = green, 240 = blue (display primaries)
	 *
	 * @throws {ColorError} When any parameter is outside valid range or not finite
	 *
	 * @example Basic construction for display applications
	 * ```typescript
	 * const black = new LCHuv();                // LCHuv(0, 0, 0) - no light
	 * const white = new LCHuv(100, 0, 0);       // Pure white light
	 * const red = new LCHuv(60, 70, 0);         // Vivid red for displays
	 * const screenBlue = new LCHuv(45, 85, 240); // Intense blue
	 * ```
	 *
	 * @example UI color system creation
	 * ```typescript
	 * // Primary brand color for digital interfaces
	 * const brandPrimary = new LCHuv(65, 75, 220);   // Strong blue
	 *
	 * // Create tonal variations
	 * const lighter = new LCHuv(85, 45, 220);        // Light variant
	 * const darker = new LCHuv(45, 85, 220);         // Dark variant
	 * const muted = new LCHuv(65, 35, 220);          // Muted variant
	 * ```
	 *
	 * @example Display gamut considerations
	 * ```typescript
	 * // sRGB-safe colors for broad compatibility
	 * const srgbRed = new LCHuv(55, 65, 12);
	 * const srgbGreen = new LCHuv(85, 75, 135);
	 * const srgbBlue = new LCHuv(35, 90, 285);
	 *
	 * // Wide gamut colors for modern displays
	 * const p3Red = new LCHuv(55, 85, 25);
	 * const rec2020Green = new LCHuv(90, 105, 140);
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
	 * Returns a string representation of the LCHuv color.
	 *
	 * The format follows the pattern "LCHuv(L, C, H)" where values are
	 * displayed with their natural precision (no forced decimal places).
	 * This representation is particularly useful for debugging display
	 * color workflows and logging color transformations.
	 *
	 * @returns A string in the format "LCHuv(L, C, H)"
	 *
	 * @example
	 * ```typescript
	 * const displayColor = new LCHuv(72.5, 58.3, 195.7);
	 * console.log(displayColor.ToString()); // "LCHuv(72.5, 58.3, 195.7)"
	 *
	 * const simpleColor = new LCHuv(60, 45, 240);
	 * console.log(simpleColor.ToString()); // "LCHuv(60, 45, 240)"
	 *
	 * // Useful for debugging display color pipelines
	 * const colors = [
	 *   new LCHuv(80, 60, 120),
	 *   new LCHuv(50, 75, 240),
	 *   new LCHuv(90, 30, 60)
	 * ];
	 * colors.forEach(c => console.log(`Color: ${c.ToString()}`));
	 * ```
	 */
	public override ToString(): string {
		return `LCHuv(${this.L}, ${this.C}, ${this.H})`;
	}	/**
	 * Type guard assertion function that validates if a value is an instance of LCHuv.
	 *
	 * This method performs comprehensive validation by first checking if the value
	 * is an instance of LCHuv, then validating that all component values are within
	 * their valid ranges and are finite numbers. The validation is optimized for
	 * display color workflows and light source specifications.
	 *
	 * @param color - The value to validate as an LCHuv instance
	 * @throws {ColorError} When the value is not an instance of LCHuv
	 * @throws {ColorError} When L component is not finite or outside range [0, ∞)
	 * @throws {ColorError} When C component is not finite or outside range [0, ∞)
	 * @throws {ColorError} When H component is not finite or outside range [0, 360]
	 *
	 * @example Type narrowing with validation
	 * ```typescript
	 * function processDisplayColor(value: unknown) {
	 *   LCHuv.Assert(value); // value is now typed as LCHuv
	 *
	 *   // Safe to use LCHuv properties after assertion
	 *   console.log(`Display Lightness: ${value.L}`);
	 *   console.log(`Chroma: ${value.C}`);
	 *   console.log(`Hue: ${value.H}`);
	 *
	 *   // Use for display color management
	 *   return adjustForDisplayGamut(value);
	 * }
	 * ```
	 *
	 * @example Error handling in color pipeline
	 * ```typescript
	 * function validateDisplayColors(colors: unknown[]) {
	 *   const validColors: LCHuv[] = [];
	 *
	 *   for (const color of colors) {
	 *     try {
	 *       LCHuv.Assert(color);
	 *       validColors.push(color);
	 *     } catch (error) {
	 *       console.warn('Invalid display color:', error.message);
	 *       // Use fallback color for display
	 *       validColors.push(new LCHuv(50, 0, 0)); // Gray fallback
	 *     }
	 *   }
	 *
	 *   return validColors;
	 * }
	 * ```
	 */

	public static override Assert(color: unknown): asserts color is LCHuv {
		AssertInstanceOf(color, LCHuv, { class: ColorError, message: 'Expected instance of LCHuv' });
		LCHuv._AssertComponent('L', color);
		LCHuv._AssertComponent('C', color);
		LCHuv._AssertComponent('H', color);
	}

	private static _AssertComponent(component: TLCHuvComponentSelection, color: LCHuv): void;
	private static _AssertComponent(component: TLCHuvComponentSelection, value: number): void;
	private static _AssertComponent(component: TLCHuvComponentSelection, colorOrValue: LCHuv | number): void {
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
		}
	}

	/**
	 * Validates that an object is a valid LCHuv color instance.
	 *
	 * This method provides a non-throwing validation approach that returns
	 * a boolean result instead of throwing errors. It internally uses the
	 * Assert method to perform validation but catches any errors and returns
	 * false instead of propagating them. Particularly useful for display
	 * color pipeline validation and gamut checking workflows.
	 *
	 * @param color - The object to validate
	 * @returns `true` if the object is a valid LCHuv color, `false` otherwise
	 *
	 * @example Conditional processing for display colors
	 * ```typescript
	 * function processDisplayColorSafely(input: unknown) {
	 *   if (LCHuv.Validate(input)) {
	 *     // TypeScript knows input is LCHuv here
	 *     console.log(`Valid display color: ${input.ToString()}`);
	 *     return calibrateForDisplay(input);
	 *   } else {
	 *     console.log('Invalid color input, using default display color');
	 *     return new LCHuv(70, 0, 0); // Neutral gray for displays
	 *   }
	 * }
	 * ```
	 *
	 * @example Filtering color arrays for display pipeline
	 * ```typescript
	 * const colorCandidates: unknown[] = [
	 *   new LCHuv(75, 60, 220),    // Valid blue
	 *   'invalid-color',           // Invalid
	 *   new LCHuv(85, 45, 120),    // Valid green
	 *   null,                      // Invalid
	 *   new LCHuv(55, 80, 20)      // Valid orange-red
	 * ];
	 *
	 * const validDisplayColors = colorCandidates.filter(LCHuv.Validate) as LCHuv[];
	 * console.log(`Found ${validDisplayColors.length} valid display colors`);
	 *
	 * // Process colors for display rendering
	 * validDisplayColors.forEach(color => {
	 *   renderToDisplay(color);
	 * });
	 * ```
	 *
	 * @example Display gamut validation workflow
	 * ```typescript
	 * function createDisplayPalette(colors: unknown[]) {
	 *   return colors
	 *     .filter(LCHuv.Validate)                    // Keep only valid LCHuv
	 *     .map(color => color as LCHuv)              // Type-safe cast
	 *     .filter(color => isWithinDisplayGamut(color)) // Gamut check
	 *     .map(color => optimizeForDisplay(color));   // Display optimization
	 * }
	 * ```
	 */
	public static override Validate(color: unknown): boolean {
		try {
			LCHuv.Assert(color);
			return true;
		} catch {
			return false;
		}
	}	/**
	 * Converts a color from another color space to LCHuv.
	 *
	 * Currently supports conversion from:
	 * - LUV (CIE LUV) color space
	 *
	 * This method serves as the main entry point for color space conversions
	 * to LCHuv, automatically detecting the source color type and applying
	 * the appropriate conversion algorithm optimized for light sources and
	 * display applications.
	 *
	 * @param color - The LUV color to convert
	 * @returns A new LCHuv color instance
	 * @throws {ColorError} When the input color type is not supported
	 *
	 * @example Converting from LUV for display applications
	 * ```typescript
	 * const luvColor = new LUV(70, 25, -40);
	 * const lchuvColor = LCHuv.From(luvColor);
	 * console.log(lchuvColor.ToString()); // "LCHuv(70, 47.17, 302.00)"
	 *
	 * // Use converted color for display optimization
	 * const optimized = optimizeForDisplayGamut(lchuvColor);
	 * ```
	 *
	 * @example Batch conversion for display color management
	 * ```typescript
	 * const luvColors = [
	 *   new LUV(80, 20, 30),    // Light warm color
	 *   new LUV(45, -15, 45),   // Dark green-yellow
	 *   new LUV(90, 5, -10)     // Very light cool color
	 * ];
	 *
	 * const displayColors = luvColors.map(luv => LCHuv.From(luv));
	 * console.log(`Converted ${displayColors.length} colors for display pipeline`);
	 *
	 * // Apply display-specific processing
	 * const calibratedColors = displayColors.map(lch => {
	 *   return calibrateForSpecificDisplay(lch, targetDisplayProfile);
	 * });
	 * ```
	 *
	 * @example Integration with display color workflows
	 * ```typescript
	 * function convertAndValidateForDisplay(sourceColor: LUV): LCHuv {
	 *   const converted = LCHuv.From(sourceColor);
	 *
	 *   // Ensure color is within display capabilities
	 *   if (converted.C > getMaxDisplayChroma(converted.L, converted.H)) {
	 *     converted.C = getMaxDisplayChroma(converted.L, converted.H);
	 *   }
	 *
	 *   return converted;
	 * }
	 * ```
	 */

	public static From(color: LUV): LCHuv {
		if (color instanceof LUV) return LCHuv.FromLUV(color);
		throw new ColorError('Cannot convert to LCHuv');
	}

	/**
	 * Converts a LUV color to LCHuv using cylindrical coordinate transformation.
	 *
	 * This conversion transforms the Cartesian coordinates (L*, u*, v*) of LUV
	 * color space into the polar coordinates (L*, C*uv, H*uv) of LCHuv space,
	 * specifically optimized for light sources and display applications:
	 *
	 * - L (Lightness): Remains unchanged from LUV
	 * - C (Chroma): Calculated as √(u² + v²) - the distance from the neutral axis
	 * - H (Hue): Calculated as atan2(v, u) converted to degrees - the angle from the u* axis
	 *
	 * @param color - The LUV color to convert (must be a valid LUV instance)
	 * @returns A new LCHuv color instance with equivalent display-optimized appearance
	 * @throws {ColorError} When the input LUV color is invalid
	 */
	public static FromLUV(color: LUV): LCHuv {
		LUV.Validate(color);

		let h = 360;

		if (color.U !== 0 || color.V !== 0) {
			h = Math.atan2(color.V, color.U);
			h = h > 0 ? RadiansToDegrees(h) : 360 + RadiansToDegrees(h);
		}

		const c = Math.sqrt(Math.pow(color.U, 2) + Math.pow(color.V, 2));

		return new LCHuv(color.L, c, h);
	}
}
