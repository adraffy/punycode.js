import {
	puny_decoded, puny_decode, 
	puny_encoded, puny_encoded_bytes, 
	is_surrogate, MAX_CP
} from '../index.js';

// https://datatracker.ietf.org/doc/html/rfc3492#section-7.1
const TESTS = [
	{
		name: 'Arabic (Egyptian)',
		decoded: '\u{644}\u{64A}\u{647}\u{645}\u{627}\u{628}\u{62A}\u{643}\u{644}\u{645}\u{648}\u{634}\u{639}\u{631}\u{628}\u{64A}\u{61F}',
		encoded: 'xn--egbpdaj6bu4bxfgehfvwxn',
	},
	{
		name: 'Chinese (simplified)',
		decoded: '\u{4ED6}\u{4EEC}\u{4E3A}\u{4EC0}\u{4E48}\u{4E0D}\u{8BF4}\u{4E2D}\u{6587}',
		encoded: 'xn--ihqwcrb4cv8a8dqg056pqjye',
	},
	{
		name: 'Chinese (traditional)',
		decoded: '\u{4ED6}\u{5011}\u{7232}\u{4EC0}\u{9EBD}\u{4E0D}\u{8AAA}\u{4E2D}\u{6587}',
		encoded: 'xn--ihqwctvzc91f659drss3x8bo0yb',
	},
	{
		name: 'Czech: Pro<ccaron>prost<ecaron>nemluv<iacute><ccaron>esky',
		decoded: '\u{50}\u{72}\u{6F}\u{10D}\u{70}\u{72}\u{6F}\u{73}\u{74}\u{11B}\u{6E}\u{65}\u{6D}\u{6C}\u{75}\u{76}\u{ED}\u{10D}\u{65}\u{73}\u{6B}\u{79}',
		encoded: 'xn--Proprostnemluvesky-uyb24dma41a',
	},
	{
		name: 'Hebrew',
		decoded: '\u{5DC}\u{5DE}\u{5D4}\u{5D4}\u{5DD}\u{5E4}\u{5E9}\u{5D5}\u{5D8}\u{5DC}\u{5D0}\u{5DE}\u{5D3}\u{5D1}\u{5E8}\u{5D9}\u{5DD}\u{5E2}\u{5D1}\u{5E8}\u{5D9}\u{5EA}',
		encoded: 'xn--4dbcagdahymbxekheh6e0a7fei0b'
	},
	{
		name: 'Hindi (Devanagari)',
		decoded: '\u{92F}\u{939}\u{932}\u{94B}\u{917}\u{939}\u{93F}\u{928}\u{94D}\u{926}\u{940}\u{915}\u{94D}\u{92F}\u{94B}\u{902}\u{928}\u{939}\u{940}\u{902}\u{92C}\u{94B}\u{932}\u{938}\u{915}\u{924}\u{947}\u{939}\u{948}\u{902}',
		encoded: 'xn--i1baa7eci9glrd9b2ae1bj0hfcgg6iyaf8o0a1dig0cd',
	},
	{
		name: 'Japanese (kanji and hiragana)',
		decoded: '\u{306A}\u{305C}\u{307F}\u{3093}\u{306A}\u{65E5}\u{672C}\u{8A9E}\u{3092}\u{8A71}\u{3057}\u{3066}\u{304F}\u{308C}\u{306A}\u{3044}\u{306E}\u{304B}',
		encoded: 'xn--n8jok5ay5dzabd5bym9f0cm5685rrjetr6pdxa',
	},
	{
		name: 'Korean (Hangul syllables)',
		decoded: '\u{C138}\u{ACC4}\u{C758}\u{BAA8}\u{B4E0}\u{C0AC}\u{B78C}\u{B4E4}\u{C774}\u{D55C}\u{AD6D}\u{C5B4}\u{B97C}\u{C774}\u{D574}\u{D55C}\u{B2E4}\u{BA74}\u{C5BC}\u{B9C8}\u{B098}\u{C88B}\u{C744}\u{AE4C}',
		encoded: 'xn--989aomsvi5e83db1d2a355cv1e0vak1dwrv93d5xbh15a0dt30a5jpsd879ccm6fea98c',
	},
	{
		name: 'Russian (Cyrillic)',
		decoded: '\u{43F}\u{43E}\u{447}\u{435}\u{43C}\u{443}\u{436}\u{435}\u{43E}\u{43D}\u{438}\u{43D}\u{435}\u{433}\u{43E}\u{432}\u{43E}\u{440}\u{44F}\u{442}\u{43F}\u{43E}\u{440}\u{443}\u{441}\u{441}\u{43A}\u{438}',
		encoded: 'xn--b1abfaaepdrnnbgefbaDotcwatmq2g4l', // D is capitalized for mixed-case
	},
	{
		name: 'Spanish: Porqu<eacute>nopuedensimplementehablarenEspa<ntilde>ol',
		decoded: '\u{50}\u{6F}\u{72}\u{71}\u{75}\u{E9}\u{6E}\u{6F}\u{70}\u{75}\u{65}\u{64}\u{65}\u{6E}\u{73}\u{69}\u{6D}\u{70}\u{6C}\u{65}\u{6D}\u{65}\u{6E}\u{74}\u{65}\u{68}\u{61}\u{62}\u{6C}\u{61}\u{72}\u{65}\u{6E}\u{45}\u{73}\u{70}\u{61}\u{F1}\u{6F}\u{6C}',
		encoded: 'xn--PorqunopuedensimplementehablarenEspaol-fmd56a',
	},
	{
		name: 'Vietnamese: T<adotbelow>isaoh<odotbelow>kh<ocirc>ngth<ecirchookabove>ch<ihookabove>n<oacute>iti<ecircacute>ngVi<ecircdotbelow>t',
		decoded: '\u{54}\u{1EA1}\u{69}\u{73}\u{61}\u{6F}\u{68}\u{1ECD}\u{6B}\u{68}\u{F4}\u{6E}\u{67}\u{74}\u{68}\u{1EC3}\u{63}\u{68}\u{1EC9}\u{6E}\u{F3}\u{69}\u{74}\u{69}\u{1EBF}\u{6E}\u{67}\u{56}\u{69}\u{1EC7}\u{74}',
		encoded: 'xn--TisaohkhngthchnitingVit-kjcr8268qyxafd2f1b9g',
	},
	{
		name: '3<nen>B<gumi><kinpachi><sensei>',
		decoded: '\u{33}\u{5E74}\u{42}\u{7D44}\u{91D1}\u{516B}\u{5148}\u{751F}',
		encoded: 'xn--3B-ww4c5e180e575a65lsy2b',
	},
	{
		name: '<amuro><namie>-with-SUPER-MONKEYS',
		decoded: '\u{5B89}\u{5BA4}\u{5948}\u{7F8E}\u{6075}\u{2D}\u{77}\u{69}\u{74}\u{68}\u{2D}\u{53}\u{55}\u{50}\u{45}\u{52}\u{2D}\u{4D}\u{4F}\u{4E}\u{4B}\u{45}\u{59}\u{53}',
		encoded: 'xn---with-SUPER-MONKEYS-pc58ag80a8qai00g7n9n',
	},
	{
		name: 'Hello-Another-Way-<sorezore><no><basho>',
		decoded: '\u{48}\u{65}\u{6C}\u{6C}\u{6F}\u{2D}\u{41}\u{6E}\u{6F}\u{74}\u{68}\u{65}\u{72}\u{2D}\u{57}\u{61}\u{79}\u{2D}\u{305D}\u{308C}\u{305E}\u{308C}\u{306E}\u{5834}\u{6240}',
		encoded: 'xn--Hello-Another-Way--fc4qua05auwb3674vfr0b',
	},
	{
		name: '<hitotsu><yane><no><shita>2',
		decoded: '\u{3072}\u{3068}\u{3064}\u{5C4B}\u{6839}\u{306E}\u{4E0B}\u{32}',
		encoded: 'xn--2-u9tlzr9756bt3uc0v',
	},
	{
		name: 'Maji<de>Koi<suru>5<byou><mae>',
		decoded: '\u{4D}\u{61}\u{6A}\u{69}\u{3067}\u{4B}\u{6F}\u{69}\u{3059}\u{308B}\u{35}\u{79D2}\u{524D}',
		encoded: 'xn--MajiKoi5-783gue6qz075azm5e',
	},
	{
		name: '<pafii>de<runba>',
		decoded: '\u{30D1}\u{30D5}\u{30A3}\u{30FC}\u{64}\u{65}\u{30EB}\u{30F3}\u{30D0}',
		encoded: 'xn--de-jg4avhby1noc0d',
	},
	{
		name: '<sono><supiido><de>',
		decoded: '\u{305D}\u{306E}\u{30B9}\u{30D4}\u{30FC}\u{30C9}\u{3067}',
		encoded: 'xn--d9juau41awczczp',
	},
	/*
	// this example is dumb
	{
		name: '-> $1.00 <-',
		decoded: '\u{2D}\u{3E}\u{20}\u{24}\u{31}\u{2E}\u{30}\u{30}\u{20}\u{3C}\u{2D}',
		encoded: '-> $1.00 <--'
	}
	*/
	{
		name: 'Node Example #1',
		decoded: 'mañana',
		encoded: 'xn--maana-pta',
	},
	{
		name: 'Node Example #2',
		decoded: '☃-⌘',
		encoded: 'xn----dqo34k',
	}
];
function explode_cp(s) {
	return [...s].map(c => c.codePointAt(0));
}
function same_array(a, b) {
	return Array.isArray(a) 
		&& Array.isArray(b) 
		&& a.length === b.length 
		&& a.every((x, i) => x === b[i]);
}
function removed_mixed_casing(s) {
	let pos = s.lastIndexOf('-') + 1;
	return s.slice(0, pos) + s.slice(pos).toLowerCase();
}
for (let test of TESTS) {
	let enc0 = explode_cp(removed_mixed_casing(test.encoded));
	let dec0 = explode_cp(test.decoded);
	let enc1;
	try {
		enc1 = puny_encoded_bytes(dec0);
	} catch (err) {
		enc1 = err;
	}
	let dec1;
	try {
		dec1 = puny_decoded(enc0);
	} catch (err) {
		dec1 = err;
	}
	try {
		if (!same_array(enc0, enc1)) throw new Error(`wrong encode`);
		if (!same_array(dec0, dec1)) throw new Error(`wrong decode`);
	} catch (err) {
		console.log({...test, enc0, enc1, dec0, dec1});
		throw err;
	}
}
console.log('PASS tests');

// test
function check(cps) {
	let enc1 = puny_encoded(cps);
	let enc2 = puny_encoded(String.fromCodePoint(...cps));
	if (enc1 !== enc2) throw new Error(`wrong encode`);
	let enc3 = puny_encoded_bytes(cps);
	if (!same_array(explode_cp(enc2), enc3)) throw new Error('wrong encode bytes');
	let dec1 = puny_decoded(enc1);
	let dec2 = puny_decoded(enc3);
	if (!same_array(cps, dec1)) throw new Error('wrong decode');
	if (!same_array(cps, dec2)) throw new Error('wrong decode');
	if (enc2.startsWith('xn--')) {
		let dec3 = puny_decode(enc3.slice(4));
		if (!same_array(cps, dec3)) throw new Error('wrong decode');
	}
}
function random_cp(crit_fn) {
	while (true) {
		let cp = Math.random() * (1+MAX_CP)|0;
		if (crit_fn(cp)) return cp;
	}
}
for (let not_surrogate = cp => !is_surrogate(cp), n = 1; n <= 24; n++) {
	let cps = Array(n);
	for (let r = 250_000/n|0; r; r--) {
		for (let i = 0; i < n; i++) {
			cps[i] = random_cp(not_surrogate);
		}
		check(cps);
	}
	console.log(`PASS random(${n})`);
}

// test
function for_each_cp(fn) {
	for (let cp = 0; cp <= MAX_CP; cp++) {
		let cps = fn(cp);
		let enc, dec;
		try {
			enc = puny_encoded_bytes(cps);
			dec = puny_decoded(enc);
			if (!same_array(cps, dec)) throw new Error(`wrong`);
		} catch (err) {
			console.log({cp, cps, enc, dec});
			throw err;
		}
	}
	console.log(`PASS exhaustive [${fn('$cp')}]`);
}
for_each_cp(cp => [cp]);
for_each_cp(cp => [0x61, cp]);
for_each_cp(cp => [cp, 0x61]);

console.log('OK');
