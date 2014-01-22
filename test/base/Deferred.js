define([
    'intern!bdd',
    'intern/chai!expect',
    'jidejs/base/Deferred'
], function (bdd, expect, Deferred) {
    with (bdd) {
        describe('Deferred', function () {
            it('should invoke the callback when it is resolved before the callback is added', function() {
                var defer = new Deferred(),
                    promise = defer.promise;
                defer.fulfill('test');
                return promise.then(function(message) {
                    expect(message).to.equal('test');
                });
            });

            it('should invoke the callback when it is added before the promise is resolved', function() {
                var defer = new Deferred(),
                    promise = defer.promise;
                var handler = promise.then(function(message) {
                    expect(message).to.equal('test');
                });
                defer.fulfill('test');
                return handler;
            });

            it('should be chainable', function() {
                var defer = new Deferred(),
                    promise = defer.promise;
                var handler = promise.then(function(message) {
                    return message.toUpperCase();
                }).then(function(upperCasedMessage) {
                     expect(upperCasedMessage).to.equal('MESSAGE');
                });
                defer.fulfill('message');
                return handler;
            });

            it('should be chainable with a promise', function() {
                var defer = new Deferred(),
                    promise = defer.promise;
                var handler = promise.then(function(message) {
                    var defer = new Deferred(),
                        promise = defer.promise;
                    defer.fulfill(message.toUpperCase());
                    return promise;
                }).then(function(upperCasedMessage) {
                    expect(upperCasedMessage).to.equal('MESSAGE');
                });
                defer.fulfill('message');
                return handler;
            });
        });
    }
});