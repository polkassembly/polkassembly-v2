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
	delegationVotesByConviction: IAccountAnalytics['delegationVotesByConviction'] | IAnalytics['delegationVotesByConviction'];
	isAccountsAnalytics?: boolean;
}

function DelegationVotesByConvictions({ delegationVotesByConviction, isAccountsAnalytics }: IVoteConvictionProps) {
	const network = getCurrentNetwork();
	const { userPreferences } = useUserPreferences();
	const t = useTranslations('PostDetails.Analytics');
	const { theme } = userPreferences;

	const colors = {
		[t('delegated')]: THEME_COLORS.light.turnout_color,
		[t('solo')]: THEME_COLORS.light.issuance_color
	};

	const labels = delegationVotesByConviction.map((vote) => {
		const convictionValue = vote?.lockPeriod === 0 ? 0.1 : vote?.lockPeriod;
		return `${convictionValue}x`;
	});

	const chartData = {
		labels,
		datasets: [
			{
				label: t('delegated'),
				data: delegationVotesByConviction.map((vote) =>
					isAccountsAnalytics ? vote?.delegated : formatBnBalance(vote?.delegated as unknown as string, { numberAfterComma: 0, withThousandDelimitor: false }, network)
				),
				backgroundColor: colors[t('delegated')],
				borderColor: colors[t('delegated')],
				borderWidth: 1,
				borderRadius: 3
			},
			{
				label: t('solo'),
				data: delegationVotesByConviction.map((vote) =>
					isAccountsAnalytics ? vote?.solo : formatBnBalance(vote?.solo as unknown as string, { numberAfterComma: 0, withThousandDelimitor: false }, network)
				),
				backgroundColor: colors[t('solo')],
				borderColor: colors[t('solo')],
				borderWidth: 1,
				borderRadius: 3
			}
		]
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		scales: {
			x: {
				type: 'category' as const,
				stacked: true,
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
				}
			},
			y: {
				type: 'linear' as const,
				stacked: true,
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
				}
			}
		},
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
		}
	};

	return (
		<div className={classes.cardWithFullWidth}>
			<h2 className={classes.heading}>{t('delegationVotesByConviction')}</h2>
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

export default DelegationVotesByConvictions;
