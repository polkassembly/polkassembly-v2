// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import delegates from '@assets/delegation/delegates.svg';
import delegatees from '@assets/delegation/delegatees.svg';
import timer from '@assets/icons/timer.svg';

import Image from 'next/image';

function CohortCard() {
	return (
		<div className='rounded-xxl my-4 w-full rounded-3xl border border-border_grey bg-bg_modal p-6'>
			<div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
				<div className='flex items-start gap-4'>
					<Image
						src={delegatees}
						alt='Delegatees'
						className='h-10 w-10'
					/>
					<div>
						<p className='text-xs font-medium uppercase text-community_text'>TOTAL DAOS</p>
						<p className='text-2xl font-semibold text-text_primary'>7</p>
						<p className='text-xs text-wallet_btn_text'>4.2M delegations each</p>
					</div>
				</div>

				<div className='flex items-start gap-4'>
					<Image
						src={delegates}
						alt='Delegates'
						className='h-10 w-10'
					/>
					<div>
						<p className='text-xs font-medium uppercase text-community_text'>GUARDIANS</p>
						<p className='text-2xl font-semibold text-text_primary'>5</p>
						<p className='text-xs text-wallet_btn_text'>2M delegations each</p>
					</div>
				</div>

				<div className='flex items-start gap-4'>
					<Image
						src={timer}
						alt='Timer'
						className='h-10 w-10'
					/>
					<div>
						<p className='text-xs font-medium uppercase text-community_text'>START TIME</p>
						<p className='text-lg font-semibold text-text_primary'>
							2025-11-02 <span className='text-wallet_btn_text'>19:15:09</span>
						</p>
						<p className='text-xs text-wallet_btn_text'>#21,172,801</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default CohortCard;
