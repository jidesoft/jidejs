define([
    'ui/Component',
    'base/Observable'
], function (Component, Observable) {
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

        describe('initialization with bidirectional binding', function() {
            var component, bg;
            beforeEach(function() {
                var div = document.createElement('div');
                component = new Component(div);
                bg = Observable('#fff');
                Component.applyConfiguration(component, {
                    background: bg
                });
            });

            afterEach(function() {
                component.dispose();
                bg.dispose();
            });

            it('should set the value of the observable', function() {
                expect(component.background).to.equal('#fff');
            });

            it('should update the component if the observable changes', function() {
                bg.set('#000');
                expect(component.background).to.equal('#000');
            });

            it('should update the observable if the component changes', function() {
                component.background = '#333';
                expect(bg.get()).to.equal('#333');
            });
        });
    });
});