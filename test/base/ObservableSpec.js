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
    });

    describe('Observable', function() {
        describe('#async', function() {
            it('is not invalidated instantly', function(done) {
                var value = Observable('test');
                var asyncValue = value.async(function(originalObservable) {
                    var defer = new Deferred();
                    setTimeout(function() {
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
                        defer.fulfill(resultObservable.get());
                    }, 1);
                    return defer.promise;
                }).subscribe(function(event) {
                    expect(event.value).to.equal(4);
                    done();
                });
            });
        })
    })
});