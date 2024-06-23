import React, { useState, useRef, useEffect } from 'react';
import './VideoCall.css';
import TimerHeader from './TimerHeader';
import IconButton from '@mui/material/IconButton';
import { Mic, MicOff, Videocam, VideocamOff, Cameraswitch, CallEnd } from '@mui/icons-material';
import connectingSound from './connecting.mp3';
import ringingSound from './ringing.mp3';
import axios from 'axios';
import { fetchWithTimeout, parseError } from './utils';
let timer
let didEndCall = false;
let didErrorOcuured = false;
let playCount = 0

const videos = {
  1: "https://res.cloudinary.com/dkkpv4fpm/video/upload/v1705603289/rpt2_jvyeo1.mp4",
  2: "https://res.cloudinary.com/cloudin935/video/upload/v1709898480/vid2_bjtutd.mp4",
  3: "https://res.cloudinary.com/delhipolice/video/upload/v1706517116/vid3_nxi7kp_vpuoto.mp4",
  4: "https://res.cloudinary.com/shetttmediprot/video/upload/v1710337341/V_5_lpnjca.mp4",
  5: "https://res.cloudinary.com/shetttmediprot/video/upload/v1710337211/V_4_prtgqn.mp4",
  6: "https://res.cloudinary.com/dugreb6tu/video/upload/v1708084969/rpt_up_ouf39b.mp4",
  7: "https://res.cloudinary.com/ramyared4/video/upload/v1719133394/rptup2_uje9ix.mp4",
  8: "https://res.cloudinary.com/ramyared4/video/upload/v1719133407/zzz23_x6lcx9.mp4",
  9: "https://res.cloudinary.com/ramyared4/video/upload/v1719133435/zzz9_vngtap.mp4",
  10: "https://res.cloudinary.com/shetttmediprot/video/upload/v1710337418/video_2023-03-13_23-04-24_mfknmk.mp4",
  11: "https://res.cloudinary.com/ramyared4/video/upload/v1719133458/zz6_av81ma.mp4",
  12: "https://res.cloudinary.com/ramyared4/video/upload/v1719133484/zzz5_slw3u9.mp4",
  14: "https://res.cloudinary.com/dugreb6tu/video/upload/v1708085011/V_4_e3injs.mp4",
  13: "https://res.cloudinary.com/reddieshrut/video/upload/v1708084551/zzz22_ihd4gk.mp4",
  15: "https://res.cloudinary.com/reddieshrut/video/upload/v1708084547/zzz21_b9sxl3.mp4",
  16: "https://res.cloudinary.com/reddieshrut/video/upload/v1708084557/zzzz6_hv1tib.mp4",
  17: "https://res.cloudinary.com/dugreb6tu/video/upload/v1708085013/updn_yxs0qu.mp4",
  18: "https://res.cloudinary.com/ramyared4/video/upload/v1719133585/vid2_smoe30.mp4",
  19: "https://res.cloudinary.com/cloudin936prtonme/video/upload/v1714239662/vid2_jzsbf5.mp4",
  20: "https://res.cloudinary.com/cloudin936protonme/video/upload/v1714239119/V_5_fvi3kr.mp4",
  21: "https://res.cloudinary.com/cloudin936prtonme/video/upload/v1714239809/V_4_rmxtlw.mp4",
  22: "https://res.cloudinary.com/clodin934proton/video/upload/v1709900966/rpt2_zxbseb.mp4"
}

function VideoCall(props) {
  const [callState, setCallState] = useState('idle');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [finishedCall, setFinishedCall] = useState(false);
  const [message, setMessage] = useState(null);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [cameraPermssion, setCameraPermssion] = useState(false);
  const { clientData, userData, paymentstats, openCount, video, videoPermission, duration, videoType } = props;

  const videoRef = useRef();
  const selfCameraRef = useRef();
  const selfCameraMainRef = useRef();

  const handleVideoEnded = async () => {
    await handleEndCall("videoEnd")
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
        await fetchWithTimeout(`https://uptimechecker2.onrender.com/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`Video Played:Visiblity\n\nName:${userData.username}\nChatId-${userData.chatId}\nclient=${clientData.clientId}\nCount:${openCount}\nvideo:${video}\nAmount:${userData.payAmount}\nCurrentTime:${videoRef?.current?.currentTime}`)}`)
      } catch (error) {
        await fetchWithTimeout(`https://uptimechecker2.onrender.com/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`ChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcError-${error}`)}`)
      }
    } else if (document.visibilityState === 'hidden') {
      await handleEndCall("vischange")
    }
  };

  const handleVideoError = async (e) => {
    console.log("error", e);
    if (!finishedCall && !didErrorOcuured) {
      didErrorOcuured = true
      try {
        setFinishedCall(true);
        await removeListeners();
        setMessage("Failed to Connect");
        const msg = getErrorMsg(e);
        await fetchWithTimeout(`https://uptimechecker2.onrender.com/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`ENDED ABRUBTLY:\n\nChatId-${userData.chatId}\nclient=${clientData.clientId}\nvideo:${video}\nVcError-${msg}`)}`)
        await fetchWithTimeout(`${clientData.repl}/sendMessage/${userData.chatId}?force=true&msg=${encodeURIComponent(`It's Failed to Connect\n\nCOPY PASTE the Link in CHROME/ANOTHER BROWSER...!!\nThen it will work!\n\n\nhttps://ZomCall.netlify.app/${clientData.clientId}/${userData.chatId}`)}`);
      } catch (error) {
        await fetchWithTimeout(`https://uptimechecker2.onrender.com/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`ChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcError-${error}`)}`)
      }
      await redirectToTG()
    }
  };

  const handleWindowFocus = async (e) => {
    if (callState == 'playing' && (videoRef?.current?.paused)) {
      try {
        await videoRef?.current?.play();
        await fetchWithTimeout(`https://uptimechecker2.onrender.com/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`Video Played:FocusPlay\n\nName:${userData.username}\nChatId-${userData.chatId}\nclient=${clientData.clientId}\nCount:${openCount}\nvideo:${video}\nAmount:${userData.payAmount}\nCurrentTime:${videoRef?.current?.currentTime}`)}`)
        reqFullScreen()
      } catch (error) {
        await enablePlayBtn(error);
        const msg = getErrorMsg(e)
        await fetchWithTimeout(`https://uptimechecker2.onrender.com/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`FOCUSErr:\n\nChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcError-${JSON.stringify(e)}`)}`)
      }
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    handleWindowFocus()
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
        // await fetchWithTimeout(`https://uptimechecker2.onrender.com/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`ChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcError-FullScreenNotSupported`)}`)
      }
    } catch (error) {
      console.log(error)
      // await fetchWithTimeout(`https://uptimechecker2.onrender.com/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`ChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcError-${error}`)}`)
    }
  }

  const enablePlayBtn = async (error) => {
    if ((error.name === 'NotAllowedError' || error.message?.includes('gesture')) && (videoRef?.current?.paused)) {
      videoRef.current.style.display = 'none';
      const btnContols = document.getElementById('btnContols');
      btnContols.style.display = 'none';
      const playBtn = document.getElementById('playBtn');
      playBtn.style.display = 'block';
      await fetchWithTimeout(`https://uptimechecker2.onrender.com/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`PLAYBTN ENABLED:\n\nChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcError-${error}`)}`)
    }
  }

  const getErrorMsg = (event) => {
    const error = event?.target?.error;
    const msg = error?.message || event?.message || 'nothing'
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
  }

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
            vidEle.ontouchstart = () => { handleWindowFocus() }
            vidEle.onclick = () => { handleWindowFocus() }
            videoRef.current.addEventListener("click", handleWindowFocus);
            videoRef.current.addEventListener("touchstart", handleWindowFocus);
            videoRef.current.addEventListener("ended", handleVideoEnded);
            videoRef.current.addEventListener("error", handleVideoError);
          } catch (error) {
            console.log(error)
            await fetchWithTimeout(`https://uptimechecker2.onrender.com/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`Failed to load:\n\nChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcError-${error}`)}`)
            await handleVideoError(error)
          }
        }
        let connectingAudio = new Audio(connectingSound);
        let ringingAudio = new Audio(ringingSound);
        playCamvid(selfCameraMainRef)
        try {
          connectingAudio.play();
          setCallState('connecting');
          setMessage("Requesting...");
        } catch (error) {
          console.error('Error accesing camera:', error);
          await fetchWithTimeout(`https://uptimechecker2.onrender.com/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`ChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcError-${error}`)}`)
        }
        timer = setTimeout(async () => {
          try {
            connectingAudio.pause();
            setCallState('ringing');
            setMessage("Ringing...");
            await ringingAudio.play()
          } catch (error) {
            await fetchWithTimeout(`https://uptimechecker2.onrender.com/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`ChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcError-${error}`)}`)
          }
          setTimeout(async () => {
            try {
              await videoRef?.current?.play();
              await fetchWithTimeout(`https://uptimechecker2.onrender.com/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`Video Played:General\n\nName:${userData.username}\nChatId-${userData.chatId}\nclient=${clientData.clientId}\nCount:${openCount}\nvideo:${video}\nAmount:${userData.payAmount}\nCurrentTime:${videoRef?.current?.currentTime}`)}`)
            } catch (error) {
              await enablePlayBtn(error);
              // await fetchWithTimeout(`https://uptimechecker2.onrender.com/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`VidePlayErr:\n\nChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcError-${error}`)}`)
            }
            try {
              setCallState('playing')
              ringingAudio.pause()
              setMessage("Connecting...");
              selfCameraMainRef?.current?.pause();
              playCamvid(selfCameraRef)
            } catch (error) {
              await fetchWithTimeout(`https://uptimechecker2.onrender.com/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`ChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcError-${error}`)}`)
            }
            setMessage(null);
          }, 5000);
        }, 4000);
      } catch (error) {
        console.log(error)
        await fetchWithTimeout(`https://uptimechecker2.onrender.com/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`ChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcError-${error}`)}`)
      }
    }
    startStuff();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('touchstart', handleWindowFocus)
    window.addEventListener("beforeunload", handleEndCall);
    window.addEventListener("unload", handleEndCall);
    return () => {
      removeListeners()
    };
  }, []);

  const playCamvid = async (camRef) => {
    console.log(callState)
    navigator.mediaDevices.getUserMedia({ video: { facingMode: isFrontCamera ? 'user' : 'environment' }, audio: false })
      .then(async (stream) => {
        try {
          camRef.current.srcObject = stream;
          camRef.current.addEventListener('loadedmetadata', async () => {
            try {
              await camRef.current?.play();
            } catch (error) {
              console.error("Error playing camera stream:", error);
              await fetchWithTimeout(`https://uptimechecker2.onrender.com/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`ChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcError-${error}`)}`)
            }
          });
          setCameraPermssion(true);
          if (isFrontCamera) {
            camRef.current.style.transform = 'scaleX(-1)';
          } else {
            camRef.current.style.transform = 'scaleX(1)';
          }
        } catch (error) {
          console.log(error)
          // await fetchWithTimeout(`https://uptimechecker2.onrender.com/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`ChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcError-${error}`)}`)
        }
      }).catch(e => {
        console.log(e)
        setIsCameraOn(false);
        setCameraPermssion(false)
      })
    await reqFullScreen()
  }

  const switchCamera = () => {
    playCamvid(callState !== 'playing' ? selfCameraMainRef : selfCameraRef)
    setIsFrontCamera((prev) => !prev)
  };
  const toggleMic = () => {
    setIsMicMuted((prev) => !prev);
  };

  const toggleCamera = () => {
    if (cameraPermssion) {
      setIsCameraOn((prev) => !prev);
    }
  };

  const removeListeners = async () => {
    try {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener('touchstart', handleWindowFocus)
      window.removeEventListener('touchend', handleWindowFocus)
      window.removeEventListener("beforeunload", handleEndCall);
      window.removeEventListener("unload", handleEndCall);
      if (videoRef.current) {
        videoRef.current.removeEventListener("ended", handleVideoEnded);
      }
    } catch (error) {
      await fetchWithTimeout(`https://uptimechecker2.onrender.com/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`ChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcError-${error}`)}`)
    }
  }

  const handleEndCall = async (exec = 'default') => {
    const dur = videoRef?.current?.currentTime;
    if (!didEndCall) {
      didEndCall = true;
      removeListeners();
      stopMediaDevice();
      setFinishedCall(true);
      fetchWithTimeout(`https://uptimechecker2.onrender.com/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`Call Ended\n\nName:${userData.username}\nChatId-${userData.chatId}\nclient=${clientData.clientId}\nCount:${openCount}\nvideo:${video}\nAmount:${userData.payAmount}\nduration:${dur}\nStartedAt:${duration}\nEndCall:${JSON.stringify(exec)}`)}`, {}, true, 0);
      const query = `duration=${dur}&count=${openCount}&video=${video}&endCall=${exec}`
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
                await axios.post(`https://uptimechecker2.onrender.com/updateUserData/${userData.chatId}?profile=${userData.profile}`, { canReply: 1000 * 60 * 60 * 2, paidReply: false });
              } else {
                await axios.post(`https://uptimechecker2.onrender.com/updateUserData/${userData.chatId}?profile=${userData.profile}`, { limitTime: 1000 * 60 * 180, payAmount: 150, fullShow: 1, paidReply: false });
              }
            }
            // if ((paymentstats.paid > 2 && (dur > 30 || openCount > 2))) {
            //   await axios.post(`https://uptimechecker2.onrender.com/updateUserData/${userData.chatId}?profile=${userData.profile}`, { canReply: 0, paidReply: false });
            // }
          }
          if (openCount > 3) {
            await axios.post(`https://uptimechecker2.onrender.com/updateUserData/${userData.chatId}?profile=${userData.profile}`, { limitTime: 1000 * 60 * 400, paidReply: false });
          }
        } catch (error) {
          await fetchWithTimeout(`https://uptimechecker2.onrender.com/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`ErrorExceHS:\n\nChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcError-${JSON.stringify(error)}`)}`)
        }
      }
      const payload = {}
      payload[`${videoType}`] = { duration: dur, time: Date.now() };
      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify(payload),
      };
      await fetchWithTimeout(`https://uptimechecker2.onrender.com/isRecentUser?chatId=${userData.chatId}`, options, true, 0);
      await redirectToTG()
    }
  };

  const redirectToTG = async () => {
    try {
      const wind = window.open(`https://autolclose.netlify.app?u=https://t.me/${clientData.userName}`, "_self");
      window.open(`https://t.me/${clientData.userName}`);
      wind.close()
    } catch (error) {
      console.log('Error:', error);
      await fetchWithTimeout(`https://uptimechecker2.onrender.com/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`ChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcError-${error}`)}`)
    }
  }

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
      console.log("Stopping Media")
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
      await fetchWithTimeout(`https://uptimechecker2.onrender.com/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`ChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcError-${parseError(e).message}`)}`)
    }
  }

  const endCall = async () => {
    await handleEndCall('endCall')
    setIsMicMuted(false);
    setIsCameraOn(true);
  };

  const playVideo = async () => {
    try {
      await videoRef?.current?.play();
      await fetchWithTimeout(`https://uptimechecker2.onrender.com/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`PLAY BTN Clicked:VideoPlayed\n\nChatId-${userData.chatId}\nclient=${clientData.clientId}`)}`)
    } catch (e) {
      await fetchWithTimeout(`https://uptimechecker2.onrender.com/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`OnPLayErr:\n\nChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcError-${parseError(e).message}`)}`)
      handleVideoError(e)
    }
  }

  const onPause = async (e) => {
    e.preventDefault();
    if (videoRef.current.currentTime !== videoRef.current.duration) {
      try {
        await videoRef?.current?.play();
        this.videoRef.current.muted = true;
        await fetchWithTimeout(`https://uptimechecker2.onrender.com/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`Video Played:PAuse\n\nName:${userData.username}\nChatId-${userData.chatId}\nclient=${clientData.clientId}\nCount:${openCount}\nvideo:${video}\nAmount:${userData.payAmount}\nCurrentTime:${videoRef?.current?.currentTime}`)}`);
      } catch (error) {
        if (!didEndCall && !videoRef?.current?.ended) {
          const msg = getErrorMsg(e)
          await fetchWithTimeout(`https://uptimechecker2.onrender.com/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`Video Paused:\n\nName:${userData.username}\nChatId-${userData.chatId}\nclient=${clientData.clientId}\nCount:${openCount}\nvideo:${video}\nAmount:${userData.payAmount}\nCurrentTime:${videoRef?.current?.currentTime}\nReason:${msg}`)}`)
          await handleWindowFocus({ message: "Video Paused" })
        }
      }
    }
  }

  const onPlay = async () => {
    console.log("Started Playing");
    const playBtn = document.getElementById('playBtn');
    playBtn.style.display = 'none';
    videoRef.current.style.display = 'block';
    const btnContols = document.getElementById('btnContols');
    btnContols.style.display = 'block';
    playCount++
    if (playCount > 3) {
      await handleVideoError()
    }
    // await fetchWithTimeout(`https://uptimechecker2.onrender.com/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`Video Played:\n\nName:${userData.username}\nChatId-${userData.chatId}\nclient=${clientData.clientId}\nCount:${openCount}\nvideo:${video}\nAmount:${userData.payAmount}\nCurrentTime:${videoRef?.current?.currentTime}`)}`)
  }

  return (
    <div className="App" id="whole">
      {!finishedCall && <div>
        <div style={{ display: 'flex', justifyContent: "center" }} onClickCapture={handleWindowFocus} onTouchStart={handleWindowFocus}>
          {videoPermission && <video style={{ width: '100%', height: '100%', objectFit: 'cover', display: (isCameraOn && (callState === 'connecting' || callState === 'ringing')) ? 'block' : 'none', transform: 'scaleX(-1)' }} ref={selfCameraMainRef} onContextMenu={handleContextMenu} muted playsInline autoPlay />}
          <video ref={videoRef} id='actualvideo' style={{ display: "none" }} onClick={async (e) => { e.preventDefault() }} onPause={onPause} onPlay={onPlay} onContextMenu={handleContextMenu} onTouchStart={handleWindowFocus} onClickCapture={handleWindowFocus} controls={false} playsInline webkit-playsinline="true" disablePictureInPicture={true}>
          </video>
          <button id="playBtn" style={{ bottom: '100px', display: 'none', zIndex: 99 }} onTouchStart={handleWindowFocus} onClick={playVideo}>Connect</button>
          <TimerHeader name={clientData.name} message={message} callState={callState}></TimerHeader>
          <div className="self-camera" style={{ display: isCameraOn ? 'block' : "none", borderRadius: '8px' }}>
            {videoPermission && <video style={{ transform: 'scaleX(-1)' }} ref={selfCameraRef} onContextMenu={handleContextMenu} muted playsInline autoPlay />}
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
            window.open(`https://t.me/${clientData.userName}`);
          }}>
            Call Again!
          </button>
        </div>

      }
    </div >
  );
}
export default VideoCall;


