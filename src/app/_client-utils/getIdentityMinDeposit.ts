// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { PEOPLE_CHAIN_NETWORK_DETAILS } from '@/_shared/_constants/networks';
import { BN } from '@polkadot/util';
import { ENetwork } from '@shared/types';

export function getIdentityMinDeposit(network: ENetwork) {
	const minDeposit = PEOPLE_CHAIN_NETWORK_DETAILS[`${network}`].identityMinDeposit;
	return new BN(minDeposit);
}
