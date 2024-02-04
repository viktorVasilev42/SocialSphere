import React, { useState, useContext, useEffect } from 'react';
import {
	View,
	Text,
	Image,
	TextInput,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
} from 'react-native';
import { AuthContext } from './context/AuthContext';
import Add from './image/addAvatar.png';
import 'react-native-get-random-values';
import * as ImagePicker from 'expo-image-picker';
import Add3 from './image/Testot.png';
import {
	arrayUnion,
	doc,
	getDoc,
	onSnapshot,
	setDoc,
	Timestamp,
	updateDoc,
	arrayRemove,
	deleteDoc,
	collection,
	where,
	query,
	getDocs,
} from 'firebase/firestore';
import { db, storage } from './firebase';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { v4 as uuid } from 'uuid';
import moment from 'moment';
import { ChatContext } from './context/ChatContext';

function HomePage({ navigation }) {
	const [text, setText] = useState('');
	const [reply, setReply] = useState('');
	const [fileot, setFileot] = useState(null);
	const [novfile, setNovfile] = useState(null);
	const { curruser } = useContext(AuthContext);
	const [post, setPost] = useState([]);
	const [profilepost, setProfilepost] = useState([]);
	const [likesarray, setLikesarray] = useState([]);
	const [uniqot, setUniqot] = useState('');
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
				for (const postche of post) {
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
			const unsub = onSnapshot(doc(db, 'profilepages', curruser.uid), (doc) => {
				setProfilepost(doc.data()?.profileinfos || []);
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
			setFileot(result.assets[0].uri);
		}
	};
	const pickImage2 = async () => {
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
	const handleLikes = async (po) => {
		const postRef = doc(db, 'posts', 'homepagepostovi');
		const postRef2 = doc(db, 'profilepages', curruser.uid);
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
				let debook = likesarray.find(
					(book) => book.id === po.uid && book.uid === curruser.uid
				);
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
				let dali = false;
				let idto = '';
				const profileQuery = collection(db, 'profilepages');
				onSnapshot(profileQuery, (querySnapshot) => {
					querySnapshot.forEach(async (docsnapshot) => {
						const profileinfos = docsnapshot.data().profileinfos;
						profileinfos.map((prost) => {
							if (prost.uid === po.uid) {
								console.log('GO najde');
								dali = true;
								idto = docsnapshot.id;
								console.log(dali);
								console.log(idto);
								console.log(prost.uid);
							}
						});
					});
				});

				setTimeout(async () => {
					if (dali) {
						console.log('VLAGA');
						const postRef3 = doc(db, 'profilepages', idto);
						const docSnapshot = await getDoc(postRef3);

						if (docSnapshot.exists()) {
							console.log('VLAGA');
							const data = docSnapshot.data();
							const profileinfos = data.profileinfos;
							await updateDoc(postRef3, {
								profileinfos: profileinfos.map((propostItem) =>
									propostItem.uid === po.uid
										? {
												...propostItem,
												count:
													(propostItem.count || 0) + (debook.liked ? -1 : 1),
										  }
										: propostItem
								),
							});
						}
					}
				}, 1000);
			}
		} catch (error) {
			console.error('Error updating likes:', error);
		}
	};

	const handledelete = async (po) => {
		const postRef = doc(db, 'posts', 'homepagepostovi'); // Reference to the document containing the post collection

		const profileRef = doc(db, 'profilepages', curruser.uid); // Reference to the document containing the profileinfos collection

		let itemtoremove = null;

		try {
			// Remove the element from both collections
			await updateDoc(postRef, {
				postovi: arrayRemove(po),
			});

			profilepost
				.filter((pro) => pro.text === po.text)
				.map((pro) => (itemtoremove = pro));
			await updateDoc(profileRef, {
				profileinfos: arrayRemove(itemtoremove),
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

	const handlesubmit = async () => {
		const newUniqot = uuid();
		setUniqot(newUniqot);
		console.log('vlaga');

		if (uniqot === '') {
			setUniqot(uuid());
		}
		if (typeof uniqot === 'string' && uniqot.trim() !== '') {
		}
		if (text === '' && fileot === null) {
			return;
		}
		const res = await getDoc(doc(db, 'posts', 'homepagepostovi'));
		if (!res.exists()) {
			await setDoc(doc(db, 'posts', 'homepagepostovi'), { postovi: [] });
		}
		const res2 = await getDoc(doc(db, 'profilepages', curruser.uid));
		if (!res2.exists()) {
			await setDoc(doc(db, 'profilepages', curruser.uid), {
				profileinfos: [],
			});
		}

		if (uniqot) {
			if (fileot) {
				const storageRef = ref(storage, uuid());
				const uploadTask = uploadBytesResumable(storageRef, fileot);
				uploadTask.on(
					'state_changed',
					(snapshot) => {},
					(error) => {
						console.error('Error uploading file:', error);
					},
					async () => {
						try {
							const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
							console.log('ETE GOOOOOOOOOOOOOO');
							console.log('File uploaded. Download URL:', downloadURL);
							await updateDoc(doc(db, 'posts', 'homepagepostovi'), {
								postovi: arrayUnion({
									uid: uniqot,
									senderId: curruser.uid,
									displayName: curruser.displayName,
									text: text,
									count: 0,
									liked: false,
									dalidolenborder: false,
									img: downloadURL,
									photoURL: curruser.photoURL,
									date: Timestamp.now(),
								}),
							});
							await updateDoc(doc(db, 'profilepages', curruser.uid), {
								profileinfos: arrayUnion({
									uid: uniqot,
									senderId: curruser.uid,
									displayName: curruser.displayName,
									text: text,
									count: 0,
									liked: false,
									dalidolenborder: false,
									img: downloadURL,
									photoURL: curruser.photoURL,
									date: Timestamp.now(),
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
				await updateDoc(doc(db, 'posts', 'homepagepostovi'), {
					postovi: arrayUnion({
						uid: uniqot,
						displayName: curruser.displayName,
						senderId: curruser.uid,
						text: text,
						liked: false,
						dalidolenborder: false,
						count: 0,
						photoURL: curruser.photoURL,
						date: Timestamp.now(),
					}),
				});
				await updateDoc(doc(db, 'profilepages', curruser.uid), {
					profileinfos: arrayUnion({
						uid: uniqot,
						senderId: curruser.uid,
						displayName: curruser.displayName,
						text: text,
						dalidolenborder: false,
						liked: false,
						count: 0,
						photoURL: curruser.photoURL,
						date: Timestamp.now(),
					}),
				});
			}
			setText('');
			setFileot(null);
		}
	};
	const handleprofile = () => {
		navigation.navigate('UserProfilePages');
	};
	const handleSearch = async (po) => {
		console.log(po.displayName);
		let dali = false;
		try {
			const q = query(
				collection(db, 'users'),
				where('displayName', '==', po.displayName)
			);
			const querySnapshot = await getDocs(q);

			if (!querySnapshot.empty) {
				querySnapshot.forEach((doc) => {
					setUser(doc.data());
					console.log(user);
					dali = true;
				});

				// Reset error state if user is found
			}
		} catch (error) {
			console.error('Error during search:', error);
		}
	};

	const handlereplys = async (po) => {
		const postRef2 = doc(db, 'posts', 'homepagepostovi');
		await updateDoc(postRef2, {
			postovi: post.map((propostItem) =>
				propostItem.uid === po.uid
					? { ...propostItem, liked: true }
					: propostItem
			),
		});
	};

	const handlesend = async (po) => {
		if (!reply && !novfile) {
			const postRef = doc(db, 'posts', 'homepagepostovi');
			await updateDoc(postRef, {
				postovi: post.map((propostItem) =>
					propostItem.uid === po.uid
						? { ...propostItem, liked: false }
						: propostItem
				),
			});
			return;
		}
		const postRef2 = doc(db, 'posts', 'homepagepostovi');

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
					let dali = false;
					let idto = '';
					const profileQuery = collection(db, 'profilepages');
					onSnapshot(profileQuery, (querySnapshot) => {
						querySnapshot.forEach(async (docsnapshot) => {
							const profileinfos = docsnapshot.data().profileinfos;
							profileinfos.map((prost) => {
								if (prost.uid === po.uid) {
									console.log('GO najde');
									dali = true;
									idto = docsnapshot.id;
									console.log(dali);
									console.log(idto);
									console.log(prost.uid);
								}
							});
						});
					});

					setTimeout(async () => {
						console.log('VLAGA');
						const postRef3 = doc(db, 'profilepages', idto);
						const docSnapshot = await getDoc(postRef3);

						if (docSnapshot.exists()) {
							console.log('VLAGA');
							const data = docSnapshot.data();
							const profileinfosss = data.profileinfos;
							const updatedPostovi = profileinfosss.map((propostItem) => {
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
							await updateDoc(postRef3, { profileinfos: updatedPostovi });
						}
					}, 500);
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
							let dali = false;
							let idto = '';
							const profileQuery = collection(db, 'profilepages');
							onSnapshot(profileQuery, (querySnapshot) => {
								querySnapshot.forEach(async (docsnapshot) => {
									const profileinfos = docsnapshot.data().profileinfos;
									profileinfos.map((prost) => {
										if (prost.uid === po.uid) {
											console.log('GO najde');
											dali = true;
											idto = docsnapshot.id;
											console.log(dali);
											console.log(idto);
											console.log(prost.uid);
										}
									});
								});
							});

							setTimeout(async () => {
								console.log('VLAGA');
								const postRef3 = doc(db, 'profilepages', idto);
								const docSnapshot = await getDoc(postRef3);

								if (docSnapshot.exists()) {
									console.log('VLAGA');
									const data = docSnapshot.data();
									const profileinfosss = data.profileinfos;
									const updatedPostovi = profileinfosss.map((propostItem) => {
										if (propostItem.uid === po.uid) {
											// Initialize replyArray if it doesn't exist
											const replyArray = propostItem.replyArray || [];

											// Modify the post with the new reply
											const updatedReplyArray = [
												...replyArray,
												{
													senderId: curruser.uid,
													displayName: curruser.displayName,
													img: downloadURL,
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
									await updateDoc(postRef3, {
										profileinfos: updatedPostovi,
									});
								}
							}, 500);
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
		const postRef = doc(db, 'posts', 'homepagepostovi');
		await updateDoc(postRef, {
			postovi: post.map((propostItem) =>
				propostItem.uid === po.uid
					? { ...propostItem, liked: false }
					: propostItem
			),
		});
	};

	return (
		<ScrollView contentContainerStyle={styles.homepage}>
			<View style={styles.logoInputWrapper}>
				<Image style={styles.logoicon} source={require('./image/logo.png')} />
			</View>
			<View style={styles.borderhomepage}>
				<View style={styles.homepage2}>
					<View style={styles.spanslika}>
						<TouchableOpacity onPress={handleprofile}>
							<Image source={curruser.photoURL} style={styles.searchimg} />
						</TouchableOpacity>
						<View style={{ alignItems: 'center' }}>
							<Text style={{ fontWeight: 'bold' }}>{curruser.displayName}</Text>
						</View>
					</View>
					<TextInput
						style={styles.homepage2Input}
						placeholder="Write a post"
						onChangeText={(input) => setText(input)}
						value={text}
					/>
					<TouchableOpacity onPress={pickImage}>
						<View style={styles.add}>
							<Image
								source={require('./image/add.png')}
								style={styles.searchimg2}
							/>
						</View>
					</TouchableOpacity>
					<TouchableOpacity onPress={handlesubmit}>
						<Image
							source={require('./image/done.png')}
							style={styles.searchimg2}
						/>
					</TouchableOpacity>
				</View>
			</View>
			<ScrollView>
				{post &&
					post
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
											<Text style={{ marginBottom: 8 }}>{po.count}</Text>
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
	homepage: {
		backgroundColor: '#fff',
		flexDirection: 'column',
	},
	searchimg3: {
		width: 30,
		height: 30,
		borderRadius: 25,
		marginRight: 4,
		resizeMode: 'cover', // React Native equivalent for object-fit
	},
	borderhomepage: {
		display: 'flex', // React Native uses 'flex' instead of 'display: flex'
		marginLeft: 20,
		marginTop: 20,
		borderRadius: 20,
		flexDirection: 'column', // Flex direction is specified as a string in React Native
		backgroundColor: '#254257',
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
		textAlign: 'center',
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
		marginLeft: 10,
		marginTop: 10,
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
		justifyContent: 'flex-end',
		padding: 5, // Align items in the center vertically
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
		margin: 2,
		borderRadius: 25,
		resizeMode: 'cover', // React Native equivalent for object-fit
	},
	add: {
		height: 100,
	},
});

export default HomePage;
