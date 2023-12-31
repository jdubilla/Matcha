import { ButtonSideMenu } from '../ButtonSideMenu/ButtonSideMenu';
import logo from '../../assets/flirtopia.png'
import search from '../../assets/sideMenu/search.svg'
import chat from '../../assets/sideMenu/chat.svg'
import profile from '../../assets/sideMenu/profile.svg'
import like from '../../assets/sideMenu/like.svg'
import history from '../../assets/sideMenu/history.svg'
import settings from '../../assets/sideMenu/settings.svg'
import logout from '../../assets/sideMenu/logout.svg'
import s from './style.module.css'
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface SideMenuProps {
	section: any;
	updateSection: any;
}

export function SideMenu({ section, updateSection }: SideMenuProps) {

	const selector = useSelector((store: RootState) => store.user.user);

	return (
		<aside className={s.sideMenu}>
			<div className={s.topMenu}>
				<div className={s.nameSite}>
					<img className={s.logo} src={logo} alt='logo' />
					<span className={s.flirtopia}><span className={s.pink}>Flirt</span>opia</span>
				</div>
				<div className={s.navButtons}>
					<ButtonSideMenu section={section} updateSection={updateSection} name='Search' logo={search} />
					<ButtonSideMenu section={section} updateSection={updateSection} name='Chat' logo={chat} notification={selector.notifMessages.length} />
					<ButtonSideMenu section={section} updateSection={updateSection} name='Profile' logo={profile} />
					<ButtonSideMenu section={section} updateSection={updateSection} name='Likes' logo={like} />
					<ButtonSideMenu section={section} updateSection={updateSection} name='History' logo={history} />
				</div>
			</div>
			<div className={s.endNavButtons}>
				<ButtonSideMenu section={section} updateSection={updateSection} name='Settings' logo={settings} />
				<ButtonSideMenu section={section} updateSection={updateSection} name='Logout' logo={logout} />
			</div>
		</aside>
	);
}