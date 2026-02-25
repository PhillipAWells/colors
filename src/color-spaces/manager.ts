import { TConstructorFunction } from './assert.js';
import 'reflect-metadata';
import { ColorSpace } from './_color-space.js';
import { ColorError } from '../error.js';

/**
 * Metadata interface for color space registration.
 * Contains information needed to register and manage a color space in the system.
 *
 * @interface IIColorSpaceMetadata
 * @example
 * ```typescript
 * const metadata: IColorSpaceMetadata = {
 *   name: 'RGB',
 *   description: 'Red, Green, Blue color space',
 *   ctor: RGB,
 *   converters: ['HSL', 'HSV', 'XYZ']
 * };
 * ```
 */
export interface IColorSpaceMetadata {
	/** Unique name identifier for the color space */
	name: string;
	/** Human-readable description of the color space */
	description: string;
	/** Constructor function for creating instances of this color space */

	Ctor: TConstructorFunction<ColorSpace>;
	/** Array of color space names this color space can convert to directly */
	converters: string[];
}
/**
 * Type for color space registration arguments.
 * name is required, other properties are optional and will be inferred or defaulted.
 */
type TRegisterArgs = Pick<IColorSpaceMetadata, 'name'> & Pick<Partial<IColorSpaceMetadata>, 'description' | 'Ctor' | 'converters' >;

/**
 * Central management system for color space registration, conversion, and metadata.
 *
 * The ColorSpaceManager provides a centralized registry for all color spaces in the system,
 * handles automatic conversion paths between color spaces using graph traversal algorithms,
 * and manages metadata for each registered color space.
 *
 * Key features:
 * - Automatic color space registration via decorators
 * - Intelligent conversion path finding using breadth-first search
 * - Multi-step conversion support (e.g., RGB → XYZ → Lab)
 * - Metadata management and retrieval
 * - Type-safe conversions with full TypeScript support
 *
 * @example
 * ```typescript
 * // Register a new color space
 * @ColorSpaceManager.Register({
 *   name: 'MyColorSpace',
 *   description: 'Custom color space',
 *   converters: ['RGB', 'XYZ']
 * })
 * class MyColorSpace extends ColorSpace {
 *   // Implementation...
 * }
 *
 * // Convert between color spaces
 * const rgb = new RGB(1, 0, 0);
 * const xyz = ColorSpaceManager.Convert(rgb, XYZ);
 * const lab = ColorSpaceManager.Convert(xyz, Lab);
 *
 * // Get metadata
 * const metadata = ColorSpaceManager.GetMetadata(RGB);
 * console.log(metadata.Name); // "RGB"
 * ```
 */
export class ColorSpaceManager {
	/**
	 * Converts a color from one color space to another.
	 *
	 * This method automatically finds the optimal conversion path between color spaces
	 * using a breadth-first search algorithm. It supports both direct conversions
	 * (when a direct converter exists) and multi-step conversions through intermediate
	 * color spaces.
	 *
	 * @template TInput - The input color space type
	 * @template TOutput - The output color space type
	 * @param input - The color instance to convert
	 * @param colorSpace - The constructor of the target color space
	 * @returns A new instance of the target color space
	 *
	 * @throws {Error} When no conversion path exists between the color spaces
	 * @throws {Error} When a required color space is not found in the registry
	 * @throws {Error} When a direct converter is missing for a required step
	 *
	 * @example
	 * ```typescript
	 * // Direct conversion
	 * const rgb = new RGB(1, 0, 0);
	 * const hsl = ColorSpaceManager.Convert(rgb, HSL);
	 *
	 * // Multi-step conversion (RGB → XYZ → Lab)
	 * const lab = ColorSpaceManager.Convert(rgb, Lab);
	 *
	 * // Same-type conversion (creates new instance)
	 * const rgbCopy = ColorSpaceManager.Convert(rgb, RGB);
	 * ```
	 *
	 * @remarks
	 * - The algorithm uses breadth-first search to find the shortest conversion path
	 * - Direct conversions are preferred when available
	 * - Multi-step conversions are automatically handled
	 * - Converting to the same type creates a new instance with identical values
	 * - All conversions preserve color accuracy within floating-point precision
	 */
	public static Convert<TInput extends ColorSpace, TOutput extends ColorSpace>(input: TInput, colorSpace: TConstructorFunction<TOutput>): TOutput {
		// If we're converting to the same type, just create a new instance
		if (input.constructor === colorSpace) {
			return new colorSpace(...input.ToArray()) as TOutput;
		}

		// Build a conversion graph
		const graph = new Map<string, string[]>();

		// Initialize the graph with all color spaces and their direct converters
		for (const [name, metadata] of this._ColorSpaces.entries()) {
			graph.set(name, [...metadata.converters]);
		}

		// Find the shortest path from input to output using BFS
		// Use GetMetadata to get decorator-defined names (minification-safe)
		const inputMetadata = this.GetMetadata(input.constructor as TConstructorFunction<ColorSpace>);
		const outputMetadata = this.GetMetadata(colorSpace);
		const startNode = inputMetadata.name;
		const endNode = outputMetadata.name;

		// Check cache for existing path
		const cacheKey = this._GetPathCacheKey(inputMetadata.name, outputMetadata.name);
		const cachedPath = this._PathCache.get(cacheKey);

		let conversionPath: string[];

		if (cachedPath) {
			// Use cached path
			conversionPath = cachedPath;
		} else {
			// Perform BFS to find path
			interface IGraphNode {
				node: string;
				path: string[]
			}

			const visited = new Set<string>();
			const queue: Array<IGraphNode> = [];
			queue.push({ node: startNode, path: [startNode] });
			visited.add(startNode);

			let foundPath: string[] | undefined;

			while (queue.length > 0) {
				const entry = queue.shift();
				if (entry === undefined) break;

				if (entry.node === endNode) {
					foundPath = entry.path;
					break;
				}

				// Get neighbors
				const neighbors = graph.get(entry.node) ?? [];

				for (const neighbor of neighbors) {
					if (!visited.has(neighbor)) {
						visited.add(neighbor);
						queue.push({
							node: neighbor,
							path: [...entry.path, neighbor],
						});
					}
				}
			}

			// If no path was found, throw error
			if (!foundPath) {
				throw new ColorError(`No conversion path exists from '${input.constructor.name}' to '${colorSpace.name}'.`);
			}

			// Store path in cache
			this._PathCache.set(cacheKey, foundPath);
			conversionPath = foundPath;
		}

		// Execute conversions using the path
		let currentValue: ColorSpace = input;

		// Start from index 1 to skip the starting node
		for (let i = 1; i < conversionPath.length; i++) {
			const targetType = Array.from(this._ColorSpaces.values())
				.find((meta) => meta.name === conversionPath[i])?.Ctor;

			if (!targetType) {
				throw new ColorError(`Color space '${conversionPath[i]}' not found in registry.`);
			}

			// Get direct converters for the current color space
			const currentMetadata = this.GetMetadata(currentValue.constructor as TConstructorFunction<ColorSpace>);

			const targetName = conversionPath[i];
			if (typeof targetName !== 'string' || !currentMetadata.converters.includes(targetName)) {
				throw new ColorError(`No direct converter from '${currentMetadata.name}' to '${targetName}'.`);
			}

			// Execute the conversion
			// Use the static From method to handle the conversion
			// eslint-disable-next-line @typescript-eslint/naming-convention
			const staticFromFn = (targetType as unknown as { From?: (input: ColorSpace) => ColorSpace }).From;
			if (typeof staticFromFn === 'function') {
				currentValue = staticFromFn(currentValue);
			} else {
				currentValue = new targetType(...currentValue.ToArray());
			}
		}

		return currentValue as TOutput;
	}

	// ============================================================================================
	// Decorator
	// ============================================================================================
	private static readonly _MetadataKey = 'COLOR-SPACE';

	private static readonly _ColorSpaces: Map<string, IColorSpaceMetadata> = new Map();

	/**
	 * Cache for color space conversion paths.
	 * Stores previously computed BFS paths to avoid redundant graph traversals.
	 * Key format: `${inputColorSpaceName}-${outputColorSpaceName}`
	 * Value: Array of color space names representing the conversion path
	 *
	 * @remarks
	 * Since the color space graph is static (converters don't change at runtime),
	 * this cache never needs eviction and provides O(1) path lookups for repeated conversions.
	 */
	private static readonly _PathCache: Map<string, string[]> = new Map();

	/**
	 * Clears the conversion path cache.
	 * This method is intended for testing purposes only.
	 * @internal
	 */
	public static ClearCache(): void {
		this._PathCache.clear();
	}

	/**
	 * Decorator for registering a color space with the manager.
	 *
	 * This decorator automatically registers a color space class with the ColorSpaceManager,
	 * storing its metadata and making it available for conversions. The decorator should be
	 * applied to classes that extend ColorSpace.
	 *
	 * @param args - Registration arguments containing color space metadata
	 * @returns A class decorator function
	 *
	 * @throws {Error} When a color space with the same name is already registered
	 *
	 * @example
	 * ```typescript
	 * @ColorSpaceManager.Register({
	 *   Name: 'RGB',
	 *   Description: 'Red, Green, Blue color space',
	 *   Converters: ['HSL', 'HSV', 'XYZ']
	 * })
	 * class RGB extends ColorSpace {
	 *   // Implementation...
	 * }
	 * ```
	 */
	public static Register(args: TRegisterArgs): ClassDecorator {
		return (target: Function) => {
			// Check for Class Members that can be undefined.
			const metadata: IColorSpaceMetadata = {
				name: args.name || target.name,
				description: args.description ?? '',

				Ctor: target as TConstructorFunction<ColorSpace>,
				converters: args.converters ?? [],
			};
			Reflect.defineMetadata(this._MetadataKey, metadata, target);
			if (this._ColorSpaces.has(metadata.name)) throw new ColorError(`Color Space(${metadata.name}) Already Registered`);
			this._ColorSpaces.set(metadata.name, metadata);
		};
	}

	/**
	 * Unregisters a color space from the manager.
	 *
	 * Removes a color space from the registry, making it unavailable for future conversions.
	 * This also cleans up the associated metadata from the reflection system.
	 *
	 * @param type - The constructor of the color space to unregister
	 * @throws {Error} When the color space is not currently registered
	 *
	 * @example
	 * ```typescript
	 * ColorSpaceManager.Unregister(MyCustomColorSpace);
	 * ```
	 */
	public static Unregister(type: TConstructorFunction<ColorSpace>): void {
		const metadata = this.GetMetadata(type);
		if (!this._ColorSpaces.delete(metadata.name)) {
			throw new ColorError(`Color Space(${metadata.name}) not registered`);
		}
		Reflect.deleteMetadata(this._MetadataKey, type);
	}

	/**
	 * Retrieves metadata for a registered color space.
	 *
	 * Returns the metadata associated with a color space class, including its name,
	 * description, constructor, and available converters.
	 *
	 * @template T - The color space type
	 * @param type - The constructor of the color space
	 * @returns The metadata for the specified color space
	 * @throws {Error} When the color space is not registered or metadata is invalid
	 *
	 * @example
	 * ```typescript
 * const metadata = ColorSpaceManager.GetMetadata(RGB);
 * console.log(metadata.name); // "RGB"
 * console.log(metadata.converters); // ["HSL", "HSV", "XYZ"]
	 * ```
	 */
	public static GetMetadata<T extends ColorSpace>(type: TConstructorFunction<T>): IColorSpaceMetadata {
		if (!Reflect.hasMetadata(this._MetadataKey, type)) throw new ColorError('Color Space Metadata Not Found, Please ensure the appropriate decorator is applied to the class.');
		const metadata = Reflect.getMetadata(this._MetadataKey, type) as IColorSpaceMetadata;
		this.AssertMetadata(metadata);
		return metadata;
	}

	/**
	 * Retrieves metadata for all registered color spaces.
	 *
	 * Returns an array containing metadata for all color spaces currently
	 * registered with the ColorSpaceManager.
	 *
	 * @returns Array of metadata for all registered color spaces
	 *
	 * @example
	 * ```typescript
 * const allMetadata = ColorSpaceManager.GetAllMetadata();
 * console.log(allMetadata.map(m => m.name)); // ["RGB", "HSL", "XYZ", ...]
	 * ```
	 */
	public static GetAllMetadata(): IColorSpaceMetadata[] {
		return Array.from(this._ColorSpaces.values());
	}

	/**
	 * Clears the color space registry, removing all registered color spaces.
	 *
	 * This method is intended for testing purposes only. It removes all registered
	 * color spaces from the internal registry, allowing tests to start with a clean state.
	 *
	 * @internal
	 */
	public static ClearRegistry(): void {
		this._ColorSpaces.clear();
	}

	/**
	 * Generates a cache key for color space conversion paths.
	 *
	 * @param inputName - Name of the input color space
	 * @param outputName - Name of the output color space
	 * @returns A cache key in the format `${inputName}|${outputName}`
	 *
	 * @internal
	 */
	private static _GetPathCacheKey(inputName: string, outputName: string): string {
		return `${inputName}|${outputName}`;
	}

	public static AssertMetadata(metadata: unknown): asserts metadata is IColorSpaceMetadata {
		if (!metadata || typeof metadata !== 'object') throw new ColorError('Color Space Metadata is not an object');

		const requiredProps: Array<keyof IColorSpaceMetadata> = ['name', 'description', 'Ctor', 'converters'];

		for (const prop of requiredProps) {
			if (!(prop in metadata)) throw new ColorError(`Color Space Metadata missing required property: ${prop}`);
		}

		if (typeof (metadata as IColorSpaceMetadata).name !== 'string') throw new ColorError('Color Space Metadata name must be a string');
		if (typeof (metadata as IColorSpaceMetadata).description !== 'string') throw new ColorError('Color Space Metadata description must be a string');
		if (typeof (metadata as IColorSpaceMetadata).Ctor !== 'function') throw new ColorError('Color Space Metadata Ctor must be a constructor function');
		if (!Array.isArray((metadata as IColorSpaceMetadata).converters)) throw new ColorError('Color Space Metadata converters must be an array');
	}
}
