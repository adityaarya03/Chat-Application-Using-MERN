import React from 'react'
import './conersationBox.css'
import { useNavigate } from 'react-router-dom'

const ConversationBox = ({props}) => {
  const navigate = useNavigate();
  return (
    <div className='conversation-container' onClick={()=>navigate('chat')}>
        <p className='con-icon'>{props.name}</p>
        <p className='con-title'>{props.name}</p>
        <p className='con-lastmessage'>{props.lastMessage}</p>
        <p className='con-timestamp'>{props.timeStamp}</p>
    </div>
  )
}

export default ConversationBox