# punycode.js

0-dependancy low-level [Punycode](https://datatracker.ietf.org/doc/html/rfc3492) encoder/decoder without IDNA that works in the browser.

* [`2KB`](./dist/index.min.js) **Default** — full library

[Demo](https://adraffy.github.io/punycode.js/test/demo.html)

```Javascript
import {puny_encode, puny_decode} from '@adraffy/punycode';
// npm i @adraffy/punycode
// browser: https://unpkg.com/@adraffy/punycode@latest/dist/index.min.js

// (number[], prefixed: bool) -> number[]
// input any array of codepoints
// returns same array (punycode not needed) or encoded codepoints 
// if prefixed, prepends "xn--"
// throws on error
puny_encode([65, 66, 67]);   // [65, 66, 67] <== same!
puny_encode([128169]);       // [108, 115, 56, 104]
puny_encode([128169], true); // [120, 110, 45, 45, 108, 115, 56, 104]

// number[] -> number[]
// input any known puny_encoded array of codepoints
// eg. xn--<this part>
// returns decoded codepoints 
// throws on error
puny_decode([108, 115, 56, 104]); // [128169]
```

### Prefixed Strings
```Javascript
import {puny_encoded, puny_decoded} from '@adraffy/punycode';

// string|number[] -> string
puny_encoded("abc") == puny_encoded([65, 66, 67]) == "abc";
puny_encoded("💩") == puny_encoded([128169]) == "xn--ls8h";

// string|number[]|ArrayBufferView -> string
puny_decoded("abc") == puny_decoded([65, 66, 67]) == "abc";

// the following return "💩"
puny_decoded("xn--ls8h");
puny_decoded([120, 110, 45, 45, 108, 115, 56, 104]);
puny_decoded(new Uint8Array([120, 110, 45, 45, 108, 115, 56, 104]));
```

## Build

* `npm run test` &mdash; run tests
* `npm run build` &mdash; create `/dist/`
