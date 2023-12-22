import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { auth, firestore } from '../firebase';
import { getFirestore, doc, getDoc, collection } from 'firebase/firestore';
import useUnsubscribeNotification from '../Hooks/useUnsubscribeNotification';
import AllChatsList from './AllChatsList';

const Homepage: React.FC = () => {
    const unsubscribe = useUnsubscribeNotification();
    const [username, setUsername] = useState('');
    const [profilePicture, setProfilePicture] = useState();

    useEffect(() => {
        const fetchUsername = async () => {
            const userDoc = await getDoc(doc(collection(firestore, 'users'), auth.currentUser?.uid));
            setUsername(userDoc.data()?.username);
            setProfilePicture(userDoc.data()?.profilePicture);
        };

        fetchUsername();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>Welcome, </Text>
                <Text style={styles.usernameText}>{username}</Text>
                <View style={styles.imgContainer}>
                    <Image source={{ uri: profilePicture }} style={styles.img} />
                </View>
            </View>
            <AllChatsList />
            {/* <TouchableOpacity onPress={unsubscribe}>
                <Text>Disable notifications for the user in this device</Text>
            </TouchableOpacity> */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f5f5f5',
        width: '100%',
    },
    welcomeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginVertical: 10,
    },
    welcomeText: {
        fontSize: 24,
    },
    img: {
        width: 30,
        height: 30,
        borderRadius: 50,
    },
    imgContainer: {
        width: 30,
        height: 30,
        marginHorizontal: 5,
        borderRadius: 50,
        marginRight: 10,
        backgroundColor: '#fff',
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
    },
    usernameText: {
        fontSize: 28,
        fontWeight: 'bold',
    },
});

export default Homepage;