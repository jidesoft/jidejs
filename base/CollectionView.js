define([
    './Class', './Collection', './Observable',
    './ObservableList'
], function(
    Class, Collection, Observable, ObservableList
) {
    function CollectionViewSource(source) {
        Collection.call(this);
        var self = this;
        this._source = source;
        this.filterDescriptions = new ObservableList();
        this.sortDescriptions = new ObservableList();
        this.groupDescriptions = new ObservableList();

        this.filter = Observable(function(item) {
            var filters = self.filterDescriptions;
            if(filters.length === 0) {
                return true;
            }
            for(var i = 0, len = filters.length; i < len; i++) {
                if(!filters.get(i).filter(item)) {
                    return false;
                }
            }
            return true;
        });
        this.compare = Observable(function(a, b) {
            var sorters = self.sortDescriptions;
            if(sorters.length === 0) {
                return 0;
            }
            for(var i = 0, len = sorters.length; i < len; i++) {
                var comparator = sorters.get(i),
                    value = comparator.compare(a, b);
                if(value !== 0) {
                    return value;
                }
            }
            return 0;
        });
        this._filteredData = this._source.filter(this.filter);
        this._sortedData = this._filteredData.sort(this.compare);
        this._groupedData = null;

        this.filterDescriptions.on('change', function(event) {
            var changes = event.enumerator(),
                isTighten = false,
                isLoosen = false;
            while(changes.moveNext()) {
                var change = changes.current;
                if(change.isInsert) {
                    isTighten = true;
                }
                if(change.isDelete) {
                    isLoosen = true;
                }
            }
            if(isTighten === isLoosen) {
                self.updateFilter();
            } else if(isTighten) {
                self.constrainFilter();
            } else if(isLoosen) {
                self.relaxFilter();
            }
        });

        this.sortDescriptions.on('change', function() {
            self.updateSort();
        });

        this.groupDescriptions.on('change', function(event) {
//            var changes = event.changes,
//                insertCount = 0;
//            while(changes.moveNext()) {
//                var change = changes.current;
//                if(change.isInsert) {
//                    insertCount++;
//                } else {
            updateGroupStructure(self);
//                    break;
//                }
//            }
        });
    }
    Class(CollectionViewSource).extends(Collection).def({
        get source() {
            return this._source;
        },

        get hasGroups() {
            return this.groupDescriptions.length !== 0;
        },

        get length() {
            if(this.hasGroups) {
                return this._groupedData.length;
            } else {
                return this._sortedData.length;
            }
        },

        get: function(index) {
            if(this.hasGroups) return this._groupedData.get(index);
            return this._sortedData.get(index);
        },

        constrainFilter: function() {
            this._filteredData.constrainFilter();
        },

        relaxFilter: function() {
            this._filteredData.relaxFilter();
        },

        updateFilter: function() {
            this._filteredData.updateFilter();
        },

        updateSort: function() {
            this._sortedData.comparatorProperty.notify();
        },

        filterDescriptions: null,
        groupDescriptions: null,
        sortDescriptions: null
    });

    var exports = {
        from: function(source) {
            if(source instanceof Collection) {
                return new CollectionViewSource(source);
            }
        }
    };

    function updateGroupStructure(view) {
        var groupDescriptions = view.groupDescriptions;
        // for now only support one level
        var topLevelGroup = groupDescriptions.get(0);
        view._groupedData = view._sortedData.groupBy(topLevelGroup.getGroupKey, topLevelGroup).map(function(key, index, source) {
            return new Group(key, source.getByKey(key), groupDescriptions, 1);
        });
        var publisher = view.updates;
        publisher.beginChange();
        // remove all old data
        for(var i = 0, data = view._sortedData, len = data.length; i < len; i++) {
            publisher.remove(0, data.get(i));
        }
        // add new data
        for(i = 0, data = view._groupedData, len = data.length; i < len; i++) {
            publisher.insert(i, data.get(i));
        }
        publisher.commitChange();
    }

    function Group(key, items, groupDescriptions, level) {
        this.item = key;
        this._groupDescriptions = groupDescriptions;
        this._level = level;
        if(groupDescriptions.length > level) {
            var groupDescription = groupDescriptions.get(level);
            this.children = items.groupBy(groupDescription.getGroupKey, groupDescription).map(function(key, index, source) {
                return new Group(key, source.getByKey(key), groupDescriptions, level+1);
            });
        } else {
            this.children = items;
        }
    }
    Class(Group).def({
        get isBottomLevel() {
            return this._level < this._groupDescriptions.length;
        }
    });

    return exports;
});