// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { UserProfileClientService } from '@/app/_client-services/user_profile_client_service';
import Profile from '@/app/_shared-components/Profile/Profile';

async function UserProfile({ params }: { params: Promise<{ username: string }> }) {
	const { username } = await params;
	const { data, error } = await UserProfileClientService.fetchPublicUserByUsername({ username });
	if (!data || error) {
		return <div>User not found</div>;
	}
	return (
		<div className='mx-auto h-full w-full max-w-7xl'>
			<Profile profileData={data} />
		</div>
	);
}

export default UserProfile;
