import babel from '@babel/core'

export default function babelRollupPlugin() {
	const babelOptions = {
		presets: [
			[
				'@babel/env',
				{
					modules: false,
				},
			],
		],
		env: {
			production: {
				presets: ['minify']
			}
		},
		sourceMaps: true,
	}

	function transform(pSource) {
		const transformed = babel.transformSync(pSource, babelOptions)

		return {
			code: transformed.code,
			map: transformed.map
		}
	}

	return {
		name: 'babel',
		transform,
	}
}