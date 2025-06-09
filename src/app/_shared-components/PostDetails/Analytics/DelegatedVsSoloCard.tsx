// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';

import { useUserPreferences } from '@/hooks/useUserPreferences';
import { ResponsivePie } from '@nivo/pie';
import { useTranslations } from 'next-intl';
import { THEME_COLORS } from '@/app/_style/theme';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import Image from 'next/image';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import Icon from '@/_assets/analytics/delegated-vs-solo.svg';
import { ETheme } from '@/_shared/types';
import classes from './PostAnalytics.module.scss';

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

	const chartData = [
		{
			color: delegatedColor,
			id: t('delegated'),
			label: t('delegated'),
			value: isAccountsAnalytics ? delegatedValue : formatBnBalance(delegatedValue?.toString(), { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network)
		},
		{
			color: soloColor,
			id: t('solo'),
			label: t('solo'),
			value: isAccountsAnalytics ? soloValue : formatBnBalance(soloValue?.toString(), { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network)
		}
	];
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
				<h2 className='text-base font-bold text-text_primary'>{t('delegatedVsSolo')}</h2>
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
							itemWidth: 85,
							itemsSpacing: 0,
							justify: false,
							symbolShape: 'circle',
							symbolSize: 6,
							translateX: 25,
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
						: formatUSDWithUnits(formatBnBalance(maxValue.toString(), { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network), 1)}{' '}
					<span className='text-text_secondary text-sm'>{isAccountsAnalytics ? t('users') : NETWORKS_DETAILS[network].tokenSymbol}</span>
				</p>
			</div>
		</div>
	);
}

export default DelegatedVsSoloCard;
