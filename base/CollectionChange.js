/**
 * @module jidejs/base/CollectionChange
 */
define(['./Class'], function(Class) {
    /**
     * Contains information about a single change in a collection.
     *
     * @constructor
     * @alias module:jidejs/base/CollectionChange
     * @param {Number} index The index of the change.
     * @param {*} oldValue The removed value.
     * @param {*} newValue The inserted value.
     * @property {Number} index The index of the change.
     * @property {*|undefined} oldValue The removed value or `undefined`, if no value was removed.
     * @property {*|undefined} newValue The inserted value or `undefined`, if no value was inserted.
     */
    var exports = function Change(index, oldValue, newValue) {
        this.index = index;
        this.oldValue = oldValue;
        this.newValue = newValue;
    };
    Class(Change).def(/** @lends module:jidejs/base/CollectionChange# */{
        /**
         * `true`, if this event represents a deletion; `false`, otherwise.
         *
         * Deletion events only have an {@link #oldValue} property.
         *
         * @type {boolean}
         */
        get isDelete() {
            return this.oldValue !== undefined && this.newValue === undefined;
        },

        /**
         * `true`, if this event represents an update; `false`, otherwise.
         *
         * Update events have both, {@link #oldValue} and {@link #newValue} properties.
         *
         * @type {boolean}
         */
        get isUpdate() {
            return this.oldValue !== undefined && this.newValue !== undefined;
        },

        /**
         * `true`, if this event represents an insertion; `false`, otherwise.
         *
         * Insertion events only have a {@link #newValue} property.
         *
         * @type {boolean}
         */
        get isInsert() {
            return this.newValue !== undefined && this.oldValue === undefined;
        }
    });
    return exports;
});