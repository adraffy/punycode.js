import {
	puny_decode, puny_decoded,
	puny_encode, puny_encoded
} from '../index.js';


console.log(puny_encode([65, 66, 67])); 
console.log(puny_encoded("abc"));

console.log(puny_encode([128169]));
console.log(puny_encoded("💩"));

console.log(puny_decode([108, 115, 56, 104])); 
console.log(puny_decoded('xn--ls8h'));


console.log([
	puny_encoded("abc"),
	puny_encoded("💩")
]);

console.log([
	puny_decoded("abc"),
	puny_decoded("xn--ls8h"),
	puny_decoded(new Uint8Array([120, 110, 45, 45, 108, 115, 56, 104]))
])