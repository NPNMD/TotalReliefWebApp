import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const onCallCreated = functions.firestore
  .document('calls/{callId}')
  .onCreate(async (snap, context) => {
    const call = snap.data();
    const callId = context.params.callId;

    if (!call) {
        console.log('No call data found');
        return;
    }

    // Wait 5 seconds to allow in-app notification acknowledgment
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Check if call is still ringing and not yet notified
    const currentCallSnapshot = await admin.firestore().collection('calls').doc(callId).get();
    const currentCall = currentCallSnapshot.data();

    if (currentCall && currentCall.status === 'ringing' && !currentCall.pushNotificationSent) {
        console.log(`Call ${callId} still ringing after 5s. Sending push notification.`);
        await sendNotification(call.recipientId, {
            title: `Incoming Call from ${call.callerName}`,
            body: `${call.callerFacility || 'Medical Facility'} - Click to answer`,
            data: {
                callId: callId,
                type: 'incoming_call',
                click_action: '/dashboard'
            }
        }, snap.ref);
    }
  });

export const onCallUpdated = functions.firestore
  .document('calls/{callId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();

    // Trigger on Missed Call (Timeout)
    if (newData.status === 'timeout' && previousData.status !== 'timeout') {
        console.log(`Call ${context.params.callId} timed out. Sending missed call notification.`);
        await sendNotification(newData.recipientId, {
            title: "Missed Call",
            body: `${newData.callerName} from ${newData.callerFacility || 'Medical Facility'} tried to reach you.`,
            data: {
                callId: context.params.callId,
                type: 'missed_call',
                click_action: '/dashboard'
            }
        });
    }
  });

async function sendNotification(userId: string, payload: { title: string, body: string, data: any }, callRef?: admin.firestore.DocumentReference) {
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();
    const fcmTokens = userData?.fcmTokens || [];

    if (fcmTokens.length === 0) {
        console.log(`No FCM tokens for user ${userId}`);
        return;
    }

    const message = {
        notification: {
            title: payload.title,
            body: payload.body
        },
        data: payload.data,
        tokens: fcmTokens
    };

    try {
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log('FCM sent:', response.successCount, 'success', response.failureCount, 'fail');

        if (callRef && payload.data.type === 'incoming_call') {
             await callRef.update({
                pushNotificationSent: true,
                pushNotificationSentAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
    } catch (error) {
        console.error('Error sending FCM:', error);
    }
}
