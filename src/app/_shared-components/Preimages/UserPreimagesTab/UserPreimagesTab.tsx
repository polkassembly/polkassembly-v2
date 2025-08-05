// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import { ERROR_CODES, ERROR_MESSAGES } from '@/_shared/_constants/errorLiterals';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { ClientError } from '@/app/_client-utils/clientError';
import { useUser } from '@/hooks/useUser';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Button } from '@ui/Button';
import Link from 'next/link';
import styles from '@ui/Preimages/SearchBar/SearchBar.module.scss';
import { RefreshCcwIcon } from 'lucide-react';
import ListingTable from '../ListingTable/ListingTable';
import NoUserPreimage from '../ListingTable/NoUserPreimage';
import SearchBar from '../SearchBar/SearchBar';
import SwitchWalletOrAddress from '../../SwitchWalletOrAddress/SwitchWalletOrAddress';
import Address from '../../Profile/Address/Address';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../Dialog/Dialog';

function UserPreimagesTab() {
	const searchParams = useSearchParams();
	const page = parseInt(searchParams?.get('page') || '1', 10);
	const { user } = useUser();
	const { userPreferences } = useUserPreferences();
	const t = useTranslations('Preimages');

	const selectedAddress = userPreferences?.selectedAccount?.address || user?.addresses?.[0] || '';

	const {
		data: userPreimagesData,
		isLoading,
		error,
		refetch
	} = useQuery({
		queryKey: ['userPreimages', selectedAddress, page, user?.id, userPreferences?.selectedAccount?.address],
		queryFn: async () => {
			if (!selectedAddress) {
				return null;
			}

			const { data, error: fetchError } = await NextApiClientService.fetchUserPreimages({
				page,
				address: selectedAddress
			});

			if (fetchError || !data) {
				throw new ClientError(ERROR_CODES.CLIENT_ERROR, fetchError?.message || ERROR_MESSAGES[ERROR_CODES.CLIENT_ERROR]);
			}

			return data;
		},
		enabled: !!selectedAddress && !!user?.addresses?.length,
		retry: 1
	});

	// Show loading state
	if (isLoading) {
		return (
			<div className='flex items-center justify-center py-12'>
				<div className='text-center'>
					<div className='mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-bg_pink border-t-transparent' />
					<p className='text-bg_pink'>{t('loadingYourPreimages')}</p>
				</div>
			</div>
		);
	}

	// Show not authenticated message
	if (!user?.addresses?.length) {
		return (
			<div className='flex items-center justify-center py-12'>
				<div className='text-center'>
					<p className='text-text_secondary mb-4'>
						{t('please')}{' '}
						<Link
							href='/login'
							className='text-bg_pink'
						>
							{t('logIn')}
						</Link>{' '}
						{t('toViewPreimages')}
					</p>
				</div>
			</div>
		);
	}

	// Show error state
	if (error) {
		return (
			<div className='flex items-center justify-center py-12'>
				<div className='text-center text-red-500'>
					<p>Error: {error instanceof Error ? error.message : t('failedToFetchUserPreimages')}</p>
					<Button
						variant='ghost'
						onClick={() => refetch()}
						className='mt-2 text-sm underline hover:no-underline'
					>
						{t('tryAgain')}
					</Button>
				</div>
			</div>
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
			{userPreimagesData?.items?.length ? (
				<ListingTable
					data={userPreimagesData.items}
					totalCount={userPreimagesData.totalCount}
				/>
			) : (
				<NoUserPreimage />
			)}
		</>
	);
}

export default UserPreimagesTab;
