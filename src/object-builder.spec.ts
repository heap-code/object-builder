import { OverrideUnsetKeyException } from "./exceptions";
import { ObjectBuilder } from "./object-builder";

describe("ObjectBuild", () => {
	describe("Without self reference", () => {
		it("should build a simple object", () => {
			const random = Math.random();

			const { fn, prop } = ObjectBuilder.create()
				.with("prop", () => random)
				.with("fn", () => (str: string, pos: number) => str[pos])
				.build();

			expect(prop).toBe(random);
			expect(fn("abc", 0)).toBe("a");
			expect(fn("abc", 1)).toBe("b");
		});

		it("should override", () => {
			const random = Math.random();
			const builder = ObjectBuilder.create()
				.with("prop", () => "a")
				.with("const", () => random)
				.with("fn", () => (a: number) => a);

			const objB = builder
				.override("prop", () => "bc")
				.override("fn", () => a => a + 2)
				.build();
			const objA = builder.build();

			expect(objB.prop).not.toBe(objA.prop);
			expect(objB.prop).toBe("bc");

			expect(objB.const).toBe(objA.const);

			expect(objA.fn(10)).toBe(10);
			expect(objB.fn(10)).toBe(12);
		});

		it("should override and reuse previous", () => {
			const random = Math.round(Math.random() * 100);

			const builder = ObjectBuilder.create()
				.with("prop", () => "a")
				.with("fn", () => (a: number) => a);

			const objA = builder.build();
			const objB = builder
				.override("fn", (_, fn) => a => 2 * fn(a))
				.override("prop", (_, prev) => `${prev}bc`)
				.override("fn", (_, fn) => a => 2 * fn(a))
				.build();

			expect(objB.prop).toBe("abc");
			expect(objB.fn(random)).toBe(4 * objA.fn(random));
		});
	});

	describe("With self reference", () => {
		it("should be able to use an already defined key", () => {
			const { fn, prop } = ObjectBuilder.create()
				.with("prop", () => 10)
				.with("fn", self => (a: number) => self.prop + a)
				.build();

			expect(fn(10)).toBe(fn(10) + prop);
		});

		it("should be able to use a key that will be defined", () => {
			interface Obj {
				fn: (a: number) => number;
				prop: number;
			}
			const { fn, prop } = ObjectBuilder.create<Obj>()
				.with("fn", self => (a: number) => self.prop + a)
				.with("prop", () => 10)
				.build();

			expect(fn(10)).toBe(fn(10) + prop);
		});

		it("should be able to use recursion", () => {
			const { fn } = ObjectBuilder.create()
				.with<"fn", (a: number) => number[]>(
					"fn",
					({ fn }) =>
						a =>
							a === 0 ? [0] : [a, ...fn(a - 1)],
				)
				.build();

			expect(fn(5)).toStrictEqual([5, 4, 2, 1, 0]);
		});

		it("should be able to use recursion (with multiple methods)", () => {
			interface Obj {
				even: (n: number) => boolean;
				odd: (n: number) => boolean;
			}
			const { even, odd } = ObjectBuilder.create<Obj>()
				.with("even", s => n => (n === 0 ? true : !s.odd(n - 1)))
				.with("odd", s => n => (n === 0 ? false : !s.even(n - 1)))
				.build();

			expect(even(10)).toBe(true);
			expect(odd(10)).toBe(false);
		});
	});

	describe("Errors", () => {
		it("should fail when trying to `override` and unset key", () => {
			expect(() =>
				ObjectBuilder.create()
					.with("a", () => 1)
					.override("a", () => 1),
			).not.toThrow(OverrideUnsetKeyException);

			expect(() =>
				ObjectBuilder.create<{ a: number; b: number }>()
					.with("a", () => 1)
					// "b" as not been set yet
					.override("b" as "a", () => 1),
			).toThrow(OverrideUnsetKeyException);
		});
	});
});
