window.onload = enchantTopPage;

var normalFont = 'Kazesawa, Arial, Helvetica, sans-serif';

var bgImg = '/img/title1.png';
var bg2Img = '/img/title2.png';
var gameImg = '/img/game.png';
var sheepImg = '/img/sheep.png';
var wolfImg = '/img/wolf.png';
var charImg = '/img/chara.png';
var resultImg = '/img/result.png';
var blackImg = '/img/blackbox.png';

var gameBgm = '/bgm/game1.mp3';
var topPageBgm = '/bgm/title.mp3';
var powerup1Bgm = '/bgm/powerup1.mp3';
var resultPageBgm = '/bgm/result.mp3';

var foodSe = '/se/food.mp3';
var sheepDeathSe = '/se/sheep_death.mp3';
var startSe = '/se/start.mp3';
var footStepsSe = '/se/foot_steps.mp3';
var decisionSe = '/se/decision.mp3';
var clearSe = '/se/clear.mp3';
var endSe = '/se/end.mp3';
var powerUpSe = '/se/power_up.mp3';
var wolfDeathSe = '/se/wolf_death.mp3';

var socket;
var myId;

var gameOffSetX = 480;
var gameOffSetY = 40;

var bgmController;

enchant.ui.assets = [
	'enchant_assets/pad.png',
	'enchant_assets/apad.png',
	'enchant_assets/icon0.png',
	'enchant_assets/font0.png'
];

enchant.widget.assets = [
	'enchant_assets/listItemBg.png',
	'enchant_assets/iconMenuBg.png',
	'enchant_assets/button.png',
	'enchant_assets/buttonPushed.png',
	'enchant_assets/dialog.png',
	'enchant_assets/navigationBar.png'
];

enchant.widget._env.font = `12px ${normalFont}`;
enchant.widget._env.buttonFont = `12px ${normalFont}`;
enchant.widget._env.navigationBarFont = `12px ${normalFont}`;
enchant.widget._env.textareaFont = `12px ${normalFont}`;




function enchantTopPage(){
	socket = new Socket();
	enchant();
	
	var game = new Core(1920, 1080);
	game.fps = 30;
	game.preload( 
			bgImg, bg2Img, gameImg, sheepImg, wolfImg, mapImg, charImg, itemImg, resultImg, blackImg, //img 
			gameBgm,  topPageBgm, powerup1Bgm, resultPageBgm,//bgm
			foodSe, sheepDeathSe, startSe, footStepsSe, decisionSe, clearSe, endSe, powerUpSe, wolfDeathSe//se
			);

	bgmController = new BGMController(game);

	game.onload = function () {
		goToTopScene(game);
	};

	game.start();

	// fix margin of main content
	const mainEle = document.getElementById('enchant-stage');
	mainEle.style.left = 0;
	mainEle.style.top = 0;
}
