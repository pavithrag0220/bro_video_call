import React, { useContext,useEffect } from 'react';
import { Grid, Typography, Paper, makeStyles,Button } from '@material-ui/core';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';

import { SocketContext } from '../../context/context';

const useStyles = makeStyles((theme) => ({
  video: {
    width: '550px',
    [theme.breakpoints.down('xs')]: {
      width: '300px',
    },
  },
  gridContainer: {
    justifyContent: 'center',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
    },
  },
  paper: {
    padding: '10px',
    border: '2px solid black',
    margin: '10px',
  },
}));

const VideoPlayer = () => {
  const { name, callAccepted, myVideo, userVideo, callEnded, stream, call , muteCall , mute ,muteBool,setMute,unMute,showVideo,hideVideo,videoBool,UserMuteCall,UserUnMute,muteBoolUser } = useContext(SocketContext);
  const classes = useStyles();
  useEffect(() => {
    console.log('Video player Mute ' , muteBool)
   
  }, [])
  return (
    <Grid container className={classes.gridContainer}>
      {stream && (
        <Paper className={classes.paper}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>{name || 'Name'}</Typography>
            <video playsInline  ref={myVideo} autoPlay className={classes.video} />
            {muteBool ? <Button onClick={unMute}><MicOffIcon/></Button> :  <Button onClick={muteCall}><MicIcon/></Button>}
            {videoBool ? <Button onClick={hideVideo}><VideocamOffIcon/></Button> :  <Button onClick={showVideo}><VideocamIcon/></Button>}
          </Grid>
        </Paper>
      )}
      {callAccepted && !callEnded && (
        <Paper className={classes.paper}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>{call.name || 'Name'}</Typography>
            <video playsInline ref={userVideo} autoPlay className={classes.video} />
            {muteBoolUser ? <Button onClick={UserUnMute}><MicOffIcon/></Button> :  <Button onClick={UserMuteCall}><MicIcon/></Button>}
          </Grid>
        </Paper>
      )}
    </Grid>
  );
};

export default VideoPlayer;
