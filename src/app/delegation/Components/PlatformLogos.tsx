// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { FaUser } from 'react-icons/fa';
import PALOGO from '@assets/delegation/pa-logo-small-delegate.svg';
import ParityLogo from '@assets/delegation/polkadot-logo.svg';
import NovaLogo from '@assets/delegation/nova-wallet.svg';
import W3FLogo from '@assets/delegation/w3f.svg';
import Image, { StaticImageData } from 'next/image';
import { ReactNode } from 'react';

enum EDelegateSource {
	PARITY = 'Polkadot',
	POLKASSEMBLY = 'Polkassembly',
	W3F = 'W3F',
	NOVA = 'Nova Wallet',
	individual = 'Individual'
}

export const getPlatformStyles = (platforms: string[]) => {
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
						className={`flex items-center gap-1 px-2 lg:gap-2 lg:px-4 ${validPlatforms.length > 2 && index > 0 ? 'border-l border-delegation_card_border' : ''}`}
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

export default PlatformLogos;
