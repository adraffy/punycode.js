# punycode.js

0-dependancy low-level Punycode encoder/decoder that works in the browser. 

```Javascript
import {puny_encode, puny_decode} from '@adraffy/punycode';
// browser: https://unpkg.com/@adraffy/punycode@latest/dist/index.min.js

// puny_encode 
// input any array of codepoints
// returns same array (punycode not needed) or encoded codepoints 
// throws on error
console.log(puny_encode([65, 66, 67])); // "ABC"
// [65, 66, 67] === "ABC" <same>
console.log(puny_encode([128169])); // "💩"
// [108, 115, 56, 104] == "ls8h" 

// puny_decode 
// input any known puny_encoded array of codepoints
// eg. xn--<this part>
// returns decoded unicode codepoints 
// throws on error
console.log(puny_decode([108, 115, 56, 104])); // "ls8h"
// [128169] == "💩"
```

## Build

* `npm run test` &mdash; run tests
* `npm run build` &mdash; create `/dist/`