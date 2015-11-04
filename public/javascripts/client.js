var username = prompt('What is your username?');

// connect to the socket server
var socket = io.connect();
socket.emit("addUser", {"username": username, "x": 100, "y": 50, "room": "main-room"});


// if we get an "info" emit from the socket server then console.log the data we recive
socket.on('roomMessage', function (data) {
    alert(data.sender + " said: " + data.msg);
});

socket.on('broadcastMessage', function (data) {
    alert(data.msg);
});


function sendRoomMessage(msg, sender, room){
  socket.emit("roomMessage", {"sender": sender, "room": room, "msg": msg});
}
