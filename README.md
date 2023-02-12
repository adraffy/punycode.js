# punycode.js

0-dependancy low-level [Punycode](https://datatracker.ietf.org/doc/html/rfc3492) encoder/decoder without IDNA that works in the browser.

* [`2KB`](./dist/index.min.js) **Default** — full library

[Demo](https://adraffy.github.io/punycode.js/test/demo.html)

```Javascript
import {puny_encoded, puny_encoded_bytes, puny_decoded} from '@adraffy/punycode';
// npm i @adraffy/punycode
// browser: https://cdn.jsdelivr.net/npm/@adraffy/punycode@latest/dist/index.min.js

// (string:number[]) -> string
// input unicode string or codepoints
// returns string with "xn--" if puny
// throws on error
puny_encoded('abc');  // "abc"
puny_encoded([0x61,0x62,0x63]);  // "abc"

puny_encoded('💩'); // "xn--ls8h"
puny_encoded([0x1F4A9]); // "xn--ls8h"

// (string|number[]) -> number[]
// input unicode string or codepoints
// returns array of bytes with "xn--" (0x786E2D2D)
// (always returns a copy)
// throws on error
puny_encoded_bytes("abc"); // [0x61,0x62,0x63]
puny_encoded_bytes([0x1F4A9]); // [0x78,0x6E,0x2D,0x2D,0x6C,0x73,0x38,0x68]

// (string|TypedArray|number[], force?:boolean) -> number[]
// input ascii string or bytes
// returns array of unicode codepoints
// throws on error
puny_decoded([0x61,0x62,0x63]); // [0x61,0x62,0x63]
puny_decoded('xn--ls8h'); // [0x1F4A9]
puny_decoded('ls8h', true); // [0x1F4A9]

// to convert decoded to sting: 
String.fromCodePoint(...puny_decoded('xn--ls8h')); // "💩"
// note: you should check for surrogates
// note: you should check: decoded(encoded(decoded(x))) == x
```

## Build

* `npm run test` &mdash; run tests
* `npm run build` &mdash; create `/dist/`
