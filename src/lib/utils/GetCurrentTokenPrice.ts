import fetchTokenToUSDPrice from './fetchTokenToUSDPrice';

export const GetCurrentTokenPrice = (network: string, setCurrentTokenPrice: (pre: { isLoading: boolean; value: string }) => void) => {
	let cancel = false;
	if (cancel) return;

	setCurrentTokenPrice({
		isLoading: true,
		value: ''
	});
	fetchTokenToUSDPrice(network)
		.then((formattedUSD) => {
			if (formattedUSD === 'N/A') {
				setCurrentTokenPrice({
					isLoading: false,
					value: formattedUSD
				});
				return;
			}

			setCurrentTokenPrice({
				isLoading: false,
				value: ['cere', 'picasso'].includes(network) ? parseFloat(formattedUSD).toFixed(4) : parseFloat(formattedUSD).toFixed(2)
			});
		})
		.catch(() => {
			setCurrentTokenPrice({
				isLoading: false,
				value: 'N/A'
			});
		});

	return () => {
		cancel = true;
	};
};
