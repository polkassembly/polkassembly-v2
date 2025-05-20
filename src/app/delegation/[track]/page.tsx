// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { CookieService } from '@/_shared/_services/cookie_service';
import { EPostOrigin } from '@/_shared/types';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { ClientError } from '@/app/_client-utils/clientError';
import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { redirectFromServer } from '@/app/_client-utils/redirectFromServer';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';
import { OPENGRAPH_METADATA } from '@/_shared/_constants/opengraphMetadata';
import { Metadata } from 'next';
import { getGeneratedContentMetadata } from '@/_shared/_utils/generateContentMetadata';
import DelegationTrack from './Component/DelegationTrack/DelegationTrack';

interface Props {
	params: Promise<{ track: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { track } = await params;
	const network = await getNetworkFromHeaders();
	const { title } = OPENGRAPH_METADATA;

	return getGeneratedContentMetadata({
		title: `${title} - Delegation Track`,
		description: 'Track your delegation on Polkassembly',
		network,
		url: `https://${network}.polkassembly.io/delegation/${track}`,
		imageAlt: 'Polkassembly Delegation Track'
	});
}
async function DelegationTrackPage({ params }: Props) {
	const { track } = await params;
	const user = await CookieService.getUserFromCookie();
	const network = getCurrentNetwork();

	if (!track || track === 'undefined') {
		throw new ClientError(ERROR_CODES.CLIENT_ERROR, 'Invalid track');
	}

	const trackNameSnakeCase = track.replace(/-/g, '_');
	const trackOriginEntry = Object.entries(NETWORKS_DETAILS[`${network}`].trackDetails).find(([, details]) => details?.name === trackNameSnakeCase);
	const trackOrigin = trackOriginEntry ? (trackOriginEntry[0] as EPostOrigin) : undefined;
	const trackDetails = trackOrigin ? NETWORKS_DETAILS[`${network}`].trackDetails[`${trackOrigin}`] : undefined;
	const trackId = trackDetails?.trackId;

	if (!user?.id) {
		return redirectFromServer(`/login?nextUrl=/delegation/${track}`);
	}

	if (!trackDetails || trackId === undefined) {
		throw new ClientError(ERROR_CODES.CLIENT_ERROR, 'Invalid track details');
	}

	const { data: delegateTrackResponse, error: delegateTrackError } = await NextApiClientService.getDelegateTrack({
		address: user.defaultAddress,
		trackId
	});

	if (delegateTrackError || !delegateTrackResponse) {
		throw new ClientError(ERROR_CODES.CLIENT_ERROR, delegateTrackError?.message || ERROR_MESSAGES[ERROR_CODES.CLIENT_ERROR]);
	}

	return (
		<div className='mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 p-5 sm:p-10'>
			<DelegationTrack
				trackDetails={trackDetails}
				delegateTrackResponse={delegateTrackResponse}
			/>
		</div>
	);
}

export default DelegationTrackPage;
