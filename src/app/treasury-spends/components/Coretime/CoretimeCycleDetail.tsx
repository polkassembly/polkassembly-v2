// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ETreasurySpendsTabs } from '@/_shared/types';
import TimeLineIcon from '@assets/icons/timeline.svg';
import Image from 'next/image';
import CycleSummary from './CycleSummary';
import { coretimeCyclesMock } from './mockCycles';

function CoretimeCycleDetail() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const cycleId = searchParams?.get('cycleId');

	const cycle = useMemo(() => coretimeCyclesMock.find((item) => item.id === cycleId), [cycleId]);

	const goBackToOverview = () => {
		const queryParams = new URLSearchParams(searchParams?.toString());
		queryParams.set('tab', ETreasurySpendsTabs.CORETIME);
		queryParams.delete('cycleId');
		router.push(`${pathname}?${queryParams.toString()}`);
	};

	if (!cycle) {
		return (
			<div className='flex flex-col gap-4 rounded-lg border border-border_grey bg-bg_modal p-4 lg:p-6'>
				<div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
					<div>
						<p className='text-sm font-medium uppercase text-text_primary'>Coretime Detail View</p>
						<p className='text-sm text-basic_text'>Cycle not found.</p>
					</div>
					<button
						type='button'
						onClick={goBackToOverview}
						className='w-full rounded-md border border-text_pink px-4 py-2 text-sm font-semibold text-text_pink transition hover:bg-text_pink hover:text-white sm:w-auto'
					>
						Back to overview
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className='flex flex-col gap-4 rounded-lg border border-border_grey bg-bg_modal p-4 lg:p-6'>
			<div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
				<div className='flex items-center gap-2'>
					<Image
						src={TimeLineIcon}
						alt='Timeline Icon'
						width={24}
						height={24}
						className='h-6 w-6'
					/>
					<p className='text-2xl font-bold text-text_primary'>Coretime Cycle #{cycle.id}</p>
				</div>
				<button
					type='button'
					onClick={goBackToOverview}
					className='w-full rounded-md border border-text_pink px-4 py-2 text-sm font-semibold text-text_pink transition hover:bg-text_pink hover:text-white sm:w-auto'
				>
					Back to overview
				</button>
			</div>

			<div className='rounded-lg border border-border_grey p-4'>
				<CycleSummary cycle={cycle} />
			</div>
		</div>
	);
}

export default CoretimeCycleDetail;
