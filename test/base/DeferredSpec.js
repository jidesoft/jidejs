define([
    'base/Deferred'
], function (Deferred) {
    describe('Deferred', function () {
        it('should invoke the callback when it is resolved before the callback is added', function(done) {
            var defer = new Deferred(),
                promise = defer.promise;
            defer.fulfill('test');
            promise.then(function(message) {
                expect(message).to.equal('test');
                done();
            });
        });

        it('should invoke the callback when it is added before the promise is resolved', function(done) {
            var defer = new Deferred(),
                promise = defer.promise;
            promise.then(function(message) {
                expect(message).to.equal('test');
                done();
            });
            defer.fulfill('test');
        });

        it('should be chainable', function(done) {
            var defer = new Deferred(),
                promise = defer.promise;
            var handler = promise.then(function(message) {
                return message.toUpperCase();
            }).then(function(upperCasedMessage) {
                 expect(upperCasedMessage).to.equal('MESSAGE');
                 done();
            });
            defer.fulfill('message');
        });

        it('should be chainable with a promise', function(done) {
            var defer = new Deferred(),
                promise = defer.promise;
            var handler = promise.then(function(message) {
                var defer = new Deferred(),
                    promise = defer.promise;
                defer.fulfill(message.toUpperCase());
                return promise;
            }).then(function(upperCasedMessage) {
                expect(upperCasedMessage).to.equal('MESSAGE');
                done();
            });
            defer.fulfill('message');
        });
    });
});