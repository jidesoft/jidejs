function replaceOutput(root, code) {
	eval(code);
}

function initUI(e, example) {
	require(['jidejs/ui/control/Button'], function(Button) {
		var outputElement = document.querySelector('[data-role="output"]')
			, jseditor = document.querySelector('[data-role="jseditor"]')
			, titleElement = document.querySelector('[data-role="title"]')
			, introElement = document.querySelector('[data-role="intro"]')
			, aboutElement = document.querySelector('[data-role="about"]')
			, buttonElement = document.querySelector('[data-role="run"]');

		jseditor.innerHTML = '';
		buttonElement.innerHTML = '';
		var editor = CodeMirror(jseditor, {
			value: example.get().js,
			mode:  "text/javascript",
			lineNumbers: true
		});
		editor.setOption("theme", 'vibrant-ink');
		var runButton = new Button({
			element: buttonElement,
			text: 'Run',
			classList: ['btn', 'btn-primary', 'btn-large'],
			on: {
				click: function() {
					outputElement.innerHTML = example.get().html || '';
					var code = editor.getValue();
					replaceOutput(outputElement, code);
				}
			}
		});
		runButton.classList.remove('jide-button');
		runButton.classList.remove('jide-buttonbase');
		runButton.classList.add('btn-large');
		example.subscribe(update);
		if(introElement.innerHTML === '') {
			update();
		}

		function update() {
			var demo = example.get();
			if(!demo) return;
			titleElement.innerHTML = demo.title;
			introElement.innerHTML = demo.intro;
			aboutElement.innerHTML = demo.about;
			editor.setValue(demo.js);
			outputElement.innerHTML = demo.html;
			replaceOutput(outputElement, editor.getValue());
		}
	});
}

function selectActiveMenu(exampleId) {
	var nav = document.getElementById('demo_nav'), previousExampleId, nextExampleId;
	exampleId.subscribe(update);
	update();

	$('.pager > .previous').on('click', function() {
		if($(this).hasClass('disabled')) return false;
		var id = previousExampleId;
		window.location.hash = id;
	});
	$('.pager > .next').on('click', function() {
		if($(this).hasClass('disabled')) return false;
		var id = nextExampleId;
		window.location.hash = id;
	});

	function update() {
		$(nav.querySelector('li.active')).removeClass('active');
		var id = '#!/'+exampleId.get();
		var link = nav.querySelector('a[href="'+id+'"]');
		if(link) {
			var $link = $(link.parentNode).addClass('active');

			var previousNode = $link.prev();
			while(previousNode && previousNode.hasClass('nav-header')) previousNode = previousNode.prev();
			if(previousNode && previousNode.hasClass('nav-header')) previousNode = null;

			var nextNode = $link.next();
			while(nextNode && nextNode.hasClass('nav-header')) nextNode = nextNode.next();
			if(nextNode && nextNode.hasClass('nav-header')) nextNode = null;

			if(previousNode) {
				previousNode = previousNode.find('a');
				previousExampleId = previousNode.attr('href');
				if(!previousExampleId) {
					$('.pager > .previous').addClass('disabled');
				} else {
					$('.pager > .previous').removeClass('disabled');
				}
			} else {
				$('.pager > .previous').addClass('disabled');
			}
			if(nextNode) {
				nextNode = nextNode.find('a');
				nextExampleId = nextNode.attr('href');
				if(!nextExampleId) {
					$('.pager > .next').addClass('disabled');
				} else {
					$('.pager > .next').removeClass('disabled');
				}
			} else {
				$('.pager > .next').addClass('disabled');
			}
		}
	}
}

require([
	'examples/examples', 'jidejs/base/Observable'
], function(Examples, Var) {
	var e = document.querySelector('[data-example]');
	var exampleId = Var(e.getAttribute('data-example'));
	var example = Var.computed(function() {
		return Examples[exampleId.get()];
	});
	window.addEventListener('hashchange', function() {
		var hash = window.location.hash.substr(3);
		if(hash !== '' && hash !== exampleId.get()) exampleId.set(hash);
	}, false);
//	if(window.history && window.history.pushState && window.location.href.match(/^http/)) {
//		window.history.pushState({}, example.get().title, 'http://js.jidesoft.com/docs/examples/'+exampleId.get());
//		var baseUrl = window.location.href.substr(0, window.location.href.length - exampleId.get().length-1);
//		exampleId.subscribe(function(event) {
//			window.history.pushState({}, example.get().title, baseUrl+'/'+event.value);
//		});
//		$('a[href^="#!/"]').click(function() {
//			exampleId.set($(this).attr('href').substr(3));
//			return false;
//		});
//	}
	selectActiveMenu(exampleId);
	initUI(e, example);
	// if the page has been loaded with a hash, update the example id
	if(window.location.hash) exampleId.set(window.location.hash.substr(3));
});