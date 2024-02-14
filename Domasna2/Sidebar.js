import React, { useContext } from 'react';
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
function Sidebar({ navigation }) {
	const { curruser } = useContext(AuthContext);
	const handlesubmit = () => {
		navigation.navigate('UserProfilePages');
	};
	return (
		<View style={styles.sidebar}>
			<Searchbar />
			<Messages />
		</View>
	);
}
const styles = StyleSheet.create({
	sidebar: {
		flex: 1,
		flexDirection: 'column',
		backgroundColor: '#254257',
		height: '100%',
	},
});
export default Sidebar;
