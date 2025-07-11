const expressAsyncHandler = require("express-async-handler");

const Message = require('../models/message');
const Chat = require("../models/chat");
const User = require("../models/user");


exports.allMessages = expressAsyncHandler(async (req, res) => {
    try {
      const chatId = req.params.chatId;
      const userId = req.user._id;
      const chat = await Chat.findById(chatId);
      if (!chat) return res.status(404).json({ message: 'Chat not found' });
      let joinedAt = null;
      if (chat.isGroupChat) {
        const userEntry = chat.users.find(u => String(u.user) === String(userId));
        if (userEntry) joinedAt = userEntry.joinedAt;
      }
      let messageQuery = { chat: chatId };
      if (joinedAt) {
        messageQuery.createdAt = { $gte: joinedAt };
      }
      const messages = await Message.find(messageQuery)
        .populate("sender", "name email avatarImage")
        .populate("reciever")
        .populate("chat");
      res.json(messages);
      console.log(messages);
    } catch (error) {
      res.status(400);
      console.log(error);
    }
});

exports.sendMessage = expressAsyncHandler(async(req,res)=>{

    const {content , chatId} = req.body;

    if(!content || !chatId){
        console.log("Invalid data passed into request ");
        return res.sendStatus(400);
    }

    var newMessage = {
        sender : req.user._id,
        content : content,
        chat : chatId,
    }

    try{
        
        var message = await Message.create(newMessage);
        console.log(message);

        message = await message.populate("sender", "name avatarImage");
        message = await message.populate("reciever");
        message = await message.populate({
          path: "chat",
          populate: {
            path: "users.user",
            select: "name email avatarImage"
          }
        });
    
        const updateChat = await Chat.findByIdAndUpdate(chatId,{
            latestMessage:message,
        })

        if(!updateChat){
            return res.status(404).send("Chat not found");
        }

        res.json(message);

    }catch(error){
        console.log(error.message);
    }

})
