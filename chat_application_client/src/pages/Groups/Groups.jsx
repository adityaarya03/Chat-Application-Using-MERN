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
  const [pendingRequestsMap, setPendingRequestsMap] = useState({});
  const [adminGroups, setAdminGroups] = useState([]);

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
        // Find groups where user is admin
        const adminGroups = data.data.filter(
          (g) => g.groupAdmin && g.groupAdmin._id === userData.data._id
        );
        setAdminGroups(adminGroups);
        // Fetch pending requests for admin groups
        adminGroups.forEach((group) => {
          axios
            .get(
              `${process.env.REACT_APP_DEPLOYMENT_URL}/chat/groups/${group._id}/requests`,
              {
                headers: { Authorization: `Bearer ${userData.data.token}` },
              }
            )
            .then((res) => {
              setPendingRequestsMap((prev) => ({
                ...prev,
                [group._id]: res.data.pendingRequests,
              }));
            });
        });
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

  const handleRequestJoin = (groupId) => {
    setLoading(true);
    axios
      .post(
        `${process.env.REACT_APP_DEPLOYMENT_URL}/chat/groups/${groupId}/request-join`,
        {},
        { headers: { Authorization: `Bearer ${userData.data.token}` } }
      )
      .then(() => {
        setLoading(false);
        toast.success("Request sent to join group");
        setRefresh((prev) => !prev);
      })
      .catch((err) => {
        setLoading(false);
        if (err.response?.data?.message) {
          toast.error(err.response.data.message);
        } else {
          toast.error("Error sending join request");
        }
      });
  };

  const handleAcceptRequest = (groupId, userId) => {
    axios
      .post(
        `${process.env.REACT_APP_DEPLOYMENT_URL}/chat/groups/${groupId}/requests/${userId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${userData.data.token}` } }
      )
      .then(() => {
        toast.success("User added to group");
        setRefresh((prev) => !prev);
      })
      .catch(() => {
        toast.error("Error accepting request");
      });
  };

  const handleRejectRequest = (groupId, userId) => {
    axios
      .post(
        `${process.env.REACT_APP_DEPLOYMENT_URL}/chat/groups/${groupId}/requests/${userId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${userData.data.token}` } }
      )
      .then(() => {
        toast.info("Request rejected");
        setRefresh((prev) => !prev);
      })
      .catch(() => {
        toast.error("Error rejecting request");
      });
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
            const isMember = user.users.some(u => u.user && u.user._id === userData.data._id);
            const hasRequested = user.pendingRequests?.some(u => u._id === userData.data._id);
            return (
              <div
                className={"g-list " + (lightTheme ? "" : "dark")}
                key={index}
              >
                <div className={"avatar-box " + (lightTheme ? "" : "dark")}> 
                  <img
                    src={`data:image/svg+xml;base64,${user.avatarImage}`}
                    alt="user avatar"
                  />
                </div>
                <p className={"con-title " + (lightTheme ? "" : "dark")}>{user.chatName}</p>
                {isMember ? (
                  <button disabled className="joined-btn">Joined</button>
                ) : hasRequested ? (
                  <button disabled className="requested-btn">Request Sent</button>
                ) : (
                  <button onClick={() => handleRequestJoin(user._id)} className="join-btn">Request to Join</button>
                )}
              </div>
            );
          })
          )}
        </div>

        {/* Admin: Pending Requests Section */}
        {adminGroups.length > 0 && (
          <div className="admin-requests-section">
            <h3>Pending Join Requests (Admin)</h3>
            {adminGroups.map((group) => (
              <div key={group._id} className="admin-group-requests">
                <h4>{group.chatName}</h4>
                {(pendingRequestsMap[group._id]?.length > 0) ? (
                  pendingRequestsMap[group._id].map((user) => (
                    <div key={user._id} className="pending-request-item">
                      <span>{user.name || user.email || user._id}</span>
                      <button onClick={() => handleAcceptRequest(group._id, user._id)}>Accept</button>
                      <button onClick={() => handleRejectRequest(group._id, user._id)}>Reject</button>
                    </div>
                  ))
                ) : (
                  <span>No pending requests</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Groups;
