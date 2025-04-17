// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartOptions, ChartData } from 'chart.js';
import { IVoteCurve } from '@/_shared/types';

// Registering the necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Props {
	voteCurveData: IVoteCurve[];
}

function VotingChart({ voteCurveData }: Props): React.ReactElement {
	const chartData: ChartData<'line'> = {
		labels: voteCurveData ? voteCurveData.map((item) => item.timestamp.slice(0, 10)) : [], // Extracting the date
		datasets: [
			{
				label: 'Approval',
				data: voteCurveData ? voteCurveData.map((item) => item.approvalPercent) : [],
				fill: false,
				borderColor: 'rgb(75, 192, 192)', // Teal color
				tension: 0.4,
				borderWidth: 2,
				pointRadius: 5, // Circle markers
				pointBackgroundColor: 'rgb(75, 192, 192)',
				pointBorderColor: 'white',
				pointBorderWidth: 2
			},
			{
				label: 'Support',
				data: voteCurveData ? voteCurveData.map((item) => item.supportPercent) : [],
				fill: false,
				borderColor: 'rgb(255, 99, 132)', // Red color
				tension: 0.4,
				borderWidth: 2,
				pointRadius: 5, // Circle markers
				pointBackgroundColor: 'rgb(255, 99, 132)',
				pointBorderColor: 'white',
				pointBorderWidth: 2
			},
			{
				label: 'Threshold',
				data: new Array(voteCurveData ? voteCurveData.length : 0).fill(99.0), // Constant threshold line at 99%
				fill: false,
				borderColor: 'rgb(0, 255, 0)', // Green color for threshold
				borderDash: [5, 5], // Dotted line style
				borderWidth: 1
			}
		]
	};

	const chartOptions: ChartOptions<'line'> = {
		responsive: true,
		plugins: {
			title: {
				display: true,
				text: 'Voting Data'
			},
			legend: {
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
					text: 'Date'
				},
				ticks: {
					maxRotation: 45,
					minRotation: 45
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
				}
			}
		}
	};

	return (
		<div className='mt-6 h-80'>
			<Line
				height={300}
				data={chartData}
				options={chartOptions}
			/>
		</div>
	);
}

export default VotingChart;
