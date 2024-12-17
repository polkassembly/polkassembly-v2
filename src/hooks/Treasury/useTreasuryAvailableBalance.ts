// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useState, useEffect } from 'react';
import { usePolkadotApi } from '@/app/_atoms/polkadotJsApiAtom';
import { ENetwork } from '@/_shared/types';
import formatBnBalance from '@/lib/utils/formatBnBalance';
import formatUSDWithUnits from '@/lib/utils/formatUSDWithUnits';
import { BN_ZERO } from '@polkadot/util';

interface AvailableBalanceState {
	isLoading: boolean;
	value: string;
	valueUSD: string;
}

const useTreasuryAvailableBalance = (network: string, currentTokenPrice: { value: string | null }) => {
	const apiService = usePolkadotApi(ENetwork.POLKADOT);
	const [available, setAvailable] = useState<AvailableBalanceState>({
		isLoading: true,
		value: '',
		valueUSD: ''
	});

	useEffect(() => {
		if (!apiService || !currentTokenPrice || !network) return;

		setAvailable({
			isLoading: true,
			value: '',
			valueUSD: ''
		});

		const fetchAvailableBalance = async () => {
			try {
				const { availableBalance } = await apiService.getTreasuryAvailableBalance();

				let value = '';
				let valueUSD = '';

				if (availableBalance.gt(BN_ZERO)) {
					const availableValueUSD = parseFloat(formatBnBalance(availableBalance.toString(), { numberAfterComma: 2, withThousandDelimitor: false, withUnit: false }, network));

					if (availableValueUSD && currentTokenPrice?.value && currentTokenPrice.value !== 'N/A') {
						valueUSD = formatUSDWithUnits((availableValueUSD * Number(currentTokenPrice.value)).toString());
					}

					value = formatUSDWithUnits(formatBnBalance(availableBalance.toString(), { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network));
				}

				setAvailable({
					isLoading: false,
					value,
					valueUSD
				});
			} catch (error) {
				console.error('Error fetching treasury available balance:', error);
				setAvailable({
					isLoading: false,
					value: '',
					valueUSD: ''
				});
			}
		};

		fetchAvailableBalance();
	}, [apiService, currentTokenPrice, network]);

	return available;
};

export default useTreasuryAvailableBalance;
