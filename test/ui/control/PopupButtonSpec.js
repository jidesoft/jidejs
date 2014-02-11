define([
    'ui/control/PopupButton',
    'ui/control/Popup'
], function (PopupButton, Popup) {
    describe('PopupButton', function () {
        var btn;
        beforeEach(function() {
            btn = new PopupButton({
                text: 'test',
                popup: new Popup({
                    content: 'Test'
                })
            });
        });

        afterEach(function() {
            btn.dispose();
        });

        it('should show the popup on action', function() {
            btn.emit('action');
            expect(btn.showing).to.equal(true);
        });

        it('should display the popup on action', function() {
            btn.emit('action');
            expect(btn.popup.visible).to.equal(true);
        });
    });
});