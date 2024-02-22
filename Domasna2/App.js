import React, { createContext, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Register from './Register';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Login from './Login';
import HomePage from './HomePage';
import FriendsProfilePages from './FriendsProfilePages';
import { AuthProvider } from './context/AuthContext';
import { ChatContextProvider } from './context/ChatContext';
import Sidebar from './Sidebar';
import Chats from './Chats';
import Messages from './Messages';
import MapScreen from './MapScreen';
import UserProfilePage from './UserProfilePages';

export default function App() {
	const Stack = createStackNavigator();

	return (
		<AuthProvider>
			<ChatContextProvider>
				<NavigationContainer>
					<Stack.Navigator initialRouteName="Sign up">
						<Stack.Screen
							name="Sign up"
							component={Register}
							options={{ headerShown: false }}
						/>
						<Stack.Screen
							name="Login"
							component={Login}
							options={{ headerShown: false }}
						/>
						<Stack.Screen
							name="HomePage"
							component={HomePage}
							options={{ headerShown: false }}
						/>
						<Stack.Screen
							name="MapScreen"
							component={MapScreen}
							options={{ headerShown: false }}
						/>
						<Stack.Screen
							name="UserProfilePage"
							component={UserProfilePage}
							options={{ headerShown: false }}
						/>
						<Stack.Screen
							name="Sidebar"
							component={Sidebar}
							options={{ headerShown: false }}
						/>
						<Stack.Screen
							name="Chats"
							component={Chats}
							options={{ headerShown: false }}
						/>
						<Stack.Screen
							name="Messages"
							component={Messages}
							options={{ headerShown: false }}
						/>
						<Stack.Screen
							name="FriendsProfilePages"
							component={FriendsProfilePages}
							options={{ headerShown: false }}
						/>
					</Stack.Navigator>
				</NavigationContainer>
			</ChatContextProvider>
		</AuthProvider>
	);
}
