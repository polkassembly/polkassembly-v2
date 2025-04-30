// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { FaUser } from '@react-icons/all-files/fa/FaUser';
import PALOGO from '@assets/delegation/pa-logo-small-delegate.svg';
import ParityLogo from '@assets/delegation/polkadot-logo.svg';
import NovaLogo from '@assets/delegation/nova-wallet.svg';
import W3FLogo from '@assets/delegation/w3f.svg';
import Image, { StaticImageData } from 'next/image';
import { ReactNode } from 'react';
import { EDelegateSource } from '@/_shared/types';
import { useTranslations } from 'next-intl';

const logoMap: { [key in EDelegateSource]: StaticImageData | ReactNode } = {
	[EDelegateSource.NOVA]: NovaLogo,
	[EDelegateSource.PARITY]: ParityLogo,
	[EDelegateSource.POLKASSEMBLY]: PALOGO,
	[EDelegateSource.W3F]: W3FLogo,
	[EDelegateSource.INDIVIDUAL]: <FaUser className='text-text_primary' />
};

function PlatformLogos({ platforms }: { platforms: EDelegateSource[] }) {
	const t = useTranslations('Delegation');
	if (!Array.isArray(platforms) || platforms.length === 0) {
		return (
			<div className='flex'>
				<div className='flex items-center gap-1 px-2 lg:gap-2 lg:px-4'>
					<FaUser className='h-4 w-4 text-text_primary' />
					<p className='text-sm text-btn_secondary_text'>{t('individual')}</p>
				</div>
			</div>
		);
	}

	const validPlatforms = platforms.map((p) => String(p).toLowerCase()).filter((platform) => logoMap[platform as keyof typeof logoMap]);

	return (
		<div className='flex'>
			{validPlatforms.map((platform, index) => {
				const logo = logoMap[platform as keyof typeof logoMap];
				if (!logo) return null;

				return (
					<div
						key={platform}
						className={`flex items-center gap-1 px-2 lg:gap-2 lg:px-4 ${validPlatforms.length > 1 && index > 0 ? 'border-l border-delegation_card_border' : ''}`}
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
						<p className='text-sm'>{platform === 'na' ? 'Individual' : platform.charAt(0).toUpperCase() + platform.slice(1)}</p>
					</div>
				);
			})}
		</div>
	);
}

export default PlatformLogos;
