// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ENetwork, IAccountAnalytics, IAnalytics } from '@/_shared/types';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { ResponsiveLine } from '@nivo/line';
import { useTranslations } from 'next-intl';
import { THEME_COLORS } from '@/app/_style/theme';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import Image from 'next/image';
import noData from '@/_assets/activityfeed/gifs/noactivity.gif';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import classes from './PostAnalytics.module.scss';

interface Point {
	data: {
		xFormatted: string;
		yFormatted: string | number;
	};
}

interface ChartTooltipProps {
	point: Point;
	isAccountsAnalytics: boolean;
	network: ENetwork;
}

function ChartTooltip({ point, isAccountsAnalytics, network }: ChartTooltipProps) {
	const t = useTranslations('PostDetails.Analytics');
	const value = isAccountsAnalytics
		? `${Number(point.data.yFormatted).toFixed(0)} ${t('voters')}`
		: `${t('votingPower')} ${formatUSDWithUnits(point.data.yFormatted.toString(), 1)} ${NETWORKS_DETAILS[network].tokenSymbol}`;

	return (
		<div className='flex flex-col gap-1 rounded-md bg-bg_code p-2 text-[11px] text-basic_text shadow-md dark:text-white'>
			<span className='text-xs font-semibold'>{`${t('day')}: ${point.data.xFormatted}`}</span>
			<span className='text-xs font-semibold'>{value}</span>
		</div>
	);
}

const renderTooltip = (props: { point: Point }, options: { isAccountsAnalytics: boolean; network: ENetwork }) => (
	<ChartTooltip
		point={props.point}
		isAccountsAnalytics={options.isAccountsAnalytics}
		network={options.network}
	/>
);

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

	const chartData = [
		{
			color: THEME_COLORS.light.time_split_color,
			data: timeSplitVotes.map(({ value, index }) => {
				const yValue = isAccountsAnalytics ? Number(value) : formatBnBalance(value as unknown as string, { withUnit: false, numberAfterComma: 1 }, network).replace(/,/g, '');
				return {
					x: Number(index),
					y: yValue
				};
			}),
			id: 'timeSplit'
		}
	];
	return (
		<div className={classes.cardWithFullWidth}>
			<h2 className='text-base font-bold text-text_primary'>{t('timeSplit')}</h2>
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
					<ResponsiveLine
						data={chartData}
						margin={{ bottom: 20, left: 50, right: 10, top: 40 }}
						xScale={{ type: 'point' }}
						yScale={{
							max: 'auto',
							min: 'auto',
							reverse: false,
							stacked: true,
							type: 'linear'
						}}
						yFormat=' >-.2f'
						enablePoints={false}
						enableGridX={false}
						colors={['#4064FF']}
						axisTop={null}
						axisRight={null}
						axisLeft={{
							format: (value) => {
								return isAccountsAnalytics ? value : formatUSDWithUnits(value, 1);
							}
						}}
						axisBottom={{
							tickValues:
								timeSplitVotes && timeSplitVotes?.length >= 14
									? Array.from({ length: timeSplitVotes?.length || 0 + 1 }, (_, i) => ((i + 1) % 7 === 0 ? i + 1 : null)).filter((value) => value !== null)
									: undefined
						}}
						pointSize={5}
						pointColor={{ theme: 'background' }}
						pointBorderWidth={2}
						pointBorderColor={{ from: 'serieColor' }}
						pointLabelYOffset={-12}
						useMesh
						tooltip={(props) => renderTooltip(props, { isAccountsAnalytics, network })}
						theme={{
							axis: {
								domain: {
									line: {
										stroke: theme === 'dark' ? THEME_COLORS.dark.btn_secondary_border : THEME_COLORS.light.btn_secondary_border,
										strokeWidth: 1
									}
								},
								ticks: {
									text: {
										fill: theme === 'dark' ? THEME_COLORS.dark.nivo_fill_color : THEME_COLORS.light.nivo_fill_color,
										fontSize: 11,
										outlineColor: 'transparent',
										outlineWidth: 0
									}
								}
							},
							grid: {
								line: {
									stroke: theme === 'dark' ? THEME_COLORS.dark.primary_border : THEME_COLORS.light.primary_border,
									strokeDasharray: '2 2',
									strokeWidth: 1
								}
							},
							tooltip: {
								container: {
									background: theme === 'dark' ? THEME_COLORS.dark.bg_code : THEME_COLORS.light.bg_code,
									color: theme === 'dark' ? THEME_COLORS.dark.basic_text : THEME_COLORS.light.basic_text,
									fontSize: 14
								}
							}
						}}
					/>
				</div>
			)}
		</div>
	);
}

export default TimeSplitCard;
