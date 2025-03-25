// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Image from 'next/image';
import { memo } from 'react';
import ProfileAvatar from '@assets/profile/user-icon.svg';
import classes from './AddressInline/AddressInline.module.scss';

function ProfileImage({ imageUrl }: { imageUrl?: string }) {
	return (
		<div className={classes.profileImageContainer}>
			<Image
				src={imageUrl || ProfileAvatar}
				alt='User'
				className={classes.profileImage}
				width={98}
				height={98}
				priority
			/>
		</div>
	);
}

export default memo(ProfileImage);
