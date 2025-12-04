// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { EConvictionAmount } from '@/_shared/types';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { Separator } from '@/app/_shared-components/Separator';
import { Slider } from '@/app/_shared-components/Slider';
import { BN, BN_TEN } from '@polkadot/util';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';
import VoteIcon from '@assets/delegation/votingPower.svg';
import LockIcon from '@assets/icons/lock.svg';

const LOCK_PERIODS = ['no lockup period', '≈ 7 days', '≈ 14 days', '≈ 28 days', '≈ 56 days', '≈ 112 days', '≈ 224 days'];

function ConvictionSelector({
	onConvictionChange,
	defaultConviction,
	disabled,
	voteBalance
}: {
	onConvictionChange: (value: EConvictionAmount) => void;
	defaultConviction?: EConvictionAmount;
	disabled?: boolean;
	voteBalance: BN;
}) {
	const t = useTranslations();
	const network = getCurrentNetwork();

	const [conviction, setConviction] = useState<EConvictionAmount>(defaultConviction || EConvictionAmount.ZERO);

	const getConvictionMultiplier = (c: number) => {
		if (c === 0) return 0.1;
		return c;
	};

	return (
		<div className='flex w-full flex-col gap-y-2 rounded-lg bg-page_background px-4 pb-4 pt-6'>
			<Slider
				max={EConvictionAmount.SIX}
				step={1}
				defaultValue={[defaultConviction || EConvictionAmount.ZERO]}
				onValueChange={(value) => {
					setConviction(value[0] as EConvictionAmount);
					onConvictionChange(value[0] as EConvictionAmount);
				}}
				withBottomIndicator
				disabled={disabled}
			/>
			<Separator />
			<div className='flex items-center justify-between text-sm'>
				<div className='flex items-center gap-x-1 text-wallet_btn_text'>
					<Image
						src={VoteIcon}
						alt='vote'
						width={20}
						height={20}
					/>
					{t('ConvictionSelector.votes')}
				</div>
				<span className='font-semibold text-text_primary'>
					{formatBnBalance(
						conviction === EConvictionAmount.ZERO ? voteBalance.div(BN_TEN) : voteBalance.mul(new BN(getConvictionMultiplier(conviction))),
						{ withUnit: true, numberAfterComma: 2 },
						network
					)}
				</span>
			</div>
			<div className='flex items-center justify-between text-sm'>
				<div className='flex items-center gap-x-1 text-wallet_btn_text'>
					<Image
						src={LockIcon}
						alt='lock'
						width={20}
						height={20}
					/>
					{t('ConvictionSelector.lockingPeriod')}
				</div>
				<span className='font-semibold text-text_primary'>{LOCK_PERIODS[`${conviction}`]}</span>
			</div>
			<p className='text-sm text-wallet_btn_text'>{t('ConvictionSelector.lockingPeriodDescription', { tokenSymbol: NETWORKS_DETAILS[`${network}`].tokenSymbol })}</p>
		</div>
	);
}

export default ConvictionSelector;
