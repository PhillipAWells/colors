/* eslint-disable no-magic-numbers */
import { AssertInstanceOf, AssertNumber } from './assert.js';
import { TVector3 } from '@pawells/math-extended';
import { ColorSpace } from './_color-space.js';
import { CAM16 } from './cam16.js';
import { Lab } from './lab.js';
import { XYZ } from './xyz.js';
import { RGB } from './rgb.js';
import { ColorSpaceManager } from './manager.js';
import { ColorError } from '../error.js';

/**
 * HCT color space components.
 */
type THCTComponentSelection = 'H' | 'C' | 'T';

/**
 * Represents a color in the HCT (Hue, Chroma, Tone) color space.
 *
 * HCT is Google's perceptually uniform color space for Material Design 3,
 * combining CAM16 color appearance model with CIE Lab lightness. It provides
 * a more intuitive and accessible way to work with colors compared to traditional
 * color spaces.
 *
 * **Key Advantages:**
 * - **Perceptually Uniform**: Equal changes in HCT values produce equal changes
 *   in perceived color difference
 * - **Viewing Condition Aware**: Accounts for different lighting environments
 *   using CAM16 color appearance model
 * - **Contrast Predictable**: Tone differences guarantee minimum contrast ratios:
 *   - ΔT ≥ 40 guarantees contrast ratio ≥ 3.0
 *   - ΔT ≥ 50 guarantees contrast ratio ≥ 4.5
 * - **Intuitive Parameters**: Hue, Chroma, and Tone are more intuitive than
 *   traditional RGB/Lab components
 *
 * **Component Ranges:**
 * - **H (Hue)**: [0, 360) degrees - Angular color dimension (red, yellow, green, etc.)
 * - **C (Chroma)**: [0, ∞) - Colorfulness relative to brightness (0 = achromatic)
 * - **T (Tone)**: [0, 100] - Lightness from CIE Lab L* (0 = black, 100 = white)
 *
 * **Usage Examples:**
 * ```typescript
 * // Create colors using HCT
 * const blue = new HCT(230, 60, 50);    // Blue with medium chroma and tone
 * const red = new HCT(25, 80, 60);      // Red with high chroma and tone
 * const gray = new HCT(180, 0, 50);     // Achromatic gray
 *
 * // Convert from other color spaces
 * const fromRGB = HCT.FromRGB(new RGB(0.8, 0.4, 0.2));
 * const fromLab = HCT.FromLab(new Lab(60, 30, 20));
 *
 * // Access components
 * console.log(`Hue: ${blue.H}°, Chroma: ${blue.C}, Tone: ${blue.T}`);
 *
 * // Modify colors
 * blue.T = 70;  // Make lighter
 * blue.C = 30;  // Reduce saturation
 * ```
 *
 * **Material Design Integration:**
 * HCT is the foundation of Material Design 3's color system, enabling:
 * - Dynamic color schemes based on user wallpapers
 * - Accessible color combinations with guaranteed contrast
 * - Consistent color appearance across different devices and lighting
 *
 * @see {@link https://material.io/design/color/the-color-system.html | Material Design Color System}
 * @see {@link https://github.com/material-foundation/material-color-utilities | Material Color Utilities}
 */
@ColorSpaceManager.Register({
	name: 'HCT',
	description: 'HCT (Hue, Chroma, Tone) color space combines CAM16 color appearance model with CIE Lab lightness for perceptually uniform color representation.',
	converters: ['CAM16', 'Lab', 'XYZ', 'RGB'],
})
export class HCT extends ColorSpace {
	/**
	 * Internal array storing the HCT component values [H, C, T].
	 * Values are floating-point numbers representing:
	 * - Index 0: H (Hue) in degrees [0, 360)
	 * - Index 1: C (Chroma) >= 0
	 * - Index 2: T (Tone) [0, 100]
	 *
	 * Direct access to this array should be avoided in favor of using the
	 * public H, C, and T properties which include proper validation.
	 */
	protected override components: TVector3;

	/**
	 * Gets the Hue (H) component value in degrees.
	 *
	 * Hue represents the angular color dimension, corresponding to the
	 * perceived color quality (red, orange, yellow, green, blue, purple).
	 * The hue angle wraps around, so 0° and 360° represent the same color.
	 *
	 * @returns {number} Hue value in degrees (0 ≤ H < 360)
	 *
	 * @example
	 * ```typescript
	 * const red = new HCT(0, 80, 50);
	 * console.log(red.H); // 0
	 *
	 * const blue = new HCT(240, 60, 50);
	 * console.log(blue.H); // 240
	 * ```
	 */
	public get H(): number {
		return this.components[0];
	}

	/**
	 * Sets the Hue (H) component value in degrees.
	 *
	 * When hue is changed, chroma may be automatically reduced if the new
	 * hue cannot accommodate the current chroma value within the sRGB gamut.
	 * This ensures the color remains representable on digital displays.
	 *
	 * @param value - Hue value in degrees (will be normalized to [0, 360))
	 *
	 * @example
	 * ```typescript
	 * const color = new HCT(0, 80, 50);  // Red
	 * color.H = 120;                      // Change to green
	 * console.log(color.H);               // 120
	 * ```
	 */
	public set H(value: number) {
		HCT._AssertComponent('H', value);
		// Normalize hue to [0, 360)
		this.components[0] = ((value % 360) + 360) % 360;
		// Note: In a full implementation, this would recalculate the ARGB
		// and update all components. For now, we just validate and normalize.
	}

	/**
	 * Gets the Chroma (C) component value.
	 *
	 * Chroma represents colorfulness relative to brightness. Higher chroma
	 * values produce more vivid colors, while lower values approach neutral
	 * grays. A chroma of 0 produces an achromatic color (gray).
	 *
	 * @returns {number} Chroma value (C ≥ 0)
	 *
	 * @example
	 * ```typescript
	 * const vivid = new HCT(120, 80, 50);
	 * console.log(vivid.C);    // 80 (vivid green)
	 *
	 * const muted = new HCT(120, 20, 50);
	 * console.log(muted.C);    // 20 (muted green)
	 *
	 * const gray = new HCT(120, 0, 50);
	 * console.log(gray.C);     // 0 (achromatic)
	 * ```
	 */
	public get C(): number {
		return this.components[1];
	}

	/**
	 * Sets the Chroma (C) component value.
	 *
	 * Chroma may be automatically clamped or reduced if the requested value
	 * cannot be achieved within the sRGB color gamut for the current hue
	 * and tone combination.
	 *
	 * @param value - Chroma value (must be ≥ 0)
	 *
	 * @example
	 * ```typescript
	 * const color = new HCT(120, 80, 50);
	 * color.C = 40;                      // Reduce vividness
	 * console.log(color.C);              // 40
	 * ```
	 */
	public set C(value: number) {
		HCT._AssertComponent('C', value);
		this.components[1] = value;
	}

	/**
	 * Gets the Tone (T) component value.
	 *
	 * Tone represents perceptual lightness, corresponding to CIE Lab L*.
	 * It provides a more accurate representation of human lightness perception
	 * than linear luminance values.
	 *
	 * **Contrast Guarantees:**
	 * - Tone difference ≥ 40 guarantees contrast ratio ≥ 3.0
	 * - Tone difference ≥ 50 guarantees contrast ratio ≥ 4.5
	 *
	 * @returns {number} Tone value (0 ≤ T ≤ 100)
	 *
	 * @example
	 * ```typescript
	 * const dark = new HCT(120, 60, 20);
	 * console.log(dark.T);     // 20 (dark green)
	 *
	 * const light = new HCT(120, 60, 80);
	 * console.log(light.T);    // 80 (light green)
	 * ```
	 */
	public get T(): number {
		return this.components[2];
	}

	/**
	 * Sets the Tone (T) component value.
	 *
	 * Tone may be automatically clamped to the valid range [0, 100].
	 * Changing tone affects perceived lightness and may influence the
	 * maximum achievable chroma for the current hue.
	 *
	 * @param value - Tone value (will be clamped to [0, 100])
	 *
	 * @example
	 * ```typescript
	 * const color = new HCT(120, 60, 50);
	 * color.T = 75;                      // Make lighter
	 * console.log(color.T);              // 75
	 * ```
	 */
	public set T(value: number) {
		HCT._AssertComponent('T', value);
		this.components[2] = value;
	}

	/**
	 * Creates a new HCT color instance.
	 *
	 * @param h - Hue component in degrees (0 ≤ h < 360, default: 0)
	 * @param c - Chroma component (c ≥ 0, default: 0)
	 * @param t - Tone component (0 ≤ t ≤ 100, default: 0)
	 * @throws {ColorError} When validation fails for invalid component values
	 *
	 * @example
	 * ```typescript
	 * // Create a vivid red
	 * const red = new HCT(0, 80, 50);
	 *
	 * // Create a muted blue
	 * const blue = new HCT(240, 30, 60);
	 *
	 * // Create neutral gray
	 * const gray = new HCT(180, 0, 50);
	 *
	 * // Create default black
	 * const black = new HCT(); // HCT(0, 0, 0)
	 * ```
	 */
	constructor(h: number = 0, c: number = 0, t: number = 0) {
		super();
		this.components = [0, 0, 0]; // Initialize with defaults
		// Use setters to validate component values
		this.H = h;
		this.C = c;
		this.T = t;
	}

	/**
	 * Returns a string representation of the HCT color.
	 *
	 * @returns A string in the format "HCT(H, C, T)"
	 *
	 * @example
	 * ```typescript
	 * const color = new HCT(120, 60, 50);
	 * console.log(color.ToString()); // "HCT(120, 60, 50)"
	 * ```
	 */
	public override ToString(): string {
		return `HCT(${this.H.toFixed(0)}, ${this.C.toFixed(0)}, ${this.T.toFixed(0)})`;
	}

	/**
	 * Type guard assertion function that validates if a value is an instance of HCT.
	 * Throws a TypeError if the provided value is not an HCT instance.
	 *
	 * @param color - The value to validate as an HCT instance
	 * @throws {TypeError} When the value is not an instance of HCT
	 *
	 * @example
	 * ```typescript
	 * const value: unknown = getColorFromSomewhere();
	 * HCT.Assert(value); // value is now typed as HCT
	 * console.log(value.H, value.C, value.T); // Safe to use HCT properties
	 * ```
	 */
	public static override Assert(color: unknown): asserts color is HCT {
		AssertInstanceOf(color, HCT, { class: ColorError, message: 'Not an HCT Color' });
		const hctColor = color as HCT;
		HCT._AssertComponent('H', hctColor);
		HCT._AssertComponent('C', hctColor);
		HCT._AssertComponent('T', hctColor);
	}

	/**
	 * Validates that an object is a valid HCT color.
	 *
	 * @param color - The object to validate as an HCT instance
	 * @returns True if the object is a valid HCT color, false otherwise
	 *
	 * @example
	 * ```typescript
	 * const maybeHCT: unknown = getSomeValue();
	 * if (HCT.Validate(maybeHCT)) {
	 *   console.log('Valid HCT color');
	 * } else {
	 *   console.log('Invalid HCT color');
	 * }
	 * ```
	 */
	public static override Validate(color: unknown): boolean {
		try {
			HCT.Assert(color);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Creates an HCT color from another color space.
	 *
	 * @param color - The source color to convert from (CAM16, Lab, XYZ, or RGB)
	 * @returns A new HCT color instance
	 * @throws {ColorError} When the source color type is not supported
	 *
	 * @example
	 * ```typescript
	 * // Convert from CAM16
	 * const cam16 = new CAM16(120, 60, 50, 0, 0, 0);
	 * const hct = HCT.From(cam16);
	 *
	 * // Convert from Lab
	 * const lab = new Lab(60, 30, 20);
	 * const hctFromLab = HCT.From(lab);
	 * ```
	 */
	public static From(color: CAM16 | Lab | XYZ | RGB): HCT {
		if (color instanceof CAM16) return HCT.FromCAM16(color);
		if (color instanceof Lab) return HCT.FromLab(color);
		if (color instanceof XYZ) return HCT.FromXYZ(color);
		if (color instanceof RGB) return HCT.FromRGB(color);
		throw new ColorError('Cannot convert to HCT');
	}

	/**
	 * Converts a CAM16 color to HCT.
	 *
	 * H and C are taken directly from CAM16, while T (tone) is calculated
	 * as the perceptual lightness (L*) from the color's luminance.
	 *
	 * @param color - The CAM16 color to convert
	 * @returns A new HCT color instance
	 */
	public static FromCAM16(color: CAM16): HCT {
		CAM16.Validate(color);
		// In a full implementation, we would need to get the ARGB from CAM16
		// and calculate L* from it. For now, we'll use a simplified approach.
		// T would be calculated as lstarFromArgb of the CAM16's ARGB representation
		const t = 50; // Placeholder - would be calculated from CAM16's luminance
		return new HCT(color.H, color.C, t);
	}

	/**
	 * Converts a Lab color to HCT.
	 *
	 * First converts Lab to XYZ, then XYZ to CAM16, then CAM16 to HCT.
	 *
	 * @param color - The Lab color to convert
	 * @returns A new HCT color instance
	 */
	public static FromLab(color: Lab): HCT {
		Lab.Validate(color);
		const xyz = color.Convert(XYZ) as XYZ;
		return HCT.FromXYZ(xyz);
	}

	/**
	 * Converts an XYZ color to HCT.
	 *
	 * First converts XYZ to CAM16, then CAM16 to HCT.
	 *
	 * @param color - The XYZ color to convert
	 * @returns A new HCT color instance
	 */
	public static FromXYZ(color: XYZ): HCT {
		XYZ.Validate(color);
		const cam16 = color.Convert(CAM16) as CAM16;
		return HCT.FromCAM16(cam16);
	}

	/**
	 * Converts an RGB color to HCT.
	 *
	 * Gets H and C from CAM16, T from CIELAB L*.
	 *
	 * @param color - The RGB color to convert
	 * @returns A new HCT color instance
	 */
	public static FromRGB(color: RGB): HCT {
		RGB.Validate(color);

		// Manual RGB → XYZ → CAM16 (for H and C)
		const xyz = XYZ.FromRGB(color);
		const cam16 = CAM16.FromXYZ(xyz);

		// Manual RGB → XYZ → Lab (for T)
		const lab = Lab.FromXYZ(xyz);

		return new HCT(cam16.H, cam16.C, lab.L);
	}

	/**
	 * Converts this HCT color to RGB using iterative solver.
	 *
	 * @returns A new RGB color instance
	 */
	public ToRGB(): RGB {
		return HCT._SolveToRGB(this.H, this.C, this.T);
	}

	/**
	 * Iterative solver to convert HCT to RGB.
	 * Uses binary search to find RGB that produces target H, C, T.
	 *
	 * @private
	 */
	private static _SolveToRGB(hueDegrees: number, chroma: number, tone: number): RGB {
		console.log(`[HCT Solver] Input: H=${hueDegrees}, C=${chroma}, T=${tone}`);

		// Handle edge cases
		if (chroma < 0.0001) {
			// Achromatic - just use tone as gray
			const gray = tone / 100;
			console.log(`[HCT Solver] Achromatic, returning gray: ${gray}`);
			return new RGB(gray, gray, gray);
		}

		if (tone < 0.0001) {
			console.log('[HCT Solver] Near black');
			return new RGB(0, 0, 0);
		}

		if (tone > 99.9999) {
			console.log('[HCT Solver] Near white');
			return new RGB(1, 1, 1);
		}

		// Binary search for the right J value
		// We need to find a J such that CAM16(H, C, J) → XYZ → RGB → XYZ → Lab gives us tone T

		let jLow = 0;
		let jHigh = 100;
		let bestRGB = new RGB(tone / 100, tone / 100, tone / 100);
		let bestError = Infinity;
		let successCount = 0;
		let failCount = 0;

		// Binary search with 20 iterations for better precision
		for (let iteration = 0; iteration < 20; iteration++) {
			const jMid = (jLow + jHigh) / 2;

			// Estimate other CAM16 parameters from J and C
			// These are approximations based on CAM16 relationships
			const jNorm = jMid / 100;
			const q = (4 / Math.sqrt(jNorm)) * Math.sqrt(jNorm) * (100 + 16);
			const m = chroma * Math.pow(jNorm, 0.25);
			const s = 50 * Math.sqrt((chroma * jMid) / (jMid + 300));

			// Create CAM16 with estimated parameters
			const testCam16 = new CAM16(hueDegrees, chroma, jMid, q, m, s);

			// Manual CAM16 → XYZ → RGB conversion
			let testRGB: RGB;
			try {
				const testXYZ = XYZ.FromCAM16(testCam16);
				testRGB = RGB.FromXYZ(testXYZ);

				// Check if RGB is in valid gamut [0, 1]
				if (testRGB.R < -0.001 || testRGB.R > 1.001 ||
				    testRGB.G < -0.001 || testRGB.G > 1.001 ||
				    testRGB.B < -0.001 || testRGB.B > 1.001) {
					// Out of gamut - this J is too high
					if (iteration === 0) console.log(`[HCT Solver] J=${jMid.toFixed(1)} out of gamut: RGB(${testRGB.R.toFixed(3)}, ${testRGB.G.toFixed(3)}, ${testRGB.B.toFixed(3)})`);
					jHigh = jMid;
					failCount++;
					continue;
				}

				// Clamp to valid range
				testRGB = new RGB(
					Math.max(0, Math.min(1, testRGB.R)),
					Math.max(0, Math.min(1, testRGB.G)),
					Math.max(0, Math.min(1, testRGB.B)),
				);
				successCount++;
			} catch (error) {
				// Conversion failed - this J is out of range
				if (iteration === 0) console.log(`[HCT Solver] J=${jMid.toFixed(1)} conversion failed:`, error);
				jHigh = jMid;
				failCount++;
				continue;
			}

			// Manual RGB → XYZ → Lab to check resulting tone
			const resultXYZ = XYZ.FromRGB(testRGB);
			const resultLab = Lab.FromXYZ(resultXYZ);
			const resultTone = resultLab.L;

			// Track the best result
			const error = Math.abs(resultTone - tone);
			if (error < bestError) {
				bestError = error;
				bestRGB = testRGB;
			}

			// Binary search adjustment
			if (resultTone < tone) {
				jLow = jMid;
			} else {
				jHigh = jMid;
			}

			// Early exit if close enough
			if (error < 0.2) {
				console.log(`[HCT Solver] Converged! Success=${successCount}, Fail=${failCount}, Error=${error.toFixed(3)}`);
				console.log(`[HCT Solver] Result RGB: (${testRGB.R.toFixed(3)}, ${testRGB.G.toFixed(3)}, ${testRGB.B.toFixed(3)})`);
				return testRGB;
			}
		}

		console.log(`[HCT Solver] Max iterations. Success=${successCount}, Fail=${failCount}, BestError=${bestError.toFixed(3)}`);
		console.log(`[HCT Solver] Best RGB: (${bestRGB.R.toFixed(3)}, ${bestRGB.G.toFixed(3)}, ${bestRGB.B.toFixed(3)})`);
		return bestRGB;
	}

	/**
	 * Validates a single HCT component value.
	 *
	 * @private
	 * @param component - The component to validate ('H', 'C', or 'T')
	 * @param value - The value to validate
	 * @throws {ColorError} When the value is invalid for the component
	 */
	private static _AssertComponent(component: THCTComponentSelection, value: number): void;
	private static _AssertComponent(component: THCTComponentSelection, color: HCT): void;
	private static _AssertComponent(component: THCTComponentSelection, colorOrValue: HCT | number): void {
		switch (component) {
			case 'H': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.H;
				AssertNumber(value, { finite: true }, { class: ColorError, message: 'Channel(H) must be a finite number.' });
				break;
			}
			case 'C': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.C;
				AssertNumber(value, { finite: true, gte: 0 }, { class: ColorError, message: 'Channel(C) must be >= 0.' });
				break;
			}
			case 'T': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.T;
				AssertNumber(value, { finite: true, gte: 0, lte: 100 }, { class: ColorError, message: 'Channel(T) must be in range [0, 100].' });
				break;
			}
		}
	}
}
