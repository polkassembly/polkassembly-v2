// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { APPNAME } from '@/_shared/_constants/appName';
import { EWallet } from '@/_shared/types';
import { ApiPromise } from '@polkadot/api';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { Signer } from '@polkadot/types/types';

export async function getAddressesFromWallet(selectedWallet: EWallet, api?: ApiPromise): Promise<InjectedAccount[]> {
	const injectedWindow = window as Window & InjectedWindow;
	const wallet = isWeb3Injected ? injectedWindow.injectedWeb3[selectedWallet] : null;
	if (!wallet) {
		return [];
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
		if (!injected) {
			return [];
		}

		if (api) {
			api.setSigner(injected.signer as Signer);
		}
		return await injected.accounts.get();
	} catch (err) {
		console.log(err);
		return [];
	}
}
