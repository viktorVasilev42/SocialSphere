import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Register from './Register';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Login from './Login';
import HomePage from './HomePage';
import HomePageWithDrawer from './HomePage';
import FriendsProfilePages from './FriendsProfilePages';
import { AuthProvider } from './context/AuthContext';
import { ChatContextProvider } from './context/ChatContext';
import Sidebar from './Sidebar';
import Chats from './Chats';
import Messages from './Messages';
import MapScreen from './MapScreen';
import Test from './Test';

export default function App() {
	const Stack = createStackNavigator();

	return (
		<AuthProvider>
			<ChatContextProvider>
				<NavigationContainer>
					<Stack.Navigator initialRouteName="Sign up">
						<Stack.Screen name="Sign up" component={Register} />
						<Stack.Screen name="Login" component={Login} />
						<Stack.Screen name="HomePage" component={HomePage} />
						<Stack.Screen name="MapScreen" component={MapScreen} />
						<Stack.Screen name="Test" component={Test} />
						<Stack.Screen name="Sidebar" component={Sidebar} />
						<Stack.Screen name="Chats" component={Chats} />
						<Stack.Screen name="Messages" component={Messages} />
						<Stack.Screen
							name="FriendsProfilePages"
							component={FriendsProfilePages}
						/>
					</Stack.Navigator>
				</NavigationContainer>
			</ChatContextProvider>
		</AuthProvider>
	);
}
