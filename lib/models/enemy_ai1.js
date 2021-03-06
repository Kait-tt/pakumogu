'use strict';
const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];

class EnemyAI1 {
    constructor (id, gameMap) {
        this.gameMap = gameMap.tiles;
        this.id = id;
        this.mapMaxX = gameMap.width;
        this.mapMaxY = gameMap.height;
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

        let rX,lX;
        if(x==this.mapMaxX - 1){
            rX = 0;
        }else{
            rX = x+1;
        }
        if(x==0){
            lX = this.mapMaxX - 1;
        }else{
            lX = x-1;
        }

        const oList = [];
        const oLMap = copy2DArray(this.gameMap);
        const cLMap = copy2DArray(this.gameMap);
        let nnn = [];//[x,y]
        let count = 2;

        oList.push([sheep.x, sheep.y]);
        oLMap[sheep.y][sheep.x] = 1;

        // other wolf is wall
        players
            .filter(p => p.isEnemy)
            .filter(p => p.id !== this.id)
            .forEach(p => { oLMap[p.y][p.x] = 1; });

        const hitList = [];

        while (oList.length) {
            nnn = oList.shift();
            cLMap[nnn[1]][nnn[0]] = count;
            oLMap[nnn[1]][nnn[0]] = 0;
            if (nnn.toString() == [rX, me.y].toString() ||
                nnn.toString() == [lX, me.y].toString() ||
                nnn.toString() == [me.x, me.y-1].toString() ||
                nnn.toString() == [me.x, me.y+1].toString() ||
                nnn.toString() == [me.x, me.y].toString()) {
                //
                // return {x:nnn[0], y:nnn[1]}
                hitList.push({x:nnn[0], y:nnn[1]});
                continue;
            }

            for (let i = 0; i < 4; i++) {
                let [nx, ny] = nnn;
                if(i == 1 && nx == this.mapMaxX-1){
                    nx = 0;
                }else if(i == 3 && nx == 0){
                    nx = this.mapMaxX-1;
                }else{
                    nx += DX[i];
                }
                ny += DY[i];
                if (nx < 0 || this.mapMaxX <= nx || ny < 0 || this.mapMaxY <= ny) { continue; }
                if (cLMap[ny][nx] == 0 && oLMap[ny][nx] == 0) {
                    oList.push([nx, ny]);
                    oLMap[ny][nx] = 1;
                }
            }

            count++;
        }

        if (hitList.length) {
            if (sheep.isInvincible) {
                while (hitList.length > 1) {
                    const {x, y} = hitList[0];
                    const xx = Math.abs(x - sheep.x);
                    const yy = Math.abs(y - sheep.y);
                    const dist = xx + yy;
                    if (dist > 4) { break; }
                    hitList.shift();
                }
                return hitList.shift();
            } else {
                return hitList.shift();
            }
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
