$(function() {
	'use strict';

	var homepage,
		about,
		aboutOpened = false,
		canGo = true,
		isScrolling = false,
		self = this,
		isSnapping = true,
		$document = $(document),
		$window = $(window),
		$about = $('#about'),
		$body = $('body'),
		$pages = $('.page'),
		$keyboard = $('#keyboard'),
		$bars = $('#bars'),
		$galleryClose = $('.igallery-close'),
		$popupGalleryImages = $('[data-igallery="one"]'),
		$bulletsContainer = $('#bullets'),
		$bullets,
		windowHeight = $window.height(),
		windowWidth = $window.width(),
		sectionLength = $('section, header').length,
		bulletHtml = '';

	// removes click delays on browsers with touch UIs.
	FastClick.attach(document.body);

	// pravent default mobile device scrolling
	document.addEventListener('touchmove', function(e){
		e.preventDefault();
	},false);

	// enables viewport units for older browsers
	window.viewportUnitsBuggyfill.init();

	// distinguish between scroll events initiated by the user, and those by inertial scrolling
	var lethargy = new Lethargy(7, 100, 0.05);

	// generate navigation bullets
	for (var i = 0; i < sectionLength; i++) {
		var isBulletActive = i == 0 ? ' class="active"' : '';
		bulletHtml += '<i'+isBulletActive+'><b></b></i>';
	}

	// add navigation bullets html
	$bulletsContainer.html(bulletHtml);

	// cache bullet elements
	$bullets = $('#bullets i');

	// check layout issues
	setLayouts();

	// create scrolling elements
	checkIscrolls();

	// mousewheel navigation
	$window.bind('mousewheel DOMMouseScroll wheel MozMousePixelScroll', function(e){

		// prevent default mousewheel behavior
		e.preventDefault()
		e.stopPropagation();

		// is snapping enabled and original mousewheel
		// action by user is made - move up or down
		if (!aboutOpened && isSnapping && lethargy.check(e) !== false && canGo) {

			// allow only single movement per half of a second
			canGo = false;
			setTimeout(function(){
				canGo = true;
			},500);

			// move up or down
			if (e.originalEvent.deltaY > 0) {
				homepage.next();
			} else {
				homepage.prev();
			}
		}
	});

	// actions need to be done on window resize
	$window.resize(function(){
		setLayouts()
		checkIscrolls();
	});

	$document.keydown(function(e) {
		switch(e.which) {
			case 37: // left
				if (aboutOpened) {
					$bars.click();
					$keyboard.fadeOut(200);
				}
			break;

			case 39: // right
				if (!aboutOpened) {
					$bars.click();
					$keyboard.fadeOut(200);
				}
			break;
			default: return;
		}
		e.preventDefault();
	});

	$document.on('click', '#side', function(e){
		var $el = $(e.target);
		if (!$el.parents().is('#inner') && !$el.is('#inner') &&
			!$el.is('#bars') && !$el.parents().is('#bars')) {
			$bars.click();
		}
	});

	// actions need to be done on page load
	window.onLoad = function() {
		setLayouts()
		checkIscrolls();
	};

	// About / Menu button toggling
	$document.on('click', '#bars', function(){

		if ($body.hasClass('active')) {

			// close "about" by removing "active" class from body element
			$body.removeClass('active');
			
			// set variable - "about" is closed
			aboutOpened = false;

			// enable main scroll
			homepage.enable();

		} else {

			// set variable - "about" is opened
			aboutOpened = true;

			// temporary disable main scroll
			homepage.disable();

			// open "about" section by adding "active" class to body element
			$body.addClass('active');

			// update variables
			setTimeout(function(){
				setLayouts();
			},300);

			// refresh scrollbar of "about" section
			setTimeout(function(){
				checkIscrollsInner();
			},500);

		}
	});

	// bullet navigation
	$document.on('click', '#bullets i', function(){

		// get nubmer of element that was clicked
		var pageIndex = $(this).index();

		// remove "active" class from all bullets and add "active" class
		// to element that was clicked
		$bullets.removeClass('active').eq(pageIndex).addClass('active');

		toPage(pageIndex);
	});

	// navigates to corresponding page when link in about senction is clicked	
	$document.on('click', '.services li a', function(e){

		// prevent default link behavior
		e.preventDefault();

		// if snapping enabled = go to corresponding page
		if (isSnapping) {
			toPage($(this).parent().index() + 1);
		// else - go to element
		} else {
			homepage.scrollToElement($pages.eq($(this).parent().index()+1).get(0), 400, 0, 0, IScroll.utils.ease.quadratic);
		}

		// close "about" section
		$bars.click();
	});

	// fixes layout issues
	function setLayouts() {

		// update variables
		windowHeight = $window.height(),
		windowWidth = $window.width();
	}

	// create scrolling elements
	function checkIscrolls() {

		// destroy main page scroll if created previously
		if (typeof homepage != 'undefined') {
			homepage.destroy();
			homepage = null;
		}

		// update variable that indicates if snapping enabled
		if (windowWidth > 768) {
			isSnapping = true;
		} else {
			isSnapping = false;
		}

		// create main page scroll
		homepage = new IScroll('#pages',{
			scrollX: false,
			scrollY: true,
			keyBindings: {
				up: 40,
				down: 38
			},
			deceleration: 0.002,
			momentum: true,
			click: true,
			snap: windowWidth > 768 ? '.page' : false,
			bounceEasing: 'quadratic',
			mouseWheel: windowWidth < 769,
			probeType: 2,
			snapSpeed: 300
		});

		// set first bullet to active
		$bullets.removeClass('active').eq(0).addClass('active');

		// bind scroll end event
		if (windowWidth > 768) {
			homepage.on('scrollEnd', scrollEnd);
		}
	}

	// create scrolling elements
	function checkIscrollsInner() {

		// destroy about scroll if created previously
		if (typeof about != 'undefined') {
			about.destroy();
		}

		// create about scroll
		if ($about.is(':visible')) {
			about = new IScroll('#about',{
				scrollX: false,
				scrollY: true,
				keyBindings: {
					up: 38,
					down: 40
				},
				click: (('ontouchstart' in window)
					|| (navigator.MaxTouchPoints > 0)
					|| (navigator.msMaxTouchPoints > 0)) && 
					!(/iPad|iPhone|iPod/.test(navigator.userAgent) && 
					!window.MSStream),
				mouseWheel: true,
				scrollbars: true,
				interactiveScrollbars: true,
				disableMouse: false,
				bounceEasing: {
					style:'cubic-bezier(.51,.01,.52,.99)',
					fn: function (k) { return k; }
				},
			});
		}
	}
	
	// on main page scroll end
	function scrollEnd() {

		// mark that scollings have ended
		isScrolling = false;

		// set current page and bullet
		setTimeout(function(){
			var current = homepage.currentPage.pageY;
			$pages.removeClass('active').eq(current).addClass('active');
			$bullets.removeClass('active').eq(current).addClass('active');
		},50);
	}

	// navigate to page
	function toPage(page, speed) {
		if (typeof page != 'undefined' && !isScrolling) {

			// get index of a current page
			var currentPage = homepage.currentPage.pageY,
				// if the speed has not been given, make it 300
				speed = typeof speed == 'undefined' ? 300 : speed,
				// count animation time by distance to that page
				time = Math.abs(currentPage-page)*speed;

			// go to page
			homepage.goToPage(0, page, time, IScroll.utils.ease.quadratic);

			// mark that scollings stars
			isScrolling = true;
			setTimeout(function(){
				isScrolling = false;
			},300);
		}
	}
	
	/////////////////////////////////////////////////////////////////// GALLERY

	// open gallery
	$document.on('click','#gallery-button',function(){
		$popupGalleryImages.eq(0).click();
	});

	// gallery plugin
	(function() {

		var $ = jQuery;

		// set gallery options
		var igalleryOptions = (function() {

			function igalleryOptions() {

				// check if device has touchscreen
				this.isTouch = ('ontouchstart' in window)
					|| (navigator.MaxTouchPoints > 0)
					|| (navigator.msMaxTouchPoints > 0);

				// hide arrows for touchscreens by default
				this.hideTouchArrows = false;

			}

			return igalleryOptions;

		})();

		var igallery = (function() {

			function igallery(options) {

				this.options = options;
				this.album = [];
				this.currentImageIndex = void 0;
				this.init();

			}

			// init gallery
			igallery.prototype.init = function() {
				this.enable();
				this.build();
			};

			// bind elements with attributes "data-igallery" to open gallery
			igallery.prototype.enable = function() {
				var self = this;
				$body.on('click', '[data-igallery]', function(event) {
					self.start($(event.currentTarget));
					return false;
				});

			};

			// created gallery
			igallery.prototype.build = function() {
				var self = this;

				// cache elements
				this.$lb = $('#igallery');
				this.$ls = $('#igallery-scroll');
				this.$li = this.$lb.find('#igallery-inner');
				this.$left = this.$lb.find('.igallery-arrow-left');
				this.$right = this.$lb.find('.igallery-arrow-right');
				this.$cl = this.$lb.find('.igallery-close');

				// remove arrow elements for touchscreens if needed
				if (this.options.isTouch && this.options.hideTouchArrows) {
					this.$left.remove();
					this.$right.remove();
				}

				// if device has touchscreens - add class that indicates it
				if (this.options.isTouch) {
					this.$lb.addClass('igallery-touch');
				}

				// attach event handlers to the arrows
				this.$left.on('click', function() {
					self.ig.prev();
					self.arrows(self);
				});
				this.$right.on('click', function() {
					self.ig.next();
					self.arrows(self);
				});

				// close gallery
				this.$cl.on('click touchstart', function() {
					$window.off("resize", this.resize);
					self.$lb.fadeOut(150);
					self.$left.addClass('inactive');
					self.$right.addClass('inactive');
					return false;
				});

			};

			// open gallery
			igallery.prototype.start = function(el) {

				// set variables
				var html = '',
					setOfImages = el.attr('data-igallery');

				// empty array of images
				this.array = [];

				// bind resize event
				$window.on('resize', $.proxy(this.resize, this));

				if (setOfImages.length) {

						// get image elements
					var $items = $('[data-igallery="'+setOfImages+'"]'),
						// get number of first image that will be shown
						id = $items.index(el);

					// generate gallery html
					for (var i = 0; i < $items.length; i++) {
						var image = $items[i].getAttribute('data-url');
						if (image) {
							html += '<div class="item"><div class="item-inner" style="background-image: url(' + image + ');"></div></div>';
							this.array.push(image);
						}
					}

					// add gallery html
					this.$ls.html(html);

					// trigger resize event
					this.resize();

					var self = this;

					// fade in gallery
					this.$lb.addClass('inactive').fadeIn(300,function(){
						// set scrolling
						self.iscroll(id);
						// preload images
						self.load();
					});
				}
			};

			igallery.prototype.load = function(p) {

				// number of images
				this.count = this.array.length;

				// set variables
				var nr = 0,
					self = this;

				// preload each image
				$.each(this.array,function(number,file) {
					$('<img/>').attr('src',file).on('load',function() {
						nr++;
						$(this).remove();
						// show gallery when the last image is loaded
						if (nr == self.count) {
							setTimeout(function(){ 
								self.$lb.removeClass('inactive')
							},500);
						}
					});
				});
			};

			igallery.prototype.iscroll = function(p) {

				var self = this;

				// destroy gallery scroll if created previously
				if (typeof this.ig != 'undefined') {
					this.ig.destroy();
					this.ig = null;
				}

				// create gallery scroll
				this.ig = new IScroll('#igallery-inner',{
					scrollX: true,
					scrollY: false,
					momentum: true,
					snapSpeed: 450,
					disableMouse: true,
					bounceEasing: 'quadratic', 
					eventPassthrough: true,
					snap: '.item',
					click: true
				});

				// bind scroll end event
				this.ig.on('scrollEnd', function(){ self.arrows(self) });

				// show first image by its number
				if (p) {
					this.ig.goToPage(p, 0, 0);
				}

				// check if can move left and right
				this.arrows(this);

			};

			igallery.prototype.arrows = function(self) {

				// get current gallery image
				var cr = self.ig.currentPage.pageX;

				// if current image is first image - hide left arrow
				if (cr == 0) {
					self.$left.addClass('inactive');
				} else {
					self.$left.removeClass('inactive');
				}

				// if current image is last image - hide right arrow
				if (cr == self.array.length - 1) {
					self.$right.addClass('inactive');
				} else {
					self.$right.removeClass('inactive');
				}

			};

			igallery.prototype.resize = function(self) {

				// set variables
				var oneSide = this.options.isTouch ? windowWidth * 0.046875 : $galleryClose.width() * 1.75,
					sides = this.options.isTouch && windowWidth < 1025 ? oneSide * 1.25 : oneSide * 2;

				// set gallery image size
				this.$ls.find('.item').css({
					width: windowWidth,
					height: windowHeight
				});

				// set gallery image inner element size
				this.$ls.find('.item-inner').css({
					width: windowWidth - sides,
					height: windowHeight - 42 * 2,
					margin: '42px ' + (sides / 2) + 'px'
				});
			};

			return igallery;

		})();

		$(function() {

			var options  = new igalleryOptions(),
				lightbox = new igallery(options);

		});

	}).call(this);

});
