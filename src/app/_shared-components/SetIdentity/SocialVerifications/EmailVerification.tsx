// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import Image from 'next/image';
import { useMemo, useState } from 'react';
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
import { Button } from '../../Button';

function EmailVerification({ identityEmail, emailSocialHandle }: { identityEmail: string; emailSocialHandle?: ISocialHandle }) {
	const t = useTranslations();
	const { user } = useUser();
	const { userPreferences } = useUserPreferences();

	const { toast } = useToast();

	const [loading, setLoading] = useState(false);

	const queryClient = useQueryClient();

	const emailStatus = useMemo(() => {
		if (!emailSocialHandle || !emailSocialHandle.status) return ESocialVerificationStatus.UNVERIFIED;

		if (emailSocialHandle.status === ESocialVerificationStatus.VERIFIED && emailSocialHandle.handle === identityEmail) return ESocialVerificationStatus.VERIFIED;

		return emailSocialHandle.status;
	}, [emailSocialHandle, identityEmail]);

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

		queryClient.setQueryData(['socials', user.id, userPreferences.selectedAccount?.address], (old: Record<ESocial, ISocialHandle>) => ({
			...old,
			[ESocial.EMAIL]: {
				social: ESocial.EMAIL,
				handle: identityEmail,
				status: ESocialVerificationStatus.PENDING,
				userId: user.id,
				address: userPreferences?.selectedAccount?.address
			}
		}));

		toast({
			status: ENotificationStatus.SUCCESS,
			title: t('SetIdentity.verificationEmailSent'),
			description: t('SetIdentity.verificationEmailSentDescription')
		});

		setLoading(false);
	};

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
						Verified
					</div>
				) : (
					<Button
						disabled={emailStatus !== ESocialVerificationStatus.UNVERIFIED}
						onClick={verifyEmail}
						isLoading={loading}
						size='sm'
					>
						{emailStatus === ESocialVerificationStatus.PENDING ? 'Pending' : 'Verify'}
					</Button>
				)}
			</div>
		</div>
	);
}

export default EmailVerification;
