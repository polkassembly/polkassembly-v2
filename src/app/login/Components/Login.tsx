// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EWallet } from '@/_shared/types';
import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { APPNAME } from '@/_shared/_constants/appName';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import Web2Signup from './Web2Signup/Web2Signup';
import Web2Login from './Web2Login/Web2Login';
import Web3Login from './Web3Login/Web3Login';

function Login({ userId }: { userId?: string }) {
	const router = useRouter();

	useEffect(() => {
		if (userId) {
			router.replace('/');
		}
	}, [userId, router]);

	const [isWeb2Login, setIsWeb2Login] = useState<boolean>(false);
	const [isWeb2Signup, setIsWeb2Signup] = useState<boolean>(false);

	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const [address, setAddress] = useState<string>('');

	const [selectedWallet, setSelectedWallet] = useState<EWallet | null>(null);

	const switchToWeb2 = () => setIsWeb2Login(true);
	const switchToWeb3 = () => setIsWeb2Login(false);
	const switchWeb2LoginType = () => setIsWeb2Signup((prev) => !prev);

	const onAccountChange = (a: string) => setAddress(a);

	const getAccounts = async (chosenWallet: EWallet): Promise<undefined> => {
		const injectedWindow = window as Window & InjectedWindow;
		const wallet = isWeb3Injected ? injectedWindow.injectedWeb3[chosenWallet] : null;
		if (!wallet) {
			return;
		}

		let injected: Injected | undefined;
		try {
			injected = await new Promise((resolve, reject) => {
				const timeoutId = setTimeout(() => {
					reject(new Error('Wallet Timeout'));
				}, 60000); // wait 60 sec

				if (wallet && wallet.enable) {
					wallet
						.enable(APPNAME)
						.then((value) => {
							clearTimeout(timeoutId);
							resolve(value);
						})
						.catch((error) => {
							reject(error);
						});
				}
			});
		} catch (err) {
			console.log(err);
			// if (err?.message == 'Rejected') {
			// setWalletError('');
			// handleToggle();
			//  else if (err?.message == 'Pending authorisation request already exists for this site. Please accept or reject the request.') {
			// setWalletError('Pending authorisation request already exists. Please accept or reject the request on the wallet extension and try again.');
			// handleToggle();
			// } else if (err?.message == 'Wallet Timeout') {
			// setWalletError('Wallet authorisation timed out. Please accept or reject the request on the wallet extension and try again.');
			// handleToggle();
			// }
		}
		if (!injected) {
			return;
		}

		const accounts = await injected.accounts.get();
		if (accounts.length === 0) {
			return;
		}

		// accounts.forEach((account) => {
		// account.address = getEncodedAddress(account.address, network) || account.address;
		// });

		setAccounts(accounts);
		if (accounts.length > 0) {
			setAddress(accounts[0].address);
		}
	};

	const onWalletChange = (chosenWallet: EWallet) => {
		setSelectedWallet(chosenWallet);
		setAccounts([]);
		getAccounts(chosenWallet);
		switchToWeb3();
	};

	return !isWeb2Login ? (
		<Web3Login
			address={address}
			selectedWallet={selectedWallet}
			accounts={accounts}
			setAccounts={setAccounts}
			onWalletChange={onWalletChange}
			onAccountChange={onAccountChange}
			switchToWeb2={switchToWeb2}
		/>
	) : !isWeb2Signup ? (
		<Web2Login
			accounts={accounts}
			address={address}
			onAccountChange={onAccountChange}
			onWalletChange={onWalletChange}
			switchToSignup={switchWeb2LoginType}
		/>
	) : (
		<Web2Signup
			accounts={accounts}
			address={address}
			onAccountChange={onAccountChange}
			onWalletChange={onWalletChange}
			switchToLogin={switchWeb2LoginType}
		/>
	);
}

export default Login;
