// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { EPostOrigin } from '@/_shared/types';
import { delegateUserTracksAtom } from '@/app/_atoms/delegation/delegationAtom';
import { cn } from '@/lib/utils';
import { useAtom } from 'jotai';
import { IoPersonAdd } from 'react-icons/io5';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import DelegateDialog from '../../Components/DelegateDialog/DelegateDialog';

function DelegationTrack({ trackName }: { trackName: string }) {
	const [delegateUserTracks] = useAtom(delegateUserTracksAtom);
	const network = getCurrentNetwork();
	const [isActiveProposalOpen, setIsActiveProposalOpen] = useState(false);
	const trackDescription = NETWORKS_DETAILS[network].trackDetails[trackName as EPostOrigin]?.description;
	const trackId = NETWORKS_DETAILS[network].trackDetails[trackName as EPostOrigin]?.trackId;
	const isDelegated = delegateUserTracks?.some((track) => track.trackId === trackId);
	const [open, setOpen] = useState(false);

	return (
		<div>
			<div className='flex h-80 flex-col justify-between gap-5 rounded-lg bg-bg_modal p-5'>
				<div>
					<div className='flex items-center gap-4'>
						<p className='text-2xl font-bold text-btn_secondary_text'>{trackName}</p>
						<span
							className={cn(
								'rounded-[26px] px-3 py-1.5 text-center text-xs text-text_primary',
								isDelegated && 'bg-delegated_delegation_bg',
								!isDelegated && 'bg-undelegated_delegation_bg'
							)}
						>
							{isDelegated ? 'Delegated' : 'Undelegated'}
						</span>
					</div>
					<p className='text-sm text-text_primary'>{trackDescription}</p>
				</div>
				<div className='flex h-full items-center justify-center gap-2'>
					<p className='text-sm text-text_primary'>Voting power for this track has not been delegated yet</p>
					<DelegateDialog
						open={open}
						setOpen={setOpen}
						delegate={{ address: '' }}
					>
						<div className='flex cursor-pointer items-center gap-1 text-text_pink'>
							<IoPersonAdd />
							<span>Delegate</span>
						</div>
					</DelegateDialog>
				</div>
			</div>
			<div className={cn('mt-10 flex h-80 flex-col justify-between gap-5 rounded-lg bg-bg_modal p-5', !isActiveProposalOpen && 'h-auto')}>
				<div className='flex items-center justify-between'>
					<p className='text-2xl font-bold text-btn_secondary_text'>Active Proposal</p>
					<button
						type='button'
						className='text-sm text-text_primary'
						onClick={() => setIsActiveProposalOpen(!isActiveProposalOpen)}
					>
						<ChevronDown className={cn('h-6 w-6', isActiveProposalOpen && 'rotate-180')} />
					</button>
				</div>
			</div>
		</div>
	);
}

export default DelegationTrack;
