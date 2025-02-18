// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React from 'react';
import Identicon from '@polkadot/react-identicon';
import { IOnChainIdentity } from '@/_shared/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import IdentityBadge from '../IdentityBadge';
import styles from './AddressInline.module.scss';

interface Props {
	address: string;
	className?: string;
	onChainIdentity: IOnChainIdentity;
	addressDisplayText?: string;
	iconSize?: number;
	showIdenticon?: boolean;
	textClassName?: string;
}

function AddressInline({ address, onChainIdentity, addressDisplayText, className, iconSize = 20, showIdenticon = true, textClassName }: Props) {
	return (
		<div
			className={`${styles.container} ${className}`.trim()}
			title={addressDisplayText || address}
		>
			{showIdenticon && (
				<Identicon
					className='image identicon'
					value={address}
					size={iconSize}
					theme='polkadot'
				/>
			)}
			<Link
				className={styles.container}
				href={`/user/address/${address}`}
			>
				<IdentityBadge
					onChainIdentity={onChainIdentity}
					iconSize={iconSize}
				/>

				<p className={cn(styles.displaytext, 'text-xs font-bold lg:text-sm', textClassName)}>{addressDisplayText}</p>
			</Link>
		</div>
	);
}

export default AddressInline;
