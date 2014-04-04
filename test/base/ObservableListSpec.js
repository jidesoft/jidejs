define([
    'base/ObservableList'
], function (ObservableList) {
    describe('ObservableList', function () {
        var source;
        beforeEach(function() {
            source = ObservableList([
                {
                    name: 'Javascript',
                    flexibility: 'high',
                    simplicity: 'low',
                    speed: 'medium'
                },
                {
                    name: 'Java',
                    flexibility: 'low',
                    simplicity: 'high',
                    speed: 'fast'
                },
                {
                    name: 'Ruby',
                    flexibility: 'high',
                    simplicity: 'high',
                    speed: 'low'
                },
                {
                    name: 'Lisp',
                    flexibility: 'high',
                    simplicity: 'high',
                    speed: 'medium'
                }
            ]);
        });

        it('should filter items', function() {
            var data = source.filter(function(item) {
                return item.speed === 'fast';
            });
            expect(data.length).to.equal(1);
            expect(data.get(0).name).to.equal('Java');
        });

        it('should sort items', function() {
            var speedTransform = {
                'low': 0,
                'medium': 1,
                'fast': 2
            };
            var data = source.sort(function(a, b) {
                return speedTransform[a.speed] - speedTransform[b.speed];
            });
            expect(data.length).to.equal(source.length);
            expect(data.get(0).name).to.equal('Ruby');
            expect(data.get(3).name).to.equal('Java');
        });

        it('should sort filtered items', function() {
            var data = source.filter(function(item) {
                return item.speed === 'fast';
            }).sort(function(a, b) {
                return -1;
            });
            expect(data.length).to.equal(1);
            expect(data.get(0).name).to.equal('Java');
        });
    });
});