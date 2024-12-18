// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import midTruncateText from '@/_shared/_utils/midTruncateText';
import Identicon from '@polkadot/react-identicon';

interface Props {
	address: string;
	className?: string;
	addressDisplayText?: string;
	startChars?: number;
	endChars?: number;
	iconSize?: number;
}

function AddressInline({ address, addressDisplayText, className, startChars, endChars, iconSize = 20 }: Props) {
	const displayText = addressDisplayText || (startChars && endChars ? midTruncateText({ text: address, startChars, endChars }) : address);

	return (
		<div
			className={`flex flex-row items-center gap-1.5 ${className}`.trim()}
			title={address}
		>
			<Identicon
				className='image identicon'
				value={address}
				size={iconSize}
				theme='polkadot'
			/>

			<p className='flex flex-nowrap whitespace-nowrap'>{displayText}</p>
		</div>
	);
}

export default AddressInline;
