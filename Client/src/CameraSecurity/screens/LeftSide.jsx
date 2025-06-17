import React, { useEffect, useCallback, useState } from "react";
import { CiMicrophoneOff } from "react-icons/ci";
import { BiSolidCameraOff } from "react-icons/bi";
import { MdOutlineCallEnd } from "react-icons/md";
import { FaCamera } from "react-icons/fa";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";
import { IoSend } from "react-icons/io5";
import { Toaster, toast } from "react-hot-toast";
import { CiMicrophoneOn } from "react-icons/ci";
import "../../App.css";
import { FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { LuShieldCheck } from "react-icons/lu";

export const LeftSide = ({ room, email, isLightMode }) => {
  const socket = useSocket();
  const Navigate = useNavigate();
  const [mySocket, setmySocket] = useState();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currMsg, setcurrMsg] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);

  const toggleMic = () => {
    if (!myStream) return;
    if(micOn) {
      const micMsg = `${email} turned off the mic`;
      socket.emit("micMsg",({remoteSocketId,micMsg}));
    }
    else {
      const micMsg = `${email} turned on the mic`;
      socket.emit("micMsg",({remoteSocketId,micMsg}));
    }
    myStream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    });
  };

  useEffect(() => {
    if (socket) {
      setmySocket(socket.id);
    }
  }, [socket]);

  const toggleCamera = () => {
    if (!myStream) return;
    const newCameraState = !cameraOn;
    myStream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    setCameraOn(newCameraState);
    socket.emit("camera:toggle", { to: remoteSocketId, email, newCameraState });
  };

  const cutCall = () => {
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
    }
    setMyStream(null);
    setRemoteStream(null);
    socket.emit("call:ended", { to: remoteSocketId });
    toast("📴 Call Ended");
    Navigate("/");
  };

  const handleUserJoined = useCallback(({ email, id }) => {
    // console.log(`Email ${email} joined room`);
    toast.success(`${email} joined the Meeting..`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    toast.success("Call sent. Waiting for response...");
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleAcceptCall = async () => {
    if (!incomingCall) return;
    const { from, offer } = incomingCall;
    setShowPrompt(false);
    setRemoteSocketId(from);
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
    const ans = await peer.getAnswer(offer);
    socket.emit("call:accepted", { to: from, ans });
    toast.success("Send the Stream");
  };

  const handleDeclineCall = () => {
    setShowPrompt(false);
    setIncomingCall(null);
  };

  const renderAcceptDeclinePrompt = () => {
    if (!showPrompt) return null;

    return (
      <div className="fixed top-0 left-0 w-full h-full backdrop-blur-md flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center gap-4">
          <p className="text-lg font-semibold text-gray-800">
            Incoming Call...
          </p>
          <div className="flex gap-4">
            <button
              onClick={handleAcceptCall}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition duration-200 hover:scale-90 hover:active:scale-80 transform cursor-pointer"
            >
              Accept
            </button>
            <button
              onClick={handleDeclineCall}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition duration-200 hover:scale-90 hover:active:scale-80 transform cursor-pointer"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleIncommingCall = useCallback(({ from, offer }) => {
    toast.success("📲 Incoming Call...");
    setIncomingCall({ from, offer });
    setShowPrompt(true);
  }, []);

  const sendStreams = useCallback(() => {

    toast.success("Stream sent..");

    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      // console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      // console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("call:ended", () => {
      if (myStream) {
        myStream.getTracks().forEach((track) => track.stop());
      }
      setMyStream(null);
      setRemoteStream(null);
      toast("📴 Call Ended");
      Navigate("/");
    });

    return () => {
      socket.off("call:ended");
    };
  }, [socket, myStream]);

  const giveMutedMessage = ({ from, email, newCameraState }) => {
    // console.log(email);
    if (newCameraState) {
      const msg = email + " turned On the Camera";
      toast.success(msg);
    } else {
      const msg = email + " turned Off the Camera";
      toast.success(msg);
    }
  };

  const changeMessages = ({ from, currMsg }) => {
    // console.log("agya bhai mein idhar");
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        icon: from[0].toUpperCase(),
        SID: from,
        message: currMsg,
      },
    ]);
  };

  function notifyMic({from,micMsg}){
    toast.success(micMsg);
  }

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);
    socket.on("camera:toggle", giveMutedMessage);
    socket.on("messages:sent", changeMessages);
    socket.on("micMsg",notifyMic);
   
    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
      socket.off("camera:toggle", giveMutedMessage);
      socket.off("messages:sent", changeMessages);
      socket.off("micMsg",notifyMic);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  const sendMessage = (e) => {
    if(!currMsg || !currMsg.trim()) return;
    // console.log("Sending to:", remoteSocketId);
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        icon: email[0].toUpperCase(),
        SID: mySocket,
        message: currMsg,
      },
    ]);

    socket.emit("messages:sent", { to: remoteSocketId, currMsg });
    setcurrMsg("");
  };

  // Wrap the JSX inside a responsive container
  return (
    <>
      <Toaster />
      {renderAcceptDeclinePrompt()}
      <div
        className={`flex flex-col md:flex-row  h-full items-center w-full bg-gradient-to-br from-sky-700 via-blue-800 to-gray-900`}
      >
        {/* Video + Controls Section */}
        <div className={`flex h-[100vh] flex-col bg-gradient-to-br from-sky-700 via-blue-800 to-gray-900  items-center  w-full md:w-2/3`}>

          {/* Video Streams */}
          <div className="gap-6 p-3 flex flex-col justify-between h-full">
            <div className="w-full text-center">
            <div
              className={`text-2xl lg:text-2xl py-3 md:text-3xl font-bold flex items-center justify-center gap-2 text-white`}
            >
              <LuShieldCheck />
              IntelliConnect
            </div>
          </div>
            <div className="flex flex-col gap-8 lg:flex-row lg:gap-0 md:flex-col sm:flex-col h-full justify-center items-center w-full">
            <div className="w-full  aspect-video rounded-xl overflow-hidden">
              {myStream && (
                <ReactPlayer
                  playing
                  muted
                  height="100%"
                  width="100%"
                  url={myStream}
                  className="object-cover"
                />
              )}
            </div>
            <div className="w-full aspect-video rounded-xl overflow-hidden">
              {remoteStream && (
                <ReactPlayer
                  playing
                  height="100%"
                  width="100%"
                  url={remoteStream}
                  className="object-cover"
                />
              )}
            </div>
          </div>

          {/* Stream Buttons */}
          <div className="w-full flex flex-wrap justify-center items-center gap-4">
            {myStream && (
              <button
                onClick={sendStreams}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition transform hover:scale-90"
              >
                Send Stream
              </button>
            )}
            {remoteSocketId && (
              <button
                onClick={handleCallUser}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition transform hover:scale-90"
              >
                Call User
              </button>
            )}
          </div>

          {/* Call Controls */}
          <div className="flex w-full justify-center gap-12">
            <div onClick={toggleMic} className="cursor-pointer text-2xl">
              {micOn ? (
                <CiMicrophoneOn
                  className={`${isLightMode ? "text-blue-900" : "text-white"}`}
                />
              ) : (
                <CiMicrophoneOff
                  className={`${isLightMode ? "text-blue-900" : "text-white"}`}
                />
              )}
            </div>
            <div onClick={toggleCamera} className="cursor-pointer text-2xl">
              {cameraOn ? (
                <FaCamera
                  className={`${isLightMode ? "text-blue-900" : "text-white"}`}
                />
              ) : (
                <BiSolidCameraOff
                  className={`${isLightMode ? "text-blue-900" : "text-white"}`}
                />
              )}
            </div>
            <div onClick={cutCall} className="cursor-pointer text-2xl">
              <MdOutlineCallEnd
                className={`${isLightMode ? "text-blue-900" : "text-white"}`}
              />
            </div>
          </div>

          {/* Connection Status */}
          <div className="w-full pb-1 text-lg text-center">
            {remoteSocketId ? (
              <span className="text-green-600 font-semibold">Connected</span>
            ) : (
              <span className="text-red-600 font-semibold">
                No one in the Meeting
              </span>
            )}
          </div>
          </div>
        </div>

        {/* Chat Section */}
        <div
          className={`w-full md:w-1/3 flex flex-col h-full  border-l `}
        >
          <div className="h-[100vh] flex flex-col justify-between">
            <div className="h-12 flex items-center justify-center bg-gradient-to-br from-sky-700 via-blue-800 to-gray-900 text-white font-semibold">
            Chat Box
          </div>

          <div className="flex-grow p-4 h-5/6 bg-gradient-to-br from-sky-700 via-blue-800 to-gray-900 overflow-y-auto hide-scrollbar">
            {messages.map((item, key) => {
              const isMe = item.SID === mySocket;
              return (
                <div
                  key={key}
                  className={`mb-3 flex ${
                    isMe ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-white ${
                        isMe ? "bg-blue-600" : "bg-gray-600"
                      }`}
                    >
                      <FaUser />
                    </div>
                    <div
                      className={`px-4 py-2 rounded-2xl text-sm shadow ${
                        isMe
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {item.message}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Field */}
          <div
            className={`flex items-center gap-2 p-3 bg-transparent`}
          >
            <input
              type="text"
              value={currMsg}
              onChange={(e) => setcurrMsg(e.target.value)}
              className={`flex-grow px-3 py-2 rounded-md border text-sm focus:outline-none border-yellow-700 focus:ring-yellow-400 text-white`}
              placeholder="Start chatting..."
            />
            <button
              onClick={sendMessage}
              className={`p-2 rounded-md cursor-pointer transition hover:scale-90 bg-yellow-600 hover:bg-yellow-400 text-white`}
            >
              <IoSend className="text-xl" />
            </button>
          </div>
          </div>
        </div>
      </div>
    </>
  );
};
