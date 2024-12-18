// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ECookieNames, EWallet } from '@/_shared/types';
import React, { useState } from 'react';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { WEB3_AUTH_SIGN_MESSAGE } from '@/_shared/_constants/signMessage';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { Button } from '@/app/_shared-components/Button';
import { useRouter } from 'next/navigation';
import WalletButtons from '@ui/WalletsUI/WalletButtons/WalletButtons';
import { userAtom } from '@/app/_atoms/user/userAtom';
import { useSetAtom } from 'jotai';
import { AuthClientService } from '@/app/_client-services/auth_service';
import { getCookie } from 'cookies-next/client';
import { WalletClientService } from '@/app/_client-services/wallet_service';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import classes from './Web3Login.module.scss';
import SwitchToWeb2Signup from '../SwitchToWeb2Signup/SwitchToWeb2Signup';

function Web3Login({
	switchToWeb2,
	switchToSignup,
	onWalletChange,
	accounts,
	account,
	onAccountChange,
	selectedWallet,
	getAccounts,
	onTfaEnabled
}: {
	account: InjectedAccount | null;
	selectedWallet: EWallet | null;
	switchToWeb2: () => void;
	switchToSignup: () => void;
	accounts: InjectedAccount[];
	onAccountChange: (a: InjectedAccount) => void;
	onWalletChange: (wallet: EWallet | null) => void;
	getAccounts: (wallet: EWallet) => void;
	onTfaEnabled: (token: string) => void;
}) {
	const router = useRouter();

	const setUserAtom = useSetAtom(userAtom);

	const [loading, setLoading] = useState(false);

	const handleLogin = async () => {
		try {
			if (!selectedWallet || !account?.address) return;
			const { address } = account;

			setLoading(true);

			const signature = await WalletClientService.signMessage({
				data: WEB3_AUTH_SIGN_MESSAGE,
				address,
				selectedWallet
			});

			if (!signature) {
				setLoading(false);
				return;
			}

			const data = await NextApiClientService.web3LoginOrSignup({
				address: getSubstrateAddress(address) || address,
				signature,
				wallet: selectedWallet
			});

			if (!data) {
				console.log('Login failed. Please try again later.');
				setLoading(false);
				return;
			}

			if (data.isTFAEnabled && data.tfaToken) {
				onTfaEnabled(data.tfaToken);
				return;
			}

			const accessToken = getCookie(ECookieNames.ACCESS_TOKEN);

			if (!accessToken) {
				setLoading(false);
				return;
			}

			const decodedData = AuthClientService.decodeAccessToken(accessToken);

			if (decodedData) {
				setUserAtom(decodedData);
			}
			router.back();
			setLoading(false);
		} catch (error) {
			console.log('error', error);
			setLoading(false);
		}
	};

	return (
		<div className='w-full'>
			<WalletButtons
				accounts={accounts}
				selectedAddress={account?.address || ''}
				onAddressChange={onAccountChange}
				onWalletChange={onWalletChange}
				selectedWallet={selectedWallet || undefined}
				getAccounts={getAccounts}
				switchToSignup={switchToSignup}
			/>
			<div>
				{account?.address && (
					<div className={classes.footer}>
						<Button
							isLoading={loading}
							onClick={handleLogin}
							size='lg'
							className={classes.loginButton}
						>
							Login
						</Button>
					</div>
				)}
				{!selectedWallet && (
					<div className={classes.switchToWeb2}>
						Or
						<Button
							variant='ghost'
							className='px-0 text-text_pink'
							onClick={switchToWeb2}
						>
							Login with Username
						</Button>
					</div>
				)}
				{account?.address && (
					<SwitchToWeb2Signup
						className='mt-4 justify-center'
						switchToSignup={() => {
							switchToWeb2();
							switchToSignup();
						}}
					/>
				)}
			</div>
		</div>
	);
}

export default Web3Login;
