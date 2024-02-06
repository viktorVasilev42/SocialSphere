import React, { useContext } from 'react';
import { ChatContext } from './context/ChatContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import Input from './Input';
import Texts from './Texts';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';
import { AuthContext } from './context/AuthContext';
import Searchbar from './Searchbar';
import {
	View,
	Text,
	Image,
	TextInput,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
} from 'react-native';
import Messages from './Messages';

function Chats({ navigation }) {
	const { data } = useContext(ChatContext);
	return (
		<View style={styles.chat}>
			<View style={styles.chatInfo}>
				<Text style={{ fontWeight: 'bold', fontSize: 18 }}>
					{data.user?.displayName}
				</Text>
				<TouchableOpacity
					onPress={() => navigation.navigate('FriendsProfilePages')}
				>
					<Image
						style={styles.searchimg}
						source={require('./image/info.png')}
					/>
				</TouchableOpacity>
			</View>
			<Texts />
			<Input />
		</View>
	);
}
const styles = StyleSheet.create({
	chat: {
		display: 'flex',
		flexDirection: 'column',
		height: '100%',
		backgroundColor: '#10c55f',
		width: '100%',
	},
	searchimg: {
		width: 35,
		height: 35,
		borderRadius: 25,
		resizeMode: 'cover',
	},
	chatInfo: {
		height: 50,
		width: '100%',
		padding: 10,
		backgroundColor: '#4be1ae',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
});
export default Chats;
