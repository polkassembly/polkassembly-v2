// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { UserProfileClientService } from '@/app/_client-services/user_profile_client_service';
import Profile from '@/app/_shared-components/Profile/Profile';
import { Metadata } from 'next';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
	const { username } = await params;
	const network = await getNetworkFromHeaders();
	const { title, description } = OPENGRAPH_METADATA;
	const image = NETWORKS_DETAILS[`${network}`].openGraphImage?.large;
	const smallImage = NETWORKS_DETAILS[`${network}`].openGraphImage?.small;

	const { data } = await UserProfileClientService.fetchPublicUserByUsername({ username });
	const userName = data?.username || username;

	return {
		title: `${title} - ${userName}'s Profile`,
		description,
		metadataBase: new URL(`https://${network}.polkassembly.io`),
		icons: [{ url: '/favicon.ico' }],
		openGraph: {
			title: `${title} - ${userName}'s Profile`,
			description,
			images: [
				{
					url: image || '',
					width: 600,
					height: 600,
					alt: `${userName}'s Profile`
				},
				{
					url: smallImage || '',
					width: 1200,
					height: 600,
					alt: `${userName}'s Profile`
				}
			],
			siteName: 'Polkassembly',
			type: 'website',
			url: `https://${network}.polkassembly.io/user/username/${username}`
		},
		twitter: {
			card: 'summary_large_image',
			title: `${title} - ${userName}'s Profile`,
			description,
			images: image ? [image] : [smallImage || ''],
			site: '@polkassembly'
		}
	};
}

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
