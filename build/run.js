/*eslint no-console: 0*/
const root = require('app-root-path').toString()
const path = require('path')
const minimist = require('minimist')
const del = require('del')
const express = require('express')
const createError = require('http-errors')
const promiseProcessJs = require(path.resolve(root, 'lib/promiseProcessJs'))
const promiesLogResults = require(path.resolve(root, 'lib/promiseLogResults'))

const BUILD_DIRECTORY = 'dist'
const EXAMPLES_DIRECTORY = 'examples'
const SOURCE_DIRECTORY = 'lib'
const ENTRY_POINT = 'jlax.js'
const GLOBAL_NAME = 'JLax'
const SERVER_PORT = 5000

const argv = minimist(process.argv.slice(2))

const task = argv.task || 'default'

const production = process.env.NODE_ENV ? true : false

const tasks = {
	default: function () {
		return tasks.del()
			.then(tasks.js)
	},

	del: function () {
		const directory = BUILD_DIRECTORY
	
		return del([path.join(directory, '**'), `!${directory}`])
			.then(pFiles => {
				console.log('Deleted:', pFiles)
	
				return Promise.resolve(pFiles)
			})
	},

	js: function () {
		const inputPath = path.join(SOURCE_DIRECTORY, ENTRY_POINT)
		const options = {
			global: GLOBAL_NAME,
		}

		if (production) {
			options.destination = BUILD_DIRECTORY
		}

		return promiseProcessJs(inputPath, options)
			.then(promiesLogResults)
	},

	serve: function () {
		const server = express()

		server.get(`/${ENTRY_POINT}`, (pRequest, pResponse) => {
			pResponse.type('application/javascript')

			tasks.js()
				.then(pResult => {
					const {code} = pResult
					const map = pResult.map.toUrl()
					return pResponse.send(`${code}\n//# sourceMappingURL=${map}`)
				})
		})

		server.use(express.static(path.resolve(EXAMPLES_DIRECTORY)))

		// catch 404 and forward to error handler
		server.use((pRequest, pResponse, pNext) => {
			pNext(createError(404))
		})
	
		// error handler
		server.use(function (pError, pRequest, pResponse) {
			// set locals, only providing error in development
			pResponse.locals.message = pError.message
			pResponse.locals.error = production ? {} : pError
	
			// render the error page
			pResponse.status(pError.status || 500)
			pResponse.render('error')
		})
	
		const port = SERVER_PORT
		server.listen(port, () => console.log(`HTTP server running on port ${port}`))
	
		return Promise.resolve(server)
	},
}

if (tasks[task]) {
	tasks[task]()
		.catch(pError => {
			console.error(pError)
		})
} else {
	console.error(`Error: no such task '${task}'`)
}