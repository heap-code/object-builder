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
 * @template Product is the product expected from an {@link ObjectBuilder}.
 * @template Current is the current object that will be builded (product) for an {@link ObjectBuilder} instance.
 */
export class ObjectBuilder<
	const Product extends Record<BuilderProductKey, any>,
	const Current extends Record<never, never>,
> {
	// TODO: create from?

	/**
	 * Creates An {@link ObjectBuilder}.
	 *
	 * @returns An {@link ObjectBuilder}
	 */
	public static create<
		const Product extends Record<BuilderProductKey, any>,
	>(): ObjectBuilder<Product, Record<never, never>> {
		return new ObjectBuilder(new Map() as never);
	}

	private constructor(
		private readonly handlers: ReadonlyMap<
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
	public build<P = Product>(): Current extends P
		? Current
		: BuilderIncompleteProduct {
		return Array.from(this.handlers.entries()).reduce(
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
		const Key extends keyof Product,
		const T extends Product[Key],
		_, // HACK: this allows to use `self` without "breaking" the type inference (`& Record<Key, T>`)
	>(
		key: Key,
		handler: BuilderHandler<Omit<Current, Key> & Product, T>,
	): ObjectBuilder<Product, Omit<Current, Key> & Record<Key, T>>;
	/**
	 * Adds a [handler]{@link BuilderHandler} on the call of a given key.
	 *
	 * @param key to add
	 * @param handler for the given key
	 * @returns a new builder with the added handler
	 */
	public with<const Key extends keyof Product, const T extends Product[Key]>(
		key: Key,
		handler: BuilderHandler<
			Omit<Current, Key> & Product & Record<Key, T>,
			T
		>,
	): ObjectBuilder<Product, Omit<Current, Key> & Record<Key, T>>;
	/**
	 * Adds a [handler]{@link BuilderHandler} on the call of a given key.
	 *
	 * @param key to add
	 * @param handler for the given key
	 * @returns a new builder with the added handler
	 */
	public with<const Key extends keyof Product, const T extends Product[Key]>(
		key: Key,
		handler: BuilderHandler<
			Omit<Current, Key> & Product & Record<Key, T>,
			T
		>,
	): ObjectBuilder<Product, Omit<Current, Key> & Record<Key, T>> {
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
	public override<const Key extends keyof Current>(
		key: Key,
		handler: BuilderHandlerOverride<Current & Product, Current[Key]>,
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
