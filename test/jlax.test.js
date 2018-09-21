const root = require('app-root-path').toString()
const path = require('path')
const express = require('express')
const puppeteer = require('puppeteer')
const promiseReadFile = require(path.resolve(root, 'build/promiseReadFile'))

const HTML_TEMPLATE =
`<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="X-UA-Compatible" content="ie=edge">
	<title>Document</title>
</head>
<body>
<script src="/jlax.test.mjs"></script>
</body>
</html>`

let server
let browser
let page

function startServer() {
	const app = express()
	app.get('/', (pRequest, pResponse) => pResponse.send(HTML_TEMPLATE))

	app.get(/\/.+/, async (pRequest, pResponse) => {
		const directory = path.dirname(pRequest.path).substr(1)
		const file = path.basename(pRequest.path)
		const urlPath = path.join(directory, file)
		pResponse.send(await promiseReadFile(urlPath))
	})

	server = app.listen()
}

function stopServer() {
	server.close()
}

async function openBrowser() {
	browser = await puppeteer.launch({headless: false})
}

async function closeBrowser() {
	await browser.close()
}

async function loadPage() {
	page = await browser.newPage()
	await page.goto(`http://localhost:${server.address().port}/`)
}

beforeAll(async () => {
	startServer()
	await openBrowser()
	await loadPage()
	
})

afterAll(async () => {
	stopServer()
	await closeBrowser()
})

test('foo', async () => {
	const html = await page.$eval('body', pElement => pElement.innerHTML)
	expect('bar').toBe('bar')
})
