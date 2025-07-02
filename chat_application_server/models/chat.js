const mongoose = require('mongoose');

const chatModel = mongoose.Schema({
    chatName:{
        type:String,
    },
    isGroupChat : {
        type:Boolean
    },
    users:[{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        joinedAt: {
            type: Date,
            required: true
        }
    }],
    latestMessage:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Message",
    },
    groupAdmin:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    avatarImage: {
        type: String,
        default: ''
    },
    pendingRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: []
    }],
},{
    timestamps:true
})

const Chat = mongoose.model("Chat",chatModel);
module.exports= Chat;