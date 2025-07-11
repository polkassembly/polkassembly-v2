// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ENotificationStatus, ESocial, ESocialVerificationStatus } from '@/_shared/types';
import { useIdentityService } from '@/hooks/useIdentityService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useState } from 'react';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useUser } from '@/hooks/useUser';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { useTranslations } from 'next-intl';
import { useRouter } from 'nextjs-toploader/app';
import Image from 'next/image';
import MechanicGIF from '@assets/gifs/mechanic.gif';
import { AlertCircle, Pencil } from 'lucide-react';
import EmailVerification from './EmailVerification';
import TwitterVerification from './TwitterVerification';
import RiotVerification from './RiotVerification';
import { Separator } from '../../Separator';
import { Button } from '../../Button';
import SwitchWalletOrAddress from '../../SwitchWalletOrAddress/SwitchWalletOrAddress';
import AddressRelationsPicker from '../../AddressRelationsPicker/AddressRelationsPicker';
import { Skeleton } from '../../Skeleton';
import { Alert, AlertDescription } from '../../Alert';

function RequestJudgement({ onSetIdentity }: { onSetIdentity: () => void }) {
	const t = useTranslations();
	const { userPreferences } = useUserPreferences();
	const { user } = useUser();
	const { identityService } = useIdentityService();
	const { toast } = useToast();

	const router = useRouter();

	const [loading, setLoading] = useState(false);

	const fetchUserIdentity = async () => {
		if (!identityService || !userPreferences.selectedAccount?.address) return null;
		return identityService.getOnChainIdentity(userPreferences.selectedAccount.address);
	};

	const { data: identityValues, isFetching: fetchingUserIdentity } = useQuery({
		queryKey: ['identity', user?.id, userPreferences.selectedAccount?.address],
		queryFn: () => fetchUserIdentity(),
		enabled: !!user?.id && !!userPreferences.selectedAccount?.address,
		placeholderData: (previousData) => previousData,
		retry: false,
		refetchOnMount: false,
		refetchOnWindowFocus: false
	});

	const fetchUserSocialHandles = async () => {
		if (!user || !userPreferences.selectedAccount?.address) return null;

		const { data, error } = await NextApiClientService.fetchUserSocialHandles({ userId: user.id, address: userPreferences.selectedAccount.address });

		if (error || !data) {
			throw new Error(error?.message || 'Failed to fetch data');
		}
		return data.socialHandles;
	};
	const { data: socialHandles, isFetching: fetchingUserSocials } = useQuery({
		queryKey: ['socials', user?.id, userPreferences.selectedAccount?.address],
		queryFn: () => fetchUserSocialHandles(),
		enabled: !!user?.id && !!userPreferences.selectedAccount?.address && !!identityValues?.display,
		placeholderData: (previousData) => previousData,
		retry: false,
		refetchOnMount: false,
		refetchOnWindowFocus: false
	});

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
		<div className='flex flex-1 flex-col gap-y-6 overflow-y-hidden'>
			<SwitchWalletOrAddress
				small
				customAddressSelector={
					<AddressRelationsPicker
						withBalance
						showPeopleChainBalance
					/>
				}
			/>
			{fetchingUserIdentity || fetchingUserSocials ? (
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
			) : !identityValues?.display ? (
				<div className='flex flex-1 flex-col items-center gap-y-6 overflow-y-hidden'>
					<div className='flex flex-1 flex-col gap-y-6 overflow-y-auto'>
						<div className='flex flex-col items-center gap-y-2'>
							<Image
								src={MechanicGIF}
								alt='mechanic'
								width={175}
								height={140}
							/>
							<div className='flex flex-col items-center gap-y-2 text-text_primary'>
								<p className='text-lg font-semibold'>⚠️ {t('SetIdentity.IdentityNotSet')}</p>
								<p className='text-sm'>{t('SetIdentity.IdentityNotSetDescription')}</p>
							</div>
						</div>
						<div>
							<ul className='list-disc pl-4 text-sm text-text_primary'>
								<li>{t('SetIdentity.IdentityNotSetDescription2')}</li>
								<li>{t('SetIdentity.IdentityNotSetDescription3')}</li>
							</ul>
						</div>
					</div>
					<Separator />
					<Button
						className='w-full'
						size='lg'
						onClick={onSetIdentity}
					>
						{t('SetIdentity.setIdentity')}
					</Button>
				</div>
			) : (
				<div className='flex flex-1 flex-col gap-y-6 overflow-y-hidden'>
					<div className='flex flex-1 flex-col gap-y-6 overflow-y-auto'>
						{identityValues.isVerified && (
							<>
								<Alert
									variant='info'
									className='flex items-center gap-x-3'
								>
									<AlertCircle className='h-4 w-4' />
									<AlertDescription className='flex w-full items-center justify-between'>
										<p className='text-sm font-medium'>{t('SetIdentity.IdentityVerified')}</p>
									</AlertDescription>
								</Alert>
								<div className='flex w-full items-center justify-between rounded-lg bg-grey_bg px-4 py-2'>
									<span className='text-sm'>{t('SetIdentity.CurrentJudgement')}</span>
									<span className='text-base font-bold text-text_primary'>{identityValues.judgements.length > 0 && identityValues.judgements[0][1].toString()}</span>
								</div>
							</>
						)}
						<div className='flex items-center justify-between'>
							<p className='text-base font-semibold text-wallet_btn_text'>{t('SetIdentity.socials')}</p>
							<Button
								onClick={onSetIdentity}
								size='sm'
								variant='ghost'
								className='text-text_pink'
								leftIcon={<Pencil className='h-3 w-3 text-text_pink' />}
							>
								{t('SetIdentity.edit')}
							</Button>
						</div>
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
					</div>
					<Separator />
					<div className='flex items-center justify-end'>
						<Button
							isLoading={loading}
							disabled={
								fetchingUserIdentity ||
								fetchingUserSocials ||
								!identityValues?.display ||
								!identityValues?.hash ||
								identityValues.isVerified ||
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
			)}
		</div>
	);
}

export default RequestJudgement;
