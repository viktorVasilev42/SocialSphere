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
	ImageBackground,
} from 'react-native';
import Messages from './Messages';

function Chats({ navigation }) {
	const { data } = useContext(ChatContext);
	return (
		<ImageBackground
			source={require('./image/background.png')}
			style={{ flex: 1, resizeMode: 'cover', width: '100%', height: '100%' }}
		>
			<View style={styles.chat}>
				<View style={styles.chatInfo}>
					<Text style={{ fontWeight: 'bold', fontSize: 18, marginTop: 30 }}>
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
		</ImageBackground>
	);
}
const styles = StyleSheet.create({
	chat: {
		display: 'flex',
		flexDirection: 'column',
		height: '100%',
		width: '100%',
	},
	searchimg: {
		width: 35,
		height: 35,
		borderRadius: 25,
		marginTop: 30,
		resizeMode: 'cover',
	},
	chatInfo: {
		height: 80,
		width: '100%',
		padding: 10,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
});
export default Chats;
