import React from "react";
import logo from "../../assests/talking.png";
import "./Navbar.css";
import LightModeIcon from "@mui/icons-material/LightMode";
import { IconButton } from "@mui/material";
import { Outlet } from "react-router-dom";
const Navbar = () => {
  return (
    <div>
      <div className="navbar-header">
        <div className="navbar-logo">
          <div className="logo">
            <img src={logo} alt="" />
          </div>
          <div className="text-logo">
            <p>Chatty</p>
          </div>
        </div>
{/* 
        <div className="mode">
          <IconButton
            sx={{
              "&:hover": {
                backgroundColor: "white",
              },
            }}
          >
            <LightModeIcon />
          </IconButton>
        </div> */}
      </div>
      <Outlet />
    </div>
  );
};

export default Navbar;
