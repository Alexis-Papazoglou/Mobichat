// CreateChat.tsx
import React, { useState } from 'react';
import { Button, TextInput, View, Modal, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { auth, firestore } from '../firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons'; // Make sure to install @expo/vector-icons

const CreateChat: React.FC = () => {
    const [username, setUsername] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [message, setMessage] = useState('');

    const createChat = async () => {
        // Query for the user with the entered username
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('username', '==', username));
        const querySnapshot = await getDocs(q);
    
        if (querySnapshot.empty) {
            alert('No such user!');
            return;
        }
    
        // Get the ID of the other user
        const otherUserId = querySnapshot.docs[0].id;
    
        // Check if a chat already exists between the current user and the other user
        const chatsRef = collection(firestore, 'chats');
        const chatQuery = query(chatsRef, where('userIds', 'array-contains', auth.currentUser?.uid));
        const chatQuerySnapshot = await getDocs(chatQuery);
    
        const existingChat = chatQuerySnapshot.docs.find(doc => {
            const chatData = doc.data();
            return chatData.userIds.includes(otherUserId);
        });
    
        if (existingChat) {
            alert('You already have a chat with this user!');
            return;
        }
    
        // Create a new chat document
        await addDoc(chatsRef, {
            userIds: [auth.currentUser?.uid, otherUserId],
            messages: []
        });
    
        // Show a success message
        setMessage('New chat created!');
        setTimeout(() => setMessage(''), 2000); // Hide the message after 2 seconds
    
        // Close the modal and clear the username
        setModalVisible(false);
        setUsername('');
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
                <MaterialIcons name="add" size={24} color="black" />
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalView}>
                    <TextInput
                        value={username}
                        onChangeText={setUsername}
                        placeholder="Enter username"
                        style={styles.input}
                        placeholderTextColor={'grey'}
                    />
                    <Button title="Create Chat" onPress={createChat} />
                    <Button title="Cancel" onPress={() => setModalVisible(false)} />
                </View>
            </Modal>

            {message && <Text>{message}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: 'red',
        padding: 7,
        borderRadius: 50,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: 'gray',
        padding: 10,
        width: 200,
        marginBottom: 10,
    },
});

export default CreateChat;