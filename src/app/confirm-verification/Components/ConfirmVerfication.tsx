// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ENotificationStatus, ESocial } from '@/_shared/types';
import { CookieClientService } from '@/app/_client-services/cookie_client_service';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useToast } from '@/hooks/useToast';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

function ConfirmVerfication({ token, social, twitterOauthVerifier }: { token: string; social: ESocial; twitterOauthVerifier: string }) {
	const [isLoading, setIsLoading] = useState(true);
	const user = CookieClientService.getAccessTokenPayload();
	const { toast } = useToast();

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

	return isLoading ? (
		<div>Verifying ...</div>
	) : (
		<div>
			Verification successful <Link href='/'>Go to home</Link>
		</div>
	);
}

export default ConfirmVerfication;
