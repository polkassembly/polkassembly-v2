// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { IBeneficiary, ENetwork } from '@/_shared/types';
import { BN } from '@polkadot/util';

export const groupBeneficiariesByAsset = (beneficiaries: IBeneficiary[] | undefined | null, network: ENetwork): Record<string, BN> => {
	if (!beneficiaries || !Array.isArray(beneficiaries) || !network || !NETWORKS_DETAILS[network]) {
		return {};
	}

	return beneficiaries.reduce((acc: Record<string, BN>, curr: IBeneficiary) => {
		if (!curr) return acc;

		const assetId = curr.assetId || NETWORKS_DETAILS[network].tokenSymbol;

		if (!assetId) return acc;

		if (!acc[assetId]) {
			acc[assetId] = new BN(0);
		}

		try {
			const amount = new BN(curr.amount || '0');
			acc[assetId] = acc[assetId].add(amount);
		} catch (error) {
			console.error(`Error processing beneficiary amount: ${error}`);
		}

		return acc;
	}, {});
};
