// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ENetwork, EWallet } from '@/_shared/types';
import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { Signer } from '@polkadot/types/types';
import { APPNAME } from '@/_shared/_constants/appName';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { stringToHex } from '@polkadot/util';
import { inject } from '@mimirdev/apps-inject';
import { IdentityService } from './identity_service';
import { isMimirDetected } from './isMimirDetected';
import { getInjectedWallet } from '../_client-utils/getInjectedWallet';
import { PolkadotJSApiService } from './polkadotJS_api_service';

export class WalletClientService {
	private injectedWindow: Window & InjectedWindow;

	private polkadotJsApiService?: PolkadotJSApiService;

	private identityService?: IdentityService;

	private readonly network: ENetwork;

	private constructor({
		injectedWindow,
		polkadotJsApiService,
		network,
		identityService
	}: {
		injectedWindow: Window & InjectedWindow;
		polkadotJsApiService?: PolkadotJSApiService;
		network: ENetwork;
		identityService?: IdentityService;
	}) {
		this.network = network;
		this.injectedWindow = injectedWindow;
		this.polkadotJsApiService = polkadotJsApiService;
		this.identityService = identityService;
	}

	static async Init(network: ENetwork, polkadotJsApiService?: PolkadotJSApiService, identityService?: IdentityService) {
		// Todo: wait for doc ready. (async)
		const returnWalletService = async () => {
			const injectedWindow = window as Window & InjectedWindow;
			const isMimirIframe = await isMimirDetected();

			if (isMimirIframe) {
				inject();
			}

			return new WalletClientService({ injectedWindow, polkadotJsApiService, network, identityService });
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
		let injected: Injected | undefined;
		try {
			if (selectedWallet === EWallet.MIMIR) {
				const { web3Enable, web3FromSource } = await import('@polkadot/extension-dapp');

				await web3Enable(APPNAME);
				injected = await web3FromSource('mimir');
			} else {
				injected = await getInjectedWallet(selectedWallet);
			}

			if (!injected) {
				return [];
			}

			if (this.polkadotJsApiService) {
				this.polkadotJsApiService.setSigner(injected.signer as Signer);
			}

			if (this.identityService) {
				this.identityService.setSigner(injected.signer as Signer);
			}

			return injected.accounts.get();
		} catch {
			// TODO: show notification
			return [];
		}
	}

	getInjectedWallets() {
		return this.injectedWindow.injectedWeb3 || {};
	}

	async signMessage({ data, address, selectedWallet }: { data: string; address: string; selectedWallet: EWallet }) {
		const wallet = typeof window !== 'undefined' ? this.injectedWindow.injectedWeb3[String(selectedWallet)] : null;

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
