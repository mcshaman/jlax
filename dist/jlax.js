var JLax = (function () {
	'use strict';

	function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

	function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

	function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

	function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

	function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

	var DEFAULT_OPTIONS = {
	  viewPort: document,
	  className: 'jlax',
	  speed: 1
	};

	var jlax =
	/*#__PURE__*/
	function () {
	  function JLax(pOptions) {
	    var _this = this;

	    _classCallCheck(this, JLax);

	    var options = Object.assign({}, DEFAULT_OPTIONS, pOptions);

	    if (options.viewPort === document) {
	      options.viewPort = window;
	    }

	    this._viewPort = options.viewPort;
	    this._viewPortHeight = null;
	    this._className = options.className;
	    this._speed = options.speed;
	    this._items = [];

	    this._scrollHandler = function () {
	      requestAnimationFrame(_this._render.bind(_this));
	    };

	    this._loadHandler = function (pEvent) {
	      pEvent.target.removeEventListener('load', _this._loadHandler);

	      _this._initaliseItem(_this._items.find(function (pItem) {
	        return pItem.image === pEvent.target;
	      }));
	    };
	  }

	  _createClass(JLax, [{
	    key: "_initaliseItem",
	    value: function _initaliseItem(pItem) {
	      var element = pItem.element,
	          image = pItem.image;
	      var elementWidth = element.clientWidth;
	      var elementHeight = element.clientHeight;
	      pItem.coverHeight = Math.max(this._viewPortHeight, elementHeight) * this._speed;
	      var coverRatio = elementWidth / pItem.coverHeight;
	      var imageRatio = image.width / image.height;

	      if (coverRatio > imageRatio) {
	        element.style.backgroundSize = 'cover';
	      } else {
	        element.style.backgroundSize = "auto ".concat(pItem.coverHeight, "px");
	      }

	      var elementTop = element.offsetTop;
	      pItem.scrollEntry = elementTop - this._viewPortHeight;
	      pItem.scrollExit = elementTop + element.clientHeight;
	      pItem.ready = true;
	      requestAnimationFrame(this._render.bind(this));
	    }
	  }, {
	    key: "_getViewPortScroll",
	    value: function _getViewPortScroll() {
	      var viewPort = this._viewPort;

	      if (viewPort === window) {
	        var element = document.documentElement;
	        return (window.pageYOffset || element.scrollTop) - (element.clientTop || 0);
	      }

	      return viewPort.scrollTop;
	    }
	  }, {
	    key: "_render",
	    value: function _render() {
	      var viewPortScroll = this._getViewPortScroll();

	      var viewPortHeight = this._viewPortHeight;

	      this._items.forEach(function (pItem) {
	        if (!pItem.ready || pItem.scrollEntry >= viewPortScroll || pItem.scrollExit <= viewPortScroll) {
	          return;
	        }

	        var elementHalf = pItem.element.clientHeight / 2;
	        var elementCentre = pItem.element.offsetTop + elementHalf;
	        var intersectRangeTop = viewPortScroll - elementHalf;
	        var intersectRangeHeight = viewPortHeight + pItem.element.clientHeight;
	        var elementCentreNormalised = elementCentre - intersectRangeTop;
	        var intersectRatio = (intersectRangeHeight - elementCentreNormalised) / intersectRangeHeight;
	        var heightDifference = pItem.coverHeight - viewPortHeight;
	        var backgroundOffsetNormalised = intersectRangeHeight * intersectRatio - pItem.coverHeight;
	        var difRatio = heightDifference * intersectRatio;
	        pItem.element.style.backgroundPositionY = "".concat(backgroundOffsetNormalised + difRatio, "px");
	      });
	    }
	  }, {
	    key: "initalise",
	    value: function initalise() {
	      var viewPort = this._viewPort;
	      viewPort.addEventListener('scroll', this._scrollHandler);

	      if (viewPort === window) {
	        this._viewPortHeight = window.innerHeight;
	      } else {
	        this._viewPortHeight = viewPort.clientHeight;
	        viewPort.style.overflowY = 'scroll';
	        viewPort.style.position = 'relative';
	      }

	      var loadHandler = this._loadHandler;
	      this._items = _toConsumableArray(document.getElementsByClassName(this._className)).map(function (pElement) {
	        var backgroundImage = getComputedStyle(pElement).backgroundImage;
	        var image = new Image();
	        image.src = backgroundImage.replace(/url\(['"]?(.*?)['"]?\)/, '$1');
	        image.addEventListener('load', loadHandler);
	        return {
	          element: pElement,
	          ready: false,
	          image: image,
	          coverHeight: null
	        };
	      });
	    }
	  }, {
	    key: "deinitialise",
	    value: function deinitialise() {
	      var viewPort = this._viewPort;

	      if (viewPort !== window) {
	        viewPort.style.position = '';
	        viewPort.style.overflowY = '';
	      }

	      this._viewPort.removeEventListener('scroll', this._scrollHandler);

	      this._items.forEach(function (pItem) {
	        pItem.element.style.backgroundSize = '';
	        pItem.element.style.backgroundPositionY = '';
	      });

	      this._items = [];
	    }
	  }]);

	  return JLax;
	}();

	return jlax;

}());
//# sourceMappingURL=jlax.js.map
