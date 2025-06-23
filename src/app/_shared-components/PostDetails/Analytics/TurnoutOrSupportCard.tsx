// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, TooltipItem } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { BN, BN_ZERO } from '@polkadot/util';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { useTranslations } from 'next-intl';
import { THEME_COLORS } from '@/app/_style/theme';
import Image from 'next/image';
import Icon from '@/_assets/analytics/support-or-turnout.svg';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { ETheme } from '@/_shared/types';
import classes from './PostAnalytics.module.scss';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

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

	const chartData = {
		labels: [turnout ? t('turnout') : t('support'), t('issuance')],
		datasets: [
			{
				data: [
					formatBnBalance(new BN(turnout || support).toString(), { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network).replace(/,/g, ''),
					formatBnBalance(
						(issuance || BN_ZERO).sub(new BN(turnout || support)).toString(),
						{ numberAfterComma: 0, withThousandDelimitor: false, withUnit: false },
						network
					).replace(/,/g, '')
				],
				backgroundColor: [turnoutColor, issuanceColor],
				borderColor: [turnoutColor, issuanceColor],
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
				pointStyle: 'circle',
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
						return `${label}: ${formatUSDWithUnits(value?.toString(), 1)} ${NETWORKS_DETAILS[network].tokenSymbol}`;
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
					alt='turnout or support'
					width={20}
					height={20}
					className={theme === ETheme.DARK ? 'darkIcon' : ''}
				/>
				<h2 className='text-base font-bold text-text_primary'>
					{turnout ? t('turnout') : t('support')} {t('percentage')}
				</h2>
			</div>
			<div className={classes.chartWrapper}>
				<Doughnut
					data={chartData}
					options={chartOptions}
					className='h-[170px] w-[180px] max-lg:mt-2 max-lg:w-full'
				/>
				<p className='absolute mt-4 block gap-2 text-base font-bold dark:text-white'>{percentage ? `${percentage.toFixed(1)}%` : ''}</p>
			</div>
		</div>
	);
}

export default TurnoutOrSupportCard;
