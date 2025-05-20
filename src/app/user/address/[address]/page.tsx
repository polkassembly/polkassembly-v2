// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { getEncodedAddress } from '@/_shared/_utils/getEncodedAddress';
import { UserProfileClientService } from '@/app/_client-services/user_profile_client_service';
import { ClientError } from '@/app/_client-utils/clientError';
import Profile from '@/app/_shared-components/Profile/Profile';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ address: string }> }): Promise<Metadata> {
	const { address } = await params;
	const network = await getNetworkFromHeaders();
	const { title, description } = OPENGRAPH_METADATA;
	const image = NETWORKS_DETAILS[`${network}`].openGraphImage?.large;
	const smallImage = NETWORKS_DETAILS[`${network}`].openGraphImage?.small;

	return {
		title: `${title} - ${address}`,
		description,
		metadataBase: new URL(`https://${network}.polkassembly.io`),
		icons: [{ url: '/favicon.ico' }],
		openGraph: {
			title: `${title} - ${address}`,
			description,
			images: [
				{
					url: image || '',
					width: 600,
					height: 600,
					alt: 'Polkassembly User Profile'
				},
				{
					url: smallImage || '',
					width: 1200,
					height: 600,
					alt: 'Polkassembly User Profile'
				}
			],
			siteName: 'Polkassembly',
			type: 'website',
			url: `https://${network}.polkassembly.io/user/address/${address}`
		},
		twitter: {
			card: 'summary_large_image',
			title: `${title} - ${address}`,
			description,
			images: image ? [image] : [smallImage || ''],
			site: '@polkassembly'
		}
	};
}

async function UserProfile({ params }: { params: Promise<{ address: string }> }) {
	const { address } = await params;

	const network = await getNetworkFromHeaders();

	let encodedAddress = null;

	try {
		encodedAddress = getEncodedAddress(address, network);
	} catch {
		// do nothing
	}

	if (!encodedAddress || !ValidatorService.isValidWeb3Address(encodedAddress)) {
		throw new ClientError(ERROR_CODES.BAD_REQUEST, 'Invalid address in URL');
	}

	const { data } = await UserProfileClientService.fetchPublicUserByAddress({ address });

	return (
		<div className='mx-auto h-full w-full max-w-7xl'>
			<Profile
				address={encodedAddress}
				profileData={data || undefined}
			/>
		</div>
	);
}

export default UserProfile;
