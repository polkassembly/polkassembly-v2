// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { IBeneficiary, ENetwork } from '@/_shared/types';

export const groupBeneficiariesByAsset = (beneficiaries: IBeneficiary[] | undefined, network: ENetwork) => {
	if (!beneficiaries) return {};

	return beneficiaries.reduce((acc: Record<string, number>, curr) => {
		const assetId = curr.assetId || NETWORKS_DETAILS[network].tokenSymbol;
		acc[assetId] = (acc[assetId] || 0) + Number(curr.amount);
		return acc;
	}, {});
};
