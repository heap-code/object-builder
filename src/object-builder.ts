import { OverrideUnsetKeyException } from "./exceptions";

export type ProductKey = string | symbol;
export interface NonExhaustiveProduct {
	__a: 0;
}

export class ObjectBuilder<
	const Product extends Record<ProductKey, any>,
	const Current extends Record<never, never>,
> {
	// TODO: create from?

	public static create<
		const Product extends Record<ProductKey, any>,
	>(): ObjectBuilder<Product, Record<never, never>> {
		return new ObjectBuilder(new Map() as never);
	}

	private constructor(
		private readonly fns: ReadonlyMap<
			keyof Current,
			<K extends keyof Current>(product: Current) => Current[K]
		>,
	) {}

	/**
	 * Builds the product of this builder.
	 *
	 * Useful in typescript as it ensure that all necessary keys have been set.
	 *
	 * @example
	 * // `a` is of type `NonExhaustiveProduct`
	 * const a = ObjectBuilder.create<{ a: number }>()
	 * 	.build();
	 *
	 * @example
	 * // `a` satisfies `{ a: number }`
	 * const a = ObjectBuilder.create<{ a: number }>()
	 * 	.with("a", () => 0)
	 * 	.build();
	 *
	 * @example
	 * // `b` is of type `NonExhaustiveProduct`
	 * const b = ObjectBuilder.create()
	 * 	.with("a", () => 0)
	 * 	.build<{ b: number }>();
	 *
	 * @example
	 * // `b` satisfies `{ b: number }` (and `{ a: number; b: number }`)
	 * const b = ObjectBuilder.create()
	 * 	.with("a", () => 0)
	 * 	.with("b", () => 0)
	 * 	.build<{ b: number }>();
	 *
	 * @example
	 * // `c` satisfies `{ a: number }`
	 * const c = ObjectBuilder.create<{ a: number; c: number }>()
	 * 	.with("a", () => 0)
	 * 	.build<unkown>();
	 *
	 * @template P Constraint: does the builded product satisfy `P` ?
	 * 	Use `unknown` to ignore this constraint.
	 * @returns the final product
	 */
	public build<P = Product>(): Current extends P
		? Current
		: NonExhaustiveProduct {
		return Array.from(this.fns.entries()).reduce(
			(self, [key, handler]) =>
				Object.defineProperty(self, key, {
					get: () => handler(self as Current),
				}),
			{},
		) as never;
	}

	/**
	 * Returns the currently set keys
	 *
	 * @returns the currently set keys
	 */
	public keys(): Array<keyof Current> {
		return Array.from(this.fns.keys());
	}

	public with<const Key extends keyof Product, const T extends Product[Key]>(
		key: Key,
		handler: (self: Omit<Current, Key> & Product & Record<Key, T>) => T,
	): ObjectBuilder<Product, Omit<Current, Key> & Record<Key, T>> {
		// @ts-expect-error -- From parameter
		return new ObjectBuilder(
			// @ts-expect-error -- New key added
			new Map([...Array.from(this.fns.entries()), [key, handler]]),
		);
	}

	public override<const Key extends keyof Current>(
		key: Key,
		handler: (
			self: Current & Product,
			previous: Current[Key],
		) => Current[Key],
	): this {
		const previous = this.fns.get(key);
		if (!previous) {
			throw new OverrideUnsetKeyException("TODO");
		}

		// @ts-expect-error -- A lot of casts.
		return this.with(
			key as never,
			self => handler(self, previous<Key>(self)) as never,
		);
	}
}
