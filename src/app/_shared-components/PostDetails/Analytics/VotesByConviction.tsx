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
import { ResponsiveBar } from '@nivo/bar';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import classes from './PostAnalytics.module.scss';

interface IVoteConvictionProps {
	votesByConviction: IAccountAnalytics['votesByConviction'] | IAnalytics['votesByConviction'];
	isAccountsAnalytics?: boolean;
}

function VotesByConvictions({ votesByConviction, isAccountsAnalytics }: IVoteConvictionProps) {
	const network = getCurrentNetwork();
	const { userPreferences } = useUserPreferences();
	const t = useTranslations('PostDetails.Analytics');
	const { theme } = userPreferences;

	const colors: { [key: string]: string } = {
		[t('abstain')]: THEME_COLORS.light.abstain_color,
		[t('aye')]: THEME_COLORS.light.aye_color,
		[t('nay')]: THEME_COLORS.light.nay_color
	};

	const chartData = votesByConviction.map((vote) => {
		const convictionValue = vote?.lockPeriod === 0 ? 0.1 : vote?.lockPeriod;
		return {
			[t('abstain')]: isAccountsAnalytics ? vote?.abstain : formatBnBalance(vote?.abstain as unknown as string, { numberAfterComma: 0, withThousandDelimitor: false }, network),
			[t('aye')]: isAccountsAnalytics ? vote?.aye : formatBnBalance(vote?.aye as unknown as string, { numberAfterComma: 0, withThousandDelimitor: false }, network),
			conviction: `${convictionValue}x`,
			[t('nay')]: isAccountsAnalytics ? vote?.nay : formatBnBalance(vote?.nay as unknown as string, { numberAfterComma: 0, withThousandDelimitor: false }, network)
		};
	});

	return (
		<div className={classes.cardWithFullWidth}>
			<h2 className='text-base font-bold'>{t('votesByConviction')}</h2>
			<div className={classes.barChartWrapper}>
				<ResponsiveBar
					colors={(bar) => {
						const id = bar.id.toString();
						return colors[id];
					}}
					data={chartData}
					indexBy='conviction'
					indexScale={{ round: true, type: 'band' }}
					keys={[t('aye'), t('nay'), t('abstain')]}
					margin={{ bottom: 50, left: 50, right: 10, top: 10 }}
					padding={0.5}
					valueScale={{ type: 'linear' }}
					borderRadius={3}
					borderColor={{
						from: 'color',
						modifiers: [['darker', 1.6]]
					}}
					axisTop={null}
					axisRight={null}
					axisBottom={{
						tickPadding: 5,
						tickRotation: 0,
						tickSize: 5,
						truncateTickAt: 0
					}}
					axisLeft={{
						format: (value: number | string) => (!isAccountsAnalytics ? formatUSDWithUnits(value as string, 1) : value),
						tickPadding: 5,
						tickRotation: 0,
						tickSize: 5,
						truncateTickAt: 0
					}}
					enableLabel={false}
					labelSkipWidth={6}
					labelSkipHeight={12}
					labelTextColor={{
						from: 'color',
						modifiers: [['darker', 1.6]]
					}}
					legends={[
						{
							anchor: 'bottom',
							dataFrom: 'keys',
							direction: 'row',
							effects: [
								{
									on: 'hover',
									style: {
										itemOpacity: 1
									}
								}
							],
							itemDirection: 'left-to-right',
							itemHeight: 20,
							itemOpacity: 0.85,
							itemTextColor: theme === 'dark' ? THEME_COLORS.dark.basic_text : THEME_COLORS.light.basic_text,
							itemWidth: 50,
							itemsSpacing: 2,
							justify: false,
							symbolShape: 'circle',
							symbolSize: 6,
							translateX: -20,
							translateY: 50
						}
					]}
					role='application'
					theme={{
						axis: {
							domain: {
								line: {
									stroke: theme === 'dark' ? THEME_COLORS.dark.primary_border : THEME_COLORS.light.primary_border,
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
						legends: {
							text: {
								fontSize: 12,
								textTransform: 'capitalize'
							}
						},
						tooltip: {
							container: {
								background: theme === 'dark' ? THEME_COLORS.dark.bg_code : THEME_COLORS.light.bg_code,
								color: theme === 'dark' ? THEME_COLORS.dark.basic_text : THEME_COLORS.light.basic_text,
								fontSize: 12,
								textTransform: 'capitalize',
								fontWeight: 500
							}
						}
					}}
					ariaLabel='Nivo bar chart demo'
					valueFormat={(value) =>
						`${isAccountsAnalytics ? value : formatUSDWithUnits(value?.toString(), 1)} ${isAccountsAnalytics ? t('users') : NETWORKS_DETAILS[network].tokenSymbol}`
					}
					barAriaLabel={(e) => `${e.id}: ${e.formattedValue} in conviction: ${e.indexValue}`}
				/>
			</div>
		</div>
	);
}

export default VotesByConvictions;
