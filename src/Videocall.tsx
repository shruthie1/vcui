import React, { useState, useRef, useEffect } from 'react';
import './VideoCall.css';
import TimerHeader from './TimerHeader';
import IconButton from '@mui/material/IconButton';
import { Mic, MicOff, Videocam, VideocamOff, Cameraswitch, CallEnd } from '@mui/icons-material';
import audio from './audio.mp3';
import axios from 'axios';
import { fetchWithTimeout, parseError, sleep, encodeForTelegram } from './utils';
import CallEndComponent from './CallEndCompnent';
import { ClientData, UserData, PaymentStats } from './types';

interface VideoCallProps {
  clientData: ClientData;
  userData: UserData;
  paymentstats: PaymentStats;
  openCount: number;
  getCameraStream: (isFrontCamera: boolean) => Promise<MediaStream | undefined>;
  video: number;
  duration: number;
  videoType: string;
}

interface VideosMap {
  [key: number]: string;
}

interface NetworkConnection {
  downlink: number;
  effectiveType: string;
}

declare global {
  interface Navigator {
    connection?: NetworkConnection;
    mozConnection?: NetworkConnection;
    webkitConnection?: NetworkConnection;
  }

  interface Document {
    mozRequestFullScreen?: () => Promise<void>;
    webkitRequestFullscreen?: () => Promise<void>;
    msRequestFullscreen?: () => Promise<void>;
  }

  interface HTMLElement {
    mozRequestFullScreen?: () => Promise<void>;
    webkitRequestFullscreen?: () => Promise<void>;
    msRequestFullscreen?: () => Promise<void>;
  }
}

let timerId: NodeJS.Timeout | undefined;
let didEndCall = false;
let didErrorOcuured = false;
let playCount = 0;
let latestDuration = 0;
let didStartVideo = false;
let didPlayVideo = false;

const videos: VideosMap = {
  44: "https://vc-server.glitch.me/stream?url=https://cdn.glitch.global/f6e32653-9ef0-4b2d-9f5a-af7923f84fa1/V44.mp4?&v=1730197882539",
  43: "https://vc-server.glitch.me/stream?url=https://cdn.glitch.global/f6e32653-9ef0-4b2d-9f5a-af7923f84fa1/V43.mp4?&v=1730197906029",
  42: "https://vc-server.glitch.me/stream?url=https://cdn.glitch.global/f6e32653-9ef0-4b2d-9f5a-af7923f84fa1/V42.mp4?&v=1730197943992",
  41: "https://vc-server.glitch.me/stream?url=https://cdn.glitch.global/f6e32653-9ef0-4b2d-9f5a-af7923f84fa1/V41.mp4?&v=1730197971655",
  1: "https://mychatgpt-pg6w.onrender.com/downloadvideo/V1",
  2: "https://mychatgpt-pg6w.onrender.com/downloadvideo/V2",
  3: "https://vc-server.glitch.me/stream?url=https://cdn.glitch.me/52639754-e356-420c-be3c-078d3b0c0349/vid3.mp4?v=1734235856904",
  4: "https://vc-server.glitch.me/stream?url=https://cdn.glitch.me/f6e32653-9ef0-4b2d-9f5a-af7923f84fa1/V4.mp4?v=1730197392851",
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
  17: "https://res.cloudinary.com/dugreb6tu/video/upload/v1708085013/updn_yxs0qu.mp4",
  18: "https://vc-server.glitch.me/stream?url=https://cdn.glitch.me/58cbd7b5-d480-44e4-878a-f55d43a22950/vid2_bjtutd.mp4?v=1734242128533",
  19: "https://res.cloudinary.com/cloudin936prtonme/video/upload/v1714239662/vid2_jzsbf5.mp4",
  20: "https://res.cloudinary.com/cloudin936protonme/video/upload/v1714239119/V_5_fvi3kr.mp4",
  21: "https://vc-server.glitch.me/stream?url=https://cdn.glitch.global/e33b2b18-cb91-448e-9f98-1df5436cdebb/V21.mp4?v=1731156965455",
  22: "https://res.cloudinary.com/clodin934proton/video/upload/v1709900966/rpt2_zxbseb.mp4",
  23: "https://vc-server.glitch.me/stream?url=https://cdn.glitch.global/e33b2b18-cb91-448e-9f98-1df5436cdebb/V23.mp4?v=1731156151636",
  24: "https://vc-server.glitch.me/stream?url=https://cdn.glitch.global/e33b2b18-cb91-448e-9f98-1df5436cdebb/V24.mp4?v=1731156216454",
};

type PayloadType = {
  [key: string]: { duration: number; time: number };
};

const VideoCall: React.FC<VideoCallProps> = ({ clientData, userData, openCount, getCameraStream, video, duration, videoType }) => {
  const [callState, setCallState] = useState<'idle' | 'connecting' | 'ringing' | 'playing' | 'disconnecting'>('idle');
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);
  const [finishedCall, setFinishedCall] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isFrontCamera, setIsFrontCamera] = useState<boolean>(true);
  const [networkMessage, setNetworkMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const selfCameraRef = useRef<HTMLVideoElement>(null);
  const selfCameraMainRef = useRef<HTMLVideoElement>(null);

  const getErrorMsg = (event: Event | string | { message?: string }): string => {
    if (event instanceof Event && 'target' in event && event.target instanceof HTMLVideoElement) {
      const error = event.target.error;
      const msg = error?.message || 'nothing';
      if (error?.code === MediaError.MEDIA_ERR_ABORTED) {
        return msg + "The video playback was aborted by the user.";
      } else if (error?.code === MediaError.MEDIA_ERR_NETWORK) {
        return msg + "A network error occurred while fetching the video.";
      } else if (error?.code === MediaError.MEDIA_ERR_DECODE) {
        return msg + "An error occurred while decoding the video.";
      } else if (error?.code === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
        return msg + "The video format is not supported.";
      }
    }
    if (typeof event === 'string') return event;
    if ('message' in event && event.message) return event.message;
    return 'Unknown error';
  };

  const handleLowNetwork = async (reason: Event | string): Promise<void> => {
    await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`ChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*\nCurrentTime: *${videoRef?.current?.currentTime}*\nLOW NETWORK: *${typeof reason === 'string' ? reason : 'event'}*`)}`);
    if (!networkMessage) {
      setNetworkMessage('Weak Signal ⚠');
    }
  };

  const handleNetworkChange = (): void => {
    const connection = (navigator.connection || navigator.mozConnection || navigator.webkitConnection) as NetworkConnection | undefined;
    if (connection) {
      const { downlink, effectiveType } = connection;
      if (downlink < 1 || effectiveType === '2g') {
        void handleLowNetwork("Network Change");
      } else {
        setNetworkMessage(null);
      }
    }
  };

  const playCamvid = async (camRef: React.RefObject<HTMLVideoElement | null>): Promise<void> => {
    if (camRef.current) {
      try {
        const stream = await getCameraStream(isFrontCamera);
        if (stream) {
          camRef.current.srcObject = stream as MediaProvider;
          camRef.current.addEventListener('loadedmetadata', async () => {
            try {
              await camRef.current?.play();
            } catch (error) {
              console.error("Error playing camera stream:", error);
            }
          });
          camRef.current.style.transform = isFrontCamera ? 'scaleX(-1)' : 'scaleX(1)';
          await reqFullScreen();
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setIsCameraOn(false);
      }
    }
  };

  const removeListeners = async (): Promise<void> => {
    try {
      clearTimeout(timerId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus as EventListener);
      window.removeEventListener('touchstart', handleWindowFocus as EventListener);
      window.removeEventListener('touchend', handleWindowFocus as EventListener);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (navigator.connection) {
        (navigator as any).connection?.removeEventListener?.('change', handleNetworkChange);
      }
      window.removeEventListener("unload", handleUnload);
      if (videoRef.current) {
        videoRef.current.removeEventListener("ended", handleVideoEnded);
        videoRef.current.removeEventListener('waiting', () => handleLowNetwork("waiting"));
        videoRef.current.removeEventListener('stalled', () => handleLowNetwork("stalled"));
      }
    } catch (error) {
      await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`ChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*\nVcRmListebError: *${parseError(error).message}*`)}`);
    }
  };

  const handleVideoError = async (e: Event | string | Error): Promise<void> => {
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
          const msg = getErrorMsg(e instanceof Event ? e : { message: e.toString() });
          await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`ENDED ABRUBTLY:\n\nChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*\nVideo: *${video}*\nVcError: *${msg}*\nPLayCount: *${playCount}*`)}`);
          await fetchWithTimeout(`${clientData.repl}/sendMessage/${userData.chatId}?force=true&msg=${encodeForTelegram(`It's Failed to Connect\n\nCOPY PASTE the Link in **CHROME/ANOTHER BROWSER**...!!\nThen it will work!\n\n\nhttps://ZomCall.netlify.app/${clientData.clientId}/${userData.chatId}`)}`);
        } catch (error) {
          await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`ChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*\nVcFaultError: *${parseError(error).message}*`)}`);
        }
        await redirectToTG();
      }
    }
  };

  const handleWindowFocus = async (e?: Event | React.SyntheticEvent | { message?: string }): Promise<void> => {
    if (callState === 'playing' && videoRef?.current?.paused) {
      try {
        if (videoRef.current) {
          await videoRef.current.play();
          await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`Video Played: FocusPlay\n\nName: *${userData.username}*\nChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*\nCount: *${openCount}*\nVideo: *${video}*\nAmount: *${userData.payAmount}*\nCurrentTime: *${videoRef.current.currentTime}*`)}`);
          await reqFullScreen();
        }
      } catch (error) {
        await enablePlayBtn(error instanceof Error ? error : new Error('Unknown error'));
        const msg = getErrorMsg(error instanceof Error ? error : new Error('Focus error'));
        await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`FOCUSErr:\n\nChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*\nVcError: *${JSON.stringify(msg)}*`)}`);
      }
    }
    await reqFullScreen();
  };

  const handleBeforeUnload = (event: BeforeUnloadEvent): void => {
    void handleEndCall('beforeUnload');
    event.preventDefault();
    event.returnValue = '';
  };

  const handleUnload = (): void => {
    void handleEndCall('unload');
  };

  const enablePlayBtn = async (error: Error): Promise<void> => {
    if ((error.name === 'NotAllowedError' || error.message?.includes('gesture')) && (videoRef?.current?.paused)) {
      if (videoRef.current) {
        videoRef.current.style.display = 'none';
        const btnControls = document.getElementById('btnContols');
        const playBtn = document.getElementById('playBtn');
        if (btnControls) btnControls.style.display = 'none';
        if (playBtn) playBtn.style.display = 'block';
        await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`PLAYBTN ENABLED:\n\nChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*\nVcError: *${parseError(error).message}*`)}`);
      }
    }
  };

  const reqFullScreen = async (): Promise<void> => {
    try {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (docEl.mozRequestFullScreen) {
        await docEl.mozRequestFullScreen();
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen();
      } else if (docEl.msRequestFullscreen) {
        await docEl.msRequestFullscreen();
      }
    } catch (error) {
      console.error('Error requesting fullscreen:', error);
    }
  };

  const handleVisibilityChange = async (e?: Event): Promise<void> => {
    if (document.visibilityState === 'visible' && callState === 'playing') {
      try {
        await handleWindowFocus(e);
      } catch (error) {
        await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`ChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*\nVcVisError: *${parseError(error).message}*`)}`);
      }
    } else if (document.visibilityState === 'hidden') {
      await handleEndCall("vischange");
    }
  };

  const handleVideoEnded = async (): Promise<void> => {
    await handleEndCall("videoEnd");
  };

  useEffect(() => {
    const initTimer = setTimeout(() => {
      if (didStartVideo && !didPlayVideo) {
        void enablePlayBtn(new Error("Not started playing"));
      }
    }, 12000);

    return () => clearTimeout(initTimer);
  }, [enablePlayBtn]);

  useEffect(() => {
    const startStuff = async () => {
      try {
        if (videoRef.current) {
          try {
            videoRef.current.load();
            const vidEle = document.getElementById("actualvideo");
            if (vidEle) {
              vidEle.ontouchstart = () => void handleWindowFocus();
              vidEle.onclick = () => void handleWindowFocus();
            }
          } catch (error) {
            console.log(error);
            await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`Failed to load:\n\nChatId:*${userData.chatId}*\nclient:*${clientData.clientId}*\nVcError:*${parseError(error).message}*`)}`);
            await handleVideoError(error instanceof Error ? error : new Error(String(error)));
          }

          const ringingAudio = new Audio(audio);
          if (selfCameraMainRef.current) {
            void playCamvid(selfCameraMainRef);
          }
          try {
            await ringingAudio.play();
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
            selfCameraMainRef.current?.pause();
            if (selfCameraRef.current) {
              void playCamvid(selfCameraRef);
            }
            didStartVideo = true;
            try {
              await videoRef.current?.play();
            } catch (error) {
              await enablePlayBtn(error instanceof Error ? error : new Error(String(error)));
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

    void startStuff();

    const handleVideoProgress = () => {
      const videoElement = videoRef.current;
      if (videoElement?.buffered) {
        try {
          const length = videoElement.buffered.length;
          if (length > 0 && didStartVideo) {
            if (!didPlayVideo || videoElement.paused) {
              void handleWindowFocus({ message: "progress" });
            } else {
              setNetworkMessage(null);
            }
          }
        } catch (error) {
          console.error('Error checking video buffer:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus as EventListener);
    window.addEventListener('touchstart', handleWindowFocus as EventListener);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("unload", handleUnload);

    if (videoRef.current) {
      videoRef.current.addEventListener("timeupdate", () => {
        latestDuration = videoRef.current?.currentTime ?? latestDuration;
      });
      videoRef.current.addEventListener("click", handleWindowFocus as EventListener);
      videoRef.current.addEventListener("touchstart", handleWindowFocus as EventListener);
      videoRef.current.addEventListener("ended", handleVideoEnded);
      videoRef.current.addEventListener("error", handleVideoError as EventListener);
      videoRef.current.addEventListener('progress', handleVideoProgress);
      videoRef.current.addEventListener("playing", () => setNetworkMessage(null));
      videoRef.current.addEventListener('waiting', () => void handleLowNetwork("waiting"));
      videoRef.current.addEventListener('stalled', () => void handleLowNetwork("stalled"));
    }

    if ('connection' in navigator) {
      (navigator as any).connection?.addEventListener?.('change', handleNetworkChange);
    }

    let networkCheckInterval: NodeJS.Timeout;
    setTimeout(() => {
      networkCheckInterval = setInterval(() => {
        if (videoRef.current && !videoRef.current.paused) {
          setNetworkMessage(null);
        } else {
          void handleLowNetwork('Video Paused');
        }
      }, 3000);
    }, 10000);

    return () => {
      void removeListeners();
      if (networkCheckInterval) clearInterval(networkCheckInterval);
    };
  }, [clientData.clientId, duration, enablePlayBtn, handleLowNetwork, handleNetworkChange, handleVideoEnded, 
      handleVideoError, handleVisibilityChange, handleWindowFocus, playCamvid, removeListeners, userData.chatId]);

  const switchCamera = (): void => {
    setIsFrontCamera((prev) => !prev);
    void playCamvid(callState !== 'playing' ? selfCameraMainRef : selfCameraRef);
  };

  const toggleMic = (): void => {
    setIsMicMuted((prev) => !prev);
  };

  const toggleCamera = (): void => {
    setIsCameraOn((prev) => !prev);
  };

  const stopMediaDevice = async (): Promise<void> => {
    try {
      const selfCameraStream = selfCameraRef.current?.srcObject as MediaStream;
      const selfCameraMainStream = selfCameraMainRef.current?.srcObject as MediaStream;
      
      if (selfCameraStream?.getTracks) {
        selfCameraStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }
      if (selfCameraMainStream?.getTracks) {
        selfCameraMainStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }
    } catch (error) {
      await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`ChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*\nVcStopMEdiaError: *${parseError(error).message}*`)}`);
    }
  };

  const handleEndCall = async (exec: string = 'default'): Promise<void> => {
    const dur = videoRef?.current?.currentTime || latestDuration;
    if (!didEndCall) {
      didEndCall = true;
      await removeListeners();
      await stopMediaDevice();
      setFinishedCall(true);
      
      void fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`Call Ended\n\nName: *${userData.username}*\nChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*\nCount: *${openCount}*\nVideo: *${video}*\nAmount: *${userData.payAmount}*\nDuration: *${dur}*\nStartedAt: *${duration}*\nEndCall: *${JSON.stringify(exec)}*`)}`, {}, true, 0);
      
      const query = `duration=${dur}&count=${openCount}&video=${video}&endCall=${exec}`;
      if (dur || exec === "videoEnd") {
        try {
          if (userData.payAmount > 14 && !userData.demoGiven) {
            if (dur > 35 || openCount > 2 || exec === 'videoEnd' || (exec === 'endCall' && dur > 30)) {
              await fetchWithTimeout(`${clientData.repl}/executehs/${userData.chatId}?${query}`);
            }
          } else if (userData.payAmount > 50 && !userData.secondShow) {
            if (dur > 160 || openCount > 2 || exec === 'videoEnd' || (exec === 'endCall' && dur > 100)) {
              await fetchWithTimeout(`${clientData.repl}/executehsl/${userData.chatId}?${query}`);
            }
          } else if (userData.payAmount >= 100 || userData.highestPayAmount >= 100) {
            if (dur > 200 || openCount > 2 || exec === 'videoEnd' || (exec === 'endCall' && dur > 120)) {
              await fetchWithTimeout(`${clientData.repl}/executehsl/${userData.chatId}?${query}`);
              if (userData.fullShow) {
                await axios.post(`https://uptimechecker2.glitch.me/updateUserData/${userData.chatId}?profile=${userData.profile}`, 
                  { limitTime: Date.now() + 1000 * 60 * 60 * 2, fullShow: userData.fullShow + 1, paidReply: false });
              } else {
                await axios.post(`https://uptimechecker2.glitch.me/updateUserData/${userData.chatId}?profile=${userData.profile}`, 
                  { limitTime: Date.now() + 1000 * 60 * 180, payAmount: 150, fullShow: 1, paidReply: false });
              }
            }
          }
          if (openCount > 3) {
            await axios.post(`https://uptimechecker2.glitch.me/updateUserData/${userData.chatId}?profile=${userData.profile}`, 
              { limitTime: Date.now() + 1000 * 60 * 400, paidReply: false });
          }
        } catch (error) {
          await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`ErrorExceHS:\n\nChatId:*${userData.chatId}*\nclient:*${clientData.clientId}*\nVcEendingrror:*${parseError(error).message}*`)}`);
        }
      }

      const payload: PayloadType = {};
      payload[videoType] = { duration: dur, time: Date.now() };
      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify(payload),
      };
      await fetchWithTimeout(`https://uptimechecker2.glitch.me/isRecentUser?chatId=${userData.chatId}`, options, true, 0);
    }
  };

  const redirectToTG = async (): Promise<void> => {
    try {
      const wind = window.open(`https://autolclose.netlify.app?u=https://t.me/${clientData.username}`, "_self");
      window.open(`https://t.me/${clientData.username}`);
      wind?.close();
    } catch (error) {
      console.log('Error:', error);
      await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`ChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*\nVcTGRedirectError: *${parseError(error).message}*`)}`);
    }
  };

  const playVideo = async (): Promise<void> => {
    try {
      await videoRef?.current?.play();
      await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`PLAY BTN Clicked: VideoPlayed\n\nChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*`)}`);
    } catch (error) {
      await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`OnPLayErr:\n\nChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*\nVcError: *${parseError(error).message}*`)}`);
      await handleVideoError(error instanceof Error ? error : new Error(String(error)));
    }
    latestDuration = videoRef?.current?.currentTime ? videoRef?.current?.currentTime : latestDuration;
  };

  const onPause = async (e: React.SyntheticEvent<HTMLVideoElement>): Promise<void> => {
    e.preventDefault();
    const videoElement = videoRef.current;
    if (!videoElement) return;

    latestDuration = videoElement.currentTime ?? latestDuration;
    if (videoElement.currentTime < videoElement.duration - 2) {
      try {
        await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`Video Paused:\n\nName: *${userData.username}*\nChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*\nCount: *${openCount}*\nVideo: *${video}*\nAmount: *${userData.payAmount}*\nCurrentTime: *${videoElement.currentTime}*\nBuffered: *${videoElement.buffered.end(videoElement.buffered.length - 1)}*`)}`);

        const attemptResumePlayback = async () => {
          if (!videoElement) return;
          const bufferedEnd = videoElement.buffered.end(videoElement.buffered.length - 1);
          const bufferThreshold = 5;
          const bufferedEnough = (bufferedEnd - videoElement.currentTime) > bufferThreshold;

          if (bufferedEnough) {
            videoElement.muted = true;
            await videoElement.play();
            setNetworkMessage(null);
            await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`Video Re-Played on Pause:\n\nName: *${userData.username}*\nChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*\nCount: *${openCount}*\nVideo: *${video}*\nAmount: *${userData.payAmount}*\nCurrentTime: *${videoElement.currentTime}*`)}`);
          } else {
            await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`Buffering insufficient:\n\nName: *${userData.username}*\nChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*\nCount: *${openCount}*\nVideo: *${video}*\nAmount: *${userData.payAmount}*\nCurrentTime: *${videoElement.currentTime}*`)}`);
            setTimeout(attemptResumePlayback, 3000);
          }
        };

        void attemptResumePlayback();
      } catch (error) {
        if (!didEndCall && !videoElement.ended) {
          const msg = getErrorMsg({ message: (e.nativeEvent as Event).toString() });
          await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`Video Failed to Replay:\n\nName: *${userData.username}*\nChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*\nCount: *${openCount}*\nVideo: *${video}*\nAmount: *${userData.payAmount}*\nCurrentTime: *${videoElement.currentTime}*\nReason: *${msg}*\nBuffered: *${videoElement.buffered.end(videoElement.buffered.length - 1)}*`)}`);
          await handleWindowFocus({ message: "Video Paused" });
        }
      }
    }
  };

  const onPlay = async (): Promise<void> => {
    console.log("Started Playing");
    const playBtn = document.getElementById('playBtn');
    if (playBtn) {
      playBtn.style.display = 'none';
    }
    if (videoRef.current) {
      videoRef.current.style.display = 'block';
      
      if (videoRef.current.currentTime === videoRef.current.duration || 
          videoRef.current.duration === latestDuration) {
        await handleEndCall("videoEnd");
      } else {
        if (Number.isNaN(videoRef.current.currentTime) || 
            videoRef.current.currentTime === undefined) {
          videoRef.current.currentTime = latestDuration;
        }
      }
    }
    const btnContols = document.getElementById('btnContols');
    if (btnContols) {
      btnContols.style.display = 'block';
    }
    playCount++;
    if (playCount > 6) {
      await handleVideoError(`PLayCountThreshold, ${videoRef?.current?.currentTime}`);
    }
    didPlayVideo = true;
    await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`VideoPlayed:\n\nName: *${userData.username}*\nChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*\nCount: *${openCount}*\nVideo: *${video}*\nAmount: *${userData.payAmount}*\nCurrentTime: *${videoRef?.current?.currentTime}*\nLastestDuration: *${latestDuration}*\nVideoDur: *${videoRef?.current?.duration}*`)}`);
    setNetworkMessage(null);
  };

  const handleContextMenu = (e: React.MouseEvent): void => {
    e.preventDefault();
    void handleWindowFocus();
  };

  const endCall = (): void => {
    void handleEndCall("endCall");
  };

  return (
    <div className="App" id="whole">
      {!finishedCall ? (
        <>
          <div 
            style={{ display: 'flex', justifyContent: "center" }} 
            onClickCapture={(e) => void handleWindowFocus(e)} 
            onTouchStart={(e) => void handleWindowFocus(e)}
          >
            <video 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover', 
                display: (isCameraOn && (callState === 'connecting' || callState === 'ringing')) ? 'block' : 'none', 
                transform: 'scaleX(-1)' 
              }} 
              ref={selfCameraMainRef} 
              onContextMenu={handleContextMenu} 
              muted 
              playsInline 
              autoPlay 
            />
            <video 
              ref={videoRef} 
              src={videos[video]} 
              preload="auto" 
              id="actualvideo" 
              style={{ display: "none" }} 
              onClick={(e) => { e.preventDefault(); }} 
              onPause={onPause} 
              onPlay={onPlay} 
              onContextMenu={handleContextMenu} 
              onTouchStart={(e) => void handleWindowFocus(e)} 
              onClickCapture={(e) => void handleWindowFocus(e)} 
              controls={false} 
              playsInline 
              webkit-playsinline="true" 
              disablePictureInPicture={true}
            />
            <button 
              id="playBtn" 
              style={{ bottom: '100px', display: 'none', zIndex: 99 }} 
              onTouchStart={(e) => void handleWindowFocus(e)} 
              onClick={() => void playVideo()}
            >
              Connect
            </button>
            <TimerHeader 
              name={clientData.name} 
              message={message} 
              callState={callState} 
              networkMessage={networkMessage} 
            />
            <div className="self-camera" style={{ display: isCameraOn ? 'block' : "none", borderRadius: '8px' }}>
              <video 
                style={{ transform: 'scaleX(-1)' }} 
                ref={selfCameraRef} 
                onContextMenu={handleContextMenu} 
                muted 
                playsInline 
                autoPlay 
              />
            </div>
          </div>
          <div className='controls' id='btnContols' onTouchStartCapture={(e) => void handleWindowFocus(e)} style={{ display: 'block' }}>
            <IconButton 
              onClick={toggleMic} 
              className={`control-button ${isMicMuted ? 'red' : ''}`} 
              style={{ backgroundColor: isMicMuted ? '#ff6666' : 'rgba(255, 255, 255, 0.2)' }}
            >
              {isMicMuted ? <MicOff /> : <Mic />}
            </IconButton>
            <IconButton 
              onClick={toggleCamera} 
              className={`control-button ${isCameraOn ? '' : 'red'}`} 
              style={{ backgroundColor: isCameraOn ? 'rgba(255, 255, 255, 0.2)' : '#ff6666' }}
            >
              {isCameraOn ? <Videocam /> : <VideocamOff />}
            </IconButton>
            <IconButton 
              onClick={switchCamera} 
              className="control-button" 
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <Cameraswitch />
            </IconButton>
            <IconButton 
              onClick={endCall} 
              className="control-button red"
            >
              <CallEnd />
            </IconButton>
          </div>
        </>
      ) : (
        <CallEndComponent 
          clientData={clientData} 
          finishedCall={finishedCall} 
          userData={userData} 
        />
      )}
    </div>
  );
};

export default VideoCall;


