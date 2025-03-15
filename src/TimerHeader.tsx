import React, { useState, useEffect } from 'react';

interface TimerHeaderProps {
    callState: 'idle' | 'connecting' | 'ringing' | 'playing' | 'disconnecting';
    message?: string | null;
    name: string;
    networkMessage?: string | null;
}

const TimerHeader: React.FC<TimerHeaderProps> = (props) => {
    const [callDuration, setCallDuration] = useState<number>(0);
    
    useEffect(() => {
        let timerInterval: NodeJS.Timeout;
        
        if (props.callState === 'playing') {
            const startTime = Date.now();
            setCallDuration(0);

            const updateTimer = () => {
                setCallDuration(Math.floor((Date.now() - startTime) / 1000));
            };

            timerInterval = setInterval(updateTimer, 1000);
        }

        return () => {
            if (timerInterval) {
                clearInterval(timerInterval);
            }
        };
    }, [props.callState]);

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(remainingSeconds).padStart(2, '0');
        return `${formattedMinutes}:${formattedSeconds}`;
    };

    const handleContextMenu = (e: React.MouseEvent): void => {
        e.preventDefault();
    };

    return (
        <div onContextMenu={handleContextMenu}>
            {props.message && (
                <div className="video-overlay above">
                    <p>{props.message}</p>
                </div>
            )}
            <div className="video-overlay">
                <h3>{props.name}</h3>
                <p style={{ display: (!props.message && props.callState === 'playing') ? 'block' : 'none' }}>{formatTime(callDuration)}</p>
                {props.networkMessage && <p className="network-message blink" style={{marginTop: '30px'}}>{props.networkMessage}</p>}
            </div>
        </div>
    );
};

export default TimerHeader;