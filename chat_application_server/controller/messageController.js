const expressAsyncHandler = require("express-async-handler");

const Message = require('../models/message');
const Chat = require("../models/chat");
const User = require("../models/user");


exports.allMessages = expressAsyncHandler(async (req, res) => {
    try {
      const messages = await Message.find({ chat: req.params.chatId })
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
        message = await message.populate("chat");
        message = await message.populate("reciever");
    
        await User.populate(message,{
            path:"chat.users",
            Select :'name email',
        })

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
