window.onload = enchantInit;

const normalFont = 'Kazesawa, Arial, Helvetica, sans-serif';

const bgImg = '/img/title.png';
const gameImg = '/img/game.png';
const game2Img = '/img/game2.png';
const charImg = '/img/chara.png';
const resultImg = '/img/result.png';
const blackImg = '/img/blackbox.png';
const startImg = '/img/start.png';
const readyImg = '/img/ready.png';
const finishImg = '/img/finish.png';
const bombImg = '/img/bomb.png';
const enterButtonImg = '/img/enter_button.png';
const startButtonImg = '/img/start_button.png';
const backButtonImg = '/img/back_button.png';
const nameBoardImg = '/img/name_board.png';

const gameBgm = '/bgm/game1.mp3';
const game2Bgm = '/bgm/game2.mp3';
const game3Bgm = '/bgm/game3.mp3';
const topPageBgm = '/bgm/title.mp3';
const powerup1Bgm = '/bgm/powerup1.mp3';
const resultPageBgm = '/bgm/result.mp3';

const foodSe = '/se/food.mp3';
const sheepDeathSe = '/se/sheep_death.mp3';
const readySe = '/se/ready.mp3';
const startSe = '/se/start.mp3';
const waitingSe = '/se/choise.mp3';
const footStepsSe = '/se/foot_steps.mp3';
const decisionSe = '/se/decision.mp3';
const clearSe = '/se/clear.mp3';
const endSe = '/se/end.mp3';
const powerUpSe = '/se/power_up.mp3';
const wolfDeathSe = '/se/wolf_death.mp3';
const bombSe = '/se/bomb.mp3';
const respawnSe = '/se/respawn.mp3';

// config
const pixel = 64;
const GAME_OFFSET_X = 480;
const GAME_OFFSET_Y = 40;
const SHEEP_SPEED = 8;
const WOLF_SPEED = 4;
const SLOW_SPEED = 2;
const MOVE_FRAME_COUNT_LIMIT = 3;

// global
const DIRS = ['up', 'right', 'down', 'left'];
const DX   = [0, 1, 0, -1];
const DY   = [-1, 0, 1, 0];
let bgmController;
let topPage;
let playPage;
let resultPage;
let socket;
let myId;

// must sync with lib/modules/config.js
// for result page
const scoreBasePoints = {
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
			bgImg, gameImg, game2Img, mapImg, charImg, itemImg, resultImg, blackImg, startImg, readyImg, finishImg, bombImg, enterButtonImg, startButtonImg, backButtonImg, nameBoardImg, //img
			gameBgm, game2Bgm, game3Bgm, topPageBgm, powerup1Bgm, resultPageBgm,//bgm
			foodSe, sheepDeathSe, readySe, startSe, waitingSe, footStepsSe, decisionSe, clearSe, endSe, powerUpSe, wolfDeathSe, bombSe, respawnSe//se
			);

	bgmController = new BGMController(game);

	game.onload = function () {
		topPage = new TopPage(game);
		playPage = new PlayPage(game);
		resultPage = new ResultPage(game);
		topPage.init();
	};

	game.start();

	// fix margin of main content
	const mainEle = document.getElementById('enchant-stage');
	mainEle.style.left = 0;
	mainEle.style.top = 0;
}
