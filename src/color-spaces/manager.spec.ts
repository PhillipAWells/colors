
import 'reflect-metadata';
import { ColorSpace } from './_color-space.js';
import { ColorSpaceManager } from './manager.js';

describe('Color Space Manager', () => {
	// Helper to track all registered types for cleanup
	const registered: Array<new (...args: any[]) => ColorSpace> = [];
	afterEach(() => {
		// Unregister all types registered in this test
		for (const ctor of registered.splice(0)) {
			try {
				ColorSpaceManager.Unregister(ctor);
			} catch {
				// ignore
			}
		}
	});

	it('registers a color space and retrieves its metadata', () => {
		@ColorSpaceManager.Register({
			name: 'A',
			description: 'Space A',
			converters: [],
		})
		class A extends ColorSpace {
			protected override components: number[];

			constructor(...v: number[]) {
				super();
				this.components = v;
			}

			public override ToArray(): number[] {
				return this.components;
			}

			public ToString(): string {
				return `A(${this.components.join(', ')})`;
			}
		}
		registered.push(A);

		const md = ColorSpaceManager.GetMetadata(A);
		expect(md.name).toBe('A');
		expect(md.description).toBe('Space A');
		expect(md.converters).toEqual([]);

		expect(md.Ctor).toBe(A);
	});

	it('throws when registering duplicate color space names', () => {
		@ColorSpaceManager.Register({ name: 'Dup', converters: [] })
		class D1 extends ColorSpace {
			protected override components: number[] = [];

			public override ToArray(): number[] {
				return [];
			}

			public ToString(): string {
				return 'D1';
			}
		}
		registered.push(D1);

		expect(() => {
			@ColorSpaceManager.Register({ name: 'Dup', converters: [] })
			class D2 extends ColorSpace {
				protected override components: number[] = [];

				public override ToArray(): number[] {
					return [];
				}

				public ToString(): string {
					return 'D2';
				}
			}
			registered.push(D2);
		}).toThrow(/Already Registered/);
	});

	it('unregisters a color space so metadata is gone', () => {
		@ColorSpaceManager.Register({ name: 'U', converters: [] })
		class U extends ColorSpace {
			protected override components: number[] = [];

			public override ToArray(): number[] {
				return [];
			}

			public ToString(): string {
				return 'U';
			}
		}
		registered.push(U);

		// should be retrievable now
		expect(ColorSpaceManager.GetMetadata(U).name).toBe('U');

		// unregister and then GetMetadata should throw
		ColorSpaceManager.Unregister(U);

		const idx = registered.indexOf(U);
		if (idx >= 0) registered.splice(idx, 1);

		expect(() => ColorSpaceManager.GetMetadata(U)).toThrow(/Metadata Not Found/);
	});

	it('converts to the same type by creating a new instance', () => {
		@ColorSpaceManager.Register({ name: 'S', converters: [] })
		class S extends ColorSpace {
			private readonly _Vals: number[];

			protected override components: number[] = [];

			constructor(...v: number[]) {
				super();
				this._Vals = v;
			}

			public override ToArray(): number[] {
				return this._Vals;
			}

			public ToString(): string {
				return `S(${this._Vals.join(', ')})`;
			}
		}
		registered.push(S);

		const original = new S(1, 2, 3);
		const result = ColorSpaceManager.Convert(original, S);
		expect(result).not.toBe(original);
		expect(result.ToArray()).toEqual([1, 2, 3]);
	});

	it('performs direct conversion when converter exists', () => {
		@ColorSpaceManager.Register({ name: 'A', converters: ['B'] })
		class A extends ColorSpace {
			private readonly _Vals: number[];

			protected override components: number[] = [];

			constructor(...v: number[]) {
				super();
				this._Vals = v;
			}

			public override ToArray(): number[] {
				return this._Vals;
			}

			public ToString(): string {
				return `A(${this._Vals.join(', ')})`;
			}
		}
		@ColorSpaceManager.Register({ name: 'B', converters: [] })
		class B extends ColorSpace {
			private readonly _Vals: number[];

			protected override components: number[] = [];

			constructor(...v: number[]) {
				super();
				this._Vals = v;
			}

			public override ToArray(): number[] {
				return this._Vals;
			}

			public ToString(): string {
				return `B(${this._Vals.join(', ')})`;
			}
		}
		registered.push(A, B);

		const a = new A(10, 20);
		const b = ColorSpaceManager.Convert(a, B);
		expect(b).toBeInstanceOf(B);
		expect(b.ToArray()).toEqual([10, 20]);
	});

	it('performs multi-step conversion via shortest path', () => {
		@ColorSpaceManager.Register({ name: 'A', converters: ['B'] })
		class A extends ColorSpace {
			private readonly _V: number;

			protected override components: number[] = [];

			constructor(v: number) {
				super();
				this._V = v;
			}

			public override ToArray(): number[] {
				return [this._V];
			}

			public ToString(): string {
				return `A(${this._V})`;
			}
		}
		@ColorSpaceManager.Register({ name: 'B', converters: ['C'] })
		class B extends ColorSpace {
			private readonly _V: number;

			protected override components: number[] = [];

			constructor(v: number) {
				super();
				this._V = v;
			}

			public override ToArray(): number[] {
				return [this._V];
			}

			public ToString(): string {
				return `B(${this._V})`;
			}
		}
		@ColorSpaceManager.Register({ name: 'C', converters: [] })
		class C extends ColorSpace {
			private readonly _V: number;

			protected override components: number[] = [];

			constructor(v: number) {
				super();
				this._V = v;
			}

			public override ToArray(): number[] {
				return [this._V];
			}

			public ToString(): string {
				return `C(${this._V})`;
			}
		}
		registered.push(A, B, C);

		const a = new A(42);
		const c = ColorSpaceManager.Convert(a, C);
		expect(c).toBeInstanceOf(C);
		expect(c.ToArray()).toEqual([42]);
	});

	it('throws when no conversion path exists', () => {
		@ColorSpaceManager.Register({ name: 'X', converters: [] })
		class X extends ColorSpace {
			protected override components: number[] = [];

			public override ToArray(): number[] {
				return [];
			}

			public ToString(): string {
				return 'X';
			}
		}
		@ColorSpaceManager.Register({ name: 'Y', converters: [] })
		class Y extends ColorSpace {
			protected override components: number[] = [];

			public override ToArray(): number[] {
				return [];
			}

			public ToString(): string {
				return 'Y';
			}
		}
		registered.push(X, Y);

		const x = new X();
		expect(() => ColorSpaceManager.Convert(x, Y)).toThrow(/No conversion path exists/);
	});

	it('throws when a color space in the conversion path is not found', () => {
		@ColorSpaceManager.Register({ name: 'Start', converters: ['NonExistent'] })
		class Start extends ColorSpace {
			protected override components: number[] = [];

			public override ToArray(): number[] {
				return [];
			}

			public ToString(): string {
				return 'Start';
			}
		}
		@ColorSpaceManager.Register({ name: 'End', converters: [] })
		class End extends ColorSpace {
			protected override components: number[] = [];

			public override ToArray(): number[] {
				return [];
			}

			public ToString(): string {
				return 'End';
			}
		}
		registered.push(Start, End);

		const start = new Start();
		expect(() => ColorSpaceManager.Convert(start, End)).toThrow(/No conversion path exists from 'Start' to 'End'./);
	});

	it('uses static From method for conversion if available', () => {
		@ColorSpaceManager.Register({ name: 'FromA', converters: ['FromB'] })
		class FromA extends ColorSpace {
			protected override components: number[] = [];

			constructor(v: number) {
				super();
				this.components = [v];
			}

			public override ToArray(): number[] {
				return this.components;
			}

			public ToString(): string {
				return `FromA(${this.components[0]})`;
			}
		}
		@ColorSpaceManager.Register({ name: 'FromB', converters: [] })
		class FromB extends ColorSpace {
			protected override components: number[] = [];

			constructor(v: number) {
				super();
				this.components = [v];
			}

			public override ToArray(): number[] {
				return this.components;
			}

			public ToString(): string {
				return `FromB(${this.components[0]})`;
			}

			public static From(input: FromA): FromB {
				const array = input.ToArray();
				return new FromB((array[0] ?? 0) * 2); // Example conversion logic
			}
		}
		registered.push(FromA, FromB);

		const fromA = new FromA(10);
		const fromB = ColorSpaceManager.Convert(fromA, FromB);
		expect(fromB).toBeInstanceOf(FromB);
		expect(fromB.ToArray()).toEqual([20]);
	});

	it('returns all registered metadata via GetAllMetadata', () => {
		@ColorSpaceManager.Register({ name: 'One', converters: [] })
		class One extends ColorSpace {
			protected override components: number[] = [];

			public override ToArray(): number[] {
				return [];
			}

			public ToString(): string {
				return 'One';
			}
		}
		@ColorSpaceManager.Register({ name: 'Two', converters: [] })
		class Two extends ColorSpace {
			protected override components: number[] = [];

			public override ToArray(): number[] {
				return [];
			}

			public ToString(): string {
				return 'Two';
			}
		}
		registered.push(One, Two);

		const all = ColorSpaceManager.GetAllMetadata().map((m) => m.name).sort();
		expect(all).toEqual(['One', 'Two']);
	});

	describe('Conversion Path Caching', () => {
		it('should cache conversion paths after first use', () => {
			@ColorSpaceManager.Register({ name: 'CacheA', converters: ['CacheB'] })
			class CacheA extends ColorSpace {
				private readonly _V: number;

				protected override components: number[] = [];

				constructor(v: number) {
					super();
					this._V = v;
				}

				public override ToArray(): number[] {
					return [this._V];
				}

				public ToString(): string {
					return `CacheA(${this._V})`;
				}
			}
			@ColorSpaceManager.Register({ name: 'CacheB', converters: ['CacheC'] })
			class CacheB extends ColorSpace {
				private readonly _V: number;

				protected override components: number[] = [];

				constructor(v: number) {
					super();
					this._V = v;
				}

				public override ToArray(): number[] {
					return [this._V];
				}

				public ToString(): string {
					return `CacheB(${this._V})`;
				}
			}
			@ColorSpaceManager.Register({ name: 'CacheC', converters: [] })
			class CacheC extends ColorSpace {
				private readonly _V: number;

				protected override components: number[] = [];

				constructor(v: number) {
					super();
					this._V = v;
				}

				public override ToArray(): number[] {
					return [this._V];
				}

				public ToString(): string {
					return `CacheC(${this._V})`;
				}
			}
			registered.push(CacheA, CacheB, CacheC);

			// First conversion - should compute path
			const a1 = new CacheA(42);
			const c1 = ColorSpaceManager.Convert(a1, CacheC);
			expect(c1).toBeInstanceOf(CacheC);
			expect(c1.ToArray()).toEqual([42]);

			// Second conversion - should use cached path
			const a2 = new CacheA(100);
			const c2 = ColorSpaceManager.Convert(a2, CacheC);
			expect(c2).toBeInstanceOf(CacheC);
			expect(c2.ToArray()).toEqual([100]);

			// Both conversions should produce correct results
			expect(c1.ToArray()[0]).toBe(42);
			expect(c2.ToArray()[0]).toBe(100);
		});

		it('should use different cache entries for different conversions', () => {
			@ColorSpaceManager.Register({ name: 'TypeA', converters: ['TypeB'] })
			class TypeA extends ColorSpace {
				private readonly _V: number;

				protected override components: number[] = [];

				constructor(v: number) {
					super();
					this._V = v;
				}

				public override ToArray(): number[] {
					return [this._V];
				}

				public ToString(): string {
					return `TypeA(${this._V})`;
				}
			}
			@ColorSpaceManager.Register({ name: 'TypeB', converters: ['TypeC'] })
			class TypeB extends ColorSpace {
				private readonly _V: number;

				protected override components: number[] = [];

				constructor(v: number) {
					super();
					this._V = v;
				}

				public override ToArray(): number[] {
					return [this._V];
				}

				public ToString(): string {
					return `TypeB(${this._V})`;
				}
			}
			@ColorSpaceManager.Register({ name: 'TypeC', converters: [] })
			class TypeC extends ColorSpace {
				private readonly _V: number;

				protected override components: number[] = [];

				constructor(v: number) {
					super();
					this._V = v;
				}

				public override ToArray(): number[] {
					return [this._V];
				}

				public ToString(): string {
					return `TypeC(${this._V})`;
				}
			}
			@ColorSpaceManager.Register({ name: 'TypeD', converters: ['TypeC'] })
			class TypeD extends ColorSpace {
				private readonly _V: number;

				protected override components: number[] = [];

				constructor(v: number) {
					super();
					this._V = v;
				}

				public override ToArray(): number[] {
					return [this._V];
				}

				public ToString(): string {
					return `TypeD(${this._V})`;
				}
			}
			registered.push(TypeA, TypeB, TypeC, TypeD);

			// Convert TypeA -> TypeC
			const a = new TypeA(10);
			const cFromA = ColorSpaceManager.Convert(a, TypeC);
			expect(cFromA).toBeInstanceOf(TypeC);
			expect(cFromA.ToArray()).toEqual([10]);

			// Convert TypeD -> TypeC (different path)
			const d = new TypeD(20);
			const cFromD = ColorSpaceManager.Convert(d, TypeC);
			expect(cFromD).toBeInstanceOf(TypeC);
			expect(cFromD.ToArray()).toEqual([20]);

			// Verify both are cached independently by doing another round
			const a2 = new TypeA(30);
			const cFromA2 = ColorSpaceManager.Convert(a2, TypeC);
			expect(cFromA2.ToArray()).toEqual([30]);

			const d2 = new TypeD(40);
			const cFromD2 = ColorSpaceManager.Convert(d2, TypeC);
			expect(cFromD2.ToArray()).toEqual([40]);
		});

		it('should handle same-type conversions without caching', () => {
			@ColorSpaceManager.Register({ name: 'SameType', converters: [] })
			class SameType extends ColorSpace {
				private readonly _V: number;

				protected override components: number[] = [];

				constructor(v: number) {
					super();
					this._V = v;
				}

				public override ToArray(): number[] {
					return [this._V];
				}

				public ToString(): string {
					return `SameType(${this._V})`;
				}
			}
			registered.push(SameType);

			// Convert to same type
			const original = new SameType(50);
			const result = ColorSpaceManager.Convert(original, SameType);

			// Should create new instance without path lookup
			expect(result).not.toBe(original);
			expect(result).toBeInstanceOf(SameType);
			expect(result.ToArray()).toEqual([50]);

			// Second conversion
			const original2 = new SameType(60);
			const result2 = ColorSpaceManager.Convert(original2, SameType);
			expect(result2).not.toBe(original2);
			expect(result2.ToArray()).toEqual([60]);
		});
	});

	describe('AssertMetadata', () => {
		it('throws if metadata is not an object', () => {
			// Temporarily bypass private access for testing
			const assertMetadata = ColorSpaceManager.AssertMetadata.bind(ColorSpaceManager);
			expect(() => assertMetadata(null)).toThrow('Color Space Metadata is not an object');
			expect(() => assertMetadata(undefined)).toThrow('Color Space Metadata is not an object');
			expect(() => assertMetadata('string')).toThrow('Color Space Metadata is not an object');
			expect(() => assertMetadata(123)).toThrow('Color Space Metadata is not an object');
			expect(() => assertMetadata(true)).toThrow('Color Space Metadata is not an object');
		});

		it('throws if metadata is missing required properties', () => {
			const assertMetadata = ColorSpaceManager.AssertMetadata.bind(ColorSpaceManager);
			expect(() => assertMetadata({ description: '', Ctor: () => {/* no-op */}, converters: [] })).toThrow('Color Space Metadata missing required property: name');
			expect(() => assertMetadata({ name: '', Ctor: () => {/* no-op */}, converters: [] })).toThrow('Color Space Metadata missing required property: description');
			expect(() => assertMetadata({ name: '', description: '', converters: [] })).toThrow('Color Space Metadata missing required property: Ctor');
			expect(() => assertMetadata({ name: '', description: '', Ctor: () => {/* no-op */} })).toThrow('Color Space Metadata missing required property: converters');
		});

		it('throws if Name is not a string', () => {
			const assertMetadata = ColorSpaceManager.AssertMetadata.bind(ColorSpaceManager);
			expect(() => assertMetadata({ name: 123, description: '', Ctor: () => {/* no-op */}, converters: [] })).toThrow('Color Space Metadata name must be a string');
		});

		it('throws if Description is not a string', () => {
			const assertMetadata = ColorSpaceManager.AssertMetadata.bind(ColorSpaceManager);
			expect(() => assertMetadata({ name: '', description: 123,

				Ctor: () => {/* no-op */}, converters: [] })).toThrow('Color Space Metadata description must be a string');
		});

		it('throws if CTOR is not a function', () => {
			const assertMetadata = ColorSpaceManager.AssertMetadata.bind(ColorSpaceManager);
			expect(() => assertMetadata({ name: '', description: '',

				Ctor: 123, converters: [] })).toThrow('Color Space Metadata Ctor must be a constructor function');
		});

		it('throws if Converters is not an array', () => {
			const assertMetadata = ColorSpaceManager.AssertMetadata.bind(ColorSpaceManager);
			expect(() => assertMetadata({ name: '', description: '',

				Ctor: () => {/* no-op */}, converters: 'string' })).toThrow('Color Space Metadata converters must be an array');
		});

		it('does not throw for valid metadata', () => {
			const assertMetadata = ColorSpaceManager.AssertMetadata.bind(ColorSpaceManager);
			expect(() => assertMetadata({ name: 'Valid', description: 'Valid Desc',

				Ctor: () => {/* no-op */}, converters: [] })).not.toThrow();
		});
	});

	describe('Performance Benchmarks', () => {
		it('should demonstrate cache performance improvement', () => {
			const ITERATIONS = 1000;

			// Need to import RGB and Lab color spaces for this test
			// Using stub classes with proper conversion chain
			@ColorSpaceManager.Register({ name: 'BenchRGB', converters: ['BenchXYZ'] })
			class BenchRGB extends ColorSpace {
				private readonly _V: number;

				protected override components: number[] = [];

				constructor(r: number, g: number, b: number) {
					super();
					this._V = r + g + b;
				}

				public override ToArray(): number[] {
					return [this._V];
				}

				public ToString(): string {
					return `BenchRGB(${this._V})`;
				}
			}

			@ColorSpaceManager.Register({ name: 'BenchXYZ', converters: ['BenchLab'] })
			class BenchXYZ extends ColorSpace {
				private readonly _V: number;

				protected override components: number[] = [];

				constructor(v: number) {
					super();
					this._V = v;
				}

				public override ToArray(): number[] {
					return [this._V];
				}

				public ToString(): string {
					return `BenchXYZ(${this._V})`;
				}

				public static From(input: BenchRGB): BenchXYZ {
					const array = input.ToArray();
					return new BenchXYZ((array[0] ?? 0));
				}
			}

			@ColorSpaceManager.Register({ name: 'BenchLab', converters: [] })
			class BenchLab extends ColorSpace {
				private readonly _V: number;

				protected override components: number[] = [];

				constructor(v: number) {
					super();
					this._V = v;
				}

				public override ToArray(): number[] {
					return [this._V];
				}

				public ToString(): string {
					return `BenchLab(${this._V})`;
				}

				public static From(input: BenchXYZ): BenchLab {
					const array = input.ToArray();
					return new BenchLab((array[0] ?? 0));
				}
			}

			registered.push(BenchRGB, BenchXYZ, BenchLab);

			// Test without cache (cold start)
			ColorSpaceManager.ClearCache();
			const rgb = new BenchRGB(0.5, 0.3, 0.8);

			const startCold = performance.now();
			for (let i = 0; i < ITERATIONS; i++) {
				ColorSpaceManager.ClearCache(); // Force BFS every time
				ColorSpaceManager.Convert(rgb, BenchLab);
			}
			const coldTime = performance.now() - startCold;

			// Test with cache (warm cache)
			ColorSpaceManager.ClearCache();
			const startWarm = performance.now();
			for (let i = 0; i < ITERATIONS; i++) {
				ColorSpaceManager.Convert(rgb, BenchLab);
			}
			const warmTime = performance.now() - startWarm;

			const speedup = coldTime / warmTime;

			console.log('\n=== Cache Performance Benchmark ===');
			console.log(`Iterations: ${ITERATIONS}`);
			console.log(`Without cache: ${coldTime.toFixed(2)}ms (${(coldTime / ITERATIONS).toFixed(3)}ms per conversion)`);
			console.log(`With cache: ${warmTime.toFixed(2)}ms (${(warmTime / ITERATIONS).toFixed(3)}ms per conversion)`);
			console.log(`Speedup: ${speedup.toFixed(2)}x`);
			console.log('===================================\n');

			// Cache should provide measurable speedup
			// Note: BFS is fast, so cache provides ~1.5-2x improvement rather than dramatic 10x+
			expect(speedup).toBeGreaterThan(1.3); // At least 30% faster with cache
		});
	});
});
