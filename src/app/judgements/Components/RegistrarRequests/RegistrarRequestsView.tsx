// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useQuery } from '@tanstack/react-query';
import { useIdentityService } from '@/hooks/useIdentityService';
import { useUser } from '@/hooks/useUser';
import { getEncodedAddress } from '@/_shared/_utils/getEncodedAddress';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import RegistrarRequestsStats from './RegistrarRequestsStats';
import RegistrarRequestsTable from './RegistrarRequestsTable';

function RegistrarRequestsView() {
	const { identityService } = useIdentityService();
	const { user } = useUser();
	const network = getCurrentNetwork();

	const { data: isRegistrar, isLoading } = useQuery({
		queryKey: ['is-registrar', user?.defaultAddress],
		queryFn: async () => {
			if (!user?.defaultAddress || !identityService) return false;

			const registrars = await identityService.getRegistrars();
			const encodedUserAddress = getEncodedAddress(user.defaultAddress, network);

			return registrars.some((reg) => {
				const encodedRegAddress = getEncodedAddress(reg.account, network);
				return encodedRegAddress === encodedUserAddress;
			});
		},
		enabled: !!user?.defaultAddress && !!identityService
	});

	if (isLoading) {
		return (
			<div className='flex h-64 items-center justify-center'>
				<p className='text-basic_text'>Loading...</p>
			</div>
		);
	}

	if (!isRegistrar) {
		return (
			<div className='flex h-64 items-center justify-center rounded-xl border border-primary_border bg-bg_modal'>
				<div className='text-center'>
					<p className='text-lg font-semibold text-text_primary'>Registrar Access Required</p>
					<p className='mt-2 text-sm text-basic_text'>Only registered registrars can view this page.</p>
				</div>
			</div>
		);
	}

	return (
		<div className='flex flex-col gap-y-4'>
			<RegistrarRequestsStats />
			<RegistrarRequestsTable />
		</div>
	);
}

export default RegistrarRequestsView;
