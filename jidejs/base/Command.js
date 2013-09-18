/**
 * Created with JetBrains WebStorm.
 * User: pago
 * Date: 26.09.12
 * Time: 07:57
 * To change this template use File | Settings | File Templates.
 */
define('jidejs/base/Command', ['jidejs/base/Class', 'jidejs/base/ObservableProperty'], function(Class, Observable) {
	function Command(onExecute) {
		installer(this);
		if(typeof onExecute !== 'undefined') {
			this.execute = onExecute;
		}
	}
	Class(Command).mixin(Observable).def({
		enabled: true, enabledProperty: null,
		execute: null
	});
	var installer = Observable.install(Command, 'enabled');
	return Command;
});