import React, { useState, useEffect } from 'react';
import { TextInput, Button, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { collection, addDoc, query, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase';
import Message from './Message';
import useSendNotification from '../Hooks/useSendNotification'; // Import the hook

//types
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

type message = {
    text: string;
    createdAt: Date;
    sentBy: string;
};

type user = {
    username: string;
    id: string;
    email: string;
};

type Props = StackScreenProps<RootStackParamList, 'ChatWindow'>;

const ChatWindow: React.FC<Props> = ({ route }) => {
    const { chatId } = route.params;
    const [messages, setMessages] = useState<message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [otherUser, setOtherUser] = useState<user | null>(null);
    const { sendNotification } = useSendNotification(); // Use the hook

    useEffect(() => {
        const fetchChatAndUser = async () => {
            const chatRef = doc(firestore, `chats/${chatId}`);
            const chatDoc = await getDoc(chatRef);

            if (!chatDoc.exists()) {
                console.log('No such chat!');
                return;
            }

            const userIds = chatDoc.data().userIds;
            const otherUserId = userIds.find((id: string) => id !== auth.currentUser?.uid);

            if (!otherUserId) {
                console.log('No other user in this chat!');
                return;
            }

            const userRef = doc(firestore, `users/${otherUserId}`);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                console.log('No such user!');
                return;
            }

            setOtherUser(userDoc.data() as user);
        };

        fetchChatAndUser();
    }, [chatId]);

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
        await addDoc(messagesRef, { text: newMessage, createdAt: new Date(), sentBy: auth.currentUser?.uid });
        setNewMessage('');

        // Send a notification to the other user
        if (otherUser) {
            await sendNotification(otherUser.id, newMessage);
        }

        setIsLoading(false);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
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
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        padding: 12,
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