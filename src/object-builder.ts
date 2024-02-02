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
		return new ObjectBuilder();
	}

	private constructor() {
		throw new Error("TODO");
	}

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
		throw new Error("TODO");
	}

	/**
	 * Returns the currently set keys
	 *
	 * @returns the currently set keys
	 */
	public keys(): Array<keyof Current> {
		throw new Error("TODO");
	}

	public with<const Key extends keyof Product, const T extends Product[Key]>(
		_0: Key,
		_1: (self: Omit<Current, Key> & Product & Record<Key, T>) => T,
	): ObjectBuilder<Product, Omit<Current, Key> & Record<Key, T>> {
		throw new Error("TODO");
	}

	public override<const Key extends keyof Current>(
		_0: Key,
		_1: (self: Current & Product, curr: Current[Key]) => Current[Key],
	): this {
		throw new OverrideUnsetKeyException("TODO");
	}
}
