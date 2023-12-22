import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { collection, query, onSnapshot, where, getDoc, doc as docRef, orderBy, limit, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase';
import { auth } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns'; // Import the format function from date-fns

//types
import CreateChat from './CreateChat';

type chats = {
    id: string;
    userIds: string[];
    username: string;
    profilePicture: string;
    lastMessage: string;
    lastMessageCreatedAt: string; // Add a new field for the timestamp of the last message
};

const AllChatsList: React.FC = () => {
    const navigation = useNavigation<any>();
    const [chats, setChats] = useState<chats[]>([]);
    const [loading, setLoading] = useState(true);
    const chatsRef = collection(firestore, 'chats'); // Define chatsRef here

    useEffect(() => {
        const q = query(chatsRef, where('userIds', 'array-contains', auth.currentUser?.uid));
        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            const chatsData = await Promise.all(querySnapshot.docs.map(async (doc) => {
                const otherUserId = doc.data().userIds.find((id: string) => id !== auth.currentUser?.uid);
                const otherUserDocRef = docRef(firestore, 'users', otherUserId);
                const otherUserDoc = await getDoc(otherUserDocRef);

                // Fetch the last message
                const messagesRef = collection(docRef(chatsRef, doc.id), 'messages');
                const lastMessageQuery = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));
                const lastMessageSnapshot = await getDocs(lastMessageQuery);
                const lastMessage = lastMessageSnapshot.docs[0]?.data()?.text || '';
                const lastMessageCreatedAt = lastMessageSnapshot.docs[0]?.data()?.createdAt.toDate() || new Date();

                return {
                    id: doc.id,
                    userIds: doc.data().userIds,
                    username: otherUserDoc.data()?.username,
                    profilePicture: otherUserDoc.data()?.profilePicture,
                    lastMessage,
                    lastMessageCreatedAt: format(lastMessageCreatedAt, 'PPpp'), // Format the timestamp into a date string
                };
            }));
            setChats(chatsData);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        const unsubscribe = chats.map((chat) => {
            const messagesRef = collection(docRef(chatsRef, chat.id), 'messages');
            const lastMessageQuery = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));
            return onSnapshot(lastMessageQuery, async (querySnapshot) => {
                const lastMessage = querySnapshot.docs[0]?.data()?.text || '';
                const lastMessageCreatedAt = querySnapshot.docs[0]?.data()?.createdAt.toDate() || new Date();

                setChats((prevChats) => prevChats.map((chatItem) => chatItem.id === chat.id ? {
                    ...chatItem,
                    lastMessage,
                    lastMessageCreatedAt: format(lastMessageCreatedAt, 'PPpp'),
                } : chatItem));
            });
        });

        return () => unsubscribe.forEach((unsub) => unsub());
    }, [chats]);

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    {chats.map((chat) => (
                        <TouchableOpacity style={styles.chatItem} key={chat.id} onPress={() => {
                            navigation.navigate('ChatWindow', {
                                chatId: chat.id,
                                otherUsername: chat.username,
                                profilePicture: chat.profilePicture,
                            });
                        }}>
                            <View style={styles.chatContainer}>
                                <View style={styles.imgContainer}>
                                    <Image source={{ uri: chat?.profilePicture }} style={styles.img} />
                                </View>
                                <View>
                                    <Text style={styles.chatText}>{chat.username}</Text>
                                    <Text style={styles.lastMessageText}>{chat.lastMessage}</Text>
                                    <Text style={styles.lastMessageDateText}>{chat.lastMessageCreatedAt}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
            <CreateChat />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        width: '100%',
        paddingHorizontal: 5,
    },
    chatItem: {
        padding: 16,
        marginBottom: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 3,
        borderColor: 'lightgray',
        borderWidth: 1,
    },
    chatContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',      
    },
    chatText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    img: {
        width: 70,
        height: 70,
        borderRadius: 50,
        marginRight: 10,
    },
    imgContainer: {
        width: 70,
        height: 70,
        borderRadius: 50,
        marginRight: 10,
        backgroundColor: '#fff',
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
    },
    lastMessageText: {
        fontSize: 18,
        color: '#666',
    },
    lastMessageDateText: {
        paddingTop: 3,
        fontSize: 12,
        color: '#999',
    },
});

export default AllChatsList;