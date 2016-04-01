"use strict"

/**
 * @see    http://moobilejs.com/doc/latest/moobile.Control/NavigationBar
 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
 * @edited 0.3.0
 * @since  0.1.0
 */
var NavigationBar = moobile.NavigationBar = new Class({

	Extends: moobile.Bar,

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.3.0
	 */
	__title: null,

	/**
	 * @see    http://moobilejs.com/doc/latest/moobile.Control/NavigationBar#contentElement
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.3.0
	 */
	contentElement: null,

	/**
	 * @see    http://moobilejs.com/doc/latest/moobile.Control/NavigationBar#options
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.3.0
	 */
	options: {
		title: null,
		titleCentered: true // moobile.Theme.getName() === 'ios'
	},

	/**
	 * @overridden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @edited 0.3.0
	 * @since  0.1.0
	 */
	willBuild: function() {

		this.parent();

		this.addClass('navigation-bar');

		// <deprecated>
		var item = this.getRoleElement('item');
		if (item) {
			console.log('[REMOVAL NOTICE] The role "item" has been removed in 0.3, use the role "content" instead and refer to the documentation.');
			return;
		}
		// </deprecated>

		var content = this.getRoleElement('content');
		if (content === null) {
			content = document.createElement('div');
			content.ingest(this.element);
			content.inject(this.element);
			content.setRole('content');
		}

		// creates a title element if the content is text only
		var fc = content.firstChild;
		var lc = content.lastChild;
		if (fc && fc.nodeType === 3 &&
			lc && lc.nodeType === 3) {
			var title = this.getRoleElement('title');
			if (title === null) {
				title = document.createElement('div');
				title.ingest(content);
				title.inject(content);
				title.setRole('title');
			}
		}
	},

	/**
	 * @overridden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.3.0
	 */
	didBuild: function() {

		this.parent();

		var title = this.options.title;
		if (title) {
			this.setTitle(title);
		}
	},

	/**
	 * @overridden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.3.0
	 */
	destroy: function() {
		this.__title = null;
		this.parent();
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/moobile.Control/NavigationBar#setTitle
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.3.0
	 */
	setTitle: function(title) {

		if (this.__title === title)
			return this;

		title = moobile.Text.from(title);

		if (this.__title) {
			this.__title.replaceWithComponent(title, true);
		} else {
			this.addChildComponentInside(title, this.contentElement);
		}

		this.__title = title;
		this.__title.addClass('navigation-bar-title');
		this.toggleClass('navigation-bar-title-empty', this.__title.isEmpty());

		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/moobile.Control/NavigationBar#getTitle
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.3.0
	 */
	getTitle: function() {
		return this.__title;
	},

	/**
	 * @overridden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.3.0
	 */
	didUpdateLayout: function() {

		this.parent();

		if (this.options.titleCentered === false)
			return this;

		var element = this.element;
		var content = this.contentElement;

		content.setStyle('padding-left', 0);
		content.setStyle('padding-right', 0);

		var elementSize = element.offsetWidth;
		var contentSize = content.offsetWidth;
		var contentPosition = content.offsetLeft;

		var offset = ((elementSize / 2) - (contentPosition + contentSize / 2)) * 2;

		var fc = content.firstChild;
		var lc = content.lastChild;

		if (fc && fc.getPosition) {
			var pos = fc.offsetLeft + offset;
			if (pos < 0) {
				offset += Math.abs(pos);
			}
		}

		if (lc && lc.getPosition) {
			var pos = lc.offsetLeft + lc.offsetWidth + offset;
			if (pos > contentSize) {
				offset -= Math.abs(contentSize - pos);
			}
		}

		content.setStyle(offset < 0 ? 'padding-right' : 'padding-left', Math.abs(offset));
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/moobile.Control/NavigationBar#addLeftButton
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.3.0
	 */
	addLeftButton: function(button) {
		return this.addChildComponent(button, 'top');
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/moobile.Control/NavigationBar#addRightButton
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.3.0
	 */
	addRightButton: function(button) {
		return this.addChildComponent(button, 'bottom');
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/moobile.Control/NavigationBar#getButton
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.3.0
	 */
	getButton: function(name) {
		return this.getChildComponentByType(Button, name);
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/moobile.Control/NavigationBar#getButton
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.3.0
	 */
	getButtonAt: function(index) {
		return this.getChildComponentByTypeAt(Button, index);
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/moobile.Control/NavigationBar#removeButton
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.3.0
	 */
	removeButton: function(button, destroy) {
		return this.removeChildComponent(button, destroy);
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/moobile.Control/NavigationBar#removeAllButtons
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.3.0
	 */
	removeAllButtons: function(destroy) {
		return this.removeAllChildComponents(Button, destroy);
	}

});

//------------------------------------------------------------------------------
// Roles
//------------------------------------------------------------------------------

/**
 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
 * @since  0.1.0
 */
moobile.Component.defineRole('navigation-bar', null, null, function(element) {
	this.addChildComponent(moobile.Component.create(NavigationBar, element, 'data-navigation-bar'));
});

/**
 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
 * @since  0.3.0
 */
moobile.Component.defineRole('content', NavigationBar, {traversable: true}, function(element) {
	this.contentElement = element;
	this.contentElement.addClass('navigation-bar-content');
});

/**
 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
 * @since  0.3.0
 */
moobile.Component.defineRole('title', NavigationBar, null, function(element) {
	this.setTitle(moobile.Component.create(moobile.Text, element, 'data-title'));
});

