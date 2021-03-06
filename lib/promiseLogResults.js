/*eslint no-console: 0*/

module.exports = function promiseLogResalts(pResults) {
	const results = Array.isArray(pResults) ? pResults : [pResults]

	results.forEach(pResult => {
		console.log('Files processed:', pResult.sourceFiles)
		console.log('Files output:', pResult.outputFiles)
	})

	return Promise.resolve(pResults)
}