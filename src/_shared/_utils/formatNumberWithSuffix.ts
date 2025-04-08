// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export const formatNumberWithSuffix = (value: number): { formatted: string; suffix: string } => {
	if (value >= 1_000_000_000) {
		return { formatted: (value / 1_000_000_000).toFixed(2), suffix: 'B' };
	}
	if (value >= 1_000_000) {
		return { formatted: (value / 1_000_000).toFixed(2), suffix: 'M' };
	}
	if (value >= 1_000) {
		return { formatted: (value / 1_000).toFixed(2), suffix: 'K' };
	}
	return { formatted: value.toFixed(2), suffix: '' };
};
