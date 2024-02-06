# object-builder

[![CI](https://github.com/heap-code/object-builder/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/heap-code/object-builder/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@heap-code/object-builder)](https://www.npmjs.com/package/@heap-code/object-builder)
![Code coverage](.badges/code/coverage.svg)
![Comment coverage](.badges/comment/coverage.svg)

Builder pattern for objects.

## About

This package allows to create objects with the [Builder Pattern](https://en.wikipedia.org/wiki/Builder_pattern).

The builder can add different keys and overridden them.  
The product (builded object) type can be constraint by a pattern or determined by its use.

> It is most useful with _typescript_.

## Installation

Simply run:

```bash
npm i @heap-code/object-builder
```

### CDN

Thanks to [_jsdelivr_](https://www.jsdelivr.com/),
this package can easily be used in browsers like this:

```html
<script
 src="https://cdn.jsdelivr.net/npm/@heap-code/object-builder/dist/bundles/object-builder.umd.js"
 type="application/javascript"
></script>
```

> **Note:**  
> It is recommended to use a minified and versioned bundle.
>
> For example:
>
> ```html
> <script
>  src="https://cdn.jsdelivr.net/npm/@heap-code/object-builder@0.1.3/dist/bundles/object-builder.umd.min.js"
>  type="application/javascript"
> ></script>
> ```

More at this [_jsdelivr_ package page](https://www.jsdelivr.com/package/npm/@heap-code/object-builder).

## Usage

The builder can be created for different uses.  
Most of the examples give an example of use for an equivalent class.

The following terms are used:

- pattern: The _model_, that the product should satisfy when building.  
It can be optional.
- product: the final object that is builded, regardless of the pattern.
- handler: the "constructor" for a given key.
  - `self`: first parameter, reference to the builded product.  
  Simulates the `this` keyword ([here](#use-of-self)).

### Simple object

To create a simple object, that does not refer to itself,
could be created as follows:

```typescript
import { ObjectBuilder } from "@heap-code/object-builder";

const { method, property } = ObjectBuilder.create()
 .with("property", () => 10)
 .with("method", () => (n: number) => n * 2)
 .build();

console.log(property); // => `10`
console.log(method(2)); // => `4`
```

> `method` and `property` types are inferred.

<details>
<summary>Equivalent to the class:</summary>

```typescript
class MyClass {
 property = 10;
 method(n: number) {
  return n * 2;
 }
}

const myClass = new MyClass();
console.log(myClass.property);
console.log(myClass.method(2));
```

</details>

### With an initial pattern

A pattern can be use to constraint the builder.  
Adding unknown keys, or wrongly type their handler, will result on a type error at compilation.

```typescript
import { ObjectBuilder } from "@heap-code/object-builder";

interface Pattern {
 method: (n: number) => number;
 property: number;
}

const { method, property } = ObjectBuilder.create<Pattern>()
 .with("property", () => 10)
 // `n` type is deduced from the pattern
 .with("method", () => n => n * 2)
 .build();
```

<details>
<summary>Equivalent to the class:</summary>

```typescript
class MyClass implements Product {
 property = 10;
 method(n) {
  return n * 2;
 }
}
```

</details>

---

A pattern can also be set when calling `build`.  
This "asks" that the output product satisfies the given pattern.

> More at [this section](#incomplete-product).

```typescript
import { ObjectBuilder } from "@heap-code/object-builder";

interface Product {
 method: (n: number) => number;
 property: number;
}

// `product` satisfies `Product`
const product = ObjectBuilder.create()
 .with("property", () => 10)
 .with("method", () => (n: number) => n * 2)
 .build<Product>();
```

### Incomplete Product

When trying to build from a pattern without all handlers defined,
a special type is returned to invalidate the type of the product.

```typescript
import { ObjectBuilder } from "@heap-code/object-builder";

interface Pattern {
 method: (n: number) => number;
 property: number;
}

const product1 = ObjectBuilder.create()
 .with("method", () => (n: number) => n * 2)
 .build<Pattern>();
const product2 = ObjectBuilder.create<Pattern>()
 .with("method", () => n => n * 2)
 .build();
```

> Both products are of a type incompatible with the pattern.  
> This [issue](https://github.com/heap-code/object-builder/issues/6) is already created to improve its behavior.

### Use of self

The first parameter of an handler is the created product.  
It corresponds to `this` in a class.

```typescript
import { ObjectBuilder } from "@heap-code/object-builder";

ObjectBuilder.create()
 .with("property", () => 10)
 .with("method", self => (n: number) => n * self.property);
```

<details>
<summary>Equivalent to the class:</summary>

```typescript
class MyClass {
 property = 10;
 method(n: number) {
  return n * this.property;
 }
}
```

</details>

### Recursion

Recursion is easily possible with a pattern ([initial pattern](#with-an-initial-pattern)).

But without it, the type must be set manually when using `with`:

```typescript
import { ObjectBuilder } from "@heap-code/object-builder";

ObjectBuilder.create()
 .with<"count", (n: number) => number[]>(
  "count",
   self => n => (0 <= n ? [0] : [n, ...self.count(n - 1)]),
);
```

> The key (`count`) must also be defined or it can not be "injected" into `self`.

### Override

A key can be overridden any time.

It simulates an `extends` and provide a way to reuse the previous implementation (`prev`).

```typescript
import { ObjectBuilder } from "@heap-code/object-builder";

const builder1 = ObjectBuilder.create()
 .with("property", () => 2)
 .with("protected", self => (n: number) => n + self.property)
 .with("method", self => (n: number) => 2 * self.protected(n));

const builder2 = builder1.override(
 "protected",
 (self, prev) => n => prev(n) + self.property,
);

const product1 = builder1.build();
const product2 = builder2.build();
console.log(product1.method(2)); // => 8
console.log(product2.method(2)); // => 12
```

<details>
<summary>Equivalent to the classes:</summary>

```typescript
class MyClass1 {
 property = 2;
 protected(n: number) {
  return n + this.property;
 }
 method(n: number) {
  return 2 * this.protected(n);
 }
}
class MyClass2 extends MyClass1 {
 override protected(n: number) {
  return super.protected(n) + this.property;
 }
}

const myClass1 = new MyClass1();
const myClass2 = new MyClass2();
console.log(myClass1.method(2)); // => 8
console.log(myClass2.method(2)); // => 12
```

</details>

## Releases

See information about breaking changes and release notes [here](https://github.com/heap-code/object-builder/blob/HEAD/CHANGELOG.md).
