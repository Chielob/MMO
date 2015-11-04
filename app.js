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

    // when the client emits 'adduser', this listens and executes
    socket.on('addUser', function(data){

      clients[data.username] = {
        "socket": socket.id,
        "x": data.x,
        "y": data.y,
        "room": data.room
      };

    });

    socket.on('roomMessage', function(data){

      for(var name in clients){
        // If the clients are in the same room, send the message
        // dont send the message to the sender
        if(clients[name].room === data.room && clients[name].socket !== socket.id){
          io.to(clients[name].socket).emit('roomMessage', {"msg": data.msg, "sender": data.sender});
        }
      }

    });

    // when the user disconnects.. perform this
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
