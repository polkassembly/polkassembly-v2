// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTranslations } from 'next-intl';
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';
import { Separator } from '@/app/_shared-components/Separator';
import { HiOutlineExternalLink } from 'react-icons/hi';
import DotIcon from '@assets/icons/dot.png';
import UsdcIcon from '@assets/icons/usdc.svg';
import UsdtIcon from '@assets/icons/usdt.svg';
import TokenValueDisplay from './TokenValueDisplay';
// of the Apache-2.0 license. See the LICENSE file for details.
interface NetworkSectionProps {
	title: string;
	icon: StaticImageData;
	usdValue: string;
	dotValue: number;
	usdcValue?: number;
	usdtValue?: number;
	usdtExternalLink?: string;
	secondUsdtExternalLink?: string;
}

function NetworkSection({ title, icon, usdValue, dotValue, usdcValue, usdtValue, usdtExternalLink, secondUsdtExternalLink }: NetworkSectionProps) {
	const t = useTranslations('ActivityFeed');
	return (
		<div className='pt-2'>
			<div className='flex items-center gap-2'>
				<div className='flex items-center gap-1'>
					<Image
						src={icon}
						alt={title}
						className='h-5 w-5'
						width={20}
						height={20}
					/>
					<span className='text-sm text-btn_secondary_text'>{title}</span>
				</div>
				<span className='text-base font-semibold text-btn_secondary_text'>~ ${usdValue}</span>
			</div>
			<div className='flex flex-wrap items-center gap-2 pl-24'>
				<TokenValueDisplay
					icon={DotIcon}
					value={String(dotValue)}
					symbol='DOT'
				/>

				{usdcValue && (
					<div className='flex items-center gap-2'>
						<Separator
							className='h-3'
							orientation='vertical'
						/>
						<TokenValueDisplay
							icon={UsdcIcon}
							value={String(usdcValue)}
							symbol='USDC'
						/>
					</div>
				)}

				{usdtValue && (
					<div className='flex items-center gap-2'>
						<Separator
							className='h-3'
							orientation='vertical'
						/>
						<TokenValueDisplay
							icon={UsdtIcon}
							value={String(usdtValue)}
							symbol='USDt'
						/>
						{usdtExternalLink && (
							<Link
								href={usdtExternalLink}
								className='flex items-center gap-1 text-sm text-text_pink transition-colors'
								target='_blank'
								rel='noopener noreferrer'
							>
								{t('address')} #1 <HiOutlineExternalLink className='h-4 w-4 cursor-pointer' />
							</Link>
						)}
						{secondUsdtExternalLink && (
							<Link
								href={secondUsdtExternalLink}
								className='flex items-center gap-1 text-sm text-text_pink transition-colors'
								target='_blank'
								rel='noopener noreferrer'
							>
								{t('address')} #2 <HiOutlineExternalLink className='h-4 w-4 cursor-pointer' />
							</Link>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

export default NetworkSection;
