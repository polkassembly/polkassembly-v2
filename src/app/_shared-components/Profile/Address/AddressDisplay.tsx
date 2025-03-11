// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Identicon from '@polkadot/react-identicon';
import { CopyIcon } from 'lucide-react';
import { memo } from 'react';
import Link from 'next/link';
import { IOnChainIdentity } from '@/_shared/types';
import AddressInline from './AddressInline/AddressInline';

function AddressDisplay({
	address,
	displayText,
	userProfileUrl,
	onCopy,
	identity
}: {
	address: string;
	displayText: string;
	userProfileUrl?: string;
	onCopy: (text: string) => void;
	identity?: IOnChainIdentity;
}) {
	const addressInlineContent = (
		<AddressInline
			address={address}
			showIdenticon={false}
			className='text-lg'
			onChainIdentity={identity}
			addressDisplayText={displayText}
		/>
	);

	return (
		<div className='flex w-full flex-col gap-1.5'>
			<div className='mt-0 flex items-center justify-start gap-2'>
				{userProfileUrl ? (
					<Link
						href={userProfileUrl}
						target='_blank'
						className='text-pink_primary flex cursor-pointer'
					>
						{addressInlineContent}
					</Link>
				) : (
					<div className='text-pink_primary flex'>{addressInlineContent}</div>
				)}
			</div>
			<div className='flex w-full flex-col gap-1.5'>
				<div className='flex items-center gap-1 text-xs text-text_primary'>
					<span
						className='flex cursor-pointer items-center gap-2'
						onClick={() => onCopy(address)}
						aria-hidden
					>
						<Identicon
							className='image identicon'
							value={address}
							size={20}
							theme='polkadot'
						/>
						<span>{address.length > 10 ? `${address.slice(0, 5)}...${address.slice(-5)}` : address}</span>
						<CopyIcon className='-ml-[6px] scale-[70%] text-2xl' />
					</span>
				</div>
			</div>
		</div>
	);
}

export default memo(AddressDisplay);
