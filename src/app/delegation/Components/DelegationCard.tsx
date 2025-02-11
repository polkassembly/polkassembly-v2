// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Address from '@ui/Profile/Address/Address';
import { IoMdTrendingUp } from 'react-icons/io';
import { IoPersonAdd } from 'react-icons/io5';

interface DelegateData {
	platforms: string[];
	address: string;
	description: string;
	votingPower: {
		amount: number;
		currency: string;
	};
	votedProposals: number;
	receivedDelegations: number;
}

const delegateData: DelegateData[] = [
	{
		platforms: ['Polkassembly', 'Polkadot', 'Nova Wallet'],
		address: '1FN1XvRXhVBfWN6mxHyUsWsGLjrHqFM6RvJZVRp1UvXH3HU',
		description: 'Vestibulum nec leo at dui euismod lacinia non quis risus. Vivamus lobortis felis lectus, et consequat lacus dapibus in. Noits....',
		votingPower: {
			amount: 1000,
			currency: 'DOT'
		},
		votedProposals: 24,
		receivedDelegations: 12
	},
	{
		platforms: ['Polkassembly', 'Polkadot', 'Nova Wallet'],
		address: '1FN1XvRXhVBfWN6mxHyUsWsGLjrHqFM6RvJZVRp1UvXH3HU',
		description: 'Vestibulum nec leo at dui euismod lacinia non quis risus. Vivamus lobortis felis lectus, et consequat lacus dapibus in. Noits....',
		votingPower: {
			amount: 1000,
			currency: 'DOT'
		},
		votedProposals: 24,
		receivedDelegations: 12
	}
];

function DelegationCard() {
	return (
		<div className='mt-5 rounded-lg bg-bg_modal p-4'>
			<div className='flex items-center gap-2'>
				<IoMdTrendingUp className='text-xl font-bold text-bg_pink' />
				<p className='text-xl font-semibold text-text_primary'>Trending Delegates</p>
			</div>
			<div className='my-5 grid w-full grid-cols-2 items-center gap-5'>
				{delegateData.map((delegate) => (
					<div className='rounded-md border border-border_grey hover:border-bg_pink'>
						<div className='flex gap-2 bg-delegation_bgcard px-4'>
							{delegate.platforms.map((platform) => (
								<p key={platform}>{platform}</p>
							))}
						</div>
						<div className='p-4'>
							<div className='flex items-center justify-between gap-2'>
								<Address address={delegate.address} />
								<div className='flex items-center gap-1 text-text_pink'>
									<IoPersonAdd />
									<p>Delegate</p>
								</div>
							</div>
							<div className='px-5'>
								<p className='text-sm text-text_primary'>{delegate.description}</p>
								<p className='cursor-pointer text-xs font-medium text-blue-600'>Read more</p>
							</div>
						</div>
						<div className='grid grid-cols-3 items-center border-t border-border_grey'>
							<div className='border-r border-border_grey p-5 text-center'>
								<div>
									<p className='text-sm text-text_primary'>
										<span className='text-2xl font-semibold'>{delegate.votingPower.amount}</span> {delegate.votingPower.currency}
									</p>
									<p className='text-xs text-delegation_card_text'>Voting power</p>
								</div>
							</div>
							<div className='border-r border-border_grey p-5 text-center'>
								<div>
									<p className='text-2xl font-semibold'>{delegate.votedProposals}</p>
									<p className='text-xs text-delegation_card_text'>Voted proposals </p>
									<p className='text-[10px] text-delegation_card_text'>(Past 30 Days)</p>
								</div>
							</div>
							<div className='border-r border-border_grey p-5 text-center'>
								<div>
									<p className='text-2xl font-semibold'>{delegate.receivedDelegations}</p>
									<p className='whitespace-nowrap text-xs text-delegation_card_text'>Received Delegation</p>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default DelegationCard;
