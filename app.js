var express = require('express'); // check

var app = express();
app.use(express.static('public'));

var http = require('http').Server(app); // check
var port = process.env.PORT || 3000;
var io = require('socket.io')(http); // check

var games = [];
/////////////////////////////////

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/default.html');
});

//////////////////////////////////////

io.on('connection', function(socket) {

    console.log('socket connected --> id: ' + socket.id);

    socket.on('requestOfferedGames', () => {
        socket.emit('loadOfferedGames', games);
    });

    socket.on('disconnect', function() {
        console.log('socket disconnected --> id: ' + socket.id);
    });

    socket.on('gameOffered', function(data) {
        console.log(data[0] + ' minute game offered by player 1 --> id: ' + data[1]);

        socket.join(data[1]);

        // sends data to everyone except sender
        socket.broadcast.emit('addGame', data);
        
        games.push( [socket.id, undefined] );
    });

    socket.on('initGame', function(data) {
        // player 2 joins room hosted by player 1
        socket.join(data[1]);
        /*
        for (let i = 0; i < games.length; i++) {
            if (games[i][0] === data[1]) {
                console.log('!!!')
                games[i][1] = socket.id;
                break;
            }
        }
        console.log('line 45: games --> ' + games);
        */
        
        // data --> [ duration, player1 socket.id ]

        // sends only to player 1 (private message)
        io.to(data[1]).emit('gameAccepted');
    });

    socket.on('gameDone', function(data) {
        console.log('done with ' + data[0] + ' minute game offered by --> id: ' + data[1]);
        socket.emit('gameDone', data);
        // removes that game from games
        for (let i = 0; i < games.length; i++) {
            if (games[i][0] === data[1]) {
                games.splice(i, 1); 
                break;
            }
        }
    });

    socket.on('chat message', function(msg) {
        console.log('socket id: ' + socket.id + ' --> says: ' + msg);
        // sends msg to other user connections, not sender
        socket.broadcast.emit('chat message', msg);
    });

    socket.on('move', function(clicks) {
        /*
        console.log('line 78: socket.id emits move --> ' + socket.id);
        console.log('line 79: moveclicks --> ' + clicks);
        console.log('line 80: games --> ' + games);
        
        // sends to all clients except sender
        // socket.broadcast.emit('move', clicks);
        
        let sendMoveToPlayer;

        for (let i = 0; i < games.length; i++) {
            if (games[i][0] === socket.id) {
                console.log('line 89: games['+i+'] --> ' + games[i]);
                sendMoveToPlayer = games[i][1];
                break;
            }
            else if (games[i][1] === socket.id) {
                console.log('line 94: games['+i+'] --> ' + games[i]);
                sendMoveToPlayer = games[i][0];
                break;
            }
        }

        console.log('line 100: sendMoveToPlayer --> ' + sendMoveToPlayer);
        */
        console.log('clicks[2]: ' + clicks[2]);
       // sends to all clients in room except sender
        socket.broadcast.to(clicks[2]).emit('move', clicks);

        // sends only to opponent's socket via: 
        // io.to(`${socket.id}`).emit('move', clicks);
        // io.to(sendMoveToPlayer).emit('move', clicks);
    });
});

//////////////////////////////

http.listen(port, function() {
    console.log('listening on *: ' + port);
});

// understand socket.emit