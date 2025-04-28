// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { TREASURY_NETWORK_CONFIG } from '@/_shared/_constants/treasury';
import { useMemo } from 'react';
import { blockToDays } from '@/_shared/_utils/blockToTime';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { getTimeRemaining } from '@/app/_client-utils/getTimeRemaining';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { BN_ZERO } from '@polkadot/util';
import { cn } from '@/lib/utils';
import styles from './TreasuryStats.module.scss';
import { Progress } from '../Progress/Progress';
import { Tooltip, TooltipTrigger, TooltipContent } from '../Tooltip';
import { Separator } from '../Separator';

export const calculateSpendPeriodProgress = (spendPeriodEndsAt: Date | string | null, durationInDays: number) => {
	if (!spendPeriodEndsAt || !ValidatorService.isValidNumber(durationInDays)) return 0;
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
		return blockToDays({ blocks: spendPeriodInBlocks, network });
	}, [network]);

	const spendPeriodRemaining = useMemo(() => {
		if (!nextSpendAt) return 'N/A';
		const timeObj = getTimeRemaining(nextSpendAt);
		return `${timeObj?.days} days  ${timeObj?.hours} hrs ${timeObj?.minutes} min`;
	}, [nextSpendAt]);

	const spendPeriodProgress = calculateSpendPeriodProgress(nextSpendAt || null, spendPeriodInDays);

	return (
		<div className={cn(styles.treasuryStatsContainer, 'w-1/2')}>
			<div className='flex items-center gap-1'>
				<h2 className='text-sm font-normal text-muted-foreground'>{t('TreasuryStats.spendPeriodRemaining')}</h2>
				<Tooltip>
					<TooltipTrigger asChild>
						<Info className='text-text-grey h-4 w-5' />
					</TooltipTrigger>
					<TooltipContent className='w-40 break-words bg-tooltip_background p-2 text-white'>
						<p>{t('TreasuryStats.spendPeriodTooltip')}</p>
					</TooltipContent>
				</Tooltip>
			</div>
			<div className='mt-2 flex flex-col gap-2'>
				<div className='flex items-center gap-2'>
					<span className='flex items-center gap-1 text-base font-semibold text-muted-foreground dark:text-white'>
						{spendPeriodRemaining} /{' '}
						<span className='text-sm font-normal'>
							{spendPeriodInDays} {t('TreasuryStats.days')}
						</span>
					</span>
				</div>
				<Progress
					value={spendPeriodProgress}
					className='h-1.5 bg-decision_bar_bg'
				/>
			</div>
			<Separator
				orientation='horizontal'
				className='mt-4 w-full'
			/>
			<div className='mt-4 flex flex-col gap-2'>
				<div className='flex items-center gap-1'>
					<h2 className='text-sm font-normal text-muted-foreground'>{t('TreasuryStats.nextBurn')}</h2>
					<Tooltip>
						<TooltipTrigger asChild>
							<Info className='text-text-grey h-4 w-5' />
						</TooltipTrigger>
						<TooltipContent className='w-40 break-words bg-tooltip_background p-2 text-white'>
							<p>{t('TreasuryStats.nextBurnTooltip')}</p>
						</TooltipContent>
					</Tooltip>
				</div>
				<div className='text-sm font-medium text-muted-foreground dark:text-white'>
					{formatBnBalance(nextBurn || BN_ZERO, { withUnit: true, numberAfterComma: 2, compactNotation: true }, network)}
				</div>
			</div>
		</div>
	);
}

export default SpendPeriodStats;
