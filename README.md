`generic-parser`: Statically typed parser for generic sequences
========================================================================

`generic-parser` is a **statically typed** recursive descent parser written in TypeScript that can be applied for a **generic sequence**, not only a string. Since the rules written with `generic-parser` are type-aware, including its action parts, you can make the most of static type verification by TypeScript and code suggestions by your editor like Visual Studio Code.

### Example with `string`:

```typescript
// Assuming `factory` and `env` were initialized.

const rule = factory
    .choice(c => c
        .orSequence(s => s
            .and(r => r.seqEqual("abc"), "part1")
            .and(r => r.seqEqual("def"))
            .action(({ part1 }) => {
                return part1.toUpperCase();
                // Type-aware! `part1` is recognized as a `string`.
            })
        )
        .or(r => r.seqEqual("xyz"))
    )
    ;

const result1 = rule.match(0, "abcdef", env); // ✓ Match result: "ABC"
const result2 = rule.match(0, "abc", env);    // ✗ Not match
const result3 = rule.match(0, "xyz", env);    // ✓ Match result: "xyz"

```

### Example with `Array<number>`:

```typescript
// Assuming `factory` and `env` were initialized.

const rule = factory
    .choice(c => c
        .orSequence(s => s
            .and(r => r.seqEqual([0xAB, 0xCD]), "part2")
            .and(r => r.seqEqual([0xEF]))
            .action(({ part2 }) => {
                return part2[0];
                // Type-aware! `part2` is recognized as an `Array<number>`.
            })
        )
        .or(r => r.seqEqual([0x00]))
    )
    ;

const result1 = rule.match(0, [0xAB, 0xCD, 0xEF], env); // ✓ Match result: `0xAB`
const result2 = rule.match(0, [0xAB], env);             // ✗ Not match
const result3 = rule.match(0, [0x00], env);             // ✓ Match result: `[0x00]`
```

## Getting started

### Install

```bash
npm install --save generic-parser
```

### Code example with `string`

```typescript
// 1. Import the library
import * as gp from "generic-parser";

// 2. Prepare a rule factory.
//     You can add environment variables as
//     `gp.makeStringEnv({ var1: ..., var2: ..., })`.
//     The environment variables can be accessed in action functions.
const makeEnv = () => gp.makeStringEnv();
const factory = new gp.RuleFactory<string, ReturnType<typeof makeEnv>>();

// 3. Define a rule
const rule = factory
    .choice(c => c
        .orSequence(s => s
            .and(r => r.seqEqual("abc"))
            .and(r => r.seqEqual("def"))
        )
        .or(r => r.seqEqual("xyz"))
    )
    ;
    
// 4. Run the rule
const result = rule.match(0, "abcdef", makeEnv());
```

### Code example with `Array<number>`

```typescript
// 1. Import the library
import * as gp from "generic-parser";

// 2. Prepare a rule factory.
//     You can add environment variables as
//     `gp.makeEnv<...>()({ var1: ..., var2: ..., })`.
//     The environment variables can be accessed in action functions.
const makeEnv = () => gp.makeEnv<number[]>()();
// ^ Note that due to typing issues, you need two `()`s.
const factory = new gp.RuleFactory<number[], ReturnType<typeof makeEnv>>();

// 3. Define a rule
const rule = factory
    .choice(c => c
        .orSequence(s => s
            .and(r => r.seqEqual([0xAB, 0xCD]))
            .and(r => r.seqEqual([0xEF]))
        )
        .or(r => r.seqEqual([0x00]))
    )
    ;
    
// 4. Run the rule
const result = rule.match(0, [0xAB, 0xCD, 0xEF], makeEnv());
```

## Related libraries

`generic-parser` is inspired by [PEG.js](https://github.com/pegjs/pegjs) (Note: PEG.js is succeeded by [Peggy](https://github.com/peggyjs/peggy).). While `generic-parser` is not a parser-generator of [Parsing Expression Grammar (PEG)](https://en.wikipedia.org/wiki/Parsing_expression_grammar) unlike PEG.js or Peggy, `generic-parser` is designed to parse a sequence that complies with PEG.

## API references

- Note: This part is still under construction.

### `makeEnv<(typeof target)>()([options])` <br/> `makeStringEnv([options])`

Initializes a rule environment that will be passed through rules. You can pass options like `makeEnv<...>()({ var1: ... })` so that the variables can be accessed within action functions. `makeStringEnv()` is a special version of `makeEnv()()` for a `string` target.

```typescript
const makeEnv = () => gp.makeStringEnv();
// For number[]: const makeEnv = () => gp.makeEnv<number[]>()();
```

Note that you need two `()`s for `makeEnv`. This is due to the typing issue of TypeScript (as of version `4.6.3`) that you cannot bind the type arguments partially (c.f. [TypeScript PR #26349](https://github.com/microsoft/TypeScript/pull/26349)). The first `<...>()` binds the type of target sequence, and the second `()` infers the rest of the type parameters that include the type of rule environment.

### `Rule.match(offset, target, env)`

Runs the rule. 

- `offset: number` - an offset the matching starts at.
- `target: (typeof target)` - a target sequence.
- `env` - a rule environment.

```typescript
const result = rule.match(0, "abcdef", makeEnv());
```

The result contains the following propeties.

- `ok: boolean` - whether the target matched the rule or not. If `ok` is `true`, the result provides the following additional properties.
    - `value: (typeof target)` - the part of the target the rule matched.
    - `nextOffset: number` - the next offset following the part the rule matched.


### `RuleFactory`

A utility that generates rules. Once you initialized a `RuleFactory`, you can re-use it for several times.

```typescript
const factory = new gp.RuleFactory<number[], ReturnType<typeof makeEnv>>();
```

You can generate a rule using several methods provided by the `RuleFactory` instance.

```typescript
const rule = factory
    .seqEqual("abc")
    ;
```

#### `.anyOne()`

Generates a rule that matches any one item of the target sequence at the current offset.

```typescript
const rule = factory
    .anyOne()
    ;

const result = rule.match(0, "abcdef", makeEnv());
// result.ok: true, result.value: "a"
```

#### `.seqEqual(sequence)`

Generates a rule that matches an exact `sequence`.

- `sequence: (typeof target)` - an sequence that should exactly match at the current offset.

```typescript
const rule = factory
    .seqEqual("abc")
    ;

const result = rule.match(0, "abcdef", makeEnv());
// result.ok: true, result.value: "abc"
```

#### `.oneOf(items)`

Generates a rule that matches an exact item in `items`.

- `items: WithIncludes<(typeof target)[number]>` - the items one of that should exactly match at the current offset. `WithIncludes` is a type that has `.includes(item)` method, such as `Array` or `string`.

```typescript
const rule = factory
    .oneOf(["a", "b", "c"]) // can be replaced with "abc"
    ;

const result = rule.match(0, "abcdef", makeEnv());
// result.ok: true, result.value: "a"
```

#### `.regExp(re)` <br/> `.regExpObj(re)`

*For a `string` target only.* Generates a rule that matches an `RegExp` pattern `re`. `.regExp(re)` returns a matched `string` as the value, while `.regExpObj(re)` returns the object that `RegExp.exec()` returned.

- `re: RegExp` - a sequence that should exactly match at the current offset.

```typescript
const rule = factory
    .seqEqual(/^abc/) // Make sure "^" if you want to match at the current offset.
    ;

const result = rule.match(0, "abcdef", makeEnv());
// result.ok: true, result.value: "abc"
```

#### `.zeroOrOne((factory) => rule)`

Generates a rule that optionally matches the `rule`. Returns `undefined` as the matched value if the `rule` not matched.

```typescript
const rule = factory
    .zeroOrOne(r => r.seqEqual("abc")) // Note that `r` is a new RuleFactory
    ;

const result = rule.match(0, "abcdef", makeEnv());
// result.ok: true, result.value: "abc"
```

#### `.zeroOrMore((factory) => rule)` <br/> `.oneOrMore((factory) => rule)`

Generates a rule that matches the `rule` zero/one or more times. Those rules return a sequence of matched values as the result value.

```typescript
const rule = factory
    .oneOrMore(r => r.seqEqual("abc")) // Note that `r` is a new RuleFactory
    ;

const result = rule.match(0, "abcabcdef", makeEnv());
// result.ok: true, result.value: ["abc", "abc"]
```

#### `.nextIs((factory) => rule)` <br/> `.nextIsNot((factory) => rule)`

Generates a rule that matches/does not match the `rule`. Those rules do not forward the offset (do not consume the input) and return `undefined` as the result value.

```typescript
const rule = factory
    .nextIs(r => r.seqEqual("abc")) // Note that `r` is a new RuleFactory
    ;

const result = rule.match(0, "abcdef", makeEnv());
// result.ok: true, result.value: undefined
```

#### `.oneMatch(func)`

Generates a rule that matches when an [action function](#action-function-parameters) `func` returns a value other than `null`. The item at the current offset will be passed as `item` in the parameter options of [action function](#action-function-parameters) `func`. This rule forwards the offset by one (consumes one item), and returns the value returned by `func`.

```typescript
const rule = factory
    .oneMatch(({ item }) => {
        return (item === "a") ? "A" : null;
    })
    ;

const result = rule.match(0, "abcdef", makeEnv());
// result.ok: true, result.value: "A"
```

#### `.asSlice((factory) => rule)`

Generates a rule that matches the `rule`. This rule returns a matched slice of the target regardless of the type of the value of `rule`.

```typescript
const rule = factory
    .asSlice(r => r.oneOrMore("abc")) // Note that `r` is a new RuleFactory
    ;

const result = rule.match(0, "abcabcdef", makeEnv());
// result.ok: true, result.value: "abcabc"
```

#### `.sequence(s => s .and((factory) => rule1) .and((factory) => rule2) ...)`

Generates a rule that matches a sequence of `rule1`, `rule2`, ... This rule returns a sequence that consists of returned values of the contained rules.

An rule in the `.sequence()` is specified by the special method `.and((factory) => rule, [label])`.

- `label: string = null` - if specified, the match result value will be contained in the parameter object of the [action function](#action-function-parameters) with the name of the `label`.

If you want to omit a result from the resulting sequence, you can use `.andOmit((factory) => rule)` instead of `.and()`.

```typescript
const rule = factory
    .sequence(s => s
        .and(r => r.seqEqual("abc"))
        .andOmit(r => r.seqEqual("def")) // will be omitted from the result
        .and(r => r.seqEqual("ghi"))
    )
    ;

const result = rule.match(0, "abcdefghi", makeEnv());
// result.ok: true, result.value: ["abc", "ghi"]
```

You can specify an `.action(func)` at the last of rules. If the action speficied, the `.sequence()` rule returns the value that the [action function](#action-function-parameters) `func` returned.

```typescript
const rule = factory
    .sequence(s => s
        .and(r => r.seqEqual("abc"), "part1")
        .and(r => r.seqEqual("def"))
        .action(({ part1 }) => {
            return part1.toUpperCase();
        })
    )
    ;

const result = rule.match(0, "abcdef", makeEnv());
// result.ok: true, result.value: "ABC"
```

#### `.choice(c => c .or((factory) => rule1) .or((factory) => rule2) ...)`

Generates a rule that matches one of `rule1`, `rule2`, ... The `.choice` runs the contained rules in order and returns the first successful match.

An rule in the `.choice()` is specified by the special method `.or((factory) => rule)`. You can use `.orSequence(s => s.and...)` as a shorthand of `.or(r => r.sequence(s => s.and...))`.

```typescript
const rule = factory
    .choice(c => c
        .or(r => r.seqEqual("123")) // Not match
        .or(r => r.seqEqual("456")) // Not match
        .orSequence(s => s          // Match
            .and(r => r.seqEqual("abc"))
            .and(r => r.seqEqual("def"))
        )
        .or(r => r.seqEqual("xyz")) // Not to be run
    )
    ;

const result = rule.match(0, "abcdef", makeEnv());
// result.ok: true, result.value: ["abc", "def"]
```

#### `.assert(func)` <br/> `.assertNot(func)`

Generates a rule that matches when an [action function](#action-function-parameters) `func` returns truthy/falsy value. Those rules do not forward offset (do not consume the input) and return `undefined` as the result value.

```typescript
const rule = factory
    .sequence(s => s
        .and(r => r.seqEqual("abc"), "part1")
        .andOmit(r => r
            .assert(({ part1 }) => part1.startsWith("a"))
        )
        .and(r => r.seqEqual("def"))
    )
    ;

const result = rule.match(0, "abcdef", makeEnv());
// result.ok: true, result.value: ["abc", "def"]
```

<a id="action-function-parameters"></a>

### Action function

The action function used in such as `.assert(func)` and `.action(func)` will be called an object which contains the following variables.

- `offset: () => number`: a function that returns the current offset that matching of the current rule started.
- `range: () => [start: number, end: number]`: a function that returns the range of offsets that matched the rule. The range is half-open, so that `end` is the next offset of the matched part.
- `text: () => (typeof target)`: a function that returns the matched slice of the target. For example, it will return an `Array` if the input target is `Array`, and `string` if the input is `string`.

The parameter object will contain the variables that have been captured by the rules inside `.sequence()`.



