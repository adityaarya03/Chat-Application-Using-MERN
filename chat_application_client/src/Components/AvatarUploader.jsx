import { IconButton } from '@mui/material'
import React from 'react'
import LoopIcon from '@mui/icons-material/Loop';

const AvatarUploader = ({error,isLoading,avatar,onGenerate}) => {
    // console.log(avatar);
  return (
    <div className='Wrapper'>
        <div className='AvatarBox'>
            {
            avatar? (
            <img error={error} isLoading={isLoading} src={`data:image/svg+xml;base64,${avatar}`} alt="user-avatar" width={"60px"} height={"60px"}/>
            ) : null
            }
        </div>
        <div className='generate_button' onClick={onGenerate}>
            <IconButton  className=   {`loader ${isLoading?'rotate' : ''} `}>
                <LoopIcon/>
            </IconButton>
            <p>{error ? 'Please try again later' : isLoading ? 'Generating...' : 'Generate Avatar'}</p>
        </div>
    </div>
  )
}

export default AvatarUploader