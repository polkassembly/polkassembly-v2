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
import { useToast } from '@/hooks/useToast';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import EmailVerification from './EmailVerification';
import TwitterVerification from './TwitterVerification';
import RiotVerification from './RiotVerification';
import { Separator } from '../../Separator';
import { Button } from '../../Button';
import LoadingLayover from '../../LoadingLayover';

function SocialVerifications() {
	const t = useTranslations();
	const { userPreferences } = useUserPreferences();
	const { user } = useUser();
	const { identityService } = useIdentityService();
	const { toast } = useToast();

	const router = useRouter();

	const [identityValues, setIdentityValues] = useState<IOnChainIdentity>();

	const [loading, setLoading] = useState(false);

	const fetchUserSocialHandles = async () => {
		if (!user || !userPreferences.selectedAccount?.address) return null;

		const { data, error } = await NextApiClientService.fetchUserSocialHandles({ userId: user.id, address: userPreferences.selectedAccount.address });

		if (error || !data) {
			throw new Error(error?.message || 'Failed to fetch data');
		}
		return data.socialHandles;
	};
	const { data: socialHandles, isFetching } = useQuery({
		queryKey: ['socials', user?.id, userPreferences.selectedAccount?.address],
		queryFn: () => fetchUserSocialHandles(),
		placeholderData: (previousData) => previousData
	});

	useEffect(() => {
		const setDefaultIdentityValues = async () => {
			if (!identityService || !userPreferences.selectedAccount?.address) return;

			const identityInfo = await identityService.getOnChainIdentity(userPreferences.selectedAccount.address);

			setIdentityValues(identityInfo);
		};
		setDefaultIdentityValues();
	}, [identityService, userPreferences.selectedAccount?.address]);

	const proceedForJudgement = async () => {
		if (!user || !userPreferences.selectedAccount?.address || !identityValues?.hash) return;

		setLoading(true);

		const { data, error } = await NextApiClientService.judgementCall({ userAddress: userPreferences.selectedAccount.address, identityHash: identityValues.hash });

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

		router.back();

		setLoading(false);
	};

	return (
		<div className='relative flex flex-col gap-y-6'>
			{isFetching && <LoadingLayover />}
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
						!socialHandles ||
						Object.values(socialHandles || {}).length === 0 ||
						(!!identityValues?.email && socialHandles?.[ESocial.EMAIL]?.status !== ESocialVerificationStatus.VERIFIED) ||
						(!!identityValues?.twitter && socialHandles?.[ESocial.TWITTER]?.status !== ESocialVerificationStatus.VERIFIED) ||
						(!!identityValues?.matrix && socialHandles?.[ESocial.RIOT]?.status !== ESocialVerificationStatus.VERIFIED)
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
