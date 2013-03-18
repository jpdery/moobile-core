"use strict"

/**
 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController
 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
 * @edited 0.3.0
 * @since  0.1.0
 */
var ViewController = moobile.ViewController = new Class({

	Extends: moobile.Emitter,

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.0
	 */
	_id: null,

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	_name: null,

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	_title: null,

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	_image: null,

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	_viewReady: false,

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	_viewTransition: null,

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	_parent: null,

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	_children: [],

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#modal
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	_modal: false,

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#modalViewController
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	_modalViewController: null,

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#view
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	view: null,

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#initialize
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	initialize: function(options, name) {

		this._name = name;

		this.setOptions(options);

		this.loadView();
		if (this.view) {
			this.view.addEvent('ready', this.bound('_onViewReady'));
			this.view.addEvent('layout', this.bound('_onViewLayout'));
			this.viewDidLoad();
		}

		window.addEvent('orientationchange', this.bound('_onWindowOrientationChange'));

		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#loadView
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	loadView: function() {
		if (this.view === null) {
			this.view = new View();
		}
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#showView
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.1
	 */
	showView: function() {
		this.view.show();
		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#hideView
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.1
	 */
	hideView: function() {
		this.view.hide();
		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#addChildViewController
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	addChildViewController: function(viewController) {
		return this._addChildViewController(viewController);
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#addChildViewControllerAfter
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	addChildViewControllerAfter: function(viewController, after) {

		var index = this.getChildViewControllerIndex(after);
		if (index === -1)
			return this;

		return this._addChildViewController(viewController, after, 'after');
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#addChildViewControllerBefore
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	addChildViewControllerBefore: function(viewController, before) {

		var index = this.getChildViewControllerIndex(before);
		if (index === -1)
			return this;

		return this._addChildViewController(viewController, before, 'before');
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#addChildViewControllerAt
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	addChildViewControllerAt: function(viewController, index) {

		if (index > this._children.length) {
			index = this._children.length;
		} else if (index < 0) {
			index = 0;
		}

		var before = this.getChildViewControllerAt(index);
		if (before) {
			return this.addChildViewControllerBefore(viewController, before);
		}

		return this.addChildViewController(viewController);
	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.3.0
	 */
	_addChildViewController: function(viewController, context, where) {

		viewController.removeFromParentViewController();

		this.willAddChildViewController(viewController);

		if (context) {

			this._children.splice(this.getChildViewControllerIndex(context), 0, viewController);

			switch (where) {
				case 'before':
					this.view.addChildComponentBefore(viewController.view, context.view);
					break;
				case 'after':
					this.view.addChildComponentAfter(viewController.view, context.view);
					break;
			}

		} else {
			this._children.push(viewController);
			this.view.addChildComponent(viewController.view);
		}

		viewController.setParentViewController(this);

		this.didAddChildViewController(viewController);

		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#getChildViewController
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getChildViewController: function(name) {
		return this._children.find(function(viewController) { return viewController.getName() === name; });
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#getChildViewControllerAt
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getChildViewControllerAt: function(index) {
		return this._children[index] || null;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#getChildViewControllerIndex
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getChildViewControllerIndex: function(viewController) {
		return this._children.indexOf(viewController);
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#getChildViewControllers
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getChildViewControllers: function() {
		return this._children;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#hasChildViewController
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	hasChildViewController: function(viewController) {
		return this._children.contains(viewController);
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#removeChildViewController
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	removeChildViewController: function(viewController, destroy) {

		if (!this.hasChildViewController(viewController))
			return this;

		this.willRemoveChildViewController(viewController);
		this._children.erase(viewController);
		viewController.setParentViewController(null);

		var view = viewController.getView();
		if (view) {
			view.removeFromParentComponent();
		}

		this.didRemoveChildViewController(viewController);

		if (destroy) {
			viewController.destroy();
		}

		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#removeFromParentViewController
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @edited 0.2.0
	 * @since  0.1.0
	 */
	removeFromParentViewController: function(destroy) {
		if (this._parent) this._parent.removeChildViewController(this, destroy);
		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#removeAllChildViewControllers
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	removeAllChildViewControllers: function(destroy) {

		this._children.filter(function() {
			return true;
		}).invoke('removeFromParentViewController', destroy);

		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#presentModalViewController
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @edited 0.2.0
	 * @since  0.1.0
	 */
	presentModalViewController: function(viewController, viewTransition) {

		if (this._modalViewController)
			return this;

		var parentView = this.view.getWindow();
		if (parentView === null)
			throw new Error('The view to present is not ready');

		this.willPresentModalViewController(viewController);

		this._modalViewController = viewController;
		this._modalViewController.setParentViewController(this);
		this._modalViewController.setModal(true);

		var viewToShow = this._modalViewController.getView();
		var viewToHide = parentView.getChildComponentsByType(View).getLastItemAtOffset(0);

		parentView.addChildComponent(viewToShow);

		viewTransition = viewTransition || new ViewTransition.Cover;
		viewTransition.addEvent('start:once', this.bound('_onPresentTransitionStart'));
		viewTransition.addEvent('complete:once', this.bound('_onPresentTransitionCompleted'));
		viewTransition.enter(
			viewToShow,
			viewToHide,
			parentView
		);

		viewController.setViewTransition(viewTransition);

		return this;
	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	_onPresentTransitionStart: function() {
		this._modalViewController.viewWillEnter();
	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	_onPresentTransitionCompleted: function() {
		this._modalViewController.viewDidEnter();
		this.didPresentModalViewController()
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#dismissModalViewController
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @edited 0.2.0
	 * @since  0.1.0
	 */
	dismissModalViewController: function() {

		if (this._modalViewController === null)
			return this;

		var parentView = this.view.getWindow();
		if (parentView === null)
			throw new Error('The view to dismiss is not ready');

		this.willDismissModalViewController()

		var viewToShow = parentView.getChildComponentsByType(View).getLastItemAtOffset(1);
		var viewToHide = this._modalViewController.getView();

		var viewTransition = this._modalViewController.getViewTransition();
		viewTransition.addEvent('start:once', this.bound('_onDismissTransitionStart'));
		viewTransition.addEvent('complete:once', this.bound('_onDismissTransitionCompleted'));
		viewTransition.leave(
			viewToShow,
			viewToHide,
			parentView
		);

		return this;
	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	_onDismissTransitionStart: function() {
		this._modalViewController.viewWillLeave();
	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @edited 0.2.0
	 * @since  0.1.0
	 */
	_onDismissTransitionCompleted: function() {
		this._modalViewController.viewDidLeave();
		this._modalViewController.setParentViewController(this);
		this._modalViewController.setModal(false);
		this._modalViewController.destroy();
		this._modalViewController = null;
		this.didDismissModalViewController();
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#getName
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getName: function() {
		return this._name;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#getId
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.0
	 */
	getId: function() {

		var name = this.getName();
		if (name) {
			return name;
		}

		if (this._id === null) {
			this._id = String.uniqueID();
		}

		return this._id;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#setTitle
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	setTitle: function(title) {

		if (this._title === title)
			return this;

		title = moobile.Text.from(title);

		if (this._title &&
			this._title.hasParentComponent()) {
			this._title.replaceWithComponent(title, true);
		}

		this._title = title;

		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#getTitle
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getTitle: function() {
		return this._title;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#setImage
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	setImage: function(image) {

		if (this._image === image)
			return this;

		image = moobile.Image.from(image);

		if (this._image &&
			this._image.hasParentComponent()) {
			this._image.replaceWithComponent(image, true);
		}

		this._image = image;

		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#getImage
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getImage: function() {
		return this._image;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#setModal
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	setModal: function(modal) {
		this._modal = modal;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#isModal
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	isModal: function() {
		return this._modal;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#isViewReady
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	isViewReady: function() {
		return this._viewReady;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#getView
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getView: function() {
		return this.view;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#setViewTransition
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	setViewTransition: function(viewTransition) {
		this._viewTransition = viewTransition;
		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#getViewTransition
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getViewTransition: function() {
		return this._viewTransition;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#setParentViewController
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	setParentViewController: function(viewController) {
		this.parentViewControllerWillChange(viewController);
		this._parent = viewController;
		this.parentViewControllerDidChange(viewController);
		return this;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#getParentViewController
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	getParentViewController: function() {
		return this._parent;
	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#willAddChildViewController
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	willAddChildViewController: function(viewController) {

	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#didAddChildViewController
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	didAddChildViewController: function(viewController) {

	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#willRemoveChildViewController
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	willRemoveChildViewController: function(viewController) {

	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#didRemoveChildViewController
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	didRemoveChildViewController: function(viewController) {

	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#parentViewControllerWillChange
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	parentViewControllerWillChange: function(viewController) {

	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#parentViewControllerDidChange
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	parentViewControllerDidChange: function(viewController) {

	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#willPresentModalViewController
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	willPresentModalViewController: function(viewController) {

	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#didPresentModalViewController
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	didPresentModalViewController: function(viewController) {

	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#willDismissModalViewController
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	willDismissModalViewController: function() {

	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#didDismissModalViewController
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	didDismissModalViewController: function() {

	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#viewDidLoad
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	viewDidLoad: function() {

	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#viewDidBecomeReady
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	viewDidBecomeReady: function() {

	},

	viewDidUpdateLayout: function() {

	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#viewWillEnter
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	viewWillEnter: function() {

	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#viewDidEnter
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	viewDidEnter: function() {

	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#viewWillLeave
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	viewWillLeave: function() {

	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#viewDidLeave
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	viewDidLeave: function() {

	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#viewDidRotate
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.0
	 */
	viewDidRotate: function(orientation) {

	},

	/**
	 * @see    http://moobilejs.com/doc/latest/ViewController/ViewController#destroy
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	destroy: function() {

		window.removeEvent('orientationchange', this.bound('_onWindowOrientationChange'));

		this.removeAllChildViewControllers(true);

		this.removeFromParentViewController();

		if (this._modalViewController) {
			this._modalViewController.destroy();
			this._modalViewController = null;
		}

		this.view.removeEvent('ready', this.bound('_onViewReady'));
		this.view.removeEvent('layout', this.bound('_onViewLayout'));
		this.view.destroy();
		this.view = null;

		if (this._title) {
			this._title.destroy();
			this._title = null;
		}

		if (this._image) {
			this._image.destroy();
			this._image = null;
		}

		this._parent = null;
		this._children = null
		this._viewTransition = null;
	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.1.0
	 */
	_onViewReady: function() {
		if (this._viewReady === false) {
			this._viewReady = true;
			this.viewDidBecomeReady();
		}
	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.3.0
	 */
	_onViewLayout: function() {
		this.viewDidUpdateLayout();
	},

	/**
	 * @hidden
	 * @author Jean-Philippe Dery (jeanphilippe.dery@gmail.com)
	 * @since  0.2.0
	 */
	_onWindowOrientationChange: function(e) {

		var name = Math.abs(window.orientation) === 90 ? 'landscape' : 'portrait';

		// <0.1-compat>
		if (this.didRotate) {
			this.didRotate(name);
			console.log('[DEPRECATION NOTICE] The method "didRotate" will be removed in 0.4, use the method "viewDidRotate" instead');
		}
		// </0.1-compat>

		this.viewDidRotate(name);
	}

});