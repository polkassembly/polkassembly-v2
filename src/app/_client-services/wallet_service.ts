// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ENetwork, EWallet } from '@/_shared/types';
import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { Signer } from '@polkadot/types/types';
import { APPNAME } from '@/_shared/_constants/appName';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { stringToHex } from '@polkadot/util';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import { PolkadotApiService } from './polkadot_api_service';
import { IdentityService } from './identity_service';

export class WalletClientService {
	private injectedWindow: Window & InjectedWindow;

	private apiService: PolkadotApiService;

	private identityService?: IdentityService;

	private readonly network: ENetwork;

	private constructor(injectedWindow: Window & InjectedWindow, apiService: PolkadotApiService, network: ENetwork, identityService?: IdentityService) {
		this.network = network;
		this.injectedWindow = injectedWindow;
		this.apiService = apiService;
		this.identityService = identityService;
	}

	static async Init(network: ENetwork, apiService: PolkadotApiService, identityService?: IdentityService) {
		// Todo: wait for doc ready. (async)
		const returnWalletService = async () => {
			const injectedWindow = window as Window & InjectedWindow;

			await apiService.apiReady();
			if (identityService) {
				await identityService.ready();
			}

			return new WalletClientService(injectedWindow, apiService, network, identityService);
		};

		if (document.readyState !== 'loading') {
			return returnWalletService();
		}
		document.addEventListener('DOMContentLoaded', () => {
			returnWalletService();
		});
		return null;
	}

	async getAddressesFromWallet(selectedWallet: EWallet): Promise<InjectedAccount[]> {
		const wallet = typeof window !== 'undefined' && isWeb3Injected ? this.injectedWindow.injectedWeb3[String(selectedWallet)] : null;
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

			if (this.apiService) {
				this.apiService.setSigner(injected.signer as Signer);
			}

			if (this.identityService) {
				this.identityService.setSigner(injected.signer as Signer);
			}

			return await injected.accounts.get();
		} catch {
			// TODO: show notification
			return [];
		}
	}

	getInjectedWallets() {
		return this.injectedWindow.injectedWeb3 || {};
	}

	async signMessage({ data, address, selectedWallet }: { data: string; address: string; selectedWallet: EWallet }) {
		const wallet = typeof window !== 'undefined' && isWeb3Injected ? this.injectedWindow.injectedWeb3[String(selectedWallet)] : null;

		if (!wallet) {
			return null;
		}

		const injected = wallet && wallet.enable && (await wallet.enable(APPNAME));

		const signRaw = injected && injected.signer && injected.signer.signRaw;
		if (!signRaw) {
			// TODO: show notification
			return null;
		}

		let substrateAddress;
		if (!address.startsWith('0x')) {
			substrateAddress = getSubstrateAddress(address);
			if (!substrateAddress) {
				// TODO: show notification
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
