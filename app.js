var express = require('express');
var http = require('http');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

server.listen(5000);

// setting up express
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// routing and viewengine setup
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// routing
var index = require('./routes/index');
var game = require('./routes/game');

app.use('/', index);
app.use('/game', game);

// unknown page handler
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

//Object with all user data
var clients = {};

io.sockets.on('connection', function (socket) {

    //When the player joins and emits 'addUser' he will be added to the serverside clients object
    socket.on('addUser', function(data){

      console.log("Player " + data.username + " connected!");

      clients[data.username] = {
        "socket": socket.id,
        "x": data.x,
        "y": data.y,
        "room": data.room
      };

    });


    //When player sends an roomMessage, emit the message to all other players in the same room except the sender
    socket.on('roomMessage', function(data){

      console.log("Player " + data.sender + "said in room " + data.room + ": " + data.msg);

      for(var name in clients){
        // If the clients are in the same room, send the message
        // dont send the message to the sender
        if(clients[name].room === data.room && clients[name].socket !== socket.id){
          io.to(clients[name].socket).emit('roomMessage', {"msg": data.msg, "sender": data.sender});
        }
      }

    });

    //Change the position of the client in the serverside client object
    //Send the new position to all other clients in the same room
    socket.on('changePosition', function(data){

      //Change the data serverside
      clients[data.username] = {
        x: data.x,
        y: data.y
      }

      //Send the movement to all clients in the same room. Except to yourself ;)
      for(var name in clients){
        if(clients[name].room === data.room && clients[name].socket !== socket.id){
          io.to(clients[name].socket).emit('changePosition', {"x": data.x, "y": data.y, "name": data.username})
        }
      }

    });

    //Change the room in the serverside clients object
    socket.on('roomJoin', function(data){

      console.log("Player" + data.username + "joined room: " + data.room);

      clients[data.username] = {
        room: data.room
      }

    });

    // when the user disconnects delete it from the serverside Clients object
    socket.on('disconnect', function(){


      for(var name in clients) {
        if(clients[name].socket === socket.id){

          delete clients[name];
          break;

        }
      }

    });
});

module.exports = app;
