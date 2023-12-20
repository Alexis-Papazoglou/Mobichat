import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import SignUp from './Components/Authentication/SignUp';
import HomePage from './Components/Homepage';
import UsernameForm from './Components/Authentication/UsernameForm';
import ChatWindow from './Components/ChatWindow';

export type RootStackParamList = {
  SignUp: undefined;
  UsernameForm: undefined;
  HomePage: undefined;
  ChatWindow: { chatId: string };
};

const Stack = createStackNavigator<RootStackParamList>(); 

export default function App() {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer>
        <Stack.Navigator initialRouteName="SignUp">
          <Stack.Screen name="SignUp" component={SignUp}/>
          <Stack.Screen name="UsernameForm" component={UsernameForm} />
          <Stack.Screen name="HomePage" component={HomePage} />
          <Stack.Screen name="ChatWindow" component={ChatWindow} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}