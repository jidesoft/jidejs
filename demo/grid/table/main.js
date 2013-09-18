// configure requirejs to load jide.js library
require.config({
	"packages": [{
		name: 'jidejs/base',
		location: '../../../base/src/jidejs/base'
	}, {
		name: 'jidejs/ui',
		location: '../../../controls/src/jidejs/ui'
	}, {
		name: 'jidejs/grid',
		location: '../../../grid/src/jidejs/grid'
	}]
});

var data = [];

require([
	'jidejs/base/Class', 'jidejs/base/Observable', 'jidejs/base/ObservableList', 'jidejs/base/ObservableProperty',
	'jidejs/base/Util',
	'jidejs/grid/TableModel', 'jidejs/grid/TableSelectionModel',
	'jidejs/grid/TableColumn',
	'jidejs/grid/RowGroupCell',
	'jidejs/grid/Table',
	'jidejs/ui/control/ChoiceBox'
], function(
	Class, Observable, ObservableList, ObservableProperty, _,
	TableModel, TableSelectionModel, TableColumn, RowGroupCell, Table, ChoiceBox
) {
	var GENDER = {
		MALE: 1,
		FEMALE: 2
	};
	function Person(firstName, lastName, age, gender) {
		personInstaller(this);
		this.firstName = firstName;
		this.lastName = lastName;
		this.age = age;
		this.gender = gender;
	}
	var personInstaller = ObservableProperty.install(Person, 'firstName', 'lastName', 'age', 'gender');

	//var data = [];
	var changedPerson;
	for(var i = 0; i < 50; i++) {
		var person = new Person(
			Faker.Name.firstName(),
			Faker.Name.lastName(),
			18+Math.floor(Math.random() * 50),
			Math.random() > 0.5 ? GENDER.FEMALE : GENDER.MALE
		);
		if(!changedPerson) changedPerson = person;
		data.push(person);
	}
	data = new ObservableList(data);

	var genderFilter = new ChoiceBox({
		items: ['Male', 'Female', 'Both']
	});
	genderFilter.selectionModel.select(0);
	var genderMatcher = genderFilter.selectionModel.selectedItemProperty.equal('Male').when().then(function(person) {
		return person.gender === GENDER.MALE;
	}).otherwise(function(person) {
		return genderFilter.selectionModel.selectedItem === 'Female' ? person.gender === GENDER.FEMALE : true;
	});
	document.body.appendChild(genderFilter.element);

	var ageColumn, genderColumn, firstNameColumn, peopleColumn;
	//region Basic table demo
	var table = new Table({
		width: '100%',
		height: '300px',

		selectionModel: new TableSelectionModel(null, {
			type: TableSelectionModel.Type.ROW,
			mode: TableSelectionModel.Mode.MULTI_SELECTION
		}),

		model: new TableModel({
			rows: data,

			columns: peopleColumn = new TableColumn({
				text: null,
				children: [
					new TableColumn({
						text: 'Age', width: 80, visible: true,
						cellValue: 'ageProperty',
						sortable: true,
						compareTo: function(a, b) {
							return a.age - b.age;
						}
					}),
					new TableColumn({
						editable: true,
						text: 'First Name',
						width: 300,
						cellValue: 'firstNameProperty',

						sortable: true, filterable: true,
						compareTo: function(a, b) {
							return a.firstName.localeCompare(b.firstName);
						}
					}),
					new TableColumn({
						editable: true,
						text: 'Last Name',
						width: 200,
						cellValue: 'lastNameProperty',

						sortable: true,
						compareTo: function(a, b) {
							return a.lastName.localeCompare(b.lastName);
						}
					}),
					genderColumn = new TableColumn({
						text: 'Gender',
						width: 80,
						cellValue: function(data) {
							return data.genderProperty.equal(GENDER.MALE).when().then('Male').otherwise('Female');
						},

						filterable: true,
						sortable: true,
						compareTo: function(a, b) {
							return a.gender - b.gender;
						}
					})
				]
			})
		})
	});
	genderColumn.matcherProperty.bind(genderMatcher);
	document.body.appendChild(table.element);
	//endregion

	//region Table with child rows
	table = new Table({
		width: '600px',
		height: '600px',
		selectionModel: new TableSelectionModel(null, {
			type: TableSelectionModel.Type.CELL,
			mode: TableSelectionModel.Mode.MULTI_SELECTION,

			isSelectable: function(cell) {
				return cell.column !== peopleColumn;
			}
		}),
		model: new TableModel({
			rows: data,

			hasColumnSpan: function(item) {
				return !(item instanceof Person);
			},

			getColumnAt: function(item, columnIndex, column) {
				if(!(item instanceof Person) && columnIndex === 0) {
					return column.parent;
				}
				return column;
			},

			hasChildren: function(item) {
				return !(item instanceof Person);
			},

			getChildren: function(item) {
				return item.children;
			},

			columns: peopleColumn = new TableColumn({
				text: 'People',
				cellValue: function(item) {
					var key = item.key;
					return 'Age: '+(key)+' to '+(key+9);
				},
				children: [
					ageColumn = new TableColumn({
						text: 'Age', width: 80, visible: true,
						cellValue: 'ageProperty',
						sortable: true,
						compareTo: function(a, b) {
							return a.age - b.age;
						},

						groupable: true,
						groupKeySelector: function(person) {
							var age = person.age;
							if(age < 20) return 10;
							if(age < 30) return 20;
							if(age < 40) return 30;
							if(age < 50) return 40;
							if(age < 60) return 50;
							if(age < 70) return 60;
							return 70;
						}
					}),
					new TableColumn({
						text: null,
						children: [
							new TableColumn({
								text: 'Name',
								children: [
									firstNameColumn = new TableColumn({
										editable: true,
										text: 'First Name',
										width: 300,
										cellValue: 'firstNameProperty',

										sortable: true,
										compareTo: function(a, b) {
											return a.firstName.localeCompare(b.firstName);
										}
									}),
									new TableColumn({ editable: true, text: 'Last Name', width: 200, cellValue: 'lastNameProperty' })
								]
							}),

							genderColumn = new TableColumn({
								text: 'Gender',
								width: 80,
								cellValue: function(data) {
									return data.genderProperty.equal(GENDER.MALE).when().then('Male').otherwise('Female');
								},

								filterable: true,
								sortable: true,
								compareTo: function(a, b) {
									return a.gender - b.gender;
								}
							})
						]
					})
				]
			})
		})
	});
	genderColumn.matcherProperty.bind(genderMatcher);
	table.model.setSortColumn(ageColumn);
	table.model.addSortColumn(firstNameColumn);
	table.model.groupBy(ageColumn);
	document.body.appendChild(table.element);
	//endregion

	//region Modify data
	// change the first row
	setTimeout(function() {
		changedPerson.firstName = 'Patrick';
		changedPerson.lastName = 'Gotthardt';

		setTimeout(function() {
			// add another row
			var addedPerson = new Person(
				Faker.Name.firstName(),
				Faker.Name.lastName(),
				18+Math.floor(Math.random() * 50),
				Math.random() > 0.5 ? GENDER.FEMALE : GENDER.MALE
			);
			data.insertAt(0, addedPerson);

			setTimeout(function() {
				// and then remove a row
				data.removeAt(2);
			}, 1000);
		}, 1000);
	}, 1000);
	//endregion

	//region Table with row spanning
	function getAgeKey(person) {
		var age = person.age;
		if(age < 20) return 10;
		if(age < 30) return 20;
		if(age < 40) return 30;
		if(age < 50) return 40;
		if(age < 60) return 50;
		if(age < 70) return 60;
		return 70;
	}

	var table2 = new Table({
		width: '600px',
		height: '600px',
		model: model = new TableModel({
			hasColumnSpan: function(item) {
				return !(item instanceof Person);
			},

			getColumnAt: function(item, columnIndex, column) {
				if((item instanceof Person) || columnIndex === 0) {
					return column;
				}
				return column.parent;
			},

			rows: data,
			columns: new TableColumn({
				text: 'People',
				children: [
					new TableColumn({
						text: 'Age', width: 80, visible: true,
						cellValue: function(item) {
							return item instanceof Person ? item.age : item.key;
						},
						sortable: true,
						groupable: true,
						groupKeySelector: function(personOrKey) {
							return getAgeKey(personOrKey);
						}
					}),
					new TableColumn({
						text: null,
						cellValue: function(item) {
							return item.children;
						},
						children: [
							genderColumn = new TableColumn({
								text: 'Gender',
								width: 80,
								cellValue: function(data) {
									if(!(data instanceof Person)) {
										return data.key;
									}
									return data.genderProperty.equal(GENDER.MALE).when().then('Male').otherwise('Female');
								},

								sortable: true,
								groupable: true,
								groupKeySelector: function(person) {
									return (person.gender === GENDER.MALE ? 'Male' : 'Female');
								},

								filterable: true,
								get filterEditor() {
									if(this._filterEditor) {
										return this._filterEditor;
									}

									var editor = new ChoiceBox({
										items: ['Any', 'Male', 'Female']
									});
									editor.selectionModel.select(0);
									editor.selectionModel.selectedIndexProperty.subscribe(function(value) {
										this.matcher = function(item) {
											return value === 0 ? true : item.gender === value;
										}.bind(this);
									}, this);

									this._filterEditor = editor;
									return editor;
								}
							}),
							new TableColumn({
								text: 'Name',
								cellValue: function(item) {
									return item.children;
								},
								children: [
									new TableColumn({
										text: 'First Name',
										width: 300,
										cellValue: 'firstNameProperty'
									}),
									new TableColumn({ text: 'Last Name', width: 200, cellValue: 'lastNameProperty' })
								]
							})
						]
					})
				]
			})
		})
	});
	//genderColumn.matcherProperty.bind(genderMatcher);
	table2.model.groupBy(table2.columns.get(0));
	table2.model.addGroupBy(genderColumn);
	document.body.appendChild(table2.element);
	//endregion
});