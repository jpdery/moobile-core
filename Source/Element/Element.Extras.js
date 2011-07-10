/*
---

name: Element.Extras

description: Provides extra methods to Element.

license: MIT-style license.

author:
	- Jean-Philippe Dery (jeanphilippe.dery@gmail.com)

requires:
	Core/Array
	Core/Element

provides:
	- Element.Extras

...
*/

(function() {
	
	var getChildElements = function() {
		return Array.from(this.childNodes);
	};
	
	Object.defineProperty(Element.prototype, 'childElements', {
		get: function() {
			return getChildElements.call(this);
		}	
	});
	
	Element.implement({
		
		getChildElements: function() {
			return getChildElements.call(this);
		},
		
		ingest: function(string) {
			var match = string.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
			if (match) string = match[1];
			this.set('html', string);
			return this
		}
	});	
	
})();