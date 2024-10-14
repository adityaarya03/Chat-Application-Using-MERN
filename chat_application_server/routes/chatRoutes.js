const express = require("express");
const { protect } = require("../middlewares/auth");
const { accessChat, fetchChats, createGroupChat, fetchGroup, addTogroup, leaveGroup } = require("../controller/chatController");
const router = express.Router();

router.post("/",protect,accessChat);
router.get("/",protect,fetchChats);
router.post("/createGroup",protect,createGroupChat);
router.get("/fetchGroups",protect,fetchGroup);
router.put("/addUsers",protect,addTogroup);
router.put("/leaveGroup",protect,leaveGroup);

module.exports = router;