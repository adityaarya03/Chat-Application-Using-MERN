import React from 'react'
import { toggleTheme } from "../Features/themeslice";
import { useSelector } from 'react-redux'


const User = ({children}) => {
  const lightTheme = useSelector((state)=>state.themeKey);
  return (
    <div className={'user-container '+ (lightTheme ? "" : "dark") }>
        {children}
    </div>
  )
}

export default User