// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ChevronDown } from 'lucide-react';
import { BN, BN_ZERO } from '@polkadot/util';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { useEffect, useMemo, useState } from 'react';
import { SubmittableExtrinsic } from '@polkadot/api/types';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useDebounce } from '@/hooks/useDebounce';
import { useTranslations } from 'next-intl';
import { Separator } from '../../Separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../Collapsible';

function TxFeesDetailsView({ extrinsicFn, extraFees }: { extrinsicFn: (SubmittableExtrinsic<'promise'> | null)[]; extraFees?: { name: string; value: BN }[] }) {
	const network = getCurrentNetwork();
	const t = useTranslations();
	const formatter = new Intl.NumberFormat('en-US', { notation: 'compact' });
	const { userPreferences } = useUserPreferences();
	const { apiService } = usePolkadotApiService();

	const [gasFee, setGasFee] = useState<BN | null>(null);

	const { debouncedValue: extrinsicFnDebouncedValue, setValue: setExtrinsicFnDebouncedValue } = useDebounce(extrinsicFn, 500);

	useEffect(() => {
		setExtrinsicFnDebouncedValue(extrinsicFn);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [extrinsicFn]);

	const totalExtraFees = useMemo(() => extraFees?.reduce((acc, fee) => acc.add(fee.value), BN_ZERO) || BN_ZERO, [extraFees]);

	useEffect(() => {
		const fetchFee = async () => {
			if (extrinsicFnDebouncedValue && userPreferences.selectedAccount?.address && apiService) {
				const fee = await apiService.getTxFee({ extrinsicFn: extrinsicFnDebouncedValue, address: userPreferences.selectedAccount.address });
				setGasFee(fee);
			}
		};
		fetchFee();
	}, [apiService, extrinsicFnDebouncedValue, userPreferences.selectedAccount?.address]);

	return (
		<Collapsible className='rounded-lg border border-border_grey bg-page_background p-4'>
			<CollapsibleTrigger className='w-full'>
				<div className='flex w-full items-center justify-between gap-x-2'>
					<p className='font-medium text-text_primary'>Transaction Fee</p>
					<div className='flex-1' />
					<p className='font-medium text-text_primary'>
						{formatter.format(Number(formatBnBalance(totalExtraFees.add(gasFee || BN_ZERO), { withThousandDelimitor: false }, network)))}{' '}
						{NETWORKS_DETAILS[`${network}`].tokenSymbol}
					</p>
					<ChevronDown className='h-4 w-4' />
				</div>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<Separator className='my-4' />
				<div className='flex flex-col gap-y-4'>
					<div className='flex items-center justify-between text-sm text-wallet_btn_text'>
						<p>{t('TxFees.gasFees')}</p>
						<p>
							{formatter.format(Number(formatBnBalance(gasFee || BN_ZERO, { withThousandDelimitor: false }, network)))} {NETWORKS_DETAILS[`${network}`].tokenSymbol}
						</p>
					</div>
					{extraFees &&
						extraFees.map((fee) => (
							<div
								key={fee.name}
								className='flex items-center justify-between text-sm text-wallet_btn_text'
							>
								<p>{fee.name}</p>
								<p>
									{formatter.format(Number(formatBnBalance(fee.value, { withThousandDelimitor: false }, network)))} {NETWORKS_DETAILS[`${network}`].tokenSymbol}
								</p>
							</div>
						))}
				</div>
			</CollapsibleContent>
		</Collapsible>
	);
}

export default TxFeesDetailsView;
