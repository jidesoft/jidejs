define(['../base/Util', '../base/Collection'], function(_, Collection){
    /**
     * A simple class that represents a node in a tree.
     *
     * A node without any children is also known as a Leaf.
     *
     * @param {object?} config The configuration object.
     * @property {boolean} isLeaf Is this TreeNode a leaf node (i.e. one without children)
     * @property {module:jidejs/base/Collection} children The children of this node.
     * @property {*} value The value of this node.
     */
    var exports = function(config) {
        config = config || {};
        this.isLeaf = typeof config.isLeaf !== 'undefined' ? config.isLeaf : typeof config.children === 'undefined';
        this.children = config.children || Collection.EMPTY;
        this.value = config.value || null;
    };
    return exports;
});