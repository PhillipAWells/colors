/**
 * Custom error class for color-related operations and validations.
 *
 * ColorError extends the standard Error class to provide specific error handling
 * for color operations, validations, and conversions within the color library.
 * This allows for more precise error handling and better debugging experiences.
 *
 * @example
 * ```typescript
 * try {
 *   const color = new RGB(-1, 0, 0); // Invalid negative value
 * } catch (error) {
 *   if (error instanceof ColorError) {
 *     console.error('Color validation failed:', error.message);
 *   }
 * }
 * ```
 */
export class ColorError extends Error {
	/**
	 * Creates a new ColorError instance.
	 *
	 * @param message - Optional error message describing the color operation failure
	 *
	 * @example
	 * ```typescript
	 * throw new ColorError('Invalid RGB component value');
	 * throw new ColorError('Color conversion failed');
	 * ```
	 */
	constructor(message?: string) {
		super(message);
		this.name = 'ColorError';
		// Maintains proper prototype chain for instanceof checks
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
