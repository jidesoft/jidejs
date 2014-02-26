/**
 * @module jidejs/base/ChangeEventAssembler
 */
define(['./Class'], function(Class) {
    function ChangeEvent(source, changes) {
        this.source = source;
        this.changes = changes;
        this.length = changes.length;
    }
    Class(ChangeEvent).def({
        enumerator: function() {
            return new Enumerator.Array(this.changes);
        }
    });

    /**
     * The ChangeEventAssembler is responsible for creating a {@link event:module:jidejs/base/Collection#change}.
     *
     * @constructor
     * @alias module:jidejs/base/ChangeEventAssembler
     * @param {module:jidejs/base/Collection} source The source for the assembled events.
     */
    var exports = function ChangeEventAssembler(source) {
        this.source = source;
        this.changes = null;
        this.level = 0;
        this.useCapture = false;
        this.needsChangeSorting = false;
    };
    Class(exports).def(/** @lends module:jidejs/base/ChangeEventAssembler# */{
        /**
         * Adds a new insert event.
         * @param {Number} index The index at which the item was inserted.
         * @param {*} value The inserted value.
         */
        insert: function(index, value) {
            this.update(index, undefined, value);
        },

        /**
         * Adds a new delete event.
         * @param {Number} index The index from which the item was removed.
         * @param {*} value The removed value.
         */
        remove: function(index, value) {
            this.update(index, value, undefined);
        },

        /**
         * Adds a new update event.
         * @param {Number} index The index at which the value was changed.
         * @param {*} oldValue The previous value.
         * @param {*} newValue The new value.
         */
        update: function(index, oldValue, newValue) {
            var previousChange = this.changes[this.changes.length-1];
            if(previousChange && index < previousChange.index) {
                this.needsChangeSorting = true;
            }
            this.changes.push(new Change(index, oldValue, newValue));
        },

        /**
         * Prepares the assembling process, must be called before any other method.
         */
        beginChange: function(useCapture) {
            if(!this.useCapture) {
                this.changes = [];
                this.useCapture = useCapture;
            } else if(useCapture) {
                this.level++;
            }
        },

        /**
         * Dispatches the created `change` event.
         * It will reorder all previously created events by their index and tries to compress them when possible.
         */
        commitChange: function() {
            if(this.useCapture && this.level > 0) {
                this.level--;
                return;
            }
            if(this.changes.length > 0) {
                var changes = this.changes;
                /* // TODO the standard sorting is not smart enough, figure out a way to optimize events anyway
                 if(this.needsChangeSorting) changes.sort(changeComparator);
                 var result = [];
                 for(var i = 0, len = changes.length; i < len; i++) {
                 var change = changes[i], last = result[result.length-1];
                 if(!change.isUpdate && last
                 && last.index === change.index
                 && (change.isInsert && last.isDelete || change.isDelete && last.isInsert)) {
                 //if(!change.isUpdate && (last = result[result.length-1]) && !last.isUpdate && last.index === change.index) {
                 if(last.isDelete) {
                 last.newValue = change.newValue;
                 } else {
                 last.oldValue = change.oldValue;
                 }
                 } else if(last && change.index === last.index) {
                 if(last.isUpdate && change.isInsert && last.oldValue === change.newValue) {
                 last.oldValue = undefined;
                 } else {
                 result[result.length] = change;
                 }
                 } else {
                 result[result.length] = change;
                 }
                 }
                 this.needsChangeSorting = false;
                 var event = new ChangeEvent(this.source, result);*/
                var event = new ChangeEvent(this.source, changes);
                this.source.emit('change', event);
            }
            this.changes = null;
        },

        /**
         * Cancels the event assembling.
         * @returns {*|Array} The changes that were generated so far.
         */
        cancelChange: function() {
            // todo update to revert only the changes done at this level
            var changes = this.changes;
            this.level = 0;
            this.needsChangeSorting = false;
            this.useCapture = false;
            this.changes = null;
            return changes;
        },

        /**
         * Pipes an event from another collection through this EventAssembler.
         * @param {jidejs/base/ChangeEvent} event The event.
         */
        pipe: function(event) {
            this.source.emit('change', new ChangeEvent(this.source, event.changes));
        }
    });
    return exports;
});