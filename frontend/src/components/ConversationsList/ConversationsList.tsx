import { useEffect, useState } from 'react';
import { getToken } from '../../utils/auth';
import { BackApi } from '../../api/back';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useDispatch } from 'react-redux';
import { saveNotifMessages } from '../../store/user/user-slice';
import notif from '../../assets/notifMessage.svg'
import s from './style.module.css'

interface ConversationsListProps {
	infoConv: any;
	idConv: any;
	setIdConv: any;
}

export function ConversationsList({ infoConv, idConv, setIdConv }: ConversationsListProps) {

	const selector = useSelector((store: RootState) => store.user.user);
	const dispatch = useDispatch();
	const [user, setUser] = useState<any>(null);


	async function getInfosUser() {
		const token = getToken();
		if (token) {
			const id = infoConv.user1_id === selector.id ? infoConv.user2_id : infoConv.user1_id;
			const rep = await BackApi.getUserById(id, token);
			if (rep.status === 200) {
				setUser(rep.data);
			}
		}
	}

	function getHourLastMessage() {
		const parsedDate = new Date(infoConv.last_message_timestamp);
		const hours = parsedDate.getHours();
		const minutes = parsedDate.getMinutes();
		const timeStr = `${hours}:${minutes}`;
		return timeStr;
	}

	function notification() {
		return selector.notifMessages.some((objet: any) => objet.conversation_id === infoConv.conversation_id);
	}

	function lastMessageNotification() {
		const objetsAvecId = selector.notifMessages.filter((objet: any) => objet.conversation_id === infoConv.conversation_id);

		if (objetsAvecId.length > 0) {
			return objetsAvecId[objetsAvecId.length - 1].message_content;
		}
	}

	async function handleClickConversation() {
		const token = getToken();
		if (token) {
			const rep = await BackApi.getLastMessageById(token, infoConv.conversation_id);
			infoConv.last_message_content = rep.data.message_content;
		}
		const existingMessages = selector.notifMessages;
		const updatedMessages = existingMessages.filter((objet: any) => objet.conversation_id !== infoConv.conversation_id);
		dispatch(saveNotifMessages(updatedMessages))
		setIdConv(infoConv.conversation_id);
	}

	useEffect(() => {
		getInfosUser();
		// eslint-disable-next-line
	}, [])

	if (!user) {
		return (<></>);
	}

	return (
		<div
			className={s.container}
			onClick={handleClickConversation}
			style={{
				backgroundColor: infoConv.conversation_id === idConv ? '#3d3e41' : ''
			}}
		>
			<div className={s.ctnPhoto}>
				<img className={s.image} src={`data:image/jpeg;base64,${user.mainPhoto}`} alt='userAvatar' />
			</div>
			<div className={s.ctnInfosUser}>
				<div className={s.innerContent}>
					<span className={s.firstName}>{user.firstName}</span>
				</div>
				<div className={s.innerContent}>
					{infoConv.last_message_content || notification() ?
						<span
							className={s.lastMessage}
							style={{
								fontWeight: notification() ? '700' : '300',
								fontSize: notification() ? '15px' : '13px'
							}}
						>
							{notification() ? lastMessageNotification() : infoConv.last_message_content}</span>
						:
						<span className={s.lastMessage} >
							Start the conversation :)
						</span>
					}
				</div>
			</div>
			<div className={s.ctnTime}>
				{infoConv.last_message_timestamp && <span className={s.hour}>{getHourLastMessage()}</span>}
				{notification() && <img className={s.notif} src={notif} alt='notif' />}
			</div>
		</div>
	);
}
