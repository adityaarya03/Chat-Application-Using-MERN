const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const cors = require("cors");
const { Server, Socket } = require("socket.io");
const Message = require("./models/message");
const Chat = require("./models/chat");
const { initSocket } = require("./socket");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
dotenv.config();

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Hello");
});

app.use("/user", userRoutes);
app.use("/chat", chatRoutes);
app.use("/message", messageRoutes);

const connectDb = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URL);
    // const result = await Message.deleteMany({});
    // const result = await Chat.deleteMany({});
    console.log("database connected successfully");
  } catch (error) {
    console.log("Error connecting to dataBase");
    console.log(error);
  }
};
connectDb();

const server = app.listen(PORT, () => {
  console.log(`server is running on "http://localhost:${PORT}"`);
});

// Initialize Socket.io
initSocket(server);
