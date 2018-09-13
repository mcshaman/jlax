const DEFAULT_OPTIONS = {
	viewPort: document,
	className: 'paralax',
	speed: 1,
}

export default class Paralax {
	constructor(pOptions) {
		const options = Object.assign({}, DEFAULT_OPTIONS, pOptions)

		if (options.viewPort === document) {
			options.viewPort = window
		}

		this._viewPort = options.viewPort
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

		const backgroundHeight = coverRatio > imageRatio ? coverRatio / imageRatio * pItem.coverHeight : pItem.coverHeight
		
		element.style.backgroundSize = `auto ${backgroundHeight}px`

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
			viewPort.style.position = 'relative'
		}

		const loadHandler = this._loadHandler
		this._items = [...document.getElementsByClassName(this._className)].map(pElement => {
			const backgroundImage = getComputedStyle(pElement).backgroundImage

			const image = new Image()
			image.src = backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/, '$1')
			image.addEventListener('load', loadHandler)

			return {
				element: pElement,
				ready: false,
				image,
				coverHeight: null,
			}
		})
	}

	deinitialise() {
		const viewPort = this._viewPort

		if (viewPort !== document) {
			viewPort.style.position = ''
			viewPort.style.overflowY = ''
		}

		this._viewPort.removeEventListener('scroll', this._scrollHandler)

		this._items.forEach(pItem => {
			pItem.style.backgroundSize = ''
			pItem.style.backgroundPositionY = ''
		})

		this._items = []
	}
}
