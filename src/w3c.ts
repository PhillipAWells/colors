/* eslint-disable no-magic-numbers */
import { ColorSpaces } from './color-spaces/index.js';

/**
 * Collection of W3C standard web colors in RGB format.
 *
 * The W3C class provides all standard web colors as defined by the World Wide Web Consortium.
 * These colors are widely recognized and supported across web browsers and design applications.
 * All colors are provided as RGB instances with values normalized to the 0-1 range.
 *
 * The collection includes both basic colors (16 colors from HTML 4.01) and extended colors
 * (140+ additional colors from CSS3/HTML5). All color values are pre-calculated and stored
 * as static readonly properties for optimal performance.
 *
 * @example
 * ```typescript
 * import { Colors } from '@pawells/colors';
 *
 * // Basic colors
 * const red = Colors.W3C.Red;           // RGB(1, 0, 0)
 * const green = Colors.W3C.Green;       // RGB(0, 0.5, 0) - Web green
 * const lime = Colors.W3C.Lime;         // RGB(0, 1, 0) - Pure green
 * const blue = Colors.W3C.Blue;         // RGB(0, 0, 1)
 *
 * // Extended colors
 * const coral = Colors.W3C.Coral;       // RGB(1, 0.498, 0.314)
 * const skyBlue = Colors.W3C.SkyBlue;   // RGB(0.529, 0.808, 0.922)
 * const gold = Colors.W3C.Gold;         // RGB(1, 0.843, 0)
 *
 * // Convert to other color spaces
 * const redHSL = red.Convert(ColorSpaces.HSL);
 * const blueXYZ = blue.Convert(ColorSpaces.XYZ);
 * ```
 *
 * @remarks
 * - All RGB values use the sRGB color space
 * - Component values are normalized to 0-1 range (not 0-255)
 * - Colors can be converted to any supported color space using the Convert method
 * - Color names follow CSS specifications and are case-sensitive
 * - Performance optimized: all colors are pre-instantiated as readonly properties
 *
 * @see {@link https://www.w3.org/TR/css-color-3/#x11-color} W3C CSS Color Module Level 3
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/color_value} MDN CSS Color Values
 */
export class W3C {
	// Basic Colors
	public readonly Black = new ColorSpaces.RGB(0, 0, 0);

	public readonly Silver = new ColorSpaces.RGB(192 / 255, 192 / 255, 192 / 255);

	public readonly Gray = new ColorSpaces.RGB(128 / 255, 128 / 255, 128 / 255);

	public readonly White = new ColorSpaces.RGB(1, 1, 1);

	public readonly Maroon = new ColorSpaces.RGB(128 / 255, 0, 0);

	public readonly Red = new ColorSpaces.RGB(1, 0, 0);

	public readonly Purple = new ColorSpaces.RGB(128 / 255, 0, 128 / 255);

	public readonly Fuchsia = new ColorSpaces.RGB(1, 0, 1);

	public readonly Green = new ColorSpaces.RGB(0, 128 / 255, 0);

	public readonly Lime = new ColorSpaces.RGB(0, 1, 0);

	public readonly Olive = new ColorSpaces.RGB(128 / 255, 128 / 255, 0);

	public readonly Yellow = new ColorSpaces.RGB(1, 1, 0);

	public readonly Navy = new ColorSpaces.RGB(0, 0, 128 / 255);

	public readonly Blue = new ColorSpaces.RGB(0, 0, 1);

	public readonly Teal = new ColorSpaces.RGB(0, 128 / 255, 128 / 255);

	public readonly Aqua = new ColorSpaces.RGB(0, 1, 1);

	// Extended colors
	public readonly AliceBlue = new ColorSpaces.RGB(240 / 255, 248 / 255, 1);

	public readonly AntiqueWhite = new ColorSpaces.RGB(250 / 255, 235 / 255, 215 / 255);

	public readonly Aquamarine = new ColorSpaces.RGB(127 / 255, 1, 212 / 255);

	public readonly Azure = new ColorSpaces.RGB(240 / 255, 1, 1);

	public readonly Beige = new ColorSpaces.RGB(245 / 255, 245 / 255, 220 / 255);

	public readonly Bisque = new ColorSpaces.RGB(1, 228 / 255, 196 / 255);

	public readonly BlanchedAlmond = new ColorSpaces.RGB(1, 235 / 255, 205 / 255);

	public readonly BlueViolet = new ColorSpaces.RGB(138 / 255, 43 / 255, 226 / 255);

	public readonly Brown = new ColorSpaces.RGB(165 / 255, 42 / 255, 42 / 255);

	public readonly Burlywood = new ColorSpaces.RGB(222 / 255, 184 / 255, 135 / 255);

	public readonly CadetBlue = new ColorSpaces.RGB(95 / 255, 158 / 255, 160 / 255);

	public readonly Chartreuse = new ColorSpaces.RGB(127 / 255, 1, 0);

	public readonly Chocolate = new ColorSpaces.RGB(210 / 255, 105 / 255, 30 / 255);

	public readonly Coral = new ColorSpaces.RGB(1, 127 / 255, 80 / 255);

	public readonly CornflowerBlue = new ColorSpaces.RGB(100 / 255, 149 / 255, 237 / 255);

	public readonly Cornsilk = new ColorSpaces.RGB(1, 248 / 255, 220 / 255);

	public readonly Crimson = new ColorSpaces.RGB(220 / 255, 20 / 255, 60 / 255);

	public readonly Cyan = new ColorSpaces.RGB(0, 1, 1);

	public readonly DarkBlue = new ColorSpaces.RGB(0, 0, 139 / 255);

	public readonly DarkCyan = new ColorSpaces.RGB(0, 139 / 255, 139 / 255);

	public readonly DarkGoldenrod = new ColorSpaces.RGB(184 / 255, 134 / 255, 11 / 255);

	public readonly DarkGray = new ColorSpaces.RGB(169 / 255, 169 / 255, 169 / 255);

	public readonly DarkGreen = new ColorSpaces.RGB(0, 100 / 255, 0);

	public readonly DarkGrey = new ColorSpaces.RGB(169 / 255, 169 / 255, 169 / 255);

	public readonly DarkKhaki = new ColorSpaces.RGB(189 / 255, 183 / 255, 107 / 255);

	public readonly DarkMagenta = new ColorSpaces.RGB(139 / 255, 0, 139 / 255);

	public readonly DarkOliveGreen = new ColorSpaces.RGB(85 / 255, 107 / 255, 47 / 255);

	public readonly DarkOrange = new ColorSpaces.RGB(1, 140 / 255, 0);

	public readonly DarkOrchid = new ColorSpaces.RGB(153 / 255, 50 / 255, 204 / 255);

	public readonly DarkRed = new ColorSpaces.RGB(139 / 255, 0, 0);

	public readonly DarkSalmon = new ColorSpaces.RGB(233 / 255, 150 / 255, 122 / 255);

	public readonly DarkSeaGreen = new ColorSpaces.RGB(143 / 255, 188 / 255, 143 / 255);

	public readonly DarkSlateBlue = new ColorSpaces.RGB(72 / 255, 61 / 255, 139 / 255);

	public readonly DarkSlateGray = new ColorSpaces.RGB(47 / 255, 79 / 255, 79 / 255);

	public readonly DarkSlateGrey = new ColorSpaces.RGB(47 / 255, 79 / 255, 79 / 255);

	public readonly DarkTurquoise = new ColorSpaces.RGB(0, 206 / 255, 209 / 255);

	public readonly DarkViolet = new ColorSpaces.RGB(148 / 255, 0, 211 / 255);

	public readonly DeepPink = new ColorSpaces.RGB(1, 20 / 255, 147 / 255);

	public readonly DeepSkyBlue = new ColorSpaces.RGB(0, 191 / 255, 1);

	public readonly DimGray = new ColorSpaces.RGB(105 / 255, 105 / 255, 105 / 255);

	public readonly DimGrey = new ColorSpaces.RGB(105 / 255, 105 / 255, 105 / 255);

	public readonly DodgerBlue = new ColorSpaces.RGB(30 / 255, 144 / 255, 1);

	public readonly FireBrick = new ColorSpaces.RGB(178 / 255, 34 / 255, 34 / 255);

	public readonly FloralWhite = new ColorSpaces.RGB(1, 250 / 255, 240 / 255);

	public readonly ForestGreen = new ColorSpaces.RGB(34 / 255, 139 / 255, 34 / 255);

	public readonly Gainsboro = new ColorSpaces.RGB(220 / 255, 220 / 255, 220 / 255);

	public readonly GhostWhite = new ColorSpaces.RGB(248 / 255, 248 / 255, 1);

	public readonly Gold = new ColorSpaces.RGB(1, 215 / 255, 0);

	public readonly Goldenrod = new ColorSpaces.RGB(218 / 255, 165 / 255, 32 / 255);

	public readonly GreenYellow = new ColorSpaces.RGB(173 / 255, 1, 47 / 255);

	public readonly Grey = new ColorSpaces.RGB(128 / 255, 128 / 255, 128 / 255);

	public readonly Honeydew = new ColorSpaces.RGB(240 / 255, 1, 240 / 255);

	public readonly HotPink = new ColorSpaces.RGB(1, 105 / 255, 180 / 255);

	public readonly IndianRed = new ColorSpaces.RGB(205 / 255, 92 / 255, 92 / 255);

	public readonly Indigo = new ColorSpaces.RGB(75 / 255, 0, 130 / 255);

	public readonly Ivory = new ColorSpaces.RGB(1, 1, 240 / 255);

	public readonly Khaki = new ColorSpaces.RGB(240 / 255, 230 / 255, 140 / 255);

	public readonly Lavender = new ColorSpaces.RGB(230 / 255, 230 / 255, 250 / 255);

	public readonly LavenderBlush = new ColorSpaces.RGB(1, 240 / 255, 245 / 255);

	public readonly LawnGreen = new ColorSpaces.RGB(124 / 255, 252 / 255, 0);

	public readonly LemonChiffon = new ColorSpaces.RGB(1, 250 / 255, 205 / 255);

	public readonly LightBlue = new ColorSpaces.RGB(173 / 255, 216 / 255, 230 / 255);

	public readonly LightCoral = new ColorSpaces.RGB(240 / 255, 128 / 255, 128 / 255);

	public readonly LightCornflower = new ColorSpaces.RGB(224 / 255, 1, 1);

	public readonly LightGoldenrodYellow = new ColorSpaces.RGB(250 / 255, 250 / 255, 210 / 255);

	public readonly LightGray = new ColorSpaces.RGB(211 / 255, 211 / 255, 211 / 255);

	public readonly LightGreen = new ColorSpaces.RGB(144 / 255, 238 / 255, 144 / 255);

	public readonly LightGrey = new ColorSpaces.RGB(211 / 255, 211 / 255, 211 / 255);

	public readonly LightPink = new ColorSpaces.RGB(1, 182 / 255, 193 / 255);

	public readonly LightSalmon = new ColorSpaces.RGB(1, 160 / 255, 122 / 255);

	public readonly LightSeaGreen = new ColorSpaces.RGB(32 / 255, 178 / 255, 170 / 255);

	public readonly LightSkyBlue = new ColorSpaces.RGB(135 / 255, 206 / 255, 250 / 255);

	public readonly LightSlateGray = new ColorSpaces.RGB(119 / 255, 136 / 255, 153 / 255);

	public readonly LightSlateGrey = new ColorSpaces.RGB(119 / 255, 136 / 255, 153 / 255);

	public readonly LightSteelBlue = new ColorSpaces.RGB(176 / 255, 196 / 255, 222 / 255);

	public readonly LightYellow = new ColorSpaces.RGB(1, 1, 224 / 255);

	public readonly LimeGreen = new ColorSpaces.RGB(50 / 255, 205 / 255, 50 / 255);

	public readonly Magenta = new ColorSpaces.RGB(1, 0, 1);

	public readonly MediumAquamarine = new ColorSpaces.RGB(102 / 255, 205 / 255, 170 / 255);

	public readonly MediumBlue = new ColorSpaces.RGB(0, 0, 205 / 255);

	public readonly MediumOrchid = new ColorSpaces.RGB(186 / 255, 85 / 255, 211 / 255);

	public readonly MediumPurple = new ColorSpaces.RGB(147 / 255, 112 / 255, 219 / 255);

	public readonly MediumSeaGreen = new ColorSpaces.RGB(60 / 255, 179 / 255, 113 / 255);

	public readonly MediumSlateBlue = new ColorSpaces.RGB(123 / 255, 104 / 255, 238 / 255);

	public readonly MediumspringGreen = new ColorSpaces.RGB(0, 250 / 255, 154 / 255);

	public readonly MediumTurquoise = new ColorSpaces.RGB(72 / 255, 209 / 255, 204 / 255);

	public readonly MediumVioletRed = new ColorSpaces.RGB(199 / 255, 21 / 255, 133 / 255);

	public readonly MidnightBlue = new ColorSpaces.RGB(25 / 255, 25 / 255, 112 / 255);

	public readonly MintCream = new ColorSpaces.RGB(245 / 255, 1, 250 / 255);

	public readonly MistyRose = new ColorSpaces.RGB(1, 228 / 255, 225 / 255);

	public readonly Moccasin = new ColorSpaces.RGB(1, 228 / 255, 181 / 255);

	public readonly NavajoWhite = new ColorSpaces.RGB(1, 222 / 255, 173 / 255);

	public readonly OldLace = new ColorSpaces.RGB(253 / 255, 245 / 255, 230 / 255);

	public readonly OliveDrab = new ColorSpaces.RGB(107 / 255, 142 / 255, 35 / 255);

	public readonly Orange = new ColorSpaces.RGB(1, 165 / 255, 0);

	public readonly OrangeRed = new ColorSpaces.RGB(1, 69 / 255, 0);

	public readonly Orchid = new ColorSpaces.RGB(218 / 255, 112 / 255, 214 / 255);

	public readonly PaleGoldenrod = new ColorSpaces.RGB(238 / 255, 232 / 255, 170 / 255);

	public readonly PaleGreen = new ColorSpaces.RGB(152 / 255, 251 / 255, 152 / 255);

	public readonly PaleTurquoise = new ColorSpaces.RGB(175 / 255, 238 / 255, 238 / 255);

	public readonly PaleVioletRed = new ColorSpaces.RGB(219 / 255, 112 / 255, 147 / 255);

	public readonly PapayaWhip = new ColorSpaces.RGB(1, 239 / 255, 213 / 255);

	public readonly PeachPuff = new ColorSpaces.RGB(1, 218 / 255, 185 / 255);

	public readonly Peru = new ColorSpaces.RGB(205 / 255, 133 / 255, 63 / 255);

	public readonly Pink = new ColorSpaces.RGB(1, 192 / 255, 203 / 255);

	public readonly Plum = new ColorSpaces.RGB(221 / 255, 160 / 255, 221 / 255);

	public readonly PowderBlue = new ColorSpaces.RGB(176 / 255, 224 / 255, 230 / 255);

	public readonly RosyBrown = new ColorSpaces.RGB(188 / 255, 143 / 255, 143 / 255);

	public readonly RoyalBlue = new ColorSpaces.RGB(65 / 255, 105 / 255, 225 / 255);

	public readonly SaddleBrown = new ColorSpaces.RGB(139 / 255, 69 / 255, 19 / 255);

	public readonly Salmon = new ColorSpaces.RGB(250 / 255, 128 / 255, 114 / 255);

	public readonly SandyBrown = new ColorSpaces.RGB(244 / 255, 164 / 255, 96 / 255);

	public readonly SeaGreen = new ColorSpaces.RGB(46 / 255, 139 / 255, 87 / 255);

	public readonly Seashell = new ColorSpaces.RGB(1, 245 / 255, 238 / 255);

	public readonly Sienna = new ColorSpaces.RGB(160 / 255, 82 / 255, 45 / 255);

	public readonly SkyBlue = new ColorSpaces.RGB(135 / 255, 206 / 255, 235 / 255);

	public readonly SlateBlue = new ColorSpaces.RGB(106 / 255, 90 / 255, 205 / 255);

	public readonly SlateGray = new ColorSpaces.RGB(112 / 255, 128 / 255, 144 / 255);

	public readonly SlateGrey = new ColorSpaces.RGB(112 / 255, 128 / 255, 144 / 255);

	public readonly Snow = new ColorSpaces.RGB(1, 250 / 255, 250 / 255);

	public readonly SpringGreen = new ColorSpaces.RGB(0, 1, 127 / 255);

	public readonly SteelBlue = new ColorSpaces.RGB(70 / 255, 130 / 255, 180 / 255);

	public readonly Tan = new ColorSpaces.RGB(210 / 255, 180 / 255, 140 / 255);

	public readonly Thistle = new ColorSpaces.RGB(216 / 255, 191 / 255, 216 / 255);

	public readonly Tomato = new ColorSpaces.RGB(1, 99 / 255, 71 / 255);

	public readonly Turquoise = new ColorSpaces.RGB(64 / 255, 224 / 255, 208 / 255);

	public readonly Violet = new ColorSpaces.RGB(238 / 255, 130 / 255, 238 / 255);

	public readonly Wheat = new ColorSpaces.RGB(245 / 255, 222 / 255, 179 / 255);

	public readonly WhiteSmoke = new ColorSpaces.RGB(245 / 255, 245 / 255, 245 / 255);

	public readonly YellowGreen = new ColorSpaces.RGB(154 / 255, 205 / 255, 50 / 255);
}
