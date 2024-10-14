import React from 'react'
import './main.css'

const LSContainer = ({children}) => {
  return (
    <div className='outer-container'>
        <div className='inner-container'>{children}</div>
    </div>
  )
}

export default LSContainer