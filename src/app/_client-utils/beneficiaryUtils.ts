// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { IBeneficiaryInput, ENetwork } from '@/_shared/types';
import { BN } from '@polkadot/util';

export const groupBeneficiariesByAsset = (beneficiaries: IBeneficiaryInput[] | undefined | null, network: ENetwork): Record<string, BN> => {
	if (!beneficiaries || !Array.isArray(beneficiaries) || !network || !NETWORKS_DETAILS[network as ENetwork]) {
		return {};
	}

	return beneficiaries.reduce((acc: Record<string, BN>, curr: IBeneficiaryInput) => {
		if (!curr) return acc;

		const assetId = curr.assetId || NETWORKS_DETAILS[network as ENetwork].tokenSymbol;

		if (!assetId) return acc;

		if (!acc[assetId as string]) {
			acc[assetId as string] = new BN(0);
		}

		try {
			const amount = new BN(curr.amount || '0');
			acc[assetId as string] = acc[assetId as string].add(amount);
		} catch (error) {
			console.error(`Error processing beneficiary amount: ${error}`);
		}

		return acc;
	}, {});
};
