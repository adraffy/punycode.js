import {terser} from 'rollup-plugin-terser';

const TERSER = terser({
	compress: {
		toplevel: true,
		passes: 2, 
		dead_code: true
	}
});

export default {
	input: './index.js',
	output: [
		{
			file: './dist/index.js',
			format: 'es',
		},
		{
			file: './dist/index.min.js',
			format: 'es',
			plugins: [TERSER]
		},
		{
			file: './dist/index.cjs',
			format: 'cjs',
		},
	]
}
