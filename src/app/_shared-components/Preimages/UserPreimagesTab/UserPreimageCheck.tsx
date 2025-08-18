// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useMemo } from 'react';
import { IPreimage } from '@/_shared/types';
import { useUser } from '@/hooks/useUser';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { useTranslations } from 'next-intl';
import { Button } from '@ui/Button';
import { RefreshCcwIcon } from 'lucide-react';
import ListingTable from '@/app/_shared-components/Preimages/ListingTable/ListingTable';
import NoUserPreimage from '@/app/_shared-components/Preimages/ListingTable/NoUserPreimage';
import SearchBar from '@/app/_shared-components/Preimages/SearchBar/SearchBar';
import styles from '@ui/Preimages/SearchBar/SearchBar.module.scss';
import Address from '../../Profile/Address/Address';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../Dialog/Dialog';
import SwitchWalletOrAddress from '../../SwitchWalletOrAddress/SwitchWalletOrAddress';

interface UserPreimageCheckProps {
	preimage: IPreimage | null;
}

function UserPreimageCheck({ preimage }: UserPreimageCheckProps) {
	const { user } = useUser();
	const { userPreferences } = useUserPreferences();
	const t = useTranslations('Preimages');

	const selectedAddress = userPreferences?.selectedAccount?.address || user?.addresses?.[0] || '';

	// Check if user owns this preimage using selected address
	const userOwnsPreimage = useMemo(() => {
		if (!user || !preimage || !selectedAddress) {
			return false;
		}

		const userSubstrateAddress = getSubstrateAddress(selectedAddress);
		const preimageProposerSubstrateAddress = getSubstrateAddress(preimage.proposer);
		return userSubstrateAddress === preimageProposerSubstrateAddress;
	}, [user, preimage, selectedAddress]);

	if (userOwnsPreimage && preimage) {
		return (
			<>
				<div className={styles.container}>
					<div className='flex w-full flex-col items-center gap-y-4 sm:flex-row sm:gap-x-4'>
						<span className='flex items-center gap-x-2 text-sm'>
							{t('showingPreimagesFor')}
							<Address
								address={selectedAddress}
								truncateCharLen={5}
								disableTooltip
							/>
						</span>
						<Dialog>
							<DialogTrigger asChild>
								<Button
									variant='secondary'
									size='sm'
									className='flex items-center gap-x-2 text-bg_pink'
								>
									{t('switchWallet')}
									<RefreshCcwIcon className='h-4 w-4' />
								</Button>
							</DialogTrigger>
							<DialogContent className='p-4 sm:max-w-md sm:p-6'>
								<DialogHeader>
									<DialogTitle>{t('switchWallet')}</DialogTitle>
								</DialogHeader>
								<div className='flex flex-col gap-y-4 py-4'>
									<SwitchWalletOrAddress small />
								</div>
							</DialogContent>
						</Dialog>
					</div>
					<SearchBar />
				</div>
				<ListingTable
					data={[preimage]}
					totalCount={1}
				/>
			</>
		);
	}

	return (
		<>
			<div className={styles.container}>
				<div className='flex w-full flex-col items-center gap-y-4 sm:flex-row sm:gap-x-4'>
					<span className='flex items-center gap-x-2 text-sm'>
						{t('showingPreimagesFor')}
						<Address
							address={selectedAddress}
							truncateCharLen={5}
							disableTooltip
						/>
					</span>
					<Dialog>
						<DialogTrigger asChild>
							<Button
								variant='secondary'
								size='sm'
								className='flex items-center gap-x-2 text-bg_pink'
							>
								{t('switchWallet')}
								<RefreshCcwIcon className='h-4 w-4' />
							</Button>
						</DialogTrigger>
						<DialogContent className='p-4 sm:max-w-md sm:p-6'>
							<DialogHeader>
								<DialogTitle>{t('switchWallet')}</DialogTitle>
							</DialogHeader>
							<div className='flex flex-col gap-y-4 py-4'>
								<SwitchWalletOrAddress small />
							</div>
						</DialogContent>
					</Dialog>
				</div>
				<SearchBar />
			</div>
			<NoUserPreimage />
		</>
	);
}

export default UserPreimageCheck;
