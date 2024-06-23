import React, { useState, useEffect } from 'react';

const TimerHeader = (props) => {
    const [callDuration, setCallDuration] = useState(0);
    useEffect(() => {
        const startCallTimer = () => {
            if (props.callState == 'playing') {
                const startTime = Date.now();
                setCallDuration(0);

                const updateTimer = () => {
                    setCallDuration(Math.floor((Date.now() - startTime) / 1000));
                };

                const timerInterval = setInterval(updateTimer, 1000);

                return () => {
                    clearInterval(timerInterval);
                };
            };
        };
        startCallTimer()
    }, [props.callState])
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(remainingSeconds).padStart(2, '0');
        return `${formattedMinutes}:${formattedSeconds}`;
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
      };
    return (
        <div onContextMenu={handleContextMenu}>
            {props.message && (
                <div className="video-overlay above">
                    <p>{props.message}</p>
                </div>
            )}
            <div className="video-overlay" style={{ minWidth: "180px" }}>
                <h3>{props.name}</h3>
                <p style={{ display: (!props.message && props.callState == 'playing') ? 'block' : 'none' }}>{formatTime(callDuration)}</p>
            </div>
        </div>
    )
}

export default TimerHeader