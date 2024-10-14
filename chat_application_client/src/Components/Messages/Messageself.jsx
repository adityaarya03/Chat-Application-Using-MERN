import React from 'react'
import './message.css'
import { motion } from "framer-motion"
import { useSelector } from 'react-redux';
const Messageself = ({props}) => {
  const lighttheme = useSelector((state) => state.themeKey);
  const updatedAtDate = new Date(props.updatedAt);

  const hours = updatedAtDate.getHours();
  const minutes = updatedAtDate.getMinutes();
  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedTime = `${formattedHours}:${formattedMinutes}`;
  return (

    <div className='main-self'>
        <motion.div whileHover={{scale:1.04}} className={'message-self-container ' + (lighttheme ? "" : "darkergreen")}>
            <div className={'message-self '}>
                {props.content}
            </div>
            <div className='msg-timestamp'>{formattedTime}</div>
        </motion.div>
    </div>
  )
}

export default Messageself