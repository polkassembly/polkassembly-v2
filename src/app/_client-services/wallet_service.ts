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
import { inject } from '@mimirdev/apps-inject';
import { isEthNetwork } from '@/_shared/_utils/getSupportedWallets';
import { PolkadotApiService } from './polkadot_api_service';
import { IdentityService } from './identity_service';
import { isMimirDetected } from './isMimirDetected';

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

			const isMimirIframe = await isMimirDetected();

			if (isMimirIframe) {
				inject();
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
		let injected: Injected | undefined;
		try {
			if (selectedWallet === EWallet.MIMIR) {
				const { web3Enable, web3FromSource } = await import('@polkadot/extension-dapp');

				await web3Enable(APPNAME);
				injected = await web3FromSource('mimir');
			} else if (selectedWallet === EWallet.METAMASK && isEthNetwork(this.network)) {
				const { ethereum } = this.injectedWindow;
				if (!ethereum) {
					return [];
				}
				await ethereum.enable(APPNAME);
				const addresses = (await ethereum.request({ method: 'eth_requestAccounts' })) as string[];
				if (!addresses) {
					return [];
				}
				return addresses.map((address) => ({
					address,
					meta: {
						name: address,
						source: EWallet.METAMASK
					}
				}));
			}
			if (selectedWallet === EWallet.TALISMAN && isEthNetwork(this.network)) {
				const { talismanEth } = this.injectedWindow;
				if (!talismanEth) {
					return [];
				}
				await talismanEth.enable(APPNAME);
				const addresses = (await talismanEth.request({
					method: 'eth_accounts'
				})) as string[];
				return addresses.map((address) => ({
					address,
					meta: {
						name: address,
						source: EWallet.TALISMAN
					}
				}));
			}
			if (selectedWallet === EWallet.SUBWALLET && isEthNetwork(this.network)) {
				const { SubWallet } = this.injectedWindow;
				if (!SubWallet) {
					return [];
				}
				await SubWallet.enable(APPNAME);
				const addresses = (await SubWallet.request({
					method: 'eth_accounts'
				})) as string[];
				return addresses.map((address) => ({
					address,
					meta: {
						name: address,
						source: EWallet.SUBWALLET
					}
				}));
			}

			const wallet = typeof window !== 'undefined' && isWeb3Injected ? this.injectedWindow.injectedWeb3[String(selectedWallet)] : null;

			if (!wallet) {
				return [];
			}
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

	getInjectedWallets(network: ENetwork) {
		if (isEthNetwork(network)) {
			return {
				[EWallet.METAMASK]: this.injectedWindow.ethereum || null,
				[EWallet.SUBWALLET]: this.injectedWindow.SubWallet || null,
				[EWallet.TALISMAN]: this.injectedWindow.talismanEth || null
			};
		}
		return this.injectedWindow.injectedWeb3 || {};
	}

	async signMessageEth({ data, address, selectedWallet }: { data: string; address: string; selectedWallet: EWallet }) {
		if (selectedWallet === EWallet.METAMASK) {
			const { ethereum } = this.injectedWindow;
			if (!ethereum) {
				return null;
			}
			return ethereum.request({
				method: 'personal_sign',
				params: [data, address]
			});
		}
		if (selectedWallet === EWallet.SUBWALLET) {
			const { SubWallet } = this.injectedWindow;
			if (!SubWallet) {
				return null;
			}
			return SubWallet.request({
				method: 'personal_sign',
				params: [data, address]
			});
		}
		if (selectedWallet === EWallet.TALISMAN) {
			const { talismanEth } = this.injectedWindow;
			if (!talismanEth) {
				return null;
			}
			return talismanEth.request({
				method: 'personal_sign',
				params: [data, address]
			});
		}
		return null;
	}

	async signMessage({ data, address, selectedWallet }: { data: string; address: string; selectedWallet: EWallet }) {
		if (isEthNetwork(this.network)) {
			return this.signMessageEth({ data, address, selectedWallet });
		}

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
