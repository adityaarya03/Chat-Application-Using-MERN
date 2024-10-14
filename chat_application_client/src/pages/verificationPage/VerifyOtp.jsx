import React, { useState } from "react";
import OtpInput from "react-otp-input";
import "./verifyotp.css";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const {signupData} = useSelector((state)=>state.auth);
  console.log("inside verify function");
  const {name,email,avatarImage,password} = signupData;
  const handleSubmit = async(e)=>{
    e.preventDefault();
    try{
        const response = await axios.post(`${process.env.REACT_APP_DEPLOYMENT_URL}/user/signup/`,{
            name,
            email,
            password,
            avatarImage,
            otp
        });
        if(response.status===200){
            toast.success("Signup successfully");
            navigate("/");
        }else if(response.status===400){
          toast.success("User already exits");
        }
        else{
            toast.error("Otp is not valid");
        }
    }catch(error){
        toast.error("otp is not valid");
        console.log(error);
    }
}
  return (
    <div className="otp-container">
      <div className="otp-box">
        <h1>Verify Email</h1>
        <p>
          A verification email has been send to you. Please enter the recived
          OTP
        </p>
        <form onSubmit={handleSubmit}>
          <OtpInput 
            value={otp}
            onChange={setOtp}
            numInputs={6}
            renderInput={(props) => <input 
                {...props} placeholder="-" className="otp-input" 
                style={{
                    boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
                  }}
                />}
            containerStyle={{
              justifyContent: "space-between",
              gap: "0 6px",
            }}
          />
          <button className="otp-button">Verify Email</button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;
