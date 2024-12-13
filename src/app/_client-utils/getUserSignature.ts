// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { APPNAME } from '@/_shared/_constants/appName';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { EWallet } from '@/_shared/types';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import { InjectedWindow } from '@polkadot/extension-inject/types';
import { stringToHex } from '@polkadot/util';

export const getUserSignature = async ({ data, address, selectedWallet }: { data: string; address: string; selectedWallet: EWallet }) => {
	const injectedWindow = window as Window & InjectedWindow;
	const wallet = isWeb3Injected ? injectedWindow.injectedWeb3[selectedWallet] : null;

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
};
