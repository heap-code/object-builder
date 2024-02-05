/* eslint-disable @typescript-eslint/no-explicit-any -- Needed for type inference */
import { OverrideUnsetKeyException } from "./exceptions";
import {
	BuilderHandler,
	BuilderHandlerOverride,
	BuilderIncompleteProduct,
	BuilderProductKey,
} from "./types";

/**
 * Builder for an object.
 * It can replace the creation of a simple object or a multi-level class hierarchy.
 *
 * @template Pattern is the product expected from the {@link ObjectBuilder}.
 * @template Product is the actual object that will be builded (product) for an {@link ObjectBuilder} instance.
 */
export class ObjectBuilder<
	const Pattern extends Record<BuilderProductKey, any>,
	const Product extends Record<never, never>,
> {
	// TODO: create from?

	/**
	 * Creates An {@link ObjectBuilder}.
	 *
	 * @returns An {@link ObjectBuilder}
	 */
	public static create<
		const Pattern extends Record<BuilderProductKey, any>,
	>(): ObjectBuilder<Pattern, Record<never, never>> {
		return new ObjectBuilder(new Map() as never);
	}

	private constructor(
		private readonly handlers: ReadonlyMap<
			keyof Product,
			<K extends keyof Product>(product: Product) => Product[K]
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
	 * @example
	 * // `a` satisfies `{ a: number }`
	 * const a = ObjectBuilder.create<{ a: number }>()
	 * 	.with("a", () => 0)
	 * 	.build();
	 * @example
	 * // `b` is of type `NonExhaustiveProduct`
	 * const b = ObjectBuilder.create()
	 * 	.with("a", () => 0)
	 * 	.build<{ b: number }>();
	 * @example
	 * // `b` satisfies `{ b: number }` (and `{ a: number; b: number }`)
	 * const b = ObjectBuilder.create()
	 * 	.with("a", () => 0)
	 * 	.with("b", () => 0)
	 * 	.build<{ b: number }>();
	 * @example
	 * // `c` satisfies `{ a: number }`
	 * const c = ObjectBuilder.create<{ a: number; c: number }>()
	 * 	.with("a", () => 0)
	 * 	.build<unknown>();
	 *
	 * @template P Constraint: does the builded product satisfy `P` ?
	 * 	Use `unknown` to ignore this constraint.
	 * @returns the final product
	 */
	public build<P = Pattern>(): Product extends P
		? Product
		: BuilderIncompleteProduct {
		return Array.from(this.handlers.entries()).reduce(
			(self, [key, handler]) =>
				Object.defineProperty(self, key, {
					get: () => handler(self as Product),
				}),
			{},
		) as never;
	}

	/**
	 * Returns the currently set keys
	 *
	 * @returns the currently set keys
	 */
	public keys(): Array<keyof Product> {
		return Array.from(this.handlers.keys());
	}

	/**
	 * Adds a [handler]{@link BuilderHandler} on the call of a given key.
	 *
	 * @param key to add
	 * @param handler for the given key
	 * @returns a new builder with the added handler
	 */
	public with<
		const Key extends keyof Pattern,
		const T extends Pattern[Key],
		_, // HACK: this allows to use `self` without "breaking" the type inference (`& Record<Key, T>`)
	>(
		key: Key,
		handler: BuilderHandler<Omit<Product, Key> & Pattern, T>,
	): ObjectBuilder<Pattern, Omit<Product, Key> & Record<Key, T>>;
	/**
	 * Adds a [handler]{@link BuilderHandler} on the call of a given key.
	 *
	 * @param key to add
	 * @param handler for the given key
	 * @returns a new builder with the added handler
	 */
	public with<const Key extends keyof Pattern, const T extends Pattern[Key]>(
		key: Key,
		handler: BuilderHandler<
			Omit<Product, Key> & Pattern & Record<Key, T>,
			T
		>,
	): ObjectBuilder<Pattern, Omit<Product, Key> & Record<Key, T>>;
	/**
	 * Adds a [handler]{@link BuilderHandler} on the call of a given key.
	 *
	 * @param key to add
	 * @param handler for the given key
	 * @returns a new builder with the added handler
	 */
	public with<const Key extends keyof Pattern, const T extends Pattern[Key]>(
		key: Key,
		handler: BuilderHandler<
			Omit<Product, Key> & Pattern & Record<Key, T>,
			T
		>,
	): ObjectBuilder<Pattern, Omit<Product, Key> & Record<Key, T>> {
		// @ts-expect-error -- From parameter
		return new ObjectBuilder(
			// @ts-expect-error -- New key added
			new Map([...Array.from(this.handlers.entries()), [key, handler]]),
		);
	}

	/**
	 * Overrides an existing key [handler]{@link BuilderHandler}.
	 *
	 * The other handlers that refer to this key will also use this handler.
	 *
	 * @param key to override
	 * @param handler for the given key
	 * @throws {OverrideUnsetKeyException} when the key is not already set
	 * @returns a new builder with the overridden key
	 */
	public override<const Key extends keyof Product>(
		key: Key,
		handler: BuilderHandlerOverride<Pattern & Product, Product[Key]>,
	): this {
		const previous = this.handlers.get(key);
		if (!previous) {
			throw new OverrideUnsetKeyException(key);
		}

		return this.with(
			key as never,
			self => handler(self, previous<Key>(self)) as never,
		) as never;
	}
}

/* eslint-enable */
