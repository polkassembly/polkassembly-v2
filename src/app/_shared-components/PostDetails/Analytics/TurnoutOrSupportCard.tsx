// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { ResponsivePie } from '@nivo/pie';
import { BN, BN_ZERO } from '@polkadot/util';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { useTranslations } from 'next-intl';
import { THEME_COLORS } from '@/app/_style/theme';
import Image from 'next/image';
import Icon from '@/_assets/analytics/support_or_turnout.svg';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import classes from './PostAnalytics.module.scss';

interface IVotesTurnoutProps {
	support: string;
	turnout?: string;
}

function TurnoutOrSupportCard({ turnout, support }: IVotesTurnoutProps) {
	const { userPreferences } = useUserPreferences();
	const { theme } = userPreferences;
	const network = getCurrentNetwork();
	const t = useTranslations('PostDetails.Analytics');
	const { apiService } = usePolkadotApiService();

	const [issuance, setIssuance] = useState<BN | null>(null);

	const percentage = useMemo(() => {
		if (!issuance || issuance.lte(BN_ZERO) || (!turnout && !support)) return 0;
		return (Number(turnout || support) / Number(issuance?.toString())) * 100;
	}, [issuance, turnout, support]);

	const turnoutColor = THEME_COLORS.light.turnout_color;
	const issuanceColor = THEME_COLORS.light.issuance_color;

	const getIssuance = useCallback(async () => {
		if (!apiService) return;
		const totalIssuance = await apiService?.getTotalIssuance();
		const inactiveIssuance = await apiService?.getInactiveIssuance();
		const totalIssuanceBN = new BN(totalIssuance?.toString() || BN_ZERO.toString());
		const inactiveIssuanceBN = new BN(inactiveIssuance?.toString() || BN_ZERO.toString());
		const activeIssuance = totalIssuanceBN.sub(inactiveIssuanceBN);

		setIssuance(activeIssuance.lte(BN_ZERO) ? null : activeIssuance);
	}, [apiService]);

	useEffect(() => {
		getIssuance();
	}, [getIssuance]);

	const chartData = [
		{
			color: turnoutColor,
			id: turnout ? t('turnout') : t('support'),
			label: turnout ? t('turnout') : t('support'),
			value: formatBnBalance(new BN(turnout || support).toString(), { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network).replace(/,/g, '')
		},
		{
			color: issuanceColor,
			id: t('issuance'),
			label: t('issuance'),
			value: formatBnBalance(
				(issuance || BN_ZERO).sub(new BN(turnout || support)).toString(),
				{ numberAfterComma: 0, withThousandDelimitor: false, withUnit: false },
				network
			).replace(/,/g, '')
		}
	];

	return (
		<div className={classes.card}>
			<div className='flex items-center gap-1'>
				<Image
					src={Icon}
					alt='turnout or support'
					width={20}
					height={20}
				/>
				<h2 className='text-base font-bold text-text_primary'>
					{turnout ? t('turnout') : t('support')} {t('percentage')}
				</h2>
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
							translateX: 15,
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
								textTransform: 'capitalize'
							}
						}
					}}
					valueFormat={(value) => `${formatUSDWithUnits(value?.toString(), 1)} ${NETWORKS_DETAILS[network].tokenSymbol}`}
				/>
				<p className='absolute mt-4 block gap-2 text-base font-bold dark:text-white'>{percentage ? `${percentage.toFixed(1)}%` : ''}</p>
			</div>
		</div>
	);
}

export default TurnoutOrSupportCard;
