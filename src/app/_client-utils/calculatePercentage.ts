// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BN } from '@polkadot/util';

export const calculatePercentage = (value: string | number, totalValue: BN | number) => {
	if (totalValue instanceof BN) {
		if (totalValue.isZero()) return 0;
		const valueBN = new BN(value.toString());
		const hundred = new BN(100);
		const result = valueBN.mul(hundred).mul(hundred).div(totalValue);
		return result.toNumber() / 100;
	}
	if (totalValue === 0) return 0;
	return (Number(value) * 100) / totalValue;
};
