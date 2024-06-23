import React from 'react';
import logo from './tglogo.png'
import './VideoCall.css'

const TelegramUI = (props) => {
    const { joinVideoCall, clientData } = props
    const containerStyle = {
        textAlign: 'center',
        padding: '20px',
    };

    const logoStyle = {
        width: '100px', // Adjust the size of the logo as needed
        marginBottom: '10px',
    };

    return (
        <div style={containerStyle}>
            <img src={logo} alt="Telegram Logo" style={logoStyle} />
            <h1>{clientData?.name}</h1>
            <button style={{ transform: 'translateX(-50%)',   bottom: '50px'}} onClick={joinVideoCall}>Start Video Call</button>
        </div>
    );
};

export default TelegramUI;
