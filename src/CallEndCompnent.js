import React, { useEffect, useState } from 'react';
import { fetchWithTimeout, parseError } from './utils';


const CallEndComponent = ({ clientData, finishedCall, userData }) => {
  const [counter, setCounter] = useState(5);

  useEffect(() => {
    // Countdown logic
    if (counter > 0) {
      const timer = setTimeout(() => setCounter(counter - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Automatically open Telegram when counter reaches 0
      redirectToTG()
    }
  }, [counter, clientData.username]);

  if (!finishedCall) return null;

  const redirectToTG = async () => {
    try {
      const wind = window.open(`https://autolclose.netlify.app?u=https://t.me/${clientData.username}`, "_self");
      window.open(`https://t.me/${clientData.username}`);
      wind.close();
    } catch (error) {
      console.log('Error:', error);
      await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`VcTGRedirectError-${parseError(error).message}`)}`);
    }
  };

  return (
    <div>
      <h3 style={{marginTop: '10vh'}}>Call Ended</h3>
      <div style={{ marginTop: "55vh" }}>
        <button className='report-button' onClick={() => window.open(`https://t.me/${clientData.username}`, '_blank')}>
          Open Telegram {counter > 0 ? `in (${counter}) secs` : ''}
        </button>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {/* Telegram Report Button */}
          <button
            className='report-button'
            style={{ backgroundColor: 'orange', marginLeft: '10px' }}
            onClick={() => {
              alert('Account reported successfully!');
              setTimeout(async () => {
                await fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`Report Button clicked: ${userData.chatId}`)}`);
                window.open(`https://report-upi.netlify.app/${userData.profile}/${userData.chatId}`, '_self')
              }, 5000);
            }}
          >
            Report via Telegram
          </button>

          {/* Report Transaction Button */}
          <button
            className='report-button'
            style={{ backgroundColor: 'red' }}
            onClick={async() => {
              fetchWithTimeout(`https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeURIComponent(`User Report Button clicked: ${userData.chatId}`)}`);
              window.open(`https://report-upi.netlify.app/${userData.profile}/${userData.chatId}`, '_self')
            }}
          >
            Report Transaction
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallEndComponent;
