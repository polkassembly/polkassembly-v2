// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import styles from './VotingBar.module.scss';

export default function VotingBar({ ayePercent, nayPercent, variant = 'curved' }: { ayePercent: number; nayPercent: number; variant?: 'curved' | 'linear' }) {
	const clamp = (v: number) => Math.max(0, Math.min(100, v));
	const aye = clamp(ayePercent);
	const nay = clamp(nayPercent);
	if (variant === 'linear') {
		return (
			<div
				className='relative h-2 w-full overflow-hidden rounded-full bg-gray-200'
				role='progressbar'
				aria-label='Voting progress'
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={aye}
				aria-valuetext={`Aye ${aye}%, Nay ${nay}%`}
			>
				{' '}
				<div
					className={`absolute left-0 top-0 h-full transition-all duration-300 ease-in-out ${styles.progress_aye_bg}`}
					style={{ width: `${aye}%` }}
				/>
				<div
					className={`absolute right-0 top-0 h-full transition-all duration-300 ease-in-out ${styles.progress_nay_bg}`}
					style={{ width: `${nay}%` }}
				/>
			</div>
		);
	}

	const width = 120;
	const height = 30;
	const strokeWidth = 16;
	const radius = 50;

	const createArc = (percentage: number, isAye: boolean) => {
		const x = isAye ? 10 + (width - 20) * (percentage / 100) : width - 10 - (width - 20) * (percentage / 100);
		const centerX = width / 2;
		const y = height - Math.sqrt(radius * radius - (x - centerX) ** 2);

		return `
            M ${isAye ? 10 : width - 10} ${height}
            A ${radius} ${radius} 0 0 ${isAye ? 1 : 0}
            ${x} ${y}
        `;
	};

	return (
		<svg
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
			className={styles.progressBar}
		>
			<path
				d={`M 10 ${height} A ${radius} ${radius} 0 0 1 ${width - 10} ${height}`}
				fill='none'
				className={styles.progress_default}
				strokeWidth={strokeWidth}
			/>

			<path
				d={createArc(ayePercent, true)}
				fill='none'
				className={styles.progress_aye}
				strokeWidth={strokeWidth}
				strokeLinecap='butt'
			/>
			<path
				d={createArc(nayPercent, false)}
				fill='none'
				className={styles.progress_nay}
				strokeWidth={strokeWidth}
				strokeLinecap='butt'
			/>
		</svg>
	);
}
