const DEFAULT_OPTIONS = {
	viewPort: document,
	className: 'paralax',
	speed: 1,
}

export default class Paralax {
	constructor(pOptions) {
		const t = this
		const options = Object.assign({}, DEFAULT_OPTIONS, pOptions)

		if (options.viewPort === document) {
			options.viewPort = window
		}

		t._viewPort = options.viewPort
		t._viewPortScroll = null
		t._viewPortHeight = null
		t._className = options.className
		t._speed = options.speed
		t._elements = []
		t._scrollHandler = () => {
			requestAnimationFrame(() => t._render())
		}
		t._loadHandler = (pEvent) => {
			pEvent.target.removeEventListener(t._loadHandler)

			const elementHeight = pElement.clientHeight
			let height = viewPortHeight > elementHeight ? viewPortHeight : elementHeight

			pElement.style.backgroundSize = `auto ${height * t._speed}px`

			requestAnimationFrame(render)
		}
	}

	_render() {
		const t = this

		t._elements.forEach(pElement => {
			const elementHalf = pElement.clientHeight / 2
			const elementCentre = pElement.offsetTop + elementHalf
	
			const intersectRangeTop = t._viewPortScroll - elementHalf
			const intersectRangeHeight = t._viewPortHeight + pElement.clientHeight

			const elementCentreNormalised = elementCentre - intersectRangeTop
			const intersectRatio = (intersectRangeHeight - elementCentreNormalised) / intersectRangeHeight
	
			const backgroundImageHeight = parseFloat(pElement.style.backgroundSize.split(' ')[1])

			const heightDifference = backgroundImageHeight - t._viewPortHeight
				
			const backgroundOffsetNormalised = intersectRangeHeight * intersectRatio - backgroundImageHeight
				
			const difRatio = heightDifference * intersectRatio
	
			pElement.style.backgroundPositionY = `${backgroundOffsetNormalised + difRatio}px`
		})
	}

	initalise() {
		const t = this
		const viewPort = t._viewPort

		if (t._viewPort === window) {
			const element = document.documentElement
			t._viewPortScroll = (window.pageYOffset || element.scrollTop) - (element.clientTop || 0)
			t._viewPortHeight = window.innerHeight
		} else {
			t._viewPortScroll = viewPort.scrollTop
			t._viewPortHeight = viewPort.clientHeight
		}

		t._elements = [...document.getElementsByClassName(t._className)].map(pElement => {
			const backgroundImage = getComputedStyle(pElement).backgroundImage
			const image = new Image()
			image.src = backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/, '$1')
			image.addEventListener('load', t._loadHandler)

			return {
				element: pElement,
				image
			}
		})

		viewPort.addEventListener('scroll', t._scrollHandler)

		if (viewPort !== window) {
			viewPort.style.overflow = 'scroll'
			viewPort.style.position = 'relative'
		}

		t._render()
	}

	deinitialise() {
		const t = this

		const viewPort = t._viewPort

		if (viewPort !== document) {
			viewPort.style.position = ''
			viewPort.style.overflow = ''
		}

		t._viewPort.removeEventListener('scroll', t._scrollHandler)

		t._elements.forEach(pElement => {
			pElement.style.backgroundSize = ''
			pElement.style.backgroundPositionY = ''
		})
		t._elements = []
	}
}
