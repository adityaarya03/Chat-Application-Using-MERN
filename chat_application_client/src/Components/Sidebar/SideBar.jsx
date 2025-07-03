import React, { useContext, useEffect, useState } from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import NightlightRoundIcon from "@mui/icons-material/NightlightRound";
import SearchIcon from "@mui/icons-material/Search";
// import ConversationBox from "../conversationItems/ConversationBox";
import { useNavigate } from "react-router-dom";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../../Features/themeslice";
import "./sidebar.css";
import { IconButton, MenuList } from "@mui/material";
import Cookies from "js-cookie";
import axios from "axios";
import { myContext } from "../Main/MainContainer";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Badge from "@mui/material/Badge";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import ChatIcon from '@mui/icons-material/Chat';
import io from "socket.io-client";
// import Conversationuser from "../Conversationuser";

const ENDPOINT = process.env.REACT_APP_DEPLOYMENT_URL;
let socket;

const SideBar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { refresh, setRefresh, notification, setNotification, chatcontext , setChatcontext } =
    useContext(myContext);
  // const { selectedChat, setSelectedChat } = useContext(myContext);
  const lighttheme = useSelector((state) => state.themeKey);
  const [conversation, setConversation] = useState([]);
  const [searchquerry, setSearchquerry] = useState("");

  //menu option
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [anchorElnoti, setAnchorElnoti] = React.useState(null);
  const open = Boolean(anchorEl);
  const opennoti = Boolean(anchorElnoti);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleClicknoti = (event) => {
    setAnchorElnoti(event.currentTarget);
  };
  const handleClosenoti = () => {
    setAnchorElnoti(null);
  };

  const userData = JSON.parse(Cookies.get("userData"));

  if (!userData) {
    console.log("User not authenticated");
  }

  // handle refresh errors

  useEffect(() => {
    const config = {
      headers: {
        Authorization: `Bearer ${userData.data.token}`,
      },
    };
    const response = axios
      .get(`${process.env.REACT_APP_DEPLOYMENT_URL}/chat?search=${searchquerry}`, config)
      .then((response) => {
        console.log("Data refresed in sidebar", response.data);
        console.log("hi i am noti" , notification)
        setConversation(response.data);
      });
  }, [refresh, searchquerry]);

  // Socket.io: Listen for group membership changes
  useEffect(() => {
    if (!userData) return;
    if (!socket) {
      socket = io(ENDPOINT);
      socket.emit("setup", userData);
    }
    const handleGroupMembershipChanged = () => {
      setRefresh((prev) => !prev);
    };
    socket.on("group-membership-changed", handleGroupMembershipChanged);
    return () => {
      socket.off("group-membership-changed", handleGroupMembershipChanged);
    };
  }, [userData]);

  const handleSearchQuerry = (event) => {
    setSearchquerry(event.target.value);
    console.log(event.target.value);
  };

  //logout
  const handleLogout = () => {
    Cookies.remove("userData");
    navigate("/");
  };

  return (
    <div className={"sidebar"}>
      <div className={"sb-header " + (lighttheme ? "" : "darker")}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            color: "rgba(0, 0, 0, 0.54)",
            fontWeight: "bolder",
          }}
        >
          {lighttheme ? (
            <IconButton onClick={handleClick}>
              <AccountCircleIcon />
            </IconButton>
          ) : (
            <IconButton onClick={handleClick}>
              <AccountCircleIcon sx={{ color: "white" }} />
            </IconButton>
          )}

          {/* menu */}
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
          >
            <MenuItem onClick={handleClose}>Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>

          <p
            className={"pro-text " +( lighttheme ? "" : "darker")}
            style={{ textTransform: "uppercase" }}
          >
            {userData.data.name}
          </p>
        </div>
        <div className="other-icons">
          <IconButton
            className="iconshadow"
            onClick={() => {
              navigate("users");
            }}
          >
            <PersonAddIcon className={"icon " + (lighttheme ? "" : "darker")} />
          </IconButton>
          <IconButton className="iconshadow"  onClick={() => navigate("joinGroup")}>
            <GroupAddIcon
              className={"icon " + (lighttheme ? "" : "darker")}
            />
          </IconButton>
          <IconButton
            className="iconshadow"
            onClick={() => {
              navigate("create-groups");
            }}
          >
            <AddCircleIcon className={"icon " + (lighttheme ? "" : "darker")} />
          </IconButton>
          <IconButton
            className="iconshadow"
            onClick={() => {
              dispatch(toggleTheme());
            }}
          >
            {lighttheme ? (
              <NightlightRoundIcon
                className={"icon " + (lighttheme ? "" : "darker")}
              />
            ) : (
              <LightModeIcon
                className={"icon " + (lighttheme ? "" : "darker")}
              />
            )}
          </IconButton>
          <IconButton className="chats-icons" sx={{display:"none"}} onClick={()=>navigate("/app/usersChat")}>
            <ChatIcon/>
          </IconButton>
        </div>
      </div>
      <div className={"sb-search-container " + (lighttheme ? "" : "dark")}>
        <div
          className={"sb-search " + (lighttheme ? "" : "dark border-bottom")}
        >
          <IconButton>
            <SearchIcon className={"icon " + (lighttheme ? "" : "dark")} />
          </IconButton>
          <input
            type="text"
            placeholder="Search"
            className={lighttheme ? "" : "dark"}
            onChange={handleSearchQuerry}
          />
        </div>
        <div className={"notification " + (lighttheme ? "" : "dark")}>
          <IconButton
            className={lighttheme ? "" : "dark"}
            onClick={handleClicknoti}
          >
            <Badge badgeContent={notification.length} color="warning">
              <NotificationsActiveIcon />
            </Badge>
          </IconButton>
          <Menu
            id="basic-menu"
            anchorEl={anchorElnoti}
            open={opennoti}
            onClose={handleClosenoti}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
          >
            <MenuList onClick={handleClosenoti}>
              {!notification.length
                ? <MenuItem>No new Message</MenuItem>
                :(notification.map((notif) => (
                    <MenuItem key={notif._id} onClick={() => {
                      setChatcontext(notif.chat);
                      navigate(`chat/${notif.chat._id}`);
                      setNotification(notification.filter((n) => n !== notif));
                    }}>
                      {notif.chat.isGroupChat
                        ? `New Message in ${notif.chat.chatName}`
                        : `New Message from ${
                            (() => {
                              const currentUserId = userData.data._id;
                              const otherUserObj = notif.chat.users.find(
                                (u) => u.user && u.user._id !== currentUserId
                              );
                              return otherUserObj?.user?.name || "Unknown User";
                            })()
                          }`}
                    </MenuItem>
                  )))}
            </MenuList>
          </Menu>
        </div>
      </div>
      {/* <Conversationuser/> */}
      <div className={"sb-conversation " + (lighttheme ? "" : "dark")}>
        {conversation.map((conversation, index) => {
          if (conversation.users.length === 1 && conversation.isGroupChat===false) {
            return <div key={index}></div>;
          }
          if (conversation.latestMessage === undefined) {
            return (
              <div
                key={index}
                onClick={() => {
                  console.log("Refresed fired from sidebar");
                  setRefresh(!refresh);
                }}
              >
                <div
                  key={index}
                  className={
                    "conversation-container " + (lighttheme ? "" : "dark")
                  }
                  onClick={() => {
                    // selectedChat = conversation._id
                    setChatcontext(conversation);
                    navigate(`chat/${conversation._id}`);
                  }}
                >
                  <div className="avatar-box ">
                    <img
                      src={`data:image/svg+xml;base64,${
                        conversation.isGroupChat === false
                          ? conversation.users[0].user._id === userData.data._id
                            ? conversation.users[1].user.avatarImage
                            : conversation.users[0].user.avatarImage
                          : conversation.avatarImage
                      }`}
                      alt="user avatar"
                    />
                  </div>
                  <p className={"con-title " + (lighttheme ? "" : "dark")}>
                    {conversation.isGroupChat === false
                      ? conversation.users[0].user._id === userData.data._id
                        ? conversation.users[1].user.name
                        : conversation.users[0].user.name
                      : conversation.chatName}
                  </p>
                  <p className="con-lastMessage">
                    No previous Messages, click here to start a new chat
                  </p>
                </div>
              </div>
            );
          } else {
            return (
              <div
                key={index}
                className="conversation-container"
                onClick={() => {
                  setChatcontext(conversation);
                  navigate(`chat/${conversation._id}`);
                  setNotification(notification.filter((n)=>n._id!==conversation.latestMessage._id));
                }}
              >
                <div className="avatar-box">
                  <img
                    src={`data:image/svg+xml;base64,${
                      conversation.isGroupChat === false
                        ? conversation.users[0].user._id === userData.data._id
                          ? conversation.users[1].user.avatarImage
                          : conversation.users[0].user.avatarImage
                        : conversation.avatarImage
                    }`}
                    alt="user avatar"
                  />
                </div>
                <p className={"con-title " + (lighttheme ? "" : "dark")}>
                  {conversation.isGroupChat === false
                    ? conversation.users[0].user._id === userData.data._id
                      ? conversation.users[1].user.name
                      : conversation.users[0].user.name
                    : conversation.chatName}
                </p>
                <p className="con-lastMessage">
                  {conversation.latestMessage.content}
                </p>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};

export default SideBar;
