/* eslint-disable no-magic-numbers */
import { IMatrix3, MatrixMultiply } from '@pawells/math-extended';
import { AssertNumber, AssertInstanceOf } from './assert.js';
import { ColorSpace } from './_color-space.js';
import { ColorSpaceManager } from './manager.js';
import { RGB } from './rgb.js';
import { ColorError } from '../error.js';

type TYpbPrStandards = 'BT601' | 'BT709' | 'BT2020';
type TYPbPrComponentSelection = 'Y' | 'Pb' | 'Pr';

/**
 * Represents a color in the YPbPr color space used for analog component video transmission.
 *
 * ## Overview
 * YPbPr is an analog video color space that separates luminance from chrominance information,
 * specifically designed for analog component video connections. It's the analog counterpart
 * to the digital YCbCr color space, using different value ranges and encoding methods.
 * YPbPr enables high-quality color transmission over analog video interfaces.
 *
 * ## Component Details
 * - **Y**: Luma (brightness/luminance) component representing perceived brightness (0-1)
 * - **Pb**: Blue-difference chroma component representing blue color deviation (-0.5 to 0.5)
 * - **Pr**: Red-difference chroma component representing red color deviation (-0.5 to 0.5)
 *
 * ## Key Characteristics
 * - **Analog Transmission**: Optimized for analog video signal transmission
 * - **Bandwidth Efficiency**: Enables chroma subsampling for reduced bandwidth
 * - **Hardware Compatibility**: Widely supported by professional video equipment
 * - **Multiple Standards**: Supports BT.601, BT.709, and BT.2020 broadcast standards
 * - **High Dynamic Range**: Preserves full luminance range for quality video
 *
 * ## Common Applications
 * - Professional video equipment and broadcast systems
 * - Component video connections (Y/Pb/Pr RCA jacks)
 * - Analog video processing and distribution systems
 * - Legacy video format conversion and archival
 * - High-definition analog video transmission
 *
 * ## Broadcast Standards
 * - **BT.601**: Standard Definition (SD) television, legacy systems
 * - **BT.709**: High Definition (HD) television, modern displays
 * - **BT.2020**: Ultra High Definition (UHD/4K), wide color gamut
 *
 * @example
 * ```typescript
 * // Create YPbPr colors with different standards
 * const basicColor = new YPbPr(0.5, 0.2, -0.1); // BT.2020 default
 * const hdColor = new YPbPr(0.7, 0.0, 0.3, 'BT709');
 * const sdColor = new YPbPr(0.3, -0.2, 0.1, 'BT601');
 * ```
 *
 * @example
 * ```typescript
 * // Component video signal processing
 * const videoSignal = new YPbPr(0.6, 0.1, -0.05, 'BT709');
 * console.log(`Luma: ${videoSignal.Y}`);
 * console.log(`Blue difference: ${videoSignal.Pb}`);
 * console.log(`Red difference: ${videoSignal.Pr}`);
 * console.log(`Standard: ${videoSignal.Standard}`);
 * ```
 *
 * @example
 * ```typescript * // Analog video equipment interface
 * const analogVideo = YPbPr.FromRGB(rgbSource, 'BT709');
 * const outputSignal = analogVideo.ToString(); // For hardware configuration
 *
 * // Broadcast standard selection based on content type
 * const standard = isUHDContent ? 'BT2020' : isHDContent ? 'BT709' : 'BT601';
 * const broadcastSignal = YPbPr.FromRGB(sourceColor, standard);
 * ```
 */
@ColorSpaceManager.Register({
	name: 'YPbPr',
	description: 'Represents a color in the YPbPr color space used in analog component video signals.',
	converters: [
		'RGB',
	],
})
export class YPbPr extends ColorSpace {
	/** Internal array storing the YPbPr component values [Y, Pb, Pr] */
	protected override components: [number, number, number];

	/**
	 * Gets the Y (luma/brightness) component value.
	 *
	 * The Y component represents the luma or luminance channel, containing the
	 * brightness information of the color. This component is derived from the
	 * weighted sum of RGB components and represents the perceived brightness
	 * as it would appear on a monochrome display.
	 *
	 * @returns The Y component value in the range [0, 1]
	 * - 0 = Complete darkness (black)
	 * - 1 = Maximum brightness (white)
	 *
	 * @example
	 * ```typescript	 * const color = new YPbPr(0.7, 0.1, -0.2);
	 * const brightness = color.Y; // 0.7
	 *
	 * // Analyze video content brightness
	 * if (color.Y < 0.2) {
	 *   console.log('Dark scene detected');
	 * } else if (color.Y > 0.8) {
	 *   console.log('Bright scene detected');
	 * }
	 * ```
	 */
	public get Y(): number {
		return this.components[0];
	}

	/**
	 * Sets the Y (luma/brightness) component value with validation.
	 *
	 * Updates the luma component while ensuring the value remains within
	 * the valid range for YPbPr color space. Invalid values will throw
	 * a ColorError to maintain color space integrity.
	 *
	 * @param value - The Y value to set, must be in range [0, 1]
	 * @throws {ColorError} If value is outside the valid range [0, 1] or not finite
	 *
	 * @example
	 * ```typescript	 * const color = new YPbPr();
	 * color.Y = 0.75; // Set to 75% brightness
	 *
	 * // Video brightness adjustment
	 * const adjustBrightness = (color: YPbPr, factor: number) => {
	 *   color.Y = Math.min(1, Math.max(0, color.Y * factor));
	 * };
	 * ```
	 */
	public set Y(value: number) {
		YPbPr._AssertComponent('Y', value);
		this.components[0] = value;
	}

	/**
	 * Gets the Pb (blue-difference chroma) component value.
	 *
	 * The Pb component represents the blue-difference chroma channel, indicating
	 * how much the color deviates from the luma value in the blue direction.
	 * This component enables efficient encoding of blue color information
	 * separate from luminance, allowing for chroma subsampling in video transmission.
	 *
	 * @returns The Pb component value in the range [-0.5, 0.5]
	 * - Negative values indicate less blue (toward yellow/green)
	 * - Positive values indicate more blue
	 * - 0 indicates neutral (no blue bias)
	 *
	 * @example
	 * ```typescript	 * const color = new YPbPr(0.5, 0.3, -0.1);
	 * const blueComponent = color.Pb; // 0.3
	 *
	 * // Analyze blue content in video signal
	 * if (color.Pb > 0.2) {
	 *   console.log('Strong blue content detected');
	 * } else if (color.Pb < -0.2) {
	 *   console.log('Blue suppressed, yellow/green dominant');
	 * }
	 * ```
	 */
	public get Pb(): number {
		return this.components[1];
	}

	/**
	 * Sets the Pb (blue-difference chroma) component value with validation.
	 *
	 * Updates the blue-difference chroma component while ensuring the value
	 * remains within the valid range for YPbPr color space. Invalid values
	 * will throw a ColorError to maintain color space integrity.
	 *
	 * @param value - The Pb value to set, must be in range [-0.5, 0.5]
	 * @throws {ColorError} If value is outside the valid range [-0.5, 0.5] or not finite
	 *
	 * @example
	 * ```typescript	 * const color = new YPbPr(0.5, 0, 0);
	 * color.Pb = 0.25; // Add blue chroma
	 *
	 * // Chroma adjustment for color correction
	 * const adjustBlueChroma = (color: YPbPr, intensity: number) => {
	 *   color.Pb = Math.min(0.5, Math.max(-0.5, intensity));
	 * };
	 * ```
	 */
	public set Pb(value: number) {
		YPbPr._AssertComponent('Pb', value);
		this.components[1] = value;
	}

	/**
	 * Gets the Pr (red-difference chroma) component value.
	 *
	 * The Pr component represents the red-difference chroma channel, indicating
	 * how much the color deviates from the luma value in the red direction.
	 * This component enables efficient encoding of red color information
	 * separate from luminance, complementing the Pb component for full chroma representation.
	 *
	 * @returns The Pr component value in the range [-0.5, 0.5]
	 * - Negative values indicate less red (toward cyan/green)
	 * - Positive values indicate more red
	 * - 0 indicates neutral (no red bias)
	 *
	 * @example
	 * ```typescript	 * const color = new YPbPr(0.6, -0.1, 0.25);
	 * const redComponent = color.Pr; // 0.25
	 *
	 * // Analyze red content in video signal
	 * if (color.Pr > 0.2) {
	 *   console.log('Strong red content detected');
	 * } else if (color.Pr < -0.2) {
	 *   console.log('Red suppressed, cyan/green dominant');
	 * }
	 * ```
	 */
	public get Pr(): number {
		return this.components[2];
	}

	/**
	 * Sets the Pr (red-difference chroma) component value with validation.
	 *
	 * Updates the red-difference chroma component while ensuring the value
	 * remains within the valid range for YPbPr color space. Invalid values
	 * will throw a ColorError to maintain color space integrity.
	 *
	 * @param value - The Pr value to set, must be in range [-0.5, 0.5]
	 * @throws {ColorError} If value is outside the valid range [-0.5, 0.5] or not finite
	 *
	 * @example
	 * ```typescript	 * const color = new YPbPr(0.6, 0, 0);
	 * color.Pr = -0.15; // Reduce red, shift toward cyan
	 *
	 * // Color temperature adjustment through red chroma
	 * const adjustRedChroma = (color: YPbPr, warmth: number) => {
	 *   color.Pr = Math.min(0.5, Math.max(-0.5, warmth));
	 * };
	 * ```
	 */
	public set Pr(value: number) {
		YPbPr._AssertComponent('Pr', value);
		this.components[2] = value;
	}

	/** The broadcast standard used for color space transformations (BT.601, BT.709, or BT.2020) */
	/** The broadcast standard used for color space transformations (BT.601, BT.709, or BT.2020) */
	public readonly Standard: TYpbPrStandards;

	/**
	 * Creates a new YPbPr color instance with specified component values and broadcast standard.
	 *
	 * Constructs a YPbPr color with the provided luma and chroma components,
	 * using the specified broadcast standard for color space transformations.
	 * All component values are validated to ensure they fall within the
	 * valid ranges for the YPbPr color space.
	 *
	 * @param y - Y (luma) component value, range [0, 1], default: 0
	 * @param pb - Pb (blue-difference chroma) component value, range [-0.5, 0.5], default: 0
	 * @param pr - Pr (red-difference chroma) component value, range [-0.5, 0.5], default: 0
	 * @param standard - Broadcast standard for transformations, default: 'BT2020'
	 * @throws {ColorError} If any component value is outside its valid range
	 *
	 * @example
	 * ```typescript
	 * // Create basic YPbPr colors
	 * const black = new YPbPr(); // All components default to 0
	 * const gray = new YPbPr(0.5); // 50% gray with no chroma
	 * const colorful = new YPbPr(0.6, 0.2, -0.1, 'BT709');
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Video signal creation for different standards
	 * const sdVideo = new YPbPr(0.7, 0.1, 0.05, 'BT601'); // SD television
	 * const hdVideo = new YPbPr(0.7, 0.1, 0.05, 'BT709'); // HD television
	 * const uhdVideo = new YPbPr(0.7, 0.1, 0.05, 'BT2020'); // UHD/4K television
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Component video signal generation
	 * const videoSignal = new YPbPr(0.6, 0.15, -0.08, 'BT709');
	 * console.log(`Y: ${videoSignal.Y}, Pb: ${videoSignal.Pb}, Pr: ${videoSignal.Pr}`);
	 * console.log(`Standard: ${videoSignal.Standard}`);
	 * ```
	 */
	constructor(y: number = 0, pb: number = 0, pr: number = 0, standard: TYpbPrStandards = 'BT2020') {
		super();
		this.components = [0, 0, 0]; // Initialize to defaults
		this.Standard = standard;
		this.Y = y; // Use setters for validation
		this.Pb = pb;
		this.Pr = pr;
	}

	/**
	 * Creates a deep copy of the current YPbPr color instance.
	 *
	 * @remarks
	 * This method returns a new YPbPr object with the same Y, Pb, Pr component values
	 * and the same broadcast standard as the original. Modifications to the cloned instance
	 * do not affect the original object.
	 *
	 * @returns {YPbPr} A new YPbPr instance with identical component values and standard.
	 *
	 * @example
	 * ```typescript
	 * const original = new YPbPr(0.6, 0.1, -0.05, 'BT709');
	 * const copy = original.Clone();
	 * console.log(copy.ToString()); // "YPbPr(0.6, 0.1, -0.05)"
	 * console.log(copy.Standard);   // "BT709"
	 * ```
	 */
	public override Clone(): this {
		return new YPbPr(this.Y, this.Pb, this.Pr, this.Standard) as this;
	}

	/**
	 * Returns a string representation of the YPbPr color with component values.
	 *
	 * Generates a human-readable string representation of the YPbPr color
	 * showing all three component values in a standard format. This is
	 * useful for debugging, logging, and displaying color information
	 * in analog video processing applications.
	 *
	 * @returns A string in the format "YPbPr(Y, Pb, Pr)" with precise component values
	 *
	 * @example
	 * ```typescript
	 * const color = new YPbPr(0.721, 0.164, -0.089, 'BT709');	 * console.log(color.ToString()); // "YPbPr(0.721, 0.164, -0.089)"
	 *
	 * // Video signal logging
	 * const logVideoSignal = (signal: YPbPr) => {
	 *   console.log(`Video Signal: ${signal.ToString()}, Standard: ${signal.Standard}`);
	 * };
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Component video equipment configuration
	 * const testPattern = new YPbPr(0.5, 0.0, 0.0, 'BT709');
	 * const configString = `Test Pattern: ${testPattern.ToString()}`;
	 * // Output: "Test Pattern: YPbPr(0.5, 0, 0)"
	 * ```
	 */
	public override ToString(): string {
		return `YPbPr(${this.components.join(', ')})`;
	}

	/**
	 * Type guard assertion function that validates if a value is an instance of YPbPr.
	 *
	 * Performs comprehensive validation to ensure the provided value is a valid
	 * YPbPr color instance with all components within their valid ranges.
	 * This method provides TypeScript type narrowing, allowing safe access
	 * to YPbPr properties after assertion. Throws ColorError for any validation failures.
	 *
	 * @param color - The value to validate as a YPbPr instance
	 * @throws {ColorError} When the value is not an instance of YPbPr
	 * @throws {ColorError} When any component is outside its valid range
	 *
	 * @example
	 * ```typescript
	 * // Type narrowing with assertion
	 * const unknownColor: unknown = getColorFromAnalogVideo();
	 * YPbPr.Assert(unknownColor); // unknownColor is now typed as YPbPr
	 * console.log(unknownColor.Y, unknownColor.Pb, unknownColor.Pr);
	 * console.log(`Standard: ${unknownColor.Standard}`);
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Video signal validation pipeline
	 * const validateVideoSignal = (signal: unknown) => {
	 *   try {
	 *     YPbPr.Assert(signal);
	 *     return { valid: true, signal };
	 *   } catch (error) {
	 *     return { valid: false, error: error.message };
	 *   }
	 * };
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Batch analog video processing with validation
	 * const processAnalogSignals = (signals: unknown[]) => {
	 *   return signals.filter(signal => {
	 *     try {
	 *       YPbPr.Assert(signal);
	 *       return true;
	 *     } catch {
	 *       return false;
	 *     }
	 *   }) as YPbPr[];
	 * };
	 * ```
	 */
	public static override Assert(color: unknown): asserts color is YPbPr {
		AssertInstanceOf(color, YPbPr, { class: ColorError, message: 'Not a YPbPr Color' });
		YPbPr._AssertComponent('Y', color.Y);
		YPbPr._AssertComponent('Pb', color.Pb);
		YPbPr._AssertComponent('Pr', color.Pr);
	}

	/**
	 * Validates a single YPbPr component value by name.
	 * @param component - The component name ('Y', 'Pb', or 'Pr')
	 * @param colorOrValue - The value to validate
	 * @throws {ColorError} If the value is out of range or not a number
	 */
	private static _AssertComponent(component: TYPbPrComponentSelection, color: YPbPr): void;
	private static _AssertComponent(component: TYPbPrComponentSelection, value: number): void;
	private static _AssertComponent(component: TYPbPrComponentSelection, colorOrValue:YPbPr | number): void {
		switch (component) {
			case 'Y': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.Y;
				AssertNumber(value, { gte: 0, lte: 1 }, { class: ColorError, message: 'Channel(Y) must be in range [0, 1].' });
				break;
			}
			case 'Pb': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.Pb;
				AssertNumber(value, { gte: -0.5, lte: 0.5 }, { class: ColorError, message: 'Channel(Pb) must be in range [-0.5, 0.5].' });
				break;
			}
			case 'Pr': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.Pr;
				AssertNumber(value, { gte: -0.5, lte: 0.5 }, { class: ColorError, message: 'Channel(Pr) must be in range [-0.5, 0.5].' });
				break;
			}
			default:
				throw new ColorError(`Unknown YPbPr component: ${component}`);
		}
	}

	/**
	 * Validates that an object is a valid YPbPr color without throwing errors.
	 *
	 * Performs the same validation as Assert but returns a boolean result
	 * instead of throwing errors. This is useful for conditional processing,
	 * filtering operations, and validation pipelines where exceptions
	 * should be avoided.
	 *
	 * @param color - The object to validate as a YPbPr color
	 * @returns `true` if the object is a valid YPbPr color, `false` otherwise
	 *
	 * @example
	 * ```typescript
	 * // Conditional video signal processing
	 * const processIfValid = (signal: unknown) => {
	 *   if (YPbPr.Validate(signal)) {
	 *     // signal is now known to be YPbPr
	 *     console.log(`Processing signal: ${signal.ToString()}`);
	 *     return processAnalogVideo(signal);
	 *   }
	 *   return null;
	 * };
	 * ```
	 *
	 * @example
	 * ```typescript	 * // Filter valid analog video signals from mixed data
	 * const videoSignals = mixedData.filter(YPbPr.Validate) as YPbPr[];
	 * const validSignalCount = videoSignals.length;
	 *
	 * // Quality control for video signal import
	 * const qualityCheck = (signals: unknown[]) => {
	 *   const valid = signals.filter(YPbPr.Validate).length;
	 *   const total = signals.length;
	 *   return { valid, total, percentage: (valid / total) * 100 };
	 * };
	 * ```
	 */
	public static override Validate(color: unknown): boolean {
		try {
			YPbPr.Assert(color);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Factory method to create YPbPr colors from supported color space types.
	 *
	 * Converts colors from other color spaces to YPbPr using appropriate
	 * transformation algorithms. Currently supports conversion from RGB
	 * color space with configurable broadcast standards.
	 *
	 * @param color - The source color to convert to YPbPr (currently supports RGB)
	 * @returns A new YPbPr color instance equivalent to the input color
	 * @throws {ColorError} If the input color type is not supported for conversion
	 *
	 * @example
	 * ```typescript
	 * // Convert RGB to YPbPr for analog video output
	 * const rgbColor = new RGB(0.8, 0.4, 0.2);
	 * const analogSignal = YPbPr.From(rgbColor); // Uses default BT.2020 standard
	 * console.log(analogSignal.ToString());
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Batch conversion for video signal generation	 * const rgbFrameData = [
	 *   new RGB(1, 0, 0), // Red pixel
	 *   new RGB(0, 1, 0), // Green pixel
	 *   new RGB(0, 0, 1)  // Blue pixel
	 * ];
	 *
	 * const analogSignals = rgbFrameData.map(rgb => YPbPr.From(rgb));
	 * console.log(`Converted ${analogSignals.length} pixels to analog signals`);
	 * ```
	 */
	public static From(color: RGB): YPbPr {
		if (color instanceof RGB) return YPbPr.FromRGB(color);
		throw new ColorError('Cannot Convert to YPbPr');
	}

	/**
	 * Converts an RGB color to YPbPr color space using the specified broadcast standard.
	 *
	 * Performs precise colorimetric transformation from RGB to YPbPr using
	 * standard transformation matrices defined by broadcast industry specifications.
	 * Each standard uses different coefficients optimized for specific display
	 * technologies and viewing conditions.
	 *
	 * ## Transformation Process
	 * 1. **Matrix Selection**: Choose coefficients based on broadcast standard
	 * 2. **Linear Transformation**: Apply 3x3 matrix multiplication to RGB values
	 * 3. **Component Mapping**: Y = luma, Pb = blue-difference, Pr = red-difference
	 * 4. **Range Validation**: Ensure components fall within YPbPr valid ranges
	 *
	 * ## Broadcast Standards
	 * - **BT.601**: Standard Definition television (NTSC/PAL legacy systems)
	 * - **BT.709**: High Definition television (modern HD displays)
	 * - **BT.2020**: Ultra High Definition (4K/8K, wide color gamut)
	 *
	 * @param color - The RGB color to convert
	 * @param standard - The broadcast standard to use for conversion (default: 'BT2020')
	 * @returns A new YPbPr color instance using the specified standard
	 * @throws {ColorError} If the RGB color is invalid
	 * @throws {Error} If an unrecognized broadcast standard is specified
	 *
	 * @example
	 * ```typescript	 * // Standard conversions for different display types
	 * const rgbColor = new RGB(0.85, 0.45, 0.25);
	 *
	 * const sdSignal = YPbPr.FromRGB(rgbColor, 'BT601');   // For legacy SD equipment
	 * const hdSignal = YPbPr.FromRGB(rgbColor, 'BT709');   // For HD displays
	 * const uhdSignal = YPbPr.FromRGB(rgbColor, 'BT2020'); // For UHD displays
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Video format conversion pipeline	 * const convertToAnalogVideo = (rgbFrame: RGB[], targetStandard: TYpbPrStandards) => {
	 *   return rgbFrame.map(pixel => YPbPr.FromRGB(pixel, targetStandard));
	 * };
	 *
	 * const hdFrame = convertToAnalogVideo(rgbPixels, 'BT709');
	 * console.log(`Converted ${hdFrame.length} pixels to HD analog signals`);
	 * ```
	 *
	 * @example
	 * ```typescript
	 * // Component video equipment interface
	 * const generateTestPattern = (standard: TYpbPrStandards) => {
	 *   const testColors = [
	 *     new RGB(1, 1, 1), // White
	 *     new RGB(1, 1, 0), // Yellow
	 *     new RGB(0, 1, 1), // Cyan
	 *     new RGB(0, 1, 0), // Green
	 *     new RGB(1, 0, 1), // Magenta
	 *     new RGB(1, 0, 0), // Red	 *     new RGB(0, 0, 1), // Blue
	 *     new RGB(0, 0, 0)  // Black
	 *   ];
	 *
	 *   return testColors.map(rgb => YPbPr.FromRGB(rgb, standard));
	 * };
	 * ```
	 *
	 * @internal
	 */
	public static FromRGB(color: RGB, standard: TYpbPrStandards = 'BT2020'): YPbPr {
		RGB.Validate(color);

		let transformation: IMatrix3;

		switch (standard) {
			case 'BT601':
				transformation = [
					[0.299, 0.587, 0.114],
					[-0.168736, -0.331264, 0.5],
					[0.5, -0.418688, -0.081312],
				];
				break;
			case 'BT709':
				transformation = [
					[0.2126, 0.7152, 0.0722],
					[-0.114572, -0.385428, 0.5],
					[0.5, -0.454153, -0.045847],
				];
				break;
			case 'BT2020':
				transformation = [
					[0.2627, 0.6780, 0.0593],
					[-0.13963, -0.36037, 0.5],
					[0.5, -0.45978, -0.04022],
				];
				break;
			default:
				throw new Error(`Unrecognized YPbPr Standard(${standard})`);
		}

		const ypbpr = MatrixMultiply(transformation, color.ToArray());

		// Clamp values to valid ranges to handle floating-point rounding errors
		const y = Math.max(0, Math.min(1, ypbpr[0]));
		const pb = Math.max(-0.5, Math.min(0.5, ypbpr[1]));
		const pr = Math.max(-0.5, Math.min(0.5, ypbpr[2]));

		return new YPbPr(
			y,
			pb,
			pr,
			standard,
		);
	}
}
