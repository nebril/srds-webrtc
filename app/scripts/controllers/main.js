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
  	function renderLocal() {
		navigator.getUserMedia({audio: true, video: true}, function(stream){
			var videoElement = document.getElementById('localVideo');
	        videoElement.src = URL.createObjectURL(stream);
	        videoElement.play();

	        window.localStream = stream;
	        init();
	      }, function(){ window.setTimeout(renderLocal, 5000); });
	}
	renderLocal();


	function init() {
		var peer = new Peer({key:'er5sknch9r418aor'});
	    var socket = io('http://178.216.200.175:80');

	    socket.on('index', function(index){
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

	    	$scope.connections.forEach(function(presentUser, index) {
	    		var incoming = false;

	    		users.forEach(function(incomingUser, i){
	    			if(presentUser.id === incomingUser.id) {
	    				incoming = true;
	    			}
	    		});

	    		if(!incoming && index >= 0){
	    			$scope.connections = $scope.connections.slice(0, index).concat($scope.connections.slice(index + 1));
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

	    $scope.$on('ngRepeatFinished', callNewer);

		function callNewer(){
		    $scope.connections.forEach(function(conn){
		    	if(!conn.connected && conn.index > $scope.myIndex && typeof(window.localStream) !== 'undefined'){
		    		renderRemote(peer.call(conn.id, window.localStream));
		    		conn.connected = true;
		    	}
		    });
		}

		function renderRemote(call) {
			call.on('stream', function(stream){
				var videoElement = document.getElementById('video-'+call.peer);
		        videoElement.src = URL.createObjectURL(stream);
		        videoElement.play();
			});
		}
	}
  });
