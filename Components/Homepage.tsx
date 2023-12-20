// HomePage.tsx
import React from 'react';
import { Text, View , StyleSheet } from 'react-native';
import { auth } from '../firebase';
import ChatList from './AllChatsList';

const Homepage: React.FC = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.welcomeText}>Welcome, {auth.currentUser?.email}</Text>
            <Text style={styles.idText}>Your ID is {auth.currentUser?.uid}</Text>
            <ChatList />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
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