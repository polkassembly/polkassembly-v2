// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { TREASURY_NETWORK_CONFIG } from '@/_shared/_constants/treasury';
import { ENetwork } from '@/_shared/types';
import { ApiPromise } from '@polkadot/api';
import { BN, BN_ZERO } from '@polkadot/util';

export async function fetchHydrationADotBalance(address: string, api: ApiPromise, network: ENetwork): Promise<BN> {
	const config = TREASURY_NETWORK_CONFIG[network as ENetwork];
	if (!config || !config.hydrationADotAssetId) {
		return BN_ZERO;
	}
	if (!api.registry || !address) {
		return BN_ZERO;
	}

	try {
		const assetId = api.registry.createType('u32', config.hydrationADotAssetId);
		const accountId = api.registry.createType('AccountId', address);

		const callParams = new Uint8Array([...assetId.toU8a(), ...accountId.toU8a()]);

		if (!callParams || !api.rpc.state) {
			return BN_ZERO;
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = await api.rpc.state.call('CurrenciesApi_account', Array.from(callParams) as any);

		const accountInfo = api.registry.createType('PalletCurrenciesRpcRuntimeApiAccountData', result) as {
			free?: BN;
			reserved?: BN;
		};

		return new BN(accountInfo?.free?.toString() || '0').add(new BN(accountInfo?.reserved?.toString() || '0'));
	} catch (error) {
		console.error('Error fetching Hydration ADot balance:', error);
		return BN_ZERO;
	}
}
