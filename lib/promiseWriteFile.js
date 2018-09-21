const root = require('app-root-path').toString()
const path = require('path')
const fs = require('fs')
const promiseMakeDir = require(path.resolve(root, 'build/promiseMakeDir'))

module.exports = function promiseWriteFile(pPath, pContent) {
	const absolutePath = path.resolve(pPath)

	return promiseMakeDir(path.dirname(absolutePath))
		.then(() => {
			return new Promise((pReslove, pReject) => {
				fs.writeFile(absolutePath, pContent, pError => {
					if (pError) {
						pReject(pError)
					} else {
						pReslove(absolutePath)
					}
				})
			})
		})
}
