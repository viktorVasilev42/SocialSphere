import React, { useContext, useState } from 'react';

import { AuthContext } from './context/AuthContext';
import { ChatContext } from './context/ChatContext';
import {
	doc,
	updateDoc,
	arrayUnion,
	Timestamp,
	setDoc,
	serverTimestamp,
} from 'firebase/firestore';
import { db, storage } from './firebase';
import * as ImagePicker from 'expo-image-picker';
import { v4 as uuid } from 'uuid';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import {
	View,
	Text,
	Image,
	TextInput,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
} from 'react-native';
function Input(props) {
	const [text, setText] = useState('');
	const [imag, setImag] = useState(null);
	const { curruser } = useContext(AuthContext);
	const { data } = useContext(ChatContext);

	const handleSend = async () => {
		if (!imag && text === '') {
			return;
		}
		if (imag) {
			const storageRef = ref(storage, uuid());
			const uploadTask = uploadBytesResumable(storageRef, imag);
			uploadTask.on(
				'state_changed',
				(snapshot) => {},
				(error) => {
					console.error('Error uploading file:', error);
				},
				async () => {
					try {
						const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
						console.log('File uploaded. Download URL:', downloadURL);
						await updateDoc(doc(db, 'chats', data.chatId), {
							messages: arrayUnion({
								id: uuid(),
								senderId: curruser.uid,
								date: Timestamp.now(),
								img: downloadURL,
							}),
						});
					} catch (uploadError) {
						console.error(
							'Error during download URL or Firestore update:',
							uploadError
						);
					}
				}
			);
		} else {
			try {
				await updateDoc(doc(db, 'chats', data.chatId), {
					messages: arrayUnion({
						id: uuid(),
						text: text,
						senderId: curruser.uid,
						date: Timestamp.now(),
					}),
				});
			} catch (error) {
				console.error('Error during Firestore update:', error);
			}
		}
		await updateDoc(doc(db, 'userChats', curruser.uid), {
			[data.chatId + '.lastMessage']: {
				text,
			},
			[data.chatId + '.date']: serverTimestamp(),
		});
		await updateDoc(doc(db, 'userChats', data.user.uid), {
			[data.chatId + '.lastMessage']: {
				text,
			},
			[data.chatId + '.date']: serverTimestamp(),
		});
		setText('');
		setImag(null);
	};

	const takePicture = async () => {
		try {
			const result = await ImagePicker.launchCameraAsync();

			if (!result.cancelled) {
				const response = await fetch(result.assets[0].uri);

				if (!response.ok) {
					throw new Error('Failed to fetch image');
				}

				const blob = await response.blob();
				setImag(blob);
			}
		} catch (error) {
			console.error('Error taking picture:', error);
		}
	};
	const pickImage = async () => {
		// No permissions request is necessary for launching the image library
		try {
			let result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.All,
				allowsEditing: true,
				aspect: [4, 3],
				quality: 1,
			});

			console.log(result);

			if (!result.canceled) {
				const response = await fetch(result.assets[0].uri);

				if (!response.ok) {
					throw new Error('Failed to fetch image');
				}

				const blob = await response.blob();
				console.log('fechna');
				setImag(blob);
			}
		} catch (error) {
			console.error('Error picking image:', error);
		}
	};
	return (
		<View style={styles.inputContainer}>
			<TextInput
				style={styles.input}
				placeholder="Write a text"
				onChangeText={setText}
				value={text}
			/>
			<View style={styles.sendContainer}>
				<TouchableOpacity onPress={takePicture}>
					<Image source={require('./image/camera.png')} style={styles.icon} />
				</TouchableOpacity>
				<TouchableOpacity onPress={pickImage}>
					<Image source={require('./image/gallery.png')} style={styles.icon} />
				</TouchableOpacity>
				<TouchableOpacity onPress={handleSend}>
					<Image source={require('./image/done.png')} style={styles.icon} />
				</TouchableOpacity>
			</View>
		</View>
	);
}
const styles = StyleSheet.create({
	inputContainer: {
		height: 50,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		padding: 10,
		width: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	input: {
		borderRadius: 10,
		backgroundColor: '#254257',
		padding: 5,
		width: '67%',
	},
	sendContainer: {
		flexDirection: 'row',
		gap: -15,
		marginLeft: 10,
	},
	icon: {
		height: 35,
		width: 35,
		marginRight: 20,
	},
});
export default Input;
