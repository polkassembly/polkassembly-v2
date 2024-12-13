// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ENetwork, EWallet } from '@/_shared/types';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { getAddressesFromWallet } from '@/app/_client-utils/getAddressesFromWallet';
import { usePolkadotApi } from '@/app/_atoms/polkadotJsApiAtom';
import Web2Signup from './Web2Signup/Web2Signup';
import Web2Login from './Web2Login/Web2Login';
import Web3Login from './Web3Login/Web3Login';
import classes from './Login.module.scss';
import HeaderLabel from './HeaderLabel';
import TwoFactorAuth from './TwoFactorAuth/TwoFactorAuth';

function Login({ userId, isModal }: { userId?: string; isModal?: boolean }) {
	const router = useRouter();

	const apiService = usePolkadotApi(ENetwork.POLKADOT);

	useEffect(() => {
		if (userId) {
			router.replace('/');
		}
	}, [userId, router]);

	const [isWeb3Login, setIsWeb3Login] = useState<boolean>(true);

	const [isWeb2Signup, setIsWeb2Signup] = useState<boolean>(false);

	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const [address, setAddress] = useState<InjectedAccount | null>(null);

	const [selectedWallet, setSelectedWallet] = useState<EWallet | null>(null);

	const [isTFAEnabled, setIsTFAEnabled] = useState<boolean>(false);
	const [tfaToken, setTfaToken] = useState<string>('');

	const switchToWeb2Login = () => {
		setIsWeb3Login(false);
		setIsWeb2Signup(false);
	};

	const switchToWeb2Signup = () => {
		setIsWeb2Signup(true);
		setIsWeb3Login(false);
	};

	const switchToWeb3Login = () => {
		setIsWeb2Signup(false);
		setIsWeb3Login(true);
	};

	const onTfaEnabled = (token: string) => {
		setIsTFAEnabled(true);
		setTfaToken(token);
	};

	const onAccountChange = (a: InjectedAccount) => setAddress(a);

	const getAccounts = async (chosenWallet: EWallet): Promise<undefined> => {
		const injectedAccounts = await getAddressesFromWallet(chosenWallet, apiService || undefined);

		if (injectedAccounts.length === 0) {
			return;
		}

		setAccounts(injectedAccounts);
		if (injectedAccounts.length > 0) {
			setAddress(injectedAccounts[0]);
		}
	};

	const onWalletChange = (chosenWallet: EWallet | null) => {
		setSelectedWallet(chosenWallet);
		setAddress(null);
		setAccounts([]);
		switchToWeb3Login();
	};

	return (
		<>
			{!isModal && (
				<div className={classes.header}>
					<HeaderLabel />
				</div>
			)}
			<div className={!isModal ? 'px-6 py-6 sm:px-12' : ''}>
				{isTFAEnabled && address && selectedWallet ? (
					<TwoFactorAuth
						tfaToken={tfaToken}
						loginAddress={address.address}
						loginWallet={selectedWallet}
						goBack={() => {
							setTfaToken('');
							setIsTFAEnabled(false);
						}}
					/>
				) : isWeb2Signup ? (
					<Web2Signup
						accounts={accounts}
						account={address}
						onAccountChange={onAccountChange}
						onWalletChange={onWalletChange}
						switchToLogin={switchToWeb2Login}
						switchToSignup={switchToWeb2Signup}
						getAccounts={getAccounts}
					/>
				) : isWeb3Login ? (
					<Web3Login
						account={address}
						selectedWallet={selectedWallet}
						accounts={accounts}
						onWalletChange={onWalletChange}
						onAccountChange={onAccountChange}
						switchToWeb2={switchToWeb2Login}
						switchToSignup={switchToWeb2Signup}
						getAccounts={getAccounts}
						onTfaEnabled={onTfaEnabled}
					/>
				) : (
					<Web2Login
						accounts={accounts}
						account={address}
						onAccountChange={onAccountChange}
						onWalletChange={onWalletChange}
						switchToSignup={switchToWeb2Signup}
						getAccounts={getAccounts}
						onTfaEnabled={onTfaEnabled}
					/>
				)}
			</div>
		</>
	);
}

export default Login;
