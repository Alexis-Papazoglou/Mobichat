import React, { useState } from 'react';
import { Button, TextInput, View, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, doc, updateDoc } from "firebase/firestore";
import { firestore } from '../../firebase';
import { auth } from '../../firebase';
import { useNavigation } from '@react-navigation/native';

const UsernameForm: React.FC = () => {
    const navigation = useNavigation<any>();
    const [username, setUsername] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const handleUsernameSubmit = async () => {
        setLoading(true);
        try {
            await updateDoc(doc(collection(firestore, "users"), auth.currentUser?.uid), {
                username: username
            });
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            });
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <TextInput style={styles.input} placeholder="Username" onChangeText={text => setUsername(text)} value={username} />
            <Button title="Submit" onPress={handleUsernameSubmit} disabled={loading} />
            {loading && <ActivityIndicator />}
        </View>
    );
}

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

export default UsernameForm;