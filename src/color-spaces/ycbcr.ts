/* eslint-disable no-magic-numbers */
import { IMatrix, TVector3, MatrixMultiply } from '@pawells/math-extended';
import { AssertNumber, AssertInstanceOf } from './assert.js';
import { ColorSpace } from './_color-space.js';
import { ColorSpaceManager } from './manager.js';
import { ColorError } from '../error.js';
import { RGB } from './rgb.js';

type TYCbCrComponentSelection = 'Y' | 'Cb' | 'Cr';/**
 * Type defining supported YCbCr transformation matrices for different standards.
 * Each standard defines specific coefficients for converting between RGB and YCbCr.
 *
 * @remarks
 * The two main standards are:
 * - 'BT601': ITU-R BT.601 standard, primarily used for SD (Standard Definition) video
 * - 'BT709': ITU-R BT.709 standard, used for HD (High Definition) video and modern digital video
 *
 * @see {@link https://www.itu.int/rec/R-REC-BT.601} for BT.601 specification
 * @see {@link https://www.itu.int/rec/R-REC-BT.709} for BT.709 specification
 */
type TStandards = 'BT601' | 'BT709';

/**
 * Represents a color in the YCbCr color space, the dominant color encoding system for digital video and image compression.
 *
 * @remarks
 * YCbCr is a color space family derived from YUV that separates luminance (brightness) from chrominance (color) information,
 * designed specifically for digital transmission and compression applications. The three components are:
 *
 * - **Y (Luma)**: Represents perceived brightness based on human visual sensitivity, range [0, 1]
 *   - Calculated using weighted RGB coefficients that match human luminance perception
 *   - 0 = black, 1 = maximum brightness (white)
 *   - Contains most of the perceptually important image information
 *
 * - **Cb (Blue-difference Chroma)**: Blue component minus luma, range [-0.5, 0.5]
 *   - Negative values indicate yellow bias, positive values indicate blue bias
 *   - Represents the B-Y color difference signal
 *
 * - **Cr (Red-difference Chroma)**: Red component minus luma, range [-0.5, 0.5]
 *   - Negative values indicate cyan bias, positive values indicate red bias
 *   - Represents the R-Y color difference signal
 *
 * **Key Technical Advantages:**
 * 1. **Perceptual Optimization**: Matches human visual system's higher sensitivity to brightness than color
 * 2. **Compression Efficiency**: Enables chroma subsampling (4:2:2, 4:2:0) to reduce data while preserving perceived quality
 * 3. **Broadcast Compatibility**: Maintains backward compatibility with black-and-white systems via Y channel
 * 4. **Processing Efficiency**: Separates operations on brightness vs. color for optimized algorithms
 *
 * **Digital TStandards Support:**
 * - **ITU-R BT.709**: High Definition Television (HDTV), sRGB displays, modern digital content
 * - **ITU-R BT.601**: Standard Definition Television (SDTV), legacy broadcast systems
 *
 * **Applications:**
 * - JPEG/JPEG 2000 image compression with chroma subsampling
 * - MPEG video codecs (H.264/AVC, H.265/HEVC, VP9, AV1)
 * - Digital television broadcasting (DVB, ATSC, ISDB)
 * - Video surveillance and streaming systems
 * - Medical imaging where brightness preservation is critical
 * - Color space conversion pipelines in digital cameras
 *
 * @example Basic Usage and Standard Comparison
 * ```typescript
 * // Create YCbCr color using BT.709 (HD standard, default)
 * const hdColor = new YCbCr(0.5, 0.1, -0.2);
 * console.log(`HD Color: Y=${hdColor.Y}, Cb=${hdColor.Cb}, Cr=${hdColor.Cr}`);
 *
 * // Create YCbCr color using BT.601 (SD standard)
 * const sdColor = new YCbCr(0.5, 0.1, -0.2, 'BT601');
 * console.log(`SD Color: Y=${sdColor.Y}, Cb=${sdColor.Cb}, Cr=${sdColor.Cr}`);
 *
 * // Convert from RGB to YCbCr for video processing
 * const rgbColor = new RGB(0.8, 0.4, 0.2);
 * const ycbcrHD = YCbCr.From(rgbColor, 'BT709'); // For HD content
 * const ycbcrSD = YCbCr.From(rgbColor, 'BT601'); // For SD content
 * ```
 *
 * @example Video Processing Workflow
 * ```typescript
 * // Process an array of RGB pixels for video compression
 * const rgbPixels = [new RGB(1, 0, 0), new RGB(0, 1, 0), new RGB(0, 0, 1)];
 *
 * // Convert to YCbCr for compression (BT.709 for HD)
 * const ycbcrPixels = rgbPixels.map(rgb => YCbCr.From(rgb, 'BT709'));
 *
 * // Simulate chroma subsampling by processing Y at full resolution
 * // while Cb/Cr can be processed at reduced resolution
 * ycbcrPixels.forEach((pixel, index) => {
 *   console.log(`Pixel ${index}: Luma=${pixel.Y.toFixed(3)}`);
 *   if (index % 2 === 0) { // Process chroma at half resolution
 *     console.log(`  Chroma: Cb=${pixel.Cb.toFixed(3)}, Cr=${pixel.Cr.toFixed(3)}`);
 *   }
 * });
 * ```
 *
 * @example Broadcast Standard Selection
 * ```typescript
 * // Function to select appropriate standard based on content resolution
 * function getYCbCrStandard(width: number, height: number): 'BT601' | 'BT709' {
 *   // HD resolution or higher uses BT.709
 *   return (width >= 1280 || height >= 720) ? 'BT709' : 'BT601';
 * }
 *
 * // Convert content based on resolution
 * const rgbColor = new RGB(0.7, 0.3, 0.5);
 * const hdVideo = YCbCr.From(rgbColor, getYCbCrStandard(1920, 1080)); // Uses BT.709
 * const sdVideo = YCbCr.From(rgbColor, getYCbCrStandard(720, 480));   // Uses BT.601
 * ```
 *
 * @see {@link https://www.itu.int/rec/R-REC-BT.709} ITU-R BT.709 Standard (HD)
 * @see {@link https://www.itu.int/rec/R-REC-BT.601} ITU-R BT.601 Standard (SD)
 * @see {@link https://en.wikipedia.org/wiki/YCbCr} YCbCr Color Space Overview
 * @see {@link https://en.wikipedia.org/wiki/Chroma_subsampling} Chroma Subsampling Techniques
 */
@ColorSpaceManager.Register({
	name: 'YCbCr',
	description: 'Represents a color in the YCbCr color space commonly used in digital video and image compression.',
	converters: [
		'RGB',
	],
})
export class YCbCr extends ColorSpace {	/**
	 * BT.601 transformation matrix coefficients for standard definition (SD) content.
	 *
	 * @remarks
	 * These coefficients are defined by ITU-R BT.601 standard (originally CCIR 601) and optimized for
	 * standard definition television broadcasting and legacy video systems. This standard was developed
	 * for interlaced analog television systems and 525/625-line broadcasting.
	 *
	 * **Technical Specifications:**
	 * - **Primary Colors**: Based on NTSC/PAL phosphor characteristics
	 * - **White Point**: D65 illuminant (6500K)
	 * - **Gamma**: 2.2 (with linear segment for low values)
	 * - **Resolution Target**: 720×480 (NTSC) / 720×576 (PAL)
	 *
	 * **Matrix Transformation Structure:**
	 * ```
	 * [[ Kr,     Kg,     Kb    ]]  ← Y (Luma) coefficients
	 * [[-Kr/2,  -Kg/2,   0.5  ]]  ← Cb (Blue-difference) coefficients
	 * [[ 0.5,   -Kg/2,  -Kb/2 ]]  ← Cr (Red-difference) coefficients
	 * ```
	 *
	 * **Coefficient Values:**
	 * - **Kr = 0.299**: Red luminance weight (human eye sensitivity to red)
	 * - **Kg = 0.587**: Green luminance weight (highest sensitivity - matches daylight vision)
	 * - **Kb = 0.114**: Blue luminance weight (lowest sensitivity - matches photopic vision)
	 * - Sum: Kr + Kg + Kb = 1.000 (ensures proper luminance preservation)
	 *
	 * **Mathematical Foundation:**
	 * The coefficients are derived from CIE color matching functions and optimized for the
	 * spectral characteristics of CRT phosphors used in SD television systems.
	 *
	 * @returns An IMatrix containing the BT.601 transformation coefficients
	 *
	 * @example Basic BT.601 Matrix Usage
	 * ```typescript
	 * // Access BT.601 coefficients
	 * const bt601Matrix = YCbCr.BT601;
	 * console.log('BT.601 Luma coefficients:', bt601Matrix[0]); // [0.299, 0.587, 0.114]
	 *
	 * // Use for SD video processing
	 * const sdColor = new YCbCr(0.5, 0.1, -0.2, 'BT601');
	 * ```
	 *
	 * @example Legacy Video Processing
	 * ```typescript
	 * // Process legacy SD content using BT.601
	 * const legacyRGB = new RGB(0.8, 0.6, 0.4); // Typical skin tone	 * const sdYCbCr = YCbCr.From(legacyRGB, 'BT601');
	 *
	 * // The Y component will emphasize green channel due to higher Kg coefficient
	 * console.log(`SD Luma: ${sdYCbCr.Y.toFixed(3)}`); // Weighted by BT.601 coefficients
	 * ```
	 *
	 * @see {@link https://www.itu.int/rec/R-REC-BT.601} ITU-R BT.601 Official Specification
	 * @see {@link BT709} For HD content coefficient comparison
	 */
	public static get BT601(): IMatrix {
		return [
			[0.299, 0.587, 0.114],
			[-0.168736, -0.331264, 0.5],
			[0.5, -0.418688, -0.081312],
		];
	}

	/**
	 * BT.709 transformation matrix coefficients for high definition (HD) content.
	 *
	 * @remarks
	 * These coefficients are defined by ITU-R BT.709 standard and optimized for
	 * high definition television broadcasting and modern digital display systems. This standard
	 * forms the foundation for sRGB color space and most contemporary digital imaging workflows.
	 *
	 * **Technical Specifications:**
	 * - **Primary Colors**: Based on modern LCD/OLED display phosphors with wider gamut
	 * - **White Point**: D65 illuminant (6500K) - same as BT.601 but with different primaries
	 * - **Gamma**: 2.4 (with hybrid transfer function similar to sRGB)
	 * - **Resolution Target**: 1280×720 (720p) and above, including 1920×1080 (1080p), 4K, 8K
	 *
	 * **Matrix Transformation Structure:**
	 * ```
	 * [[ Kr,     Kg,     Kb    ]]  ← Y (Luma) coefficients
	 * [[-Kr/2,  -Kg/2,   0.5  ]]  ← Cb (Blue-difference) coefficients
	 * [[ 0.5,   -Kg/2,  -Kb/2 ]]  ← Cr (Red-difference) coefficients
	 * ```
	 *
	 * **Coefficient Values:**
	 * - **Kr = 0.2126**: Red luminance weight (reduced from BT.601 due to modern display characteristics)
	 * - **Kg = 0.7152**: Green luminance weight (increased to match human photopic vision peak)
	 * - **Kb = 0.0722**: Blue luminance weight (reduced, accounting for blue's lower perceived brightness)
	 * - Sum: Kr + Kg + Kb = 1.000 (ensures proper luminance preservation)
	 *
	 * **Key Differences from BT.601:**
	 * - Higher green coefficient (0.7152 vs 0.587) for better perceptual accuracy
	 * - Lower red coefficient (0.2126 vs 0.299) matching modern display phosphors
	 * - Lower blue coefficient (0.0722 vs 0.114) for optimized wide-gamut displays
	 * - Results in different color appearance, especially for saturated colors
	 *
	 * **Modern Applications:**
	 * - HDTV broadcasting (720p, 1080i, 1080p)
	 * - Blu-ray disc encoding
	 * - Digital cinema (DCI-P3 derivations)
	 * - Computer displays (sRGB compatibility)
	 * - Streaming video services (Netflix, YouTube, etc.)
	 *
	 * @returns An IMatrix containing the BT.709 transformation coefficients
	 *
	 * @example Basic BT.709 Matrix Usage
	 * ```typescript
	 * // Access BT.709 coefficients (default standard)
	 * const bt709Matrix = YCbCr.BT709;
	 * console.log('BT.709 Luma coefficients:', bt709Matrix[0]); // [0.2126, 0.7152, 0.0722]
	 *
	 * // Create HD-optimized YCbCr color
	 * const hdColor = new YCbCr(0.5, 0.1, -0.2); // Uses BT.709 by default
	 * ```
	 *
	 * @example HD Video Processing
	 * ```typescript
	 * // Process HD content using BT.709
	 * const hdRGB = new RGB(0.8, 0.6, 0.4); // Same RGB values as BT.601 example	 * const hdYCbCr = YCbCr.From(hdRGB, 'BT709');
	 *
	 * // Compare luma calculation - BT.709 gives different result due to coefficient differences
	 * console.log(`HD Luma: ${hdYCbCr.Y.toFixed(3)}`); // Different from BT.601 result
	 *
	 * // Green contributes more to perceived brightness in BT.709
	 * const greenRGB = new RGB(0, 1, 0);
	 * const greenLuma = YCbCr.From(greenRGB, 'BT709').Y; // ≈ 0.7152
	 * ```
	 *
	 * @example Standard Comparison
	 * ```typescript
	 * // Compare BT.601 vs BT.709 for same RGB input
	 * const testRGB = new RGB(0.7, 0.5, 0.3);
	 * const bt601Result = YCbCr.From(testRGB, 'BT601');	 * const bt709Result = YCbCr.From(testRGB, 'BT709');
	 *
	 * console.log(`BT.601 Luma: ${bt601Result.Y.toFixed(4)}`);
	 * console.log(`BT.709 Luma: ${bt709Result.Y.toFixed(4)}`);
	 * // BT.709 typically produces slightly different luma due to green emphasis
	 * ```
	 *
	 * @see {@link https://www.itu.int/rec/R-REC-BT.709} ITU-R BT.709 Official Specification
	 * @see {@link BT601} For SD content coefficient comparison
	 * @see {@link https://en.wikipedia.org/wiki/Rec._709} BT.709 Technical Details
	 */
	public static get BT709(): IMatrix {
		return [
			[0.2126, 0.7152, 0.0722],
			[-0.114572, -0.385428, 0.5],
			[0.5, -0.454152, -0.045848],
		];
	}

	/** Internal array storing the YCbCr component values [Y, Cb, Cr] */
	protected override components: [number, number, number];

	/**
	 * Gets the Y (luma) component value.
	 *
	 * @remarks
	 * The Y component represents the **luma** (perceived brightness) of the color, calculated using
	 * weighted RGB coefficients that match human visual sensitivity. This is fundamentally different
	 * from simple luminance as it accounts for the non-linear response of human vision.
	 *
	 * **Technical Details:**
	 * - **Range**: [0, 1] where 0 = black, 1 = maximum brightness (white)
	 * - **Calculation**: Y = Kr×R + Kg×G + Kb×B (using standard-specific coefficients)
	 * - **Perceptual Basis**: Weighted to match photopic (daylight) vision characteristics
	 * - **Gamma Correction**: Applied during RGB→YCbCr conversion for display compatibility
	 *
	 * **Human Vision Optimization:**
	 * The coefficients are derived from CIE color matching functions and emphasize green
	 * (highest coefficient) since human eyes are most sensitive to green wavelengths (~555nm).
	 * This allows for efficient compression by preserving the most perceptually important
	 * information in the Y channel.
	 *
	 * **Broadcasting Compatibility:**
	 * The Y channel maintains compatibility with black-and-white television systems,
	 * allowing color broadcasts to be displayed on monochrome receivers using only the luma signal.
	 *
	 * @returns The Y (luma) component value in range [0, 1]
	 *
	 * @example Luma Analysis
	 * ```typescript
	 * // Pure colors demonstrate luma weighting
	 * const red = YCbCr.From(new RGB(1, 0, 0), 'BT709');
	 * const green = YCbCr.From(new RGB(0, 1, 0), 'BT709');
	 * const blue = YCbCr.From(new RGB(0, 0, 1), 'BT709');
	 *
	 * console.log(`Red luma: ${red.Y.toFixed(3)}`);    // ≈ 0.213 (Kr coefficient)
	 * console.log(`Green luma: ${green.Y.toFixed(3)}`);  // ≈ 0.715 (Kg coefficient)
	 * console.log(`Blue luma: ${blue.Y.toFixed(3)}`);   // ≈ 0.072 (Kb coefficient)
	 * // Green appears brightest, matching human perception
	 * ```
	 *
	 * @example Video Processing Application
	 * ```typescript
	 * // Use Y channel for brightness-based operations
	 * const ycbcr = new YCbCr(0.3, 0.1, -0.05);
	 *
	 * // Brightness adjustment affects only luma
	 * const brightened = new YCbCr(ycbcr.Y * 1.2, ycbcr.Cb, ycbcr.Cr);
	 *
	 * // Check if image is predominantly dark
	 * const isDark = ycbcr.Y < 0.3; // Common threshold for low-light detection
	 * ```
	 */
	public get Y(): number {
		return this.components[0];
	}

	/**
	 * Sets the Y (luma) component value with comprehensive validation.
	 *
	 * @param value - The Y (luma) value to set, must be in range [0, 1]
	 *
	 * @remarks
	 * Setting the Y component directly modifies the perceived brightness of the color
	 * while maintaining the original color characteristics (Cb/Cr components unchanged).
	 * This is commonly used for brightness adjustment operations in video processing.
	 *
	 * **Validation Rules:**
	 * - Must be a finite number (no NaN, ±Infinity)
	 * - Must be within range [0, 1] inclusive
	 * - Value 0 represents absolute black (no luminance)
	 * - Value 1 represents maximum white point luminance
	 *
	 * **Common Use Cases:**
	 * - Brightness/contrast adjustments in video processing
	 * - Gamma correction operations
	 * - HDR tone mapping
	 * - Automatic exposure correction
	 *
	 * @throws {ColorError} If value is outside the valid range [0, 1]
	 * @throws {ColorError} If value is not a finite number (NaN or ±Infinity)
	 *
	 * @example Brightness Adjustment
	 * ```typescript	 * const ycbcr = new YCbCr(0.5, 0.1, -0.2);
	 *
	 * // Increase brightness by 20%
	 * ycbcr.Y = Math.min(1.0, ycbcr.Y * 1.2);
	 *
	 * // Decrease brightness by 30%
	 * ycbcr.Y = Math.max(0.0, ycbcr.Y * 0.7);
	 * ```
	 *
	 * @example Gamma Correction
	 * ```typescript
	 * const ycbcr = new YCbCr(0.5, 0.1, -0.2);
	 * const gamma = 2.2;
	 *
	 * // Apply gamma correction to luma channel
	 * ycbcr.Y = Math.pow(ycbcr.Y, 1 / gamma);
	 * ```
	 */
	public set Y(value: number) {
		YCbCr._AssertComponent('Y', value);
		this.components[0] = value;
	}

	/**
	 * Gets the Cb (blue-difference chroma) component value.
	 *
	 * @remarks
	 * The Cb component represents the **blue-difference chroma**, encoding the difference between
	 * the blue component and the luma (brightness). This is one of two chroma channels that carry
	 * color information separately from brightness, enabling efficient compression techniques.
	 *
	 * **Technical Details:**
	 * - **Range**: [-0.5, 0.5] where 0 represents no color bias
	 * - **Calculation**: Cb = 0.5 × (B - Y) where B is blue and Y is luma
	 * - **Color Interpretation**:
	 *   - Negative values (-0.5 to 0): Shift toward yellow/amber tones
	 *   - Zero (0): Neutral, no blue/yellow bias
	 *   - Positive values (0 to 0.5): Shift toward blue/cyan tones
	 *
	 * **Compression Advantages:**
	 * - **Chroma Subsampling**: Can be sampled at lower resolution than Y channel
	 * - **Bandwidth Efficiency**: Human vision is less sensitive to color detail than brightness
	 * - **4:2:2 Subsampling**: Cb/Cr at half horizontal resolution
	 * - **4:2:0 Subsampling**: Cb/Cr at quarter resolution (half both dimensions)
	 *
	 * **Signal Processing Applications:**
	 * - Blue screen/green screen keying (chroma key effects)
	 * - Skin tone detection (Cb values typically negative for skin)
	 * - Color temperature adjustment
	 * - Automatic white balance in cameras
	 *
	 * @returns The Cb (blue-difference chroma) component value in range [-0.5, 0.5]
	 *
	 * @example Chroma Analysis
	 * ```typescript
	 * // Analyze chroma characteristics of different colors
	 * const yellow = YCbCr.From(new RGB(1, 1, 0), 'BT709'); // Pure yellow
	 * const blue = YCbCr.From(new RGB(0, 0, 1), 'BT709');   // Pure blue
	 * const neutral = YCbCr.From(new RGB(0.5, 0.5, 0.5), 'BT709'); // Gray
	 *
	 * console.log(`Yellow Cb: ${yellow.Cb.toFixed(3)}`);  // Negative (yellow bias)
	 * console.log(`Blue Cb: ${blue.Cb.toFixed(3)}`);      // Positive (blue bias)
	 * console.log(`Neutral Cb: ${neutral.Cb.toFixed(3)}`); // Near zero
	 * ```
	 *
	 * @example Skin Tone Detection
	 * ```typescript
	 * // Typical skin tone ranges for different ethnicities	 * const skinColor = YCbCr.From(new RGB(0.8, 0.6, 0.4), 'BT709');
	 *
	 * // Skin tones typically have negative Cb values (yellow bias)
	 * const isSkinTone = skinColor.Cb >= -0.2 && skinColor.Cb <= 0.05 &&
	 *                    skinColor.Cr >= 0.05 && skinColor.Cr <= 0.3;
	 *
	 * console.log(`Skin tone detected: ${isSkinTone}`);
	 * console.log(`Cb value: ${skinColor.Cb.toFixed(3)}`); // Expected: negative
	 * ```
	 *
	 * @example Chroma Key (Blue Screen) Detection
	 * ```typescript
	 * // Detect blue screen background for removal
	 * const blueScreen = YCbCr.From(new RGB(0, 0, 1), 'BT709');
	 * const greenScreen = YCbCr.From(new RGB(0, 1, 0), 'BT709');
	 *
	 * // Blue screen has strong positive Cb, green screen has negative Cb
	 * const isBlueScreen = blueScreen.Cb > 0.3;  // Strong blue bias
	 * const isGreenScreen = greenScreen.Cb < -0.2; // Strong yellow bias
	 * ```
	 */
	public get Cb(): number {
		return this.components[1];
	}

	/**
	 * Sets the Cb (blue-difference chroma) component value with comprehensive validation.
	 *
	 * @param value - The Cb (blue-difference chroma) value to set, must be in range [-0.5, 0.5]
	 *
	 * @remarks
	 * Setting the Cb component modifies the blue/yellow color bias while preserving brightness (Y)
	 * and red/cyan bias (Cr). This is commonly used for color temperature adjustments and
	 * artistic color grading in video processing.
	 *
	 * **Validation Rules:**
	 * - Must be a finite number (no NaN, ±Infinity)
	 * - Must be within range [-0.5, 0.5] inclusive
	 * - Negative values create yellow/amber bias
	 * - Positive values create blue/cyan bias
	 *
	 * @throws {ColorError} If value is outside the valid range [-0.5, 0.5]
	 * @throws {ColorError} If value is not a finite number
	 *
	 * @example Color Temperature Adjustment
	 * ```typescript	 * const ycbcr = new YCbCr(0.5, 0, 0);
	 *
	 * // Make image warmer (more yellow)
	 * ycbcr.Cb = -0.1;
	 *
	 * // Make image cooler (more blue)
	 * ycbcr.Cb = 0.1;
	 * ```
	 */
	public set Cb(value: number) {
		YCbCr._AssertComponent('Cb', value);
		this.components[1] = value;
	}

	/**
	 * Gets the Cr (red-difference chroma) component value.
	 *
	 * @remarks
	 * The Cr component represents the **red-difference chroma**, encoding the difference between
	 * the red component and the luma (brightness). Together with Cb, it forms the complete chroma
	 * information that defines the color characteristics separate from brightness.
	 *
	 * **Technical Details:**
	 * - **Range**: [-0.5, 0.5] where 0 represents no color bias
	 * - **Calculation**: Cr = 0.5 × (R - Y) where R is red and Y is luma
	 * - **Color Interpretation**:
	 *   - Negative values (-0.5 to 0): Shift toward cyan/green tones
	 *   - Zero (0): Neutral, no red/cyan bias
	 *   - Positive values (0 to 0.5): Shift toward red/magenta tones
	 *
	 * **Applications in Video Processing:**
	 * - Skin tone enhancement and correction
	 * - Color grading for cinematic effects
	 * - Green screen keying (Cr values help distinguish green backgrounds)
	 * - Red-eye removal algorithms
	 * - Automatic color balance systems
	 *
	 * @returns The Cr (red-difference chroma) component value in range [-0.5, 0.5]
	 *
	 * @example Skin Tone Analysis
	 * ```typescript
	 * // Skin tones typically have positive Cr values (red bias)
	 * const skinTone = YCbCr.From(new RGB(0.9, 0.7, 0.5), 'BT709');	 * console.log(`Skin Cr: ${skinTone.Cr.toFixed(3)}`); // Positive value expected
	 *
	 * // Detect skin-like colors
	 * const isSkinLike = skinTone.Cr > 0.05 && skinTone.Cr < 0.3;
	 * ```
	 */
	public get Cr(): number {
		return this.components[2];
	}

	/**
	 * Sets the Cr (red-difference chroma) component value with comprehensive validation.
	 *
	 * @param value - The Cr (red-difference chroma) value to set, must be in range [-0.5, 0.5]
	 *
	 * @remarks
	 * Setting the Cr component modifies the red/cyan color bias while preserving brightness (Y)
	 * and blue/yellow bias (Cb). This is essential for skin tone corrections, color grading,
	 * and artistic effects in video and image processing.
	 *
	 * @throws {ColorError} If value is outside the valid range [-0.5, 0.5]
	 * @throws {ColorError} If value is not a finite number
	 *
	 * @example Skin Tone Enhancement
	 * ```typescript	 * const ycbcr = new YCbCr(0.6, -0.1, 0.1);
	 *
	 * // Enhance skin tones by increasing red component
	 * ycbcr.Cr = Math.min(0.5, ycbcr.Cr * 1.1);
	 * ```
	 */
	public set Cr(value: number) {
		YCbCr._AssertComponent('Cr', value);
		this.components[2] = value;
	}

	/**
	 * The YCbCr standard used for color space transformations.
	 * This determines which coefficient matrix is used for RGB conversions.
	 */
	public readonly Standard: TStandards;

	/**
	 * Creates a new YCbCr color instance with optional standard specification.
	 *
	 * @param y - Y (luma) component, range [0, 1], default: 0 (black)
	 * @param cb - Cb (blue-difference chroma) component, range [-0.5, 0.5], default: 0 (neutral)
	 * @param cr - Cr (red-difference chroma) component, range [-0.5, 0.5], default: 0 (neutral)
	 * @param standard - The YCbCr standard to use for transformations:
	 *   - 'BT709': ITU-R BT.709 for HD content (1280×720+) - **Default**
	 *   - 'BT601': ITU-R BT.601 for SD content (720×480/576)
	 *
	 * @remarks
	 * The constructor creates a YCbCr color with full validation of all components and automatic
	 * standard assignment for consistent color space transformations. The standard selection affects
	 * how the color appears when converted to/from other color spaces, particularly RGB.
	 *
	 * **Default Behavior:**
	 * - Creates black color (0, 0, 0) if no parameters provided
	 * - Uses BT.709 standard by default (appropriate for modern HD content)
	 * - Validates all components and throws descriptive errors for invalid values
	 *
	 * **Standard Selection Guidelines:**
	 * - Use **BT.709** for: HD video (720p+), computer displays, modern content, sRGB workflows
	 * - Use **BT.601** for: SD video (480p/576p), legacy content, broadcast compatibility
	 *
	 * @throws {ColorError} If any component values are outside their valid ranges:
	 *   - Y must be in [0, 1]
	 *   - Cb must be in [-0.5, 0.5]
	 *   - Cr must be in [-0.5, 0.5]
	 * @throws {ColorError} If any component is not a finite number (NaN, ±Infinity)
	 *
	 * @example Basic Color Creation
	 * ```typescript
	 * // Create black color (default)
	 * const black = new YCbCr();	 *
	 * // Create neutral gray color
	 * const gray = new YCbCr(0.5, 0, 0);
	 *
	 * // Create white color
	 * const white = new YCbCr(1, 0, 0);
	 * ```
	 *
	 * @example Standard-Specific Creation
	 * ```typescript
	 * // HD content using BT.709 (default)
	 * const hdColor = new YCbCr(0.7, 0.1, -0.2, 'BT709');
	 *
	 * // SD content using BT.601
	 * const sdColor = new YCbCr(0.7, 0.1, -0.2, 'BT601');
	 *
	 * // Same YCbCr values but different standards for different content types
	 * console.log(`HD Standard: ${hdColor.Standard}`); // 'BT709'
	 * console.log(`SD Standard: ${sdColor.Standard}`); // 'BT601'
	 * ```
	 *
	 * @example Video Processing Workflow
	 * ```typescript
	 * // Create colors for different video processing scenarios
	 * const skinTone = new YCbCr(0.65, -0.1, 0.15, 'BT709'); // Typical skin tone
	 * const blueScreen = new YCbCr(0.3, 0.4, -0.2, 'BT709');  // Blue screen background
	 * const sunset = new YCbCr(0.8, -0.2, 0.3, 'BT709');      // Warm sunset colors
	 *
	 * // Process video frames with appropriate standard
	 * function processVideoFrame(width: number, height: number) {
	 *   const standard = (width >= 1280 || height >= 720) ? 'BT709' : 'BT601';
	 *   return new YCbCr(0.5, 0, 0, standard);
	 * }
	 * ```
	 */
	constructor(y: number = 0, cb: number = 0, cr: number = 0, standard: TStandards = 'BT709') {
		super();
		this.components = [0, 0, 0]; // Initialize to defaults
		this.Standard = standard;
		this.Y = y; // Use setters for validation
		this.Cb = cb;
		this.Cr = cr;
	}

	/**
	 * Creates a deep copy of the current YCbCr color instance.
	 *
	 * @remarks
	 * This method returns a new YCbCr object with the same Y, Cb, Cr component values
	 * and the same standard as the original. Modifications to the cloned instance
	 * do not affect the original object.
	 *
	 * @returns {YCbCr} A new YCbCr instance with identical component values and standard.
	 *
	 * @example
	 * ```typescript
	 * const original = new YCbCr(0.5, 0.1, -0.2, 'BT709');
	 * const copy = original.Clone();
	 * console.log(copy.ToString()); // "YCbCr(0.5, 0.1, -0.2)"
	 * console.log(copy.Standard);   // "BT709"
	 * ```
	 */
	public override Clone(): this {
		return new YCbCr(this.Y, this.Cb, this.Cr, this.Standard) as this;
	}

	/**
	 * Returns a string representation of the YCbCr color with component values.
	 *
	 * @remarks
	 * Generates a human-readable string representation showing all three YCbCr components
	 * in a standardized format. This is particularly useful for debugging video processing
	 * pipelines, logging color transformations, and displaying color information in development tools.
	 *
	 * **Format Specification:**
	 * - Format: "YCbCr(Y, Cb, Cr)"
	 * - Components are displayed with their actual numeric values
	 * - Maintains full precision of the underlying numeric values
	 * - Standard information is not included in the string (use .Standard property separately)
	 *
	 * @returns A string in the format "YCbCr(Y, Cb, Cr)" with actual component values
	 *
	 * @example Basic String Representation
	 * ```typescript
	 * const ycbcr = new YCbCr(0.5, 0.1, -0.2);	 * console.log(ycbcr.ToString()); // "YCbCr(0.5, 0.1, -0.2)"
	 *
	 * // With specific standard
	 * const sdColor = new YCbCr(0.7, 0.05, 0.15, 'BT601');
	 * console.log(`${sdColor.ToString()} [${sdColor.Standard}]`); // "YCbCr(0.7, 0.05, 0.15) [BT601]"
	 * ```
	 *
	 * @example Video Processing Debug Output
	 * ```typescript
	 * // Debug color pipeline in video processing
	 * const inputRGB = new RGB(0.8, 0.6, 0.4);
	 * const ycbcrHD = YCbCr.From(inputRGB, 'BT709');
	 * const ycbcrSD = YCbCr.From(inputRGB, 'BT601');
	 *
	 * console.log(`Input RGB: ${inputRGB.ToString()}`);
	 * console.log(`HD YCbCr: ${ycbcrHD.ToString()}`);
	 * console.log(`SD YCbCr: ${ycbcrSD.ToString()}`);
	 * // Compare color space differences in conversion pipeline
	 * ```
	 */
	public override ToString(): string {
		return `YCbCr(${this.components.join(', ')})`;
	}

	/**
	 * Type guard assertion function that validates and asserts a value as a YCbCr instance.
	 *
	 * @param color - The value to validate and assert as a YCbCr instance
	 *
	 * @remarks
	 * This static method performs comprehensive validation to ensure the provided value is:
	 * 1. An instance of the YCbCr class
	 * 2. Contains valid Y, Cb, and Cr component values within their respective ranges
	 * 3. Has finite numeric values (no NaN or ±Infinity)
	 *
	 * **Validation Performed:**
	 * - **Type Check**: Confirms the value is an instance of YCbCr class
	 * - **Y Component**: Must be finite number in range [0, 1]	 * - **Cb Component**: Must be finite number in range [-0.5, 0.5]
	 * - **Cr Component**: Must be finite number in range [-0.5, 0.5]
	 *
	 * **TypeScript Benefits:**
	 * After calling this method successfully, TypeScript will treat the parameter as a confirmed
	 * YCbCr instance, enabling safe access to all YCbCr properties and methods without additional
	 * type checking.
	 *
	 * @throws {ColorError} When the value is not an instance of YCbCr with message "Not a YCbCr Color"
	 * @throws {ColorError} When Y component is invalid with message "Invalid Channel(Y)"
	 * @throws {ColorError} When Cb component is invalid with message "Invalid Channel(Cb)"
	 * @throws {ColorError} When Cr component is invalid with message "Invalid Channel(Cr)"
	 *
	 * @example Type Guard Usage
	 * ```typescript
	 * function processColor(unknownColor: unknown) {	 *   YCbCr.Assert(unknownColor); // Throws if not valid YCbCr
	 *
	 *   // TypeScript now knows unknownColor is YCbCr
	 *   console.log(`Luma: ${unknownColor.Y}`);
	 *   console.log(`Blue-diff: ${unknownColor.Cb}`);
	 *   console.log(`Red-diff: ${unknownColor.Cr}`);
	 *   console.log(`Standard: ${unknownColor.Standard}`);
	 * }
	 * ```
	 *
	 * @example Validation in Video Processing Pipeline
	 * ```typescript
	 * function validateVideoColors(colors: unknown[]): YCbCr[] {	 *   const validColors: YCbCr[] = [];
	 *
	 *   for (const color of colors) {
	 *     try {
	 *       YCbCr.Assert(color);
	 *       validColors.push(color); // TypeScript knows color is YCbCr
	 *     } catch (error) {
	 *       console.warn(`Invalid YCbCr color skipped: ${error.message}`);
	 *     }	 *   }
	 *
	 *   return validColors;
	 * }
	 * ```
	 *
	 * @example Error Handling
	 * ```typescript
	 * const invalidValues = [null, "not a color", { Y: 2, Cb: 0, Cr: 0 }];
	 *
	 * invalidValues.forEach((value, index) => {
	 *   try {
	 *     YCbCr.Assert(value);
	 *   } catch (error) {
	 *     console.log(`Value ${index}: ${error.message}`);
	 *     // "Not a YCbCr Color" or "Invalid Channel(Y)" etc.
	 *   }
	 * });
	 * ```
	 */
	public static override Assert(color: unknown): asserts color is YCbCr {
		AssertInstanceOf(color, YCbCr, { class: ColorError, message: 'Not a YCbCr Color' });
		YCbCr._AssertComponent('Y', color.Y);
		YCbCr._AssertComponent('Cb', color.Cb);
		YCbCr._AssertComponent('Cr', color.Cr);
	}

	/**
	 * Validates a single YCbCr component value by name.
	 * @param component - The component name ('Y', 'Cb', or 'Cr')
	 * @param colorOrValue - The value to validate
	 * @throws {ColorError} If the value is out of range or not a number
	 */
	private static _AssertComponent(component: TYCbCrComponentSelection, color: YCbCr): void;
	private static _AssertComponent(component: TYCbCrComponentSelection, value: number): void;
	private static _AssertComponent(component: TYCbCrComponentSelection, colorOrValue: YCbCr | number): void {
		switch (component) {
			case 'Y': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.Y;
				AssertNumber(value, { gte: 0, lte: 1, finite: true }, { class: ColorError, message: 'Channel(Y) must be in range [0, 1].' });
				break;
			}
			case 'Cb': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.Cb;
				AssertNumber(value, { gte: -0.5, lte: 0.5, finite: true }, { class: ColorError, message: 'Channel(Cb) must be in range [-0.5, 0.5].' });
				break;
			}
			case 'Cr': {
				const value = typeof colorOrValue === 'number' ? colorOrValue : colorOrValue.Cr;
				AssertNumber(value, { gte: -0.5, lte: 0.5, finite: true }, { class: ColorError, message: 'Channel(Cr) must be in range [-0.5, 0.5].' });
				break;
			}
			default:
				throw new ColorError(`Unknown YCbCr component: ${component}`);
		}
	}

	/**
	 * Converts a color from RGB to YCbCr.
	 * This is an alias for FromRGB with BT.709 standard.
	 *
	 * @param color - The RGB color to convert
	 * @returns {YCbCr} A new YCbCr color instance
	 */
	public static From(color: RGB): YCbCr {
		return YCbCr.FromRGB(color);
	}

	/**
	 * Converts an RGB color to YCbCr using the specified broadcast standard.
	 *
	 * @param color - The RGB color to convert
	 * @param standard - The broadcast standard to use ('BT601' for SD, 'BT709' for HD)
	 * @returns {YCbCr} A new YCbCr color instance
	 *
	 * @example
	 * ```typescript
	 * const rgb = new RGB(1, 0, 0); // Pure red
	 * const ycbcr709 = YCbCr.FromRGB(rgb); // Uses BT.709 by default
	 * const ycbcr601 = YCbCr.FromRGB(rgb, 'BT601'); // Uses BT.601
	 * ```
	 */
	public static FromRGB(color: RGB, standard: 'BT601' | 'BT709' = 'BT709'): YCbCr {
		RGB.Assert(color);

		const matrix = standard === 'BT601' ? YCbCr.BT601 : YCbCr.BT709;

		// Perform gamma correction to linear RGB
		const linearRGB: TVector3 = [
			color.R <= 0.04045 ? color.R / 12.92 : Math.pow((color.R + 0.055) / 1.055, 2.4),
			color.G <= 0.04045 ? color.G / 12.92 : Math.pow((color.G + 0.055) / 1.055, 2.4),
			color.B <= 0.04045 ? color.B / 12.92 : Math.pow((color.B + 0.055) / 1.055, 2.4),
		];
		const ycbcr = MatrixMultiply(matrix, linearRGB);

		if (!ycbcr || ycbcr.length < 3) {
			throw new ColorError('Matrix multiplication failed during YCbCr conversion');
		}

		// Clamp values to valid ranges to handle floating-point rounding errors
		const y = Math.max(0, Math.min(1, ycbcr[0]));
		const cb = Math.max(-0.5, Math.min(0.5, ycbcr[1]));
		const cr = Math.max(-0.5, Math.min(0.5, ycbcr[2]));

		return new YCbCr(y, cb, cr, standard);
	}
}
