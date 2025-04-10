// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ENotificationStatus } from '@/_shared/types';
import React, { useState } from 'react';
import { WEB3_AUTH_SIGN_MESSAGE } from '@/_shared/_constants/signMessage';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { Button } from '@/app/_shared-components/Button';
import { useRouter, useSearchParams } from 'next/navigation';
import WalletButtons from '@ui/WalletsUI/WalletButtons/WalletButtons';
import { AuthClientService } from '@/app/_client-services/auth_client_service';
import ErrorMessage from '@/app/_shared-components/ErrorMessage';
import { CookieClientService } from '@/app/_client-services/cookie_client_service';
import { useWalletService } from '@/hooks/useWalletService';
import AddressDropdown from '@/app/_shared-components/AddressDropdown/AddressDropdown';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useUser } from '@/hooks/useUser';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/useToast';
import classes from './Web3Login.module.scss';

function Web3Login({ switchToWeb2, onTfaEnabled }: { switchToWeb2: () => void; onTfaEnabled: (token: string) => void }) {
	const router = useRouter();
	const t = useTranslations();

	const { toast } = useToast();

	const { userPreferences } = useUserPreferences();

	const { setUser } = useUser();

	const [loading, setLoading] = useState(false);

	const [errorMessage, setErrorMessage] = useState<string>('');

	const walletService = useWalletService();
	const searchParams = useSearchParams();
	const nextUrl = searchParams.get('nextUrl');

	const handleLogin = async () => {
		try {
			if (!userPreferences.wallet || !userPreferences?.address?.address || !walletService) return;
			const { address } = userPreferences.address;

			setLoading(true);

			const signature = await walletService.signMessage({
				data: WEB3_AUTH_SIGN_MESSAGE,
				address,
				selectedWallet: userPreferences.wallet
			});

			if (!signature) {
				setLoading(false);
				return;
			}

			const { data, error } = await AuthClientService.web3LoginOrSignup({
				address: getSubstrateAddress(address) || address,
				signature,
				wallet: userPreferences.wallet
			});

			if (error || !data) {
				setErrorMessage(error?.message || t('Profile.loginFailed'));
				setLoading(false);
				return;
			}

			if (data.isTFAEnabled && data.tfaToken) {
				onTfaEnabled(data.tfaToken);
				return;
			}

			const accessTokenPayload = CookieClientService.getAccessTokenPayload();

			if (!accessTokenPayload) {
				setLoading(false);
				setErrorMessage(t('Profile.noAccessTokenFound'));
				return;
			}

			setUser(accessTokenPayload);

			if (nextUrl) {
				const url = nextUrl.startsWith('/') ? nextUrl.slice(1) : nextUrl;
				router.replace(`/${url}`);
			} else {
				router.back();
			}
		} catch {
			// TODO: add to language files
			toast({
				status: ENotificationStatus.ERROR,
				title: t('Profile.loginFailed')
			});
			setLoading(false);
		}
	};

	return (
		<div className='w-full'>
			<div className='flex flex-col gap-y-4'>
				<WalletButtons
					small
					disabled={loading}
				/>
				<AddressDropdown disabled={loading} />
			</div>

			{errorMessage && <ErrorMessage errorMessage={errorMessage} />}
			<div>
				<div className={classes.footer}>
					<Button
						isLoading={loading}
						onClick={handleLogin}
						size='lg'
						disabled={!userPreferences?.address?.address || !userPreferences.wallet}
						className={classes.loginButton}
					>
						{t('Profile.login')}
					</Button>
				</div>
				<div className={classes.switchToWeb2}>
					Or
					<Button
						variant='ghost'
						className='px-0 text-text_pink'
						onClick={switchToWeb2}
						disabled={loading}
					>
						{t('Profile.loginwithusername')}
					</Button>
				</div>
			</div>
		</div>
	);
}

export default Web3Login;
