// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { Button } from '@ui/Button';
import PolkaAsset from '@assets/delegation/Track.svg';
import PolkaBadge from '@assets/delegation/badge.svg';
import Reverse from '@assets/delegation/reverse.svg';
import Link from 'next/link';
import { MdInfoOutline } from 'react-icons/md';
import Image from 'next/image';
import { useUser } from '@/hooks/useUser';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/app/_shared-components/Tooltip';
import styles from './Delegation.module.scss';

function Delegation() {
	const { user } = useUser();
	const [showDelegationInfo, setShowDelegationInfo] = useState(true);
	console.log(user);
	return (
		<div className={styles.delegation}>
			<h1 className={styles.delegation_title}>Delegation</h1>
			{showDelegationInfo && (
				<div className='mt-5 hidden rounded-lg bg-bg_modal py-4 sm:block'>
					<div className='flex items-center justify-between px-6'>
						<p className='text-xl font-semibold text-btn_secondary_text'>How to Delegate on Polkassembly</p>
						<div className='flex items-center gap-5'>
							<Tooltip delayDuration={0}>
								<TooltipTrigger asChild>
									<div>
										<Button
											disabled={!user}
											className={`${!user ? 'cursor-not-allowed opacity-50' : ''}`}
										>
											Become a Delegate
										</Button>
									</div>
								</TooltipTrigger>
								{!user && (
									<TooltipContent
										className={styles.tooltipContent}
										side='top'
										sideOffset={5}
									>
										<p className='text-sm'>Please Login to continue</p>
									</TooltipContent>
								)}
							</Tooltip>
							<IoMdClose
								onClick={() => setShowDelegationInfo(false)}
								className='cursor-pointer text-2xl text-wallet_btn_text'
							/>
						</div>
					</div>

					<div className='mt-4 grid grid-cols-2'>
						<div className='grid grid-cols-[auto_1fr] items-start'>
							<Image
								src={PolkaAsset}
								alt='Polka Asset'
								className='-mt-5 h-36 w-36'
							/>
							<div className='grid max-w-sm grid-cols-[auto_1fr] gap-4 text-sm text-text_primary'>
								<p className='whitespace-nowrap font-semibold'>STEP 1</p>
								<div>
									<p className='font-semibold'>Select Track for Delegation</p>
									<p>OpenGov allows for track level agile delegation. Choose a track to proceed.</p>
								</div>
							</div>
						</div>
						<div className='grid grid-cols-[auto_1fr] items-start gap-5'>
							<div className='grid grid-cols-2 items-start'>
								<Image
									src={Reverse}
									alt='Reverse'
									className='mt-5 h-auto w-12'
								/>
								<Image
									src={PolkaBadge}
									alt='Polka Badge'
									className='h-auto w-24'
								/>
							</div>
							<div className='grid max-w-lg grid-cols-[auto_1fr] gap-3'>
								<div className='grid grid-cols-[auto_1fr] items-start gap-4 text-sm text-text_primary'>
									<p className='whitespace-nowrap font-semibold'>STEP 2</p>
									<div>
										<p className='font-semibold'>Select Delegate</p>
										<p>Choose a delegate based on the stats to complete your delegation process.</p>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className='bg-info_bg mx-4 mb-2 rounded-md px-4 py-2 text-sm'>
						<p className='flex items-center gap-1 text-wallet_btn_text'>
							<MdInfoOutline className='mr-1 inline-block text-lg' />
							Want to learn more about delegation process before locking your tokens. Click{' '}
							<Link
								className='text-border_blue underline'
								target='_blank'
								href='https://docs.polkassembly.io/opengov/learn-about-referenda/voting-on-a-referendum/delegating-voting-power'
							>
								{' '}
								here
							</Link>
						</p>
					</div>
				</div>
			)}
		</div>
	);
}

export default Delegation;
