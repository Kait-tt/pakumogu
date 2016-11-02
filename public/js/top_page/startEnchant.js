window.onload = enchantTopPage;

var bgImg = '/img/title1.png';
var bg2Img = '/img/title2.png';

function enchantTopPage(){
	console.log("start game");
	enchant();
	
	var game = new Core(10 * pixel, 10 * pixel);
	game.fps = 30;
	game.preload(bgImg, bg2Img);
	game.onload = function () {
		
		/*var userNameBox = enchant.widget.InputTextBox();
		userNameBox.height = 40;
		userNameBox.width = 320;
		userNameBox.x = 140;
		userNameBox.y = 140;*/
		
		// 1 - Variables
		var scene, label, bg;
		// 2 - New scene
		scene = new Scene();
		// 3 - Add label
		label = new Label("Hi, Ocean!");        
		// 4 - Background
		bg = new Sprite(10 * pixel, 10 * pixel);
		bg.image = game.assets[bgImg];
		bg.scale(2, 1);
		// 5 - Add items
		scene.addChild(bg);        
		scene.addChild(label);
		// 6 - Start scene
		game.pushScene(scene);
	};
	
	game.start();
	/*
	*/
}