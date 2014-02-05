define([
    'intern!bdd',
    'intern/chai!expect',
    'jidejs/ui/Component'
], function (bdd, expect, Component) {
    with (bdd) {
        describe('Component', function () {
            it('should register subscriptions and dispatch events', function() {
                var div = document.createElement('div');
                var bus = new Component(div),
                    count = 0;
                bus.on('test', function(event) {
                    count++;
                });
                bus.emit('test', { foo: 'bar' });
                expect(count).to.equal(1);
            });

            it('should dispose a subscription', function() {
                var div = document.createElement('div');
                var bus = new Component(div),
                    count = 0, subscription;
                subscription = bus.on('test', function(event) {
                    count++;
                });
                bus.emit('test', { foo: 'bar' });
                subscription.dispose();
                bus.emit('test', { foo: 'bar' });
                expect(count).to.equal(1);
            });
        });
    }
});