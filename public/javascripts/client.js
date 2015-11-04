var username = prompt('What is your username?');

// connect to the socket server
var socket = io.connect();
socket.emit("addUser", {"username": username, "x": 100, "y": 50});

// if we get an "info" emit from the socket server then console.log the data we recive
socket.on('worldMessage', function (data) {
    alert(data);
});
