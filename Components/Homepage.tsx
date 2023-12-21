import React from 'react';
import { Text, View , StyleSheet, TouchableOpacity } from 'react-native';
import { auth } from '../firebase';
import ChatList from './AllChatsList';
import useUnsubscribeNotification from '../Hooks/useUnsubscribeNotification';

const Homepage: React.FC = () => {
    const unsubscribe = useUnsubscribeNotification();

    return (
        <View style={styles.container}>
            <Text style={styles.welcomeText}>Welcome, {auth.currentUser?.email}</Text>
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
        marginBottom: 10,
    },
    idText: {
        fontSize: 16,
        marginBottom: 20,
    },
});


export default Homepage;