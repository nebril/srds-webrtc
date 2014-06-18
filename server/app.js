var path = require('path');

var connect = require('connect');

var app = connect().use(connect.static(path.join(__dirname, '..', 'dist')));

var server = require('http').createServer(app);
var io = require('socket.io')(server);


var users = [];

io.on('connection', function(socket){
	console.log("connected");
	var user = {};

	socket.on('peerId', function(id) {
		console.log("got peerId");

		user.id = id;
		if(users.length === 0) {
			user.index = 0;
		}else {
			user.index = users[users.length - 1].index + 1;
		}
		users.push(user);

		console.log("users:", users);

		socket.emit('index', user.index);

		io.emit('userList', users);
	});

	socket.on('disconnect', function() {
		var index = users.indexOf(user);
		users = users.slice(0, index).concat(users.slice(index + 1));

		io.emit('userList', users);
		console.log("after disco:", users);
	});
});

server.listen(80);