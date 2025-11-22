import { useEffect, useState, useRef } from 'react';
import { collection, addDoc, onSnapshot, query, where, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { useVideo } from '../../context/VideoContext';
import { UserProfile } from '../../types';
import { Phone, PhoneOff, Video as VideoIcon } from 'lucide-react';
import { showToast } from '../../utils/toast';

export const CallManager = () => {
  const { currentUser, userProfile } = useAuth();
  const { createRoom, joinCall, isInCall } = useVideo();
  
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [outgoingCall, setOutgoingCall] = useState<any>(null);
  const callTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 1. Listen for Incoming Calls
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'calls'),
      where('recipientId', '==', currentUser.uid),
      where('status', '==', 'ringing')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const callDoc = snapshot.docs[0];
        setIncomingCall({ id: callDoc.id, ...callDoc.data() });
      } else {
        setIncomingCall(null);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  // 3. Call Timeout Logic - Auto-decline after 45 seconds
  useEffect(() => {
    if (!incomingCall) {
      // Clean up timeout if call is cleared
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }
      return;
    }

    // Set 45-second timeout for incoming call
    callTimeoutRef.current = setTimeout(async () => {
      console.log('Call timeout - auto-declining after 45 seconds');
      
      try {
        // Update call status to 'timeout' which triggers Cloud Function for missed call notification
        await updateDoc(doc(db, 'calls', incomingCall.id), {
          status: 'timeout',
          endedAt: serverTimestamp()
        });
        
        showToast.warning('Missed call from ' + incomingCall.callerName);
        setIncomingCall(null);
      } catch (error) {
        console.error('Error handling call timeout:', error);
      }
    }, 45000); // 45 seconds

    // Cleanup timeout on unmount or when incoming call changes
    return () => {
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }
    };
  }, [incomingCall]);

  // 2. Listen for Outgoing Call Updates (e.g., when accepted)
  useEffect(() => {
      if(!outgoingCall) return;

      const unsubscribe = onSnapshot(doc(db, 'calls', outgoingCall.id), (docSnap) => {
          const data = docSnap.data();
          if(data?.status === 'active') {
              // Recipient accepted! Join the room.
              joinCall(data.roomUrl);
              setOutgoingCall(null); // Clear overlay, video interface takes over
          } else if (data?.status === 'rejected' || data?.status === 'ended') {
              showToast.info("Call was declined or ended.");
              setOutgoingCall(null);
          }
      });

      return () => unsubscribe();
  }, [outgoingCall, joinCall]);


  // ACTIONS
  const handleAcceptCall = async () => {
      if (!incomingCall) return;
      
      // Clear the timeout since call is being answered
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }
      
      // Update status to active
      await updateDoc(doc(db, 'calls', incomingCall.id), {
          status: 'active',
          answeredAt: serverTimestamp()
      });

      // Join the room
      joinCall(incomingCall.roomUrl);
      setIncomingCall(null);
  };

  const handleRejectCall = async () => {
      if (!incomingCall) return;
      
      // Clear the timeout since call is being declined
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }
      
      await updateDoc(doc(db, 'calls', incomingCall.id), {
          status: 'rejected',
          endedAt: serverTimestamp()
      });
      setIncomingCall(null);
  };

  const handleCancelCall = async () => {
      if(!outgoingCall) return;
      
      await updateDoc(doc(db, 'calls', outgoingCall.id), {
          status: 'ended',
          endedAt: serverTimestamp()
      });
      setOutgoingCall(null);
  };

  // RENDER HELPERS - We need to expose a method to trigger calls from Roster
  // For this simple implementation, we'll use a window event or global store
  // But a cleaner way is to export a hook. For now, let's just listen for a custom event
  useEffect(() => {
      const handleStartCall = async (event: CustomEvent<UserProfile>) => {
          const recipient = event.detail;
          console.log("Starting call to:", recipient.displayName);
          
          // 1. Create Room
          const roomUrl = await createRoom();
          if (!roomUrl) {
              showToast.error("Failed to create video room.");
              return;
          }

          // 2. Create Call Document
          const callDoc = await addDoc(collection(db, 'calls'), {
              callerId: currentUser?.uid,
              callerName: userProfile?.displayName,
              recipientId: recipient.uid,
              recipientName: recipient.displayName,
              roomUrl,
              status: 'ringing',
              createdAt: serverTimestamp()
          });

          setOutgoingCall({ id: callDoc.id, recipient });
      };

      window.addEventListener('initiate-call', handleStartCall as any);
      return () => window.removeEventListener('initiate-call', handleStartCall as any);
  }, [createRoom, currentUser, userProfile]);


  // UI RENDERING
  if (isInCall) {
      // Daily.co handles the in-call UI mostly, but we can add a simple "End Call" button overlay if needed
      // Or assume VideoContext renders the Daily Iframe full screen.
      // For this MVP, we rely on Daily's built-in UI inside the iframe.
      return (
          <div className="fixed bottom-4 right-4 z-50">
              {/* Call controls could go here if using custom UI */}
          </div>
      );
  }

  if (incomingCall) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center shadow-xl animate-bounce-slight">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
             <VideoIcon className="w-12 h-12 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Incoming Call</h3>
          <p className="text-gray-600 mb-8">from {incomingCall.callerName}</p>
          
          <div className="flex justify-center space-x-8">
            <button 
                onClick={handleRejectCall}
                className="flex flex-col items-center text-red-500 hover:text-red-700 transition">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
                    <PhoneOff className="w-8 h-8" />
                </div>
                <span>Decline</span>
            </button>
            
            <button 
                onClick={handleAcceptCall}
                className="flex flex-col items-center text-green-500 hover:text-green-700 transition">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2 animate-pulse">
                    <Phone className="w-8 h-8" />
                </div>
                <span>Accept</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (outgoingCall) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-8 max-w-md w-full text-center shadow-xl">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                     <div className="animate-ping absolute inline-flex h-16 w-16 rounded-full bg-blue-400 opacity-75"></div>
                     <VideoIcon className="w-8 h-8 text-gray-600 relative" />
                </div>
                <h3 className="text-xl font-bold mb-2">Calling...</h3>
                <p className="text-gray-600 mb-8">{outgoingCall.recipient.displayName}</p>
                
                <button 
                    onClick={handleCancelCall}
                    className="w-full bg-red-100 text-red-600 py-3 rounded-lg font-medium hover:bg-red-200 transition">
                    Cancel Call
                </button>
            </div>
        </div>
      );
  }

  return null;
};

