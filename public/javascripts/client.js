//Create the client object, storing all your stuff :)
var client = {
  username: prompt('What is your username?'),
  x: 100,
  y: 50,
  room: "main-room"
}

// connect to the socket server
var socket = io.connect();

//Send the client object to the server to store it serverside
socket.emit("addUser", {"username": client.username, "x": client.x, "y": client.y, "room": client.room});

//All possible emits
  //When a player in the same room sends a message to the room
  socket.on('roomMessage', function (data) {
      document.getElementById('messages').innerHTML += "<p>" + data.sender + " says: "+ data.msg + "</p>";
  });

  //When a player moved, you receive the data
  socket.on('changePosition', function (data) {

    //you can use x, y and name stored in the data object

  });
