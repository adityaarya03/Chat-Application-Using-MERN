import React, { useCallback, useEffect, useState } from "react";
import Form from "../../Components/LoginPage/Form";
import { TextField, Button, CircularProgress } from "@mui/material";
import "./signup.css";
import { Link, useNavigate } from "react-router-dom";
import Backdrop from "@mui/material/Backdrop";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import { useAvatar } from "../../Components/hooks/useAvatar";
import AvatarUploader from "../../Components/AvatarUploader";
import { setSignupData } from "../../Features/authotp";
import { useDispatch } from "react-redux";

const SignupForm = () => {
  const [formdata, setFormdata] = useState({
    name: "",
    email: "",
    password: "",
    avatarImage: ""
  });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { error: avatarError, isLoading: avatarLoading, fetchAvatar } = useAvatar();

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormdata({ ...formdata, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const signupData = {
      ...formdata
    }
    dispatch(setSignupData(signupData));
    setLoading(true);
    const response = await axios.post(`${process.env.REACT_APP_DEPLOYMENT_URL}/user/otp`,formdata);
    if(response.status===200){
      console.log("OTP is donr from client side");
      toast.success("Otp send successfuly");
      navigate("/signup/verify");
      setLoading(false);
      setFormdata({
        name: "",
        email: "",
        password: "",
        avatarImage: ""
      })
    }else{
      toast.error("Error while sending otp");
    }

  };
  
  const generateAvatar = useCallback(async () => {
    const avatar = await fetchAvatar();
    setFormdata((prev) => ({
      ...prev,
      avatarImage: avatar
    }));
  }, [fetchAvatar]);
  

  
    const handleGenerate = (e) => {
      e.preventDefault();
      e.stopPropagation();
      generateAvatar();
    };

    useEffect(() => {
      generateAvatar();
    }, [generateAvatar]);

  return (
    <>
      {loading ? (
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      ) : (
        <Form>
          <h1>Signup</h1>
          <TextField
            onChange={handleInputChange}
            className="input"
            type="text"
            id="standard-basic"
            label="UserName"
            variant="outlined"
            name="name"
            sx={{
              "& .MuiOutlinedInput-root.Mui-focused": {
                "& > fieldset": {
          borderColor: "#e8505b",
                }
              },
            }}
          />
          <TextField
            onChange={handleInputChange}
            className="input"
            type="email"
            id="outlined-email-basic"
            label="Email"
            variant="outlined"
            name="email"
            sx={{
              "& .MuiOutlinedInput-root.Mui-focused": {
                "& > fieldset": {
          borderColor: "#e8505b",
                }
              },
            }}
          />
          <TextField
            onChange={handleInputChange}
            className="input"
            type="password"
            id="outlined-input-basic"
            label="Password"
            variant="outlined"
            name="password"
          />
          <AvatarUploader
          error={avatarError}
          isLoading={avatarLoading}
          onGenerate = {handleGenerate}
          avatar = {formdata.avatarImage}
          />
          <Button
            onClick={handleSubmit}
            className="button"
            variant="contained"
            sx={{
              backgroundColor: "#e8505b",
              "&:hover": {
                backgroundColor: "#e8505b",
              },
            }}
          >
            Signup
          </Button>
          <p className="singupspan">
            Already have an account ?{" "}
            <Link to="/">
              <span>login</span>
            </Link>
          </p>
        </Form>
      )}
    </>
  );
};

export default SignupForm;
