// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { ENetwork } from '@/_shared/types';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { useTranslations } from 'next-intl';
import { MdInfoOutline } from 'react-icons/md';

function NextBurnDisplay({
	isNextBurnLoading,
	nextBurnError,
	nextBurn,
	showValueUSD,
	network
}: {
	isNextBurnLoading: boolean;
	nextBurnError: boolean;
	nextBurn: { value: string; valueUSD: string } | null;
	showValueUSD: boolean;
	network: string;
}) {
	const t = useTranslations('ActivityFeed');

	if (isNextBurnLoading) {
		return <Skeleton className='h-8 w-24' />;
	}

	if (nextBurnError) {
		return (
			<div className='flex flex-col'>
				<p className='text-xs text-wallet_btn_text'>{t('nextBurn')}</p>
				<p className='text-xs text-failure'>{t('dataUnavailable')}</p>
			</div>
		);
	}

	if (nextBurn) {
		return (
			<div className='flex flex-col'>
				<div className='flex items-center gap-1 text-wallet_btn_text'>
					<p className='text-xs'>{t('nextBurn')}</p>
					<MdInfoOutline className='text-md' />
				</div>

				<div className='flex items-center gap-2'>
					<p>
						{nextBurn.value} <span className='text-base text-input_text'>{NETWORKS_DETAILS[network as ENetwork]?.tokenSymbol}</span>
					</p>
					{!!showValueUSD && <p className='text-xs text-wallet_btn_text'>~ ${nextBurn.valueUSD}</p>}
				</div>
			</div>
		);
	}

	return (
		<div className='flex flex-col'>
			<p className='text-xs text-wallet_btn_text'>{t('nextBurn')}</p>
			<p className='text-xs text-wallet_btn_text'>{t('unavailable')}</p>
		</div>
	);
}

export default NextBurnDisplay;
