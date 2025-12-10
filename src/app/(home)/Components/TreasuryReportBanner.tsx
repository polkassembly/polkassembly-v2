// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';

function TreasuryReportBanner() {
	const [currentIndex, setCurrentIndex] = useState(0);

	const { data: reports, isLoading } = useQuery({
		queryKey: ['treasury-report'],
		queryFn: async () => {
			const { data } = await NextApiClientService.getTreasuryReport();
			return data || [];
		},
		staleTime: FIVE_MIN_IN_MILLI
	});

	useEffect(() => {
		if (!reports || reports.length <= 1) return undefined;
		const interval = setInterval(() => {
			setCurrentIndex((prev) => (prev + 1) % reports.length);
		}, 5000);
		return () => clearInterval(interval);
	}, [reports]);

	if (isLoading) {
		return (
			<div className='relative flex h-[100px] items-center justify-between rounded-xl border border-treasury_stats_border bg-klara_stats_bg p-6'>
				<div className='flex w-full flex-col gap-2 pr-12'>
					<Skeleton className='h-6 w-3/4' />
					<Skeleton className='h-4 w-1/2' />
				</div>
				<Skeleton className='h-10 w-10 shrink-0 rounded-full' />
			</div>
		);
	}

	if (!reports || !reports?.length) return null;

	const currentReport = reports[currentIndex];

	return (
		<div className='relative h-[100px] overflow-hidden rounded-xl border border-treasury_stats_border bg-klara_stats_bg p-6'>
			<AnimatePresence mode='wait'>
				<motion.div
					key={currentIndex}
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -10 }}
					transition={{ duration: 0.5 }}
					className='absolute inset-0 flex items-center justify-between px-6'
				>
					<div className='flex flex-col gap-1 pr-12'>
						<h3 className='line-clamp-1 text-xl font-bold text-text_primary'>{currentReport.title}</h3>
						<p className='line-clamp-1 text-sm font-medium text-wallet_btn_text'>{currentReport.description}</p>
					</div>
					{currentReport.redirectLink ? (
						<Link
							href={currentReport.redirectLink}
							target='_blank'
							aria-label={`View ${currentReport.title} report`}
							className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-arrow_bg_color text-bg_modal transition-transform hover:scale-105'
						>
							<ArrowRight className='h-5 w-5' />
						</Link>
					) : (
						<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-arrow_bg_color/50 text-bg_modal/50'>
							<ArrowRight className='h-5 w-5' />
						</div>
					)}
				</motion.div>
			</AnimatePresence>
		</div>
	);
}

export default TreasuryReportBanner;
