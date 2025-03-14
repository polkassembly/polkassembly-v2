// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import styles from './TopicTag.module.scss';

export const getSpanStyle = (trackName: string, activeProposal?: number): string => {
	if (!activeProposal || activeProposal <= 0) return styles.spanStyle;

	const normalizedTrackName = trackName.replace(/\s+/g, '');
	return styles[normalizedTrackName as string] || styles.spanStyle;
};
