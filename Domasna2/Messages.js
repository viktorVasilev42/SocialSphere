import React, { useContext, useEffect, useState } from 'react';

import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { AuthContext } from './context/AuthContext';
import { NavigationContainer } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

import {
	View,
	Text,
	Image,
	TextInput,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
} from 'react-native';
import { ChatContext } from './context/ChatContext';

function Messages() {
	const navigation = useNavigation();
	const [chats, setChats] = useState([]);
	const { curruser } = useContext(AuthContext);
	const { dispatch } = useContext(ChatContext);
	useEffect(() => {
		const getChats = () => {
			const unsub = onSnapshot(doc(db, 'userChats', curruser.uid), (doc) => {
				console.log('Current data: ', doc.data());
				setChats(doc.data());
			});
			return () => {
				unsub();
			};
		};
		curruser.uid && getChats();
	}, [curruser.uid]);
	const handleselect = (u) => {
		dispatch({ type: 'CHANGE_USER', payload: u });
		navigation.navigate('Chats');
	};
	return (
		<ScrollView
			contentContainerStyle={styles.msg}
			showsVerticalScrollIndicator={false}
		>
			{chats &&
				Object.entries(chats)
					?.sort((b, a) => a[1].date - b[1].date)
					.map((chat) => (
						<TouchableOpacity
							style={styles.userchat}
							key={chat[0]}
							onPress={() => handleselect(chat[1].userInfo)}
						>
							<Image
								source={{ uri: chat[1].userInfo.photoURL }}
								style={styles.searchimg}
							/>
							<View style={styles.usechatinfo}>
								<Text style={styles.displayName}>
									{chat[1].userInfo.displayName}
								</Text>
								<Text style={{ color: '#777777' }}>
									{chat[1].lastMessage?.text}
								</Text>
							</View>
						</TouchableOpacity>
					))}
		</ScrollView>
	);
}
const styles = StyleSheet.create({
	userchat: {
		width: '100%',
		backgroundColor: '#254275',
		borderTopWidth: 1,
		borderColor: '#fff',
		padding: 5,
		height: 100,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-start',
	},
	searchimg: {
		width: 70,
		height: 70,
		borderRadius: 25,
		marginRight: 10,
		borderRadius: 60,
	},
	usechatinfo: {
		flexDirection: 'column',
		justifyContent: 'center',
	},
	displayName: {
		fontSize: 18,
		fontWeight: 'bold',
		color: 'white',
	},
});

export default Messages;
