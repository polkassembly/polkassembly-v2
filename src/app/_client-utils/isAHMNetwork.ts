// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { ENetwork } from '@/_shared/types';

export const isAHMNetwork = (network: ENetwork) => {
	return [ENetwork.POLKADOT, ENetwork.KUSAMA].includes(network);
};
