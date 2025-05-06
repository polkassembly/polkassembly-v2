// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import UserIcon from '@assets/profile/user-icon.svg';
import Image from 'next/image';
import Address from '@ui/Profile/Address/Address';
import { useUser } from '@/hooks/useUser';
import SocialLinks from '@/app/_shared-components/Profile/Address/SocialLinks';
import DelegationPopupCard from '../DelegationPopupCard/DelegationPopupCard';
import MyDelegateTracks from '../MyDelegateTracks/MyDelegateTracks';
import styles from './MyDelegation.module.scss';
import BecomeDelegateDialog from '../BecomeDelegateDialog/BecomeDelegateDialog';

function MyDelegation() {
	const { user } = useUser();

	if (!user) {
		return null;
	}

	const profileImage = user.publicUser?.profileDetails?.image || UserIcon;
	const socialLinks = user.publicUser?.profileDetails?.publicSocialLinks || [];

	return (
		<div>
			<DelegationPopupCard />
			<div className={styles.myDelegationContainer}>
				<Image
					src={profileImage}
					alt='user icon'
					className='h-20 w-20 rounded-full'
					width={100}
					height={100}
				/>
				<div className={styles.myDelegationContainerDiv}>
					<div className='flex flex-col gap-2'>
						<Address
							address={user.defaultAddress}
							walletAddressName={user?.username}
						/>
						<SocialLinks socialLinks={socialLinks} />
					</div>
					<div className={styles.myDelegationContainerButton}>
						<BecomeDelegateDialog />
					</div>
				</div>
			</div>
			<MyDelegateTracks />
		</div>
	);
}

export default MyDelegation;
