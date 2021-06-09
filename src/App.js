import { ButtonBase } from "@material-ui/core"
import Button from "@material-ui/core/Button"
import IconButton from "@material-ui/core/IconButton"
import TextField from "@material-ui/core/TextField"
import AssignmentIcon from "@material-ui/icons/Assignment"
import PhoneIcon from "@material-ui/icons/Phone"
import React, { useEffect, useRef, useState } from "react"
import { CopyToClipboard } from "react-copy-to-clipboard"
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import Peer from "simple-peer"
import io from "socket.io-client"
import "./App.css"


const socket = io.connect('https://bro-video-call.herokuapp.com/')
function App() {
	const [me, setMe] = useState("")
	const [stream, setStream] = useState()
	const [receivingCall, setReceivingCall] = useState(false)
	const [caller, setCaller] = useState("")
	const [callerSignal, setCallerSignal] = useState()
	const [callAccepted, setCallAccepted] = useState(false)
	const [idToCall, setIdToCall] = useState("")
	const [callEnded, setCallEnded] = useState(false)
	const [name, setName] = useState("");
	// const [mute, setMute] = useState(true);
  	const [muteBool, setMuteBool] = useState(false);
	const [videoBool,setvideoBool] = useState(false);
	const myVideo = useRef()
	const userVideo = useRef()
	const connectionRef = useRef()

	useEffect(() => {
		navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
			setStream(stream)
			myVideo.current.srcObject = stream
		})

		socket.on("me", (id) => {
			setMe(id)
		})

		socket.on("callUser", (data) => {
			setReceivingCall(true)
			setCaller(data.from)
			setName(data.name)
			setCallerSignal(data.signal)
		})
	}, [])

	const callUser = (id) => {
		const peer = new Peer({
			initiator: true,
			trickle: false,
			stream: stream
		})
		peer.on("signal", (data) => {
			socket.emit("callUser", {
				userToCall: id,
				signalData: data,
				from: me,
				name: name
			})
		})
		peer.on("stream", (stream) => {

			userVideo.current.srcObject = stream

		})
		socket.on("callAccepted", (signal) => {
			setCallAccepted(true)
			peer.signal(signal)
		})

		connectionRef.current = peer
	}
	const muteCall = ()=>{
		setMuteBool(true)
		let newStream = stream.getTracks();
		newStream.forEach(track => {
			if(track.kind === 'audio') {
				track.enabled = false;
			}
		})
		console.log('mutted')
		playVideo(newStream)
	  }
	const playVideo=(stream)=>{
	myVideo.current.srcObject =  new MediaStream(stream);
	}
	  const unMute = ()=>{
		setMuteBool(false)
		let newStream = stream.getTracks();
		newStream.forEach(track => {
			if(track.kind === 'audio') {
				track.enabled = true;
			}
		})
		console.log('unmute')
		playVideo(newStream)
	  }

	  const showVideo = ()=>{
		 setvideoBool(false)
		let newStream = stream.getTracks();
		newStream.forEach(track => {
			if(track.kind === 'video') {
				track.enabled = true;
			}
		})
		console.log('video ON')
		playVideo(newStream)
	  }
	  const hideVideo = ()=>{
		 setvideoBool(true)
		 let newStream = stream.getTracks();
		 newStream.forEach(track => {
			 if(track.kind === 'video') {
				 track.enabled = false;
			 }
		 })
		 console.log('video OFF')
		 playVideo(newStream)
	  }


	const answerCall = () => {
		setCallAccepted(true)
		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream: stream
		})
		peer.on("signal", (data) => {
			socket.emit("answerCall", { signal: data, to: caller })
		})
		peer.on("stream", (stream) => {
			userVideo.current.srcObject = stream
		})

		peer.signal(callerSignal)
		connectionRef.current = peer
	}

	const leaveCall = () => {
		setCallEnded(true)
		connectionRef.current.destroy()
	}

	return (
		<div>
			<h1 style={{ textAlign: "center", color: '#fff' }}>Video Call App</h1>
			<div className="container">
				<div className="video-container">
					<div className="video">
						{stream && <video playsInline muted ref={myVideo} autoPlay style={{ width: "400px" }} />}
						{muteBool ? <Button onClick={unMute}><MicOffIcon/></Button> :  <Button onClick={muteCall}><MicIcon/></Button>}
						{videoBool ? <Button onClick={showVideo}><VideocamOffIcon/></Button> :  <Button onClick={hideVideo}><VideocamIcon/></Button>}
					</div>
					<div className="video">
						{callAccepted && !callEnded ?
							<video playsInline ref={userVideo} autoPlay style={{ width: "400px" }} /> :
							null}
					</div>
				</div>
				<div className="myId">
					<TextField
						className="filled-basic"
						label="Name"
						variant="filled"
						value={name}
						onChange={(e) => setName(e.target.value)}
						style={{ marginBottom: "20px" }}
					/>
					<CopyToClipboard text={me} style={{ marginBottom: "2rem" }}>
						<Button variant="contained" color="primary" startIcon={<AssignmentIcon fontSize="large" />}>
							Copy Meeting ID
					</Button>
					</CopyToClipboard>

					<TextField
						id="filled-basic"
						label="ID to call"
						variant="filled"
						value={idToCall}
						onChange={(e) => setIdToCall(e.target.value)}
					/>
					<div className="call-button">
						{callAccepted && !callEnded ? (
							<Button variant="contained" color="secondary" onClick={leaveCall}>
								End Call
							</Button>
						) : (
							<IconButton color="primary" aria-label="call" onClick={() => callUser(idToCall)}>
								<PhoneIcon fontSize="large" />
							</IconButton>
						)}
						{idToCall}
					</div>
				</div>
				<div>
					{receivingCall && !callAccepted ? (
						<div className="caller">
							<h1 >{name} is calling...</h1>
							<Button variant="contained" color="primary" onClick={answerCall}>
								Answer
						</Button>
						</div>
					) : null}
				</div>
			</div>
		</div>
	)
}

export default App;
