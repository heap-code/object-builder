/** Key of product that can be added to an {@link ObjectBuilder}. */
export type BuilderProductKey = keyof never;
/** An "interface error" when trying to build an incomplete product. */
export interface BuilderIncompleteProduct {
	/** @internal */
	__0__: 0;
}

/**
 * An handler is the "constructor" of a key;
 * it is called to create the entrypoint in the product.
 *
 * @template T is the builded product (known at a given point, or with a specified one).
 * It is "equivalent" to `this` in a class.
 * @template U a single value corresponds to a readonly property, and a function is like a class method.
 */
export type BuilderHandler<T, U> = (self: T) => U;
/**
 * Similar to {@link BuilderHandler}, but it also gives the previous implementation.
 * It would have been `super.<fn>` on a class, where `fn` is the parent method that is being overridden.
 */
export type BuilderHandlerOverride<T, U> = (self: T, previous: U) => U;
