/**
 * @module jidejs/ui/render
 */
define(['./Template', './bind'], function(Template, bind) {
    /**
     * Renders a template so that it's contents can be bound to the given data.
     *
     * The template is expected to be a HTML5 Template element but can also be a string which is then converted into
     * such an element.
     *
     * @function
     * @alias module:jidejs/ui/render
     *
     * @param {string|HTMLTemplateElement} The template that should be rendered
     * @param {module:jidejs/ui/Component} The component that the template should be rendered to
     * @param {object} The data that should be bound to the template
     *
     * @see module:jidejs/ui/bind
     * @see module:jidejs/ui/Template
     */
    return function(template, component, data) {
        var element = Template(template).content.cloneNode(true);
        if(element.childNodes.length === 1) {
            element = element.childNodes[0];
//            var hasChildren = element.children.length > 0;
            var result = bind.elementTo(element, component, data);
            if(!result.controlsChildren) {
                bind.to(element, component, data);
            }
        } else {
            bind.to(element, component, data);
        }
        return element;
    };
});