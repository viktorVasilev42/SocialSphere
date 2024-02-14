import React, { useState, useContext, useEffect } from 'react';
import {
	View,
	Text,
	Image,
	TextInput,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
	Touchable,
	Dimensions,
	ImageBackground,
} from 'react-native';
import Sidebar from './Sidebar';
import { AuthContext } from './context/AuthContext';
import { NavigationContainer } from '@react-navigation/native';
import 'react-native-get-random-values';
import {
	createDrawerNavigator,
	DrawerContentScrollView,
	DrawerItemList,
} from '@react-navigation/drawer';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
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
	const [uploading, setUploading] = useState(false);
	const [post, setPost] = useState([]);
	const [profilepost, setProfilepost] = useState([]);
	const [likesarray, setLikesarray] = useState([]);
	const [uniqot, setUniqot] = useState('');
	const { dispatch } = useContext(ChatContext);
	const [user, setUser] = useState(null);
	const Drawer = createDrawerNavigator();
	const [chats, setChats] = useState([]);
	useEffect(() => {
		const getChats = () => {
			const unsub = onSnapshot(doc(db, 'userChats', curruser.uid), (doc) => {
				console.log('Current data: ', doc.data());
				setChats(doc.data());
			});
			return () => {
				unsub();
			};
		};
		curruser.uid && getChats();
	}, [curruser.uid]);

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
	useEffect(() => {
		console.log(height);
	}, []);
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
				setFileot(blob);
			}
		} catch (error) {
			console.error('Error picking image:', error);
		}
	};
	const pickImage2 = async () => {
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
				setNovfile(blob);
			}
		} catch (error) {
			console.error('Error picking image:', error);
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
		navigation.navigate('UserProfilePage');
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
	const handlemessages = (u) => {
		dispatch({ type: 'CHANGE_USER', payload: u });
		navigation.navigate('Chats');
	};
	return (
		<ImageBackground
			source={require('./image/background.png')}
			style={{ flex: 1, resizeMode: 'cover', width: '100%', height: '100%' }}
		>
			<View style={{ flexDirection: 'row', height: '100%' }}>
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.homepage}
				>
					<View style={styles.logoInputWrapper}>
						<Image
							style={styles.logoicon}
							source={require('./image/logo.png')}
						/>
					</View>
					<View style={styles.borderhomepage}>
						<View style={styles.homepage2}>
							<View style={styles.spanslika}>
								<TouchableOpacity onPress={handleprofile}>
									<Image
										source={{ uri: curruser.photoURL }}
										style={styles.searchimg}
									/>
								</TouchableOpacity>
								<View style={{ alignItems: 'center' }}>
									<Text style={{ fontWeight: 'bold' }}>
										{curruser.displayName}
									</Text>
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
					<View>
						{post &&
							post
								.sort((b, a) => a.date - b.date)
								.map((po) => (
									<View style={styles.borderhomepage2} key={po.uid}>
										<View style={styles.postdetails}>
											<View style={styles.spanslika}>
												<TouchableOpacity onPress={() => handleSearch(po)}>
													<Image
														source={{ uri: po.photoURL }}
														style={styles.searchimg}
													/>
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
																	source={{ uri: curruser.photoURL }}
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
																<TouchableOpacity onPress={pickImage2}>
																	<Image
																		source={require('./image/add.png')}
																		style={styles.searchimg2}
																	/>
																</TouchableOpacity>
																<TouchableOpacity
																	onPress={() => handlecancel(po)}
																>
																	<Image
																		source={require('./image/cancel.png')}
																		style={styles.searchimg2}
																	/>
																</TouchableOpacity>
																<TouchableOpacity
																	onPress={() => handlesend(po)}
																>
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
														<View
															style={styles.replyot}
															key={rep.date.toMillis()}
														>
															<TouchableOpacity
																onPress={() => handleSearch(rep)}
															>
																<Image
																	source={{ uri: rep.photoURL }}
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
																	<Text
																		style={{ marginTop: 3, marginBottom: 3 }}
																	>
																		{rep.text}
																	</Text>
																)}
																{rep.img && (
																	<Image
																		source={{ uri: rep.img }}
																		style={{
																			width: 65,
																			height: 50,
																			borderRadius: 10,
																		}}
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
					</View>
				</ScrollView>
				<View
					style={{
						flex: width > 400 ? 1 : 2,
						height: '100%',
						backgroundColor: '#254257',
						alignItems: 'center',
						flexDirection: 'column',
						gap: 15,
					}}
				>
					<TouchableOpacity
						onPress={() => navigation.navigate('Sidebar')}
						style={{
							width: 'full',
							height: 'full',
							backgroundColor: '#254257',
							marginTop: 40,
							borderRadius: 10,
						}}
					>
						<Image
							source={require('./image/messages.png')}
							style={styles.messagesicon}
						/>
					</TouchableOpacity>
					<View
						style={{
							flexDirection: 'column',
							justifyContent: 'center',
							alignItems: 'center',
							width: '100%',
							gap: 20,
						}}
					>
						{chats &&
							Object.entries(chats)
								?.sort((b, a) => a[1].date - b[1].date)
								.map((chat) => (
									<TouchableOpacity
										style={styles.userchat}
										key={chat[0]}
										onPress={() => handlemessages(chat[1].userInfo)}
									>
										<Image
											source={{ uri: chat[1].userInfo.photoURL }}
											style={styles.icons}
										/>
									</TouchableOpacity>
								))}
					</View>
					<View
						style={{
							flex: 1,
							flexDirection: 'column',
							gap: 2,
							justifyContent: 'flex-end',
							marginBottom: 10,
						}}
					>
						<TouchableOpacity
							style={{
								width: 'full',
								height: 'full',
								borderRadius: 10,
							}}
							onPress={() => navigation.navigate('MapScreen')}
						>
							<Image
								source={require('./image/maps.png')}
								style={styles.icons}
							/>
						</TouchableOpacity>
						<TouchableOpacity
							style={{}}
							onPress={() => navigation.navigate('Login')}
						>
							<Image
								source={require('./image/log out.png')}
								style={styles.icons}
							/>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</ImageBackground>
	);
}
const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
	homepage: {
		flexDirection: 'column',
		height: 'full',
		marginTop: 40,
	},
	searchimg3: {
		width: 30,
		height: 30,
		borderRadius: 25,
		marginRight: 4,
		resizeMode: 'cover',
	},
	icons: {
		width: 35,
		height: 35,
		borderRadius: 25,
		resizeMode: 'cover',
	},
	borderhomepage: {
		display: 'flex',
		marginLeft: 20,
		marginTop: 20,
		borderRadius: 20,
		flexDirection: 'column',
		backgroundColor: '#254257',
		width: 300,
		height: 100,
		borderWidth: 1,
		borderColor: '#fff',
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
		width: 175,
		height: 135,
		marginLeft: 10,
		borderRadius: 10,
	},
	searchimg: {
		width: 50,
		height: 50,
		borderRadius: 25,
		resizeMode: 'cover',
	},
	searchimg: {
		width: 50,
		height: 50,
		borderRadius: 25,
		resizeMode: 'cover',
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
		height: 'full',
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
		marginTop: 25,
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
		maxHeight: '100%',
		marginTop: 10,
		marginBottom: 10,
	},
	postbutton: {
		flexDirection: 'column',
		alignItems: 'flex-end',
	},
	postbutton2: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		justifyContent: 'flex-end',
		padding: 5,
		gap: 5,
	},
	postreply: {
		flexDirection: 'row',
		backgroundColor: '#38607c',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 10,
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
		gap: 3,
	},
	chatbubble: {
		paddingHorizontal: 10,
		backgroundColor: '#38607c',
		borderRadius: 10,
		marginBottom: 0,
		maxWidth: '60%',
		marginTop: 0,
		maxHeight: '100%',
		wordWrap: 'break-word',
		overflowWrap: 'break-word',
	},
	searchimg2: {
		width: 30,
		height: 30,
		margin: 2,
		borderRadius: 25,
		resizeMode: 'cover',
	},
	messagesicon: {
		width: 50,
		height: 50,
		margin: 2,
		borderRadius: 25,
		resizeMode: 'cover',
	},
	add: {
		height: 100,
	},
});

export default HomePage;
