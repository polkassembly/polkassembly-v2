// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import Image from 'next/image';
import { useMemo, useState, useEffect } from 'react';
import TwitterIcon from '@assets/icons/twitter-icon-dark.svg';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { ENotificationStatus, ESocial, ESocialVerificationStatus, ISocialHandle } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/lib/utils';
import VerifiedCheckIcon from '@assets/icons/verified-check-green.svg';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useToast } from '@/hooks/useToast';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { ONE_MIN_IN_SECONDS } from '@/app/api/_api-constants/timeConstants';
import { Button } from '../../Button';

function TwitterVerification({ identityTwitter, twitterSocialHandle }: { identityTwitter: string; twitterSocialHandle?: ISocialHandle }) {
	const t = useTranslations();
	const queryClient = useQueryClient();
	const { user } = useUser();
	const { userPreferences } = useUserPreferences();
	const { toast } = useToast();

	const [loading, setLoading] = useState(false);
	const [timeLeft, setTimeLeft] = useState(0);

	const twitterStatus = useMemo(() => {
		if (!twitterSocialHandle?.status) return ESocialVerificationStatus.UNVERIFIED;

		if (twitterSocialHandle.status === ESocialVerificationStatus.VERIFIED && twitterSocialHandle.handle === identityTwitter) return ESocialVerificationStatus.VERIFIED;

		return twitterSocialHandle?.status;
	}, [twitterSocialHandle, identityTwitter]);

	// Check if we need to start the timer based on updatedAt
	useEffect(() => {
		if (twitterSocialHandle?.updatedAt && twitterStatus === ESocialVerificationStatus.PENDING) {
			const updatedAtTime = dayjs(twitterSocialHandle.updatedAt);
			const currentTime = dayjs();
			const timeDifference = currentTime.diff(updatedAtTime, 'millisecond');
			const oneMinuteInMs = 60 * 1000;

			if (timeDifference < oneMinuteInMs) {
				// Start timer with remaining time
				const remainingTime = Math.ceil((oneMinuteInMs - timeDifference) / 1000);
				setTimeLeft(remainingTime);
			}
		}
	}, [twitterSocialHandle?.updatedAt, twitterStatus]);

	// Timer countdown effect
	useEffect(() => {
		if (timeLeft <= 0) return () => {};

		const timer = setTimeout(() => {
			setTimeLeft(timeLeft - 1);
		}, 1000);

		return () => clearTimeout(timer);
	}, [timeLeft]);

	const canResendTwitter = useMemo(() => {
		if (twitterStatus === ESocialVerificationStatus.VERIFIED) return false;
		if (twitterStatus === ESocialVerificationStatus.UNVERIFIED) return true;
		if (twitterStatus === ESocialVerificationStatus.PENDING) {
			// Check if timer has expired
			return timeLeft === 0;
		}
		return false;
	}, [twitterStatus, timeLeft]);

	const verifyTwitter = async () => {
		if (!user || !identityTwitter || !userPreferences.selectedAccount?.address) return;

		setLoading(true);
		const { data, error } = await NextApiClientService.initSocialVerification({
			userId: user.id,
			address: userPreferences.selectedAccount.address,
			social: ESocial.TWITTER,
			handle: identityTwitter
		});

		if (error || !data) {
			console.error(error);
			toast({
				status: ENotificationStatus.ERROR,
				title: t('SetIdentity.twitterVerificationFailed'),
				description: t('SetIdentity.twitterVerificationFailedDescription')
			});
			setLoading(false);
			return;
		}

		if (data.verificationToken?.token) {
			window.open(`https://api.twitter.com/oauth/authenticate?oauth_token=${data.verificationToken.token}`, '_blank');
		}

		// Start 60 second timer
		setTimeLeft(ONE_MIN_IN_SECONDS);

		queryClient.setQueryData(['socials', user?.id, userPreferences.selectedAccount?.address], (old: Record<ESocial, ISocialHandle>) => ({
			...old,
			[ESocial.TWITTER]: {
				social: ESocial.TWITTER,
				handle: identityTwitter,
				status: ESocialVerificationStatus.PENDING,
				userId: user.id,
				address: userPreferences.selectedAccount?.address,
				updatedAt: dayjs().toDate()
			}
		}));

		setLoading(false);
	};

	const getButtonText = useMemo(() => {
		if (twitterStatus === ESocialVerificationStatus.PENDING) {
			if (timeLeft > 0) {
				return `${t('SetIdentity.resendIn')} ${timeLeft}s`;
			}
			return t('SetIdentity.resend');
		}
		return t('SetIdentity.verify');
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [twitterStatus, timeLeft]);

	return (
		<div className='flex items-center gap-x-2'>
			<div className='flex w-36 items-center gap-x-2'>
				<div className='z-30 rounded-full bg-bg_modal'>
					<div className='flex h-10 w-10 items-center justify-center rounded-full bg-border_grey/40'>
						<Image
							src={TwitterIcon}
							alt='social icon'
							width={24}
							height={24}
						/>
					</div>
				</div>
				<p className='text-sm text-wallet_btn_text'>{t('SetIdentity.twitter')}</p>
			</div>
			<div
				className={cn(
					'flex flex-1 items-center justify-between gap-x-2 rounded-md border border-border_grey px-3 py-2',
					twitterStatus === ESocialVerificationStatus.VERIFIED && 'bg-page_background text-text_primary/60'
				)}
			>
				<p className='truncate font-medium'>{identityTwitter}</p>
				{twitterStatus === ESocialVerificationStatus.VERIFIED ? (
					<div className='flex items-center gap-x-1 text-xs'>
						<Image
							src={VerifiedCheckIcon}
							alt='verified'
							width={20}
							height={20}
						/>
						{t('SetIdentity.verified')}
					</div>
				) : (
					<Button
						disabled={!canResendTwitter}
						onClick={verifyTwitter}
						isLoading={loading}
						size='sm'
					>
						{getButtonText}
					</Button>
				)}
			</div>
		</div>
	);
}

export default TwitterVerification;
