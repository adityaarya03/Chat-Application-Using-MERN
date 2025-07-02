const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    pingTimeout: 120000,
    cors: {
      origin: "*",
      credentials: true,
    },
    pingTimeout: 60000,
  });

  io.on("connection", (socket) => {
    socket.on("setup", (user) => {
      socket.join(user.data._id);
      socket.emit("connected");
    });

    socket.on("join chat", (room) => {
      socket.join(room);
    });

    socket.on("typing", (room) => socket.to(room).emit("typing"));
    socket.on("stop typing", (room) => socket.to(room).emit("stop typing"));

    socket.on("new message", (newMessageStatus) => {
      var chat = newMessageStatus.chat;
      if (!chat || !chat.users) {
        return;
      }
      chat.users.forEach((member) => {
        if (!member.user) return;
        if (member.user._id === newMessageStatus.sender._id) return;
        socket.in(member.user._id).emit("message recieved", newMessageStatus);
      });
    });
  });
};

const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(userId).emit(event, data);
  }
};

module.exports = { initSocket, emitToUser }; 