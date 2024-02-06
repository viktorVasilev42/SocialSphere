import React, { useContext, useState } from 'react';
import {
	collection,
	query,
	where,
	getDocs,
	setDoc,
	doc,
	updateDoc,
	serverTimestamp,
	getDoc,
} from 'firebase/firestore';
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
import { db } from './firebase';
import { AuthContext } from './context/AuthContext';
import { ChatContext } from './context/ChatContext';

function Searchbar({ navigation }) {
	const [username, setUsername] = useState('');
	const [user, setUser] = useState(null);
	const [err, setErr] = useState(false);
	const { curruser } = useContext(AuthContext);
	const { dispatch } = useContext(ChatContext);
	const handleSearch = async () => {
		try {
			const q = query(
				collection(db, 'users'),
				where('displayName', '==', username)
			);
			const querySnapshot = await getDocs(q);

			if (!querySnapshot.empty) {
				querySnapshot.forEach((doc) => {
					setUser(doc.data());
				});

				setErr(false); // Reset error state if user is found
			} else {
				setErr(true);
			}
		} catch (error) {
			console.error('Error during search:', error);
			setErr(true);
		}
	};

	const handleKey = (e) => {
		handleSearch();
	};

	const handleSelect = async () => {
		const combinedId =
			curruser.uid > user.uid
				? curruser.uid + user.uid
				: user.uid + curruser.uid;
		try {
			const res = await getDoc(doc(db, 'chats', combinedId));
			if (!res.exists()) {
				await setDoc(doc(db, 'chats', combinedId), { messages: [] });
				await updateDoc(doc(db, 'userChats', curruser.uid), {
					[combinedId + '.userInfo']: {
						uid: user.uid,
						displayName: user.displayName,
						photoURL: user.photoURL,
					},
					[combinedId + '.date']: serverTimestamp(),
				});
				await updateDoc(doc(db, 'userChats', user.uid), {
					[combinedId + '.userInfo']: {
						uid: curruser.uid,
						displayName: curruser.displayName,
						photoURL: curruser.photoURL,
					},
					[combinedId + '.date']: serverTimestamp(),
				});
			}
		} catch (err) {}
		setUser(null);
		setUsername('');
		dispatch({ type: 'CHANGE_USER', payload: user });
	};

	return (
		<View
			style={{
				flexDirection: 'column',
				width: 'full',
				justifyContent: 'center',
			}}
		>
			<ImageBackground
				source={require('./image/cover.png')}
				style={styles.backgroundImage}
			>
				<View style={styles.searchform}>
					<TextInput
						style={styles.searchinput}
						placeholder="Find a user"
						onChangeText={(text) => setUsername(text)}
						value={username}
						placeholderTextColor="#d6d6d6"
						onSubmitEditing={handleKey}
					/>
				</View>
			</ImageBackground>
			{err && <Text style={styles.errorText}>User not found</Text>}
			{user && (
				<TouchableOpacity
					style={styles.userchat}
					onPress={() => handleSelect(user)}
				>
					<View style={styles.searchimgContainer}>
						<Image source={user.photoURL} style={styles.searchimg} />
					</View>
					<View style={styles.displayNameContainer}>
						<Text style={styles.displayName}>{user.displayName}</Text>
					</View>
				</TouchableOpacity>
			)}
		</View>
	);
}
const styles = StyleSheet.create({
	backgroundImage: {
		display: 'flex',
		flexDirection: 'column',
		resizeMode: 'cover',
		width: 'full',
		height: 85,
	},
	searchform: {
		padding: 10,
		width: 'full',
		height: 60,
		justifyContent: 'center',
		alignItems: 'center',
	},
	searchinput: {
		backgroundColor: '#254257',
		borderRadius: 10,
		fontSize: 15,
		height: 50,
		padding: 5,
		marginTop: 25,
		width: '90%',
	},
	userchat: {
		width: '100%',
		backgroundColor: '#254259',
		padding: 5,
		height: 100,
		flexDirection: 'row', // Make it a row
		alignItems: 'center', // Center items vertically
		justifyContent: 'flex-start', // Align items to the start (left side)
	},
	searchimg: {
		width: 70,
		height: 70,
		borderRadius: 25,
		marginRight: 10, // Add margin to the right of the image
	},
	displayNameContainer: {
		flexDirection: 'column', // Make it a column
		justifyContent: 'center', // Center items vertically
	},
	displayName: {
		fontSize: 18,
		fontWeight: 'bold',
		color: 'white', // Optional: Set text color
	},
});
export default Searchbar;
