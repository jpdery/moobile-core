/*
---

name: Entity

description: Provides the base class for every objects that are displayed
             through an element.

license: MIT-style license.

authors:
	- Jean-Philippe Dery (jeanphilippe.dery@gmail.com)

requires:
	- Core/Class
	- Core/Class.Extras
	- Class-Extras/Class.Binds
	- EntityRoles
	- EntityStyles

provides:
	- Entity

...
*/

if (!window.Moobile) window.Moobile = {};

Moobile.Entity = new Class(/** @lends Entity.prototype */{

	Implements: [
		Events,
		Options,
		Class.Binds
	],

	/**
	 * Contains the role definitions for this entity.
	 * @type {Object}
	 */
	$roles: {},

	/**
	 * Contains the style definitions for this entity.
	 * @type {Object}
	 */
	$styles: {},

	/**
	 * The entity's current style.
	 * @type {Object}
	 */
	style: null,

	/**
	 * The entity's owner.
	 * @type {Entity}
	 */
	owner: null,

	/**
	 * The entity's name.
	 * @type {String}
	 */
	name: null,

	/**
	 * The entity's DOM element.
	 * @type {Element}
	 */
	element: null,

	/**
	 * The entity's children.
	 * @type {Array}
	 */
	children: [],

	/**
	 * The entity's window.
	 * @type {Window}
	 */
	window: null,

	/**
	 * Indicates whether the entity is in the DOM.
	 * @type {Boolean}
	 */
	ready: false,

	/**
	 * Options.
	 * @type {Object}
	 */
	options: {
		className: null,
		styleName: null,
		tagName: 'div'
	},

	/**
	 * Initialize the entity with an optional element.
	 * @param {Element} element The entity element, element id or HTML string.
	 * @param {Object} options The entity options.
	 * @param {String} name The entity name.
	 * @return {Entity}
	 * @since 0.1
	 */
	initialize: function(element, options, name) {

		this.name = name;

		var root = document.id(element);
		if (root == null) {
			root = new Element(this.options.tagName);
			if (typeof element == 'string') {
				root = Elements.from(element)[0];
			}
		}

		this.element = root;

		options = options || {};

		for (var option in this.options) {
			var value = this.element.get('data-option-' + option.hyphenate());
			if (value != null) {
				if (options[option] == undefined) {
					options[option] = value;
				}
			}
		}

		this.setOptions(options);

		this.element.addEvent('click', this.bound('onClick'));
		this.element.addEvent('mouseup', this.bound('onMouseUp'))
		this.element.addEvent('mousedown', this.bound('onMouseDown'));

		this.willLoad();

		var className = this.options.className;
		if (className) {
			this.element.addClass(className);
		}

		var styleName = this.options.styleName
		if (styleName) {
			this.setStyle(styleName);
		}

		this.element.getElements('[data-role]').each(function(element) {
			if (this.hasRoleElement(element)) {
				this.defineElementRole(element, element.get('data-role'));
			}
		}, this);

		this.didLoad();

		return this;
	},

	/**
	 * Destroy the entire hierarchy.
	 * @return {Entity}
	 * @since 0.1
	 */
	destroy: function() {

		this.willUnload();

		this.element.removeEvent('click', this.bound('onClick'));
		this.element.removeEvent('mouseup', this.bound('onMouseUp'));
		this.element.removeEvent('mousedown', this.bound('onMouseDown'));

		this.removeFromOwner();

		this.destroyChildren();

		this.element.destroy();
		this.element = null;
		this.window = null;
		this.owner = null;

		this.didUnload();

		return this;
	},

	/**
	 * Destroy the entity children.
	 * @since 0.1
	 * @ignore
	 */
	destroyChildren: function() {
		this.children.each(this.bound('destroyChild'));
		this.children.empty();
	},

	/**
	 * Destroy an entity child.
	 * @param {Entity} entity The entity to destroy.
	 * @since 0.1
	 * @ignore
	 */
	destroyChild: function(entity) {
		entity.destroy();
	},

	/**
	 * Add an entity to the hierarchy at a given location.
	 * @param {Entity} entity The entity.
	 * @param {String} where The entity location (top, bottom, before, after).
	 * @param {Element} context The entity location context element.
	 * @return {Boolean}
	 * @since 0.1
	 */
	addChild: function(entity, where, context) {

		var element = document.id(entity);
		if (element == null)
			return false;

		if (this.hasChild(entity))
			return false;

		this.willAddChild(entity);

		if (!this.hasElement(element)) {

			context = document.id(context);
			if (context == null) {
				context = this.element;
			} else if (!this.hasElement(context)) {
				throw new Error('You are trying to add a child relative to an element that does not belong to this entity');
			}

			element.inject(context, where);
		}

		this.children.push(entity);

		entity.ownerWillChange(this);
		entity.setOwner(this);
		entity.ownerDidChange(this);
		entity.setWindow(this.window);

		this.didAddChild(entity);

		if (this.ready == false) {
			this.addEvent('ready:once', function() {
				entity.setReady();
			});
			return true;
		}

		entity.setReady();

		return true;
	},

	/**
	 * Indicate whether the entity has a child.
	 * @param {Entity} entity The entity.
	 * @return {Boolean}
	 * @since 0.1
	 */
	hasChild: function(entity) {
		return this.children.contains(entity);
	},

	/**
	 * Get a child entity by its name.
	 * @param {String} name The entity name.
	 * @return {Entity}
	 * @since 0.1
	 */
	getChild: function(name) {
		return this.children.find(function(children) {
			return children.getName() == name;
		});
	},

	/**
	 * Get child entities.
	 * @return {Array}
	 * @since 0.1
	 */
	getChildren: function() {
		return this.children;
	},

	/**
	 * Replace a child entity with another.
	 * @param {Entity} replace The entity to remove.
	 * @param {Entity} entity The entity to inject.
	 * @return {Boolean}
	 * @since 0.1
	 */
	replaceChild: function(replace, entity) {

		var success = this.addChild(entity, 'before', replace);
		if (success) {
			return this.removeChild(replace);
		}

		return false;
	},

	/**
	 * Remove a child entity without destroying it.
	 * @param {Entity} entity The entity to remove.
	 * @return {Boolean}
	 * @since 0.1
	 */
	removeChild: function(entity) {

		var element = document.id(entity);
		if (element == null)
			return false;

		if (!this.hasElement(entity))
			return false;

		this.willRemoveChild(entity);

		entity.ownerWillChange(null);
		entity.setOwner(null);
		entity.ownerDidChange(null);
		entity.setReady(false);

		entity.setWindow(null);

		element.dispose();

		this.children.erase(entity);

		this.didRemoveChild(entity);

		return true;
	},

	/**
	 * Remove a child entity from its owner without destroying it.
	 * @return {Boolean}
	 * @since 0.1
	 */
	removeFromOwner: function() {
		return this.owner
		     ? this.owner.removeChild(this)
		     : false;
	},

	/**
	 * Adds the passed in class to the entity's element.
	 * @param {String} name The CSS class.
	 * @return {Entity}
	 * @since 0.1
	 */
	addClass: function(name) {
		this.element.addClass(name);
		return this;
	},

	/**
	 * Remove the passed in class from the entity's element.
	 * @param {String} name The CSS class.
	 * @return {Entity}
	 * @since 0.1
	 */
	removeClass: function(name) {
		this.element.removeClass(name);
		return this;
	},

	/**
	 * Adds or removes the passed in class name to the entity's element.
	 * @param {String} name The CSS class.
	 * @return {Entity}
	 * @since 0.1
	 */
	toggleClass: function(name) {
		this.element.toggleClass(name);
		return this;
	},

	/**
	 * Set the current style of the entity.
	 * @param {String} name The style name.
	 * @return {Entity}
	 * @since 0.1
	 */
	setStyle: function(name) {

		if (this.style) {
			this.style.detach.call(this, this.element);
		}

		var style = this.$styles[name];
		if (style) {
			style.attach.call(this, this.element);
		}

		this.style = style;

		return this;
	},

	/**
	 * Get the current style of the entity.
	 * @return {String}
	 * @since 0.1
	 */
	getStyle: function() {
		return this.style.name;
	},

	/**
	 * Set the entity's owner.
	 * @param {Entity} owner The owner.
	 * @return {Entity}
	 * @since 0.1
	 */
	setOwner: function(owner) {
		this.owner = owner;
		return this;
	},

	/**
	 * Get the entity's owner.
	 * @return {Entity}
	 * @since 0.1
	 */
	getOwner: function() {
		return this.owner;
	},

	/**
	 * Indicates whether this entity has an owner.
	 * @return {Boolean}
	 * @since 0.1
	 */
	hasOwner: function() {
		return !!this.owner;
	},

	/**
	 * Set the entity's window.
	 * @param {Window} window The window.
	 * @return {Entity}
	 * @since 0.1
	 */
	setWindow: function(window) {
		this.window = window;
		return this;
	},

	/**
	 * Get the entity's window.
	 * @return {Window}
	 * @since 0.1
	 */
	getWindow: function() {
		return this.window;
	},

	/**
	 * Indicates whether this entity has a window.
	 * @return {Boolean}
	 * @since 0.1
	 */
	hasWindow: function() {
		return !!this.window;
	},

	/**
	 * Get the entity's name.
	 * @return {String}
	 * @since 0.1
	 */
	getName: function() {
		return this.name;
	},

	/**
	 * Get the entity's element or an element who match the selector.
	 * @param {String} selector The selector
	 * @return {Element}
	 * @since 0.1
	 */
	getElement: function(selector) {
		return selector
			? this.element.getElement(selector)
			: this.element;
	},

	/**
	 * Get a collection of elements who match the selector.
	 * @param {String} selector The selector
	 * @return {Elements}
	 * @since 0.1
	 */
	getElements: function(selector) {
		return this.element.getElements(selector);
	},

	/**
	 * Indicates whether an element exists in this entity.
	 * @param {Element} element The element.
	 * @return {Boolean}
	 * @since 0.1
	 */
	hasElement: function(element) {
		return this.element === document.id(element) || this.element.contains(document.id(element));
	},

	/**
	 * Get an element within the scope of this entity who performs a given role.
	 * @param {String} role The role.
	 * @return {Element}
	 * @since 0.1
	 */
	getRoleElement: function(role) {
		return this.getRoleElements(role)[0] || null;
	},

	/**
	 * Get an element collection within the scole of this entity who performs a
	 * given role.
	 * @param {String} role The role.
	 * @return {Elements}
	 * @since 0.1
	 */
	getRoleElements: function(role) {
		return this.element.getElements('[data-role=' + role + ']').filter(this.bound('hasRoleElement'));
	},

	/**
	 * @todo Find a more suitable name.
	 * @ignore
	 */
	hasRoleElement: function(element) {

		var parent = element.getParent();
		if (parent) {
			return this.element === parent || this.hasRoleElement(parent);
		}

		return false;
	},

	/**
	 * Apply a role to an element.
	 * @param {Element} element The element.
	 * @param {String} name The role.
	 * @return {Entity}
	 * @since 0.1
	 */
	defineElementRole: function(element, name) {

		if (element.retrieve('entity.has-role'))
			return this;

		var role = this.$roles[name];
		if (role == undefined) {
			throw new Error('Role ' + name + ' does not exists.');
		}

		role.call(this, element, element.get('data-name'));

		element.store('entity.has-role', true);

		return this;
	},

	/**
	 * Return the size of the entity's element.
	 * @return {Object}
	 * @since 0.1
	 */
	getSize: function() {
		return this.element.getSize();
	},

	/**
	 * Mark the entity as being part of the DOM.
	 * @return {Entity}
	 * @since 0.1
	 * @ignore
	 */
	setReady: function() {

		if (this.ready)
			return this;

		this.window = this.owner.getWindow();

		this.ready = true;
		this.didBecomeReady();
		this.fireEvent('ready');

		return this;
	},

	/**
	 * Indicates whether the entity is in the DOM.
	 * @return {Boolean}
	 * @since 0.1
	 * @ignore
	 */
	isReady: function() {
		return this.ready;
	},

	/**
	 * Show this entity by changing the display style to its default value.
	 * @return {Entity}
	 * @since 0.1
	 */
	show: function() {
		this.willShow();
		this.element.show();
		this.didShow();
		return this;
	},

	/**
	 * Hide this entity by changing the display style to none.
	 * @return {Entity}
	 * @since 0.1
	 */
	hide: function() {
		this.willHide();
		this.element.hide();
		this.didHide();
		return this;
	},

	/**
	 * Called by the entity at the initialization process before styles and
	 * roles are loaed.
	 *
	 * The current implementation of this method does nothing. However it's a
	 * good practice to call the parent as the implementation of this method
	 * may change in the future.
	 *
	 * @since 0.1
	 */
	willLoad: function() {

	},

	/**
	 * Called by the entity at the initialization process before styles and
	 * roles are loaed.
	 *
	 * The current implementation of this method does nothing. However it's a
	 * good practice to call the parent as the implementation of this method
	 * may change in the future.
	 *
	 * @since 0.1
	 */
	didLoad: function() {

	},

	/**
	 * Called by the entity at the initialization process before styles and
	 * roles are loaed.
	 *
	 * The current implementation of this method does nothing. However it's a
	 * good practice to call the parent as the implementation of this method
	 * may change in the future.
	 *
	 * @since 0.1
	 */
	willUnload: function() {

	},

	/**
	 * Called by the entity at the initialization process before styles and
	 * roles are loaed.
	 *
	 * The current implementation of this method does nothing. However it's a
	 * good practice to call the parent as the implementation of this method
	 * may change in the future.
	 *
	 * @since 0.1
	 */
	didUnload: function() {

	},

	/**
	 * Called by the entity at the initialization process before styles and
	 * roles are loaed.
	 *
	 * The current implementation of this method does nothing. However it's a
	 * good practice to call the parent as the implementation of this method
	 * may change in the future.
	 *
	 * @since 0.1
	 */
	didBecomeReady: function() {

	},

	/**
	 * Called by the entity at the initialization process before styles and
	 * roles are loaed.
	 *
	 * The current implementation of this method does nothing. However it's a
	 * good practice to call the parent as the implementation of this method
	 * may change in the future.
	 *
	 * @param {Entity} entity The new entity.
	 * @since 0.1
	 */
	willAddChild: function(entity) {

	},

	/**
	 * Called by the entity at the initialization process before styles and
	 * roles are loaed.
	 *
	 * The current implementation of this method does nothing. However it's a
	 * good practice to call the parent as the implementation of this method
	 * may change in the future.
	 *
	 * @param {Entity} entity The new entity.
	 * @since 0.1
	 */
	didAddChild: function(entity) {

	},

	/**
	 * Called by the entity at the initialization process before styles and
	 * roles are loaed.
	 *
	 * The current implementation of this method does nothing. However it's a
	 * good practice to call the parent as the implementation of this method
	 * may change in the future.
	 *
	 * @param {Entity} entity The entity to remove.
	 * @since 0.1
	 */
	willRemoveChild: function(entity) {

	},

	/**
	 * Called by the entity at the initialization process before styles and
	 * roles are loaed.
	 *
	 * The current implementation of this method does nothing. However it's a
	 * good practice to call the parent as the implementation of this method
	 * may change in the future.
	 *
	 * @param {Entity} entity The entity to remove.
	 * @since 0.1
	 */
	didRemoveChild: function(entity) {

	},

	/**
	 * Called by the entity at the initialization process before styles and
	 * roles are loaed.
	 *
	 * The current implementation of this method does nothing. However it's a
	 * good practice to call the parent as the implementation of this method
	 * may change in the future.
	 *
	 * @since 0.1
	 */
	willShow: function() {

	},

	/**
	 * Called by the entity at the initialization process before styles and
	 * roles are loaed.
	 *
	 * The current implementation of this method does nothing. However it's a
	 * good practice to call the parent as the implementation of this method
	 * may change in the future.
	 *
	 * @since 0.1
	 */
	didShow: function() {

	},

	/**
	 * Called by the entity at the initialization process before styles and
	 * roles are loaed.
	 *
	 * The current implementation of this method does nothing. However it's a
	 * good practice to call the parent as the implementation of this method
	 * may change in the future.
	 *
	 * @since 0.1
	 */
	willHide: function() {

	},

	/**
	 * Called by the entity at the initialization process before styles and
	 * roles are loaed.
	 *
	 * The current implementation of this method does nothing. However it's a
	 * good practice to call the parent as the implementation of this method
	 * may change in the future.
	 *
	 * @since 0.1
	 */
	didHide: function() {

	},

	/**
	 * Called by the entity at the initialization process before styles and
	 * roles are loaed.
	 *
	 * The current implementation of this method does nothing. However it's a
	 * good practice to call the parent as the implementation of this method
	 * may change in the future.
	 *
	 * @param {Entity} owner The owner.
	 * @since 0.1
	 */
	ownerWillChange: function(owner) {

	},

	/**
	 * Called by the entity at the initialization process before styles and
	 * roles are loaed.
	 *
	 * The current implementation of this method does nothing. However it's a
	 * good practice to call the parent as the implementation of this method
	 * may change in the future.
	 *
	 * @param {Entity} owner The owner.
	 * @since 0.1
	 */
	ownerDidChange: function(owner) {

	},

	/**
	 * Click event handler.
	 * @param {Event} e The event.
	 * @since 0.1
	 * @ignore
	 */
	onClick: function(e) {
		e.target = this;
		this.fireEvent('click', e);
	},

	/**
	 * Mouse Up event handler.
	 * @param {Event} e The event.
	 * @since 0.1
	 * @ignore
	 */
	onMouseUp: function(e) {
		e.target = this;
		this.fireEvent('mouseUp', e);
	},

	/**
	 * Mouse Down event handler.
	 * @param {Event} e The event.
	 * @since 0.1
	 * @ignore
	 */
	onMouseDown: function(e) {
		e.target = this;
		this.fireEvent('mouseDown', e);
	},

	toElement: function() {
		return this.element;
	}

});

/**
 * Define how a role will perform for an entity.
 * @param {String} name The role name.
 * @param {Entity} target The role target.
 * @param {Function} behavior The role behavior.
 * @since 0.1
 */
Moobile.Entity.defineRole = function(name, target, behavior) {
	(target || Moobile.Entity).prototype.$roles[name] = behavior;
};

/**
 * Defines a style for an entity.
 * @param {String} name The style name.
 * @param {Entity} target The style target.
 * @param {Object} behavior The style behavior.
 */
Moobile.Entity.defineStyle = function(name, target, behavior) {
	(target || Moobile.Entity).prototype.$styles[name] = Object.append({
		name: name,
		attach: function() {},
		detach: function() {}
	}, behavior);
};
