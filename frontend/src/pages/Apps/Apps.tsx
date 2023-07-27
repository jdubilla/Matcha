import { useEffect, useState } from 'react';
import { SideMenu } from '../../components/SideMenu/SideMenu';
import { Header } from '../../components/Header/Header';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { getCookieByName, getToken } from '../../utils/auth';
import { BackApi } from '../../api/back';
import s from './style.module.css'
import { useDispatch } from 'react-redux';
import { saveAvatar, saveFirstName, saveId, saveSection } from '../../store/user/user-slice';

export function Apps() {

	const navigate = useNavigate();
	const selector = useSelector((store: RootState) => store.user.user);
	const dispatch = useDispatch();

	function updateSection (newSection: string){
		dispatch(saveSection(newSection));
	};

	async function checkToken() {
		const token: string | null = getCookieByName('token');
		if (!token) {
			navigate('/signin');
		}
		else {
			const rep = await BackApi.checkToken(token);
			if (rep.status !== 200) {
				navigate('/signin');
			}
			if (selector.id === 0) {
				dispatch(saveId(rep.data.userId));
			}
		}
	}

	async function getInfoUser() {
		const token = getToken();
		if (token) {
			const response = await BackApi.getUserById(selector.id, token);
			dispatch(saveAvatar(response.data.mainPhoto));
			dispatch(saveFirstName(response.data.firstName));
		} else {
			navigate('/signin');
		}
	}

	useEffect(() => {
		checkToken();
		if (selector.id !== 0) {
			getInfoUser();
		}
		// eslint-disable-next-line
	}, [selector.section, selector.id])

	return (
		<div className={s.app}>
			<SideMenu section={selector.section} updateSection={updateSection}/>
			<div className={s.content}>
				<Header section={selector.section} />
				<Outlet />
			</div>
		</div>
	);
}
