define([
    'ui/Template',
    'text!test/fixtures/TemplateTest.html'
], function(Template, TemplateTest) {
    var t = Template(TemplateTest);

    describe('Template', function() {
        it('should have a content property', function() {
            expect(t.content).to.exist;
        });

        it('should not have children', function() {
            expect(t.childNodes.length).to.equal(0);
        });

        it('should have one pseudo child', function() {
            var pseudos = t.content.querySelectorAll('[pseudo]');
            expect(pseudos.length).to.equal(1);
        });

        it('should add classes to pseudo elements', function() {
            var pseudoDiv = t.content.querySelector('[pseudo="test"]');
            expect(pseudoDiv.className).to.equal('test');
        });

        describe('inner template', function() {
            it('has a child template', function() {
                var pseudoDiv = t.content.querySelector('[pseudo="test"]');
                expect(pseudoDiv.firstElementChild).to.exist;
            });

            it('has a content property', function() {
                var template = t.content.querySelector('[pseudo="test"]').firstElementChild;
                expect(template.content).to.exist;
            });

            it('has a content property with a li element', function() {
                var template = t.content.querySelector('[pseudo="test"]').firstElementChild;
                expect(template.content.childNodes[1].tagName).to.be.equal('LI');
            });
        });

        describe('when cloned', function() {
            var clone = t.content.cloneNode(true);

            it('should clone the content property', function() {
                var template = clone.querySelector('[pseudo="test"]').firstElementChild;
                expect(template.content).to.exist;
                expect(template.content.childNodes).to.exist;
                expect(template.content.childNodes.length).to.be.greaterThan(0);
                expect(template.content.childNodes[1].tagName).to.be.equal('LI');
            });
        });
    })
});