// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import Image from 'next/image';
import { useMemo, useState, useEffect } from 'react';
import EmailIcon from '@assets/icons/email-icon-dark.svg';
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

function EmailVerification({ identityEmail, emailSocialHandle }: { identityEmail: string; emailSocialHandle?: ISocialHandle }) {
	const t = useTranslations();
	const { user } = useUser();
	const { userPreferences } = useUserPreferences();

	const { toast } = useToast();

	const [loading, setLoading] = useState(false);
	const [timeLeft, setTimeLeft] = useState(0);

	const queryClient = useQueryClient();

	const emailStatus = useMemo(() => {
		if (!emailSocialHandle || !emailSocialHandle.status) return ESocialVerificationStatus.UNVERIFIED;

		if (emailSocialHandle.status === ESocialVerificationStatus.VERIFIED && emailSocialHandle.handle === identityEmail) return ESocialVerificationStatus.VERIFIED;

		return emailSocialHandle.status;
	}, [emailSocialHandle, identityEmail]);

	// Check if we need to start the timer based on updatedAt
	useEffect(() => {
		if (emailSocialHandle?.updatedAt && emailStatus === ESocialVerificationStatus.PENDING) {
			const updatedAtTime = dayjs(emailSocialHandle.updatedAt);
			const currentTime = dayjs();
			const timeDifference = currentTime.diff(updatedAtTime, 'millisecond');
			const oneMinuteInMs = 60 * 1000;

			if (timeDifference < oneMinuteInMs) {
				// Start timer with remaining time
				const remainingTime = Math.ceil((oneMinuteInMs - timeDifference) / 1000);
				setTimeLeft(remainingTime);
			}
		}
	}, [emailSocialHandle?.updatedAt, emailStatus]);

	// Timer countdown effect
	useEffect(() => {
		if (timeLeft <= 0) return () => {};

		const timer = setTimeout(() => {
			setTimeLeft(timeLeft - 1);
		}, 1000);

		return () => clearTimeout(timer);
	}, [timeLeft]);

	const canResendEmail = useMemo(() => {
		if (emailStatus === ESocialVerificationStatus.VERIFIED) return false;
		if (emailStatus === ESocialVerificationStatus.UNVERIFIED) return true;
		if (emailStatus === ESocialVerificationStatus.PENDING) {
			// Check if timer has expired
			return timeLeft === 0;
		}
		return false;
	}, [emailStatus, timeLeft]);

	const verifyEmail = async () => {
		if (!user || !identityEmail || !userPreferences.selectedAccount?.address) return;

		setLoading(true);
		const { data, error } = await NextApiClientService.initSocialVerification({
			userId: user.id,
			social: ESocial.EMAIL,
			handle: identityEmail,
			address: userPreferences.selectedAccount.address
		});

		if (error || !data) {
			console.error(error);
			toast({
				status: ENotificationStatus.ERROR,
				title: t('SetIdentity.emailNotSent'),
				description: t('SetIdentity.emailNotSentDescription')
			});
			setLoading(false);
			return;
		}

		// Start 60 second timer
		setTimeLeft(ONE_MIN_IN_SECONDS);

		queryClient.setQueryData(['socials', user.id, userPreferences.selectedAccount?.address], (old: Record<ESocial, ISocialHandle>) => ({
			...old,
			[ESocial.EMAIL]: {
				social: ESocial.EMAIL,
				handle: identityEmail,
				status: ESocialVerificationStatus.PENDING,
				userId: user.id,
				address: userPreferences?.selectedAccount?.address,
				updatedAt: dayjs().toDate()
			}
		}));

		toast({
			status: ENotificationStatus.SUCCESS,
			title: t('SetIdentity.verificationEmailSent'),
			description: t('SetIdentity.verificationEmailSentDescription')
		});

		setLoading(false);
	};

	const getButtonText = useMemo(() => {
		if (emailStatus === ESocialVerificationStatus.PENDING) {
			if (timeLeft > 0) {
				return `${t('SetIdentity.resendIn')} ${timeLeft}s`;
			}
			return t('SetIdentity.resend');
		}
		return t('SetIdentity.verify');
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [emailStatus, timeLeft]);

	return (
		<div className='flex items-center gap-x-2'>
			<div className='flex w-36 items-center gap-x-2'>
				<div className='z-30 rounded-full bg-bg_modal'>
					<div className='flex h-10 w-10 items-center justify-center rounded-full bg-border_grey/40'>
						<Image
							src={EmailIcon}
							alt='social icon'
							width={24}
							height={24}
						/>
					</div>
				</div>
				<p className='text-sm text-wallet_btn_text'>{t('SetIdentity.email')}</p>
			</div>
			<div
				className={cn(
					'flex flex-1 items-center justify-between gap-x-2 rounded-md border border-border_grey px-3 py-2',
					emailStatus === ESocialVerificationStatus.VERIFIED && 'bg-page_background text-text_primary/60'
				)}
			>
				<p className='truncate font-medium'>{identityEmail}</p>
				{emailStatus === ESocialVerificationStatus.VERIFIED ? (
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
						disabled={!canResendEmail}
						onClick={verifyEmail}
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

export default EmailVerification;
