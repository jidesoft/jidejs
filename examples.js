var express = require('express')
	, http = require('http')
	, path = require('path');

var app = express();
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.compress());
app.use(express.static(__dirname+'/demo/static'));
app.use(express.static(__dirname+'/demo'));
app.use(express.static(__dirname+'/base/src'));
app.use(express.static(__dirname+'/controls/src'));
app.use(express.static(__dirname+'/grid/src'));
app.use(function(req, res, next) {
	if(req.method === 'GET' && req.url === '/jide.css') {
		res.sendfile(__dirname+'/controls/style/default.css');
	} else {
		next();
	}
});
app.listen(3000);
console.log('Server started at port '+3000);