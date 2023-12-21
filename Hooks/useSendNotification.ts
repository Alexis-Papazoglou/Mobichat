// useSendNotification.js
import axios from 'axios';
import { auth, firestore } from '../firebase';
import { pushConfig } from '../pushconfig';
import { doc, getDoc } from 'firebase/firestore';

const useSendNotification = () => {
    const sendNotification = async (otherUserId: String, message: String) => {
        try {
            const uid = auth.currentUser?.uid;
            if (!uid) {
                console.log('No authenticated user!');
                return;
            }

            const userRef = doc(firestore, 'users', uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                console.log('No such user!');
                return;
            }

            const username = userSnap.data().username;
            console.log('Sending notification to:', otherUserId)

            // Check if the user is subscribed to notifications
            const response = await axios.get(`https://app.nativenotify.com/api/expo/indie/sub/${pushConfig.APP_ID}/${pushConfig.APP_TOKEN}/${otherUserId}`);
            console.log('Response:', response.data);
            if (!response.data || response.data.length === 0) {
                console.log('User is not subscribed to notifications');
                return;
            }

            await axios.post(`https://app.nativenotify.com/api/indie/notification`, {
                subID: otherUserId,
                appId: pushConfig.APP_ID,
                appToken: pushConfig.APP_TOKEN,
                title: username || 'Someone',
                message: message
            });
        } catch (error) {
            console.error('Failed to send notification:', error);
        }
    };

    return { sendNotification };
};

export default useSendNotification;