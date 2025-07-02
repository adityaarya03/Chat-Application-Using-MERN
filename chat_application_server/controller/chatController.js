const expressAsyncHandler = require("express-async-handler");
const Chat = require("../models/chat");
const User = require("../models/user");
const { emitToUser } = require("../socket");



exports.accessChat = expressAsyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("userId Not found");
    res.sendStatus(400);
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { user: req.user._id } } },
      { users: { $elemMatch: { user: userId } } },
    ],
  })
    .populate("users.user", "name avatarImage email")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name email",
  });

  if (isChat.length > 0) {
    console.log("Chat retrived");
    res.status(200).json(isChat[0]);
  } else {
    console.log("New chat is creating...");
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [
        { user: req.user._id, joinedAt: new Date() },
        { user: userId, joinedAt: new Date() }
      ],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users.user",
        "name avatarImage email"
      );
      res.status(200).json(FullChat);
      
    } catch (error) {
      res.status(400);
      console.log(error.message)
    }
  }
});

exports.fetchChats = expressAsyncHandler(async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(400).json({
        success: false,
        message: "User information is missing or incomplete",
      });
    }
    // Fetch both group and direct chats
    Chat.find({ 
      users: { $elemMatch: { user: req.user._id } }
    })
    .populate("users.user", "name avatarImage email")
    .populate("groupAdmin", "name avatarImage email")
    .populate("latestMessage")
    .sort({updatedAt:-1})
    .then(async(results)=>{
        results = await User.populate(results,{
            path:"latestMessage.sender",
            select:"name email",
        });
        res.status(200).json(results);
    })
  }catch(error) {
    res.status(400).json({
      success:false,
    });
    console.log(error.message);
  }
});


exports.createGroupChat = expressAsyncHandler(async(req,res)=>{
  const {name,avatarImage} = req.body;
  // console.log("Hii am groups");
  // console.log(req.body);
  if(!name){
    return res.status(400).send({message : "Data is insufficient"})
  }

  try{

    const isPresent = await Chat.find({
      isGroupChat : true,
      chatName:name
    })

    // console.log(isPresent,"hii present");

    if(isPresent.length>0){
      return res.status(404).json({
        success:false,
        message:"Group is Already present"
      })
    }

    const groupChat = await Chat.create({
      chatName: name,
      users : [{ user: req.user, joinedAt: new Date() }],
      isGroupChat : true,
      groupAdmin : req.user,
      avatarImage : avatarImage
    })

    const fullGroupChat = await Chat.findOne({_id : groupChat._id})
    .populate("users.user", "name avatarImage email")
    .populate("groupAdmin", "name avatarImage email");

    res.status(200).json(fullGroupChat);
  }catch(error){
    res.status(400);
    console.log(error);
  }

})

exports.fetchGroup = expressAsyncHandler(async(req,res)=>{
    try{
      const allGroups = await Chat.find({ isGroupChat: true })
        .populate("users.user", "name avatarImage email")
        .populate("groupAdmin", "name avatarImage email")
        .populate("pendingRequests", "name avatarImage email");
      res.status(200).send(allGroups);
    }
    catch(error){
      res.status(400);
      console.log("Error while fetching groups");
    }
})

exports.addTogroup = expressAsyncHandler(async(req,res)=>{
  try{
    const {chatId , userId} = req.body;
    if(!chatId || !userId){
      console.log("group id is not present ");
      return res.status(400).json({
        success:false,
        message:"group id is not present",
      })
    }

    const chat = await Chat.findById(chatId);
    const alreadyPresent = chat.users.some(u => String(u.user) === String(userId));
    if(alreadyPresent){
      return res.status(402).json({
        success:false,
        message:"User is already present"
      })
    }

    const adduser = await Chat.findByIdAndUpdate(chatId,{$push:{users: { user: userId, joinedAt: new Date() }}},{new:true})
    .populate("users.user", "name avatarImage email")
    .populate("groupAdmin", "name avatarImage email");

    if(!adduser){
      res.status(404).json({
        success:false,
        message:"Error while adding user",
      })
    }else{
      // Emit event to the user who was added
      emitToUser(userId, 'group-membership-changed', { action: 'added', groupId: chatId });
      res.json(adduser);
    }

  }catch(error){
    console.log(error.message);
  }
})

exports.leaveGroup = expressAsyncHandler(async(req,res)=>{

    try{
      const {chat_id , user_id} = req.body;
      if(!chat_id || !user_id ){
        res.status(400).json({
          success:false,
          message:"data is insufficient"
        })
      }
      const removed = await Chat.findByIdAndUpdate(chat_id,{$pull:{users: { user: user_id }}},{new:true})
      .populate("users.user", "name avatarImage email")
      .populate("groupAdmin", "name avatarImage email");
      if(removed){
        // Emit event to the user who left
        emitToUser(user_id, 'group-membership-changed', { action: 'removed', groupId: chat_id });
        res.status(200).json(removed);
      }else{
        res.status(400).json({
          success:false,
          message:"error while leaving group"
        })
      }
    }catch(error){
      console.log("Hello brother");
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
)

// --- GROUP JOIN REQUEST MECHANISM ---

// User requests to join a group
exports.requestJoinGroup = expressAsyncHandler(async (req, res) => {
  const groupId = req.params.groupId;
  const userId = req.user._id;

  const group = await Chat.findById(groupId);
  if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

  if (group.users.some(u => String(u.user) === String(userId))) {
    return res.status(400).json({ success: false, message: 'Already a member' });
  }
  if (group.pendingRequests.includes(userId)) {
    return res.status(400).json({ success: false, message: 'Request already sent' });
  }

  group.pendingRequests.push(userId);
  await group.save();
  res.status(200).json({ success: true, message: 'Join request sent' });
});

// Admin fetches pending join requests
exports.getPendingRequests = expressAsyncHandler(async (req, res) => {
  const groupId = req.params.groupId;
  const group = await Chat.findById(groupId).populate('pendingRequests', '-password');
  if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

  if (String(group.groupAdmin) !== String(req.user._id)) {
    return res.status(403).json({ success: false, message: 'Only admin can view requests' });
  }

  res.status(200).json({ success: true, pendingRequests: group.pendingRequests });
});

// Admin accepts a join request
exports.acceptJoinRequest = expressAsyncHandler(async (req, res) => {
  const groupId = req.params.groupId;
  const userId = req.params.userId;
  const group = await Chat.findById(groupId);
  if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

  if (String(group.groupAdmin) !== String(req.user._id)) {
    return res.status(403).json({ success: false, message: 'Only admin can accept requests' });
  }

  if (!group.pendingRequests.map(id => String(id)).includes(String(userId))) {
    return res.status(400).json({ success: false, message: 'No such join request' });
  }

  group.users.push({ user: userId, joinedAt: new Date() });
  group.pendingRequests = group.pendingRequests.filter(
    (id) => String(id) !== String(userId)
  );
  await group.save();
  // Emit event to the user who was added
  emitToUser(userId, 'group-membership-changed', { action: 'added', groupId });
  res.status(200).json({ success: true, message: 'User added to group' });
});

// Admin rejects a join request
exports.rejectJoinRequest = expressAsyncHandler(async (req, res) => {
  const groupId = req.params.groupId;
  const userId = req.params.userId;
  const group = await Chat.findById(groupId);
  if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

  if (String(group.groupAdmin) !== String(req.user._id)) {
    return res.status(403).json({ success: false, message: 'Only admin can reject requests' });
  }

  if (!group.pendingRequests.includes(userId)) {
    return res.status(400).json({ success: false, message: 'No such join request' });
  }

  group.pendingRequests = group.pendingRequests.filter(
    (id) => String(id) !== String(userId)
  );
  await group.save();
  res.status(200).json({ success: true, message: 'Join request rejected' });
});