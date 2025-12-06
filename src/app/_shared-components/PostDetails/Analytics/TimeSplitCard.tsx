// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IAccountAnalytics, IAnalytics } from '@/_shared/types';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TooltipItem } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTranslations } from 'next-intl';
import { THEME_COLORS } from '@/app/_style/theme';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import Image from 'next/image';
import noData from '@/_assets/activityfeed/gifs/noactivity.gif';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import classes from './PostAnalytics.module.scss';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function TimeSplitCard({
	timeSplitVotes = [],
	isAccountsAnalytics = false
}: {
	timeSplitVotes: IAccountAnalytics['timeSplitVotes'] | IAnalytics['timeSplitVotes'];
	isAccountsAnalytics?: boolean;
}) {
	const t = useTranslations('PostDetails.Analytics');
	const network = getCurrentNetwork();
	const { userPreferences } = useUserPreferences();
	const { theme } = userPreferences;

	const chartData = {
		labels: timeSplitVotes.map((_, index) => (index + 1).toString()),
		datasets: [
			{
				label: t('timeSplit'),
				data: timeSplitVotes.map(({ value }) => {
					return isAccountsAnalytics ? Number(value) : formatBnBalance(value as unknown as string, { withUnit: false, numberAfterComma: 1 }, network).replace(/,/g, '');
				}),
				borderColor: THEME_COLORS.light.time_split_color,
				backgroundColor: THEME_COLORS.light.time_split_color,
				borderWidth: 2,
				fill: false,
				tension: 0.1,
				pointRadius: 0,
				pointHoverRadius: 5,
				pointBackgroundColor: THEME_COLORS.light.time_split_color,
				pointBorderColor: THEME_COLORS.light.time_split_color,
				pointBorderWidth: 2
			}
		]
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		interaction: {
			intersect: false,
			mode: 'index' as const
		},
		plugins: {
			legend: {
				display: false
			},
			tooltip: {
				backgroundColor: theme === 'dark' ? THEME_COLORS.dark.bg_code : THEME_COLORS.light.bg_code,
				titleColor: theme === 'dark' ? THEME_COLORS.dark.basic_text : THEME_COLORS.light.basic_text,
				bodyColor: theme === 'dark' ? THEME_COLORS.dark.basic_text : THEME_COLORS.light.basic_text,
				borderColor: theme === 'dark' ? THEME_COLORS.dark.basic_text : THEME_COLORS.light.basic_text,
				borderWidth: 1,
				cornerRadius: 4,
				titleFont: {
					size: 11,
					weight: 600
				},
				bodyFont: {
					size: 11,
					weight: 600
				},
				callbacks: {
					title(context: TooltipItem<'line'>[]) {
						return `${t('day')}: ${context[0].label}`;
					},
					label(context: TooltipItem<'line'>) {
						return isAccountsAnalytics
							? `${Number(context.parsed.y).toFixed(0)} ${t('voters')}`
							: `${t('votingPower')} ${formatUSDWithUnits(context.parsed.y?.toString() || '0', 1)} ${NETWORKS_DETAILS[network].tokenSymbol}`;
					}
				}
			}
		},
		scales: {
			x: {
				type: 'category' as const,
				grid: {
					display: false
				},
				ticks: {
					color: theme === 'dark' ? THEME_COLORS.dark.nivo_fill_color : THEME_COLORS.light.nivo_fill_color,
					font: {
						size: 11
					},
					callback(value: string | number, index: number) {
						// Show every 7th tick if we have 14 or more data points
						if (timeSplitVotes && timeSplitVotes.length >= 14) {
							return (index + 1) % 7 === 0 ? (index + 1).toString() : '';
						}
						return (index + 1).toString();
					}
				},
				border: {
					color: theme === 'dark' ? THEME_COLORS.dark.btn_secondary_border : THEME_COLORS.light.btn_secondary_border
				}
			},
			y: {
				type: 'linear' as const,
				grid: {
					color: theme === 'dark' ? THEME_COLORS.dark.primary_border : THEME_COLORS.light.primary_border,
					borderDash: [2, 2]
				},
				ticks: {
					color: theme === 'dark' ? THEME_COLORS.dark.nivo_fill_color : THEME_COLORS.light.nivo_fill_color,
					font: {
						size: 11
					},
					callback(value: string | number) {
						return isAccountsAnalytics ? value : formatUSDWithUnits(value.toString(), 1);
					}
				},
				border: {
					color: theme === 'dark' ? THEME_COLORS.dark.btn_secondary_border : THEME_COLORS.light.btn_secondary_border
				}
			}
		}
	};

	return (
		<div className={classes.cardWithFullWidth}>
			<h2 className='text-base font-bold text-text_primary xl:text-sm 2xl:text-base'>{t('timeSplit')}</h2>
			{!timeSplitVotes || timeSplitVotes?.length < 1 ? (
				<div className='flex flex-col items-center justify-center gap-5'>
					<Image
						src={noData}
						alt='no data'
						width={100}
						height={100}
						className='my-4'
					/>
					<p className='text-sm'>{t('notEnoughData')}</p>
				</div>
			) : (
				<div className={classes.timeSplitChartWrapper}>
					<Line
						data={chartData}
						options={chartOptions}
					/>
				</div>
			)}
		</div>
	);
}

export default TimeSplitCard;
