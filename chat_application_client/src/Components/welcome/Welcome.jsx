import React from 'react'
import logo from '../../assests/welcome.svg'
import logodark from '../../assests/DARK-WELCOME.svg'
import './welcome.css'
import Cookies from 'js-cookie';
import { useSelector } from 'react-redux';

const Welcome = () => {
  const lightTheme= useSelector((state)=>state.themeKey);
  const userData = JSON.parse(Cookies.get("userData"));
  return (
    <div className={'welcome-container ' + (lightTheme ? "" : "dark borderdarkwe")}>
      {lightTheme ?  <img src={logo} alt="logo" className='welcome-logo'/> :  <img src={logodark} alt="logo" className='welcome-logo'/> }  
        <p className={(lightTheme ? "" : "dark")}>Welcome {userData.data.name} </p>
        <p className={(lightTheme ? "" : "dark")}>View and text directly to people present in the chat Rooms.</p>
    </div>
  )
}

export default Welcome
