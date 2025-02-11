// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import Address from '@ui/Profile/Address/Address';
import { IoMdTrendingUp } from 'react-icons/io';
import { IoPersonAdd } from 'react-icons/io5';
import { FaUser } from 'react-icons/fa';
import PALOGO from '@assets/delegation/pa-logo-small-delegate.svg';
import ParityLogo from '@assets/delegation/polkadot-logo.svg';
import NovaLogo from '@assets/delegation/nova-wallet.svg';
import W3FLogo from '@assets/delegation/w3f.svg';
import Image, { StaticImageData } from 'next/image';
import { ReactNode } from 'react';

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

enum EDelegateSource {
	PARITY = 'Polkadot',
	POLKASSEMBLY = 'Polkassembly',
	W3F = 'W3F',
	NOVA = 'Nova Wallet',
	individual = 'Individual'
}

const getPlatformStyles = (platforms: string[]) => {
	if (platforms.length > 2) {
		return 'border-wallet_btn_text bg-delegation_bgcard';
	}

	const platform = platforms[0];
	switch (platform as EDelegateSource) {
		case EDelegateSource.POLKASSEMBLY:
		case EDelegateSource.individual:
			return 'border-navbar_border bg-delegation_card_polkassembly';
		case EDelegateSource.PARITY:
			return 'border-delegation_polkadot_border bg-delegation_card_polkadot';
		case EDelegateSource.W3F:
			return 'border-btn_secondary_text bg-delegation_card_w3f';
		case EDelegateSource.NOVA:
			return 'border-delegation_nova_border bg-delegation_card_nova';
		default:
			return 'border-wallet_btn_text bg-delegation_bgcard';
	}
};

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
		platforms: ['Polkassembly', 'Polkadot', 'Individual'],
		address: '1FN1XvRXhVBfWN6mxHyUsWsGLjrHqFM6RvJZVRp1UvXH3H2',
		description: 'Vestibulum nec leo at dui euismod lacinia non quis risus. Vivamus lobortis felis lectus, et consequat lacus dapibus in. Noits....',
		votingPower: {
			amount: 1000,
			currency: 'DOT'
		},
		votedProposals: 24,
		receivedDelegations: 12
	}
];

const logoMap: { [key in EDelegateSource]: StaticImageData | ReactNode } = {
	[EDelegateSource.POLKASSEMBLY]: PALOGO,
	[EDelegateSource.PARITY]: ParityLogo,
	[EDelegateSource.NOVA]: NovaLogo,
	[EDelegateSource.W3F]: W3FLogo,
	[EDelegateSource.individual]: <FaUser className='text-text_primary' />
};

function PlatformLogos({ platforms }: { platforms: string[] }) {
	const validPlatforms = platforms.filter((platform) => logoMap[platform as EDelegateSource]);

	return (
		<div className='flex'>
			{validPlatforms.map((platform, index) => {
				const logo = logoMap[platform as EDelegateSource];
				if (!logo) return null;

				return (
					<div
						key={platform}
						className={`flex items-center gap-2 px-4 ${validPlatforms.length > 2 && index > 0 ? 'border-l border-delegation_card_border' : ''}`}
					>
						{typeof logo === 'object' && 'src' in logo ? (
							<Image
								src={logo as StaticImageData}
								alt={`${platform} logo`}
								className='h-4 w-4'
								width={10}
								height={10}
							/>
						) : (
							logo
						)}
						<p className='text-sm text-btn_secondary_text'>{platform}</p>
					</div>
				);
			})}
		</div>
	);
}

function DelegationCard() {
	return (
		<div className='mt-5 rounded-lg bg-bg_modal p-4 shadow-lg'>
			<div className='flex items-center gap-2'>
				<IoMdTrendingUp className='text-xl font-bold text-bg_pink' />
				<p className='text-xl font-semibold text-text_primary'>Trending Delegates</p>
			</div>
			<div className='my-5 grid w-full grid-cols-2 items-center gap-5'>
				{delegateData.map((delegate) => (
					<div
						key={delegate.address}
						className='cursor-pointer rounded-md border border-border_grey hover:border-bg_pink'
					>
						<div className={`flex gap-2 rounded-t py-1 ${getPlatformStyles(delegate.platforms)}`}>
							<PlatformLogos platforms={delegate.platforms} />
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
							<div className='p-5 text-center'>
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
