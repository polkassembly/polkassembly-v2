// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EWallet } from '@/_shared/types';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { getAddressesFromWallet } from '@/app/_client-utils/getAddressesFromWallet';
import Web2Signup from './Web2Signup/Web2Signup';
import Web2Login from './Web2Login/Web2Login';
import Web3Login from './Web3Login/Web3Login';
import classes from './Login.module.scss';
import HeaderLabel from './HeaderLabel';

function Login({ userId, isModal }: { userId?: string; isModal?: boolean }) {
	const router = useRouter();

	useEffect(() => {
		if (userId) {
			router.replace('/');
		}
	}, [userId, router]);

	const [isWeb2Login, setIsWeb2Login] = useState<boolean>(false);
	const [isWeb2Signup, setIsWeb2Signup] = useState<boolean>(false);

	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const [address, setAddress] = useState<InjectedAccount | null>(null);

	const [selectedWallet, setSelectedWallet] = useState<EWallet | null>(null);

	const switchToWeb2 = () => setIsWeb2Login(true);
	const switchToWeb3 = () => setIsWeb2Login(false);
	const switchWeb2LoginType = () => setIsWeb2Signup((prev) => !prev);

	const onAccountChange = (a: InjectedAccount) => setAddress(a);

	const getAccounts = async (chosenWallet: EWallet): Promise<undefined> => {
		const injectedAccounts = await getAddressesFromWallet(chosenWallet);

		if (injectedAccounts.length === 0) {
			return;
		}

		setAccounts(injectedAccounts);
		if (injectedAccounts.length > 0) {
			setAddress(injectedAccounts[0]);
		}
	};

	const onWalletChange = (chosenWallet: EWallet) => {
		setSelectedWallet(chosenWallet);
		setAccounts([]);
		getAccounts(chosenWallet);
		switchToWeb3();
	};

	return (
		<>
			{!isModal && (
				<div className={classes.header}>
					<HeaderLabel />
				</div>
			)}
			<div className={!isModal ? 'px-12 py-6' : ''}>
				{!isWeb2Login ? (
					<Web3Login
						account={address}
						selectedWallet={selectedWallet}
						accounts={accounts}
						onWalletChange={onWalletChange}
						onAccountChange={onAccountChange}
						switchToWeb2={switchToWeb2}
						switchToSignup={switchWeb2LoginType}
					/>
				) : !isWeb2Signup ? (
					<Web2Login
						accounts={accounts}
						account={address}
						onAccountChange={onAccountChange}
						onWalletChange={onWalletChange}
						switchToSignup={switchWeb2LoginType}
					/>
				) : (
					<Web2Signup
						accounts={accounts}
						account={address}
						onAccountChange={onAccountChange}
						onWalletChange={onWalletChange}
						switchToLogin={switchWeb2LoginType}
					/>
				)}
			</div>
		</>
	);
}

export default Login;
