define([
    'base/EventEmitter'
], function (EventEmitter) {
    describe('EventEmitter', function () {
        var bus;
        beforeEach(function() {
            bus = new EventEmitter();
        });

        afterEach(function() {
            bus.dispose();
        });

        it('should register and dispatch events', function(done) {
            bus.on('test', function(event) {
                expect(event.foo).to.equal('bar');
                done();
            });
            bus.emit('test', { foo: 'bar' });
        });

        it('should dispose a subscription', function() {
            var count = 0, subscription;
            subscription = bus.on('test', function(event) {
                count++;
            });
            bus.emit('test', { foo: 'bar' });
            subscription.dispose();
            bus.emit('test', { foo: 'bar' });
            expect(count).to.equal(1);
        });

        it('should fire an all event', function(done) {
            bus.on('all', function() {
                expect(arguments[0]).to.equal('first');
                expect(arguments[1]).to.equal('second');
                expect(arguments[2]).to.equal('third');
                expect(arguments[3]).to.equal('fourth');
                done();
            });
            bus.emit('first', 'second', 'third', 'fourth');
        });

        it('should allow users to register for multiple events at once', function() {
            var count = 0;
            bus.on({
                foo: function() {
                    count++;
                },
                bar: function() {
                    count++;
                }
            });
            bus.emit('foo');
            bus.emit('bar');
            expect(count).to.equal(2);
        });

        describe('#once', function() {
            it('should immediately dispose the subscription once it has fired', function() {
                var count = 0;
                bus.once('foo', function() {
                    count++;
                });
                bus.emit('foo');
                bus.emit('foo');
                expect(count).to.equal(1);
            });
        });
    });
});