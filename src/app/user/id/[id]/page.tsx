// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { UserProfileClientService } from '@/app/_client-services/user_profile_client_service';
import Profile from '@/app/_shared-components/Profile/Profile';
import { Metadata } from 'next';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { getGeneratedContentMetadata } from '@/_shared/_utils/generateContentMetadata';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
	const { id } = await params;
	const network = await getNetworkFromHeaders();
	const { title } = OPENGRAPH_METADATA;

	const { data } = await UserProfileClientService.fetchPublicUserById({ userId: Number(id) });
	const userName = data?.username || `User #${id}`;

	return getGeneratedContentMetadata({
		title: `${title} - ${userName}`,
		description: `View ${userName}'s profile, posts, and activity on Polkassembly`,
		network,
		url: `https://${network}.polkassembly.io/user/id/${id}`,
		imageAlt: `${userName}'s Profile`
	});
}

async function UserProfile({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const { data, error } = await UserProfileClientService.fetchPublicUserById({ userId: Number(id) });
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
