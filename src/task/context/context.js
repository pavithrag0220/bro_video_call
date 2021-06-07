import React, { createContext, useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';

const SocketContext = createContext();

const socket = io('http://localhost:5000');
// const socket = io('https://warm-wildwood-81069.herokuapp.com');

const ContextProvider = ({ children }) => {
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState();
  const [name, setName] = useState('');
  const [call, setCall] = useState({});
  const [me, setMe] = useState('');
  const [mute, setMute] = useState(true);
  const [muteBool, setMuteBool] = useState(false);
  const [muteUser, setMuteUser] = useState(true);
  const [muteUserSupport,setmuteUserSupport] = useState(false)
  const [muteBoolUser, setMuteUserBool] = useState(false);
  const [liveVideo, setLiveVideo] = useState(true);
  const [videoBool,setvideoBool] = useState(false);
  

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  // useEffect(() => {
  //   navigator.mediaDevices.getUserMedia({ video: true, audio: mute })
  //     .then((currentStream) => {
  //       setStream(currentStream);

  //       myVideo.current.srcObject = currentStream;
  //     });

  //   socket.on('me', (id) => setMe(id));

  //   socket.on('callUser', ({ from, name: callerName, signal }) => {
  //     setCall({ isReceivingCall: true, from, name: callerName, signal });
  //   });
  // }, []);

  useEffect(() => {
    console.log('my voice is ',mute)
    navigator.mediaDevices.getUserMedia({ video: liveVideo, audio: mute })
    .then((currentStream) => {
      setStream(currentStream);

      myVideo.current.srcObject = currentStream;
    });

  socket.on('me', (id) => setMe(id));

  socket.on('callUser', ({ from, name: callerName, signal }) => {
    setCall({ isReceivingCall: true, from, name: callerName, signal });
  });
  }, [mute,liveVideo])

  useEffect(() => {
  if(muteUserSupport){
      console.log('user voice is',muteUser)
      navigator.mediaDevices.getUserMedia({ video: true, audio: muteUser })
      .then((currentStream) => {
        setStream(currentStream);
  
        userVideo.current.srcObject = currentStream;
      });
  
    socket.on('me', (id) => setMe(id));
  
    socket.on('callUser', ({ from, name: callerName, signal }) => {
      setCall({ isReceivingCall: true, from, name: callerName, signal });
    });
    }
    else{
      console.log('First false render');
    }
   
}, [muteUser])

  const answerCall = () => {
    setCallAccepted(true);

    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: call.from });
    });

    peer.on('stream', (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });

    peer.signal(call.signal);

    connectionRef.current = peer;
};

  const callUser = (id) => {
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on('signal', (data) => {
      console.log('peer data',data)
      socket.emit('callUser', { userToCall: id, signalData: data, from: me, name });
    });

    peer.on('stream', (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });

    socket.on('callAccepted', (signal) => {
      setCallAccepted(true);

      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
    window.location.reload();
  };

  const muteCall = ()=>{
    setMute(false)
    setMuteBool(true)
    console.log('my mute is hitted')
  }

  const unMute = ()=>{
    setMute(true)
    setMuteBool(false)
    console.log('my unmute is hitted')
  }
  const UserMuteCall = ()=>{
    setMuteUser(false)
    setMuteUserBool(true)
    setmuteUserSupport(true)
    console.log('user mute is hitted') 
  }

  const UserUnMute = ()=>{
    setMuteUser(true)
    setMuteUserBool(false)
    setmuteUserSupport(true)
    console.log('user unmute is hitted')
  }
  const showVideo = ()=>{
    setLiveVideo(false)
    setvideoBool(true)
    console.log('mute hitted',liveVideo);
  }
  const hideVideo = ()=>{
    setLiveVideo(true)
    setvideoBool(false)
  }
  return (
    <SocketContext.Provider value={{
      call,
      callAccepted,
      myVideo,
      userVideo,
      stream,
      name,
      setName,
      callEnded,
      me,
      callUser,
      leaveCall,
      answerCall,
      muteCall,
      setMute,
      unMute,
      showVideo,
      hideVideo,
      UserMuteCall,
      UserUnMute,
      muteBool,
      videoBool,
      muteBoolUser
    }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { ContextProvider, SocketContext };
