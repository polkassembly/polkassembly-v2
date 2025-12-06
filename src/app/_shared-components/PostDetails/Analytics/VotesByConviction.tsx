// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IAccountAnalytics, IAnalytics } from '@/_shared/types';
import { THEME_COLORS } from '@/app/_style/theme';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { useTranslations } from 'next-intl';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, TooltipItem } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import classes from './PostAnalytics.module.scss';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface IVoteConvictionProps {
	votesByConviction: IAccountAnalytics['votesByConviction'] | IAnalytics['votesByConviction'];
	isAccountsAnalytics?: boolean;
}

function VotesByConvictions({ votesByConviction, isAccountsAnalytics }: IVoteConvictionProps) {
	const network = getCurrentNetwork();
	const { userPreferences } = useUserPreferences();
	const t = useTranslations('PostDetails.Analytics');
	const { theme } = userPreferences;

	const colors = {
		[t('aye')]: THEME_COLORS.light.aye_color,
		[t('nay')]: THEME_COLORS.light.nay_color,
		[t('abstain')]: THEME_COLORS.light.abstain_color
	};

	const labels = votesByConviction.map((vote) => {
		const convictionValue = vote?.lockPeriod === 0 ? 0.1 : vote?.lockPeriod;
		return `${convictionValue}x`;
	});

	const chartData = {
		labels,
		datasets: [
			{
				label: t('aye'),
				data: votesByConviction.map((vote) =>
					isAccountsAnalytics ? vote?.aye : formatBnBalance(vote?.aye as unknown as string, { numberAfterComma: 0, withThousandDelimitor: false }, network)
				),
				backgroundColor: colors[t('aye')],
				borderColor: colors[t('aye')],
				borderWidth: 1,
				borderRadius: 3
			},
			{
				label: t('nay'),
				data: votesByConviction.map((vote) =>
					isAccountsAnalytics ? vote?.nay : formatBnBalance(vote?.nay as unknown as string, { numberAfterComma: 0, withThousandDelimitor: false }, network)
				),
				backgroundColor: colors[t('nay')],
				borderColor: colors[t('nay')],
				borderWidth: 1,
				borderRadius: 3
			},
			{
				label: t('abstain'),
				data: votesByConviction.map((vote) =>
					isAccountsAnalytics ? vote?.abstain : formatBnBalance(vote?.abstain as unknown as string, { numberAfterComma: 0, withThousandDelimitor: false }, network)
				),
				backgroundColor: colors[t('abstain')],
				borderColor: colors[t('abstain')],
				borderWidth: 1,
				borderRadius: 3
			}
		]
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
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
					label(context: TooltipItem<'bar'>) {
						const value = context.parsed.y;
						const { label } = context.dataset;
						const conviction = context.label;
						return `${label}: ${isAccountsAnalytics ? value : formatUSDWithUnits(value?.toString() || '0', 1)} ${isAccountsAnalytics ? t('users') : NETWORKS_DETAILS[network].tokenSymbol} in conviction: ${conviction}`;
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
					}
				},
				border: {
					color: theme === 'dark' ? THEME_COLORS.dark.primary_border : THEME_COLORS.light.primary_border
				},
				stacked: true
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
					color: theme === 'dark' ? THEME_COLORS.dark.primary_border : THEME_COLORS.light.primary_border
				},
				stacked: true
			}
		}
	};

	return (
		<div className={classes.cardWithFullWidth}>
			<h2 className={classes.heading}>{t('votesByConviction')}</h2>
			<div className={classes.barChartWrapper}>
				<Bar
					data={chartData}
					options={chartOptions}
					className='h-[250px] w-full'
				/>
			</div>
		</div>
	);
}

export default VotesByConvictions;
