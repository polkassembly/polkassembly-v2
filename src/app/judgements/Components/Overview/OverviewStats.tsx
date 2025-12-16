// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useState } from 'react';
import { Separator } from '@/app/_shared-components/Separator';
import JudgementRequestedIcon from '@assets/icons/judgement-requests.svg';
import JudgementCompletedIcon from '@assets/icons/judgements-completed.svg';
import { FaFilter } from '@react-icons/all-files/fa/FaFilter';
import { Search as SearchIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { MdSort } from '@react-icons/all-files/md/MdSort';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './IdentitiesListingTable.module.scss';

interface IOverviewStatsProps {
	overviewData:
		| {
				uniqueIdentities: number;
				totalSubIdentities: number;
				totalSocials: number;
				totalJudgementsGiven: number;
		  }
		| null
		| undefined;
}

function OverviewStats({ overviewData }: IOverviewStatsProps) {
	const router = useRouter();
	const t = useTranslations();
	const searchParams = useSearchParams();
	const [searchValue, setSearchValue] = useState(searchParams?.get('search') || '');

	return (
		<div className={styles.container}>
			<div className={styles.overviewStatsContainer}>
				<div className={styles.statsContainer}>
					<Image
						src={JudgementRequestedIcon}
						alt='Judgement Requests'
						width={50}
						height={50}
					/>
					<div className={styles.statsContent}>
						<p className={styles.statsLabel}>{t('Judgements.uniqueIdentitiesSet')}</p>
						<p className={styles.statsValue}>
							<div className='flex items-baseline gap-2'>
								<div className='text-2xl font-bold text-text_primary'>{overviewData?.uniqueIdentities || 0}</div>
							</div>
						</p>
					</div>
				</div>
				<Separator
					orientation='vertical'
					className='hidden h-11 md:block'
				/>
				<div className={styles.statsContainer}>
					<Image
						src={JudgementCompletedIcon}
						alt='Judgement Completed'
						width={50}
						height={50}
					/>
					<div className={styles.statsContent}>
						<p className={styles.statsLabel}>{t('Judgements.judgements')}</p>
						<p className={styles.statsValue}>
							<div className='flex items-baseline gap-2'>
								<div className='text-2xl font-bold text-text_primary'>{overviewData?.totalJudgementsGiven || 0}</div>
							</div>
						</p>
					</div>
				</div>

				<div className='ml-auto flex items-center gap-2'>
					<div className='relative'>
						<input
							type='text'
							value={searchValue}
							onChange={(e) => setSearchValue(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter') {
									const params = new URLSearchParams(searchParams?.toString() || '');
									if (searchValue) {
										params.set('search', searchValue);
									} else {
										params.delete('search');
									}
									params.delete('page');
									router.push(`/judgements?${params.toString()}`);
								}
							}}
							placeholder='Enter address or name to search'
							className='bg-bg_card w-60 rounded-lg border border-primary_border px-4 py-2 pl-10 text-xs text-text_primary placeholder-basic_text focus:outline-none focus:ring-2 focus:ring-text_pink'
						/>
						<span className='absolute left-3 top-1/2 -translate-y-1/2 text-basic_text'>
							<SearchIcon className='h-4 w-4 text-wallet_btn_text' />
						</span>
					</div>
					<button
						type='button'
						className='bg-bg_card !size-9 rounded-lg border border-primary_border p-2 hover:text-text_primary'
						title='Filter'
					>
						<FaFilter className='text-lg text-basic_text' />
					</button>
					<button
						type='button'
						className='bg-bg_card !size-9 rounded-lg border border-primary_border p-1.5 hover:text-text_primary'
						title='Menu'
					>
						<MdSort className='text-2xl text-basic_text' />
					</button>
				</div>
			</div>
		</div>
	);
}

export default OverviewStats;
