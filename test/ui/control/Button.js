define([
    'intern!bdd',
    'intern/chai!expect',
    'jidejs/ui/control/Button'
], function (bdd, expect, Button) {
    var ButtonTestTemplate = [
        '<div>',
            '<div id="test_data_prop">',
                '<span data-property="icon">My Icon</span>',
                '<span data-property="text">My Text</span>',
            '</div>',
        '</div>'
    ].join('');
    function transformStringToElement(templateContent) {
        var div = document.createElement('div');
        div.innerHTML = templateContent;
        return div.firstElementChild;
    }

    var buttonElementTests = transformStringToElement(ButtonTestTemplate);

    with (bdd) {
        describe('Button', function () {
            describe('from HTML element', function() {
                var btn;
                beforeEach(function() {
                    btn = new Button({
                        element: buttonElementTests.querySelector('#test_data_prop')
                    });
                });

                afterEach(function() {
                    btn.dispose();
                });

                it('should have the text property set', function() {
                    expect(btn.text).to.not.be.null;
                });

                it('should have the icon property set', function() {
                    expect(btn.text).to.not.be.null;
                });
            });
        });
    }
});