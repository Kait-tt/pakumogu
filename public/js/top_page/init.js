window.onload = initTopPage;
var socket;
var myId;
var title1Img = "/img/title1.png";
var title2Img = "/img/title2.png";

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
		
		//change ui to title2
		$(document.body).css("background-image", "url("+title2Img+")");
		$("#enter").hide();
		$("#usernameDiv").hide();
		
		$("#start").show();
		$("#back").show();
		$("#userList").show();
	});
	
	$("#start").click(function() { 
		socket.initGame();
	    socket.startGame();
	});
	
	$("#back").click(function() { 
		//remove user from join
	});
	
	socket.on('initGame', (req) => {
		console.log('on init game', req);
	});

    socket.on('startGame', (req) => {
        console.log('on start game', req);
        $('body').html("");
        initGame(req.game.players, req.game.map, req.game.normalItems);
    });
}

function updateUserList(userObj){
	$("#userList").html("");
	for(var i=0;i<userObj.length;i++){
		$("#userList").append(userObj[i].user.username + "<br>");
	}
}
