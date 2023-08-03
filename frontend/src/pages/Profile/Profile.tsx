import { useEffect, useState } from 'react';
import { UserRelation } from '../../components/UserRelation/UserRelation';
import { InterestProfile } from '../../components/InterestProfile/InterestProfile';
import { UserDetails } from '../../components/UserDetails/UserDetails';
import { saveSection } from '../../store/user/user-slice';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useParams } from 'react-router';
import { BackApi } from '../../api/back';
import { getToken } from '../../utils/auth';
import { Api } from '../../api/api';
import chevronL from '../../assets/chevronLeft.svg'
import chevronR from '../../assets/chevronRight.svg'
import fire from '../../assets/profile/fire.svg'
import flag from '../../assets/profile/flag.svg'
import heart from '../../assets/profile/heart.svg'
import location from '../../assets/profile/location.svg'
import locationFrom from '../../assets/profile/locationFrom.svg'
import logoUser from '../../assets/profile/user.svg'
import like from '../../assets/profile/like.svg'
import s from './style.module.css'

export function Profile() {
	const { id } = useParams();
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [user, setUser] = useState<any>(null);
	const [city, setCity] = useState<any>(null);
	const [images, setImages] = useState<any>(null);
	const dispatch = useDispatch();
	const selector = useSelector((store: RootState) => store.user.user);

	const previousImage = () => {
		const newIndex = (currentImageIndex + images.length - 1) % images.length;
		setCurrentImageIndex(newIndex);
	};

	const nextImage = () => {
		const newIndex = (currentImageIndex + 1) % images.length;
		setCurrentImageIndex(newIndex);
	};

	async function getUserInfos() {
		const token = getToken();
		if (token) {
			const response = await BackApi.getUserById(Number(id), token);
			console.log(response.data);
			setUser(response.data);

			const rep = await BackApi.getPhotoById(Number(id), token);
			const photos = [rep.data.photo1, rep.data.photo2, rep.data.photo3, rep.data.photo4, rep.data.photo5];
			const nonNullPhotos = photos.filter((photo) => photo !== null);
			setImages(nonNullPhotos);

			const city = await Api.getCityByPositionGps(response.data.location);
			const cityCountry = city.data.features[0].text_fr + ', ' + city.data.features[0].language_fr
			setCity(cityCountry);
		}
	}

	function getAge() {
		const birth: any = new Date(user.birth);
		const currentDate: any = new Date();
		const differenceInMillisec = currentDate - birth;
		const age = differenceInMillisec / (1000 * 60 * 60 * 24 * 365.25);
		return Math.floor(age);
	}

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'ArrowLeft') {
			previousImage();
		} else if (event.key === 'ArrowRight') {
			nextImage();
		}
	};
	
	useEffect(() => {
		if (images) {
			const addKeyDownListener = () => {
				document.addEventListener('keydown', handleKeyDown);
			};

			const removeKeyDownListener = () => {
				document.removeEventListener('keydown', handleKeyDown);
			};

			addKeyDownListener();

			return removeKeyDownListener;
		}
		// eslint-disable-next-line
	}, [images, currentImageIndex]);

	useEffect(() => {
		if (selector.id !== 0) {
			dispatch(saveSection('Profile'));
			getUserInfos();
		}
		// eslint-disable-next-line
	}, [selector.id])

	if (selector.id === 0 || !user || !images) {
		return (<></>);
	}

	// console.log(user);
	// console.log('images', images);

	return (
		<div className={s.container}>
			<div className={s.images}>
				<div className={s.imageContainer}>
					{/* <img className={s.image} src={images[currentImageIndex]} alt="ProfileImage" /> */}
					<img className={s.image} src={`data:image/jpeg;base64,${images[currentImageIndex]}`} alt='ProfileImage' />
					<img className={s.chevronL} src={chevronL} onClick={previousImage} alt='chevronL'/>
					<img className={s.chevronR} src={chevronR} onClick={nextImage} alt='chevronR'/>
				</div>
			</div>
			<div className={s.infos}>
				<div className={s.location}>
					<img className={s.imgLocation} src={location} alt='location'/>
					{city}
				</div>
				<div className={s.userInfo}>
					<div className={s.name}>
						{user.firstName}, {getAge()}
						<img className={s.imgFlag} src={flag} alt='flag'/>
					</div>
					<div className={s.state}>
						<div className={s.dot}></div>
						Online
					</div>
				</div>
				<div className={s.relation}>
					<UserRelation text={'This user has liked you'}/>
				</div>
				<div className={s.hobbies}>
					<InterestProfile />
				</div>
				<div className={s.interests}>
					<UserDetails img={fire} info={'130'}/>
					<UserDetails img={logoUser} info={user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}/>
					<UserDetails img={heart} info={user.preference.charAt(0).toUpperCase() + user.preference.slice(1)}/>
					<UserDetails img={locationFrom} info={`${user.distance} Km from you`}/>
				</div>
				<div className={s.description}>
					<p className={s.title}>About me</p>
					<p className={s.content}>{user.description}</p>
				</div>
				<div className={s.actionButton}>
					<div className={s.button}>
						<img src={like} alt='like'/>
					</div>
				</div>
			</div>
		</div>
	);
}