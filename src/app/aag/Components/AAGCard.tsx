// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button } from '@/app/_shared-components/Button';
import Image from 'next/image';
import AAGLogo from '@assets/icons/AAG.svg';
import Host from '@assets/icons/host.svg';
import { useState } from 'react';
import SocialLinks from '@/app/_shared-components/Profile/Address/SocialLinks';
import { ESocial } from '@/_shared/types';
import RequestToPresentModal from './RequestToPresentModal';

function AAGCard() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const socialLinks = [
		{
			platform: ESocial.TWITTER,
			url: 'https://x.com/KusDAO'
		},
		{
			platform: ESocial.DISCORD,
			url: 'https://discord.com/invite/CRNDnguJXx'
		},
		{
			platform: ESocial.GITHUB,
			url: 'https://github.com/TheKusamarian/stake-n-vote'
		}
	];

	return (
		<div className='mb-4 w-full bg-bg_modal p-4 md:mb-8 md:p-8 md:px-20'>
			<div className='flex w-full gap-4'>
				<Image
					src={AAGLogo}
					alt='AAG Logo'
					width={24}
					height={24}
					className='h-16 w-16 flex-shrink-0 md:h-24 md:w-24'
				/>
				<div className='flex min-w-0 flex-1 flex-col'>
					<div className='flex w-full flex-col gap-4 md:flex-row md:items-start md:justify-between'>
						<div className='min-w-0 flex-1'>
							<div className='mb-2 flex flex-col gap-2 sm:flex-row sm:items-center md:gap-4'>
								<h1 className='text-xl font-semibold md:text-2xl'>Attempts At Governance (AAG)</h1>
								<Button
									variant='secondary'
									className='w-fit'
								>
									Add to Calendar
								</Button>
							</div>
							<div className='mb-2 flex items-center gap-1'>
								<Image
									src={Host}
									alt='Host'
									width={24}
									height={24}
									className='h-5 w-5 md:h-6 md:w-6'
								/>
								<p className='text-base font-medium md:text-lg'>Host: The KUS DAO</p>
							</div>
							<div className='mt-1 flex flex-wrap items-center gap-2 text-sm'>
								<p>
									The #1 news resource on Polkadot. Daily news, insights & interviews with the top minds in the Polkadot ecosystem.{' '}
									<span>
										<button
											onClick={() => setIsModalOpen(true)}
											type='button'
											className='whitespace-nowrap font-semibold text-text_pink'
										>
											Request to Present
										</button>
									</span>
								</p>
							</div>
						</div>
						<div className='flex-shrink-0'>
							<SocialLinks socialLinks={socialLinks} />
						</div>
					</div>
				</div>
			</div>
			<RequestToPresentModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
			/>
		</div>
	);
}

export default AAGCard;
