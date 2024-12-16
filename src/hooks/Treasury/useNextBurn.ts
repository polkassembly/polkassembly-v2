// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useState, useEffect } from 'react';
import { BN_MILLION, BN_ZERO, u8aConcat, u8aToHex } from '@polkadot/util';
import BN from 'bn.js';
import { PolkadotApiService } from '@/app/_client-services/polkadot_api_service';
import { usePolkadotApi } from '@/app/_atoms/polkadotJsApiAtom';
import { ENetwork } from '@/_shared/types';
import formatBnBalance from '@/lib/utils/formatBnBalance';
import formatUSDWithUnits from '@/lib/utils/formatUSDWithUnits';

interface NextBurnState {
	isLoading: boolean;
	value: string;
	valueUSD: string;
}

const EMPTY_U8A_32 = new Uint8Array(32);

export const useNextBurn = (network: string, currentTokenPrice: { value: string | null }) => {
	const api: PolkadotApiService | null = usePolkadotApi(ENetwork.ROCOCO);
	const [nextBurn, setNextBurn] = useState<NextBurnState>({
		isLoading: true,
		value: '',
		valueUSD: ''
	});

	useEffect(() => {
		if (!api) {
			return;
		}

		setNextBurn({
			isLoading: true,
			value: '',
			valueUSD: ''
		});

		const treasuryAccount = u8aConcat(
			'modl',
			api?.consts?.treasury && api?.consts?.treasury?.palletId
				? api?.consts?.treasury?.palletId?.toU8a(true)
				: `${['polymesh', 'polymesh-test'].includes(network) ? 'pm' : 'pr'}/trsry`,
			EMPTY_U8A_32
		);

		api?.derive?.balances
			?.account(u8aToHex(treasuryAccount))
			.then((treasuryBalance) => {
				api.query.system
					.account(treasuryAccount)
					.then((res) => {
						const freeBalance = new BN(res?.data?.free) || BN_ZERO;
						treasuryBalance.freeBalance = freeBalance;
					})
					.finally(() => {
						let valueUSD = '';
						let value = '';
						try {
							const burn =
								treasuryBalance.freeBalance.gt(BN_ZERO) && !api?.consts?.treasury?.burn.isZero()
									? api?.consts?.treasury.burn.mul(treasuryBalance.freeBalance).div(BN_MILLION)
									: BN_ZERO;

							if (burn) {
								const nextBurnValueUSD = parseFloat(
									formatBnBalance(
										burn.toString(),
										{
											numberAfterComma: 2,
											withThousandDelimitor: false,
											withUnit: false
										},
										network
									)
								);
								if (nextBurnValueUSD && currentTokenPrice && currentTokenPrice.value) {
									valueUSD = formatUSDWithUnits((nextBurnValueUSD * Number(currentTokenPrice.value)).toString());
								}
								value = formatUSDWithUnits(
									formatBnBalance(
										burn.toString(),
										{
											numberAfterComma: 0,
											withThousandDelimitor: false,
											withUnit: false
										},
										network
									)
								);
							}
						} catch (error) {
							console.log(error);
						}
						setNextBurn({
							isLoading: false,
							value,
							valueUSD
						});
					});
			})
			.catch((e: any) => {
				console.error(e);
				setNextBurn({
					isLoading: false,
					value: '',
					valueUSD: ''
				});
			});
	}, [api, currentTokenPrice, network]);

	return nextBurn;
};
