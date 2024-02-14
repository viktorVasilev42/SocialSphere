import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
const firebaseConfig = {
	apiKey: 'AIzaSyBxN_mGpvPgY6taaSzDaK5FnGEAbPNGEmI',
	authDomain: 'labmis-1c6c2.firebaseapp.com',
	projectId: 'labmis-1c6c2',
	storageBucket: 'labmis-1c6c2.appspot.com',
	messagingSenderId: '481878077751',
	appId: '1:481878077751:web:661f45bd58d78ef164aab2',
};
// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
	persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const storage = getStorage();
export const db = getFirestore();
