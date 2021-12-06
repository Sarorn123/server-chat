const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

app.get("/api", (req, res) => {
  res.send({ message: "nana" });
});

const users = [];
function user_join(id, username, room_id) {
  const user = { id, username, room_id };
  users.push(user);
}

function userLeave(id) {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User connected : ${socket.id}`);

  socket.on("join_room", (data, room_id) => {
    const user = user_join(socket.id, data, room_id);
    socket.join(data);
    const message = `${data} is joined the chat.`;
    socket.broadcast.emit("joinMessage", message);
  });

  socket.on("myData", (data) => {
    console.log(data);
    socket.broadcast.emit("dataBack", data);
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      socket.broadcast.emit("user_leave", `${user.username} is disconnected !`);
    }
  });
});

server.listen(4001, () => {
  console.log("SERVER IS RUNING");
});
