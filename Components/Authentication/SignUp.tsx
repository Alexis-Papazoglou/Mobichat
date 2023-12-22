import React, { useState } from 'react';
import { Text, TextInput, View, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { auth } from '../../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";
import { firestore } from '../../firebase';
import { useNavigation } from '@react-navigation/native';
import { registerIndieID } from 'native-notify';
import { pushConfig } from '../../pushconfig';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const Login: React.FC = () => {
    const navigation = useNavigation<any>();
    const [email, setEmail] = useState<string>('test@gmail.com');
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
                routes: [{ name: 'Home' }],
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
        <KeyboardAwareScrollView contentContainerStyle={styles.container} extraScrollHeight={100}>
            <TextInput style={styles.input} placeholder="Email" onChangeText={text => setEmail(text)} value={email} />
            <TextInput style={styles.input} placeholder="Password" onChangeText={text => setPassword(text)} value={password} secureTextEntry />
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.btn, {backgroundColor: 'lightblue'}]} onPress={handleLogin} disabled={loading}>
                    <Text>Log In</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btn} onPress={handleCreateAccount} disabled={loading}>
                    <Text>Create Account</Text>
                </TouchableOpacity>
            </View>
            {loading && <ActivityIndicator />}
        </KeyboardAwareScrollView>
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
        borderColor: 'grey',
        borderWidth: 1,
        marginBottom: 10,
        paddingLeft: 8,
        borderRadius: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    btn: {
        backgroundColor: '#DDDDDD',
        padding: 10,
        width: 150,
        alignItems: 'center',
        marginBottom: 10,
        borderRadius: 10,
    },
});

export default Login;