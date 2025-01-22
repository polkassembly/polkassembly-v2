// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { IOnChainIdentity } from '@/_shared/types';
import GreenCheck from '@assets/icons/verified-check-green.svg';
import RedMinus from '@assets/icons/minus-circle-red.svg';
import { RegistrationJudgement } from '@polkadot/types/interfaces';
import { Icon } from '../../Icon';

interface Props {
	onChainIdentity?: IOnChainIdentity;
	iconSize?: number;
}

function IdentityBadge({ onChainIdentity, iconSize = 12 }: Props) {
	if (!onChainIdentity) return null;

	const minifiedIconSize = iconSize <= 12 ? 12 : iconSize - 4;

	const judgements = onChainIdentity?.judgements?.filter(([, judgement]: RegistrationJudgement): boolean => !judgement.isFeePaid);
	const isGood = judgements?.some(([, judgement]: RegistrationJudgement): boolean => {
		return typeof judgement === 'string' ? judgement === 'Reasonable' || judgement === 'KnownGood' : judgement.isKnownGood || judgement.isReasonable;
	});

	const isBad = judgements?.some(([, judgement]: RegistrationJudgement): boolean => {
		return typeof judgement === 'string' ? judgement === 'Erroneous' || judgement === 'LowQuality' : judgement.isErroneous || judgement.isLowQuality;
	});

	let iconUrl = '';

	if (isGood) iconUrl = GreenCheck;
	if (isBad) iconUrl = RedMinus;

	if (!iconUrl) return null;

	return (
		<Icon
			name={isGood ? 'icons/verified-check-green' : 'icons/minus-circle-red'}
			className='h-4 w-4'
			width={minifiedIconSize}
			height={minifiedIconSize}
		/>
	);
}

export default IdentityBadge;
