'use strict';

module.exports = {
    playerSize: 5,
    defaultAIDuration: 800, // sec
    defaultPowerItemSize: 5, // number of power items
    nearPowerItemDistance: 6,
    powerDuration: 5000, // sec

    // actual respawn time = respawnDuration + Math.random() * respawnDurationAlpha
    respawnDuration: 4000, // sec
    respawnDurationAlpha: 2000, // sec

    gameTimeLimit: 30000, // sec

    gameOffSetX: 480,
    gameOffSetY: 40
};
