import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
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
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Helper to create a fresh call instance
  const createCallInstance = useCallback(() => {
      if (!videoContainerRef.current) return null;

      const co = DailyIframe.createFrame(videoContainerRef.current, {
        showLeaveButton: true,
        iframeStyle: {
          width: '100%',
          height: '100%',
          border: '0',
        }
      });
      
      // Attach listeners
      co.on('joined-meeting', () => {
          setIsInCall(true);
      })
      .on('left-meeting', () => {
          setIsInCall(false);
          setIsVideoVisible(false);
      })
      .on('error', (e) => {
          console.error('Daily error:', e);
          showToast.error('Video call error occurred');
      });

      return co;
  }, []);

  const createRoom = useCallback(async () => {
    const apiKey = import.meta.env.VITE_DAILY_API_KEY;
    if (!apiKey) {
      console.error("Daily API Key is missing!");
      showToast.error("Missing Daily API Key. Please add VITE_DAILY_API_KEY to your .env file.");
      return null;
    }

    try {
      const response = await fetch('https://api.daily.co/v1/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          properties: {
            enable_chat: true,
            enable_screenshare: false,
            max_participants: 2,
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

  const joinCall = useCallback(async (url: string) => {
    let currentCo = callObject;
    
    if (currentCo) {
        console.log("Destroying existing call object before joining new one...");
        await currentCo.destroy();
        currentCo = null;
    }

    // 1. Show the container immediately
    setIsVideoVisible(true);

    // 2. Create new instance inside the container
    const newCo = createCallInstance();
    if (!newCo) {
        console.error("Failed to create call instance - container ref missing");
        return;
    }
    setCallObject(newCo);
    
    try {
        await newCo.join({ url });
    } catch (e) {
        console.error("Error joining call:", e);
        showToast.error("Failed to join video call.");
        await newCo.destroy();
        setCallObject(null);
        setIsVideoVisible(false);
    }
  }, [callObject, createCallInstance]);

  const leaveCall = useCallback(async () => {
    if (callObject) {
      await callObject.leave();
      await callObject.destroy();
      setCallObject(null);
      setIsInCall(false);
      setIsVideoVisible(false);
    }
  }, [callObject]);

  return (
    <VideoContext.Provider value={{ callObject, createRoom, joinCall, leaveCall, isInCall }}>
      {children}
      {/* Dedicated Video Container Overlay */}
      <div 
        ref={videoContainerRef}
        style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 99999,
            backgroundColor: '#000', // Black background while loading
            display: isVideoVisible ? 'block' : 'none',
        }}
      />
    </VideoContext.Provider>
  );
};
