// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ENotificationStatus, EWallet } from '@/_shared/types';
import React, { useState } from 'react';
import { WEB3_AUTH_SIGN_MESSAGE } from '@/_shared/_constants/signMessage';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { Button } from '@/app/_shared-components/Button';
import { useSearchParams } from 'next/navigation';
import { AuthClientService } from '@/app/_client-services/auth_client_service';
import ErrorMessage from '@/app/_shared-components/ErrorMessage';
import { CookieClientService } from '@/app/_client-services/cookie_client_service';
import { useWalletService } from '@/hooks/useWalletService';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useUser } from '@/hooks/useUser';
import { useTranslations } from 'next-intl';
import { useToast } from '@/hooks/useToast';
import SwitchWalletOrAddress from '@/app/_shared-components/SwitchWalletOrAddress/SwitchWalletOrAddress';
import { useRouter } from 'nextjs-toploader/app';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import classes from './Web3Login.module.scss';

function Web3Login({ switchToWeb2, onTfaEnabled }: { switchToWeb2: () => void; onTfaEnabled: (token: string) => void }) {
	const router = useRouter();
	const t = useTranslations();

	const { toast } = useToast();

	const { userPreferences } = useUserPreferences();

	const { setUser } = useUser();

	const [loading, setLoading] = useState(false);
	const [pendingMimirAuth, setPendingMimirAuth] = useState(false);

	const [errorMessage, setErrorMessage] = useState<string>('');

	const walletService = useWalletService();
	const searchParams = useSearchParams();
	const nextUrl = searchParams.get('nextUrl');

	const { apiService } = usePolkadotApiService();

	// Constants
	const LOGIN_FAILED_MESSAGE = t('Profile.loginFailed');

	// Handle Mimir login completion after remark transaction
	const completeMimirLogin = async (remarkHash: string) => {
		try {
			if (!userPreferences?.selectedAccount?.address) {
				setLoading(false);
				setPendingMimirAuth(false);
				return;
			}

			const { address } = userPreferences.selectedAccount;

			const result = await AuthClientService.remarkLogin({
				address: getSubstrateAddress(address) || address,
				wallet: userPreferences.wallet!,
				remarkHash
			});

			if (result.error || !result.data) {
				setErrorMessage(result.error?.message || LOGIN_FAILED_MESSAGE);
				setLoading(false);
				setPendingMimirAuth(false);
				return;
			}

			if (result.data.isTFAEnabled && result.data.tfaToken) {
				onTfaEnabled(result.data.tfaToken);
				setLoading(false);
				setPendingMimirAuth(false);
				return;
			}

			const accessTokenPayload = CookieClientService.getAccessTokenPayload();

			if (!accessTokenPayload) {
				setLoading(false);
				setPendingMimirAuth(false);
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
		} catch (error) {
			console.log('mimir login error', error);
			toast({
				status: ENotificationStatus.ERROR,
				title: LOGIN_FAILED_MESSAGE
			});
			setLoading(false);
			setPendingMimirAuth(false);
		}
	};

	const handleLogin = async () => {
		try {
			if (!userPreferences.wallet || !userPreferences?.selectedAccount?.address || !walletService) return;
			const { address } = userPreferences.selectedAccount;

			setLoading(true);

			if (userPreferences.wallet === EWallet.MIMIR) {
				if (!apiService) {
					setLoading(false);
					return;
				}

				const { data, error } = await AuthClientService.getRemarkLoginMessage({ address: getSubstrateAddress(address) || address });

				if (error || !data || !data.message) {
					setLoading(false);
					setErrorMessage(error?.message || 'Cannot generate message.');
					return;
				}

				setPendingMimirAuth(true);

				// Start the remark transaction
				apiService.loginWithRemark({
					address,
					remarkLoginMessage: data.message,
					onSuccess: (hash) => {
						const remarkHash = hash?.toString() || '';

						if (remarkHash) {
							// Complete the login process in the success callback
							completeMimirLogin(remarkHash);
						} else {
							setLoading(false);
							setPendingMimirAuth(false);
							setErrorMessage('Failed to get transaction hash');
						}
					},
					onFailed: (e) => {
						console.log('remark failed:', e);
						setErrorMessage(e);
						setLoading(false);
						setPendingMimirAuth(false);
					}
				});

				// Don't continue execution here - wait for onSuccess/onFailed callbacks
				return;
			}

			const signature = await walletService.signMessage({
				data: WEB3_AUTH_SIGN_MESSAGE,
				address,
				selectedWallet: userPreferences.wallet
			});

			if (!signature) {
				setLoading(false);
				return;
			}

			const result = await AuthClientService.web3LoginOrSignup({
				address: getSubstrateAddress(address) || address,
				signature,
				wallet: userPreferences.wallet
			});

			if (result.error || !result.data) {
				setErrorMessage(result.error?.message || LOGIN_FAILED_MESSAGE);
				setLoading(false);
				return;
			}

			if (result.data.isTFAEnabled && result.data.tfaToken) {
				onTfaEnabled(result.data.tfaToken);
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
		} catch (error) {
			console.log('error', error);
			// TODO: add to language files
			toast({
				status: ENotificationStatus.ERROR,
				title: LOGIN_FAILED_MESSAGE
			});
			setLoading(false);
			setPendingMimirAuth(false);
		}
	};

	return (
		<div className='w-full'>
			<div className='flex flex-col gap-y-4'>
				<SwitchWalletOrAddress
					small
					disabled={loading}
				/>
			</div>

			{errorMessage && <ErrorMessage errorMessage={errorMessage} />}
			<div>
				<div className={classes.footer}>
					<Button
						isLoading={loading}
						onClick={handleLogin}
						size='lg'
						disabled={!userPreferences?.selectedAccount?.address || !userPreferences.wallet || pendingMimirAuth}
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
