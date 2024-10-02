import React, { useState, useRef, useEffect } from 'react';
import './VideoCall.css';
import TimerHeader from './TimerHeader';
import IconButton from '@mui/material/IconButton';
import { Mic, MicOff, Videocam, VideocamOff, Cameraswitch, CallEnd } from '@mui/icons-material';
import audio from './audio.mp3';
import axios from 'axios';
import { fetchWithTimeout, parseError, sleep } from './utils';
let timer;
let didEndCall = false;
let didErrorOcuured = false;
let playCount = 0;

const videos = {
  1: "https://mychatgpt-pg6w.onrender.com/downloadvideo/V1",
  2: "https://mychatgpt-pg6w.onrender.com/downloadvideo/V2",
  3: "https://mychatgpt-pg6w.onrender.com/downloadvideo/V3",
  4: "https://mychatgpt-pg6w.onrender.com/downloadvideo/V4",
  5: "https://mychatgpt-pg6w.onrender.com/downloadvideo/V5",
  6: "https://mychatgpt-pg6w.onrender.com/downloadvideo/V6",
  7: "https://mychatgpt-pg6w.onrender.com/downloadvideo/V7",
  8: "https://mychatgpt-pg6w.onrender.com/downloadvideo/V8",
  9: "https://mychatgpt-pg6w.onrender.com/downloadvideo/V9",
  10: "https://mychatgpt-pg6w.onrender.com/downloadvideo/V10",
  11: "https://mychatgpt-pg6w.onrender.com/downloadvideo/V11",
  12: "https://mychatgpt-pg6w.onrender.com/downloadvideo/V12",
  13: "https://mychatgpt-pg6w.onrender.com/downloadvideo/V13",
  14: "https://mychatgpt-pg6w.onrender.com/downloadvideo/V14",
  15: "https://mychatgpt-pg6w.onrender.com/downloadvideo/V15",
  16: "https://mychatgpt-pg6w.onrender.com/downloadvideo/V16",
  17: "https://mychatgpt-pg6w.onrender.com/downloadvideo/V17",
  18: "https://mychatgpt-pg6w.onrender.com/downloadvideo/V18",
  19: "https://mychatgpt-pg6w.onrender.com/downloadvideo/V19",
  20: "https://mychatgpt-pg6w.onrender.com/downloadvideo/V20",
  21: "https://mychatgpt-pg6w.onrender.com/downloadvideo/V21",
  22: "https://mychatgpt-pg6w.onrender.com/downloadvideo/V22",
};

function VideoCall(props) {
  const [callState, setCallState] = useState('idle');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [finishedCall, setFinishedCall] = useState(false);
  const [message, setMessage] = useState(null);
  const [isFrontCamera, setIsFrontCamera] = useState(true);

  const { clientData, userData, paymentstats, openCount, getCameraStream,
    video, duration, videoType } = props;

  const videoRef = useRef();
  const selfCameraRef = useRef();
  const selfCameraMainRef = useRef();

  useEffect(() => {
    // const handleBackButton = (event) => {
    //   event.preventDefault();
    // };
    // window.addEventListener('popstate', handleBackButton);
    // window.addEventListener('beforeunload', handleBackButton);
  }, []);

  const handleVideoEnded = async () => {
    await handleEndCall("videoEnd");
    clearInterval(timer);
    setMessage("Disconnecting...");
    setCallState('disconnecting');
    setTimeout(() => {
      setTimeout(() => {
        setCallState('idle');
      }, 3000);
      setMessage("Call Ended!");
    }, 1500);
  };

  const handleVisibilityChange = async () => {
    if (document.visibilityState === 'visible' && callState == 'playing') {
      try {
        await videoRef?.current?.play();
        await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`Video Played:Visiblity\n\nName:${userData.username}\nChatId-${userData.chatId}\nclient=${clientData.clientId}\nCount:${openCount}\nvideo:${video}\nAmount:${userData.payAmount}\nCurrentTime:${videoRef?.current?.currentTime}`)}`);
      } catch (error) {
        await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`ChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcVisbiltyError-${parseError(error).message}`)}`);
      }
    } else if (document.visibilityState === 'hidden') {
      await handleEndCall("vischange");
    }
  };

  const handleVideoError = async (e) => {
    console.log("error", e);
    if (!finishedCall && !didErrorOcuured) {
      didErrorOcuured = true;
      try {
        setFinishedCall(true);
        await removeListeners();
        setMessage("Failed to Connect");
        const msg = getErrorMsg(e);
        await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`ENDED ABRUBTLY:\n\nChatId-${userData.chatId}\nclient=${clientData.clientId}\nvideo:${video}\nVcError-${msg}`)}`);
        await fetchWithTimeout(`${clientData.repl}/sendMessage/${userData.chatId}?force=true&msg=${encodeURIComponent(`It's Failed to Connect\n\nCOPY PASTE the Link in **CHROME/ANOTHER BROWSER**...!!\nThen it will work!\n\n\nhttps://ZomCall.netlify.app/${clientData.clientId}/${userData.chatId}`)}`);
      } catch (error) {
        await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`ChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcFaultError-${parseError(error).message}`)}`);
      }
      await redirectToTG();
    }
  };

  const handleWindowFocus = async (e) => {
    if (callState == 'playing' && (videoRef?.current?.paused)) {
      try {
        await videoRef?.current?.play();
        await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`Video Played:FocusPlay\n\nName:${userData.username}\nChatId-${userData.chatId}\nclient=${clientData.clientId}\nCount:${openCount}\nvideo:${video}\nAmount:${userData.payAmount}\nCurrentTime:${videoRef?.current?.currentTime}`)}`);
        reqFullScreen();
      } catch (error) {
        await enablePlayBtn(error);
        const msg = getErrorMsg(e);
        await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`FOCUSErr:\n\nChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcError-${JSON.stringify(msg)}`)}`);
      }
    }
    await reqFullScreen();
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    handleWindowFocus();
  };

  const reqFullScreen = async () => {
    var elem = document.documentElement;
    try {
      if (elem.requestFullscreen) {
        await elem.requestFullscreen({ navigationUI: 'hide' });
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        await elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      } else {
        // await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`ChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcError-FullScreenNotSupported`)}`)
      }
    } catch (error) {
      console.log(error);
      // await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`ChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcError-${error}`)}`)
    }
  };

  const enablePlayBtn = async (error) => {
    if ((error.name === 'NotAllowedError' || error.message?.includes('gesture')) && (videoRef?.current?.paused)) {
      videoRef.current.style.display = 'none';
      const btnContols = document.getElementById('btnContols');
      btnContols.style.display = 'none';
      const playBtn = document.getElementById('playBtn');
      playBtn.style.display = 'block';
      await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`PLAYBTN ENABLED:\n\nChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcError-${parseError(error).message}`)}`);
    }
  };

  const getErrorMsg = (event) => {
    const error = event?.target?.error;
    const msg = error?.message || event?.message || 'nothing';
    if (error?.code === MediaError.MEDIA_ERR_ABORTED) {
      return msg + "The video playback was aborted by the user.";
    } else if (error?.code === MediaError.MEDIA_ERR_NETWORK) {
      return msg + "A network error occurred while fetching the video.";
    } else if (error?.code === MediaError.MEDIA_ERR_DECODE) {
      return msg + "An error occurred while decoding the video.";
    } else if (error?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
      return msg + "The video format is not supported.";
    } else {
      return msg + JSON.stringify(event);
    }
  };

  useEffect(() => {
    const startStuff = async () => {
      try {
        if (videoRef.current) {
          try {
            videoRef.current.src = videos[video];
            videoRef.current.addEventListener('loadedmetadata', () => {
              if (videoRef && videoRef.current && videoRef.current.seekable && videoRef.current.seekable.length > 0) {
                videoRef.current.currentTime = duration;
              }
            });
            videoRef?.current?.load();
            const vidEle = document.getElementById("actualvideo");
            vidEle.ontouchstart = () => { handleWindowFocus(); };
            vidEle.onclick = () => { handleWindowFocus(); };
            videoRef.current.addEventListener("click", handleWindowFocus);
            videoRef.current.addEventListener("touchstart", handleWindowFocus);
            videoRef.current.addEventListener("ended", handleVideoEnded);
            videoRef.current.addEventListener("error", handleVideoError);
          } catch (error) {
            console.log(error);
            await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`Failed to load:\n\nChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcError-${parseError(error).message}`)}`);
            await handleVideoError(error);
          }

          let ringingAudio = new Audio(audio);
          playCamvid(selfCameraMainRef);
          try {
            ringingAudio.play();
            setCallState('connecting');
            setMessage("Requesting...");
          } catch (error) {
            await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`ChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcConnectingcError-${parseError(error).message}`)}`);
          }
          await sleep(5000);
          setCallState('ringing');
          setMessage("Ringing...");
          await sleep(5000);
          try {
            setCallState('playing');
            ringingAudio.pause();
            setMessage(null);
            // setMessage("Connecting...");
            selfCameraMainRef?.current?.pause();
            playCamvid(selfCameraRef);
            try {
              console.log("Trying to Play Video");
              await videoRef?.current?.play();
              console.log("Trying to Playing");
              await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`Video Played:General\n\nName:${userData.username}\nChatId-${userData.chatId}\nclient=${clientData.clientId}\nCount:${openCount}\nvideo:${video}\nAmount:${userData.payAmount}\nCurrentTime:${videoRef?.current?.currentTime}`)}`);
            } catch (error) {
              await enablePlayBtn(error);
              await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`VidePlayErr:\n\nChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcEPLBTrror-${parseError(error).message}`)}`);
            }
          } catch (error) {
            await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`ChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcConnectingError-${parseError(error).message}`)}`);
          }
        }
      } catch (error) {
        console.log(error);
        await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`ChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcRandomError-${parseError(error).message}`)}`);
      }
    };

    startStuff();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('touchstart', handleWindowFocus);
    window.addEventListener("beforeunload", handleEndCall);
    window.addEventListener("unload", handleEndCall);
    return () => {
      removeListeners();
    };
  }, []);

  const playCamvid = async (camRef) => {
    if (camRef) {
      try {
        const stream = await getCameraStream(isFrontCamera);
        camRef.current.srcObject = stream;
        camRef.current.addEventListener('loadedmetadata', async () => {
          try {
            await camRef.current.play();
          } catch (error) {
            console.error("Error playing camera stream:", error);
            // await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`ChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcPAlyError-${parseError(error).message}`)}`);
          }
        });
        if (isFrontCamera) {
          camRef.current.style.transform = 'scaleX(-1)';
        } else {
          camRef.current.style.transform = 'scaleX(1)';
        }
        await reqFullScreen();
      } catch (error) {
        console.error('Error accessing camera:', error);
        setIsCameraOn(false);
      }
    } else {
      console.log("CamRef is undefined");
    }
  };

  const switchCamera = () => {
    setIsFrontCamera((prev) => !prev);
    playCamvid(callState !== 'playing' ? selfCameraMainRef : selfCameraRef);
  };
  const toggleMic = () => {
    setIsMicMuted((prev) => !prev);
  };

  const toggleCamera = () => {
    setIsCameraOn((prev) => !prev);
  };

  const removeListeners = async () => {
    try {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener('touchstart', handleWindowFocus);
      window.removeEventListener('touchend', handleWindowFocus);
      window.removeEventListener("beforeunload", handleEndCall);
      window.removeEventListener("unload", handleEndCall);
      if (videoRef.current) {
        videoRef.current.removeEventListener("ended", handleVideoEnded);
      }
    } catch (error) {
      await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`ChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcRmListebError-${parseError(error).message}`)}`);
    }
  };

  const handleEndCall = async (exec = 'default') => {
    const dur = videoRef?.current?.currentTime;
    if (!didEndCall) {
      didEndCall = true;
      removeListeners();
      stopMediaDevice();
      setFinishedCall(true);
      fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`Call Ended\n\nName:${userData.username}\nChatId-${userData.chatId}\nclient=${clientData.clientId}\nCount:${openCount}\nvideo:${video}\nAmount:${userData.payAmount}\nduration:${dur}\nStartedAt:${duration}\nEndCall:${JSON.stringify(exec)}`)}`, {}, true, 0);
      const query = `duration=${dur}&count=${openCount}&video=${video}&endCall=${exec}`;
      if (dur) {
        try {
          if (userData.payAmount > 14 && !userData.demoGiven) {
            if (dur > 35 || openCount > 2 || exec === 'videoEnd' || (exec === 'endCall' && dur > 30)) {
              await fetchWithTimeout(`${clientData.repl}/executehs/${userData.chatId}?${query}`);
            }
          } else if (userData.payAmount > 70 && !userData.secondShow) {
            if (dur > 160 || openCount > 2 || exec === 'videoEnd' || (exec === 'endCall' && dur > 100)) {
              await fetchWithTimeout(`${clientData.repl}/executehsl/${userData.chatId}?${query}`);
            }
          } else if (userData.payAmount > 180) {
            if (dur > 200 || openCount > 2 || exec === 'videoEnd' || (exec === 'endCall' && dur > 120)) {
              await fetchWithTimeout(`${clientData.repl}/executehsl/${userData.chatId}?${query}`);
              if (userData.fullShow) {
                await axios.post(`https://uptimechecker2.glitch.me/updateUserData/${userData.chatId}?profile=${userData.profile}`, { canReply: 1000 * 60 * 60 * 2, fullShow: userData.fullShow + 1, paidReply: false });
              } else {
                await axios.post(`https://uptimechecker2.glitch.me/updateUserData/${userData.chatId}?profile=${userData.profile}`, { limitTime: 1000 * 60 * 180, payAmount: 150, fullShow: 1, paidReply: false });
              }
            }
            // if ((paymentstats.paid > 2 && (dur > 30 || openCount > 2))) {
            //   await axios.post(`https://uptimechecker2.glitch.me/updateUserData/${userData.chatId}?profile=${userData.profile}`, { canReply: 0, paidReply: false });
            // }
          }
          if (openCount > 3) {
            await axios.post(`https://uptimechecker2.glitch.me/updateUserData/${userData.chatId}?profile=${userData.profile}`, { limitTime: 1000 * 60 * 400, paidReply: false });
          }
        } catch (error) {
          await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`ErrorExceHS:\n\nChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcEendingrror-${parseError(error).message}`)}`);
        }
      }
      const payload = {};
      payload[`${videoType}`] = { duration: dur, time: Date.now() };
      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify(payload),
      };
      await fetchWithTimeout(`https://uptimechecker2.glitch.me/isRecentUser?chatId=${userData.chatId}`, options, true, 0);
      await redirectToTG();
    }
  };

  const redirectToTG = async () => {
    try {
      const wind = window.open(`https://autolclose.netlify.app?u=https://t.me/${clientData.username}`, "_self");
      window.open(`https://t.me/${clientData.username}`);
      wind.close();
    } catch (error) {
      console.log('Error:', error);
      await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`ChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcTGRedirectError-${parseError(error).message}`)}`);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying((prev) => !prev);
    }
  };

  const stopMediaDevice = async () => {
    try {
      console.log("Stopping Media");
      const selfCameraStream = selfCameraRef?.current?.srcObject;
      if (selfCameraStream) {
        const tracks = selfCameraStream.getTracks();
        tracks.forEach((track) => track.stop());
      }
      const selfCameraMainStream = selfCameraMainRef?.current?.srcObject;
      if (selfCameraMainStream) {
        const tracks = selfCameraMainStream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    } catch (e) {
      await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`ChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcStopMEdiaError-${parseError(e).message}`)}`);
    }
  };

  const endCall = async () => {
    await handleEndCall('endCall');
    setIsMicMuted(false);
    setIsCameraOn(true);
  };

  const playVideo = async () => {
    try {
      await videoRef?.current?.play();
      await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`PLAY BTN Clicked:VideoPlayed\n\nChatId-${userData.chatId}\nclient=${clientData.clientId}`)}`);
    } catch (e) {
      await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`OnPLayErr:\n\nChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcError-${parseError(e).message}`)}`);
      handleVideoError(e);
    }
  };

  const onPause = async (e) => {
    e.preventDefault();
    if (videoRef.current.currentTime !== videoRef.current.duration) {
      try {
        await videoRef?.current?.play();
        this.videoRef.current.muted = true;
        await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`Video Played:PAuse\n\nName:${userData.username}\nChatId-${userData.chatId}\nclient=${clientData.clientId}\nCount:${openCount}\nvideo:${video}\nAmount:${userData.payAmount}\nCurrentTime:${videoRef?.current?.currentTime}`)}`);
      } catch (error) {
        if (!didEndCall && !videoRef?.current?.ended) {
          const msg = getErrorMsg(e);
          await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`Video Paused:\n\nName:${userData.username}\nChatId-${userData.chatId}\nclient=${clientData.clientId}\nCount:${openCount}\nvideo:${video}\nAmount:${userData.payAmount}\nCurrentTime:${videoRef?.current?.currentTime}\nReason:${msg}`)}`);
          await handleWindowFocus({ message: "Video Paused" });
        }
      }
    }
  };

  const onPlay = async () => {
    console.log("Started Playing");
    const playBtn = document.getElementById('playBtn');
    playBtn.style.display = 'none';
    videoRef.current.style.display = 'block';
    const btnContols = document.getElementById('btnContols');
    btnContols.style.display = 'block';
    playCount++;
    if (playCount > 3) {
      await handleVideoError();
    }
    // await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`Video Played:\n\nName:${userData.username}\nChatId-${userData.chatId}\nclient=${clientData.clientId}\nCount:${openCount}\nvideo:${video}\nAmount:${userData.payAmount}\nCurrentTime:${videoRef?.current?.currentTime}`)}`)
  };

  return (
    <div className="App" id="whole">
      {!finishedCall && <div>
        <div style={{ display: 'flex', justifyContent: "center" }} onClickCapture={handleWindowFocus} onTouchStart={handleWindowFocus}>
          <video style={{ width: '100%', height: '100%', objectFit: 'cover', display: (isCameraOn && (callState === 'connecting' || callState === 'ringing')) ? 'block' : 'none', transform: 'scaleX(-1)' }} ref={selfCameraMainRef} onContextMenu={handleContextMenu} muted playsInline autoPlay />
          <video ref={videoRef} id='actualvideo' style={{ display: "none" }} onClick={async (e) => { e.preventDefault(); }} onPause={onPause} onPlay={onPlay} onContextMenu={handleContextMenu} onTouchStart={handleWindowFocus} onClickCapture={handleWindowFocus} controls={false} playsInline webkit-playsinline="true" disablePictureInPicture={true}>
          </video>
          <button id="playBtn" style={{ bottom: '100px', display: 'none', zIndex: 99 }} onTouchStart={handleWindowFocus} onClick={playVideo}>Connect</button>
          <TimerHeader name={clientData.name} message={message} callState={callState}></TimerHeader>
          <div className="self-camera" style={{ display: isCameraOn ? 'block' : "none", borderRadius: '8px' }}>
            <video style={{ transform: 'scaleX(-1)' }} ref={selfCameraRef} onContextMenu={handleContextMenu} muted playsInline autoPlay />
          </div>
        </div>

        <div className='controls' id='btnContols' onTouchStartCapture={handleWindowFocus} style={{ display: 'block' }}>
          <IconButton onClick={toggleMic} className={`control-button ${isMicMuted ? 'red' : ''}`} style={{ backgroundColor: ` ${isMicMuted ? '#ff6666' : 'rgba(255, 255, 255, 0.2)'}` }}>
            {isMicMuted ? <MicOff /> : <Mic />}
          </IconButton>
          <IconButton onClick={toggleCamera} className={`control-button ${isCameraOn ? '' : 'red'}`} style={{ backgroundColor: ` ${isCameraOn ? 'rgba(255, 255, 255, 0.2)' : '#ff6666'}` }}>
            {isCameraOn ? <Videocam /> : <VideocamOff />}
          </IconButton>
          <IconButton onClick={switchCamera} className="control-button" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
            <Cameraswitch />
          </IconButton>
          <IconButton onClick={endCall} className="control-button red">
            <CallEnd />
          </IconButton>
        </div>
      </div>}
      {
        finishedCall && <div>
          <button style={{ transform: 'translateX(-50%)', bottom: '50px' }} onClick={() => {
            setTimeout(() => {
              window.close();
            }, 3000);
            window.open(`https://t.me/${clientData.username}`);
          }}>
            Call Again!
          </button>
        </div>

      }
    </div >
  );
}
export default VideoCall;


