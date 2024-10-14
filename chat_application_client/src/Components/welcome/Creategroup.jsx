import DoneOutlineRoundedIcon from "@mui/icons-material/DoneOutline";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import "./creategroup.css";
import Cookies from "js-cookie";
import axios from "axios";
import { useAvatar } from "../hooks/useAvatar";
import AvatarUploader from "../AvatarUploader";
import { myContext } from "../Main/MainContainer";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Backdrop, CircularProgress } from "@mui/material";

const Creategroup = () => {
  const lightTheme = useSelector((state) => state.themeKey);
  const userData = JSON.parse(Cookies.get("userData"));
  const [loading, setLoading] = useState(false);

  if (!userData) {
    console.log("user not authenticates");
  }

  const { refresh, setRefresh } = useContext(myContext);

  const [groupName, setGroupName] = useState({
    name: "",
    avatarImage: "",
  });

  const handleInputChange = (e) => {
    setGroupName({ ...groupName, [e.target.name]: e.target.value });
  };

  const [open, setOpen] = React.useState(false);
  const {
    error: avatarError,
    isLoading: avatarLoading,
    fetchAvatar,
  } = useAvatar();

  //Avatar
  const generateAvatar = async () => {
    const avatar = await fetchAvatar();
    setGroupName((prev) => ({
      ...prev,
      avatarImage: avatar,
    }));
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    e.stopPropagation();
    generateAvatar();
  };

  useEffect(() => {
    generateAvatar();
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const createGroups = async () => {
    const config = {
      headers: {
        Authorization: `Bearer ${userData.data.token}`,
      },
    };
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_DEPLOYMENT_URL}/chat/createGroup`,
        {
          name: groupName.name,
          avatarImage: groupName.avatarImage,
        },
        config
      );
      if (response.status === 200) {
        setLoading(false);
        setRefresh(!refresh);
        toast.success("group created successfully");
      }
    } catch (error) {
      setLoading(false);

      if (error.response.status === 404) {
        toast.error("Group is already present with this username");
      } else toast.error("error while creating group");
    }
  };

  return (
    <>
      <div>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Do you want to create a Group Named " + groupName}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              This will create a create group in which you will be the admin and
              other will be able to join this group.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Disagree</Button>
            <Button
              onClick={() => {
                createGroups();
                setRefresh(!refresh);
                handleClose();
              }}
              autoFocus
            >
              Agree
            </Button>
          </DialogActions>
        </Dialog>
      </div>

      {loading ? (
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
         <CircularProgress color="secondary" variant="indeterminate" />
        </Backdrop>
      ) : (
        <div
          className={
            "createGroups-container " + (lightTheme ? "" : "dark borderdark")
          }
        >
          <div
            className={"createGroups-box " + (lightTheme ? "" : "darkerbox")}
          >
            <div className={lightTheme ? "" : "darkerbox"}>
              <h1>Enter Group Name</h1>
            </div>
            <div className="creategroupInput">
              <input
                onChange={handleInputChange}
                name="name"
                placeholder="Group Name"
                className={"search-box " + (lightTheme ? "" : "")}
              />
              <AvatarUploader
                error={avatarError}
                isLoading={avatarLoading}
                onGenerate={handleGenerate}
                avatar={groupName.avatarImage}
              />
              <Button
                variant="contained"
                className={"icon " + (lightTheme ? "" : "darker")}
                onClick={() => {
                  handleClickOpen();
                  // createGroup();
                }}
                sx={{
                  backgroundColor: "#e8505b",
                  padding: "10px 10px",
                  "&:hover": {
                    backgroundColor: "#e8505b",
                  },
                }}
              >
                Create Group
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Creategroup;
