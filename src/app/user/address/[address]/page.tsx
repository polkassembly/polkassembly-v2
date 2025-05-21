// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { getEncodedAddress } from '@/_shared/_utils/getEncodedAddress';
import { UserProfileClientService } from '@/app/_client-services/user_profile_client_service';
import { ClientError } from '@/app/_client-utils/clientError';
import Profile from '@/app/_shared-components/Profile/Profile';
import { getNetworkFromHeaders } from '@/app/api/_api-utils/getNetworkFromHeaders';

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
