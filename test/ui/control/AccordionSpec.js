define([
    'ui/control/Accordion',
    'ui/control/TitledPane'
], function(Accordion, TitledPane) {
    describe('Accordion', function() {
        var accordion;
        beforeEach(function() {
            accordion = new Accordion({
                children: [
                    new TitledPane({
                        title: 'First',
                        content: 'Content 1'
                    }),
                    new TitledPane({
                        title: 'Second',
                        content: 'Content 2'
                    }),
                    new TitledPane({
                        title: 'Third',
                        content: 'Content 3'
                    })
                ]
            });
            document.body.appendChild(accordion.element);
        });

        afterEach(function() {
            accordion.dispose();
        });

        it('should have exactly one expanded child', function() {
            var count = 0;
            accordion.children.forEach(function(child) {
                if(child.expanded) count++;
            });
            expect(count).to.equal(1);
        });

        it('should update its expandedPane property', function() {
            var expanded = accordion.expandedPane;
            accordion.children.get(1).expanded = true;
            expect(accordion.expandedPane).to.not.be.null;
            expect(accordion.expandedPane.title).to.not.equal(expanded.title);
        });
    });
});