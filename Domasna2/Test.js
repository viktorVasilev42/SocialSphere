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
function Test({ navigation }) {
	return (
		<View
			style={{ backgroundColor: 'black', width: '100%', height: 760 }}
		></View>
	);
}

export default Test;
