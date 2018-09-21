const root = require('app-root-path').toString()
const rollup = require('rollup')
const path = require('path')
const babelPlugin = require(path.resolve(root, 'lib/babelRollupPlugin'))
const commonjs = require('rollup-plugin-commonjs')



module.exports = function promiseProcessJs(pPath, pOptions = {}) {
	return rollup.rollup({
		input: pPath,
		treeshake: false,
		plugins: [
			babelPlugin(),
			commonjs(),
		],
	})
		.then(pBundle => {
			const basename = path.basename(pPath, path.extname(pPath))

			const outputOptions = {
				dir: pOptions.destination || null,
				file: `${basename}.js`,
				format: 'iife',
				name: pOptions.global || basename.replace(/[^\w\d]/g, ''),
				sourcemap: true,
			}

			if (outputOptions.dir) {
				return pBundle.write(outputOptions)
			}

			return pBundle.generate(outputOptions)
		})
		.then(pResult => {
			const outputFiles = []

			if (pOptions.destination) {
				outputFiles.push(path.resolve(pOptions.destination, pResult.fileName))
				outputFiles.push(`${outputFiles[0]}.map`)
			}

			return Promise.resolve({
				entryPoint: path.resolve(pPath),
				sourceFiles: Object.keys(pResult.modules),
				outputFiles,
				code: pResult.code,
				map: pResult.map,
			})
		})
}
