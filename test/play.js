import {puny_encoded, puny_encoded_bytes, puny_decoded, puny_decode, is_surrogate} from '../index.js';

console.log('puny_encoded');
console.log(puny_encoded("abc"));
console.log(puny_encoded([0x61, 0x62, 0x63]));
console.log();
console.log(puny_encoded("💩"));
console.log(puny_encoded([0x1F4A9]));

console.log();
console.log('puny_encoded_bytes');
console.log(puny_encoded_bytes("abc"));
console.log(puny_encoded_bytes([0x1F4A9]));

console.log();
console.log('puny_decoded');
console.log(puny_decoded([0x61,0x62,0x63]));
console.log(puny_decoded('xn--ls8h'));

console.log();
console.log('puny_decode');
console.log(puny_decode([0x6C,0x73,0x38,0x68]));
console.log(puny_decode('ls8h'));

console.log();
console.log('is_surrogate');
console.log(is_surrogate(0x61));
console.log(is_surrogate(0xDFFF));

console.log();
console.log('surrogate example');

let str = '💩'; 
let enc0 = puny_encoded(str);
let enc1 = puny_encoded([str.charCodeAt(0), str.charCodeAt(1)]); 

let dec0 = puny_decoded(enc0);
let dec1 = puny_decoded(enc1); 

let str0 = String.fromCodePoint(...dec0);
let str1 = String.fromCodePoint(...dec1);

console.log({enc0, enc1, dec0, dec1, same0: str0 === str, same1: str1 === str});
