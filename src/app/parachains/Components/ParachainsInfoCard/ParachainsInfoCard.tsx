// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Image from 'next/image';
import PolkadotLogo from '@assets/parachain-logos/polkadot-logo.jpg';
import KusamaLogo from '@assets/parachain-logos/kusama-logo.gif';
import { AiOutlineLink } from '@react-icons/all-files/ai/AiOutlineLink';
import crowdloansIcon from '@assets/parachains/crowdloan.png';
import projectsIcon from '@assets/parachains/projects.png';
import auctionIcon from '@assets/parachains/auction.png';
import { useTranslations } from 'next-intl';

function ParachainsInfoCard({ polkadotParachainsDataLength, kusamaParachainsDataLength }: { polkadotParachainsDataLength: number; kusamaParachainsDataLength: number }) {
	const t = useTranslations('Parachains');
	const metrics = [
		{
			title: 'Polkadot',
			totalSupplyLocked: '11%',
			logo: PolkadotLogo,
			auction: '14th',
			crowdloans: '5',
			parachains: '14',
			projects: polkadotParachainsDataLength
		},
		{
			title: 'Kusama',
			totalSupplyLocked: '31%',
			logo: KusamaLogo,
			auction: '31st',
			crowdloans: '5',
			parachains: '29',
			projects: kusamaParachainsDataLength
		}
	];
	return (
		<div>
			<div className='flex flex-col gap-3 text-start'>
				<p className='text-2xl font-bold text-btn_secondary_text'>{t('parachainsDirectory')}</p>
			</div>
			<div className='grid grid-cols-1 gap-6 pt-4 md:grid-cols-2'>
				{metrics.map((item) => (
					<div
						key={item.title}
						className='flex min-w-[280px] flex-col gap-4 rounded-2xl bg-bg_modal p-6 shadow-md'
					>
						<div className='flex items-start gap-5'>
							<Image
								src={item.logo}
								alt={item.title}
								className='h-8 w-8 rounded-full'
								width={32}
								height={32}
							/>
							<div className='flex flex-col gap-3'>
								<span className='text-xl font-semibold text-btn_secondary_text'>{item.title}</span>
								<p className='text-sm text-text_primary'>
									{item.totalSupplyLocked} {t('ofTotalSupplyLockedInParachainsAndCrowdloans')}
								</p>
							</div>
						</div>
						<hr className='my-2 border-gray-200' />
						<div className='grid grid-cols-4 gap-2 text-center'>
							<div>
								<p className='flex items-center justify-center gap-1.5 font-medium text-btn_secondary_text'>
									<Image
										src={auctionIcon}
										alt='Auction'
										width={10}
										height={10}
									/>{' '}
									{item.auction}
								</p>
								<p className='pt-2 text-sm text-text_primary'>{t('auction')}</p>
							</div>
							<div>
								<p className='flex items-center justify-center gap-1.5 font-medium text-btn_secondary_text'>
									<Image
										src={crowdloansIcon}
										alt='Crowdloans'
										width={14}
										height={14}
									/>{' '}
									{item.crowdloans}
								</p>
								<p className='pt-2 text-sm text-text_primary'>{t('crowdloans')}</p>
							</div>
							<div>
								<p className='flex items-center justify-center gap-1.5 font-medium text-btn_secondary_text'>
									<AiOutlineLink className='h-3 w-3 text-text_primary' /> {item.parachains}
								</p>
								<p className='pt-2 text-sm text-text_primary'>{t('parachains')}</p>
							</div>
							<div>
								<p className='flex items-center justify-center gap-1.5 font-medium text-btn_secondary_text'>
									<Image
										src={projectsIcon}
										alt='Projects'
										width={10}
										height={10}
									/>{' '}
									{item.projects}
								</p>
								<p className='pt-2 text-sm text-text_primary'>{t('projects')}</p>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default ParachainsInfoCard;
