import React, { useContext, useEffect, useState } from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Modal,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
// import { addTogroup } from "../../../chat_application_server/controller/chatController";
import Cookies from "js-cookie";
import axios from "axios";
import { useSelector } from "react-redux";
import { myContext } from "../Components/Main/MainContainer";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "#C4DFDF",
  //   border: "2px solid #000",
  borderRadius: "10px",
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const SeeUsers = ({ handleOpen, handleClose, open, name }) => {
  const navigate = useNavigate();
  const [users, setusers] = useState([]);
  const { refresh, setRefresh, chatcontext, setChatcontext } = useContext(myContext);
  const userData = JSON.parse(Cookies.get("userData"));
  const [searchquerry, setSearchquerry] = useState("");
  const lightTheme = useSelector((state) => state.themeKey);
  const [search, setSearch] = useState("");
  const [userRemove, setUserRemove] = useState();
  const [opendia, setOpendia] = React.useState(false);

  if (!userData) {
    console.log("User Not Authenticated");
  }

  const handleSearch = async (query) => {
    if (!query) {
      return;
    }
    setSearch(query);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userData.data.token}`,
        },
      };

      axios
        .get(
          `${process.env.REACT_APP_DEPLOYMENT_URL}/user/fetchAllUsers?search=${search}`,
          config
        )
        .then((data) => {
          console.log("User refresed in user panel");
          setusers(data.data);
        });
    } catch (error) {
      toast.error("error while seaching");
      console.log(error);
    }
  };

  const handleLeave = async (userRemove) => {
    if (userRemove._id !== userData.data._id && chatcontext.groupAdmin._id !== userData.data._id) {
      toast("Only admins can remove users!", {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userData.data.token}`,
        },
      };
      const response = await axios.put(
        `${process.env.REACT_APP_DEPLOYMENT_URL}/chat/leaveGroup`,
        {
          chat_id: chatcontext._id,
          user_id: userRemove._id,
        },
        config
        );
        setChatcontext(response.data);
        console.log("Hii goo",chatcontext);
        if (response.status === 200) {
          toast("user removed successfully!", {
            position: "bottom-left",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          setRefresh(!refresh);
      }
    } catch (error) {
      toast.error("hii error occured");
      console.log(error);
    }
  };

  const handleAddUser = async (userToAdd) => {
    if (chatcontext.users.find((exs) => exs.user._id === userToAdd._id)) {
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
      return;
    }

    if (chatcontext.groupAdmin._id !== userData.data._id) {
      toast("Only admins can add users!", {
        position: "bottom-left",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${userData.data.token}` },
      };

      const { data } = await axios.put(
        `${process.env.REACT_APP_DEPLOYMENT_URL}/chat/addUsers`,
        {
          chatId: chatcontext._id,
          userId: userToAdd._id,
        },
        config
      );

      setChatcontext(data);
      console.log(data, "added user data response");

      setRefresh(!refresh);
      //   setLoading(false);
    } catch (error) {
      console.log("error while adding user");
    }
  };


  useEffect(()=>{
    console.log("user is changes",userRemove);
  },[userRemove])


  const handleClickOpendia = () => {
    setOpendia(true);
  };

  const handleClosedia = () => {
    setOpendia(false);
  };

  return (
    <>
      <div>
        <Dialog
          open={opendia}
          onClose={handleClosedia}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Do you want to remove this user"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              This will remove the user from the group.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosedia}>Disagree</Button>
            <Button
              onClick={() => {
                handleLeave(userRemove);
                setRefresh(!refresh);
                handleClosedia();
              }}
              autoFocus
            >
              Agree
            </Button>
          </DialogActions>
        </Dialog>
      </div>
      <div>
        <IconButton onClick={handleOpen}>
          <MoreVertIcon />
        </IconButton>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography
              id="modal-modal-title"
              variant="h6"
              component="h2"
              sx={{ fontWeight: "700", textAlign: "center" }}
            >
              GroupName : {name}
            </Typography>
            <div className="users-add">
              {chatcontext && chatcontext.users && chatcontext.users.map((userObj, index) => {
                const member = userObj.user;
                return (
                  <div
                    key={member._id}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Stack direction="row" spacing={1}>
                      <Chip
                        label={member.name}
                        onDelete={() => {
                          setUserRemove(member);
                          handleClickOpendia();
                        }}
                      />
                    </Stack>
                  </div>
                );
              })}
            </div>
            <TextField
              id="filled-basic"
              label="Add Members"
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused": {
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "black", // Replace with your desired focus color
                    },
                  },
                },
                "& label": {
                  "&.Mui-focused": {
                    color: "black", // Replace with your desired label focus color
                  },
                },
              }}
              onChange={(e) => handleSearch(e.target.value)}
            />

            <div className="addmem-cont">
              {users?.map((user) => {
                return (
                  <div
                    className="addmemuser"
                    onClick={() => handleAddUser(user)}
                  >
                    <div className={"avatar-box"}>
                      <img
                        src={`data:image/svg+xml;base64,${user.avatarImage}`}
                        alt=""
                      />
                    </div>
                    <div className={"con-title"} style={{ color: "#CBE4DE" }}>
                      {user.name}
                    </div>
                  </div>
                );
              })}
            </div>

            <Box sx={{ display: "flex", gap: "30px" }}>
              <Button
                sx={{
                  backgroundColor: "#2C3333",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#CBE4DE",
                    color: "black",
                  },
                }}
                onClick={() => {
                  handleLeave(userData.data)
                  navigate("/app/welcome");
                  setRefresh(!refresh);
                }}
              >
                Leave Chat
              </Button>
            </Box>
          </Box>
        </Modal>
      </div>
    </>
  );
};

export default SeeUsers;
