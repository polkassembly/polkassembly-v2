// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { isMimirReady, MIMIR_REGEXP } from '@mimirdev/apps-inject';

export const isMimirDetected = async () => {
	const isInIframe = typeof window !== 'undefined' && window !== window.parent;

	const origin = await isMimirReady();

	return isInIframe && origin && MIMIR_REGEXP.test(origin);
};
