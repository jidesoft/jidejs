define(['jidejs/base/Class', 'jidejs/base/ObservableProperty'], function(Class, ObservableProperty) {
	"use strict";

	// define the user type
	function User(data) {
		// store original github data
		this._data = data;
		installer(this);

		this.login = data.login;
		this.avatarUrl = data.avatar_url;
		this.profileUrl = data.html_url;

		// and register in store
		register(this);
	}
	var installer = ObservableProperty.install(User, 'login', 'avatarUrl', 'profileUrl');

	// and add store and retrieve abilities
	var store = {};
	function register(user) {
		store[user._data.login] = user;
	}

	// Returns the user with the given login
	User.find = function(login) {
		return store[login];
	};

	User.getOrCreate = function(data) {
		if(!data) return null;
		if((data.login) in store) {
			return store[data.login];
		}
		return new User(data);
	};

	return User;
});