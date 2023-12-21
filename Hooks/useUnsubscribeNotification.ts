// useUnsubscribeNotification.js
import { auth } from '../firebase';
import axios from 'axios';
import { pushConfig } from '../pushconfig';

const useUnsubscribeNotification = () => {
    const unsubscribe = async () => {
        const uid = auth.currentUser?.uid;
        if (!uid) {
            console.log('No authenticated user!');
            return;
        }

        // Unregister the user's device from push notification service
        const url = `https://app.nativenotify.com/api/app/indie/sub/${pushConfig.APP_ID}/${pushConfig.APP_TOKEN}/${uid}`;
        await axios.delete(url, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log('Deleted indie from push notifications!')
    };

    return unsubscribe;
};

export default useUnsubscribeNotification;