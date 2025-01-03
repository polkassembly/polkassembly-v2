// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import Identicon from '@polkadot/react-identicon';
import { IOnChainIdentity } from '@/_shared/types';
import IdentityBadge from '../IdentityBadge';
import styles from './AddressInline.module.scss';

interface Props {
	address: string;
	className?: string;
	onChainIdentity: IOnChainIdentity;
	addressDisplayText?: string;
	iconSize?: number;
}

function AddressInline({ address, onChainIdentity, addressDisplayText, className, iconSize = 20 }: Props) {
	return (
		<div
			className={`${styles.container} ${className}`.trim()}
			title={addressDisplayText || address}
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

			<p className={styles.displaytext}>{addressDisplayText}</p>
		</div>
	);
}

export default AddressInline;
