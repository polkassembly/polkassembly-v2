// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useMemo } from 'react';
import Identicon from '@polkadot/react-identicon';
import { IOnChainIdentity } from '@/_shared/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { W3F_DELEGATES_2025 } from '@/_shared/_constants/delegates2025';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import IdentityBadge from '../IdentityBadge';
import styles from './AddressInline.module.scss';
import DVBadge from '../DVBadge';

interface Props {
	address: string;
	className?: string;
	onChainIdentity?: IOnChainIdentity;
	addressDisplayText?: string;
	iconSize?: number;
	showIdenticon?: boolean;
	textClassName?: string;
	redirectToProfile?: boolean;
	userProfileUrl?: string;
	showOnlyIdenticon?: boolean;
}

function AddressInline({
	address,
	onChainIdentity,
	addressDisplayText,
	className,
	iconSize = 20,
	showIdenticon = true,
	textClassName,
	redirectToProfile = true,
	userProfileUrl,
	showOnlyIdenticon = false
}: Props) {
	const isDV = useMemo(() => {
		return W3F_DELEGATES_2025.some((dv) => getSubstrateAddress(dv.address) === getSubstrateAddress(address));
	}, [address]);

	return (
		<div
			className={`${styles.container} ${className}`.trim()}
			title={addressDisplayText || address}
			data-tip
			data-for={`tooltip-${address}`}
		>
			{showIdenticon && address && (
				<Identicon
					className='image identicon'
					value={address}
					size={iconSize}
					theme='polkadot'
				/>
			)}
			{!showOnlyIdenticon &&
				(redirectToProfile && userProfileUrl ? (
					<Link
						className={styles.container}
						href={userProfileUrl}
					>
						<IdentityBadge
							onChainIdentity={onChainIdentity}
							iconSize={iconSize}
						/>

						<p className={cn(styles.displaytext, 'max-w-[40px] truncate text-xs font-bold sm:max-w-full lg:text-sm', textClassName)}>{addressDisplayText}</p>
						{isDV && <DVBadge />}
					</Link>
				) : (
					<div className={styles.container}>
						<IdentityBadge
							onChainIdentity={onChainIdentity}
							iconSize={iconSize}
						/>

						<p className={cn(styles.displaytext, 'max-w-[40px] truncate text-xs font-bold sm:w-full lg:text-sm', textClassName)}>{addressDisplayText}</p>
						{isDV && <DVBadge />}
					</div>
				))}
		</div>
	);
}

export default AddressInline;
