// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EWallet } from '@/_shared/types';
import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { Signer } from '@polkadot/types/types';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import { APPNAME } from '@/_shared/_constants/appName';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { stringToHex } from '@polkadot/util';
import { PolkadotApiService } from './polkadot_api_service';

export class WalletClientService {
	private injectedWindow: Window & InjectedWindow;

	private constructor(injectedWindow: Window & InjectedWindow) {
		this.injectedWindow = injectedWindow;
	}

	static async Init(injectedWindow: Window & InjectedWindow) {
		return new WalletClientService(injectedWindow);
	}

	async getAddressesFromWallet(selectedWallet: EWallet, apiService?: PolkadotApiService): Promise<InjectedAccount[]> {
		const wallet = isWeb3Injected ? this.injectedWindow.injectedWeb3[selectedWallet] : null;
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

			if (apiService) {
				apiService.setSigner(injected.signer as Signer);
			}
			return await injected.accounts.get();
		} catch (err) {
			console.log(err);
			return [];
		}
	}

	getInjectedWallets() {
		if (document.readyState === 'complete') {
			return this.injectedWindow.injectedWeb3 || {};
		}
		return {};
	}

	async signMessage({ data, address, selectedWallet }: { data: string; address: string; selectedWallet: EWallet }) {
		const wallet = isWeb3Injected ? this.injectedWindow.injectedWeb3[selectedWallet] : null;

		if (!wallet) {
			return null;
		}

		const injected = wallet && wallet.enable && (await wallet.enable(APPNAME));

		const signRaw = injected && injected.signer && injected.signer.signRaw;
		if (!signRaw) {
			console.error('Signer not available');
			return null;
		}

		let substrateAddress;
		if (!address.startsWith('0x')) {
			substrateAddress = getSubstrateAddress(address);
			if (!substrateAddress) {
				console.error('Invalid address');
				return null;
			}
		} else {
			substrateAddress = address;
		}

		const { signature } = await signRaw({
			address: substrateAddress,
			data: stringToHex(data),
			type: 'bytes'
		});

		return signature;
	}

	static getWalletNameLabel(wallet: EWallet) {
		return wallet === EWallet.SUBWALLET ? wallet.charAt(0).toUpperCase() + wallet.slice(1).split('-')[0] : wallet.charAt(0).toUpperCase() + wallet.slice(1).replace('-', '.');
	}
}
