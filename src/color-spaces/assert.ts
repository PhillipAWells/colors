import { ColorError } from '../error.js';

/**
 * Type representing a constructor function for a class of type T.
 */
export type TConstructorFunction<T> = { new (...args: any[]): T };

/**
 * Asserts that a value is an instance of a specific class.
 * @throws Error if the assertion fails
 */
export function AssertInstanceOf(
	value: unknown,
	constructor: { new (...args: any[]): any },
	options?: { class?: new (message?: string) => Error; message?: string },
): asserts value is any {
	if (!(value instanceof constructor)) {
		const ErrorClass = options?.class ?? Error;
		throw new ErrorClass(options?.message ?? `Expected instance of ${constructor.name}`);
	}
}

/**
 * Validates that a number meets specified constraints.
 * @throws ColorError if the validation fails
 */
export function AssertNumber(
	value: unknown,
	constraints: { gte?: number; lte?: number; gt?: number; lt?: number; finite?: boolean },
	options?: { class?: new (message?: string) => Error; message?: string },
): asserts value is number {
	const ErrorClass = options?.class ?? ColorError;
	const message = options?.message ?? 'Invalid number';

	if (typeof value !== 'number') {
		throw new ErrorClass(message);
	}

	// Check if value is finite (handles NaN, Infinity, -Infinity)
	if (!Number.isFinite(value)) {
		throw new ErrorClass(message);
	}

	if (constraints.finite && !isFinite(value)) {
		throw new ErrorClass(message);
	}

	if (constraints.gte !== undefined && value < constraints.gte) {
		throw new ErrorClass(message);
	}

	if (constraints.lte !== undefined && value > constraints.lte) {
		throw new ErrorClass(message);
	}

	if (constraints.gt !== undefined && value <= constraints.gt) {
		throw new ErrorClass(message);
	}

	if (constraints.lt !== undefined && value >= constraints.lt) {
		throw new ErrorClass(message);
	}
}
