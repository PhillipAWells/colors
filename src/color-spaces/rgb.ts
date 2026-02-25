/* eslint-disable no-magic-numbers */
import { AssertVector3, Clamp, IMatrix, IMatrix3, MatrixInverse, MatrixMultiply } from '@pawells/math-extended';
import { AssertInstanceOf, AssertNumber } from './assert.js';
import { ColorSpace } from './_color-space.js';
import { XYZ } from './xyz.js';
import { CMY } from './cmy.js';
import { CMYK } from './cmyk.js';
import { HSL } from './hsl.js';
import { HSV } from './hsv.js';
import { ColorSpaceManager } from './manager.js';
import { YCbCr } from './ycbcr.js';
import { YDbDr } from './ydbdr.js';
import { YIQ } from './yiq.js';
import { YUV } from './yuv.js';
import { YPbPr } from './ypbpr.js';
import { HCT } from './hct.js';
import { ColorError } from '../error.js';

type TRGBComponentSelection = 'R' | 'G' | 'B';

/**
 * Represents a color in the RGB (Red, Green, Blue) color space.
 *
 * The RGB color model is an additive color system where red, green, and blue light are combined
 * to produce various other colors. Each component (R, G, B) typically ranges from 0 to 1.
 * Internally, values are stored as normalized floating-point numbers.
 *
 * @see {@link https://www.w3.org/TR/css-color-4/#rgb-color | W3C CSS Color Module Level 4 - RGB Color}
 * @see {@link https://en.wikipedia.org/wiki/RGB_color_model | Wikipedia: RGB Color Model}
 */
@ColorSpaceManager.Register({
	name: 'RGB',
	description: 'Represents a color in the RGB (Red, Green, Blue) color space.',
	converters: [
		'HCT',
		'XYZ',
		'CMY',
		'CMYK',
		'HSL',
		'HSV',
		'YCbCr',
		'YDbDr',
		'YIQ',
		'YPbPr',
		'YUV',
	],
})
export class RGB extends ColorSpace {
	/**
	 * Internal array storing the RGB component values [R, G, B].
	 * Values are normalized floating-point numbers between 0 and 1.
	 */
	protected override components: [number, number, number];

	/**
	 * Gets the Red component value.
	 * @returns {number} The red component (0-1).
	 */
	public get R(): number {
		return this.components[0];
	}

	/**
	 * Sets the Red component value.
	 * @param {number} value - The new red component (0-1).
	 * @throws {ColorError} If the value is outside the range [0, 1].
	 */
	public set R(value: number) {
		RGB._AssertComponent('R', value);
		this.components[0] = value;
	}

	/**
	 * Gets the Green component value.
	 * @returns {number} The green component (0-1).
	 */
	public get G(): number {
		return this.components[1];
	}

	/**
	 * Sets the Green component value.
	 * @param {number} value - The new green component (0-1).
	 * @throws {ColorError} If the value is outside the range [0, 1].
	 */
	public set G(value: number) {
		RGB._AssertComponent('G', value);
		this.components[1] = value;
	}

	/**
	 * Gets the Blue component value.
	 * @returns {number} The blue component (0-1).
	 */
	public get B(): number {
		return this.components[2];
	}

	/**
	 * Sets the Blue component value.
	 * @param {number} value - The new blue component (0-1).
	 * @throws {ColorError} If the value is outside the range [0, 1].
	 */
	public set B(value: number) {
		RGB._AssertComponent('B', value);
		this.components[2] = value;
	}

	/**
	 * Creates a new RGB color instance.
	 * @param {number} [r=0] - Red component (0-1).
	 * @param {number} [g=0] - Green component (0-1).
	 * @param {number} [b=0] - Blue component (0-1).
	 * @throws {ColorError} If any component value is outside the range [0, 1].
	 */
	constructor(r: number = 0, g: number = 0, b: number = 0) {
		super();
		this.components = [0, 0, 0];
		this.R = r;
		this.G = g;
		this.B = b;
	}

	/**
	 * Returns a string representation of the RGB color.
	 * @param {'int' | 'float' | 'hex'} [format='float'] - The desired output format.
	 * @returns {string} A string representing the RGB color.
	 * @example
	 * ```typescript
	 * const color = new RGB(1, 0.5, 0);
	 * console.log(color.ToString());      // "RGB(1, 0.5, 0)"
	 * console.log(color.ToString('int')); // "RGB(255, 128, 0)"
	 * console.log(color.ToString('hex')); // "#ff8000"
	 * ```
	 */
	public override ToString(format?: 'int' | 'float' | 'hex'): string {
		if (format === 'hex') {
			const r = Math.round(this.R * 255);
			const g = Math.round(this.G * 255);
			const b = Math.round(this.B * 255);

			return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
		}
		if (format === 'int') {
			const r = Math.round(this.R * 255);
			const g = Math.round(this.G * 255);
			const b = Math.round(this.B * 255);

			return `RGB(${r}, ${g}, ${b})`;
		}

		return `RGB(${this.R}, ${this.G}, ${this.B})`;
	}

	/**
	 * Asserts that a value is an instance of {@link RGB}.
	 * @param {unknown} color - The value to assert.
	 * @throws {ColorError} If the value is not an {@link RGB} instance or its components are invalid.
	 */
	public static override Assert(color: unknown): asserts color is RGB {
		AssertInstanceOf(color, RGB, { class: ColorError, message: 'Not a RGB Color' });
		RGB._AssertComponent('R', color);
		RGB._AssertComponent('G', color);
		RGB._AssertComponent('B', color);
	}

	private static _AssertComponent(component: TRGBComponentSelection, color: RGB): void;
	private static _AssertComponent(component: TRGBComponentSelection, value: number): void;
	private static _AssertComponent(component: TRGBComponentSelection, colorOrValue: RGB | number): void {
		switch (component) {
			case 'R': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.R;
				AssertNumber(value, { gte: 0, lte: 1 }, { class: ColorError, message: 'Channel(R) must be in range [0, 1].' });
				break;
			}
			case 'G': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.G;
				AssertNumber(value, { gte: 0, lte: 1 }, { class: ColorError, message: 'Channel(G) must be in range [0, 1].' });
				break;
			}
			case 'B': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.B;
				AssertNumber(value, { gte: 0, lte: 1 }, { class: ColorError, message: 'Channel(B) must be in range [0, 1].' });
				break;
			}
		}
	}

	/**
	 * Validates if a value is a valid {@link RGB} color.
	 * @param {unknown} color - The value to validate.
	 * @returns {boolean} `true` if the color is valid, `false` otherwise.
	 */
	public static override Validate(color: unknown): boolean {
		try {
			RGB.Assert(color);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Converts a color from another color space or hex string to RGB.
	 * @param {CMY | CMYK | HSL | HSV | XYZ | YCbCr | YDbDr | YIQ | YUV | YPbPr | ColorSpace | string} color - The source color to convert, or a hex string.
	 * @returns {RGB} A new RGB color instance.
	 * @throws {ColorError} If the source color space is not supported or hex string is invalid.
	 */
	public static From(color: CMY | CMYK | HSL | HSV | XYZ | YCbCr | YDbDr | YIQ | YUV | YPbPr | ColorSpace | string): RGB {
		if (typeof color === 'string') return RGB.FromHex(color);
		if (color instanceof XYZ) return RGB.FromXYZ(color);
		if (color instanceof CMY) return RGB.FromCMY(color);
		if (color instanceof CMYK) return RGB.FromCMYK(color);
		if (color instanceof HSL) return RGB.FromHSL(color);
		if (color instanceof HSV) return RGB.FromHSV(color);
		if (color instanceof YCbCr) return RGB.FromYCbCr(color);
		if (color instanceof YDbDr) return RGB.FromYDbDr(color);
		if (color instanceof YIQ) return RGB.FromYIQ(color);
		if (color instanceof YPbPr) return RGB.FromYPbPr(color);
		if (color instanceof YUV) return RGB.FromYUV(color);
		if (color instanceof HCT) return RGB.FromHCT(color);
		throw new ColorError('Cannot convert to RGB');
	}

	/**
	 * Converts an {@link XYZ} color to {@link RGB}.
	 * @param {XYZ} color - The XYZ color to convert.
	 * @returns {RGB} A new RGB color instance.
	 */
	public static FromXYZ(color: XYZ): RGB {
		XYZ.Validate(color);

		const matrix = [
			[3.2404542, -1.5371385, -0.4985314],
			[-0.9692660, 1.8760108, 0.0415560],
			[0.0556434, -0.2040259, 1.0572252],
		];
		// XYZ values are stored as 0-100, but the transformation matrix expects 0-1 range
		// Scale the XYZ values down by dividing by 100
		const xyzNormalized = color.ToArray().map(v => v / 100);

		// Convert XYZ to linear RGB values
		const linRgb = MatrixMultiply(matrix, xyzNormalized);
		if (!linRgb || linRgb.length < 3) {
			throw new ColorError('Matrix multiplication failed');
		}
		const [rLin, gLin, bLin] = linRgb as [number, number, number];

		// Apply sRGB companding (gamma correction) as per W3C spec
		// https://www.w3.org/TR/css-color-4/#rgb-to-xyz
		const rComp = rLin <= 0.0031308 ? 12.92 * rLin : (1.055 * Math.pow(rLin, 1 / 2.4)) - 0.055;
		const gComp = gLin <= 0.0031308 ? 12.92 * gLin : (1.055 * Math.pow(gLin, 1 / 2.4)) - 0.055;
		const bComp = bLin <= 0.0031308 ? 12.92 * bLin : (1.055 * Math.pow(bLin, 1 / 2.4)) - 0.055;

		// Clamp the values and return new RGB instance
		return new RGB(
			Clamp(rComp, 0, 1),
			Clamp(gComp, 0, 1),
			Clamp(bComp, 0, 1),
		);
	}

	/**
	 * Converts a {@link CMY} color to {@link RGB}.
	 * @param {CMY} color - The CMY color to convert.
	 * @returns {RGB} A new RGB color instance.
	 */
	public static FromCMY(color: CMY): RGB {
		CMY.Validate(color);

		const r = 1 - color.C;
		const g = 1 - color.M;
		const b = 1 - color.Y;

		return new RGB(r, g, b);
	}

	/**
	 * Converts a {@link CMYK} color to {@link RGB}.
	 * @param {CMYK} color - The CMYK color to convert.
	 * @returns {RGB} A new RGB color instance.
	 */
	public static FromCMYK(color: CMYK): RGB {
		CMYK.Validate(color);

		const r = 1 - Math.min(1, (color.C * (1 - color.K)) + color.K);
		const g = 1 - Math.min(1, (color.M * (1 - color.K)) + color.K);
		const b = 1 - Math.min(1, (color.Y * (1 - color.K)) + color.K);

		return new RGB(r, g, b);
	}

	/**
	 * Converts an {@link HSL} color to {@link RGB}.
	 * @param {HSL} color - The HSL color to convert.
	 * @returns {RGB} A new RGB color instance.
	 */
	public static FromHSL(color: HSL): RGB {
		HSL.Validate(color);

		const c = (1 - Math.abs((2 * color.L) - 1)) * color.S;
		const x = c * (1 - Math.abs(((color.H / 60) % 2) - 1));
		const m = color.L - (c / 2);

		let r = 0;
		let g = 0;
		let b = 0;

		// Map HSL to RGB based on hue sector, as per algorithm described on Wikipedia.
		// @see https://en.wikipedia.org/wiki/HSL_and_HSV#From_HSL
		if (color.H >= 0 && color.H < 60) {
			r = c;
			g = x;
		} else if (color.H >= 60 && color.H < 120) {
			r = x;
			g = c;
		} else if (color.H >= 120 && color.H < 180) {
			g = c;
			b = x;
		} else if (color.H >= 180 && color.H < 240) {
			g = x;
			b = c;
		} else if (color.H >= 240 && color.H < 300) {
			r = x;
			b = c;
		} else if (color.H >= 300 && color.H < 360) {
			r = c;
			b = x;
		}

		// Adjust by the lightness modifier
		r += m;
		g += m;
		b += m;
		return new RGB(r, g, b);
	}

	/**
	 * Converts an {@link HSV} color to {@link RGB}.
	 * @param {HSV} color - The HSV color to convert.
	 * @returns {RGB} A new RGB color instance.
	 */
	public static FromHSV(color: HSV): RGB {
		HSV.Validate(color);

		const c = color.V * color.S;
		const x = c * (1 - Math.abs(((color.H / 60) % 2) - 1));
		const m = color.V - c;

		let r = 0;
		let g = 0;
		let b = 0;

		// Map HSV to RGB based on hue sector, as per algorithm described on Wikipedia.
		// @see https://en.wikipedia.org/wiki/HSL_and_HSV#From_HSV
		if (color.H >= 0 && color.H < 60) {
			r = c;
			g = x;
		} else if (color.H >= 60 && color.H < 120) {
			r = x;
			g = c;
		} else if (color.H >= 120 && color.H < 180) {
			g = c;
			b = x;
		} else if (color.H >= 180 && color.H < 240) {
			g = x;
			b = c;
		} else if (color.H >= 240 && color.H < 300) {
			r = x;
			b = c;
		} else {
			r = c;
			b = x;
		}

		// Adjust by the value modifier
		r += m;
		g += m;
		b += m;
		return new RGB(r, g, b);
	}

	/**
	 * Converts a {@link YCbCr} color to {@link RGB} using standard broadcast transformations (BT.601 or BT.709).
	 * This involves applying an inverse transformation matrix followed by sRGB gamma correction.
	 * @param {YCbCr} color - The YCbCr color to convert.
	 * @returns {RGB} A new RGB color instance.
	 * @throws {ColorError} If the input color is not a valid {@link YCbCr} color or matrix multiplication fails.
	 * @see {@link https://en.wikipedia.org/wiki/YCbCr | Wikipedia: YCbCr}
	 * @see {@link https://www.itu.int/rec/R-REC-BT.601 | ITU-R BT.601}
	 * @see {@link https://www.itu.int/rec/R-REC-BT.709 | ITU-R BT.709}
	 */
	public static FromYCbCr(color: YCbCr): RGB {
		YCbCr.Validate(color);

		// Determine the transformation matrix based on the standard (BT.601 or BT.709) and
		// apply its inverse to get linear RGB values. Then, convert to sRGB space with gamma correction.
		const transformation = color.Standard === 'BT601' ? YCbCr.BT601 : YCbCr.BT709;
		const inverse = MatrixInverse(transformation);
		const linearRgb = MatrixMultiply(inverse, color.ToArray());
		if (!linearRgb || linearRgb.length < 3) {
			throw new ColorError('Matrix multiplication failed');
		}
		const rgb = linearRgb.map((value) => {
			return value <= 0.0031308 ? 12.92 * value : (1.055 * Math.pow(value, 1 / 2.4)) - 0.055;
		});

		// Clamp values to valid RGB range [0,1]
		return new RGB(
			Clamp(rgb[0] ?? 0, 0, 1),
			Clamp(rgb[1] ?? 0, 0, 1),
			Clamp(rgb[2] ?? 0, 0, 1),
		);
	}

	/**
	 * Converts a {@link YDbDr} color to {@link RGB} using the SECAM standard transformation.
	 * @param {YDbDr} color - The YDbDr color to convert.
	 * @returns {RGB} A new RGB color instance.
	 * @throws {ColorError} If the input color is not a valid {@link YDbDr} color or matrix multiplication fails.
	 * @see {@link https://en.wikipedia.org/wiki/YDbDr | Wikipedia: YDbDr}
	 */
	public static FromYDbDr(color: YDbDr): RGB {
		YDbDr.Validate(color);

		const transformation:IMatrix3 = [
			[1, 0.000092303716148, -0.525912630661865],
			[1, -0.129132898890509, 0.267899328207599],
			[1, 0.664679059978955, -0.000079202543533],
		];

		const rgb = MatrixMultiply(transformation, color.ToArray());
		if (!rgb || rgb.length < 3) {
			throw new ColorError('Matrix multiplication failed');
		}

		return new RGB(
			Clamp(rgb[0] ?? 0, 0, 1),
			Clamp(rgb[1] ?? 0, 0, 1),
			Clamp(rgb[2] ?? 0, 0, 1),
		);
	}

	/**
	 * Converts a {@link YIQ} color to {@link RGB} using the NTSC standard transformation.
	 * @param {YIQ} color - The YIQ color to convert.
	 * @returns {RGB} A new RGB color instance.
	 * @throws {ColorError} If the input color is not a valid {@link YIQ} color or matrix multiplication fails.
	 * @see {@link https://en.wikipedia.org/wiki/YIQ | Wikipedia: YIQ}
	 */
	public static FromYIQ(color: YIQ): RGB {
		YIQ.Validate(color);

		const transformation = [
			[1, 0.946882, 0.623557],
			[1, -0.274788, -0.635668],
			[1, -1.108545, 1.700535],
		];

		const rgb = MatrixMultiply(transformation, color.ToArray());
		if (!rgb || rgb.length < 3) {
			throw new ColorError('Matrix multiplication failed');
		}

		return new RGB(
			Clamp(rgb[0] ?? 0, 0, 1),
			Clamp(rgb[1] ?? 0, 0, 1),
			Clamp(rgb[2] ?? 0, 0, 1),
		);
	}

	/**
	 * Converts a {@link YPbPr} color to {@link RGB} using standard-specific transformations (BT.601, BT.709, or BT.2020).
	 * @param {YPbPr} color - The YPbPr color to convert.
	 * @returns {RGB} A new RGB color instance.
	 * @throws {ColorError} If the input color is not a valid {@link YPbPr} color, the standard is unrecognized, or matrix multiplication fails.
	 * @see {@link https://en.wikipedia.org/wiki/YPbPr | Wikipedia: YPbPr}
	 * @see {@link https://www.itu.int/rec/R-REC-BT.601 | ITU-R BT.601}
	 * @see {@link https://www.itu.int/rec/R-REC-BT.709 | ITU-R BT.709}
	 * @see {@link https://www.itu.int/rec/R-REC-BT.2020 | ITU-R BT.2020}
	 */
	public static FromYPbPr(color: YPbPr): RGB {
		YPbPr.Validate(color);

		// Select the appropriate transformation matrix based on the YPbPr standard (BT.601, BT.709, or BT.2020) and apply
		// it to convert YPbPr to RGB. The specifics of these matrices can be found in the linked ITU-R recommendations.
		let transformation: IMatrix = [];

		switch (color.Standard) {
			case 'BT601':
				transformation = [
					[1, 0, 1.402],
					[1, -0.344136, -0.714136],
					[1, 1.772, 0],
				];
				break;
			case 'BT709':
				transformation = [
					[1, 0, 1.5748],
					[1, -0.187324, -0.468124],
					[1, 1.8556, 0],
				];
				break;
			case 'BT2020':
				transformation = [
					[1, 0, 1.4746],
					[1, -0.164553, -0.571353],
					[1, 1.8814, 0],
				];
				break;
			default:
				throw new ColorError(`Unrecognized YPbPr Standard(${color.Standard})`);
		}

		const rgb = MatrixMultiply(transformation, color.ToArray());
		AssertVector3(rgb);

		return new RGB(
			Clamp(rgb[0], 0, 1),
			Clamp(rgb[1], 0, 1),
			Clamp(rgb[2], 0, 1),
		);
	}

	/**
	 * Converts a {@link YUV} color to {@link RGB} using standard-specific transformations (BT.470 or BT.709).
	 * @param {YUV} color - The YUV color to convert.
	 * @returns {RGB} A new RGB color instance.
	 * @throws {ColorError} If the input color is not a valid {@link YUV} color, the standard is unrecognized, or matrix multiplication fails.
	 * @see {@link https://en.wikipedia.org/wiki/YUV | Wikipedia: YUV}
	 * @see {@link https://www.itu.int/rec/R-REC-BT.470 | ITU-R BT.470}
	 * @see {@link https://www.itu.int/rec/R-REC-BT.709 | ITU-R BT.709}
	 */
	public static FromYUV(color: YUV): RGB {
		YUV.Validate(color);

		// Select the appropriate transformation matrix based on the YUV standard (BT.470 or BT.709) and apply
		// it to convert YUV to RGB. The specifics of these matrices can be found in the linked ITU-R recommendations.
		let transformation = [];
		if (color.Standard === 'BT470') {
			transformation = [
				[1, 0, 1.13983],
				[1, -0.39465, -0.58060],
				[1, 2.03211, 0],
			];
		} else if (color.Standard === 'BT709') {
			transformation = [
				[1, 0, 1.28033],
				[1, -0.21482, -0.38059],
				[1, 2.12798, 0],
			];
		} else {
			throw new ColorError(`Unrecognized YUV Standard(${color.Standard})`);
		}

		const rgb = MatrixMultiply(transformation, color.ToArray());
		AssertVector3(rgb);

		return new RGB(
			Clamp(rgb[0], 0, 1),
			Clamp(rgb[1], 0, 1),
			Clamp(rgb[2], 0, 1),
		);
	}

	/**
	 * Converts an HCT color to RGB.
	 * @param color - The HCT color to convert.
	 * @returns A new RGB color instance.
	 */
	public static FromHCT(color: HCT): RGB {
		// HCT has a direct ToRGB method
		return color.ToRGB();
	}

	/**
	 * Converts a hex color string to {@link RGB}.
	 * @param {string} hexString - The hex color string (e.g., "#FF8000", "#F80", "FF8000").
	 * @returns {RGB} A new RGB color instance.
	 * @throws {ColorError} If the hex string is not a valid hex color format.
	 * @example
	 * ```typescript
	 * const color1 = RGB.FromHex("#FF8000"); // Orange
	 * const color2 = RGB.FromHex("#F80");    // Same orange (short form)
	 * const color3 = RGB.FromHex("FF8000");  // Same orange (no # prefix)
	 * ```
	 */
	public static FromHex(hexString: string): RGB {
		// Validate input
		if (typeof hexString !== 'string') {
			throw new ColorError('Hex string must be a string');
		}

		// Remove # prefix if present
		let hex = hexString.startsWith('#') ? hexString.slice(1) : hexString;

		// Validate hex format and expand short form
		if (!/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(hex)) {
			throw new ColorError(`Invalid hex color format: ${hexString}. Expected 3 or 6 hexadecimal digits.`);
		}

		// Expand 3-digit hex to 6-digit
		if (hex.length === 3) {
			hex = hex.split('').map(char => char + char).join('');
		}

		// Parse hex pairs to RGB values (0-255)
		const r = parseInt(hex.slice(0, 2), 16);
		const g = parseInt(hex.slice(2, 4), 16);
		const b = parseInt(hex.slice(4, 6), 16);

		// Convert to normalized RGB (0-1) and create instance
		return new RGB(r / 255, g / 255, b / 255);
	}
}
