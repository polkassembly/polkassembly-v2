// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartOptions } from 'chart.js';
import { IVoteCurve } from '@/_shared/types';
import { Skeleton } from '../../Skeleton';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Props {
	voteCurveData: IVoteCurve[];
}

function VotingChart({ voteCurveData }: Props): React.ReactElement {
	const today = new Date();
	const [shiftedData, setShiftedData] = useState(null);

	useEffect(() => {
		const startDate = new Date(voteCurveData[0].timestamp);

		const daysDifference = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24));

		const shiftedLabels = voteCurveData.slice(daysDifference).map((_, index) => `${index + 1}`);
		const shiftedApprovalData = voteCurveData.slice(daysDifference).map((item) => item.approvalPercent);
		const shiftedSupportData = voteCurveData.slice(daysDifference).map((item) => item.supportPercent);

		setShiftedData({
			labels: shiftedLabels,
			datasets: [
				{
					label: 'Approval',
					data: shiftedApprovalData,
					fill: false,
					borderColor: '#68D183',
					tension: 0.4,
					borderWidth: 2,
					pointRadius: 0
				},
				{
					label: 'Support',
					data: shiftedSupportData,
					fill: false,
					borderColor: '#E5007A',
					tension: 0.4,
					borderWidth: 2,
					pointRadius: 0
				}
			]
		});
	}, [voteCurveData, today]);

	if (!shiftedData) {
		return <Skeleton className='h-20 w-full' />;
	}

	const chartOptions: ChartOptions<'line'> = {
		responsive: true,
		plugins: {
			legend: {
				display: false,
				position: 'top' as const,
				labels: {
					font: {
						size: 12
					}
				}
			}
		},
		scales: {
			x: {
				title: {
					display: true,
					text: 'Days'
				},
				ticks: {
					maxRotation: 0,
					minRotation: 0,
					align: 'center'
				},
				grid: {
					display: false // Disable grid lines on the x-axis
				}
			},
			y: {
				title: {
					display: true,
					text: 'Percentage'
				},
				ticks: {
					beginAtZero: true,
					max: 100,
					stepSize: 20
				},
				grid: {
					display: false
				}
			}
		}
	};

	return (
		<div className='mt-1 h-72 w-full'>
			<Line
				height={300}
				data={shiftedData}
				options={chartOptions}
			/>
		</div>
	);
}

export default VotingChart;
