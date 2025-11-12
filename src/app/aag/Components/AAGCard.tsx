// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Button } from '@/app/_shared-components/Button';
import Image from 'next/image';
import AAGLogo from '@assets/icons/AAG.svg';
import Host from '@assets/icons/host.svg';
import { useState } from 'react';
import RequestToPresentModal from './RequestToPresentModal';

function AAGCard() {
	const [isModalOpen, setIsModalOpen] = useState(false);

	return (
		<div className='mb-8 flex items-start justify-between bg-bg_modal p-8 px-20'>
			<div className='flex gap-4'>
				<Image
					src={AAGLogo}
					alt='AAG Logo'
					width={24}
					height={24}
					className='h-24 w-24'
				/>{' '}
				<div>
					<div className='flex items-center gap-4'>
						<h1 className='text-2xl font-semibold'>Attempts At Governance (AAG)</h1>
						<Button variant='secondary'>Add to Calendar</Button>
					</div>
					<div className='flex items-center gap-1'>
						<Image
							src={Host}
							alt='Host'
							width={24}
							height={24}
							className='h-6 w-6'
						/>{' '}
						<p className='text-lg font-medium'>Host: The KUS DAO</p>
					</div>
					<div className='mt-1 flex items-center gap-2 text-sm'>
						<p>The #1 news resource on Polkadot. Daily news, insights & interviews with the top minds in the Polkadot ecosystem.</p>
						<button
							onClick={() => setIsModalOpen(true)}
							type='button'
							className='inline-block font-semibold text-text_pink'
						>
							Request to Present
						</button>
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
