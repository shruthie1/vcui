import React, { useEffect, useState, useCallback } from 'react';
import { fetchWithTimeout, parseError, encodeForTelegram } from './utils';
import { ClientData, UserData } from './types';

interface CallEndComponentProps {
  clientData: ClientData;
  finishedCall: boolean;
  userData: UserData;
}

const CallEndComponent: React.FC<CallEndComponentProps> = ({ clientData, finishedCall, userData }) => {
  const [counter, setCounter] = useState<number>(5);

  const redirectToTG = useCallback(async (): Promise<void> => {
    try {
      const wind = window.open(`https://autolclose.netlify.app?u=https://t.me/${clientData.username}`, "_self");
      window.open(`https://t.me/${clientData.username}`);
      wind?.close();
    } catch (error) {
      console.error('Error:', error);
      await fetchWithTimeout(
        `https://uptimechecker2.glitch.me/sendtochannel?chatId=-1001823103248&msg=${encodeForTelegram(
          `ChatId: *${userData.chatId}*\nClient: *${clientData.clientId}*\nVcTGRedirectError: *${parseError(error).message}*`
        )}`
      );
    }
  }, [clientData.username, userData.chatId, clientData.clientId]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (counter > 0) {
      timer = setTimeout(() => setCounter(counter - 1), 1000);
    } else {
      redirectToTG();
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [counter, redirectToTG]);

  if (!finishedCall) return null;

  return (
    <div>
      <h3 style={{ marginTop: '10vh' }}>Call Ended</h3>
      <div style={{ marginTop: "55vh" }}>
        <button 
          className='report-button' 
          onClick={() => window.open(`https://t.me/${clientData.username}`, '_blank')}
        >
          Open Telegram {counter > 0 ? `in (${counter}) secs` : ''}
        </button>
      </div>
    </div>
  );
};

export default CallEndComponent;
