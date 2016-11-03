const EnemyAI1 = require('../../lib/models/enemy_ai1');

const map = [
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
[1,0,1,0,1,1,0,1,0,1,1,0,1,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,1,0,1,0,1,1,1,0,1,0,1,0,1],
[1,0,0,0,1,0,0,1,0,0,1,0,0,0,1],
[1,1,1,0,1,1,0,0,0,1,1,0,1,1,1],
[0,0,0,0,0,1,0,1,0,1,0,0,0,0,0],
[1,1,1,0,0,0,0,0,0,0,0,0,1,1,1],
[1,0,0,0,1,1,0,1,0,1,1,0,0,0,1],
[1,0,0,1,1,1,0,1,0,1,1,1,0,0,1],
[1,1,0,0,0,0,0,1,0,0,0,0,0,1,1],
[1,0,0,1,1,0,0,0,0,0,1,1,0,0,1],
[1,0,1,1,1,1,0,1,0,1,1,1,1,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]

];
const p1x = 2;
const p1y = 7;
const p2x = 12;
const p2y = 7;

const mapMaxY = map.length;
for (let i = 0 ; i < mapMaxY-1 ; i++) {
    if (map[i].length != map[i + 1].length) {
        console.log("Error!:This map is dont rectangle!");
        return;
    }
}
const mapMaxX = map[0].length;
const eAI1 = new EnemyAI1(2,{
    tiles: map,
    width: mapMaxX,
    height: mapMaxY
});

//map[y][x]
// players = [player1, player2, ...]
// player = {id, x, y, isEnemy}

const player1 = { id: 1, x: p1x, y: p1y, isEnemy: false };
const player2 = { id: 2, x: p2x, y: p2y, isEnemy: true };
//const player3 = { id: 3, x: 2, y: 2, isEnemy: true };
const players = [player1, player2];

if (player1.x < 0 || mapMaxX <= player1.x || player1.y < 0 || mapMaxY <= player1.y){
    console.log("Error!:Player1 is outside of the Map")
    return;
}
if (player2.x < 0 || mapMaxX <= player2.x || player2.y < 0 || mapMaxY <= player2.y) {
    console.log("Error!:Player2 is outside of the Map")
    return;
}
if (map[player1.y][player1.x] == 1){
    console.log("Error!:Player1 is in the Wall")
    return;
}
if (map[player2.y][player2.x] == 1){
    console.log("Error!:Player2 is in the Wall")
    return;
}


let ans = {};
const testMap = copy2DArrayp(map);
testMap[player1.y][player1.x] = "A"
testMap[player2.y][player2.x] = "X"

let count = 0;
console.log("step" + count);
for (let i = 0; i < mapMaxY; i++) {
    console.log(testMap[i].join(','));
}


while ([player1.x, player1.y].toString() != [player2.x, player2.y].toString()) {
//while(count < 3){
    count++;
    testMap[player2.y][player2.x] = "x"
    console.time('nextMove');
    ans = eAI1.nextMove(players);
    console.timeEnd('nextMove');
    player2.x = ans.x;
    player2.y = ans.y;
    console.log("step" + count);
    testMap[player2.y][player2.x] = "X"
    
    for (let i = 0; i < mapMaxY; i++) {
        console.log(testMap[i].join(','));
    }    
}

console.log(count);



function copy2DArrayp(src) {
    const res = [];
    for (let i = 0; i < src.length; i++) {
        const ary = [];
        for (let j = 0; j < src[i].length; j++) {
            ary.push(""+src[i][j]);
        }
        res.push(ary);
    }
    return res;
}
