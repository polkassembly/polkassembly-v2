// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';

import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, TooltipItem } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useTranslations } from 'next-intl';
import { THEME_COLORS } from '@/app/_style/theme';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import Image from 'next/image';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import Icon from '@/_assets/analytics/delegated-vs-solo.svg';
import { ETheme } from '@/_shared/types';
import classes from './PostAnalytics.module.scss';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

function DelegatedVsSoloCard({
	delegatedValue,
	soloValue,
	isAccountsAnalytics = false
}: {
	delegatedValue: number | string;
	soloValue: number | string;
	isAccountsAnalytics?: boolean;
}) {
	const network = getCurrentNetwork();
	const { userPreferences } = useUserPreferences();
	const { theme } = userPreferences;
	const t = useTranslations('PostDetails.Analytics');

	const maxValue = Math.max(Number(delegatedValue), Number(soloValue));

	const delegatedColor = THEME_COLORS.light.turnout_color;
	const soloColor = THEME_COLORS.light.issuance_color;

	const chartData = {
		labels: [t('delegated'), t('solo')],
		datasets: [
			{
				data: [
					isAccountsAnalytics ? delegatedValue : formatBnBalance(delegatedValue?.toString(), { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network),
					isAccountsAnalytics ? soloValue : formatBnBalance(soloValue?.toString(), { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network)
				],
				backgroundColor: [delegatedColor, soloColor],
				borderColor: [delegatedColor, soloColor],
				borderWidth: 1,
				hoverOffset: 5
			}
		]
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		rotation: -90, // Start angle at -90 degrees (top)
		circumference: 180, // Semi-circle (180 degrees)
		cutout: '85%', // Inner radius equivalent to innerRadius: 0.85
		plugins: {
			legend: {
				display: true,
				position: 'bottom' as const,
				labels: {
					usePointStyle: true,
					pointStyle: 'circle',
					padding: 10,
					font: {
						size: 10
					},
					color: theme === 'dark' ? THEME_COLORS.dark.basic_text : THEME_COLORS.light.basic_text
				}
			},
			tooltip: {
				backgroundColor: theme === 'dark' ? THEME_COLORS.dark.bg_code : THEME_COLORS.light.bg_code,
				titleColor: theme === 'dark' ? THEME_COLORS.dark.basic_text : THEME_COLORS.light.basic_text,
				bodyColor: theme === 'dark' ? THEME_COLORS.dark.basic_text : THEME_COLORS.light.basic_text,
				borderColor: theme === 'dark' ? THEME_COLORS.dark.basic_text : THEME_COLORS.light.basic_text,
				borderWidth: 1,
				cornerRadius: 4,
				titleFont: {
					size: 12,
					weight: 500
				},
				bodyFont: {
					size: 12,
					weight: 500
				},
				callbacks: {
					label(context: TooltipItem<'doughnut'>) {
						const value = context.parsed;
						const { label } = context;
						return `${label}: ${isAccountsAnalytics ? value : formatUSDWithUnits(value?.toString(), 1)} ${isAccountsAnalytics ? t('users') : NETWORKS_DETAILS[network].tokenSymbol}`;
					}
				}
			}
		},
		elements: {
			arc: {
				borderRadius: 45 // Corner radius equivalent to cornerRadius: 45
			}
		}
	};

	return (
		<div className={classes.card}>
			<div className='flex items-center gap-1'>
				<Image
					src={Icon}
					alt='delegated vs solo'
					width={20}
					height={20}
					className={theme === ETheme.DARK ? 'darkIcon' : ''}
				/>
				<h2 className='text-base font-bold text-text_primary xl:text-sm 2xl:text-base'>{t('delegatedVsSolo')}</h2>
			</div>
			<div className={classes.chartWrapper}>
				<Doughnut
					data={chartData}
					options={chartOptions}
					className='h-[170px] w-full max-lg:mt-2'
				/>
				<p className='absolute mt-4 flex items-center gap-1 text-lg font-bold dark:text-white'>
					{isAccountsAnalytics
						? maxValue
						: formatUSDWithUnits(formatBnBalance(maxValue.toString(), { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network), 1)}{' '}
					<span className='text-text_secondary text-sm'>{isAccountsAnalytics ? t('users') : NETWORKS_DETAILS[`${network}`].tokenSymbol}</span>
				</p>
			</div>
		</div>
	);
}

export default DelegatedVsSoloCard;
