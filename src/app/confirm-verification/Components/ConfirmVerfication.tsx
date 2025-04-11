// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ENotificationStatus, ESocial } from '@/_shared/types';
import { CookieClientService } from '@/app/_client-services/cookie_client_service';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { LoadingSpinner } from '@/app/_shared-components/LoadingSpinner';
import { useToast } from '@/hooks/useToast';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

function ConfirmVerfication({ token, social, twitterOauthVerifier }: { token: string; social: ESocial; twitterOauthVerifier: string }) {
	const [isLoading, setIsLoading] = useState(true);
	const user = CookieClientService.getAccessTokenPayload();
	const { toast } = useToast();
	const t = useTranslations();

	useEffect(() => {
		const verifySocial = async () => {
			if (!user || !user.id) return;

			setIsLoading(true);
			const { data, error } = await NextApiClientService.confirmSocialVerification({
				userId: user.id,
				social: social as ESocial,
				token,
				twitterOauthVerifier
			});

			if (error || !data) {
				setIsLoading(false);
				toast({
					title: 'Failed to verify social',
					description: error?.message || 'Something went wrong',
					status: ENotificationStatus.ERROR
				});
				return;
			}

			toast({
				title: 'Social verified successfully',
				description: 'Your social has been verified successfully',
				status: ENotificationStatus.SUCCESS
			});

			setIsLoading(false);
		};
		verifySocial();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [social, token, twitterOauthVerifier, user?.id]);

	return (
		<div className='flex flex-col items-center gap-y-2 p-8'>
			{isLoading ? (
				<>
					<LoadingSpinner />
					<p className='text-sm text-text_primary'>{t('SetIdentity.verifying')}</p>
				</>
			) : (
				<>
					<p className='text-sm text-text_primary'>{t('SetIdentity.verificationSuccessful')}</p>
					<Link
						href='/'
						className='text-sm text-text_pink'
					>
						{t('SetIdentity.goToHome')}
					</Link>
				</>
			)}
		</div>
	);
}

export default ConfirmVerfication;
