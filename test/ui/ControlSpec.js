define([
    'ui/Template',
    'ui/Control',
    'text!test/fixtures/ui/ControlTest.html'
], function(Template, Control, ControlTest) {
    var templates = Template.transformStringToElement(ControlTest);

    describe('Control', function() {
        describe('constructor', function() {
            it('should pick up the children from its element', function() {
                var template = templates.querySelector('#parseChildren').cloneNode(true);
                var c = new Control({
                    element: template
                });
                expect(c.tooltip).to.be.defined;
                expect(c.tooltip).to.not.be.null;
            });
        });
    });
});