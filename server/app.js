var app = require('http').createServer();
var io = require('socket.io')(app);

var users = [];

io.on('connection', function(socket){
	console.log("connected");
	var user = {};

	socket.on('peerId', function(id) {
		console.log("got peerId");

		user.id = id;
		users.push(user);

		console.log("users:", users);

		socket.emit('index', users.indexOf(user));

		io.emit('userList', users);
	});

	socket.on('disconnect', function() {
		var index = users.indexOf(user);
		users = users.slice(0, index).concat(users.slice(index + 1));

		io.emit('userList', users);
		console.log("after disco:", users);
	});
});

app.listen(3000);