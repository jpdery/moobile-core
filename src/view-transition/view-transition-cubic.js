"use strict"

var ViewTransition = moobile.ViewTransition;

/**
 * @see    http://moobilejs.com/doc/latest/moobile.ViewTransition/moobile.ViewTransition.Cubic
 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
 * @edited 0.3.0
 * @since  0.1.0
 */
var Cubic = moobile.ViewTransition.Cubic = new Class({

	Extends: moobile.ViewTransition,

	/**
	 * @overridden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	enterAnimation: function(viewToShow, viewToHide, parentView) {

		var parentElem = parentView.getContentElement();
		var parentWrap = parentView.getContentWrapperElement();

		var onStart = function() {
			parentWrap.addClass('transition-cubic-perspective');
			viewToHide.addClass('transition-view-to-hide');
			viewToShow.addClass('transition-view-to-show');
			viewToShow.show();
		}.bind(this);

		var onEnd = function() {
			parentWrap.removeClass('transition-cubic-perspective');
			viewToHide.removeClass('transition-view-to-hide');
			viewToShow.removeClass('transition-view-to-show');
			viewToHide.hide();
			this.didEnter(viewToShow, viewToHide, parentView);
		}.bind(this);

		var animation = new moobile.Animation(parentElem);
		animation.setAnimationClass('transition-cubic-enter');
		animation.addEvent('start', onStart);
		animation.addEvent('end', onEnd);
		animation.start();
	},

	/**
	 * @overridden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	leaveAnimation: function(viewToShow, viewToHide, parentView) {

		var parentElem = parentView.getContentElement();
		var parentWrap = parentView.getContentWrapperElement();

		var onStart = function() {
			parentWrap.addClass('transition-cubic-perspective');
			viewToHide.addClass('transition-view-to-hide');
			viewToShow.addClass('transition-view-to-show');
			viewToShow.show();
		}.bind(this);

		var onEnd = function() {
			parentWrap.removeClass('transition-cubic-perspective');
			viewToShow.removeClass('transition-view-to-show');
			viewToHide.removeClass('transition-view-to-hide');
			viewToHide.hide();
			this.didLeave(viewToShow, viewToHide, parentView);
		}.bind(this);

		var animation = new moobile.Animation(parentElem);
		animation.setAnimationClass('transition-cubic-leave');
		animation.addEvent('start', onStart);
		animation.addEvent('end', onEnd);
		animation.start();
	}

});
