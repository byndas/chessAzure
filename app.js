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
    console.log('new client --> socket id: ' + socket.id);
    
    socket.on('disconnect', function() {
        console.log('client disconnected --> socket id: ' + socket.id);
    });

    socket.on('chat message', function(msg) {
        // consoles out to the terminal
        console.log('socket id: ' + socket.id + ' --> says: ' + msg);
        // sends msg to other user connections
        socket.broadcast.emit('chat message', msg);
    });

    // socket.on('move', function(clicks) {
    //     socket.emit('move', clicks); 
    // });
});

//////////////////////////////

http.listen(port, function() {
    console.log('listening on *: ' + port);
});