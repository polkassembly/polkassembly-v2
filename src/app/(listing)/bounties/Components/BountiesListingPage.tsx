// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EBountyStatus, EProposalStep, IGenericListingResponse, IPostListing } from '@/_shared/types';
import Image from 'next/image';
import ProposalIcon from '@assets/icons/proposal.svg';
import { spaceGroteskFont } from '@/app/_style/fonts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/_shared-components/Tabs';
import { useRouter } from 'next/navigation';
import { PaginationWithLinks } from '@/app/_shared-components/PaginationWithLinks';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { useTranslations } from 'next-intl';
import NoActivity from '@/_assets/activityfeed/gifs/noactivity.gif';
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';
import BountyTable from './BountyTable';
import styles from './Bounties.module.scss';

function BountiesListingPage({ initialData, status, page }: { initialData: IGenericListingResponse<IPostListing>; status: EBountyStatus; page: number }) {
	const router = useRouter();
	const t = useTranslations();
	const statusValues = Object.values(EBountyStatus);

	const { user } = useUser();

	const handleTabChange = (value: string) => {
		if (!Object.values(EBountyStatus).includes(value as EBountyStatus)) {
			return;
		}
		const params = new URLSearchParams();
		params.set('page', '1');

		if (value !== EBountyStatus.ALL) {
			params.set('status', value);
		}
		router.push(`/bounties?${params.toString()}`);
	};

	return (
		<div className='mx-auto max-w-7xl px-4 py-5 lg:px-16'>
			<div className='flex items-center justify-between'>
				<span className={`${spaceGroteskFont.className} text-[32px] font-bold text-btn_secondary_text`}>{t('Bounties.onchainBounties')}</span>
				<div className='flex gap-2'>
					<Link
						href={user ? `/create?open=${EProposalStep.CREATE_BOUNTY}` : `/login?nextUrl=/create?open=${EProposalStep.CREATE_BOUNTY}`}
						className={styles.create_bounty_btn}
					>
						<Image
							src={ProposalIcon}
							alt='bounty icon'
							className='h-4 w-4'
							width={15}
							height={15}
						/>
						<span className='font-bold text-btn_primary_text'>{t('Bounties.createBountyProposal')}</span>
					</Link>
				</div>
			</div>
			<Tabs
				onValueChange={handleTabChange}
				defaultValue={status}
				className='mt-5'
			>
				<TabsList className='hide_scrollbar mb-4 flex w-full justify-start overflow-x-auto border-border_grey dark:border-b'>
					{statusValues.map((statusValue) => (
						<TabsTrigger
							key={statusValue}
							className='m-0 p-2 px-4 text-input_text data-[state=active]:rounded-t-lg data-[state=active]:dark:bg-bg_modal'
							value={statusValue}
						>
							{t(`Bounties.${(statusValue as EBountyStatus)?.toLowerCase()}`)}
						</TabsTrigger>
					))}
				</TabsList>

				{statusValues.map((statusValue) => (
					<TabsContent
						key={`tab-content-${statusValue}`}
						value={statusValue}
					>
						{initialData?.totalCount ? (
							<BountyTable filteredItems={initialData?.items || []} />
						) : (
							<p className={styles.no_data}>
								<Image
									src={NoActivity}
									alt='no data'
									width={300}
									height={300}
								/>
								{t('CreateProposalDropdownButton.noData')}
							</p>
						)}
					</TabsContent>
				))}

				{initialData.totalCount > DEFAULT_LISTING_LIMIT && (
					<div className='mt-4'>
						<PaginationWithLinks
							page={Number(page)}
							pageSize={DEFAULT_LISTING_LIMIT}
							totalCount={initialData?.totalCount || 0}
							pageSearchParam='page'
						/>
					</div>
				)}
			</Tabs>
		</div>
	);
}

export default BountiesListingPage;
