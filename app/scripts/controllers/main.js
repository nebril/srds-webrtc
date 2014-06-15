'use strict';

/**
 * @ngdoc function
 * @name webrtcApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the webrtcApp
 */
angular.module('webrtcApp')
  .controller('MainCtrl', function ($scope) {
  	$scope.connections = [];
  	$scope.myIndex = -1;

  	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    var peer = new Peer({key:'er5sknch9r418aor', debug: 3});
    var socket = io('http://localhost:3000');

    socket.on('index', function(index){
    	console.log('got index', index);
    	$scope.myIndex = index;
    });

    socket.on('userList', function(users){
    	users.forEach(function(incomingUser) {
    		var present = false;
    		$scope.connections.forEach(function(presentUser) {
    			if(presentUser.id === incomingUser.id){
    				present = true;
    			}
    		});

    		if(!present && incomingUser.id !== peer.id){
    			incomingUser.connected = false;
    			$scope.connections.push(incomingUser);
    		}
    	});

    	$scope.$apply();
    });

    peer.on('open', function(){
      socket.emit('peerId', peer.id);
    });

    peer.on('call', function(call){
    	call.answer(window.localStream);
    	renderRemote(call);
    });

    peer.on('error', function(err){
    	console.log('error', err);
    });



    $scope.$on('ngRepeatFinished', function() {
	    console.log('ng repeat finished');
	    $scope.connections.forEach(function(conn, index){
	    	if(!conn.connected && index > $scope.myIndex){
	    		peer.call(conn.id, window.localStream);
	    	}
	    });
	});


	function renderLocal() {
		console.log('trying to render local');
		navigator.getUserMedia({audio: true, video: true}, function(stream){
			console.log ('getting user media');

			var videoElement = document.getElementById('localVideo');
	        videoElement.src = URL.createObjectURL(stream);
	        videoElement.play();

	        window.localStream = stream;
	      }, function(){ window.setTimeout(renderLocal, 5000); });
	}
	renderLocal();

	function renderRemote(call) {
		console.log(call);
		call.on('stream', function(stream){
			var videoElement = document.getElementById('video');
	        videoElement.src = URL.createObjectURL(stream);
	        videoElement.play();
		});
	}

  });
