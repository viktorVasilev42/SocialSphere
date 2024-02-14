import React, { useContext, useEffect, useRef } from 'react';
import { AuthContext } from './context/AuthContext';
import { ChatContext } from './context/ChatContext';
import moment from 'moment';
import {
	View,
	Text,
	Image,
	TextInput,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
} from 'react-native';
function Chat({ message }) {
	console.log(message.date);
	const ref = useRef();
	const { curruser } = useContext(AuthContext);
	const { data } = useContext(ChatContext);
	useEffect(() => {
		ref.current?.scrollIntoView({ behavior: 'smooth' });
	}, [message]);
	return (
		<View
			style={message.senderId === curruser.uid ? styles.owner : styles.chatot}
		>
			<View
				style={
					message.senderId === curruser.uid
						? styles.messageinfo
						: styles.messageinfo2
				}
			>
				<Image
					source={
						message.senderId === curruser.uid
							? curruser.photoURL
							: data.user.photoURL
					}
					style={styles.prvaslika}
				/>
				{message.text && (
					<Text
						style={
							message.senderId === curruser.uid
								? styles.messageinfotext2
								: styles.messageinfotext
						}
					>
						{message.text}
					</Text>
				)}
				{message.img && (
					<Image source={{ uri: message.img }} style={styles.novaslika} />
				)}
			</View>
			<View
				style={
					message.senderId === curruser.uid
						? styles.messagecontent2
						: styles.messagecontent
				}
			>
				<Text
					style={
						message.senderId === curruser.uid
							? styles.messagedate
							: styles.messagedate2
					}
				>
					{moment(message.date.toDate()).calendar()}
				</Text>
			</View>
		</View>
	);
}
const styles = StyleSheet.create({
	chatot: {
		flexDirection: 'column',
		marginBottom: 10,
	},
	owner: {
		flexDirection: 'column',
		marginBottom: 10,
	},
	messageinfo2: {
		flexDirection: 'row',
		gap: 10,
	},
	messageinfo: {
		flexDirection: 'row-reverse',
		gap: 10,
	},
	messageinfotext: {
		backgroundColor: '#777777',
		padding: 10,
		borderRadius: 10,
		marginBottom: 5,
		maxWidth: '30%',
		alignItems: 'flex-start',
	},
	messageinfotext2: {
		backgroundColor: '#9183ba',
		borderRadius: 10,
		padding: 10,
		maxWidth: '30%',
		textAlign: 'right',
		marginBottom: 5,
		alignItems: 'flex-end',
	},
	prvaslika: {
		width: 40,
		height: 40,
		borderRadius: 20,
		resizeMode: 'cover',
		overflow: 'hidden',
	},
	novaslika: {
		width: 100,
		height: 100,
		flexDirection: 'column',
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 10,
	},
	messagecontent: {
		alignItems: 'flex-start',
		marginBottom: 15,
	},
	messagecontent2: {
		flexDirection: 'row-reverse',
		marginBottom: 15,
	},
	messagedate: {
		marginRight: 55,
		fontSize: 10,
	},
	messagedate2: {
		marginLeft: 55,
		fontSize: 10,
	},
});
export default Chat;
