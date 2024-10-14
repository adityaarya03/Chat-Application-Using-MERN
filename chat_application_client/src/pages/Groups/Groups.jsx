import "./groups.css";
import React, { useContext, useEffect, useState } from "react";
import { IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import logo from "../../assests/talking.png";
import Cookies from "js-cookie";
import axios from "axios";
import { myContext } from "../../Components/Main/MainContainer";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Backdrop, CircularProgress } from "@mui/material";

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const { refresh, setRefresh } = useContext(myContext);
  const userData = JSON.parse(Cookies.get("userData"));
  const dispatch = useDispatch();
  const lightTheme = useSelector((state) => state.themeKey);
  console.log(userData);
  const [searchquerry, setSearchquerry] = useState("");
  const [loading, setLoading] = useState(false);

  if (!userData) {
    console.log("User Not Authenticated");
  }

  useEffect(() => {
    console.log("user Refered");
    // console.log(`${process.env.REACT_APP_DEPLOYMENT_URL}`);
    const config = {
      headers: {
        Authorization: `Bearer ${userData.data.token}`,
      },
    };

    setLoading(true);
    axios
      .get(
        `${process.env.REACT_APP_DEPLOYMENT_URL}/chat/fetchGroups?search=${searchquerry}`,
        config
      )
      .then((data) => {
        console.log("User refresed in user panel");
        setGroups(data.data);
        setLoading(false);
      })
      .catch((error) => {
        if (error.response && error.response.status === 402) {
          toast("user is already on the group!", {
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
      });
  }, [refresh, searchquerry]);

  const handleSearchQuerry = (event) => {
    setSearchquerry(event.target.value);
    console.log(event.target.value);
  };

  return (
    <>
      <div className={"groups-container " + (lightTheme ? "" : "dark")}>
        <div className={"g-header " + (lightTheme ? "" : "darker")}>
          <img
            src={logo}
            style={{ height: "100%", width: "4rem", marginLeft: "10px" }}
          />
          <p className={"g-title " + (lightTheme ? "" : "darker")}>
            Available Groups
          </p>
          <IconButton
            className={"icon " + (lightTheme ? "" : "darker")}
            onClick={() => {
              setRefresh(!refresh);
            }}
          >
            <RefreshIcon />
          </IconButton>
        </div>
        <div className={"sb-search searchback " + (lightTheme ? "" : "dark")}>
          <IconButton className={"icon " + (lightTheme ? "" : "dark")}>
            <SearchIcon />
          </IconButton>
          <input
            placeholder="Search"
            className={"search-box searchback " + (lightTheme ? "" : "dark")}
            onChange={handleSearchQuerry}
          />
        </div>

        <div className="groups-container-list">
        {loading ? (
          <div style={{display:"flex" , justifyContent:"center" , alignItems:"center",height:"100%" , width:"100%" }}>
            <CircularProgress className="circulareProgress" color="secondary" variant="indeterminate"  />
          </div>
        ) : (
          groups.map((user, index) => {
            return (
              <div
                className={"g-list " + (lightTheme ? "" : "dark")}
                key={index}
                onClick={() => {
                  console.log("Creating chat with ", user.chatName);
                  const config = {
                    headers: {
                      Authorization: `Bearer ${userData.data.token}`,
                    },
                  };
                  setLoading(true);
                  const response = axios
                    .put(
                      `${process.env.REACT_APP_DEPLOYMENT_URL}/chat/addUsers`,
                      {
                        chatId: user._id,
                        userId: userData.data._id,
                      },
                      config
                    )
                    .then(() => {
                      setLoading(false);
                      setRefresh((prev) => !prev);
                    })
                    .catch((error) => {
                      if (error.response.status === 402) {
                        setLoading(false);
                        toast.error("you are already in the group");
                      } else {
                        toast.error("error while adding user to group");
                      }
                    });
                }}
              >
                <div className={"avatar-box " + (lightTheme ? "" : "dark")}>
                  <img
                    src={`data:image/svg+xml;base64,${user.avatarImage}`}
                    alt="user avatar"
                  />
                </div>
                <p className={"con-title " + (lightTheme ? "" : "dark")}>
                  {user.chatName}
                </p>
              </div>
            );
          })
          )}
          </div>
      </div>
    </>
  );
};

export default Groups;
