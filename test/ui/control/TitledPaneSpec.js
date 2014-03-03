define([
    'ui/control/TitledPane'
], function(TitledPane) {
    describe('TitledPane', function() {
        var titledPane, div;
        beforeEach(function() {
            titledPane = new TitledPane({
                title: 'Test',
                content: 'Yay!'
            });
            div = document.createElement('div');
            div.appendChild(titledPane.element);
            document.body.appendChild(div);
        });

        afterEach(function() {
            document.body.removeChild(div);
            titledPane.dispose();
            div = null;
        });

        it('should fire a bubbling event when it is expanded', function(done) {
            titledPane.expanded = false;
            div.addEventListener('change:expanded', function(event) {
                expect(event.value).to.equal(true);
                done();
            }, false);
            titledPane.expanded = true;
        });

        it('should fire a bubbling event when it is collapsed', function(done) {
            titledPane.expanded = true;
            div.addEventListener('change:expanded', function(event) {
                expect(event.value).to.equal(false);
                done();
            }, false);
            titledPane.expanded = false;
        });
    });
});