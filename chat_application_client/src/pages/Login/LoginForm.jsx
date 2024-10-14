import React, { useState } from "react";
import Form from "../../Components/LoginPage/Form";
import { Link, useNavigate } from "react-router-dom";
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import "./login.css"; 
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { Backdrop, CircularProgress } from "@mui/material";
import './login.css'


const LoginForm = () => {

  const [formdata, setFormdata] = useState({
    name:'',
    password:''
  })
  
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e)=>{
    setFormdata({...formdata , [e.target.name] : e.target.value})
  }

  const navigate = useNavigate();

  const handleSubmit = async()=>{
    setLoading(true);
    try{

      const response = await axios.post(
        `${process.env.REACT_APP_DEPLOYMENT_URL}/user/login`,
        formdata
      )

      console.log(response);

      if (response.status === 200) {
        toast.success("Login Successful");
        Cookies.set("userData", JSON.stringify(response),{expires:7});
        navigate("/app/welcome");
      } else {
        toast.error("Login failed. Please try again.");
      }

      setLoading(false);

    }catch(error){
      console.log(error);
      if(error.response.status=== 400){
        toast.error("User with this username already exits");
      }
      else if(error.response.status===403){
        toast.error("User not Found")
      }
      setLoading(false);
    }
  }

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
      <h1>Login</h1>
      <TextField
      onChange={handleInputChange}
        className="input"
        type="text"
        id="outlined-username"
        label="UserName"
        variant="outlined"
        name = "name"
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
        id="outlined-password"
        label="Password"
        variant="outlined"
        name = "password"
        sx={{
          "& .MuiOutlinedInput-root.Mui-focused": {
            "& > fieldset": {
      borderColor: "#e8505b"
            }
          }
        }}
      />
      <Button onClick={handleSubmit}  className="button" variant="contained"
        sx={{
            backgroundColor:'#e8505b',
            '&:hover':{
                backgroundColor:'#e8505b'
            }
        }}
      >
        Login
      </Button>
      <p className="loginspan">
        Do not have an account?<Link to='/signup'>
        <span> sign up</span>
        </Link>
      </p>
    </Form>
    )}
    </>
  );
};

export default LoginForm;

