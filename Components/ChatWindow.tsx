import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, addDoc, query, onSnapshot, orderBy } from 'firebase/firestore';
import { auth, firestore } from '../firebase';
import Message from './Message';

import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

type message = {
    text: string;
    createdAt: Date;
    sentBy: string;
};

type Props = StackScreenProps<RootStackParamList, 'ChatWindow'>;

const ChatWindow: React.FC<Props> = ({ route }) => {
    const { chatId } = route.params;
    const [messages, setMessages] = useState<message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const messagesRef = collection(firestore, `chats/${chatId}/messages`);
        const q = query(messagesRef, orderBy('createdAt'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const messagesData = querySnapshot.docs.map((doc) => ({
                text: doc.data().text,
                createdAt: doc.data().createdAt.toDate(),
                sentBy: doc.data().sentBy,
            }));

            setMessages(messagesData);
        });

        return unsubscribe;
    }, [chatId]);

    const handleSend = async () => {
        if (newMessage.trim() === '') {
            return;
        }

        setIsLoading(true);
        const messagesRef = collection(firestore, `chats/${chatId}/messages`);
        await addDoc(messagesRef, { text: newMessage, createdAt: new Date() , sentBy: auth.currentUser?.uid });
        setNewMessage('');
        setIsLoading(false);
    };

    return (
        <View style={styles.container}>
            {messages.map((message, index) => (
                <Message key={index} message={message} />
            ))}
            <TextInput
                style={styles.input}
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Type your message"
            />
            {isLoading ? <ActivityIndicator /> : <Button title="Send" onPress={handleSend} />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingLeft: 8,
    },
});

export default ChatWindow;