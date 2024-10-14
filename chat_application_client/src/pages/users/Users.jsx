import React, { useContext, useEffect, useState } from "react";
import User from "../../Components/User";
import { CircularProgress, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import logo from "../../assests/talking.png";
import "./users.css";
import Cookies from "js-cookie";
import axios from "axios";
import { refreshSidebarfun } from "../../Features/refreshSidebar";
import { myContext } from "../../Components/Main/MainContainer";
import { useDispatch, useSelector } from "react-redux";
import Backdrop from "@mui/material/Backdrop";

// import { toggleTheme } from "../../Features/themeslice";

const Users = () => {
  const [users, setusers] = useState([]);
  const { refresh, setRefresh } = useContext(myContext);
  const userData = JSON.parse(Cookies.get("userData"));
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  console.log(userData);
  const lightTheme = useSelector((state) => state.themeKey);
  const [searchquerry, setSearchquerry] = useState("");

  if (!userData) {
    console.log("User Not Authenticated");
  }

  useEffect(() => {
    console.log("user Refered");
    const config = {
      headers: {
        Authorization: `Bearer ${userData.data.token}`,
      },
    };
    setLoading(true);

    axios
      .get(
        `${process.env.REACT_APP_DEPLOYMENT_URL}/user/fetchAllUsers?search=${searchquerry}`,
        config
      )
      .then((data) => {
        console.log("User refresed in user panel");
        setusers(data.data);
        setLoading(false);
      });
  }, [refresh, searchquerry]);

  const handleSearchQuerry = (event) => {
    setSearchquerry(event.target.value);
    console.log(event.target.value);
  };

  return (
    <>
      <User>
        <div className={"ug-header " + (lightTheme ? "" : "darker")}>
          <img
            src={logo}
            style={{ height: "100%", width: "4rem", marginLeft: "10px" }}
          />
          <p className={"ug-title" + (lightTheme ? "" : "darker")}>
            Available Users
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
        <div
          className={
            "sb-search searchback " + (lightTheme ? "" : "dark searchdark")
          }
        >
          <IconButton className={"icon " + (lightTheme ? "" : "dark")}>
            <SearchIcon />
          </IconButton>
          <input
            placeholder="Search"
            className={"search-box searchback " + (lightTheme ? "" : "dark")}
            onChange={handleSearchQuerry}
          />
        </div>

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              width: "100%",
            }}
          >
            <CircularProgress
              className="circulareProgress"
              color="secondary"
              variant="indeterminate"
            />
          </div>
        ) : (
          users.map((user, index) => {
            return (
              <div
                className={"ug-list " + (lightTheme ? "" : "dark")}
                key={index}
                onClick={() => {
                  console.log("Creating chat with ", user.name);
                  const config = {
                    headers: {
                      Authorization: `Bearer ${userData.data.token}`,
                    },
                  };
                  setLoading(true);
                  axios
                    .post(
                      `${process.env.REACT_APP_DEPLOYMENT_URL}/chat/`,
                      {
                        userId: user._id,
                        name: users.name,
                      },
                      config
                    )
                    .then(() => {
                      setLoading(false);
                      setRefresh(!refresh);
                    });
                  console.log("dispatching");
                  console.log("dispatched");
                }}
              >
                <div className={"avatar-box " + (lightTheme ? "" : "dark")}>
                  <img
                    src={`data:image/svg+xml;base64,${user.avatarImage}`}
                    alt="user avatar"
                  />
                </div>
                <p className={"con-title " + (lightTheme ? "" : "dark")}>
                  {user.name}
                </p>
              </div>
            );
          })
        )}
      </User>
    </>
  );
};

export default Users;
