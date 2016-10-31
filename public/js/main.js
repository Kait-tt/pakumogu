(function () {
    const socket = new Socket();
    const username = 'test_username';

    socket.join(username);

    socket.on('joinRoom', () => {
        console.log('on join room');
        socket.initGame();
    });

    socket.on('initGame', ({game}) => {
        console.log('on init game');
        console.log(game.players);
        socket.startGame();
    });

    socket.on('startGame', () => {
        console.log('on start game');
        let x = 0;
        let y = 0;
        setInterval(() => {
            socket.movePlayer({x: ++x, y: ++y});
        }, 500);
    });

    socket.on('movePlayer', ({player}) => {
        const {x, y} = player.coordinate;
        console.log('move', x, y);
    });
}());
