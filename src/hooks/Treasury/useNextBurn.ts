import { useState, useEffect } from 'react';
import { usePolkadotApi } from '@/app/_atoms/polkadotJsApiAtom';
import { ENetwork } from '@/_shared/types';
import formatUSDWithUnits from '@/lib/utils/formatUSDWithUnits';

interface NextBurnState {
	isLoading: boolean;
	value: string;
	valueUSD: string;
}

export const useNextBurn = (network: string, currentTokenPrice: { value: string | null }) => {
	const apiService = usePolkadotApi(ENetwork.POLKADOT);
	const [nextBurn, setNextBurn] = useState<NextBurnState>({
		isLoading: true,
		value: '',
		valueUSD: ''
	});

	useEffect(() => {
		if (!apiService) return;

		setNextBurn({
			isLoading: true,
			value: '',
			valueUSD: ''
		});

		const fetchNextBurn = async () => {
			try {
				const { burn } = await apiService.getTreasuryAccountDetails();
				const tokenDecimals = 10;
				const adjustedBurnValue = parseFloat(burn.toString()) / Math.pow(10, tokenDecimals);

				let value = formatUSDWithUnits(String(adjustedBurnValue.toFixed(0)));
				let valueUSD = '';

				if (currentTokenPrice.value) {
					const totalUSD = adjustedBurnValue * Number(currentTokenPrice.value);
					valueUSD = formatUSDWithUnits(totalUSD.toFixed(2));
				}

				setNextBurn({
					isLoading: false,
					value,
					valueUSD
				});
			} catch (error) {
				console.error('Error fetching next burn:', error);
				setNextBurn({
					isLoading: false,
					value: '',
					valueUSD: ''
				});
			}
		};

		fetchNextBurn();
	}, [apiService, currentTokenPrice.value]);

	return nextBurn;
};
