(function() {
	var lis = document.getElementsByClassName('apidoc')[0].querySelectorAll('li');
	var activePage = window.location.href;
	activePage = activePage.substring(activePage.lastIndexOf('/')+1);
	for(var i = 0, len = lis.length; i < len; i++) {
		var li = lis[i]
			, a = li.firstElementChild
			, href = a && a.getAttribute('href');
		if(activePage === href) {
			li.className += ' active';
			return;
		}
	}
}());