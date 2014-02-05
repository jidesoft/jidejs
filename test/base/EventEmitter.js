define([
    'intern!bdd',
    'intern/chai!expect',
    'jidejs/base/EventEmitter'
], function (bdd, expect, EventEmitter) {
    with (bdd) {
        describe('EventEmitter', function () {
            it('should register and dispatch events', function() {
                var bus = new EventEmitter(),
                    count = 0;
                bus.on('test', function(event) {
                    count++;
                });
                bus.emit('test', { foo: 'bar' });
                expect(count).to.equal(1);
            });

            it('should dispose a subscription', function() {
                var bus = new EventEmitter(),
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