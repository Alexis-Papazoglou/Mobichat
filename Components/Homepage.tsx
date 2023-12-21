import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { auth, firestore } from '../firebase';
import { getFirestore, doc, getDoc, collection } from 'firebase/firestore';
import ChatList from './AllChatsList';
import useUnsubscribeNotification from '../Hooks/useUnsubscribeNotification';

const Homepage: React.FC = () => {
    const unsubscribe = useUnsubscribeNotification();
    const [username, setUsername] = useState('');

    useEffect(() => {
        const fetchUsername = async () => {
            const userDoc = await getDoc(doc(collection(firestore, 'users'), auth.currentUser?.uid));
            setUsername(userDoc.data()?.username);
        };

        fetchUsername();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.welcomeText}>Welcome, {username}</Text>
            <ChatList />
            <TouchableOpacity onPress={unsubscribe}>
                <Text>Disable notifications for the user in this device</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f5f5f5',
    },
    welcomeText: {
        fontSize: 24,
    },
});

export default Homepage;