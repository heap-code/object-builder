import { OverrideUnsetKeyException } from "./exceptions";

export class ObjectBuilder<
	const Product extends Record<string | symbol, unknown>,
	const Current extends Record<string | symbol, never>,
> {
	// TODO: create from?

	public static create<
		const Obj extends Record<string | symbol, unknown>,
	>(): ObjectBuilder<Obj, Record<string | symbol, never>> {
		return new ObjectBuilder();
	}

	private constructor() {
		throw new Error("TODO");
	}

	/**
	 * Builds the product of this builder
	 *
	 * @returns the current product
	 */
	public buildCurrent(): Current {
		throw new Error("TODO");
	}

	/**
	 * Builds the product of this builder.
	 *
	 * Useful in typescript as it ensure that all necessary keys have been set.
	 *
	 * @example
	 * // `a` is of type `never`
	 * const a = ObjectBuilder.create<{ a: number }>().build();
	 * @example
	 * // `a` is compatible with `{ a: number }`
	 * const a = ObjectBuilder.create<{ a: number }>().with("a", () => 0).build();
	 *
	 * @see buildCurrent
	 * @returns the final product
	 */
	public build(): Current extends Product ? Current : never {
		return this.buildCurrent() as never;
	}

	public with<const Key extends keyof Product, const T extends Product[Key]>(
		key: Key,
		fn: (self: Omit<Current, Key> & Product & Record<Key, T>) => T,
	): ObjectBuilder<Product, Omit<Current, Key> & Record<Key, T>> {
		throw new Error("TODO");
	}

	public override<const Key extends keyof Current>(
		key: Key,
		fn: (self: Current & Product, curr: Current[Key]) => Current[Key],
	): this {
		throw new OverrideUnsetKeyException("TODO");
	}
}
