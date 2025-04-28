// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useMemo } from 'react';
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
	setThresholdValues: (values: { approvalThreshold: number; supportThreshold: number }) => void;
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

		const { decisionPeriod } = trackInfo;
		const { formattedDays, formattedHours } = BlockCalculationsService.getTimeFromBlocks({ network, blocks: decisionPeriod });
		const decisionPeriodHrs = formattedHours + formattedDays * 24;

		const labels: number[] = [];
		const supportData: { x: number; y: number }[] = [];
		const approvalData: { x: number; y: number }[] = [];

		const approvalThreshold: { x: number; y: number }[] = [];
		const supportThreshold: { x: number; y: number }[] = [];

		const statusBlock = timeline?.find((s) => s?.status === EProposalStatus.Deciding);

		const lastGraphPoint = voteCurveData[voteCurveData.length - 1];
		const proposalCreatedAt = dayjs(statusBlock?.timestamp || createdAt || voteCurveData[0].timestamp);
		const decisionPeriodMinutes = dayjs(lastGraphPoint.timestamp).diff(proposalCreatedAt, 'hour');

		if (decisionPeriodMinutes < decisionPeriodHrs) {
			for (let i = 0; i < decisionPeriodHrs; i += 1) {
				labels.push(i);

				if (approvalCalc) {
					approvalThreshold.push({
						x: i,
						y: approvalCalc(i / decisionPeriodHrs) * 100
					});
				}

				if (supportCalc) {
					supportThreshold.push({
						x: i,
						y: supportCalc(i / decisionPeriodHrs) * 100
					});
				}
			}
		}

		// Process each data point
		voteCurveData.forEach((point) => {
			const hour = dayjs(point.timestamp).diff(proposalCreatedAt, 'hour');
			labels.push(hour);

			if (decisionPeriodMinutes > decisionPeriodHrs) {
				if (approvalCalc) {
					approvalThreshold.push({
						x: hour,
						y: approvalCalc(hour / decisionPeriodMinutes) * 100
					});
				}
				if (supportCalc) {
					supportThreshold.push({
						x: hour,
						y: supportCalc(hour / decisionPeriodMinutes) * 100
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

		const currentApproval = approvalData[approvalData.length - 1];
		const currentSupport = supportData[supportData.length - 1];

		setThresholdValues({
			approvalThreshold: approvalThreshold.find((data) => data && data?.x >= currentApproval?.x)?.y || 0,
			supportThreshold: supportThreshold.find((data) => data && data?.x >= currentSupport?.x)?.y || 0
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
					data: approvalThreshold,
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
					data: supportThreshold,
					label: 'Support',
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

	const chartOptions: ChartOptions<'line'> = {
		plugins: {
			legend: {
				display: false,
				position: 'bottom'
			}
		},
		scales: {
			x: {
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
