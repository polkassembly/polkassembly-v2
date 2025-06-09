// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { ResponsivePie } from '@nivo/pie';
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

function TotalVotesCard({ analytics, isAccountsAnalytics = false }: { analytics: IAccountAnalytics | IAnalytics; isAccountsAnalytics?: boolean }) {
	const maxValue = Math.max(Number(analytics?.aye), Number(analytics?.nay), Number(analytics?.abstain));

	const network = getCurrentNetwork();
	const { userPreferences } = useUserPreferences();
	const t = useTranslations('PostDetails.Analytics');
	const { theme } = userPreferences;

	const chartData = [
		{
			color: THEME_COLORS.light.aye_color,
			id: t('aye'),
			label: t('aye'),
			value: isAccountsAnalytics ? analytics.aye : formatBnBalance(analytics.aye?.toString(), { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network)
		},
		{
			color: THEME_COLORS.light.nay_color,
			id: t('nay'),
			label: t('nay'),
			value: isAccountsAnalytics ? analytics.nay : formatBnBalance(analytics.nay?.toString(), { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network)
		},
		{
			color: THEME_COLORS.light.abstain_color,
			id: t('abstain'),
			label: t('abstain'),
			value: isAccountsAnalytics
				? analytics.abstain
				: formatBnBalance(analytics.abstain?.toString(), { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network)
		}
	];

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
				<h2 className='text-base font-bold text-text_primary'>{t('totalVotesCasted')}</h2>
			</div>
			<div className={classes.chartWrapper}>
				<ResponsivePie
					data={chartData}
					margin={{ bottom: 0, left: 5, right: 5, top: 0 }}
					startAngle={-90}
					endAngle={90}
					innerRadius={0.85}
					padAngle={2}
					cornerRadius={45}
					activeOuterRadiusOffset={5}
					borderWidth={1}
					colors={({ data }) => data.color}
					borderColor={{
						from: 'color',
						modifiers: [['darker', 0.2]]
					}}
					enableArcLabels={false}
					enableArcLinkLabels={false}
					legends={[
						{
							anchor: 'bottom',
							direction: 'row',
							effects: [
								{
									on: 'hover',
									style: {
										itemTextColor: theme === 'dark' ? THEME_COLORS.dark.basic_text : THEME_COLORS.light.basic_text
									}
								}
							],
							itemDirection: 'left-to-right',
							itemHeight: 19,
							itemOpacity: 1,
							itemTextColor: theme === 'dark' ? THEME_COLORS.dark.basic_text : THEME_COLORS.light.basic_text,
							itemWidth: 50,
							itemsSpacing: 0,
							justify: false,
							symbolShape: 'circle',
							symbolSize: 6,
							translateX: 5,
							translateY: -10
						}
					]}
					theme={{
						legends: {
							text: {
								fontSize: 12
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
					valueFormat={(value) =>
						`${isAccountsAnalytics ? value : formatUSDWithUnits(value?.toString(), 1)} ${isAccountsAnalytics ? t('users') : NETWORKS_DETAILS[network].tokenSymbol}`
					}
				/>
				<p className='absolute mt-4 flex items-center gap-1 text-lg font-bold dark:text-white'>
					{isAccountsAnalytics
						? maxValue
						: formatUSDWithUnits(formatBnBalance(maxValue.toString(), { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network), 1)}
					<span className='text-text_secondary text-sm'>{isAccountsAnalytics ? t('users') : NETWORKS_DETAILS[network].tokenSymbol}</span>
				</p>
			</div>
		</div>
	);
}

export default TotalVotesCard;
