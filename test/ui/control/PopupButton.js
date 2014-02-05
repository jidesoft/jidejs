define([
    'intern!bdd',
    'intern/chai!expect',
    'jidejs/ui/control/PopupButton',
    'jidejs/ui/control/Popup'
], function (bdd, expect, PopupButton, Popup) {
    with (bdd) {
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
    }
});