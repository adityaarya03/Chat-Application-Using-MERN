import React from 'react'
import './message.css'
import { motion } from "framer-motion"
import { useSelector } from 'react-redux';


const Messageother = ({props}) => {
  const lighttheme = useSelector((state) => state.themeKey);
  const updatedAtDate = new Date(props.updatedAt);

  const hours = updatedAtDate.getHours();
  const minutes = updatedAtDate.getMinutes();
  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedTime = `${formattedHours}:${formattedMinutes}`;

  return (
    <motion.div whileHover={{scale:1.04}} className={'message-others-con'}>
      
      <div className='message-other-icon'>
        <img src={`data:image/svg+xml;base64,${props.sender.avatarImage}`} alt="" width={"40px"} height={"40px"}/>
      </div>
      <div className={'message-other-container '  + (lighttheme ? "" : "darkerlight")}>
        <div className='message-other-title'>
            {props.sender.name}
        </div>
        <div className='msg-contime'>
          <div className='message-other-message'>
            {props.content}
          </div>
          <div className='msg-timestamp'>{formattedTime}</div>
        </div>
      </div>
    </motion.div>
  )
}

export default Messageother