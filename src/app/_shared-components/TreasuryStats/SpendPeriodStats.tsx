// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { TREASURY_NETWORK_CONFIG } from '@/_shared/_constants/treasury';
import { useMemo } from 'react';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { getTimeRemaining } from '@/app/_client-utils/getTimeRemaining';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { BN, BN_ZERO } from '@polkadot/util';
import { BlockCalculationsService } from '@/app/_client-services/block_calculations_service';
import styles from './TreasuryStats.module.scss';
import { Progress } from '../Progress/Progress';
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
		<div className={styles.treasuryStatsContainer}>
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
					<span className='flex items-center gap-1 text-base font-semibold text-muted-foreground'>
						{spendPeriodRemaining === 'N/A' ? (
							<span className='text-sm font-normal'>N/A</span>
						) : (
							<span className='text-sm font-normal'>
								{spendPeriodRemaining?.days ? (
									<>
										<span className='text-base font-semibold dark:text-white sm:text-lg'>{spendPeriodRemaining?.days}&nbsp;</span>
										<span className='text-lightBlue dark:text-blue-dark-medium text-xs'>days&nbsp;</span>
									</>
								) : null}
								<span className='text-base font-semibold dark:text-white sm:text-lg'>{spendPeriodRemaining?.hours}&nbsp;</span>
								<span className='text-xs'>hrs&nbsp;</span>
								{!spendPeriodRemaining?.days && spendPeriodRemaining?.minutes ? (
									<>
										<span className='text-base font-semibold dark:text-white sm:text-lg'>{spendPeriodRemaining?.minutes}&nbsp;</span>
										<span className='text-xs'>mins&nbsp;</span>
									</>
								) : null}
								/ {spendPeriodInDays} {t('TreasuryStats.days')}
							</span>
						)}
					</span>
				</div>
				<div className='flex w-full items-center gap-2'>
					<Progress
						value={spendPeriodProgress}
						className='h-1.5 bg-progress_pink_indicator'
						indicatorClassName='bg-bg_pink'
					/>
					<span className='text-xs font-semibold'>{spendPeriodProgress.toFixed(1)}%</span>
				</div>
			</div>
			<Separator
				orientation='horizontal'
				className='mt-4 w-full'
			/>
			<div className='mt-2 flex gap-2'>
				<div className='w-[300px] flex-col items-center gap-2'>
					<h2 className='text-sm font-normal text-muted-foreground'>{t('TreasuryStats.nextBurn')}</h2>
					<span className='text-base font-bold dark:text-white'>
						{formatBnBalance(nextBurn || BN_ZERO, { withUnit: true, numberAfterComma: 2, compactNotation: true }, network)}
					</span>
				</div>
				<div className='break-words rounded-md bg-bg_code p-1 text-xs font-medium'>{t('TreasuryStats.nextBurnTooltip')}</div>
			</div>
		</div>
	);
}

export default SpendPeriodStats;
