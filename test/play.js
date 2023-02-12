import {puny_encoded, puny_encoded_bytes, puny_decoded} from '../index.js';

console.log(puny_encoded("abc"));
console.log(puny_encoded([0x61, 0x62, 0x63]));

console.log(puny_encoded("💩"));
console.log(puny_encoded([0x1F4A9]));

console.log(puny_encoded_bytes("abc"));
console.log(puny_encoded_bytes([0x1F4A9]));

console.log(puny_decoded([0x61,0x62,0x63]));
console.log(puny_decoded('xn--ls8h'));
console.log(puny_decoded('ls8h', true));
