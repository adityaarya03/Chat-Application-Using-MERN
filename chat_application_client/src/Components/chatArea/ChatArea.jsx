import React, { useContext, useEffect, useRef, useState } from "react";
import "./chatArea.css";
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import Messageother from "../Messages/Messageother";
import Messageself from "../Messages/Messageself";
import Skeleton from "@mui/material/Skeleton";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import axios, { all } from "axios";
import Cookies from "js-cookie";
import { myContext } from "../Main/MainContainer";
import io from "socket.io-client";
import { toast } from "react-toastify";
import image from "../../assests/doodle.jpg";
import Lottie from "react-lottie";
import SeeUsers from "../SeeUsers.jsx";
import animationData from "../../assests/Animation - 1709298838619.json";
import _ from 'lodash';

var socket, selectedChat;
const ENDPOINT = `${process.env.REACT_APP_DEPLOYMENT_URL}`;

const ChatArea = () => {
  // const lightTheme = useSelector((state) => state.themeKey);
  const {
    refresh,
    setRefresh,
    notification,
    setNotification,
    chatcontext,
    setChatcontext,
  } = useContext(myContext);
  const [messageContent, setMessageContent] = useState("");
  const messagesEndRef = useRef(null);
  const dyParams = useParams();
  const chat_id = dyParams._id;
  const userData = JSON.parse(Cookies.get("userData"));
  const [allMessages, setAllMessages] = useState([]);
  const [loaded, setloaded] = useState(false);
  const [socketConnectionStatus, setSocketConnectionStatus] = useState(false);
  const lighttheme = useSelector((state) => state.themeKey);
  const [istyping, setIstyping] = useState(false);
  const [typing, setTyping] = useState(false);
  const msgRef = useRef(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  // const [allMessagesCopy, setAllMessagesCopy] = useState([]);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const fetchMessages = async () => {
    if (!chatcontext && !chat_id) {
      console.log("chatcontext is not available", chat_id);
      return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userData.data.token}`,
        },
      };
      setloaded(false);
      const { data } = await axios.get(
        `${process.env.REACT_APP_DEPLOYMENT_URL}/message/` + chat_id,
        config
      );
      setAllMessages(data);
      setloaded(true);
      socket.emit("join chat", chat_id);
    } catch (error) {
      setloaded(true);
      toast.error("Error while fetching");
    }
  };

  const sendMessage = async () => {
    if (!messageContent.trim()) return;
 
    const config = {
      headers: {
        Authorization: `Bearer ${userData.data.token}`,
      },
    };

    setMessageContent("");

    const { data } = await axios.post(
      `${process.env.REACT_APP_DEPLOYMENT_URL}/message/`,
      {
        content: messageContent,
        chatId: chat_id,
      },
      config
    );
    socket.emit("new message", data);
    socket.emit("stop typing", chat_id);
    setRefresh((prevRefresh) => !prevRefresh);
    setAllMessages([...allMessages, data]);
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", userData);
    socket.on("connected", () => {
      setSocketConnectionStatus(true);
    });
    socket.on("typing",()=>setTyping(true));
    socket.on("stop typing",()=>setTyping(false));
  }, []);

  useEffect(() => {
    selectedChat = chat_id;
    fetchMessages();
  }, [chat_id]);

  useEffect(() => {
    socket.on("message recieved", (newMessage) => {
      if (!selectedChat || selectedChat !== newMessage.chat._id) {
        const present = notification.find(
          (f) => f.chat._id === newMessage.chat._id
        );
        if (!present) {
          setNotification([newMessage, ...notification]);
          setRefresh(!refresh);
          toast(`New Message from ${newMessage.sender.name}!`, {
            position: "bottom-left",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
        }
        console.log("Users are not chating with each other");
      } else {
        console.log("message is recieved");
        setRefresh(!refresh);
        setAllMessages((prevMessages) => [...prevMessages, newMessage]);
        console.log(allMessages);
      }
    });
    return () => {
      if (socket) {
        console.log("Offed message recived");
        socket.off("message recieved");
      }
    };
  });

  useEffect(() => {
    if (msgRef.current) {
      msgRef.current.scrollTop = msgRef.current.scrollHeight;
    }
  });

  const handleOpen = () => {
    setOpen(true);
  };
  const handleclose = () => {
    setOpen(false);
  };

  let istypingTimeout;

  const typingHandler = (e)=>{
    setMessageContent(e.target.value);
    if(!socketConnectionStatus){
      return;
    }

    if(!istyping){
      setIstyping(true);
      socket.emit("typing",chat_id);
    }

    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    if (istypingTimeout) {
      clearTimeout(istypingTimeout);
    }

    istypingTimeout = setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && istyping) {
        socket.emit("stop typing", chat_id);
        console.log("Event is emits");
        setIstyping(false);
      }
    }, timerLength);
  }

  // Socket.io: Listen for group membership changes (removed)
  useEffect(() => {
    if (!userData) return;
    if (!socket) {
      socket = io(ENDPOINT);
      socket.emit("setup", userData);
    }
    const handleGroupMembershipChanged = (data) => {
      if (data.action === 'removed' && data.groupId === chat_id) {
        toast.info("You have been removed from this group.");
        navigate("/app/welcome");
      }
    };
    socket.on("group-membership-changed", handleGroupMembershipChanged);
    return () => {
      socket.off("group-membership-changed", handleGroupMembershipChanged);
    };
  }, [userData, chat_id, navigate]);

  // Fetch chat details if chatcontext is missing or chat_id changes
  useEffect(() => {
    if (!chat_id) return; // Prevent fetching if no chat is selected
    if (!chatcontext || chatcontext._id !== chat_id) {
      const config = {
        headers: {
          Authorization: `Bearer ${userData.data.token}`,
        },
      };
      axios
        .get(`${process.env.REACT_APP_DEPLOYMENT_URL}/chat/${chat_id}`, config)
        .then((res) => {
          setChatcontext(res.data);
        })
        .catch((err) => {
          toast.error("Error loading chat details");
        });
    }
  }, [chat_id, chatcontext, setChatcontext, userData.data.token]);

  // Remove splitting of chat_user, isGroupChat, avatarImage from URL
  // Use chatcontext for all chat details below
  let displayName = "";
  let displayAvatar = "";
  let isGroupChat = "";
  if (chatcontext) {
    isGroupChat = chatcontext.isGroupChat ? "true" : "false";
    if (isGroupChat === "false" && chatcontext.users) {
      const other = chatcontext.users.find(
        (u) => u.user && u.user._id !== userData.data._id
      );
      if (other && other.user) {
        displayName = other.user.name;
        displayAvatar = other.user.avatarImage;
      }
    } else {
      displayName = chatcontext.chatName;
      displayAvatar = chatcontext.avatarImage;
    }
  }

  if (!loaded) {
    return (
      <div
        style={{
          border: "20px",
          padding: "10px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          flex:"3"
        }}
      >
        <Skeleton
          variant="rectangular"
          sx={{ width: "100%", borderRadius: "10px" }}
          height={60}
        />
        <Skeleton
          variant="rectangular"
          sx={{
            width: "100%",
            borderRadius: "10px",
            flexGrow: "1",
          }}
        />
        <Skeleton
          variant="rectangular"
          sx={{ width: "100%", borderRadius: "10px" }}
          height={60}
        />
      </div>
    );
  } else {
    return (
      <div className="chatArea-container">
        <div className={"chatArea-header " + (lighttheme ? "" : "darker")}>
          <div className="avatar-box ">
            <img
              src={`data:image/svg+xml;base64,${displayAvatar}`}
              alt="user avatar"
            />
          </div>
          <div className={"header-text " + (lighttheme ? "" : "darker")}>
            <p className={"con-title " + (lighttheme ? "" : "darker")}>
              {displayName}
            </p>
            {/* <p className="con-timestamp">{props.timestamp}</p> */}
          </div>
          {isGroupChat === "true" ? (
            <SeeUsers
              handleOpen={handleOpen}
              handleClose={handleclose}
              open={open}
              name={displayName}
            />
          ) : (
            <div />
          )}
        </div>
        <div className="messages-container" ref={msgRef}>
          <div
            className={"msg-cont-back " + (lighttheme ? "" : "darkerdoodle")}
          ></div>
          {allMessages
            .slice(0)
            // .reverse()
            .map((message, index) => {
              const sender = message.sender;
              const self_id = userData.data._id;
              if (sender._id === self_id) {
                return <Messageself props={message} key={index} />;
              } else {
                return <Messageother props={message} key={index} />;
              }
            })}
        </div>
        <div ref={messagesEndRef} className="BOTTOM" />
        {typing && (
          <div style={{display:"flex" , padding:"0px 10px"}}>
            <div className="message-other-icon">
              <img
                src={`data:image/svg+xml;base64,${displayAvatar}`}
                alt=""
                width={"40px"}
                height={"40px"}
              />
            </div>
            <Lottie
              options={defaultOptions}
              height={40}
              width={70}
              style={{ marginBottom: 10, marginLeft: 10 }}
            />
          </div>
        )}
        <div className={"text-input-area " + (lighttheme ? "" : "darker")}>
          <input
            type="text"
            placeholder="Type a Message"
            className={"search-box " + (lighttheme ? "" : "darker")}
            value={messageContent}
            onChange={typingHandler}
            onKeyDown={(event) => {
              if (event.code == "Enter") {
                // console.log(event);
                sendMessage();
                setMessageContent("");
                setRefresh(!refresh);
              }
            }}
          />
          <IconButton
            className={"icon " + (lighttheme ? "" : "darkerlight")}
            sx={{
              backgroundColor: "#e8505b",
              borderRadius: "30%",
              color: "white",
              margin: "auto",
              padding: "7px 11px",
            }}
            onClick={() => {
              sendMessage();
              setRefresh(!refresh);
            }}
          >
            <SendIcon />
          </IconButton>
        </div>
      </div>
    );
  }
};

export default ChatArea;
