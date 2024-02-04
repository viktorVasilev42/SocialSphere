import React, { createContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [curruser, setCurruser] = useState({});

	useEffect(() => {
		const unsub = onAuthStateChanged(auth, (user) => {
			setCurruser(user);
		});

		return () => {
			unsub();
		};
	}, []);

	return (
		<AuthContext.Provider value={{ curruser }}>{children}</AuthContext.Provider>
	);
};
