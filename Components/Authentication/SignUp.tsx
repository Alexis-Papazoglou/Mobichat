import React, { useState } from 'react';
import { Button, TextInput, View, ActivityIndicator, StyleSheet } from 'react-native';
import { auth } from '../../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { collection, doc , setDoc} from "firebase/firestore";
import { firestore } from '../../firebase';
import { useNavigation } from '@react-navigation/native';
import { registerIndieID } from 'native-notify';
import { pushConfig } from '../../pushconfig';

const Login: React.FC= () => {
    const navigation = useNavigation<any>();
    const [email, setEmail] = useState<string>('admin@gmail.com');
    const [password, setPassword] = useState<string>('testtest');
    const [loading, setLoading] = useState<boolean>(false);

    const handleLogin = async () => {
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);

            // Register the user's device to push notification service
            registerIndieID(auth.currentUser?.uid, pushConfig.APP_ID, pushConfig.APP_TOKEN);

            navigation.reset({
                index: 0,
                routes: [{ name: 'HomePage' }],
            });
        } catch (error) {
            alert(error);
        }
        setLoading(false);
    };

    const handleCreateAccount = async () => {
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            if (user) {
                await setDoc(doc(collection(firestore, "users"), user.uid), {
                    id: user.uid,
                    email: user.email,
                });
                console.log("Document written with ID: ", user.uid);
                
                // Register the user's device to push notification service
                registerIndieID(user.uid, pushConfig.APP_ID, pushConfig.APP_TOKEN);
                
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'UsernameForm' }],
                });
            }
        } catch (error) {
            alert(error);
        }
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <TextInput style={styles.input} placeholder="Email" onChangeText={text => setEmail(text)} value={email} />
            <TextInput style={styles.input} placeholder="Password" onChangeText={text => setPassword(text)} value={password} secureTextEntry />
            <Button title="Login" onPress={handleLogin} disabled={loading} />
            <Button title="Create Account" onPress={handleCreateAccount} disabled={loading} />
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

export default Login;