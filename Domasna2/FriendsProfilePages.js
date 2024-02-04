import React, { useContext, useEffect, useState } from 'react';
import Add3 from './image/Testot.png';
import { AuthContext } from './context/AuthContext';
import {
	arrayRemove,
	collection,
	deleteDoc,
	doc,
	getDoc,
	getDocs,
	onSnapshot,
	query,
	setDoc,
	Timestamp,
	updateDoc,
	where,
} from 'firebase/firestore';
import {
	View,
	Text,
	Image,
	TextInput,
	TouchableOpacity,
	ImageBackground,
	ScrollView,
	StyleSheet,
} from 'react-native';
import { db, storage } from './firebase';
import moment from 'moment/moment';
import { ChatContext } from './context/ChatContext';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { v4 as uuid } from 'uuid';

function FriendsProfilePages({ navigation }) {
	const { curruser } = useContext(AuthContext);
	const [profilepost, setProfilepost] = useState([]);
	const [likesarray, setLikesarray] = useState([]);
	const { data } = useContext(ChatContext);
	const [post, setPost] = useState([]);
	const [reply, setReply] = useState('');
	const [novfile, setNovfile] = useState(null);
	const { dispatch } = useContext(ChatContext);
	const [user, setUser] = useState(null);
	useEffect(() => {
		if (user != null) {
			dispatch({ type: 'CHANGE_USER', payload: user });
			console.log('eve go');
			navigation.navigate('FriendsProfilePages');
		}
	}, [user]);
	useEffect(() => {
		try {
			const updateLikes = async () => {
				for (const postche of profilepost) {
					try {
						const res = await getDoc(
							doc(db, 'likes', postche.uid + curruser.uid)
						);
						if (!res.exists()) {
							await setDoc(doc(db, 'likes', postche.uid + curruser.uid), {
								uid: curruser.uid,
								liked: false,
								text: postche.text,
								id: postche.uid,
							});
						}
					} catch (error) {
						console.log('Error updating likes:', error);
					}
				}
			};
			updateLikes();
		} catch (err) {
			console.log('Tuka e problemot');
		}
	}, [curruser.uid, post]);
	useEffect(() => {
		try {
			const likesCollectionRef = collection(db, 'likes');
			const unsub = onSnapshot(likesCollectionRef, (querySnapshot) => {
				const likesojArray = [];
				querySnapshot.forEach((doc) => {
					likesojArray.push(doc.data());
				});
				setLikesarray(likesojArray);
			});
			return () => {
				unsub();
			};
		} catch (err) {
			console.log('Error in useEffect:', err);
		}
	}, []);
	useEffect(() => {
		try {
			const unsub = onSnapshot(doc(db, 'posts', 'homepagepostovi'), (doc) => {
				setPost(doc.data()?.postovi || []);
			});
			return () => {
				unsub();
			};
		} catch (err) {
			console.log('Tuka e problemot');
		}
	}, []);
	useEffect(() => {
		try {
			const unsub = onSnapshot(
				doc(db, 'profilepages', data.user.uid),
				(doc) => {
					setProfilepost(doc.data()?.profileinfos || []);
				}
			);
			console.log(data.user.displayName + 'tuj');
			return () => {
				unsub();
			};
		} catch (err) {
			console.log('Tuka e problemot');
		}
	}, [data.user.uid]);
	const handledelete = async (po) => {
		const postRef = doc(db, 'posts', 'homepagepostovi'); // Reference to the document containing the post collection

		const profileRef = doc(db, 'profilepages', curruser.uid); // Reference to the document containing the profileinfos collection

		let itemtoremove = null;

		try {
			// Remove the element from both collections
			await updateDoc(profileRef, {
				profileinfos: arrayRemove(po),
			});
			post
				.filter((pro) => pro.uid === po.uid)
				.map((pro) => (itemtoremove = pro));
			await updateDoc(postRef, {
				postovi: arrayRemove(itemtoremove),
			});

			const likesCollectionRef = collection(db, 'likes');
			const q = query(likesCollectionRef, where('id', '==', po.uid));

			const querySnapshot = await getDocs(q);

			querySnapshot.forEach(async (docSnapshot) => {
				const docRef = doc(db, 'likes', docSnapshot.id);
				console.log(docSnapshot.id);
				console.log('Deleting docRef:', docRef);

				await deleteDoc(docRef);
			});

			console.log('Documents deleted successfully.');
		} catch {
			console.error('Error deleting post:');
		}
	};
	const handleLikes = async (po) => {
		const postRef = doc(db, 'posts', 'homepagepostovi');

		const postRef2 = doc(db, 'profilepages', data.user.uid);
		try {
			const docRef = doc(db, 'likes', po.uid + curruser.uid); // Replace 'uniqot' with the document ID you want to fetch
			const docSnap = await getDoc(docRef);
			if (docSnap.exists()) {
				const data = docSnap.data();
				let currentUserLikeStatus = data.liked;
				console.log('Current Like Status:', currentUserLikeStatus);
				await updateDoc(docRef, {
					liked: !currentUserLikeStatus,
				});
				currentUserLikeStatus = data.liked;
				console.log('Updated Like Status:', currentUserLikeStatus);
				console.log(likesarray);
				console.log('po.uid:', po.uid);
				let debook = likesarray.find(
					(book) => book.id === po.uid && book.uid === curruser.uid
				);
				console.log('debook:', debook);
				await updateDoc(postRef, {
					postovi: post.map((postItem) =>
						postItem.uid === po.uid
							? {
									...postItem,
									count: (postItem.count || 0) + (debook.liked ? -1 : 1),
							  }
							: postItem
					),
				});

				await updateDoc(postRef2, {
					profileinfos: profilepost.map((propostItem) =>
						propostItem.uid === po.uid
							? {
									...propostItem,
									count: (propostItem.count || 0) + (debook.liked ? -1 : 1),
							  }
							: propostItem
					),
				});
			}
		} catch (error) {
			console.error('Error updating likes:', error);
		}
	};
	const handlereplys = async (po) => {
		const postRef2 = doc(db, 'profilepages', data.user.uid);
		await updateDoc(postRef2, {
			profileinfos: profilepost.map((propostItem) =>
				propostItem.uid === po.uid
					? { ...propostItem, liked: true }
					: propostItem
			),
		});
	};

	const handlesend = async (po) => {
		if (!reply && !novfile) {
			console.log('Kurtashak');
			const postRef = doc(db, 'profilepages', data.user.uid);
			await updateDoc(postRef, {
				profileinfos: post.map((propostItem) =>
					propostItem.uid === po.uid
						? { ...propostItem, liked: false }
						: propostItem
				),
			});
			return;
		}
		const postRef2 = doc(db, 'posts', 'homepagepostovi');
		const postRef3 = doc(db, 'profilepages', data.user.uid);

		try {
			if (!novfile) {
				if (reply) {
					const postDoc = await getDoc(postRef2);
					if (postDoc.exists()) {
						const postData = postDoc.data();
						const updatedPostovi = postData.postovi.map((propostItem) => {
							if (propostItem.uid === po.uid) {
								// Initialize replyArray if it doesn't exist
								const replyArray = propostItem.replyArray || [];

								// Modify the post with the new reply
								const updatedReplyArray = [
									...replyArray,
									{
										senderId: curruser.uid,
										displayName: curruser.displayName,
										text: reply,
										photoURL: curruser.photoURL,
										date: Timestamp.now(),
									},
								];

								return {
									...propostItem,
									liked: false,
									replyArray: updatedReplyArray,
								};
							}
							return propostItem;
						});

						// Update the document with the modified postovi array
						await updateDoc(postRef2, { postovi: updatedPostovi });
					}
					const postDoc2 = await getDoc(postRef3);
					if (postDoc2.exists()) {
						const postData = postDoc2.data();
						const updatedPostovi = postData.profileinfos.map((propostItem) => {
							if (propostItem.uid === po.uid) {
								// Initialize replyArray if it doesn't exist
								const replyArray = propostItem.replyArray || [];

								// Modify the post with the new reply
								const updatedReplyArray = [
									...replyArray,
									{
										senderId: curruser.uid,
										displayName: curruser.displayName,
										text: reply,
										photoURL: curruser.photoURL,
										date: Timestamp.now(),
									},
								];

								return {
									...propostItem,
									liked: false,
									replyArray: updatedReplyArray,
								};
							}
							return propostItem;
						});

						// Update the document with the modified postovi array
						await updateDoc(postRef3, { profileinfos: updatedPostovi });
					}
					setReply('');
				}
			}
			if (novfile) {
				console.log('FILEOT@POSTOIIII');
				const storageRef = ref(storage, uuid());
				const uploadTask = uploadBytesResumable(storageRef, novfile);
				uploadTask.on(
					'state_changed',
					(snapshot) => {},
					(error) => {
						console.error('Error uploading file:', error);
					},
					async () => {
						try {
							const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
							const postDoc = await getDoc(postRef2);
							if (postDoc.exists()) {
								const postData = postDoc.data();
								const updatedPostovi = postData.postovi.map((propostItem) => {
									if (propostItem.uid === po.uid) {
										// Initialize replyArray if it doesn't exist
										const replyArray = propostItem.replyArray || [];

										// Modify the post with the new reply
										const updatedReplyArray = [
											...replyArray,
											{
												senderId: curruser.uid,
												displayName: curruser.displayName,
												text: reply,
												img: downloadURL,
												photoURL: curruser.photoURL,
												date: Timestamp.now(),
											},
										];

										return {
											...propostItem,
											liked: false,
											replyArray: updatedReplyArray,
										};
									}
									return propostItem;
								});

								// Update the document with the modified postovi array
								await updateDoc(postRef2, { postovi: updatedPostovi });
							}
							const postDoc2 = await getDoc(postRef3);
							if (postDoc2.exists()) {
								const postData = postDoc2.data();
								const updatedPostovi = postData.profileinfos.map(
									(propostItem) => {
										if (propostItem.uid === po.uid) {
											// Initialize replyArray if it doesn't exist
											const replyArray = propostItem.replyArray || [];

											// Modify the post with the new reply
											const updatedReplyArray = [
												...replyArray,
												{
													senderId: curruser.uid,
													displayName: curruser.displayName,
													text: reply,
													img: downloadURL,
													photoURL: curruser.photoURL,
													date: Timestamp.now(),
												},
											];

											return {
												...propostItem,
												liked: false,
												replyArray: updatedReplyArray,
											};
										}
										return propostItem;
									}
								);

								// Update the document with the modified postovi array
								await updateDoc(postRef3, { profileinfos: updatedPostovi });
							}
							setReply('');
							setNovfile(null);
						} catch (uploadError) {
							console.error(
								'Error during download URL or Firestore update:',
								uploadError
							);
						}
					}
				);
			}
		} catch (error) {
			console.error('Error updating postovi:', error);
		}
	};

	const handlecancel = async (po) => {
		const postRef = doc(db, 'profilepages', data.user.uid);
		await updateDoc(postRef, {
			profileinfos: profilepost.map((propostItem) =>
				propostItem.uid === po.uid
					? { ...propostItem, liked: false }
					: propostItem
			),
		});
	};
	const pickImage = async () => {
		// No permissions request is necessary for launching the image library
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.All,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 1,
		});

		console.log(result);

		if (!result.canceled) {
			setNovfile(result.assets[0].uri);
		}
	};
	const handleSearch = async (po) => {
		try {
			const q = query(
				collection(db, 'users'),
				where('displayName', '==', po.displayName)
			);
			const querySnapshot = await getDocs(q);

			if (!querySnapshot.empty) {
				querySnapshot.forEach((doc) => {
					setUser(doc.data());
				});

				// Reset error state if user is found
			}
		} catch (error) {
			console.error('Error during search:', error);
		}
	};
	return (
		<ScrollView contentContainerStyle={styles.userProfilePage}>
			<ImageBackground
				source={require('./image/cover.png')}
				style={{ flex: 1, resizeMode: 'cover' }}
			>
				<View style={styles.background}>
					<Image source={data.user.photoURL} style={styles.deProfilePhoto} />
					<Text>
						<Text style={{ fontWeight: 'bold', fontSize: 18 }}>
							{data.user.displayName}
						</Text>
					</Text>
					{data.user.uid != curruser.uid && (
						<TouchableOpacity>
							<Text
								style={{
									backgroundColor: '#afa1db',
									borderRadius: 20,
									padding: 5,
									fontSize: 10,
									shadowColor: 'black',
									shadowOffset: { width: 5, height: 8 },
									shadowOpacity: 0.9,
									shadowRadius: 3,
								}}
							>
								Message
							</Text>
						</TouchableOpacity>
					)}
				</View>
			</ImageBackground>
			<ScrollView>
				{profilepost &&
					profilepost
						.sort((b, a) => a.date - b.date)
						.map((po) => (
							<View style={styles.borderhomepage2} key={po.uid}>
								<View style={styles.postdetails}>
									<View style={styles.spanslika}>
										<TouchableOpacity onPress={() => handleSearch(po)}>
											<Image source={po.photoURL} style={styles.searchimg} />
										</TouchableOpacity>
									</View>
									<View style={styles.datenname}>
										<Text>
											<Text style={{ fontWeight: 'bold', fontSize: 16 }}>
												{po.displayName}
											</Text>
										</Text>
										<Text style={{ fontSize: 12 }}>
											{moment(po.date.toDate()).calendar()}
										</Text>
									</View>
								</View>
								<View style={styles.postcontent}>
									<Text style={{ paddingHorizontal: 3 }}>{po.text}</Text>
									{po.img && (
										<Image
											source={{ uri: po.img }}
											style={styles.postimage}
											onError={(error) => console.error('Image loading error:')}
										/>
									)}
									<View style={styles.postbutton}>
										<View style={styles.postbutton2}>
											{likesarray.some((book) => book.id === po.uid) ? (
												likesarray.find(
													(book) =>
														book.id === po.uid && book.uid === curruser.uid
												)?.liked ? (
													<TouchableOpacity onPress={() => handleLikes(po)}>
														<Image
															source={require('./image/like_kliknato.png')}
															style={styles.searchimg2}
														/>
													</TouchableOpacity>
												) : (
													<TouchableOpacity onPress={() => handleLikes(po)}>
														<Image
															source={require('./image/like.png')}
															style={styles.searchimg2}
														/>
													</TouchableOpacity>
												)
											) : (
												<TouchableOpacity onPress={() => handleLikes(po)}>
													<Image
														source={require('./image/like.png')}
														style={styles.searchimg2}
													/>
												</TouchableOpacity>
											)}
											<Text style={{ marginBottom: 5 }}>{po.count}</Text>
											{po.senderId === curruser.uid && (
												<TouchableOpacity onPress={() => handledelete(po)}>
													<Image
														source={require('./image/delete.png')}
														style={styles.searchimg2}
													/>
												</TouchableOpacity>
											)}
											<TouchableOpacity onPress={() => handlereplys(po)}>
												<Image
													source={require('./image/reply.png')}
													style={styles.searchimg2}
												/>
											</TouchableOpacity>
										</View>
										{po.liked && (
											<View style={styles.postreply}>
												<View
													style={{
														justifyContent: 'space-between',
														flexDirection: 'row',
														gap: 10,
													}}
												>
													<View style={{ flexDirection: 'row' }}>
														<Image
															source={curruser.photoURL}
															style={styles.searchimg3}
														/>
														<TextInput
															style={styles.textInput1}
															placeholder="Reply"
															onChangeText={(input) => setReply(input)}
															value={reply}
														/>
													</View>
													<View style={{ flexDirection: 'row' }}>
														<TouchableOpacity onPress={pickImage}>
															<Image
																source={require('./image/add.png')}
																style={styles.searchimg2}
															/>
														</TouchableOpacity>
														<TouchableOpacity onPress={() => handlecancel(po)}>
															<Image
																source={require('./image/cancel.png')}
																style={styles.searchimg2}
															/>
														</TouchableOpacity>
														<TouchableOpacity onPress={() => handlesend(po)}>
															<Image
																source={require('./image/done.png')}
																style={styles.searchimg2}
															/>
														</TouchableOpacity>
													</View>
												</View>
											</View>
										)}
									</View>
									{po.replyArray &&
										po.replyArray
											.sort((b, a) => a.date - b.date)
											.reverse()
											.map((rep) => (
												<View style={styles.replyot} key={rep.date.toMillis()}>
													<TouchableOpacity onPress={() => handleSearch(rep)}>
														<Image
															source={rep.photoURL}
															style={styles.searchimg2}
														/>
													</TouchableOpacity>
													<View style={styles.chatbubble}>
														<Text>
															<Text
																style={{ fontWeight: 'bold', fontSize: 12 }}
															>
																{rep.displayName}
															</Text>
														</Text>
														{rep.text && (
															<Text style={{ marginTop: 3, marginBottom: 3 }}>
																{rep.text}
															</Text>
														)}
														{rep.img && (
															<Image
																source={{ uri: rep.img }}
																style={styles.postimage2}
															/>
														)}
														<Text style={{ fontSize: 9, paddingBottom: 2 }}>
															{moment(rep.date.toDate()).calendar()}
														</Text>
													</View>
												</View>
											))}
								</View>
							</View>
						))}
			</ScrollView>
		</ScrollView>
	);
}
const styles = StyleSheet.create({
	userProfilePage: {
		backgroundColor: '#fff',
		borderBottomLeftRadius: 7,
		borderRightWidth: 1,
		borderRightColor: 'gray',
		borderTopLeftRadius: 7,
	},
	deProfilePhoto: {
		width: 150,
		height: 150,
	},
	background: {
		display: 'flex',
		width: 400,
		height: 220,
		gap: 6,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
	},
	homepage: {
		backgroundColor: '#fff',
		flexDirection: 'column',
	},
	borderhomepage: {
		display: 'flex', // React Native uses 'flex' instead of 'display: flex'
		marginLeft: 20,
		marginTop: 20,
		borderRadius: 20,
		flexDirection: 'column', // Flex direction is specified as a string in React Native
		backgroundColor: '#fff',
		width: 300,
		height: 100,
		borderWidth: 1,
		borderColor: 'gray',
	},
	homepage2: {
		display: 'flex',
		flexDirection: 'row',
		marginTop: 5,
		marginLeft: 10,
		marginRight: 10,
	},
	homepage2Input: {
		borderRadius: 10,
		backgroundColor: '#fff',
		padding: 5,
		height: 25,
		marginTop: 10,
		marginRight: 5,
		width: 140,
	},
	spanslika: {
		display: 'flex',
		flexDirection: 'column',
		marginRight: 5,
	},
	postimage: {
		width: 50,
		height: 50,
	},
	searchimg: {
		width: 50,
		height: 50,
		borderRadius: 25, // React Native uses radius, not percentage
		resizeMode: 'cover',
		// There is no 'cursor' property in React Native
	},
	borderhomepage2: {
		display: 'flex',
		marginLeft: 20,
		marginTop: 20,
		marginBottom: 20,
		borderRadius: 20,
		backgroundColor: '#254257',
		width: 305,
		flexDirection: 'column',
		maxHeight: '100%', // max-content doesn't have a direct equivalent, so using maxHeight as an approximation
	},
	count: {
		marginTop: 2,
	},
	logoInputWrapper: {
		width: 220,
		height: 100,
		justifyContent: 'center',
		alignItems: 'center',
		borderColor: '#ccc',
		marginBottom: 15,
		marginLeft: 15,
	},
	logoicon: {
		width: 220,
		height: 100,
	},
	postdetails: {
		flexDirection: 'row',
		marginTop: 10,
		marginLeft: 10,
	},
	datenname: {
		flexDirection: 'column',
		marginLeft: 5,
	},
	postcontent: {
		flexDirection: 'column',
		marginLeft: 10,
		marginTop: 10,
		marginBottom: 10,
	},
	postbutton: {
		flexDirection: 'column', // Horizontal layout
		alignItems: 'flex-end', // Align items in the center vertically
	},
	postbutton2: {
		flexDirection: 'row', // Horizontal layout
		alignItems: 'flex-end',
		justifyContent: 'flex-end', // Align items in the center vertically
		padding: 5,
		gap: 5,
	},
	postreply: {
		flexDirection: 'row',
		backgroundColor: '#38607c',
		marginTop: 10,
		justifyContent: 'center',
		alignItems: 'center',
		marginLeft: 5,
		width: 304,
		height: 50,
	},
	textInput1: {
		height: 30,
		width: 150,
		padding: 5,
		backgroundColor: '#fff',
		borderRadius: 20,
	},
	replyot: {
		display: 'flex',
		marginTop: 10,
		flexDirection: 'row',
		marginBottom: 10,
	},
	chatbubble: {
		paddingHorizontal: 10,
		backgroundColor: '#38607c',
		borderRadius: 10,
		marginBottom: 0,
		maxWidth: '60%',
		marginTop: 0,
		maxHeight: '100%', // Equivalent to max-content
		wordWrap: 'break-word',
		overflowWrap: 'break-word',
	},
	searchimg2: {
		width: 30,
		height: 30,
		borderRadius: 25,
		resizeMode: 'cover', // React Native equivalent for object-fit
	},
	searchimg3: {
		width: 30,
		height: 30,
		borderRadius: 25,
		marginRight: 4,
		resizeMode: 'cover', // React Native equivalent for object-fit
	},
	add: {
		height: 100,
	},
});

export default FriendsProfilePages;
