// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { InfoIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../_shared-components/Dialog/Dialog';
import { Button } from '../../../_shared-components/Button';

function BecomeRegistrarModal() {
	const t = useTranslations('Judgements');
	const [modalOpen, setModalOpen] = useState(false);

	return (
		<Dialog
			open={modalOpen}
			onOpenChange={setModalOpen}
		>
			<DialogTrigger asChild>
				<Button
					variant='secondary'
					onClick={() => setModalOpen(true)}
				>
					{t('becomeARegistrar')}
				</Button>
			</DialogTrigger>
			<DialogContent className='max-w-2xl p-3 sm:p-6'>
				<DialogHeader className='text-xl font-semibold text-text_primary'>
					<DialogTitle>{t('becomeRegistrarTitle')}</DialogTitle>
				</DialogHeader>
				<div className='flex flex-col gap-4'>
					<p className='text-sm text-gray-600'>{t('becomeRegistrarDescription')}</p>

					<div className='space-y-3'>
						<div className='flex items-start gap-3'>
							<div className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600'>1</div>
							<p className='text-sm text-gray-700'>{t('becomeRegistrarSteps.step1')}</p>
						</div>
						<div className='flex items-start gap-3'>
							<div className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600'>2</div>
							<p className='text-sm text-gray-700'>{t('becomeRegistrarSteps.step2')}</p>
						</div>
						<div className='flex items-start gap-3'>
							<div className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600'>3</div>
							<p className='text-sm text-gray-700'>{t('becomeRegistrarSteps.step3')}</p>
						</div>
						<div className='flex items-start gap-3'>
							<div className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600'>4</div>
							<p className='text-sm text-gray-700'>{t('becomeRegistrarSteps.step4')}</p>
						</div>
					</div>

					<div className='rounded-lg border border-blue-200 bg-blue-50 p-3'>
						<p className='flex items-center gap-1 text-xs text-blue-800'>
							<InfoIcon className='h-4 w-4' /> For more detailed information, visit the{' '}
							<a
								href='https://wiki.polkadot.network/learn/learn-guides-identity/#becoming-a-registrar'
								target='_blank'
								rel='noopener noreferrer'
								className='underline hover:text-blue-600'
							>
								Polkadot Wiki
							</a>
						</p>
					</div>

					<div className='flex justify-end gap-2 pt-2'>
						<Button
							variant='outline'
							onClick={() => setModalOpen(false)}
						>
							{t('cancel')}
						</Button>
						<Link href='/create'>
							<Button onClick={() => setModalOpen(false)}>{t('continueToCreate')}</Button>
						</Link>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default BecomeRegistrarModal;
