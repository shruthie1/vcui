import React from 'react';
import logo from './tglogo.png';
import './VideoCall.css';
import { fetchWithTimeout } from './utils';

const TelegramUI = (props) => {
    const { joinVideoCall, clientData, userData } = props;
    const containerStyle = {
        textAlign: 'center',
        padding: '20px',
        height: "100%"
    };

    const logoStyle = {
        width: '100px', // Adjust the size of the logo as needed
        marginBottom: '10px',
    };

    return (
        <div className='idle-app' style={containerStyle}>
            <img src={logo} alt="Telegram Logo" style={logoStyle} />
            <h1>{clientData?.name}</h1>
            <button style={{ transform: 'translateX(-50%)', bottom: '120px' }} onClick={joinVideoCall}>Start Video Call</button>
            <button
                style={{
                    backgroundColor: 'red',
                    transform: 'translateX(-50%)', bottom: '60px'
                }}
                onClick={async () => {
                    fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`User Report Button clicked: ${userData.chatId}`)}`);
                    window.open(`https://report-upi.netlify.app/${userData.profile}/${userData.chatId}`, '_self');
                }}
            >
                Report Transaction
            </button>
        </div>
    );
};

export default TelegramUI;
