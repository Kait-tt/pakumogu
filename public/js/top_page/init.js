window.onload = initTopPage;
var socket;
var myId;

function initTopPage(){
	socket = new Socket(); //init socket when start client this is a global socket
	console.log("init top page");

	$("#enter").click(function() {
		var username = $("#username").val();
		socket.join(username);
		
		socket.on('joinRoom', (req) => {
	        console.log('on join room', req);
	        updateUserList(req.game.players);
	    });
		
		socket.on('yourInfo', (req) => {
			myId = req.id;
		});
		
		$("#enter").hide();
		$("#start").show();	
	});
	
	$("#start").click(function() { 
		socket.initGame();
	    socket.startGame();
	});
	
	socket.on('initGame', (req) => {
		console.log('on init game', req);
	});

    socket.on('startGame', (req) => {
        console.log('on start game', req);
        $('body').html("");
	    initGame(req.game.players, req.game.map, req.game.normalItems);

	    /*$('body').append("<div id='exit' style='position:absolute;padding-top: 50px'>Exit game</div>");
	    $("#exit").click(function() {
	    	//socket.leaveRoom(); //undefined method
		});*/
    });
}

function updateUserList(userObj){
	$("#userList").html("User List <br>");
	for(var i=0;i<userObj.length;i++){
		$("#userList").append(userObj[i].user.username + "<br>");
	}
	
}
