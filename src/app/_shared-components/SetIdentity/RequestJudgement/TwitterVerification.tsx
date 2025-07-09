// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import Image from 'next/image';
import { useMemo, useState } from 'react';
import TwitterIcon from '@assets/icons/twitter-icon-dark.svg';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { ESocial, ESocialVerificationStatus, ISocialHandle } from '@/_shared/types';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useUser } from '@/hooks/useUser';
import { cn } from '@/lib/utils';
import VerifiedCheckIcon from '@assets/icons/verified-check-green.svg';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Button } from '../../Button';

function TwitterVerification({ identityTwitter, twitterSocialHandle }: { identityTwitter: string; twitterSocialHandle?: ISocialHandle }) {
	const t = useTranslations();
	const queryClient = useQueryClient();
	const { user } = useUser();
	const { userPreferences } = useUserPreferences();
	const [loading, setLoading] = useState(false);

	const twitterStatus = useMemo(() => {
		if (!twitterSocialHandle?.status) return ESocialVerificationStatus.UNVERIFIED;

		if (twitterSocialHandle.status === ESocialVerificationStatus.VERIFIED && twitterSocialHandle.handle === identityTwitter) return ESocialVerificationStatus.VERIFIED;

		return twitterSocialHandle?.status;
	}, [twitterSocialHandle, identityTwitter]);

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
			setLoading(false);
			return;
		}

		if (data.verificationToken?.token) {
			window.open(`https://api.twitter.com/oauth/authenticate?oauth_token=${data.verificationToken.token}`, '_blank');
		}

		queryClient.setQueryData(['socials', user?.id, userPreferences.selectedAccount?.address], (old: Record<ESocial, ISocialHandle>) => ({
			...old,
			[ESocial.TWITTER]: {
				social: ESocial.TWITTER,
				handle: identityTwitter,
				status: ESocialVerificationStatus.PENDING,
				userId: user.id,
				address: userPreferences.selectedAccount?.address
			}
		}));

		setLoading(false);
	};

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
						Verified
					</div>
				) : (
					<Button
						disabled={twitterStatus !== ESocialVerificationStatus.UNVERIFIED}
						onClick={verifyTwitter}
						isLoading={loading}
						size='sm'
					>
						{twitterStatus === ESocialVerificationStatus.PENDING ? 'Pending' : 'Verify'}
					</Button>
				)}
			</div>
		</div>
	);
}

export default TwitterVerification;
