if (typeof window === undefined) {
	throw new Error('jLax is a browser only library') // To do: Write better error message
}

const DEFAULT_OPTIONS = {
	scroller: document,
	elements: '.jlax',
	speed: 1,
}

function nullifyProperties(pThis) {
	pThis._items = null
	pThis._scroller = null
	pThis._scrollerHeight = null
	pThis._speed = null
}

module.exports = class JLax {
	// To do: JSDoc constructor parameters

	constructor(pOptions) {
		this.options = Object.assign({}, DEFAULT_OPTIONS, pOptions)

		nullifyProperties(this)

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
		
		pItem.coverHeight = Math.max(this._scrollerHeight, elementHeight) * this._speed

		const coverRatio = elementWidth / pItem.coverHeight
		const imageRatio = image.width / image.height

		
		if (coverRatio > imageRatio) {
			element.style.backgroundSize = 'cover'
		} else {
			element.style.backgroundSize = `auto ${pItem.coverHeight}px`
		}

		const elementTop = element.offsetTop
		pItem.scrollEntry = elementTop - this._scrollerHeight
		pItem.scrollExit = elementTop + element.clientHeight
		pItem.ready = true

		requestAnimationFrame(this._render.bind(this))
	}

	_getScrollerPosition() {
		if (this._scroller === window) {
			const element = document.documentElement
			return (window.pageYOffset || element.scrollTop) - (element.clientTop || 0)
		}

		return this._scroller.scrollTop
	}

	_render() {
		const scrollerPosition = this._getScrollerPosition()

		this._items.forEach(pItem => {
			if (!pItem.ready || pItem.scrollEntry >= scrollerPosition || pItem.scrollExit <= scrollerPosition) {
				return
			}

			const elementHalf = pItem.element.clientHeight / 2
			const elementCentre = pItem.element.offsetTop + elementHalf
	
			const intersectRangeTop = scrollerPosition - elementHalf
			const intersectRangeHeight = this._scrollerHeight + pItem.element.clientHeight

			const elementCentreNormalised = elementCentre - intersectRangeTop
			const intersectRatio = (intersectRangeHeight - elementCentreNormalised) / intersectRangeHeight

			const heightDifference = pItem.coverHeight - this._scrollerHeight
				
			const backgroundOffsetNormalised = intersectRangeHeight * intersectRatio - pItem.coverHeight
				
			const difRatio = heightDifference * intersectRatio

			pItem.element.style.backgroundPositionY = `${backgroundOffsetNormalised + difRatio}px`
		})
	}

	initalise() {
		const {options} = this

		this._speed = options.speed
		this._scroller = options.scroller === document ? window : options.scroller // To do: ensure calculations are correct relative to this object when paralax item is nested within other relative container elements

		this._scroller.addEventListener('scroll', this._scrollHandler)

		if (this._scroller === window) {
			this._scrollerHeight = window.innerHeight
		} else {
			this._scrollerHeight = this._scroller.clientHeight

			this._scroller.style.overflowY = 'scroll'

			const {position} = getComputedStyle(this._scroller)
			if (position !== 'absolute' && position !== 'relative') {
				this._scroller.style.position = 'relative'
			}
		}

		let elements
		if (typeof options.elements === 'string') {
			const scrollerElement = options.scroller === window ? document : options.scroller
			elements = [...scrollerElement.querySelectorAll(options.elements)]
		} else {
			elements = options.elements
		}

		this._items = elements.reduce((pItems, pElement) => {
			const {backgroundImage} = getComputedStyle(pElement)

			if (backgroundImage) {
				const pattern = /(?:url\(['"])((?:http(?:s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)*[\w\-._~:/?#[\]@!$&'()*+,;=.]+)(?:['"]\))/g
				const matches = pattern.exec(backgroundImage)

				if (matches) {
					const image = new Image()
					image.src = matches[1] // To do: cater for multiple background images
					image.addEventListener('load', this._loadHandler)

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
		if (this._scroller !== window) {
			this._scroller.style.position = ''
			this._scroller.style.overflowY = ''
		}

		this._scroller.removeEventListener('scroll', this._scrollHandler)

		this._items.forEach(pItem => {
			pItem.element.style.backgroundSize = ''
			pItem.element.style.backgroundPositionY = ''
		})

		nullifyProperties(this)

		return this
	}
}