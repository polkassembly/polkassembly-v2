// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { subscanApiHeaders } from '@/lib/utils/apiHeaders';

interface WeeklyPriceChangeState {
	isLoading: boolean;
	value: string;
}

const useWeeklyPriceChange = (network: string, currentTokenPrice: { value: string | null; isLoading: boolean }) => {
	const [priceWeeklyChange, setPriceWeeklyChange] = useState<WeeklyPriceChangeState>({
		isLoading: true,
		value: ''
	});

	useEffect(() => {
		let cancel = false;

		if (!currentTokenPrice.value || currentTokenPrice.isLoading || !network) {
			return;
		}

		setPriceWeeklyChange({
			isLoading: true,
			value: ''
		});

		const fetchWeekAgoTokenPrice = async () => {
			if (cancel) return;

			const weekAgoDate = dayjs().subtract(7, 'd').format('YYYY-MM-DD');

			try {
				const response = await fetch(`${NETWORKS_DETAILS[network].externalLinks}/api/scan/price/history`, {
					body: JSON.stringify({
						end: weekAgoDate,
						start: weekAgoDate
					}),
					headers: subscanApiHeaders,
					method: 'POST'
				});

				const responseJSON = await response.json();

				if (responseJSON.message === 'Success') {
					const weekAgoPrice = responseJSON?.data?.list?.[0]?.price || responseJSON?.data?.ema7_average;

					if (typeof currentTokenPrice.value === 'string') {
						const currentTokenPriceNum: number = parseFloat(currentTokenPrice.value);
						const weekAgoPriceNum: number = parseFloat(weekAgoPrice);

						if (weekAgoPriceNum === 0) {
							setPriceWeeklyChange({
								isLoading: false,
								value: 'N/A'
							});
							return;
						}

						const percentChange = ((currentTokenPriceNum - weekAgoPriceNum) / weekAgoPriceNum) * 100;

						setPriceWeeklyChange({
							isLoading: false,
							value: percentChange.toFixed(2)
						});
						return;
					}
				}

				setPriceWeeklyChange({
					isLoading: false,
					value: 'N/A'
				});
			} catch (err) {
				console.error('Error fetching weekly price change:', err);
				setPriceWeeklyChange({
					isLoading: false,
					value: 'N/A'
				});
			}
		};

		fetchWeekAgoTokenPrice();

		return () => {
			cancel = true;
		};
	}, [currentTokenPrice, network]);

	return priceWeeklyChange;
};

export default useWeeklyPriceChange;
