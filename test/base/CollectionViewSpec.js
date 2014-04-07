define([
    'base/ObservableList', 'base/CollectionView'
], function (ObservableList, CollectionView) {
    describe('CollectionView', function () {
        var source, view;
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
            view = CollectionView.from(source);
        });

        it('should contain the same number of items as the source Collection', function() {
            expect(view.length).to.equal(source.length);
            expect(toString(view)).to.equal('[Javascript, Java, Ruby, Lisp]');
        });

        it('should filter items through the filter property', function() {
            view.filter.set(function(item) {
                return item.speed === 'fast';
            });
            expect(toString(view)).to.equal('[Java]');
            expect(view.length).to.equal(1);
            expect(view.get(0).name).to.equal('Java');
        });

        it('should sort items through the compare property', function() {
            view.compare.set(sortBySpeed);
            expect(view.get(0).name).to.equal('Ruby');
            expect(view.get(3).name).to.equal('Java');
        });

        it('should filter sorted items through the compare and filter properties', function() {
            view.compare.set(sortBySpeed);
            view.filter.set(function(item) {
                return item.simplicity === 'high';
            });
            expect(toString(view)).to.equal('[Ruby, Lisp, Java]');
        });

        it('should filter items through the filter descriptions', function() {
            view.filterDescriptions.add({
                filter: function(item) {
                    return item.speed === 'low';
                }
            });
            expect(toString(view)).to.equal('[Ruby]');
        });

        it('should sort items through the sort descriptions', function() {
            view.sortDescriptions.add({
                compare: function(a, b) {
                    return sortBySpeed(a, b);
                }
            });
            expect(toString(view)).to.equal('[Ruby, Javascript, Lisp, Java]');
            expect(view.get(0).name).to.equal('Ruby');
            expect(view.get(3).name).to.equal('Java');
        });

        it('should sort items by multiple sort descriptions', function() {
            view.sortDescriptions.add({
                compare: function(a, b) {
                    return sortBySpeed(a, b);
                }
            });
            view.sortDescriptions.add({
                compare: function(a, b) {
                    return sortBySimplicity(a, b);
                }
            });
            expect(toString(view)).to.equal('[Ruby, Javascript, Lisp, Java]');
        });

        it('should sort filtered items by descriptions', function() {
            view.filterDescriptions.add({
                filter: function(item) {
                    return item.speed === 'medium';
                }
            });
            view.sortDescriptions.add({
                compare: sortBySimplicity
            });
            expect(toString(view)).to.equal('[Javascript, Lisp]');
        });

        it('should group items by description', function() {
            view.groupDescriptions.add({
                getGroupKey: function(item) {
                    return item.speed;
                }
            });
            expect(view.length).to.equal(3);
            expect(view.get(0).item).to.equal('medium');
            expect(view.get(1).item).to.equal('fast');
            expect(view.get(2).item).to.equal('low');

            expect(toString(view.get(0).children)).to.equal('[Javascript, Lisp]');
            expect(toString(view.get(1).children)).to.equal('[Java]');
            expect(toString(view.get(2).children)).to.equal('[Ruby]');
        });

        it('should group items by more than one descriptions', function() {
            view.groupDescriptions.add({
                getGroupKey: function(item) {
                    return item.speed;
                }
            });
            view.groupDescriptions.add({
                getGroupKey: function(item) {
                    return item.simplicity;
                }
            });
            expect(view.length).to.equal(3);
            expect(view.get(0).item).to.equal('medium');
            expect(view.get(0).children.get(0).item).to.equal('low');
            expect(view.get(0).children.get(1).item).to.equal('high');
            expect(view.get(0).children.get(0).children.get(0).name).to.equal('Javascript');
            expect(view.get(0).children.get(1).children.get(0).name).to.equal('Lisp');
        });
    });

    function sortBySimplicity(a, b) {
        if(a.simplicity === b.simplicity) return 0;
        if(a.simplicity === 'low') return -1;
        if(a.simplicity === 'high') return 1;
        if(b.simplicity === 'low') return 1;
        return -1;
    }

    function sortBySpeed(a, b) {
        if(a.speed === b.speed) return 0; // a = b
        if(a.speed === 'low') return -1; // b = medium | fast -> a < b
        if(a.speed === 'fast') return 1; // b = low | medium -> a > b
        if(b.speed === 'low') return 1; // a = medium -> a > b
        return -1; // a = medium & b = fast -> a < b
    }

    function toString(items) {
        return '['+items.toArray().map(function(item) { return item.name; }).join(', ')+']';
    }
});