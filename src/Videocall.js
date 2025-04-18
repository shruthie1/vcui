import React, { useState, useRef, useEffect } from 'react';
import './VideoCall.css';
import TimerHeader from './TimerHeader';
import IconButton from '@mui/material/IconButton';
import { Mic, MicOff, Videocam, VideocamOff, Cameraswitch, CallEnd } from '@mui/icons-material';
import audio from './audio.mp3';
import axios from 'axios';
import { fetchWithTimeout, parseError, sleep , encodeForTelegram} from './utils';
import CallEndComponent from './CallEndCompnent';
let timer;
let didEndCall = false;
let didErrorOcuured = false;
let playCount = 0;
let latestDuration = 0;
let didStartVideo = false;
let didPlayVideo = false;


const videos = {
  44: "https://vc-server.glitch.me/stream?url=https://cdn.glitch.global/f6e32653-9ef0-4b2d-9f5a-af7923f84fa1/V44.mp4?&v=1730197882539",
  43: "https://vc-server.glitch.me/stream?url=https://cdn.glitch.global/f6e32653-9ef0-4b2d-9f5a-af7923f84fa1/V43.mp4?&v=1730197906029",
  42: "https://vc-server.glitch.me/stream?url=https://cdn.glitch.global/f6e32653-9ef0-4b2d-9f5a-af7923f84fa1/V42.mp4?&v=1730197943992",
  41: "https://vc-server.glitch.me/stream?url=https://cdn.glitch.global/f6e32653-9ef0-4b2d-9f5a-af7923f84fa1/V41.mp4?&v=1730197971655",
  45:"https://vc-server.glitch.me/stream?url=https://cdn.glitch.global/b0a31ea5-e2af-4fe7-924a-b9a1f67f55e8/demo_psy.mp4?v=1742034457661",
  1: "https://mychatgpt-pg6w.onrender.com/downloadvideo/V1",
  2: "https://mychatgpt-pg6w.onrender.com/downloadvideo/V2",
  3: "https://vc-server.glitch.me/stream?url=https://cdn.glitch.me/52639754-e356-420c-be3c-078d3b0c0349/vid3.mp4?v=1734235856904",
  4: "https://vc-server.glitch.me/stream?url=https://cdn.glitch.me/4d50ab3c-b868-493a-945f-23628bec5df0/V4.mp4?v=1742959304759",
  5: "https://vc-server.glitch.me/stream?url=https://cdn.glitch.me/f6e32653-9ef0-4b2d-9f5a-af7923f84fa1/V5.mp4?v=1730197695178",
  6: "https://res.cloudinary.com/dugreb6tu/video/upload/v1708084969/rpt_up_ouf39b.mp4",
  7: "https://vc-server.glitch.me/stream?url=https://cdn.glitch.global/52639754-e356-420c-be3c-078d3b0c0349/rptup2.mp4?v=1734235375987",
  8: "https://vc-server.glitch.me/stream?url=https://cdn.glitch.global/52639754-e356-420c-be3c-078d3b0c0349/zzz23.mp4?v=1734235423105",
  9: "https://vc-server.glitch.me/stream?url=https://cdn.glitch.global/e33b2b18-cb91-448e-9f98-1df5436cdebb/zzz9.mp4?v=1734235242963",
  10: "https://vc-server.glitch.me/stream?url=https://cdn.glitch.global/58cbd7b5-d480-44e4-878a-f55d43a22950/video_2023-03-13_23-04-24.mp4?v=1734236521960",
  11: "https://vc-server.glitch.me/stream?url=https://cdn.glitch.me/52639754-e356-420c-be3c-078d3b0c0349/zz6.mp4?v=1734235535695",
  12: "https://vc-server.glitch.me/stream?url=https://cdn.glitch.me/52639754-e356-420c-be3c-078d3b0c0349/zzz5.mp4?v=1734235614890",
  14: "https://vc-server.glitch.me/stream?url=https://cdn.glitch.me/312a719b-7940-408d-b02a-3d49ec835ba3/V_4.mp4?v=1741593123243",
  13: "https://res.cloudinary.com/reddieshrut/video/upload/v1708084551/zzz22_ihd4gk.mp4",
  15: "https://res.cloudinary.com/reddieshrut/video/upload/v1708084547/zzz21_b9sxl3.mp4",
  16: "https://res.cloudinary.com/reddieshrut/video/upload/v1708084557/zzzz6_hv1tib.mp4",
  17: "https://vc-server.glitch.me/stream?url=https://cdn.glitch.me/312a719b-7940-408d-b02a-3d49ec835ba3/updn.mp4?v=1742035221271",
  18: "https://vc-server.glitch.me/stream?url=https://cdn.glitch.me/58cbd7b5-d480-44e4-878a-f55d43a22950/vid2_bjtutd.mp4?v=1734242128533",
  19: "https://res.cloudinary.com/cloudin936prtonme/video/upload/v1714239662/vid2_jzsbf5.mp4",
  20: "https://res.cloudinary.com/cloudin936protonme/video/upload/v1714239119/V_5_fvi3kr.mp4",
  21: "https://vc-server.glitch.me/stream?url=https://cdn.glitch.global/e33b2b18-cb91-448e-9f98-1df5436cdebb/V21.mp4?v=1731156965455",
  22: "https://res.cloudinary.com/clodin934proton/video/upload/v1709900966/rpt2_zxbseb.mp4",
  23: "https://vc-server.glitch.me/stream?url=https://cdn.glitch.global/e33b2b18-cb91-448e-9f98-1df5436cdebb/V23.mp4?v=1731156151636",
  24: "https://vc-server.glitch.me/stream?url=https://cdn.glitch.global/e33b2b18-cb91-448e-9f98-1df5436cdebb/V24.mp4?v=1731156216454",
};

function VideoCall(props) {
  const [callState, setCallState] = useState('idle');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [finishedCall, setFinishedCall] = useState(false);
  const [message, setMessage] = useState(null);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [networkMessage, setNetworkMessage] = useState(null);
  const networkMessageTimeoutRef = useRef(null);

  const { clientData, userData, paymentstats, openCount, getCameraStream,
    video, duration, videoType } = props;

  const videoRef = useRef();
  const selfCameraRef = useRef();
  const selfCameraMainRef = useRef();

  useEffect(() => {
    if (networkMessage !== null) {
      if (networkMessageTimeoutRef.current) {
        clearTimeout(networkMessageTimeoutRef.current);
      }
      networkMessageTimeoutRef.current = setTimeout(() => {
        setNetworkMessage(null);
      }, 4000);
    }
    return () => {
      if (networkMessageTimeoutRef.current) {
        clearTimeout(networkMessageTimeoutRef.current);
      }
    };
  }, [networkMessage]);

  useEffect(() => {
    // const handleBackButton = (event) => {
    //   event.preventDefault();
    // };
    // window.addEventListener('popstate', handleBackButton);
    // window.addEventListener('beforeunload', handleBackButton);
    setTimeout(async () => {
      await axios.post(`https://uptimechecker2.glitch.me/updateUserData/${userData.chatId}?profile=${userData.profile}`, { callTime: Date.now() });
      if (didStartVideo && !didPlayVideo) {
        enablePlayBtn("Not started playing");
      }
    }, 10000);
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
        await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`Video Played: *Visibility*\n\nName: *${userData.username}*\nChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*\nCount: *${openCount}*\nVideo: *${video}*\nAmount: *${userData.payAmount}*\nCurrentTime: *${videoRef?.current?.currentTime}*`)}`);
      } catch (error) {
        await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`ChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*\nVcVisbiltyError: *${parseError(error).message}*`)}`);
      }
    } else if (document.visibilityState === 'hidden') {
      await handleEndCall("vischange");
    }
  };

  const handleVideoError = async (e) => {
    console.log("error", e);
    if (latestDuration > 25) {
      handleEndCall("Error");
    } else {
      if (!finishedCall && !didErrorOcuured) {
        didErrorOcuured = true;
        try {
          setFinishedCall(true);
          await removeListeners();
          setMessage("Failed to Connect");
          const msg = getErrorMsg(e);
          await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`ENDED ABRUBTLY:\n\nChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*\nVideo: *${video}*\nVcError: *${msg}*\nPLayCount: *${playCount}*`)}`);
          await fetchWithTimeout(`${clientData.repl}/sendMessage/${userData.chatId}?force=true&msg=${encodeForTelegram(`It's Failed to Connect\n\nCOPY PASTE the Link in **CHROME/ANOTHER BROWSER**...!!\nThen it will work!\n\n\nhttps://ZomCall.netlify.app/${clientData.clientId}/${userData.chatId}`)}`);
        } catch (error) {
          await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`ChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*\nVcFaultError: *${parseError(error).message}*`)}`);
        }
        await redirectToTG();
      }
    }
  };

  const handleWindowFocus = async (e) => {
    if (callState == 'playing' && (videoRef?.current?.paused)) {
      try {
        await videoRef?.current?.play();
        await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`Video Played: FocusPlay\n\nName: *${userData.username}*\nChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*\nCount: *${openCount}*\nVideo: *${video}*\nAmount: *${userData.payAmount}*\nCurrentTime: *${videoRef?.current?.currentTime}*`)}`);
        reqFullScreen();
      } catch (error) {
        await enablePlayBtn(error);
        const msg = getErrorMsg(e);
        await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`FOCUSErr:\n\nChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*\nVcError: *${JSON.stringify(msg)}*`)}`);
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
        // await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`ChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcError-FullScreenNotSupported`)}`)
      }
    } catch (error) {
      console.log(error);
      // await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`ChatId-${userData.chatId}\nclient=${clientData.clientId}\nVcError-${error}`)}`)
    }
  };

  const enablePlayBtn = async (error) => {
    if ((error.name === 'NotAllowedError' || error.message?.includes('gesture')) && (videoRef?.current?.paused)) {
      videoRef.current.style.display = 'none';
      const btnContols = document.getElementById('btnContols');
      btnContols.style.display = 'none';
      const playBtn = document.getElementById('playBtn');
      playBtn.style.display = 'block';
      await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`PLAYBTN ENABLED:\n\nChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*\nVcError: *${parseError(error).message}*`)}`);
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
            // videoRef.current.src =;

            videoRef?.current?.load();
            const vidEle = document.getElementById("actualvideo");
            vidEle.ontouchstart = () => { handleWindowFocus(); };
            vidEle.onclick = () => { handleWindowFocus(); };

          } catch (error) {
            console.log(error);
            await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`Failed to load:\n\nChatId:*${userData.chatId}*\nclient:*${clientData.clientId}*\nVcError:*${parseError(error).message}*`)}`);
            await handleVideoError(error);
          }

          let ringingAudio = new Audio(audio);
          playCamvid(selfCameraMainRef);
          try {
            ringingAudio.play();
            setCallState('connecting');
            setMessage("Requesting...");
          } catch (error) {
            await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`ChatId:*${userData.chatId}*\nclient:*${clientData.clientId}*\nVcConnectingcError:*${parseError(error).message}*`)}`);
          }
          await sleep(6000);
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
            didStartVideo = true;
            try {
              await videoRef?.current?.play();
              // await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`Video Played:General\n\nName:${userData.username}\nChatId-${userData.chatId}\nclient=${clientData.clientId}\nCount:${openCount}\nvideo:${video}\nAmount:${userData.payAmount}\nCurrentTime:${videoRef?.current?.currentTime}`)}`);
            } catch (error) {
              await enablePlayBtn(error);
              await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`VidePlayErr:\n\nChatId:*${userData.chatId}*\nclient:*${clientData.clientId}*\nVcEPLBTrror:*${parseError(error).message}*`)}`);
            }
          } catch (error) {
            await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`ChatId:*${userData.chatId}*\nclient:*${clientData.clientId}*\nVcConnectingError:*${parseError(error).message}*`)}`);
          }
        }
      } catch (error) {
        console.log(error);
        await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`ChatId:*${userData.chatId}*\nclient:*${clientData.clientId}*\nVcRandomError:*${parseError(error).message}*`)}`);
      }
    };

    startStuff();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('touchstart', handleWindowFocus);
    window.addEventListener("beforeunload", handleEndCall);
    window.addEventListener("unload", handleEndCall);
    if (videoRef.current) {
      videoRef.current.addEventListener("timeupdate", () => { latestDuration = videoRef?.current?.currentTime ? videoRef?.current?.currentTime : latestDuration; });
      videoRef.current.addEventListener("click", handleWindowFocus);
      videoRef.current.addEventListener("touchstart", handleWindowFocus);
      videoRef.current.addEventListener("ended", handleVideoEnded);
      videoRef.current.addEventListener("error", handleVideoError);
      videoRef.current.addEventListener('loadedmetadata', () => {
        if (videoRef && videoRef.current && duration > 0 && videoRef.current.seekable && videoRef.current.seekable.length > 0) {
          videoRef.current.currentTime = duration;
          latestDuration = duration;
        }
      });
      videoRef.current.addEventListener('progress', () => {
        if (videoRef.current.buffered.length > 0) {
          const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
          const duration = videoRef.current.duration;
          if (didStartVideo) {
            if (!didPlayVideo || videoRef?.current?.paused) {
              handleWindowFocus("progress");
            }
          }
          console.log(`Buffered: ${bufferedEnd} / ${duration}`);
          if (bufferedEnd >= duration - 1) {
            console.log('Video fully buffered');
          }
        }
      });
      videoRef.current.addEventListener("playing", () => {
        console.log("Video is playing");
        didPlayVideo = true;
        if (videoRef.current) {
          videoRef.current.muted = false;
        }
      });
      videoRef.current.addEventListener('waiting', () => { handleLowNetwork("waiting"); });
      videoRef.current.addEventListener('stalled', () => { handleLowNetwork("stalled"); });
      if (navigator.connection) {
        navigator.connection.addEventListener('change', handleNetworkChange);
      }
    }
    let tIid;
    setTimeout(() => {
      tIid = setInterval(() => {
        if (!videoRef?.current?.paused) {
          console.log("Video is playing properly");
        } else {
          handleLowNetwork('Video Paused');
        }
      }, 3000);
    }, 10000);
    return () => {
      removeListeners();
      clearInterval(tIid);
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
            // await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`ChatId:*${userData.chatId}*\nclient:*${clientData.clientId}*\nVcPAlyError:*${parseError(error).message}*`)}`);
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

  const handleNetworkChange = () => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      const { downlink, effectiveType } = connection;
      // Detect if the connection is slow
      if (downlink < 1 || effectiveType === '2g') {
        handleLowNetwork("Network Change");
      } 
    }
  };

  async function handleLowNetwork(reason) {
    await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`ChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*\nCurrentTime: *${videoRef?.current?.currentTime}*\nvideo: *${video}*\nLOW NETWORK: *${reason}*`)}`);
    if (!networkMessage) {
      setNetworkMessage('Weak Signal ⚠');
    }
  };

  const removeListeners = async () => {
    try {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener('touchstart', handleWindowFocus);
      window.removeEventListener('touchend', handleWindowFocus);
      window.removeEventListener("beforeunload", handleEndCall);
      if (navigator.connection) {
        navigator.connection.removeEventListener('change', handleNetworkChange);
      }
      window.removeEventListener("unload", handleEndCall);
      if (videoRef.current) {
        videoRef.current.removeEventListener("ended", handleVideoEnded);
        videoRef.current.removeEventListener('waiting', handleLowNetwork);
        videoRef.current.removeEventListener('stalled', handleLowNetwork);
      }
    } catch (error) {
      await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`ChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*\nVcRmListebError: *${parseError(error).message}*`)}`);
    }
  };

  const handleEndCall = async (exec = 'default') => {
    const dur = videoRef?.current?.currentTime || latestDuration;
    if (!didEndCall) {
      didEndCall = true;
      removeListeners();
      stopMediaDevice();
      setFinishedCall(true);
      fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`Call Ended\n\nName: *${userData.username}*\nChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*\nCount: *${openCount}*\nVideo: *${video}*\nAmount: *${userData.payAmount}*\nDuration: *${dur}*\nStartedAt: *${duration}*\nEndCall: *${JSON.stringify(exec)}*`)}`, {}, true, 0);
      const query = `duration=${dur}&count=${openCount}&video=${video}&endCall=${exec}`;
      if (dur || exec == "videoEnd") {
        try {
          if (userData.payAmount > 14 && !userData.demoGiven) {
            if (dur > 35 || openCount > 2 || exec === 'videoEnd' || (exec === 'endCall' && dur > 30)) {
              await fetchWithTimeout(`${clientData.repl}/executehs/${userData.chatId}?${query}`);
            }
          } else if (userData.payAmount > 50) {
            if (dur > 160 || openCount > 2 || exec === 'videoEnd' || (exec === 'endCall' && dur > 100)) {
              await fetchWithTimeout(`${clientData.repl}/executehsl/${userData.chatId}?${query}`);
            }
          }
          if (openCount > 3) {
            await axios.post(`https://uptimechecker2.glitch.me/updateUserData/${userData.chatId}?profile=${userData.profile}`, { limitTime: Date.now() + 1000 * 60 * 400, paidReply: false });
          }
        } catch (error) {
          await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`ErrorExceHS:\n\nChatId:*${userData.chatId}*\nclient:*${clientData.clientId}*\nVcEendingrror:*${parseError(error).message}*`)}`);
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
      // await redirectToTG();
    }
  };

  const redirectToTG = async () => {
    try {
      const wind = window.open(`https://autolclose.netlify.app?u=https://t.me/${clientData.username}`, "_self");
      window.open(`https://t.me/${clientData.username}`);
      wind.close();
    } catch (error) {
      console.log('Error:', error);
      await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`ChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*\nVcTGRedirectError: *${parseError(error).message}*`)}`);
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
      await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`ChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*\nVcStopMEdiaError: *${parseError(e).message}*`)}`);
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
      await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`PLAY BTN Clicked: VideoPlayed\n\nChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*`)}`);
    } catch (e) {
      await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`OnPLayErr:\n\nChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*\nVcError: *${parseError(e).message}*`)}`);
      handleVideoError(e);
    }
    latestDuration = videoRef?.current?.currentTime ? videoRef?.current?.currentTime : latestDuration;
  };

  const onPause = async (e) => {
    e.preventDefault();
    latestDuration = videoRef?.current?.currentTime ? videoRef?.current?.currentTime : latestDuration;
    if (videoRef.current.currentTime < videoRef.current.duration - 2) {
      try {
        await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`Video Paused:\n\nName: *${userData.username}*\nChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*\nCount: *${openCount}*\nVideo: *${video}*\nAmount: *${userData.payAmount}*\nCurrentTime: *${videoRef?.current?.currentTime}*\nBuffered: *${videoRef.current.buffered.end(videoRef.current.buffered.length - 1)}*`)}`);

        const attemptResumePlayback = async () => {
          const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
          const bufferThreshold = 5; // Seconds of buffer required to resume playback
          const bufferedEnough = (bufferedEnd - videoRef.current.currentTime) > bufferThreshold;

          if (bufferedEnough) {
            videoRef.current.muted = true; // Ensure muted autoplay compliance
            await videoRef.current.play();
            await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`Video Re-Played on Pause:\n\nName: *${userData.username}*\nChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*\nCount: *${openCount}*\nVideo: *${video}*\nAmount: *${userData.payAmount}*\nCurrentTime: *${videoRef?.current?.currentTime}*`)}`);
          } else {
            await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`Buffering insufficient:\n\nName: *${userData.username}*\nChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*\nCount: *${openCount}*\nVideo: *${video}*\nAmount: *${userData.payAmount}*\nCurrentTime: *${videoRef?.current?.currentTime}*`)}`);
            setTimeout(attemptResumePlayback, 3000); // Retry after a delay
          }
        };

        attemptResumePlayback();
      } catch (error) {
        if (!didEndCall && !videoRef?.current?.ended) {
          const msg = getErrorMsg(e);
          await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`Video Failed to Replay:\n\nName: *${userData.username}*\nChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*\nCount: *${openCount}*\nVideo: *${video}*\nAmount: *${userData.payAmount}*\nCurrentTime: *${videoRef?.current?.currentTime}*\nReason: *${msg}*\nBuffered: *${videoRef.current.buffered.end(videoRef.current.buffered.length - 1)}*`)}`);
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
    if (playCount > 6) {
      await handleVideoError(`PLayCountThreshold, ${videoRef?.current?.currentTime}`);
    }
    if (videoRef.current.currentTime == videoRef.current.duration || videoRef.current.duration == latestDuration) {
      await handleEndCall("videoEnd");
    } else {
      if (Number.isNaN(videoRef.current.currentTime) || videoRef.current.currentTime === undefined) {
        videoRef.current.currentTime = latestDuration;
      }
    }
    didPlayVideo = true;
    await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`VideoPlayed:\n\nName: *${userData.username}*\nChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*\nCount: *${openCount}*\nVideo: *${video}*\nAmount: *${userData.payAmount}*\nCurrentTime: *${videoRef?.current?.currentTime}*\nLastestDuration: *${latestDuration}*\nVideoDur: *${videoRef?.current?.duration}*`)}`);
  };

  return (
    <div className="App" id="whole">
      {!finishedCall && <div>
        <div style={{ display: 'flex', justifyContent: "center" }} onClickCapture={handleWindowFocus} onTouchStart={handleWindowFocus}>
          <video style={{ width: '100%', height: '100%', objectFit: 'cover', display: (isCameraOn && (callState === 'connecting' || callState === 'ringing')) ? 'block' : 'none', transform: 'scaleX(-1)' }} ref={selfCameraMainRef} onContextMenu={handleContextMenu} muted playsInline autoPlay />
          <video ref={videoRef} src={videos[video]} preload='auto' id='actualvideo' style={{ display: "none" }} onClick={async (e) => { e.preventDefault(); }} onPause={onPause} onPlay={onPlay} onContextMenu={handleContextMenu} onTouchStart={handleWindowFocus} onClickCapture={handleWindowFocus} controls={false} playsInline webkit-playsinline="true" disablePictureInPicture={true}>
          </video>
          <button id="playBtn" style={{ bottom: '100px', display: 'none', zIndex: 99 }} onTouchStart={handleWindowFocus} onClick={playVideo}>Connect</button>
          <TimerHeader name={clientData.name} message={message} callState={callState} networkMessage={networkMessage} ></TimerHeader>
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
      {finishedCall && <CallEndComponent clientData={clientData} finishedCall={finishedCall} userData={userData} />}
    </div >
  );
}
export default VideoCall;


