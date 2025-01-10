// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export const calculatePercentage = (value: string | number, totalValue: bigint | number) => {
	if (typeof totalValue === 'bigint') {
		if (totalValue === BigInt(0)) return 0;
		const valueBI = BigInt(value);
		return Number((valueBI * BigInt(100) * BigInt(100)) / totalValue) / 100;
	}
	if (totalValue === 0) return 0;
	return (Number(value) * 100) / totalValue;
};
