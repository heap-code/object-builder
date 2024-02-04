import { expectAssignable, expectType } from "tsd";

import { BuilderIncompleteProduct, ObjectBuilder } from ".";

// Use anonymous function to simulate a `describe`/`it` structure.

interface Prd {
	fn: (a: number) => number;
	prop: number;
}

() => {
	// It should deduce product

	const { async, fn, prop } = ObjectBuilder.create()
		.with("prop", () => Math.random())
		.with("fn", () => (str: string, pos: number) => str[pos])
		.with(
			"async",
			() => () => Promise.resolve({ a: 0 as const, b: new Date() }),
		)
		.build();

	expectAssignable<() => Promise<{ a: number; b: Date }>>(async);
	expectType<() => Promise<{ a: 0; b: Date }>>(async);
	expectType<(a: string, b: number) => string>(fn);
	expectType<number>(prop);
};

() => {
	// It should correctly type "self" and arguments by construction

	ObjectBuilder.create()
		.with("prop", () => 0)
		.with("const", self => {
			expectAssignable<{ prop: number }>(self);
			return 0;
		})
		.with<"fn", (a: number) => number>("fn", self => a => {
			expectAssignable<{
				const: number;
				fn: (a: number) => number;
				prop: number;
			}>(self);
			expectType<number>(a);
			return a;
		});
};

() => {
	// It should constraint the builded product

	const builder0 = ObjectBuilder.create()
		.with("prop", () => 0)
		.with("const", () => "");
	expectType<BuilderIncompleteProduct>(builder0.build<Prd>());
	expectAssignable<{ const: string; prop: number }>(
		builder0.build<unknown>(),
	);

	const builder = builder0.with("fn", () => (a: number) => a);
	const prd = builder.build<Prd>();
	expectAssignable<Prd>(prd);
	expectAssignable<Prd & { const: string }>(prd);

	expectType<Array<keyof typeof prd>>(builder.keys());
};

() => {
	// It should correctly type "self" and arguments from Product

	ObjectBuilder.create<Prd>()
		.with("fn", () => a => {
			expectType<number>(a);
			return a + 1;
		})
		.with("prop", self => {
			expectAssignable<Prd>(self);
			return 0;
		});
};

() => {
	// It should fail on incomplete product

	expectType<BuilderIncompleteProduct>(ObjectBuilder.create<Prd>().build());
	expectType<BuilderIncompleteProduct>(
		ObjectBuilder.create<Prd>()
			.with("prop", () => 0)
			.build(),
	);

	const builder = ObjectBuilder.create<Prd>().with("fn", () => a => a + 1);
	expectAssignable<Pick<Prd, "fn">>(builder.build<unknown>());
	expectType<BuilderIncompleteProduct>(builder.build());
};

() => {
	// It should determine with a self reference

	const { fn, prop } = ObjectBuilder.create()
		.with("prop", () => 10)
		.with("fn", self => (a: number) => self.prop + a)
		.build();

	expectType<number>(prop);
	expectType<(a: number) => number>(fn);
};
