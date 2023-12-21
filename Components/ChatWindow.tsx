import React, { useState, useEffect, useRef } from 'react';
import { TextInput, StyleSheet, ActivityIndicator, ScrollView, View, TouchableOpacity, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { collection, addDoc, query, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase';
import { FontAwesome } from '@expo/vector-icons';
import { KeyboardAwareFlatList, KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

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
    const { sendNotification } = useSendNotification();
    const flatListRef = useRef<any | null>(null);

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
            // Run this in the background
            (async () => {
                try {
                    await sendNotification(otherUser.id, newMessage);
                } catch (error) {
                    console.log(error);
                }
            })();
        }
    
        setIsLoading(false);
    };

    return (
        <KeyboardAwareScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.container}
            resetScrollToCoords={{ x: 0, y: 0 }}
            scrollEnabled={false}
        >
            <KeyboardAwareFlatList
                data={messages}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => <Message message={item} />}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
                contentContainerStyle={styles.messagesContainer}
                ref={flatListRef}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Type your message"
                />
                {isLoading ? <ActivityIndicator /> : <TouchableOpacity style={styles.btn} onPress={handleSend}>
                    <FontAwesome name="send" size={14} color="blue" />
                </TouchableOpacity>}
            </View>
        </KeyboardAwareScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    messagesContainer: {
        flexGrow: 1,
        justifyContent: 'flex-end',
        marginHorizontal: 10,
        marginVertical: 10,
        paddingBottom: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'lightgrey',
        width: '100%',
        padding: 10,
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        alignSelf: 'flex-end',
    },
    input: {
        flex: 1, // This makes the input field take up the remaining space
        height: 40,
        borderColor: 'gray',
        borderRadius: 5,
        borderWidth: 1,
        paddingLeft: 7,
        marginRight: 10, // Add some margin to the right of the input field
        backgroundColor: 'white',
    },
    btn: {
        borderRadius: 50,
        padding: 10,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: 'blue',
        borderWidth: 1,
    },

});

export default ChatWindow;