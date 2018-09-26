if (typeof window === undefined) {
	throw new Error('jLax is a browser only library') // To do: Write better error message
}

const DEFAULT_OPTIONS = {
	viewPort: document,
	className: 'jlax',
	speed: 1,
}

// To do: Make jLax a object factory function
module.exports = class JLax {
	// To do: JSDoc constructor parameters
	constructor(pOptions) {
		const options = Object.assign({}, DEFAULT_OPTIONS, pOptions)

		if (options.viewPort === document) {
			options.viewPort = window
		}

		this._viewPort = options.viewPort // To do: ensure calculations are correct relative to this object when paralax item is nested within other relative container elements
		this._viewPortHeight = null
		this._className = options.className
		this._speed = options.speed
		this._items = []
		this._scrollHandler = () => {
			requestAnimationFrame(this._render.bind(this))
		}
		this._loadHandler = (pEvent) => {
			pEvent.target.removeEventListener('load', this._loadHandler)
		
			this._initaliseItem(this._items.find(pItem => pItem.image === pEvent.target))
		}
	}

	_initaliseItem(pItem) {
		const {element, image} = pItem
		const elementWidth = element.clientWidth
		const elementHeight = element.clientHeight
		
		pItem.coverHeight = Math.max(this._viewPortHeight, elementHeight) * this._speed

		const coverRatio = elementWidth / pItem.coverHeight
		const imageRatio = image.width / image.height

		
		if (coverRatio > imageRatio) {
			element.style.backgroundSize = 'cover'
		} else {
			element.style.backgroundSize = `auto ${pItem.coverHeight}px`
		}

		const elementTop = element.offsetTop
		pItem.scrollEntry = elementTop - this._viewPortHeight
		pItem.scrollExit = elementTop + element.clientHeight
		pItem.ready = true

		requestAnimationFrame(this._render.bind(this))
	}

	_getViewPortScroll() {
		const viewPort = this._viewPort
		if (viewPort === window) {
			const element = document.documentElement
			return (window.pageYOffset || element.scrollTop) - (element.clientTop || 0)
		}

		return viewPort.scrollTop
	}

	_render() {
		const viewPortScroll = this._getViewPortScroll()
		const viewPortHeight = this._viewPortHeight

		this._items.forEach(pItem => {
			if (!pItem.ready || pItem.scrollEntry >= viewPortScroll || pItem.scrollExit <= viewPortScroll) {
				return
			}

			const elementHalf = pItem.element.clientHeight / 2
			const elementCentre = pItem.element.offsetTop + elementHalf
	
			const intersectRangeTop = viewPortScroll - elementHalf
			const intersectRangeHeight = viewPortHeight + pItem.element.clientHeight

			const elementCentreNormalised = elementCentre - intersectRangeTop
			const intersectRatio = (intersectRangeHeight - elementCentreNormalised) / intersectRangeHeight

			const heightDifference = pItem.coverHeight - viewPortHeight
				
			const backgroundOffsetNormalised = intersectRangeHeight * intersectRatio - pItem.coverHeight
				
			const difRatio = heightDifference * intersectRatio

			pItem.element.style.backgroundPositionY = `${backgroundOffsetNormalised + difRatio}px`
		})
	}

	initalise() {
		const viewPort = this._viewPort

		viewPort.addEventListener('scroll', this._scrollHandler)

		if (viewPort === window) {
			this._viewPortHeight = window.innerHeight
		} else {
			this._viewPortHeight = viewPort.clientHeight

			viewPort.style.overflowY = 'scroll'

			const {position} = getComputedStyle(viewPort)
			console.log(position)
			if (position !== 'absolute' && position !== 'relative') {
				console.log('done')
				viewPort.style.position = 'relative'
			}
		}

		const loadHandler = this._loadHandler
		const elements = document.getElementsByClassName(this._className) // To do: change docuemnt to viewport element to ensure items are nested

		this._items = [...elements].reduce((pItems, pElement) => {
			const backgroundImage = getComputedStyle(pElement).backgroundImage

			if (backgroundImage) {
				const pattern = /(?:url\(['"])((?:http(?:s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)*[\w\-._~:/?#[\]@!$&'()*+,;=.]+)(?:['"]\))/g
				const matches = pattern.exec(backgroundImage)

				if (matches) {
					const image = new Image()
					image.src = matches[1] // To do: cater for multiple background images
					image.addEventListener('load', loadHandler)

					pItems.push({
						element: pElement,
						ready: false, // To do: re-label to initalised
						image,
						coverHeight: null,
					})
				}
			}

			return pItems
		}, [])

		return this
	}

	deinitialise() {
		const viewPort = this._viewPort

		if (viewPort !== window) {
			viewPort.style.position = ''
			viewPort.style.overflowY = ''
		}

		this._viewPort.removeEventListener('scroll', this._scrollHandler)

		this._items.forEach(pItem => {
			pItem.element.style.backgroundSize = ''
			pItem.element.style.backgroundPositionY = ''
		})

		this._items = []

		return this
	}
}
