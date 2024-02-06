import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	Image,
	ImageBackground,
	Picker,
} from 'react-native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, storage, db } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, collection } from 'firebase/firestore';
import Add3 from './image/Testot.png';
import Add5 from './image/Sina.png';
import * as ImagePicker from 'expo-image-picker';
import { ScrollView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';

function Register({ navigation }) {
	const [displayName, setDisplayName] = useState('');
	const [displaySurrName, setDisplaySurrName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [gender, setGender] = useState('male'); // Assuming a default value
	const [file, setFile] = useState(null);
	const [err, setErr] = useState(false);
	const [dali, setDali] = useState(false);

	const [loaded] = useFonts({
		InnerBeauty: require('./assets/fonts/InnerBeauty-nRKaV.ttf'),
	});

	if (!loaded) {
		// Font is still loading, you can return a loading indicator or null
		return null;
	}

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
				setFile(blob);
			}
		} catch (error) {
			console.error('Error picking image:', error);
		}
	};

	const handlesubmit = async () => {
		try {
			const res = await createUserWithEmailAndPassword(auth, email, password);

			const storageRef = ref(storage, displayName);

			if (file) {
				setDali(true);
				const uploadTask = uploadBytesResumable(storageRef, file);
				uploadTask.on(
					'state_changed',
					(snapshot) => {},
					(error) => {
						console.error('Error uploading file:', error);
						setErr(true);
					},
					async () => {
						try {
							const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
							const defaultPhotoURL = downloadURL;
							const profileData = {
								displayName,
								photoURL: defaultPhotoURL,
							};

							await updateProfile(res.user, profileData);
							await setDoc(doc(db, 'users', res.user.uid), {
								uid: res.user.uid,
								displayName,
								displaySurrName,
								email,
								daliuri: dali,
								photoURL: profileData.photoURL,
							});

							await setDoc(doc(db, 'userChats', res.user.uid), {});
							// Adjust this navigation based on your React Navigation setup
							console.log('User profile and data updated successfully.');
							setErr(false);
						} catch (uploadError) {
							console.error(
								'Error during download URL or Firestore update:',
								uploadError
							);
							setErr(true);
						}
					}
				);
			} else {
				const profileData = {
					displayName,
				};
				const defaultPhotoURL = gender === 'male' ? Add3 : Add5;
				profileData.photoURL = defaultPhotoURL;
				console.log('Profile Data:', profileData);
				await updateProfile(res.user, profileData);
				await new Promise((resolve) => setTimeout(resolve, 1000));
				const updatedUser = auth.currentUser;
				await setDoc(doc(db, 'users', res.user.uid), {
					uid: res.user.uid,
					displayName,
					displaySurrName,
					email,
					daliuri: dali,
					photoURL: updatedUser.photoURL || profileData.photoURL,
				});

				await setDoc(doc(db, 'userChats', res.user.uid), {});
				// navigation.navigate('Home'); // Adjust this navigation based on your React Navigation setup
				console.log('User profile and data updated successfully.');
				setErr(false);
			}
			setFile(null);
		} catch (authError) {
			console.error('Error creating user:', authError);
			setErr(true);
		}
		setDali(false);
		navigation.navigate('HomePage');
	};

	return (
		<ImageBackground
			source={require('./image/background.png')}
			style={{ flex: 1, resizeMode: 'cover', width: '100%', height: '100%' }}
		>
			<View style={styles.container}>
				<ScrollView
					contentContainerStyle={styles.formWrapper}
					showsVerticalScrollIndicator={false}
				>
					<View style={styles.logoInputWrapper}>
						<Image
							style={styles.logoicon}
							source={require('./image/logo.png')}
						/>
					</View>
					<View style={styles.pomosen}>
						<View style={styles.fileInputWrapper}>
							<TouchableOpacity
								style={styles.fileInputWrapper}
								onPress={pickImage}
							>
								<Image
									style={styles.fileInputIcon}
									source={require('./image/photo_icon.png')}
								/>
							</TouchableOpacity>
						</View>

						<View style={styles.pomosen1}>
							<TextInput
								style={styles.input1}
								placeholder="Name"
								placeholderTextColor="#d6d6d6"
								value={displayName}
								onChangeText={(text) => setDisplayName(text)}
							/>
							<TextInput
								style={styles.input1}
								placeholder="Surname"
								placeholderTextColor="#d6d6d6"
								value={displaySurrName}
								onChangeText={(text) => setDisplaySurrName(text)}
							/>
						</View>
					</View>
					<TextInput
						style={styles.input}
						placeholder="email"
						placeholderTextColor="#d6d6d6"
						value={email}
						onChangeText={(text) => setEmail(text)}
					/>
					<TextInput
						style={styles.input}
						placeholder="password"
						placeholderTextColor="#d6d6d6"
						secureTextEntry
						value={password}
						onChangeText={(text) => setPassword(text)}
					/>
					<TextInput
						style={styles.input}
						placeholder="gender"
						value={gender}
						onChangeText={(text) => setGender(text)}
					/>

					<TouchableOpacity style={styles.button} onPress={handlesubmit}>
						<Text style={styles.buttonText}>Save</Text>
					</TouchableOpacity>
					{err && <Text style={styles.errorText}>Something went wrong</Text>}
					<View style={styles.linii}>
						<View style={styles.line}></View>
						<Text style={styles.orText}> or </Text>
						<View style={styles.line}></View>
					</View>
					<TouchableOpacity
						style={styles.loginLink}
						onPress={() => navigation.navigate('Login')}
					>
						<Text style={styles.buttonText}>Login</Text>
					</TouchableOpacity>
				</ScrollView>
			</View>
		</ImageBackground>
	);
}

const styles = {
	formWrapper: {
		width: '100%',
		padding: 20,
		gap: 10,
		borderRadius: 10,
		fontFamily: 'InnerBeauty',
		alignItems: 'center',
	},
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	pomosen: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 20,
		width: '90%',
	},
	pomosen1: {
		flexDirection: 'column',
		width: '75%',
	},
	linii: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 10,
	},
	line: {
		flex: 1,
		height: 1,
		backgroundColor: 'black',
	},
	orText: {
		paddingHorizontal: 10,
	},
	logo: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#254257',
		marginBottom: 20,
	},
	register: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#254257',
		marginBottom: 20,
	},
	input: {
		width: 310,
		height: 40,
		borderColor: '#fff',
		borderRadius: 20,
		paddingHorizontal: 10,
		elevation: 5, // This will add a shadow to the button in Android
		// Add shadows for iOS
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.8,
		shadowRadius: 8,
		marginVertical: 10,
		color: '#ffff',
		backgroundColor: '#254257',
	},
	input1: {
		width: 215,
		height: 40,
		borderColor: '#fff',
		borderRadius: 20,
		paddingHorizontal: 10,
		marginVertical: 10,
		elevation: 5, // This will add a shadow to the button in Android
		// Add shadows for iOS
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.8,
		shadowRadius: 8,
		color: '#fff',
		backgroundColor: '#254257',
	},
	fileInputWrapper: {
		width: 100,
		height: 100,
		borderColor: '#ccc',
	},
	logoInputWrapper: {
		width: 220,
		height: 100,
		justifyContent: 'center',
		alignItems: 'center',
		borderColor: '#ccc',
		marginBottom: 15,
	},
	fileInputIcon: {
		width: 100,
		height: 100,
	},
	logoicon: {
		width: 220,
		height: 100,
	},
	button: {
		width: 'auto',
		height: 'auto',
		backgroundColor: '#e5e5e5',
		borderRadius: 20,
		justifyContent: 'center',
		borderWidth: 2,
		borderColor: '#254257',
		alignItems: 'center',
		padding: 10,
		marginVertical: 10,
		elevation: 5, // This will add a shadow to the button in Android
		// Add shadows for iOS
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.8,
		shadowRadius: 8,
	},
	buttonText: {
		fontSize: 16,
		color: '#254257',
		fontWeight: 'bold',
	},
	errorText: {
		color: 'red',
		marginTop: 10,
	},
	loginLink: {
		width: 'auto',
		height: 'auto',
		backgroundColor: '#e5e5e5',
		borderRadius: 20,
		justifyContent: 'center',
		borderWidth: 2,
		borderColor: '#254257',
		alignItems: 'center',
		padding: 10,
		marginVertical: 10,
		elevation: 5, // This will add a shadow to the button in Android
		// Add shadows for iOS
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.8,
		shadowRadius: 8,
	},
};

export default Register;
