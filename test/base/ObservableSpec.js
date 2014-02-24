define([
    'base/Observable',
    'base/Deferred'
], function(Observable, Deferred) {
    describe('Observable', function () {
        it('should store a value', function() {
            var value = Observable();
            value.set('test');
            expect(value.get()).to.equal('test');
        });

        it('should notify listeners when its value changes', function(done) {
            var value = Observable();
            value.subscribe(function(event) {
                expect(event.value).to.equal('testing');
                done();
            });
            value.set('testing');
        });

        it('should emit the change event when its value changes$', function(done) {
            var value = Observable();
            value.on('change', function(event) {
                expect(event.value).to.equal('yay');
                done();
            });
            value.set('yay');
        });

        describe('#computed(fn)', function() {
            var value, computed;
            beforeEach(function() {
                value = Observable();
                computed = Observable.computed(function() {
                    return value.get().toUpperCase();
                });
            });

            afterEach(function() {
                computed.dispose();
                value.dispose();
            });

            it('should compute its value depending on the value of another observable', function() {
                value.set('test');
                expect(computed.get()).to.equal('TEST');
            });

            it('should recompute its value when the dependend observable is changed', function() {
                value.set('test');
                expect(computed.get()).to.equal('TEST');
                value.set('hello');
                expect(computed.get()).to.equal('HELLO');
            });

            it('should notify listeners of changes', function(done) {
                // we need to read computed at least once, otherwise it would not fire anything
                // as it is lazy
                value.set('test');
                expect(computed.get()).to.equal('TEST');
                computed.subscribe(function() {
                    expect(computed.get()).to.equal('HELLO');
                    done();
                });
                value.set('hello');
            });
        });

        describe('#computed(obj)', function() {
            it('should be writable', function() {
                var value = Observable(2),
                    computed = Observable.computed({
                        read: function() {
                            return value.get() * 2;
                        },

                        write: function(val) {
                            value.set((val / 2)|0);
                        }
                    });
                computed.set(8);
                expect(value.get()).to.equal(4);
            });

            it('should explicitly be writable', function() {
                var value = Observable(2),
                    computed = Observable.computed({
                        read: function() {
                            return value.get() * 2;
                        },

                        write: function(val) {
                            value.set((val / 2)|0);
                        }
                    });
                expect(computed.writable).to.be.true;
            });

            describe('lazy:false', function() {
                it('should fire change events even when not accessed before', function(done) {
                    var value = Observable(2),
                        computed = Observable.computed({
                            lazy: true,
                            read: function() {
                                return value.get() * 2;
                            }
                        });
                    computed.get();
                    computed.subscribe(function(event) {
                        expect(event.value).to.equal(8);
                        done();
                    });
                    value.set(4);
                    computed.dispose();
                    value.dispose();
                });
            });
        });

        describe('#when', function() {
            it('should update its value depending on an observable', function() {
                var value = Observable(false),
                    result = value.when().then('hello').otherwise('goodbye');
                expect(result.get()).to.equal('goodbye');
                value.set(true);
                expect(result.get()).to.equal('hello');
            });
        });

        describe('#map', function() {
            it('should change its value depending on an observable', function() {
                var value = Observable(2),
                    result = value.map(function(value) {
                        return value * 2;
                    });
                expect(result.get()).to.equal(4);
                value.set(4);
                expect(result.get()).to.equal(8);
            });
        });

        describe('fromPromise', function() {
            it('should convert a promise to an observable', function(done) {
                var defer = new Deferred(),
                    promise = defer.promise;
                var value = Observable.fromPromise(promise);
                value.subscribe(function(event) {
                    expect(value.get()).to.equal('value of promise');
                    done();
                });
                defer.fulfill('value of promise');
            });

            it('should provide the value in the event', function(done) {
                var defer = new Deferred(),
                    promise = defer.promise;
                var value = Observable.fromPromise(promise);
                value.subscribe(function(event) {
                    expect(event.value).to.equal('value of promise');
                    done();
                });
                defer.fulfill('value of promise');
            });
        });

        describe('#async', function() {
            it('is not invalidated instantly', function(done) {
                var value = Observable('test');
                var asyncValue = value.async(function(originalObservable) {
                    var defer = new Deferred();
                    setTimeout(function() {
                        expect(originalObservable.get()).to.equal('test');
                        defer.fulfill(originalObservable.get());
                    }, 1);
                    return defer.promise;
                });
                expect(asyncValue.get()).to.equal(null);
                asyncValue.subscribe(function(event) {
                    expect(event.value).to.equal('test');
                    done();
                });
            });

            it('It can be used to delay the execution of a computed observable', function(done) {
                Observable.computed(function() {
                    return 2 * 2;
                }).async(function(resultObservable) {
                    var defer = new Deferred();
                    setTimeout(function() {
                        expect(resultObservable.get()).to.equal(4);
                        defer.fulfill(resultObservable.get());
                    }, 1);
                    return defer.promise;
                }).subscribe(function(event) {
                    expect(event.value).to.equal(4);
                    done();
                });
            });
        });
    });
});