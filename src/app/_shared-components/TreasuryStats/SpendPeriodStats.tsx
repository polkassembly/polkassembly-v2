// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useTranslations } from 'next-intl';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { TREASURY_NETWORK_CONFIG } from '@/_shared/_constants/treasury';
import { useMemo } from 'react';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { getTimeRemaining } from '@/app/_client-utils/getTimeRemaining';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { BN, BN_ZERO } from '@polkadot/util';
import { BlockCalculationsService } from '@/app/_client-services/block_calculations_service';
import { cn } from '@/lib/utils';
import { AiFillQuestionCircle } from '@react-icons/all-files/ai/AiFillQuestionCircle';
import { Tooltip, TooltipTrigger, TooltipContent } from '../Tooltip';
import { Separator } from '../Separator';

const calculateSpendPeriodProgress = (spendPeriodEndsAt: Date | string | null, durationInDays: number) => {
	if (!spendPeriodEndsAt || !durationInDays) return 0;
	const now = dayjs();
	const endDate = dayjs(spendPeriodEndsAt);
	const startDate = endDate.subtract(durationInDays, 'days');
	if (now.isAfter(endDate)) return 100;
	if (now.isBefore(startDate)) return 0;
	return (now.diff(startDate, 'minutes') / (durationInDays * 24 * 60)) * 100;
};

function SpendPeriodStats({ nextSpendAt, nextBurn }: { nextSpendAt?: Date; nextBurn?: string }) {
	const t = useTranslations();
	const network = getCurrentNetwork();
	const spendPeriodInDays = useMemo(() => {
		const spendPeriodInBlocks = TREASURY_NETWORK_CONFIG?.[`${network}`]?.spendPeriodInBlocks;
		if (!spendPeriodInBlocks) return 0;
		const blocksPerDay = BlockCalculationsService.getBlocksPerDay(network);
		return spendPeriodInBlocks.div(new BN(blocksPerDay)).toNumber();
	}, [network]);

	const spendPeriodRemaining = useMemo(() => {
		if (!nextSpendAt) return 'N/A';
		return getTimeRemaining(nextSpendAt);
	}, [nextSpendAt]);

	const spendPeriodProgress = calculateSpendPeriodProgress(nextSpendAt || null, spendPeriodInDays);

	return (
		<div>
			<div className='flex h-full w-full flex-col justify-between gap-4 lg:flex-row lg:items-center'>
				<div className='flex flex-1 flex-col justify-between gap-y-2'>
					<div className='flex items-center gap-1'>
						<h2 className='text-sm font-semibold text-text_primary'>{t('TreasuryStats.spendPeriodRemaining')}</h2>
						<Tooltip>
							<TooltipTrigger asChild>
								<AiFillQuestionCircle className='h-4 w-5 text-question_icon_color' />
							</TooltipTrigger>
							<TooltipContent className='w-40 break-words bg-tooltip_background p-2 text-btn_primary_text'>
								<p>{t('TreasuryStats.spendPeriodTooltip')}</p>
							</TooltipContent>
						</Tooltip>
					</div>

					<div className='flex flex-col gap-2 md:flex-row md:items-center'>
						<div className='flex h-5 items-center gap-[2px]'>
							{Array.from({ length: 40 }, (_, i) => i).map((i) => {
								const isActive = i < (spendPeriodProgress / 100) * 40;
								return (
									<div
										key={i}
										className={cn('h-3 w-1 rounded-[1px]', isActive ? 'bg-text_pink' : 'bg-empty_bar_bg')}
									/>
								);
							})}
						</div>
						<span className='whitespace-nowrap text-xs text-text_primary'>
							{spendPeriodRemaining === 'N/A' ? (
								'N/A'
							) : (
								<span className='font-semibold'>
									{spendPeriodRemaining?.days ? <>{spendPeriodRemaining?.days} days </> : ''}
									{spendPeriodRemaining?.hours ? <>{spendPeriodRemaining?.hours} hrs</> : ''}
									<span className='mx-1 font-normal text-wallet_btn_text'>/</span>
									<span className='font-normal text-wallet_btn_text'>{spendPeriodInDays} days</span>
								</span>
							)}
						</span>
					</div>
				</div>

				<Separator
					orientation='vertical'
					className='hidden h-16 w-[1px] lg:block'
				/>
				<div className='flex flex-col justify-between gap-y-1'>
					<div className='flex items-center gap-1'>
						<h2 className='whitespace-nowrap text-sm font-semibold text-text_primary'>{t('TreasuryStats.nextBurn')}</h2>
						<Tooltip>
							<TooltipTrigger asChild>
								<AiFillQuestionCircle className='h-4 w-5 text-question_icon_color' />
							</TooltipTrigger>
							<TooltipContent className='w-40 break-words bg-tooltip_background p-2 text-white'>
								<p>{t('TreasuryStats.nextBurnTooltip')}</p>
							</TooltipContent>
						</Tooltip>
					</div>
					<div>
						<span className='text-lg font-medium text-text_primary'>
							{formatBnBalance(nextBurn || BN_ZERO, { withUnit: true, numberAfterComma: 0, compactNotation: true }, network)}
						</span>
					</div>
				</div>
			</div>
			<p className='text-[10px] text-wallet_btn_text'>{t('TreasuryStats.nextBurnTooltip')}</p>
		</div>
	);
}

export default SpendPeriodStats;
