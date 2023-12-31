import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import SignUp from './Components/Authentication/SignUp';
import HomePage from './Components/Homepage';
import UsernameForm from './Components/Authentication/UsernameForm';
import ChatWindow from './Components/ChatWindow';
import registerNNPushToken from 'native-notify';
import { pushConfig } from './pushconfig';

export type RootStackParamList = {
  SignUp: undefined;
  UsernameForm: undefined;
  Home: undefined;
  ChatWindow: { chatId: string; otherUsername: string }; // Add otherUsername to the params
};

export type user = {
  username: string;
  id: string;
  email: string;
  profilePicture: string;
};

const Stack = createStackNavigator<RootStackParamList>(); 

export default function App() {
  registerNNPushToken(pushConfig.APP_ID, pushConfig.APP_TOKEN);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="SignUp">
          <Stack.Screen name="SignUp" component={SignUp}/>
          <Stack.Screen name="UsernameForm" component={UsernameForm} />
          <Stack.Screen name="Home" component={HomePage} />
          <Stack.Screen 
            name="ChatWindow" 
            component={ChatWindow} 
            options={({ route }) => ({ title: route.params.otherUsername })} // Set the title to the other user's username
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}