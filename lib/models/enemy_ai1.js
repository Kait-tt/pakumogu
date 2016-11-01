'use strict';

// —r‚Ö‚ÌÅ’Z‹——£‚ği‚Ş˜TAI
class EnemyAI1 {
    constructor (id, gameMap,mapMaxX,mapMaxY) {
        this.gameMap = gameMap;
        this.id = id;
        this.mapMaxX = mapMaxX;
        this.mapMaxY = mapMaxY;
    }

    // players = [player1, player2, ...]
    // player = {id, x, y, isEnemy}
    nextMove(players) {
        const me = players.find(player => player.id === this.id);
        const x = me.x;
        const y = me.y;
        const sheep = players.find(player => !player.isEnemy);
        if (x < 0 || this.mapMaxX <= x || y < 0 || this.mapMaxY <= y){
            return {x, y}
        }
        if (sheep.x < 0 || this.mapMaxX <= sheep.x || sheep.y < 0 || this.mapMaxY <= sheep.y) {
            return {x, y}
        }

        if (this.gameMap[y][x] == 1) {
            return {x, y}
        }
        if (this.gameMap[sheep.y][sheep.x] == 1) {
            return {x, y}
        }


        const oList = [];
        const oLMap = copy2DArray(this.gameMap);
        const cLMap = copy2DArray(this.gameMap);
        let nnn = [];//[x,y]
        let count = 2;

        oList.push([sheep.x, sheep.y]);
        oLMap[sheep.y][sheep.x] = 1;
        while (oList.length) {
            nnn[0] = oList[0][0];
            nnn[1] = oList[0][1];
            cLMap[nnn[1]][nnn[0]] = count;
            oList.shift();
            oLMap[nnn[1]][nnn[0]] = 0;
            if (nnn.toString() == [me.x-1, me.y].toString() ||
                nnn.toString() == [me.x+1, me.y].toString() ||
                nnn.toString() == [me.x, me.y-1].toString() ||
                nnn.toString() == [me.x, me.y+1].toString() ||
                nnn.toString() == [me.x, me.y].toString()) {
                return {x:nnn[0],y:nnn[1]}

            }
            // x+1,y:¨
            if (nnn[0] + 1 < this.mapMaxX) {
                if (cLMap[nnn[1]][nnn[0] + 1] == 0 && oLMap[nnn[1]][nnn[0] + 1] == 0) {
                    oList.push([nnn[0] + 1, nnn[1]]);
                    oLMap[nnn[1]][nnn[0] + 1] = 1;
                }
            }
            // x,y-1:ª
            if (0 <= nnn[1] - 1) {
                if (cLMap[nnn[1] - 1][nnn[0]] == 0 && oLMap[nnn[1] - 1][nnn[0]] == 0) {
                    oList.push([nnn[0], nnn[1] - 1]);
                    oLMap[nnn[1] - 1][nnn[0]] = 1;
                }
            }
            // x-1,y:©
            if (0 <= nnn[0] - 1) {
                if (cLMap[nnn[1]][nnn[0] - 1] == 0 && oLMap[nnn[1]][nnn[0] - 1] == 0) {
                    oList.push([nnn[0] - 1, nnn[1]]);
                    oLMap[nnn[1]][nnn[0] - 1] = 1;
                }
            }
            // x,y+1:«
            if (nnn[1] + 1 < this.mapMaxY) {
                if (cLMap[nnn[1] + 1][nnn[0]] == 0 && oLMap[nnn[1] + 1][nnn[0]] == 0) {
                    oList.push([nnn[0], nnn[1] + 1]);
                    oLMap[nnn[1] + 1][nnn[0]] = 1;
                }
            }
            count++;

        }
        return {x,y}
    }
}

function copy2DArray(src) {
    const res = [];
    for (let i = 0; i < src.length; i++) {
        const ary = [];
        for (let j = 0; j < src[i].length; j++) {
            ary.push(src[i][j]);
        }
        res.push(ary);
    }
    return res;
}

module.exports = EnemyAI1;
