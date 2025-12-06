// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartOptions, ChartData, Point } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Props {
	chartLabels: number[];
	approvalData: { x: number; y: number }[];
	supportData: { x: number; y: number }[];
	approvalThresholdData: { x: number; y: number }[];
	supportThresholdData: { x: number; y: number }[];
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

function VoteCurves({ chartLabels, approvalData, supportData, approvalThresholdData, supportThresholdData }: Props) {
	const chartData: ChartData<'line', (number | Point | null)[]> = useMemo(() => {
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
			labels: chartLabels
		};
	}, [approvalData, approvalThresholdData, chartLabels, supportData, supportThresholdData]);

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

							const currSupport = data?.data.find((d) => {
								if (!d || typeof d !== 'object') return false;
								// eslint-disable-next-line @typescript-eslint/no-explicit-any
								return (d as any).x > dataIndex;
							}) as Point;
							return `Support: ${convertGraphPoint(currSupport?.y ?? undefined)} / ${threshold}%`;
						}
						if (dataset.label === 'Approval Threshold') {
							const threshold = Number(parsed.y).toFixed(2);
							const data = chartData.datasets.find((d) => d.label === 'Approval');

							const currApproval = data?.data.find((d) => {
								if (!d || typeof d !== 'object') return false;
								// eslint-disable-next-line @typescript-eslint/no-explicit-any
								return (d as any).x > dataIndex;
							}) as Point;
							return `Approval: ${convertGraphPoint(currApproval?.y ?? undefined)} / ${threshold}%`;
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
