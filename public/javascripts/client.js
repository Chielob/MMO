var client = {
  username: prompt('What is your username?'),
  x: 100,
  y: 50,
  room: "main-room"
}

// connect to the socket server
var socket = io.connect();
socket.emit("addUser", {"username": client.username, "x": client.x, "y": client.y, "room": client.room});

socket.on('roomMessage', function (data) {
    alert(data.sender + " said: " + data.msg);
});

socket.on('broadcastMessage', function (data) {
    alert(data.msg);
});

function sendRoomMessage(msg){
  console.log('Sending msg');
  socket.emit("roomMessage", {"sender": client.username, "room": client.room, "msg": msg});
}
