import React, { useState } from 'react';
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	Image,
	StyleSheet,
	ImageBackground,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import { ScrollView } from 'react-native-gesture-handler';

function Login({ navigation }) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [err, setErr] = useState(false);

	const handlesubmit = async () => {
		try {
			await signInWithEmailAndPassword(auth, email, password);
			// If no errors, navigate to the home screen or handle success as needed
			navigation.navigate('HomePage');
		} catch (error) {
			console.error('Error signing in:', error);
			setErr(true); // Handle the error appropriately in your UI
		}
	};

	return (
		<ImageBackground
			source={require('./image/background.png')}
			style={{ flex: 1, resizeMode: 'cover', width: '100%', height: '100%' }}
		>
			<View style={styles.loginContainer}>
				<View style={styles.loginWrapper}>
					<View style={styles.logoInputWrapper}>
						<Image
							style={styles.logoicon}
							source={require('./image/logo.png')}
						/>
					</View>
					<TextInput
						style={styles.input}
						placeholder="Email"
						placeholderTextColor="#d6d6d6"
						keyboardType="email-address"
						value={email}
						onChangeText={(text) => setEmail(text)}
					/>
					<TextInput
						style={styles.input}
						placeholder="Password"
						placeholderTextColor="#d6d6d6"
						secureTextEntry
						value={password}
						onChangeText={(text) => setPassword(text)}
					/>
					<TouchableOpacity style={styles.button} onPress={handlesubmit}>
						<Text style={styles.buttonText}>Log in</Text>
					</TouchableOpacity>
					{err && <Text style={styles.errorText}>Something went wrong</Text>}
					<View style={styles.linii}>
						<View style={styles.line}></View>
						<Text style={styles.orText}> or </Text>
						<View style={styles.line}></View>
					</View>
					<TouchableOpacity
						style={styles.registerLink}
						onPress={() => navigation.navigate('Sign up')}
					>
						<Text style={styles.buttonText}>Register</Text>
					</TouchableOpacity>
				</View>
			</View>
		</ImageBackground>
	);
}

const styles = StyleSheet.create({
	loginContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
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
	loginWrapper: {
		width: '100%',
		padding: 20,
		gap: 10,
		borderRadius: 10,
		alignItems: 'center',
	},
	logoInputWrapper: {
		width: 220,
		height: 100,
		justifyContent: 'center',
		alignItems: 'center',
		borderColor: '#ccc',
		marginBottom: 15,
	},
	logoicon: {
		width: 220,
		height: 100,
	},
	logo: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#fff',
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
		borderWidth: 1,
		borderRadius: 20,
		paddingHorizontal: 10,
		marginVertical: 10,
		color: '#fff',
		backgroundColor: '#254257',
		elevation: 5, // This will add a shadow to the button in Android
		// Add shadows for iOS
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.8,
		shadowRadius: 8,
	},
	button: {
		width: 'auto',
		height: 'auto',
		backgroundColor: '#e5e5e5',
		borderWidth: 2,
		borderColor: '#254257',
		borderRadius: 20,
		justifyContent: 'center',
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
	registerLink: {
		width: 'auto',
		height: 'auto',
		backgroundColor: '#e5e5e5',
		borderRadius: 20,
		borderWidth: 2,
		borderColor: '#254257',
		justifyContent: 'center',
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
});

export default Login;
