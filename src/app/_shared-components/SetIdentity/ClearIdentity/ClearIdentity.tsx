// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useIdentityService } from '@/hooks/useIdentityService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useToast } from '@/hooks/useToast';
import { ENotificationStatus, EReactQueryKeys } from '@/_shared/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/hooks/useUser';
import Image from 'next/image';
import MechanicGIF from '@assets/gifs/mechanic.gif';
import { Separator } from '../../Separator';
import { Button } from '../../Button';
import SwitchWalletOrAddress from '../../SwitchWalletOrAddress/SwitchWalletOrAddress';
import AddressRelationsPicker from '../../AddressRelationsPicker/AddressRelationsPicker';
import { Skeleton } from '../../Skeleton';

function ClearIdentity({ onSuccess }: { onSuccess?: () => void }) {
	const t = useTranslations();
	const { identityService } = useIdentityService();

	const { user } = useUser();
	const { userPreferences } = useUserPreferences();

	const [loading, setLoading] = useState(false);

	const { toast } = useToast();

	const queryClient = useQueryClient();

	const fetchIdentityInfo = async () => {
		if (!identityService || !userPreferences.selectedAccount?.address) return null;

		return identityService.getOnChainIdentity(userPreferences.selectedAccount.address);
	};

	const { data: identityInfo, isFetching: fetchingIdentityInfo } = useQuery({
		queryKey: [EReactQueryKeys.IDENTITY_INFO, user?.id, userPreferences.selectedAccount?.address],
		queryFn: () => fetchIdentityInfo(),
		enabled: !!user?.id && !!userPreferences.selectedAccount?.address && !!identityService,
		placeholderData: (previousData) => previousData,
		retry: true,
		refetchOnMount: true,
		refetchOnWindowFocus: true
	});

	const handleClearIdentity = async () => {
		if (!identityService || !userPreferences.selectedAccount?.address) return;

		setLoading(true);

		await identityService.clearOnChainIdentity({
			address: userPreferences.selectedAccount.address,
			onSuccess: () => {
				toast({
					title: t('SetIdentity.clearIdentitySuccess'),
					description: t('SetIdentity.clearIdentitySuccessDescription'),
					status: ENotificationStatus.SUCCESS
				});
				queryClient.invalidateQueries({ queryKey: [EReactQueryKeys.IDENTITY_INFO, user?.id, userPreferences.selectedAccount?.address] });
				onSuccess?.();
				setLoading(false);
			},
			onFailed: (errorMessageFallback?: string) => {
				toast({
					title: t('SetIdentity.clearIdentityFailed'),
					description: errorMessageFallback || t('SetIdentity.clearIdentityFailedDescription'),
					status: ENotificationStatus.ERROR
				});
				setLoading(false);
			}
		});
	};

	return (
		<div className='flex flex-col gap-y-4'>
			<SwitchWalletOrAddress
				small
				customAddressSelector={
					<AddressRelationsPicker
						withBalance
						showPeopleChainBalance
					/>
				}
			/>

			{fetchingIdentityInfo ? (
				<div className='flex flex-1 flex-col gap-y-6 overflow-y-auto'>
					<div className='flex items-center gap-x-2'>
						<Skeleton className='h-6 w-6 rounded-full' />
						<Skeleton className='h-4 w-full rounded-md' />
					</div>
					<div className='flex items-center gap-x-2'>
						<Skeleton className='h-6 w-6 rounded-full' />
						<Skeleton className='h-4 w-full rounded-md' />
					</div>
					<div className='flex items-center gap-x-2'>
						<Skeleton className='h-6 w-6 rounded-full' />
						<Skeleton className='h-4 w-full rounded-md' />
					</div>
				</div>
			) : !identityInfo?.display ? (
				<div className='flex flex-col items-center gap-y-2'>
					<Image
						src={MechanicGIF}
						alt='mechanic'
						width={175}
						height={140}
					/>
					<p className='text-lg font-semibold'>⚠️ {t('SetIdentity.IdentityNotSet')}</p>
				</div>
			) : (
				<div className='flex flex-col gap-y-2 text-sm font-medium text-wallet_btn_text'>
					<p className='flex items-center gap-x-8'>
						<span className='w-24 font-normal'>{t('SetIdentity.displayName')}:</span> {identityInfo.display}
					</p>
					{identityInfo.legal && (
						<p className='flex items-center gap-x-8'>
							<span className='w-24 font-normal'>{t('SetIdentity.legalName')}:</span> {identityInfo.legal}
						</p>
					)}
					{identityInfo.email && (
						<p className='flex items-center gap-x-8'>
							<span className='w-24 font-normal'>{t('SetIdentity.email')}:</span> {identityInfo.email}
						</p>
					)}
					{identityInfo.twitter && (
						<p className='flex items-center gap-x-8'>
							<span className='w-24 font-normal'>{t('SetIdentity.twitter')}:</span> {identityInfo.twitter}
						</p>
					)}
					{identityInfo.matrix && (
						<p className='flex items-center gap-x-8'>
							<span className='w-24 font-normal'>{t('SetIdentity.riot')}:</span> {identityInfo.matrix}
						</p>
					)}

					<p className='text-md mt-2 text-text_primary'>{t('SetIdentity.clearIdentityDescription')}</p>
				</div>
			)}
			<Separator />
			<div className='flex items-center justify-end'>
				<Button
					isLoading={loading}
					disabled={fetchingIdentityInfo || !identityInfo?.display}
					onClick={handleClearIdentity}
				>
					{t('SetIdentity.clearIdentity')}
				</Button>
			</div>
		</div>
	);
}

export default ClearIdentity;
