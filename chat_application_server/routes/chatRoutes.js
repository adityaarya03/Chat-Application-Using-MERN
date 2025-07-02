const express = require("express");
const { protect } = require("../middlewares/auth");
const { accessChat, fetchChats, createGroupChat, fetchGroup, addTogroup, leaveGroup,
  requestJoinGroup, getPendingRequests, acceptJoinRequest, rejectJoinRequest } = require("../controller/chatController");
const router = express.Router();

router.post("/",protect,accessChat);
router.get("/",protect,fetchChats);
router.post("/createGroup",protect,createGroupChat);
router.get("/fetchGroups",protect,fetchGroup);
router.put("/addUsers",protect,addTogroup);
router.put("/leaveGroup",protect,leaveGroup);

// --- GROUP JOIN REQUEST ROUTES ---
router.post("/groups/:groupId/request-join", protect, requestJoinGroup);
router.get("/groups/:groupId/requests", protect, getPendingRequests);
router.post("/groups/:groupId/requests/:userId/accept", protect, acceptJoinRequest);
router.post("/groups/:groupId/requests/:userId/reject", protect, rejectJoinRequest);

module.exports = router;