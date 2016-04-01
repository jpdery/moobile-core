"use strict"

/**
 * @see    http://moobilejs.com/doc/latest/Control/Control
 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
 * @since  0.1.0
 */
var Control = moobile.Control = new Class({

	Extends: moobile.Component,

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	__state: null,

	/**
	 * @see    http://moobilejs.com/doc/latest/Control/Control#options
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	options: {
		className: null,
		styleName: null
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Control/Control#setDisabled
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	setDisabled: function(disabled) {
		return this.__setState(disabled !== false ? 'disabled' : null);
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Control/Control#isDisabled
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	isDisabled: function() {
		return this._getState() == 'disabled';
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Control/Control#setSelected
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	setSelected: function(selected) {
		return this.__setState(selected !== false ? 'selected' : null);
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Control/Control#isSelected
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	isSelected: function() {
		return this._getState() == 'selected';
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Control/Control#setHighlighted
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	setHighlighted: function(highlighted) {
		return this.__setState(highlighted !== false ? 'highlighted' : null);
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Control/Control#isHighlighted
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	isHighlighted: function() {
		return this._getState() == 'highlighted';
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Control/Control#willChangeState
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	willChangeState: function(state) {

	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Control/Control#didChangeState
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	didChangeState: function(state) {

	},

	/**
	 * @see    http://moobilejs.com/doc/latest/Control/Control#shouldAllowState
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	shouldAllowState: function(state) {
		return ['highlighted', 'selected', 'disabled'].contains(state);
	},

	/**
	 * @overridden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	shouldFireEvent: function(type, args) {
		return !this.isDisabled();
	},

	/* Private API */

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	__setState: function(state, value) {

		if (this.__state === state)
			return this;

		if (this.shouldAllowState(state) || state == null) {
			this.willChangeState(state)
			if (this.__state) this.removeClass('is-' + this.__state);
			this.__state = state;
			if (this.__state) this.addClass('is-' + this.__state);
			this.didChangeState(state)
		}

		return this;
	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	_getState: function() {
		return this.__state;
	}

});
