define([
    './../../base/Class', './../control/SingleSelectionModel'
], function(Class, SingleSelectionModel) {
    function Selection(config, selectables, requireSelectedItem) {
        if(!config.selectionModel) config.selectionModel = new SingleSelectionModel(selectables, requireSelectedItem);
    }
    Class(Selection).def({
        selectionModel: null,
        get selectedItem() {
            return this.selectionModel.selectedItem;
        },

        set selectedItem(item) {
            this.selectionModel.selectedItem = item;
        },

        get selectedIndex() {
            return this.selectionModel.selectedIndex;
        },

        set selectedIndex(index) {
            this.selectionModel.selectedIndex = index;
        }
    });
    return Selection;
});