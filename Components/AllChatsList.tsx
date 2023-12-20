import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, query, onSnapshot, where, getDoc, doc as docRef } from 'firebase/firestore';
import { firestore } from '../firebase';
import { auth } from '../firebase';
import { useNavigation } from '@react-navigation/native';

type chats = {
    id: string;
    userIds: string[];
    username: string;
};

const AllChatsList: React.FC = () => {
    const navigation = useNavigation<any>();
    const [chats, setChats] = useState<chats[]>([]);

    useEffect(() => {
        const chatsRef = collection(firestore, 'chats');
        const q = query(chatsRef, where('userIds', 'array-contains', auth.currentUser?.uid));
        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            const chatsData = await Promise.all(querySnapshot.docs.map(async (doc) => {
                const otherUserId = doc.data().userIds.find((id: string) => id !== auth.currentUser?.uid);
                const otherUserDocRef = docRef(firestore, 'users', otherUserId);
                const otherUserDoc = await getDoc(otherUserDocRef);
                return {
                    id: doc.id,
                    userIds: doc.data().userIds,
                    username: otherUserDoc.data()?.username,
                };
            }));
            setChats(chatsData);
        });

        return unsubscribe;
    }, []);

    return (
        <View style={styles.container}>
            {chats.map((chat) => (
                <TouchableOpacity style={styles.chatItem} key={chat.id} onPress={() => {
                    navigation.navigate('ChatWindow', {
                        chatId: chat.id,
                    });
                }}>
                    <Text style={styles.chatText}>{chat.username}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: 'black',
    },
    chatItem: {
        padding: 16,
        marginBottom: 10,
        backgroundColor: '#fff',
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 3,
    },
    chatText: {
        fontSize: 16,
    },
});

export default AllChatsList;