import React, { useState } from 'react'
import SideBar from '../Sidebar/SideBar'
import './main.css'
import { createContext } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../../pages/Navbar/Navbar'

export const myContext = createContext();
const MainContainer = () => {
  const [refresh, setRefresh] = useState(true);
  const [notification, setNotification] = useState([]);
  const [chatcontext , setChatcontext] = useState();
  return (
    <div className='main-container'>
      
      <myContext.Provider value={{refresh:refresh,setRefresh:setRefresh,notification:notification,setNotification:setNotification,chatcontext:chatcontext,setChatcontext:setChatcontext}} >
        <SideBar/>
          <Outlet/>
      </myContext.Provider>
    </div>
  )
}

export default MainContainer