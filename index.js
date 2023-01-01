// https://datatracker.ietf.org/doc/html/rfc3492

// overflow calculation:
// https://datatracker.ietf.org/doc/html/rfc3492#section-6.4
// max unicode = 0x10FFFF => 21 bits
// max safe int = 53 bits (same as string length)
// (32 - 21) => 11-bit label length => 2KB unsigned
// (53 - 21) => 32-bit label length => 4GB unsigned
// decision: use IEEE-754 math, ignore bounds check

// Bootstring for Punycode
// https://datatracker.ietf.org/doc/html/rfc3492#section-5
const BASE = 36; 
const T_MIN = 1;
const T_MAX = 26;
const SKEW = 38;
const DAMP = 700;
const BIAS = 72;
const MIN_CP = 128;
const MAX_CP = 0x10FFFF;
const SHIFT_BASE = BASE - T_MIN;
const MAX_DELTA = SHIFT_BASE * T_MAX >> 1;
const CP_HYPHEN = 0x2D;
const CP_X = 0x78; // "x"
const CP_N = 0x6E; // "n"

// 41..5A (A-Z) =  0 to 25, respectively
// 61..7A (a-z) =  0 to 25, respectively
// 30..39 (0-9) = 26 to 35, respectively

// An encoder SHOULD output only uppercase forms or only lowercase forms
// => lowercase
function cp_from_basic(x) {
	return x < 26 ? 97 + x : 22 + x;
}

// A decoder MUST recognize the letters in both uppercase and lowercase
// forms (including mixtures of both forms).
function basic_from_cp(cp) {
	if (cp <= 90) {
		if (cp >= 65) { // [A-Z] => 0-25
			return cp - 65;
		} else if (cp >= 48 && cp <= 57) { 
			return cp - 22; // [0-9] => 26-35
		}
	} else if (cp >= 97 && cp <= 122) { 
		return cp - 97; // [a-z] => 0-25
	}
	throw new Error(`not alphanumeric ASCII: 0x${cp.toString(16)}`);
}

function trim_bias(k, bias) {
	let delta = k - bias;
	return delta <= 0 ? T_MIN : delta >= T_MAX ? T_MAX : delta;
}

// https://datatracker.ietf.org/doc/html/rfc3492#section-6.1
function adapt(delta, n, first) {
	delta = Math.floor(delta / (first ? DAMP : 2));
	delta += Math.floor(delta / n);
	let k = 0;
	while (delta > MAX_DELTA) {
		delta = Math.floor(delta / SHIFT_BASE);
		k += BASE;
	}
	return k + Math.floor((1 + SHIFT_BASE) * delta / (delta + SKEW));
}

function explode_cp(s) {
	return [...s].map(x => x.codePointAt(0));
}

// number[]|str -> str 
// prepends prefix if encoded
export function puny_encoded(x) {
	if (typeof x === 'string') {
		let cps = explode_cp(x);
		let enc = encode(cps, true);
		return cps === enc ? x : String.fromCharCode(...enc);
	} else {
		return String.fromCharCode(...puny_encode(x, true));
	}
}

// number[] -> number[] 
// if encoded, returns new array
// if encoded and add_prefix, prepends "xn--"
export function puny_encode(cps, prefixed) {
	if (!Array.isArray(cps) || !cps.every(cp => cp >= 0 && cp <= MAX_CP)) {
		throw new TypeError(`expected array of Unicode codepoints`);
	}
	return encode(cps, prefixed);
}

// https://datatracker.ietf.org/doc/html/rfc3492#section-6.3
// number[] -> number[]
// does not restrict ascii [0, MIN_CP)
// returns unchanged if not required
function encode(cps, prefixed) {
	let ret = cps.filter(cp => cp < MIN_CP);
	let basic = ret.length;
	if (basic == cps.length) return cps; // puny not needed
	if (prefixed) ret.splice(0, 0, CP_X, CP_N, CP_HYPHEN, CP_HYPHEN);
	if (basic) ret.push(CP_HYPHEN);
	let cp0 = MIN_CP;
	let bias = BIAS;
	let delta = 0;
	let pos = basic;
	while (pos < cps.length) {
		let cp1 = cps.reduce((min, cp) => cp >= cp0 && cp < min ? cp : min, MAX_CP);
		delta += (cp1 - cp0) * (pos + 1);
		for (let cp of cps) {
			if (cp < cp1) {
				delta++;
			} else if (cp == cp1) {
				let q = delta;
				for (let k = BASE; ; k += BASE) {
					let t = trim_bias(k, bias);
					let q_t = q - t;
					if (q_t < 0) break;
					let base_t = BASE - t;
					ret.push(cp_from_basic(t + (q_t % base_t)));
					q = Math.floor(q_t / base_t);
				}
				ret.push(cp_from_basic(q));
				bias = adapt(delta, pos + 1, pos == basic);
				delta = 0;
				pos++;
			}
		}
		delta++;
		cp0 = cp1 + 1;
	}
	return ret;
}

// check for "xn--"
function has_label_ext(v) {
	return v.length >= 4 
		&& (v[0] == CP_X || v[0] == 88) // xX
		&& (v[1] == CP_N || v[1] == 78) // nN
		&& v[2] == CP_HYPHEN
		&& v[3] == CP_HYPHEN;
}

// number[]|Uint8Array|string -> string
// decodes only if "xn--" is present
// always returns string
export function puny_decoded(x) {
	if (typeof x === 'string') {
		let cps = explode_cp(x);
		if (cps.every(cp => cp < MIN_CP)) {
			if (!has_label_ext(cps)) return x; // return as-is
			return decode_str(cps.slice(4));
		}
	} else if (ArrayBuffer.isView(x)) { // this is safe for all views, we just need [0,127]
		if (x.every(cp => cp >= 0 && cp < MIN_CP)) {
			if (!has_label_ext(x)) return String.fromCharCode(...x); // pure ascii
			return decode_str(x.subarray(4));
		}
	} else if (Array.isArray(x)) {
		if (x.every(cp => cp >= 0 && cp < MIN_CP)) {
			if (!has_label_ext(x)) return String.fromCharCode(...x); // pure ascii
			return decode_str(x.slice(4));
		}
	}
	throw new TypeError(`expected ASCII`);
}

// number[] -> number[]
// assumes puny-encoding
export function puny_decode(cps) {
	if (ArrayBuffer.isView(cps)) {
		if (cps.every(cp => cp >= 0 && cp < MIN_CP)) {
			return decode(cps);
		}
	} else if (Array.isArray(cps)) {
		if (cps.every(cp => Number.isSafeInteger(cp) && cp >= 0 && cp < MIN_CP)) {
			return decode(cps);
		}
	}
	throw new TypeError(`expected array of ASCII codepoints`);
}

// https://datatracker.ietf.org/doc/html/rfc3492#section-6.2
// does not restrict ascii part
// does not validate input (unsafe)
function decode_str(cps) {
	return String.fromCodePoint(...decode(cps));
}
function decode(cps) {
	let pos = cps.lastIndexOf(CP_HYPHEN) + 1; // start or past last hyphen
	let end = Math.max(0, pos - 1); // empty or before hyphen
	let ret = ArrayBuffer.isView(cps) ? [...cps.subarray(0, end)] : cps.slice(0, end);
	let i = 0;
	let cp = MIN_CP;
	let bias = BIAS;
	while (pos < cps.length) {
		let prev = i;
		let w = 1;
		let k = BASE;
		while (true) {
			let basic = basic_from_cp(cps[pos++]);
			i += basic * w;
			let t = trim_bias(k, bias);
			if (basic < t) break;
			if (pos >= cps.length) throw new Error(`invalid encoding`);
			w *= BASE - t;
			k += BASE;
		}
		let len = ret.length + 1;
		bias = adapt(i - prev, len, prev == 0);
		cp += Math.floor(i / len);		
		if (cp > MAX_CP) throw new Error(`invalid encoding`);
		i %= len;
		ret.splice(i++, 0, cp);
	}	
	return ret;
}
