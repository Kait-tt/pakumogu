window.onload = enchantInit;

var normalFont = 'Kazesawa, Arial, Helvetica, sans-serif';

var bgImg = '/img/title.png';
var gameImg = '/img/game.png';
var charImg = '/img/chara.png';
var resultImg = '/img/result.png';
var blackImg = '/img/blackbox.png';
var startImg = '/img/start.png';
var readyImg = '/img/ready.png';
var finishImg = '/img/finish.png';
var bombImg = '/img/bomb.png';

var gameBgm = '/bgm/game1.mp3';
var game2Bgm = '/bgm/game2.mp3';
var game3Bgm = '/bgm/game3.mp3';
var topPageBgm = '/bgm/title.mp3';
var powerup1Bgm = '/bgm/powerup1.mp3';
var resultPageBgm = '/bgm/result.mp3';

var foodSe = '/se/food.mp3';
var sheepDeathSe = '/se/sheep_death.mp3';
var readySe = '/se/ready.mp3';
var startSe = '/se/start.mp3';
var waitingSe = '/se/choise.mp3';
var footStepsSe = '/se/foot_steps.mp3';
var decisionSe = '/se/decision.mp3';
var clearSe = '/se/clear.mp3';
var endSe = '/se/end.mp3';
var powerUpSe = '/se/power_up.mp3';
var wolfDeathSe = '/se/wolf_death.mp3';
var bombSe = '/se/bomb.mp3';
var respawnSe = '/se/respawn.mp3';

var socket;
var myId;

var pixel = 64;
var gameOffSetX = 480;
var gameOffSetY = 40;

var bgmController;
var topPage;

// must sync lib/modules/config.js
// for result page
var scoreBasePoints = {
	scoreTimePoint: 1,
	scoreNormalItemPoint: 50,
	scorePowerItemPoint: 500,
	scoreKillPoint: 200
};

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

function enchantInit(){
	socket = new Socket();
	enchant();
	
	var game = new Core(1920, 1080);
	game.fps = 30;
	game.preload( 
			bgImg, gameImg, mapImg, charImg, itemImg, resultImg, blackImg, startImg, readyImg, finishImg, bombImg, //img
			gameBgm, game2Bgm, game3Bgm, topPageBgm, powerup1Bgm, resultPageBgm,//bgm
			foodSe, sheepDeathSe, readySe, startSe, waitingSe, footStepsSe, decisionSe, clearSe, endSe, powerUpSe, wolfDeathSe, bombSe, respawnSe//se
			);

	bgmController = new BGMController(game);

	game.onload = function () {
		topPage = new TopPage(game);
		topPage.init();
	};

	game.start();

	// fix margin of main content
	const mainEle = document.getElementById('enchant-stage');
	mainEle.style.left = 0;
	mainEle.style.top = 0;
}
