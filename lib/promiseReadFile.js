const path = require('path')
const fs = require('fs')

module.exports = function promiseReadFile(pPath) {
	const absolutePath = path.resolve(pPath)

	return new Promise((pResolve, pReject) => {
		fs.readFile(absolutePath, 'utf8', (pError, pContent) => {
			if (pError) {
				pReject(pError)
			} else {
				pResolve(pContent)
			}
		})
	})
}
