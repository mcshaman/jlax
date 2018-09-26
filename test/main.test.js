const root = require('app-root-path').toString()
const path = require('path')
const express = require('express')
const puppeteer = require('puppeteer')

let server
let browser
let page

// To do: move server to a single module for use in developlent, unit testing and running examples
function startServer() {
	const app = express()

	// To do: Compile the source on the fly
	app.use(express.static(path.resolve(root, 'dist')))
	app.use(express.static(path.resolve(root, 'test')))

	server = app.listen()
}

beforeAll(async () => {
	startServer()
	browser = await puppeteer.launch()
})

beforeEach(async () => {
	page = await browser.newPage()
	await page.goto(`http://localhost:${server.address().port}/main.html`)
})

afterEach(async () => {
	page.close()
})

afterAll(async () => {
	server.close()
	await browser.close()
})

test('event listener', async () => {
	await page.evaluate(() => {
		const jLax = new JLax()
		jLax.initalise()
	})

	const client = await page.target().createCDPSession()
	const {result} = await client.send('Runtime.evaluate', {expression: 'window'})
	const {listeners} = await client.send('DOMDebugger.getEventListeners', {objectId: result.objectId})
	
	expect(listeners).toHaveLength(1)
	expect(listeners[0].type).toBe('scroll')
})


test('evaluate background images', async pDone => {
	await page.exposeFunction('exposed', pAttributeName => {
		expect(pAttributeName).toBe('style')
		pDone()
	})

	await page.evaluate(() => {
		const element = document.createElement('div')
		element.classList.add('jlax')
		document.body.insertBefore(element, document.body.firstElementChild)

		const observer = new MutationObserver(pMutationList => {
			window.exposed(pMutationList[0].attributeName)
		})

		observer.observe(element, {attributes: true})

		const jLax = new JLax()
		jLax.initalise()
	})
})
