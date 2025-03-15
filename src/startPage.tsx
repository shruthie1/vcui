import React from 'react';
import logo from './logo.svg';
import './VideoCall.css';
import { fetchWithTimeout, encodeForTelegram } from './utils';
import { ClientData, UserData } from './types';

interface TelegramUIProps {
    joinVideoCall: () => Promise<void>;
    clientData: ClientData;
    userData: UserData;
}

interface ContainerStyle {
    textAlign: 'center';
    padding: string;
    height: string;
}

interface LogoStyle {
    width: string;
    marginBottom: string;
}

const TelegramUI: React.FC<TelegramUIProps> = ({ joinVideoCall, clientData, userData }) => {
    const containerStyle: ContainerStyle = {
        textAlign: 'center',
        padding: '20px',
        height: "100%"
    };

    const logoStyle: LogoStyle = {
        width: '100px',
        marginBottom: '10px',
    };

    return (
        <div className='idle-app' style={containerStyle}>
            <img src={logo} alt="Telegram Logo" style={logoStyle} />
            <h1>{clientData?.name}</h1>
            <button style={{ transform: 'translateX(-50%)', bottom: '120px' }} onClick={joinVideoCall}>Start Video Call</button>
            {userData.count > 2 && <button
                style={{
                    backgroundColor: '#ee3838',
                    transform: 'translateX(-50%)', 
                    bottom: '60px'
                }}
                onClick={async () => {
                    fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(`User Report Button clicked: *${userData.chatId}*`)}`);
                    window.open(`https://report-upi.netlify.app/${userData.profile}/${userData.chatId}`, '_self');
                }}
            >
                Report Transaction
            </button>
            }
        </div>
    );
};

export default TelegramUI;
