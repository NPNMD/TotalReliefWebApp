import { useEffect, useRef, useState } from 'react';
import { ref, onDisconnect, set, serverTimestamp } from 'firebase/database';
import { doc, serverTimestamp as firestoreServerTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { rtdb, db } from '../config/firebase';

const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

export const usePresence = (userId: string | undefined) => {
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const [currentStatus, setCurrentStatus] = useState<'online' | 'away'>('online');
  
  useEffect(() => {
    if (!userId) return;

    const userStatusDatabaseRef = ref(rtdb, '/status/' + userId);
    const userStatusFirestoreRef = doc(db, 'presence', userId);

    const isOfflineForDatabase = {
      state: 'offline',
      last_changed: serverTimestamp(),
    };

    const isOnlineForDatabase = {
      state: 'online',
      last_changed: serverTimestamp(),
    };

    const isAwayForDatabase = {
      state: 'away',
      last_changed: serverTimestamp(),
    };

    // Set RTDB status
    set(userStatusDatabaseRef, isOnlineForDatabase).catch(console.error);
    onDisconnect(userStatusDatabaseRef).set(isOfflineForDatabase).catch(console.error);

    // Set Firestore status
    setDoc(userStatusFirestoreRef, {
      uid: userId,
      status: 'online',
      lastSeen: firestoreServerTimestamp(),
    }, { merge: true }).catch(console.error);

    // Function to update status based on activity
    const updateStatus = (status: 'online' | 'away') => {
      if (status === currentStatus) return;
      
      setCurrentStatus(status);
      
      const dbStatus = status === 'online' ? isOnlineForDatabase : isAwayForDatabase;
      
      // Update RTDB
      set(userStatusDatabaseRef, dbStatus).catch(console.error);
      
      // Update Firestore
      updateDoc(userStatusFirestoreRef, {
        status,
        lastSeen: firestoreServerTimestamp(),
      }).catch(console.error);
      
      console.log(`Status updated to: ${status}`);
    };

    // Function to reset idle timer on user activity
    const resetIdleTimer = () => {
      lastActivityRef.current = Date.now();
      
      // If user was away, set back to online
      if (currentStatus === 'away') {
        updateStatus('online');
      }
      
      // Clear existing idle timeout
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
      
      // Set new idle timeout
      idleTimeoutRef.current = setTimeout(() => {
        updateStatus('away');
      }, IDLE_TIMEOUT);
    };

    // Activity event listeners
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, resetIdleTimer, true);
    });

    // Initialize idle timer
    resetIdleTimer();

    // Heartbeat mechanism: Update lastSeen every 30 seconds
    heartbeatIntervalRef.current = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      
      if (timeSinceLastActivity >= IDLE_TIMEOUT && currentStatus !== 'away') {
        updateStatus('away');
      } else if (timeSinceLastActivity < IDLE_TIMEOUT && currentStatus !== 'online') {
        updateStatus('online');
      }
      
      // Update RTDB
      const dbStatus = currentStatus === 'online' ? isOnlineForDatabase : isAwayForDatabase;
      set(userStatusDatabaseRef, dbStatus).catch(console.error);
      
      // Update Firestore lastSeen timestamp
      updateDoc(userStatusFirestoreRef, {
        lastSeen: firestoreServerTimestamp(),
      }).catch(console.error);
      
      console.log('Presence heartbeat updated');
    }, 30000); // 30 seconds

    return () => {
      // Clean up activity listeners
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetIdleTimer, true);
      });
      
      // Clean up timers
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = null;
      }
      
      // Optional: Manually set offline on unmount if needed,
      // but onDisconnect handles the browser close/crash cases.
    };

  }, [userId, currentStatus]);
};

