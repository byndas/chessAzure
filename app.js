var express = require('express'); // check

var app = express();
app.use(express.static('public'));

var http = require('http').Server(app); // check
var port = process.env.PORT || 3000;
var io = require('socket.io')(http); // check

/////////////////////////////////

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/default.html');
});

//////////////////////////////////////

io.on('connection', function(socket) {

    console.log('socket connected --> id: ' + socket.id);
    
    socket.on('disconnect', function() {
        console.log('socket disconnected --> id: ' + socket.id);
    });

    socket.on('gameOffered', function(data) {
        console.log(data);
        console.log('new ' + data[0] + ' minute game offered by --> id: ' + data[1]);
        
        socket.broadcast.emit('addGame', data);
    });

    socket.on('gameDone', function(data) {
        console.log(data);
        console.log('done with ' + data[0] + ' minute game offered by --> id: ' + data[1]);
        socket.emit('gameDone', data);
    });
    
    socket.on('chat message', function(msg) {
        console.log('socket id: ' + socket.id + ' --> says: ' + msg);
        // sends msg to other user connections
        socket.broadcast.emit('chat message', msg);
    });

    socket.on('move', function(clicks) {
        socket.broadcast.emit('move', clicks); 
    });
});

//////////////////////////////

http.listen(port, function() {
    console.log('listening on *: ' + port);
});