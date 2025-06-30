// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, TooltipItem } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { ETheme, IAccountAnalytics, IAnalytics } from '@/_shared/types';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useTranslations } from 'next-intl';
import { THEME_COLORS } from '@/app/_style/theme';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import Image from 'next/image';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import Icon from '@/_assets/analytics/total-casted-votes.svg';
import classes from './PostAnalytics.module.scss';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

function TotalVotesCard({ analytics, isAccountsAnalytics = false }: { analytics: IAccountAnalytics | IAnalytics; isAccountsAnalytics?: boolean }) {
	const maxValue = Math.max(Number(analytics?.aye), Number(analytics?.nay), Number(analytics?.abstain));

	const network = getCurrentNetwork();
	const { userPreferences } = useUserPreferences();
	const t = useTranslations('PostDetails.Analytics');
	const { theme } = userPreferences;

	const chartData = {
		labels: [t('aye'), t('nay'), t('abstain')],
		datasets: [
			{
				data: [
					isAccountsAnalytics ? analytics.aye : formatBnBalance(analytics.aye?.toString(), { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network),
					isAccountsAnalytics ? analytics.nay : formatBnBalance(analytics.nay?.toString(), { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network),
					isAccountsAnalytics ? analytics.abstain : formatBnBalance(analytics.abstain?.toString(), { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network)
				],
				backgroundColor: [THEME_COLORS.light.aye_color, THEME_COLORS.light.nay_color, THEME_COLORS.light.abstain_color],
				borderColor: [THEME_COLORS.light.aye_color, THEME_COLORS.light.nay_color, THEME_COLORS.light.abstain_color],
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
					alt='total votes casted'
					width={20}
					height={20}
					className={theme === ETheme.DARK ? 'darkIcon' : ''}
				/>
				<h2 className='text-base font-bold text-text_primary xl:text-sm 2xl:text-base'>{t('totalVotesCasted')}</h2>
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
						: formatUSDWithUnits(formatBnBalance(maxValue.toString(), { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network), 1)}
					<span className='text-text_secondary text-sm'>{isAccountsAnalytics ? t('users') : NETWORKS_DETAILS[`${network}`].tokenSymbol}</span>
				</p>
			</div>
		</div>
	);
}

export default TotalVotesCard;
