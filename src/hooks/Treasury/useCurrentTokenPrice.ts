// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import fetchTokenToUSDPrice from '@/lib/utils/fetchTokenToUSDPrice';
import { useState, useEffect } from 'react';

interface TokenPriceState {
	isLoading: boolean;
	value: string;
}

const useCurrentTokenPrice = (network: string) => {
	const [currentTokenPrice, setCurrentTokenPrice] = useState<TokenPriceState>({
		isLoading: true,
		value: ''
	});

	useEffect(() => {
		let cancel = false;

		setCurrentTokenPrice({
			isLoading: true,
			value: ''
		});

		fetchTokenToUSDPrice(network)
			.then((formattedUSD) => {
				if (cancel) return;

				if (formattedUSD === 'N/A') {
					setCurrentTokenPrice({
						isLoading: false,
						value: 'N/A'
					});
					return;
				}

				setCurrentTokenPrice({
					isLoading: false,
					value: parseFloat(formattedUSD).toFixed(2)
				});
			})
			.catch(() => {
				if (cancel) return;

				setCurrentTokenPrice({
					isLoading: false,
					value: 'N/A'
				});
			});

		return () => {
			cancel = true;
		};
	}, [network]);

	return currentTokenPrice;
};

export default useCurrentTokenPrice;
