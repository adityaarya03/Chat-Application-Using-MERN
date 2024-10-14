import Cookies from 'js-cookie';
import React, { useContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { myContext } from './Main/MainContainer';
import axios from 'axios';

const Conversationuser = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { refresh, setRefresh, notification, setNotification, chatcontext , setChatcontext } =
      useContext(myContext);
    // const { selectedChat, setSelectedChat } = useContext(myContext);
  const userData = JSON.parse(Cookies.get("userData"));
    const lighttheme = useSelector((state) => state.themeKey);
  const [conversation, setConversation] = useState([]);


    useEffect(() => {
        const config = {
          headers: {
            Authorization: `Bearer ${userData.data.token}`,
          },
        };
        const response = axios
          .get(`${process.env.REACT_APP_DEPLOYMENT_URL}/chat`, config)
          .then((response) => {
            console.log("Data refresed in sidebar", response.data);
            console.log("hi i am noti" , notification)
            setConversation(response.data);
          });
      }, [refresh]);

  return (
    <div className={"sb-conversation sb-con-user " + (lighttheme ? "" : "dark")}>
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
                    navigate(
                      `chat/${conversation._id}&${
                        conversation.isGroupChat === false
                          ? conversation.users[0]._id === userData.data._id
                            ? conversation.users[1].name
                            : conversation.users[0].name
                          : conversation.chatName
                      }&${conversation.isGroupChat}&${
                        conversation.isGroupChat === false
                          ? conversation.users[0]._id === userData.data._id
                            ? conversation.users[1].avatarImage
                            : conversation.users[0].avatarImage
                          : conversation.avatarImage
                      }`
                    );
                  }}
                >
                  <div className="avatar-box ">
                    <img
                      src={`data:image/svg+xml;base64,${
                        conversation.isGroupChat === false
                          ? conversation.users[0]._id === userData.data._id
                            ? conversation.users[1].avatarImage
                            : conversation.users[0].avatarImage
                          : conversation.avatarImage
                      }`}
                      alt="user avatar"
                    />
                  </div>
                  <p className={"con-title " + (lighttheme ? "" : "dark")}>
                    {conversation.isGroupChat === false
                      ? conversation.users[0]._id === userData.data._id
                        ? conversation.users[1].name
                        : conversation.users[0].name
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
                 
                  navigate(
                    `chat/${conversation._id}&${
                      conversation.isGroupChat === false
                        ? conversation.users[0]._id === userData.data._id
                          ? conversation.users[1].name
                          : conversation.users[0].name
                        : conversation.chatName
                    }&${conversation.isGroupChat}&${
                      conversation.isGroupChat === false
                        ? conversation.users[0]._id === userData.data._id
                          ? conversation.users[1].avatarImage
                          : conversation.users[0].avatarImage
                        : conversation.avatarImage
                    }`
                  );
                  setChatcontext(conversation);
                  console.log(chatcontext,"hii convo");
                  setNotification(notification.filter((n)=>n._id!==conversation.latestMessage._id));
                }}
              >
                <div className="avatar-box">
                  <img
                    src={`data:image/svg+xml;base64,${
                      conversation.isGroupChat === false
                        ? conversation.users[0]._id === userData.data._id
                          ? conversation.users[1].avatarImage
                          : conversation.users[0].avatarImage
                        : conversation.avatarImage
                    }`}
                    alt="user avatar"
                  />
                </div>
                <p className={"con-title " + (lighttheme ? "" : "dark")}>
                  {conversation.isGroupChat === false
                    ? conversation.users[0]._id === userData.data._id
                      ? conversation.users[1].name
                      : conversation.users[0].name
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
  )
}

export default Conversationuser