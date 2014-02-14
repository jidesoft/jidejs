//region configure requirejs to load jide.js library
require.config({
	"packages": [{
		name: 'jidejs',
		location: '/bower_components/jidejs'
	}],
    paths: {
        text: '/bower_components/requirejs-text/text',
        Faker: '/bower_components/Faker/MinFaker'
    },
    shim: {
        'Faker': {
            exports: 'Faker'
        }
    }
});
//endregion

//region application code
require([
	'jidejs/base/Class',
	'jidejs/base/Observable',
	'jidejs/base/ObservableProperty',
	'jidejs/base/ObservableList',
	'jidejs/ui/layout/GridPane',
	'jidejs/ui/layout/BorderPane',
	'jidejs/ui/layout/HBox',
	'jidejs/ui/layout/VBox',
	'jidejs/ui/control/HTMLView',
	'jidejs/ui/control/ListView',
	'jidejs/ui/control/TextField',
	'jidejs/ui/control/Button',
    'Faker'
], function(
	Class, Observable, ObservableProperty, ObservableList,
	GridPane, BorderPane, HBox, VBox,
	HTMLView, ListView, TextField, Button, Faker
) {
	"use strict";

	//region define the data model
	function Contact(firstName, lastName, phoneNumber, city, street) {
		installer(this);
		// define and initialize the contact properties
		this.firstName = firstName;
		this.lastName = lastName;
		this.phoneNumber = phoneNumber;
		this.city = city;
		this.street = street;
	}
	var installer = ObservableProperty.install(Contact, 'firstName', 'lastName', 'phoneNumber', 'city', 'street');
	//endregion

	//region now create a list of Contacts
	var data = [];
	for(var i = 0; i < 50; i++) {
		data[i] = new Contact(Faker.Name.firstName(),
			Faker.Name.lastName(),
			Faker.PhoneNumber.phoneNumber(),
			Faker.Address.city(),
			Faker.Address.streetAddress(true));
	}
	var contacts = ObservableList(data);
	//endregion

	//region create the application UI
	// store some of the components for later use
	var contactList, firstNameField, lastNameField, phoneNumberField, cityField, streetField, header;
	new BorderPane({
		// select an existing element to append to it
		element: document.getElementById('approot'),
		width: '100%',
		// add children
		children: [
			// app header
			new HBox({
				'BorderPane.region': 'top',
				children: [
					new HTMLView({
						element: document.createElement('header'),
						content: '<h1>Contacts</h1>'
					})
				]
			}),
			new VBox({
				// specify area
				'BorderPane.region': 'right',
				// set css class for styling
				classList: ['sidebar'],
				// add children
				children: [
					contactList = new ListView({
						width: '100%',
						// set the contacts list as its items
						items: contacts,
						// use the first name of the contact as its representation in the list
						converter: function(contact) {
							return contact.firstNameProperty.concat(' ', contact.lastNameProperty);
						}
					})
				]
			}),
			// this box contains the "new" and "delete" buttons
			new HBox({
				'BorderPane.region': 'bottom',
				classList: ['menu'], // for styling
				children: [
					new Button({
						text: 'New',
						on: {
							action: function() {
								// create a new contact
								var newContact = new Contact('New Contact', '', '', '', '');
								// add it to the original contacts list, updates the ListView automatically
								contacts.add(newContact);
								// select the new contact
								contactList.selectionModel.clearAndSelect(newContact);
							}
						}
					}),
					new Button({
						text: 'Delete',
						on: {
							'action': function() {
								// delete the currently selected item from the list, updates the ListView automatically
								contacts.remove(contactList.selectionModel.selectedItem);
							}
						}
					})
				]
			}),
			new VBox({
				// place this grid in the center of the border pane
				'BorderPane.region': 'center',
				classList: ['contact-info'],
				children: [
					header = new HTMLView({
						element: document.createElement('h2'),
						style: {
							'font-size': '2em',
							'margin': '0 0 1em 0'
						}
					}),
					// add name field
					firstNameField = new TextField({
						width: '100%',
						promptText: 'First Name'
					}),
					lastNameField = new TextField({
						width: '100%',
						promptText: 'Last Name'
					}),
					// add phone number field
					phoneNumberField = new TextField({
						width: '100%',
						promptText: 'Phone number'
					}),
					cityField = new TextField({
						width: '100%',
						promptText: 'City'
					}),
					streetField = new TextField({
						width: '100%',
						promptText: 'Street'
					})
				]
			})
		]
	});
	//endregion

	//region setup data bindings
	var selectedItemProperty = contactList.selectionModel.selectedItemProperty;
	// bind the name field to the selected item, select its firstNameProperty and phoneNumberProperty
	// this binding will keep the data in the list, the cell and the textfields in sync. They all contain
	// the same data at the same time
	firstNameField.textProperty.bindBidirectional(selectedItemProperty.select('firstNameProperty'));
	lastNameField.textProperty.bindBidirectional(selectedItemProperty.select('lastNameProperty'));
	phoneNumberField.textProperty.bindBidirectional(selectedItemProperty.select('phoneNumberProperty'));
	cityField.textProperty.bindBidirectional(selectedItemProperty.select('cityProperty'));
	streetField.textProperty.bindBidirectional(selectedItemProperty.select('streetProperty'));
	header.contentProperty.bind(Observable.computed(function() {
		var selectedItem = selectedItemProperty.get();
		if(!selectedItem) return 'Please select a contact.';
		return selectedItem.firstName + ' ' + selectedItem.lastName;
	}));
	//endregion
});
//endregion