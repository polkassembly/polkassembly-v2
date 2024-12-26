// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import { shortenAddress } from '@/_shared/_utils/shortenAddress';
import Identicon from '@polkadot/react-identicon';
import { IOnChainIdentity } from '@/_shared/types';
import IdentityBadge from '../IdentityBadge';
import style from './AddressInline.module.scss';

interface Props {
	address: string;
	className?: string;
	onChainIdentity: IOnChainIdentity;
	addressDisplayText?: string;
	startChars?: number;
	endChars?: number;
	iconSize?: number;
}

function AddressInline({ address, onChainIdentity, addressDisplayText, className, startChars, endChars, iconSize = 20 }: Props) {
	const displayText = addressDisplayText || (startChars && endChars ? shortenAddress(address) : address);

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

			<IdentityBadge
				onChainIdentity={onChainIdentity}
				iconSize={iconSize}
			/>
			<p className={style.displaytext}>{displayText}</p>
		</div>
	);
}

export default AddressInline;
