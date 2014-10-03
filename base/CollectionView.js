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
                var filter = filters.get(i);
                if(typeof filter.canFilter === 'function') {
                    if(filter.canFilter(item)) {
                        if(!filter.filter(item)) {
                            return false;
                        }
                    }
                } else if(filter.filter(item)) {
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
                    value = 0;
                if(typeof comparator.canCompare === 'function') {
                    if(comparator.canCompare(a, b)) {
                        value = comparator.compare(a, b);
                    }
                } else {
                    value = comparator.compare(a, b)
                }
                if(value !== 0) {
                    return value;
                }
            }
            return 0;
        });
        this._filteredData = this._source.filter(this.filter);
        this._sortedData = this._filteredData.sort(this.compare);
        this._groupedData = null;

        this._sortedData.on('change', function(event) {
            if(!self.hasGroups) {
                self.updates.pipe(event);
            }
            self.updates.pipe(event, 'change:raw');
        });

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
            updateGroupStructure(self);
        });
    }
    Class(CollectionViewSource).extends(Collection).def({
        get sortedData() {
            return this._sortedData;
        },

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
            if(this.filterDescriptions.length === 0) {
                this._filteredData.matchAll();
            } else {
                this._filteredData.relaxFilter();
            }
        },

        updateFilter: function() {
            this._filteredData.updateFilter();
        },

        updateSort: function() {
            this._sortedData.comparatorProperty.notify();
            if(this._groupedData) {
                this._groupedData.comparatorProperty.notify();
                for(var i = 0, groups = this._groupedData, len = groups.length; i < len; i++) {
                    groups.get(i).updateSort();
                }
            }
        },

        filterDescriptions: null,
        groupDescriptions: null,
        sortDescriptions: null
    });

    var exports = {
        from: function(source) {
            if(source instanceof CollectionViewSource) {
                return source;
            } else if(source instanceof Collection) {
                return new CollectionViewSource(source);
            } else if(Array.isArray(source)) {
                return new CollectionViewSource(Collection.fromArray(source));
            } else {
                throw new Error('Unknown collection view source. Source is neither array nor collection.');
            }
        }
    };

    function updateGroupStructure(view) {
        var groupDescriptions = view.groupDescriptions,
            oldData;
        // check if we had groups before
        if(view._groupedData) {
            oldData = view._groupedData;
            // check if we still have groups
            if(groupDescriptions.length === 0) {
                view._groupedData = null;
                // okay, so we used to have groups but don't have them anymore, thus
                // we need to remove the old, grouped, data and add the sorted data
                replaceCollectionViewData(view, oldData, view._sortedData);
                oldData.dispose();
                return;
            }
        } else {
            // we didn't have groups before so the 'old' data is the sorted data
            oldData = view._sortedData;
        }

        // for now only support one level
        var topLevelGroup = groupDescriptions.get(0);
        view._groupedData = view._sortedData.groupBy(topLevelGroup.getGroupKey, topLevelGroup).map(function(key, index, source) {
            return new Group(view, key, source.getByKey(key), groupDescriptions, 1);
        }).filter(view.filter).sort(view.compare);
        replaceCollectionViewData(view, oldData, view._groupedData);
        view._groupedData.on('change', function(event) {
            view.updates.pipe(event);
        });
        if(oldData !== view._sortedData) {
            oldData.dispose();
        }
    }

    function replaceCollectionViewData(view, oldData, newData) {
        var publisher = view.updates;
        publisher.beginChange();
        // remove all old data
        for(var i = 0, data = oldData, len = data.length; i < len; i++) {
            publisher.remove(0, data.get(i));
        }
        // add new data
        for(i = 0, data = newData, len = data.length; i < len; i++) {
            publisher.insert(i, data.get(i));
        }
        publisher.commitChange();
    }

    function Group(view, key, items, groupDescriptions, level) {
        this._view = view;
        this.item = key;
        this._groupDescriptions = groupDescriptions;
        this._level = level;
        if(groupDescriptions.length > level) {
            var groupDescription = groupDescriptions.get(level);
            this.children = items.groupBy(groupDescription.getGroupKey, groupDescription).map(function(key, index, source) {
                return new Group(view, key, source.getByKey(key), groupDescriptions, level+1);
            }).filter(view.filter).sort(view.compare);
        } else {
            this.children = items;
        }
    }
    Class(Group).def({
        get isBottomLevel() {
            return this._level < this._groupDescriptions.length;
        },

        updateSort: function() {
            if(this.children.comparatorProperty) this.children.comparatorProperty.notify();
            if(!this.isBottomLevel) {
                for(var i = 0, groups = this.children, len = groups.length; i < len; i++) {
                    var group = groups.get(i);
                    if(group.updateSort) group.updateSort();
                }
            }
        }
    });

    return exports;
});