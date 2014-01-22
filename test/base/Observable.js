define([
    'intern!bdd',
    'intern/chai!expect',
    'jidejs/base/Observable',
    'jidejs/base/Deferred'
], function (bdd, expect, Observable, Deferred) {
    with (bdd) {
        describe('Observable', function () {
            it('should store a value', function() {
                var value = Observable();
                value.set('test');
                expect(value.get()).to.equal('test');
            });

            describe('fromPromise', function() {
                it('should convert a promise to an observable', function() {
                    var defer = new Deferred(),
                        promise = defer.promise;
                    var value = Observable.fromPromise(promise),
                        dfd = this.async();
                    value.subscribe(dfd.callback(function(event) {
                        expect(value.get()).to.equal('value of promise');
                    }));
                    defer.fulfill('value of promise');
                });

                it('should provide the value in the event', function() {
                    var defer = new Deferred(),
                        promise = defer.promise;
                    var value = Observable.fromPromise(promise),
                        dfd = this.async();
                    value.subscribe(dfd.callback(function(event) {
                        expect(event.value).to.equal('value of promise');
                    }));
                    defer.fulfill('value of promise');
                });
            });
        });
    }
});