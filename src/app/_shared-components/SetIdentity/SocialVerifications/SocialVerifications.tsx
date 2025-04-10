// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ENotificationStatus, ESocial, ESocialVerificationStatus, IOnChainIdentity } from '@/_shared/types';
import { useIdentityService } from '@/hooks/useIdentityService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useEffect, useState } from 'react';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useUser } from '@/hooks/useUser';
import { useQuery } from '@tanstack/react-query';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { useToast } from '@/hooks/useToast';
import { useTranslations } from 'next-intl';
import { Skeleton } from '../../Skeleton';
import EmailVerification from './EmailVerification';
import TwitterVerification from './TwitterVerification';
import RiotVerification from './RiotVerification';
import { Separator } from '../../Separator';
import { Button } from '../../Button';

function SocialVerifications() {
	const t = useTranslations();
	const { userPreferences } = useUserPreferences();
	const { user } = useUser();
	const { identityService } = useIdentityService();
	const { toast } = useToast();

	const [identityValues, setIdentityValues] = useState<IOnChainIdentity>();

	const [loading, setLoading] = useState(false);

	const fetchUserSocialHandles = async () => {
		if (!user || !userPreferences.address?.address) return null;
		const { data, error } = await NextApiClientService.fetchUserSocialHandles({ userId: user.id, address: userPreferences.address.address });

		if (error || !data) {
			throw new Error(error?.message || 'Failed to fetch data');
		}
		return data.socialHandles;
	};
	const { data: socialHandles, isFetching } = useQuery({
		queryKey: ['socials', user?.id, userPreferences.address?.address],
		queryFn: () => fetchUserSocialHandles(),
		placeholderData: (previousData) => previousData,
		staleTime: FIVE_MIN_IN_MILLI,
		retry: false,
		refetchOnMount: false,
		refetchOnWindowFocus: false
	});

	useEffect(() => {
		const setDefaultIdentityValues = async () => {
			if (!identityService || !userPreferences.address?.address) return;

			const identityInfo = await identityService.getOnChainIdentity(userPreferences.address.address);

			setIdentityValues(identityInfo);
		};
		setDefaultIdentityValues();
	}, [identityService, userPreferences.address?.address]);

	const proceedForJudgement = async () => {
		if (!user || !userPreferences.address?.address || !identityValues?.hash) return;

		setLoading(true);

		const { data, error } = await NextApiClientService.judgementCall({ userAddress: userPreferences.address.address, identityHash: identityValues.hash });

		if (error || !data) {
			toast({
				title: 'Failed',
				description: error?.message || 'Failed to proceed for judgement',
				status: ENotificationStatus.ERROR
			});
			setLoading(false);
			return;
		}

		toast({
			title: 'Success',
			description: 'Judgement call made successfully',
			status: ENotificationStatus.SUCCESS
		});

		console.log('data', data);

		setLoading(false);
	};

	if (isFetching) {
		return (
			<div className='flex flex-col gap-y-2'>
				<div className='flex items-center gap-x-4'>
					<Skeleton className='h-10 w-10 rounded-full' />
					<Skeleton className='h-4 flex-1 rounded-lg' />
				</div>
				<div className='flex items-center gap-x-4'>
					<Skeleton className='h-10 w-10 rounded-full' />
					<Skeleton className='h-4 flex-1 rounded-lg' />
				</div>
				<div className='flex items-center gap-x-4'>
					<Skeleton className='h-10 w-10 rounded-full' />
					<Skeleton className='h-4 flex-1 rounded-lg' />
				</div>
			</div>
		);
	}

	return (
		<div className='flex flex-col gap-y-6'>
			{identityValues?.email && (
				<EmailVerification
					identityEmail={identityValues.email}
					emailSocialHandle={socialHandles?.[ESocial.EMAIL]}
				/>
			)}
			{identityValues?.twitter && (
				<TwitterVerification
					identityTwitter={identityValues.twitter}
					twitterSocialHandle={socialHandles?.[ESocial.TWITTER]}
				/>
			)}
			{identityValues?.matrix && (
				<RiotVerification
					identityMatrix={identityValues.matrix}
					matrixSocialHandle={socialHandles?.[ESocial.RIOT]}
				/>
			)}
			<Separator />
			<div className='flex items-center justify-end'>
				<Button
					isLoading={loading}
					disabled={
						Object.values(socialHandles || {}).length === 0 ||
						Object.values(socialHandles || {}).some((handle) => handle?.status === ESocialVerificationStatus.UNVERIFIED || handle?.status === ESocialVerificationStatus.PENDING)
					}
					onClick={proceedForJudgement}
				>
					{t('SetIdentity.proceed')}
				</Button>
			</div>
		</div>
	);
}

export default SocialVerifications;
