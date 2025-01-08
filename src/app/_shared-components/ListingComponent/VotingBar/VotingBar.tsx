// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import styles from './VotingBar.module.scss';

export default function VotingBar({ ayePercent, nayPercent }: { ayePercent: number; nayPercent: number }) {
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
