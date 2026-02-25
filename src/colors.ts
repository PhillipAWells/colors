import { ColorSpace } from './color-spaces/_color-space.js';
import { ColorSpaceManager } from './color-spaces/manager.js';
import { W3C } from './w3c.js';
import { ColorError } from './error.js';

// Helper function to sort object keys numerically
function ObjectSortKeys<T extends Record<number, unknown>>(obj: T): T {
	const sorted: Record<number, unknown> = {};
	Object.keys(obj)
		.map((k) => parseFloat(k))
		.sort((a, b) => a - b)
		.forEach((key) => {
			sorted[key] = obj[key];
		});
	return sorted as T;
}

// Type helper for constructor functions
type TConstructorFunction<T> = { new (...args: any[]): T };

/**
 * A mapping of numeric values (0-1) to color instances, used for creating color scales and gradients.
 * Each key represents a position along the scale, and each value is the corresponding color.
 *
 * @template C - The color space type extending ColorSpace
 * @example
 * ```typescript
 * // Simple two-color scale
 * const scale: TColorScale<RGB> = {
 *   0: new RGB(1, 0, 0),    // Red at start
 *   1: new RGB(0, 0, 1)     // Blue at end
 * };
 *
 * // Multi-point gradient
 * const gradient: TColorScale<HSL> = {
 *   0: new HSL(0, 1, 0.5),     // Red
 *   0.5: new HSL(120, 1, 0.5), // Green
 *   1: new HSL(240, 1, 0.5)    // Blue
 * };
 * ```
 */
export type TColorScale<C extends ColorSpace> = Record<number, C>;

/**
 * Default interpolation points for color scale generation.
 * These positions create smooth gradient steps across the color scale.
 */
// eslint-disable-next-line no-magic-numbers
const DEFAULT_SCALE_POSITIONS = [0, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.75, 0.8, 0.9, 1];

/**
 * Utility class providing color manipulation and scaling functionality.
 *
 * The Colors class offers methods for creating color scales, gradients, and accessing
 * standard W3C color constants. It serves as the main entry point for color operations
 * beyond individual color space manipulations.
 *
 * @example
 * ```typescript
 * import { Colors, ColorSpaces } from '@pawells/colors';
 *
 * // Access W3C standard colors
 * const red = Colors.W3C.Red;
 * const blue = Colors.W3C.Blue;
 *
 * // Create a color scale
 * const scale = Colors.Scale([red, blue], [0, 0.25, 0.5, 0.75, 1]);
 * console.log(scale[0.5]); // Color halfway between red and blue
 * ```
 */
export class Colors {
	/**
	 * Collection of W3C standard color definitions.
	 * Provides access to all standard web colors in RGB format.
	 *
	 * @example
	 * ```typescript
	 * const red = Colors.W3C.Red;           // Pure red
	 * const lime = Colors.W3C.Lime;         // Pure green
	 * const royalBlue = Colors.W3C.RoyalBlue; // Royal blue
	 * ```
	 */
	public static readonly W3C = new W3C();

	/**
	 * Creates a color scale by interpolating colors across specified positions.
	 *
	 * This method generates smooth transitions between colors, supporting multiple input formats:
	 * - Single color: Creates a scale with the color at position 0.5
	 * - Array of colors: Distributes colors evenly across the scale
	 * - Color scale object: Interpolates between existing anchor points
	 *
	 * @template C - The color space type extending ColorSpace
	 * @param color - Single color, array of colors, or existing color scale
	 * @param values - Array of positions (0-1) where interpolated colors should be calculated
	 * @returns A ColorScale with interpolated colors at the specified positions
	 *
	 * @throws {ColorError} When provided array is empty or contains invalid colors
	 * @throws {ColorError} When color scale is empty or contains invalid entries
	 *
	 * @example
	 * ```typescript
	 * import { Colors, ColorSpaces } from '@pawells/colors';
	 *
	 * const red = new ColorSpaces.RGB(1, 0, 0);
	 * const blue = new ColorSpaces.RGB(0, 0, 1);
	 *
	 * // Create scale from two colors
	 * const scale = Colors.Scale([red, blue], [0, 0.25, 0.5, 0.75, 1]);
	 *
	 * // Use existing scale as input
	 * const refinedScale = Colors.Scale(scale, [0, 0.1, 0.2, 0.3, 0.4, 0.5]);
	 *
	 * // Single color creates centered scale
	 * const singleColorScale = Colors.Scale(red);
	 * console.log(singleColorScale[0.5]); // The red color
	 * ```
	 *
	 * @remarks
	 * - Missing boundary colors (at positions 0 or 1) are automatically filled with black and white
	 * - Interpolation uses the color space's built-in LERP (Linear Interpolation) method
	 * - The method preserves the original color space throughout the scaling process
	 * - All positions are clamped to the 0-1 range
	 */
	public static Scale<C extends ColorSpace>(color: C | Array<C> | TColorScale<C>, values?: number[]): TColorScale<C> {
		const SCALE_MIDPOINT = 0.5;

		// Clone the input color scale to avoid mutating the original
		const defaultValues: number[] = DEFAULT_SCALE_POSITIONS;
		const resolvedValues = values ?? defaultValues;

		// Validate scale values are valid numbers in [0, 1] range
		for (const value of resolvedValues) {
			if (typeof value !== 'number' || isNaN(value) || value < 0 || value > 1) {
				throw new ColorError(`Invalid scale value: ${value}. Must be a number in the range [0, 1].`);
			}
		}

		// Handle single color case
		if (color instanceof ColorSpace) {
			return Colors.Scale({ [SCALE_MIDPOINT]: color }, resolvedValues);
		}

		// Handle array case
		if (Array.isArray(color)) {
			if (color.length === 0) throw new ColorError('Color Array is Empty');

			const result: TColorScale<C> = {};

			if (color.length === 1) {
				const [singleColor] = color;
				if (singleColor === undefined) throw new ColorError('Invalid color in array');
				result[SCALE_MIDPOINT] = singleColor;
				return ObjectSortKeys(Colors.Scale(result, resolvedValues));
			}

			if (color.length === 2) {
				const [firstColor, secondColor] = color;
				if (firstColor === undefined || secondColor === undefined) throw new ColorError('Invalid color in array');
				result[0] = firstColor;
				result[1] = secondColor;
				return ObjectSortKeys(Colors.Scale(result, resolvedValues));
			}

			const step = 1 / (color.length - 1);
			color.forEach((c, i) => {
				result[i * step] = c;
			});
			return ObjectSortKeys(Colors.Scale(result, resolvedValues));
		}

		// Handle color scale object case
		let colorScale: TColorScale<C> = { ...color };
		let keys = Object.keys(colorScale).map((k) => parseFloat(k));

		if (keys.length === 0) throw new ColorError('Color Scale is Empty');

		// Fill in missing boundary colors
		if (colorScale[0] === undefined) {
			// If the starting color is undefined, we assume black.
			const [firstKey] = keys;
			if (firstKey === undefined) throw new ColorError('Invalid key in color scale');
			const referenceColor = colorScale[firstKey];
			if (referenceColor === undefined) throw new ColorError('Invalid reference color');
			colorScale[0] = Colors.W3C.Black.Convert(ColorSpaceManager.GetMetadata(referenceColor.constructor as TConstructorFunction<ColorSpace>).Ctor) as C;
		}

		if (colorScale[1] === undefined) {
			// If the ending color is undefined, we assume white.
			const [firstKey] = keys;
			if (firstKey === undefined) throw new ColorError('Invalid key in color scale');
			const referenceColor = colorScale[firstKey];
			if (referenceColor === undefined) throw new ColorError('Invalid reference color');
			colorScale[1] = Colors.W3C.White.Convert(ColorSpaceManager.GetMetadata(referenceColor.constructor as TConstructorFunction<ColorSpace>).Ctor) as C;
		}

		colorScale = ObjectSortKeys(colorScale) as TColorScale<C>;
		keys = Object.keys(colorScale).map((k) => parseFloat(k)).sort();

		const result: TColorScale<C> = {};

		for (let i = 0; i < keys.length - 1; i++) {
			const akey = keys[i];
			const bkey = keys[i + 1];
			if (akey === undefined || bkey === undefined) continue;

			const a = colorScale[akey];
			const b = colorScale[bkey];
			if (a === undefined || b === undefined) continue;

			for (const value of resolvedValues) {
				if (value < akey || value > bkey) continue;
				if (bkey === akey) continue; // Prevent division by zero

				const t = (value - akey) / (bkey - akey);
				result[value] = a.LERP(b, t) as C;
			}
		}

		return ObjectSortKeys(result);
	}
}
