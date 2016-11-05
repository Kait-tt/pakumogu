'use strict';

module.exports = {
    gameLogFileName: 'game_log.json',

    playerSize: 5,
    defaultAIDuration: 800, // sec
    defaultPowerItemSize: 5, // number of power items
    nearPowerItemDistance: 6,
    powerDuration: 5000, // sec
    slowDuration: 3000, // sec

    // actual respawn time = respawnDuration + Math.random() * respawnDurationAlpha
    respawnDuration: 4000, // sec
    respawnDurationAlpha: 2000, // sec

    gameTimeLimit: 60000, // sec

    gameOffSetX: 480,
    gameOffSetY: 40,

    // score options
    scoreTimePoint: 1, // timeScore = floor(remaining-ms / 100) * point
    scoreNormalItemPoint: 50,
    scorePowerItemPoint: 500,
    scoreKillPoint: 200
};
