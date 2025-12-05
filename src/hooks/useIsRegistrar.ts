// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useQuery } from '@tanstack/react-query';
import { getEncodedAddress } from '@/_shared/_utils/getEncodedAddress';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { STALE_TIME } from '@/_shared/_constants/listingLimit';
import { useIdentityService } from './useIdentityService';
import { useUser } from './useUser';

export function useIsRegistrar() {
	const { identityService } = useIdentityService();
	const { user } = useUser();
	const network = getCurrentNetwork();

	return useQuery({
		queryKey: ['is-registrar', user?.defaultAddress, network],
		queryFn: async () => {
			if (!user?.defaultAddress || !identityService) return false;

			const registrars = await identityService.getRegistrars();
			const encodedUserAddress = getEncodedAddress(user.defaultAddress, network);

			return registrars.some((reg) => {
				const encodedRegAddress = getEncodedAddress(reg.account, network);
				return encodedRegAddress === encodedUserAddress;
			});
		},
		enabled: !!user?.defaultAddress && !!identityService,
		staleTime: STALE_TIME
	});
}
