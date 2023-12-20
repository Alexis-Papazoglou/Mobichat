import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { auth } from '../firebase';

type message = {
    text: string;
    createdAt: Date;
    sentBy: string;
};

const Message: React.FC<{ message: message }> = ({ message }) => {
    const isCurrentUser = message.sentBy === auth.currentUser?.uid;

    return (
        <View style={[styles.container, isCurrentUser ? styles.currentUser : styles.otherUser]}>
            <Text style={styles.messageText}>{message.text}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    currentUser: {
        alignSelf: 'flex-end',
        backgroundColor: 'blue',
    },
    otherUser: {
        alignSelf: 'flex-start',
        backgroundColor: 'grey',
    },
    messageText: {
        color: '#fff',
    },
});

export default Message;