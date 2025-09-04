// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { APPNAME } from '@/_shared/_constants/appName';
import { EWallet } from '@/_shared/types';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import { Injected, InjectedWindow } from '@polkadot/extension-inject/types';

export async function getInjectedWallet(selectedWallet: EWallet): Promise<Injected | undefined> {
	const injectedWindow = window as Window & InjectedWindow;
	const wallet = typeof window !== 'undefined' && isWeb3Injected ? injectedWindow.injectedWeb3[String(selectedWallet)] : null;

	if (!wallet) return undefined;

	const injected: Injected | undefined = await new Promise((resolve, reject) => {
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

	return injected;
}
