// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { VotingConviction } from '@polkadot-api/descriptors';

export const convictionMap = {
	0: VotingConviction.None(),
	1: VotingConviction.Locked1x(),
	2: VotingConviction.Locked2x(),
	3: VotingConviction.Locked3x(),
	4: VotingConviction.Locked4x(),
	5: VotingConviction.Locked5x(),
	6: VotingConviction.Locked6x()
};
