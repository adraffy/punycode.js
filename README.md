# punycode.js

0-dependancy low-level [Punycode](https://datatracker.ietf.org/doc/html/rfc3492) encoder/decoder without IDNA that works in the browser.

* [`2KB`](./dist/index.min.js) **Default** — full library

[**Demo**](https://adraffy.github.io/punycode.js/test/demo.html) ⭐️

```Javascript
import {puny_encoded, puny_decoded} from '@adraffy/punycode';
// npm i @adraffy/punycode
// browser: https://cdn.jsdelivr.net/npm/@adraffy/punycode@latest/dist/index.min.js

// (string|number[]) -> string
// input unicode string or codepoints
// returns string, prepends "xn--" if puny
// throws on error
puny_encoded('💩'); // "xn--ls8h"
puny_encoded([0x1F4A9]); // "xn--ls8h"

// pure ascii does not need encoded:
puny_encoded('abc');  // "abc"
puny_encoded([0x61,0x62,0x63]); // "abc"

// (string|TypedArray|number[]) -> number[]
// input ascii string or bytes
// decodes if puny ("xn--" prefix)
// returns array of unicode codepoints
// throws on error
puny_decoded([0x61,0x62,0x63]); // <61 62 63>
puny_decoded('xn--ls8h'); // <1F4A9>
```

Lower-level functions:
```Javascript
import {puny_encoded_bytes, puny_decode, is_surrogate} from '@adraffy/punycode';

// (string|number[]) -> number[]
// input unicode string or codepoints
// returns array of bytes, prepends "xn--" if puny
// throws on error
puny_encoded_bytes("abc"); // <61 62 63>
puny_encoded_bytes([0x1F4A9]); // <78 6E 2D 2D 6C 73 38 68>
// note: always returns a copy

// (string|TypedArray|number[]) -> number[]
// input ascii string or bytes
// always decodes as puny
// throws on error
puny_decode([0x6C,0x73,0x38,0x68]); // <1F4A9>
puny_decode('ls8h'); // <1F4A9>
// note: always returns a copy

// number -> bool
// return true if codepoint is surrogate
is_surrogate(0x61); // "a" => false
is_surrogate(0xDFFF); // true
```

Use caution when converting decoded codepoints to a string:
```Javascript
let str0 = '💩'; 
// two different encodings
let enc0 = puny_encoded(str0); // "xn--ls8h"
let enc1 = puny_encoded([str0.charCodeAt(0), str0.charCodeAt(1)]); // "xn--8c9by4f"
// two different decodings
let dec0 = puny_decoded(enc0); // <1F4A9>
let dec1 = puny_decoded(enc1); // <D83D DCA9>
// however, equal strings
str0 === String.fromCodePoint(...dec0); // true
str0 === String.fromCodePoint(...dec1); // true

// check "roundtrip" (recommended)
// decoded(encoded(decoded(x))) == x
if (puny !== puny_decoded(puny_encoded(puny_decoded(puny)))) {
	throw new Error('roundtrip mismatch');
}
// or, check for surrogates:
if (decoded.some(is_surrogate)) {
	throw new Error('contains surrogates');
}
```

## Build

* `npm run test` &mdash; run [tests](./test/)
* `npm run build` &mdash; creates [`/dist/`](./dist/)
