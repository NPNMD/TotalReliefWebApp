import { useEffect, useState } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { messaging, db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

// VAPID key should theoretically be an env var, but for now we can placeholder it or leave it empty if not strictly enforced by the setup
// (though usually required for web push)
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY; 

export const useFCM = () => {
  const { currentUser } = useAuth();
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>(Notification.permission);
  const [error, setError] = useState<string | null>(null);

  const requestPermissionAndToken = async () => {
      setError(null);
      try {
        const perm = await Notification.requestPermission();
        setPermission(perm);
        
        if (perm !== 'granted') {
          console.log('Notification permission denied');
          return;
        }

        if (perm === 'granted') {
            const token = await getToken(messaging, {
              vapidKey: VAPID_KEY
            });
            
            if (token) {
              console.log('FCM Token:', token);
              setFcmToken(token);
              
              if (currentUser) {
                  // Update user profile with new token
                  const userRef = doc(db, 'users', currentUser.uid);
                  await updateDoc(userRef, {
                    fcmTokens: arrayUnion(token)
                  });
              }
            }
        }
      } catch (error) {
        console.error('Error initializing FCM:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize notifications');
      }
    };

  useEffect(() => {
    if (!currentUser) return;
    // Auto-request on mount if default, or just check token if granted
    if (Notification.permission === 'granted') {
        requestPermissionAndToken();
    }
  }, [currentUser]);

  useEffect(() => {
    // Handle foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      const { title } = payload.notification || {};
      
      // If the app is in foreground, we might want to show a toast or custom UI
      // Browsers usually don't show system notification if app is focused
      if (title) {
          // Basic browser notification as fallback or if user allows
          // Note: modern browsers might not show this if focused
          // new Notification(title, { body, icon: '/icon.png' });
          
          // TODO: Integrate with a toast library
          // For now just log
      }
    });

    return () => unsubscribe();
  }, []);

  return { fcmToken, permission, requestPermission: requestPermissionAndToken, error };
};

