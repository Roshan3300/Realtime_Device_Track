const express = require('express');
const app = express();
const http = require('http');
const path = require('path');


const socketio = require('socket.io');
const server = http.createServer(app);
const io = socketio(server);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public'))) ;

io.on("connection", function (socket) {
    console.log("A user connected:", socket.id);
    
    socket.on("send-location", (data) => {
        io.emit("Receive-location", { id: socket.id, ...data });
    });
    
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        io.emit("user-disconnected", { id: socket.id });
    });     
});

app.get("/", function (req, res) {
  res.render("index");
});

server.listen(3000);