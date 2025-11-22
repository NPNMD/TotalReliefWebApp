import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';
import { showToast } from '../utils/toast';

interface VideoContextType {
  callObject: DailyCall | null;
  createRoom: () => Promise<string | null>;
  joinCall: (url: string) => void;
  leaveCall: () => void;
  isInCall: boolean;
}

const VideoContext = createContext<VideoContextType>({
  callObject: null,
  createRoom: async () => null,
  joinCall: () => {},
  leaveCall: () => {},
  isInCall: false,
});

export const useVideo = () => useContext(VideoContext);

export const VideoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [callObject, setCallObject] = useState<DailyCall | null>(null);
  const [isInCall, setIsInCall] = useState(false);

  useEffect(() => {
    // Initialize Daily call object on mount
    const co = DailyIframe.createCallObject();
    setCallObject(co);

    // Event listeners
    co.on('joined-meeting', () => setIsInCall(true))
      .on('left-meeting', () => setIsInCall(false))
      .on('error', (e) => console.error('Daily error:', e));

    return () => {
      co.destroy();
    };
  }, []);

  const createRoom = useCallback(async () => {
    const apiKey = import.meta.env.VITE_DAILY_API_KEY;
    if (!apiKey) {
      console.error("Daily API Key is missing!");
      showToast.error("Missing Daily API Key. Please add VITE_DAILY_API_KEY to your .env file.");
      return null;
    }

    try {
      // NOTE: In a production app, room creation should happen on the backend 
      // to keep the API key secure. This is client-side only for MVP.
      const response = await fetch('https://api.daily.co/v1/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          properties: {
            enable_chat: true,
            enable_screenshare: false, // As per design doc
            max_participants: 2, // 1:1 calls
             // exp: Math.round(Date.now() / 1000) + 3600 // Expires in 1 hour
          }
        })
      });

      const data = await response.json();
      if (data.error) {
          console.error("Error creating room:", data.error);
          return null;
      }
      return data.url;
    } catch (error) {
      console.error("Failed to create room:", error);
      return null;
    }
  }, []);

  const joinCall = useCallback((url: string) => {
    if (callObject) {
      callObject.join({ url });
    }
  }, [callObject]);

  const leaveCall = useCallback(() => {
    if (callObject) {
      callObject.leave();
    }
  }, [callObject]);

  return (
    <VideoContext.Provider value={{ callObject, createRoom, joinCall, leaveCall, isInCall }}>
      {children}
    </VideoContext.Provider>
  );
};

