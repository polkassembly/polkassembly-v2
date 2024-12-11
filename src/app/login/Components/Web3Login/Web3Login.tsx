// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EAuthCookieNames, EWallet, IAuthResponse } from '@/_shared/types';
import React, { useState } from 'react';
import { InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import { APPNAME } from '@/_shared/_constants/appName';
import { WEB3_AUTH_SIGN_MESSAGE } from '@/_shared/_constants/signMessage';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { stringToHex } from '@polkadot/util';
import { nextApiClientFetch } from '@/app/_client-utils/nextApiClientFetch';
import { Button } from '@/app/_shared-components/Button';
import { useRouter } from 'next/navigation';
import WalletButtons from '@ui/WalletsUI/WalletButtons/WalletButtons';
import { userAtom } from '@/app/_atoms/user/userAtom';
import { useSetAtom } from 'jotai';
import { AuthClientService } from '@/app/_client-services/auth_service';
import { getCookie } from 'cookies-next/client';
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
	getAccounts
}: {
	account: InjectedAccount | null;
	selectedWallet: EWallet | null;
	switchToWeb2: () => void;
	switchToSignup: () => void;
	accounts: InjectedAccount[];
	onAccountChange: (a: InjectedAccount) => void;
	onWalletChange: (wallet: EWallet | null) => void;
	getAccounts: (wallet: EWallet) => void;
}) {
	const router = useRouter();

	const setUserAtom = useSetAtom(userAtom);

	const [loading, setLoading] = useState(false);

	const handleLogin = async () => {
		try {
			if (!selectedWallet || !account?.address) return;
			const { address } = account;

			const injectedWindow = window as Window & InjectedWindow;
			const wallet = isWeb3Injected ? injectedWindow.injectedWeb3[selectedWallet] : null;

			if (!wallet) {
				return;
			}

			const injected = wallet && wallet.enable && (await wallet.enable(APPNAME));

			const signRaw = injected && injected.signer && injected.signer.signRaw;
			if (!signRaw) {
				console.error('Signer not available');
				return;
			}

			setLoading(true);

			let substrateAddress;
			if (!address.startsWith('0x')) {
				substrateAddress = getSubstrateAddress(address);
				if (!substrateAddress) {
					console.error('Invalid address');
					setLoading(false);
					return;
				}
			} else {
				substrateAddress = address;
			}

			const { signature } = await signRaw({
				address: substrateAddress,
				data: stringToHex(WEB3_AUTH_SIGN_MESSAGE),
				type: 'bytes'
			});

			const data = await nextApiClientFetch<IAuthResponse>('/auth/actions/web3LoginOrSignup', {
				address: substrateAddress,
				signature,
				wallet: selectedWallet
			});

			if (!data) {
				console.log('Login failed. Please try again later.');
				setLoading(false);
				return;
			}

			const accessToken = getCookie(EAuthCookieNames.ACCESS_TOKEN);

			if (!accessToken) {
				console.log('No Access token found.');
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
