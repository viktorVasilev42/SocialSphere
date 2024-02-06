import React, { useContext, useEffect, useState } from 'react';
import Chat from './Chat';
import { ChatContext } from './context/ChatContext';
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import {
	View,
	Text,
	Image,
	TextInput,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
	FlatList,
} from 'react-native';
import { Dimensions } from 'react-native';

function Texts(props) {
	const windowHeight = Dimensions.get('window').height;

	const dynamicHeight = windowHeight - 160;
	const [messages, setMessages] = useState([]);
	const { data } = useContext(ChatContext);
	useEffect(() => {
		try {
			const unsub = onSnapshot(doc(db, 'chats', data.chatId), (doc) => {
				doc.exists() && setMessages(doc.data().messages);
			});
			return () => {
				unsub();
			};
		} catch (err) {
			console.log('Tuka e problemot');
		}
	}, [data.chatId]);
	return (
		<FlatList
			data={messages}
			renderItem={({ item }) => <Chat message={item} />}
			keyExtractor={(item) => item.id.toString()}
			contentContainerStyle={styles.texts}
		/>
	);
}
const styles = StyleSheet.create({
	texts: {
		padding: 10,
		width: '100%',
	},
});
export default Texts;
