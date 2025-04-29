// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useEffect, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartOptions, ChartData, Point } from 'chart.js';
import { EPostOrigin, EProposalStatus, IStatusHistoryItem, IVoteCurve } from '@/_shared/types';
import { dayjs } from '@shared/_utils/dayjsInit';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { BlockCalculationsService } from '@/app/_client-services/block_calculations_service';
import { getTrackFunctions } from '@/app/_client-utils/trackCurvesUtils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Props {
	voteCurveData: IVoteCurve[];
	trackName: EPostOrigin;
	timeline?: IStatusHistoryItem[];
	createdAt?: Date;
	setThresholdValues?: (values: { approvalThreshold: number; supportThreshold: number }) => void;
}

function formatHoursAndDays(num: number, unit: 'day' | 'hr') {
	if (num === 1) {
		return `${num}${unit}`;
	}
	return `${num}${unit}s`;
}

function convertGraphPoint(value?: number) {
	if (!value) {
		return '--';
	}

	return `${Number(value).toFixed(2)}%`;
}

function VoteCurves({ voteCurveData, trackName, timeline, createdAt, setThresholdValues }: Props) {
	const network = getCurrentNetwork();

	const { approvalCalc, supportCalc } = getTrackFunctions({ network, trackName });

	const chartData: ChartData<'line', (number | Point | null)[]> = useMemo(() => {
		if (!voteCurveData || voteCurveData.length === 0) {
			return {
				datasets: [],
				labels: []
			};
		}

		const trackInfo = NETWORKS_DETAILS[`${network}`]?.trackDetails?.[`${trackName}`];
		if (!trackInfo) {
			return {
				datasets: [],
				labels: []
			};
		}

		const labels: number[] = [];
		const supportData: { x: number; y: number }[] = [];
		const approvalData: { x: number; y: number }[] = [];

		const approvalThresholdData: { x: number; y: number }[] = [];
		const supportThresholdData: { x: number; y: number }[] = [];

		const statusBlock = timeline?.find((s) => s?.status === EProposalStatus.Deciding);

		const lastGraphPoint = voteCurveData[voteCurveData.length - 1];
		const proposalCreatedAt = dayjs(statusBlock?.timestamp || createdAt || voteCurveData[0].timestamp);

		const { decisionPeriod } = trackInfo;

		const { totalSeconds } = BlockCalculationsService.getTimeForBlocks({ network, blocks: decisionPeriod });
		const decisionPeriodInHrs = Math.floor(dayjs.duration(totalSeconds, 'seconds').asHours());
		const decisionPeriodFromTimelineInHrs = dayjs(lastGraphPoint.timestamp).diff(proposalCreatedAt, 'hour');

		if (decisionPeriodFromTimelineInHrs < decisionPeriodInHrs) {
			for (let i = 0; i < decisionPeriodInHrs; i += 1) {
				labels.push(i);

				if (approvalCalc) {
					approvalThresholdData.push({
						x: i,
						y: approvalCalc(i / decisionPeriodInHrs) * 100
					});
				}

				if (supportCalc) {
					supportThresholdData.push({
						x: i,
						y: supportCalc(i / decisionPeriodInHrs) * 100
					});
				}
			}
		}

		// Process each data point
		voteCurveData.forEach((point) => {
			const hour = dayjs(point.timestamp).diff(proposalCreatedAt, 'hour');
			labels.push(hour);

			if (decisionPeriodFromTimelineInHrs > decisionPeriodInHrs) {
				if (approvalCalc) {
					approvalThresholdData.push({
						x: hour,
						y: approvalCalc(hour / decisionPeriodFromTimelineInHrs) * 100
					});
				}
				if (supportCalc) {
					supportThresholdData.push({
						x: hour,
						y: supportCalc(hour / decisionPeriodFromTimelineInHrs) * 100
					});
				}
			}

			// Add actual data points
			if (point.supportPercent !== undefined) {
				supportData.push({
					x: hour,
					y: point.supportPercent
				});
			}

			if (point.approvalPercent !== undefined) {
				approvalData.push({
					x: hour,
					y: point.approvalPercent
				});
			}
		});

		return {
			datasets: [
				{
					backgroundColor: 'transparent',
					borderColor: '#5BC044',
					borderWidth: 2,
					borderDash: [4, 4],
					data: approvalData,
					label: 'Approval',
					pointHitRadius: 10,
					pointHoverRadius: 5,
					pointRadius: 0,
					tension: 0.1
				},
				{
					backgroundColor: 'transparent',
					borderColor: '#E5007A',
					borderWidth: 2,
					borderDash: [4, 4],
					data: supportData,
					label: 'Support',
					pointHitRadius: 10,
					pointHoverRadius: 5,
					pointRadius: 0,
					tension: 0.1
				},
				{
					backgroundColor: 'transparent',
					borderColor: '#5BC044',
					borderWidth: 2,
					data: approvalThresholdData,
					label: 'Approval Threshold',
					pointHitRadius: 10,
					pointHoverRadius: 5,
					pointRadius: 0,
					tension: 0.1
				},
				{
					backgroundColor: 'transparent',
					borderColor: '#E5007A',
					borderWidth: 2,
					data: supportThresholdData,
					label: 'Support Threshold',
					pointHitRadius: 10,
					pointHoverRadius: 5,
					pointRadius: 0,
					tension: 0.1
				}
			],
			labels
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [voteCurveData]);

	useEffect(() => {
		if (!chartData || !chartData.datasets || chartData.datasets.length < 4) {
			return;
		}

		const approvalThresholdData = chartData.datasets[2].data as Point[];
		const supportThresholdData = chartData.datasets[3].data as Point[];
		const currentApproval = chartData.datasets[0].data[chartData.datasets[0].data.length - 1] as Point;
		const currentSupport = chartData.datasets[1].data[chartData.datasets[1].data.length - 1] as Point;

		setThresholdValues?.({
			approvalThreshold: approvalThresholdData.find((data) => data && data?.x >= currentApproval?.x)?.y || 0,
			supportThreshold: supportThresholdData.find((data) => data && data?.x >= currentSupport?.x)?.y || 0
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [chartData]);

	const chartOptions: ChartOptions<'line'> = {
		animation: {
			duration: 0
		},
		clip: false,
		plugins: {
			legend: {
				display: false,
				position: 'bottom'
			},
			tooltip: {
				callbacks: {
					label(tooltipItem) {
						const { dataIndex, parsed, dataset } = tooltipItem;
						if (dataset.label === 'Support Threshold') {
							const threshold = Number(parsed.y).toFixed(2);
							const data = chartData.datasets.find((d) => d.label === 'Support');

							const currSupport = data?.data.find((d) => (d as Point).x > dataIndex) as Point;
							return `Support: ${convertGraphPoint(currSupport?.y)} / ${threshold}%`;
						}
						if (dataset.label === 'Approval Threshold') {
							const threshold = Number(parsed.y).toFixed(2);
							const data = chartData.datasets.find((d) => d.label === 'Approval');

							const currApproval = data?.data.find((d) => (d as Point).x > dataIndex) as Point;
							return `Approval: ${convertGraphPoint(currApproval?.y)} / ${threshold}%`;
						}

						return '';
					},
					title(values) {
						const { label } = values[0];
						const hours = Number(label);
						const days = Math.floor(hours / 24);
						const resultHours = hours - days * 24;
						let result = `Time: ${formatHoursAndDays(hours, 'hr')}`;
						if (days > 0) {
							result += ` (${formatHoursAndDays(days, 'day')} ${resultHours > 0 ? formatHoursAndDays(resultHours, 'hr') : ''})`;
						}
						return result;
					}
				},
				displayColors: false,
				intersect: false,
				mode: 'index'
			}
		},
		scales: {
			x: {
				min: 0,
				title: {
					display: true,
					text: 'Days'
				},
				grid: {
					display: false
				},
				ticks: {
					callback(v) {
						return (Number(v) / 24).toFixed(0);
					},
					stepSize: 24
				},
				type: 'linear'
			},
			y: {
				title: {
					display: true,
					text: 'Passing Percentage'
				},
				max: 100,
				min: 0,
				ticks: {
					stepSize: 10,
					callback(val) {
						return `${val}%`;
					}
				},
				grid: {
					display: false
				}
			}
		}
	};

	return (
		<div className='mt-1 w-full'>
			<Line
				className='h-full w-full'
				data={chartData}
				options={chartOptions}
			/>
		</div>
	);
}

export default VoteCurves;
