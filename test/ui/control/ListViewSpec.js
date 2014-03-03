define([
    'ui/control/ListView'
], function(
    ListView
) {
    describe('ListView', function() {
        var listView;
        beforeEach(function() {
            listView = new ListView({
                items: [
                    'first',
                    'second',
                    'third'
                ]
            });
            document.body.appendChild(listView.element);
        });
        afterEach(function() {
            listView.dispose();
        });
        it('should display items', function() {
            var cells = listView.element.querySelectorAll('.jide-cell');
            expect(cells.length).to.equal(3);
        });
        it('should display a cells content', function() {
            var cell = listView.element.querySelector('.jide-cell .x-text');
            expect(cell.innerHTML).to.equal('first');
        });
    });
});