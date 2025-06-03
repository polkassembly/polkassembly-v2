// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable no-underscore-dangle */

import Image from 'next/image';
import searchGif from '@assets/search/search.gif';
import searchLoader from '@assets/search/search-loader.gif';
import userIcon from '@assets/profile/user-icon.svg';
import { Hits, Index, useInstantSearch, useSearchBox, Configure, usePagination } from 'react-instantsearch';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import Link from 'next/link';
import { EProposalType, ESearchType } from '@/_shared/types';
import CommentIcon from '@assets/icons/Comment.svg';
import { POST_TOPIC_MAP } from '@/_shared/_constants/searchConstants';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { AiOutlineDislike } from '@react-icons/all-files/ai/AiOutlineDislike';
import { AiOutlineLike } from '@react-icons/all-files/ai/AiOutlineLike';
import PaLogo from '../PaLogo';
import { Separator } from '../../Separator';
import Address from '../../Profile/Address/Address';
import CreatedAtTime from '../../CreatedAtTime/CreatedAtTime';
import { PaginationWithLinks } from '../../PaginationWithLinks';
import Tags from './Tags';
import styles from './Search.module.scss';

interface Post {
	index: string;
	objectID: string;
	title: string;
	content: string;
	proposer_address: string;
	proposalType: EProposalType;
	createdAtTimestamp: number;
	track?: number;
	tags?: string[];
	parsedContent?: string;
	__position?: number;
	network?: string;
	topic_id?: number;
	typeOfReferendum?: string;
	metrics?: {
		reactions?: {
			like: number;
			dislike: number;
		};
		comments?: number;
	};
}

interface User {
	objectID: string;
	username: string;
	profile?: {
		bio?: string;
		title?: string;
		image?: string;
	};
}

function PostHit({ hit }: { hit: Post }) {
	const t = useTranslations();
	const position = hit.__position;
	const topic = hit.topic_id ? Object.entries(POST_TOPIC_MAP).find(([, value]) => value === hit.topic_id)?.[0] : null;
	const backgroundColor = position ? (position % 2 !== 0 ? 'bg-listing_card1' : 'bg-section_dark_overlay') : '';

	return (
		<Link
			href={hit.proposalType !== EProposalType.DISCUSSION ? `/referenda/${hit.index}` : `/post/${hit.index}`}
			target='_blank'
		>
			<div className={`${styles.search_results_wrapper} ${backgroundColor} hover:bg-bg_pink/10`}>
				<div className='flex'>
					{hit.proposer_address && (
						<Address
							address={hit.proposer_address}
							className='text-lg font-medium'
							iconSize={24}
						/>
					)}
				</div>
				<h2 className='text-lg font-medium'>
					<p className='text-sm font-medium'>
						#{hit.index} {hit.title?.length > 90 ? `${hit.title?.slice(0, 90)}...` : hit?.title}
					</p>
				</h2>
				<div className={styles.post_content}>
					<p className='line-clamp-4 break-all text-sm text-text_primary'>{hit.parsedContent}</p>
				</div>
				<div className='mt-2 flex flex-wrap gap-2 text-sm'>
					<div className='flex items-center gap-2'>
						<div className='flex items-center gap-1'>
							<AiOutlineLike className='text-sm' /> {hit.metrics?.reactions?.like || 0}
						</div>
						<div className='flex items-center gap-1'>
							<AiOutlineDislike className='text-sm' /> {hit.metrics?.reactions?.dislike || 0}
						</div>
						<div className='flex items-center gap-1'>
							<Image
								src={CommentIcon}
								alt='comment'
								width={14}
								height={14}
							/>{' '}
							{hit.metrics?.comments || 0}
						</div>
						<Separator
							orientation='vertical'
							className='h-4'
						/>
					</div>
					{hit.tags && hit.tags.length > 0 && (
						<div className='flex items-center gap-2'>
							<Tags tags={hit.tags} />
							<Separator
								orientation='vertical'
								className='h-4'
							/>{' '}
						</div>
					)}
					{hit.createdAtTimestamp && (
						<div className='flex items-center gap-2'>
							<CreatedAtTime createdAt={dayjs.utc(hit.createdAtTimestamp * 1000).toDate()} />
							<Separator
								orientation='vertical'
								className='h-4'
							/>{' '}
						</div>
					)}
					{topic && (
						<div className='flex items-center gap-2'>
							<span className={styles.topic_tag}>
								{topic
									.replace(/_/g, ' ')
									.toLowerCase()
									.replace(/^\w/, (c) => c.toUpperCase())}
							</span>
							<Separator
								orientation='vertical'
								className='h-4'
							/>{' '}
						</div>
					)}
					{hit.proposalType && (
						<div className='flex items-center gap-2'>
							<p className='text-text_secondary text-xs'>{t('Search.in')}</p>
							{hit.proposalType === EProposalType.DISCUSSION ? (
								<span className='text-xs text-text_pink'>{t('Search.referenda')}</span>
							) : (
								<span className={styles.post_type}>{hit.proposalType.charAt(0).toUpperCase() + hit.proposalType.slice(1).replace('_', ' ')}</span>
							)}
						</div>
					)}
				</div>
			</div>
		</Link>
	);
}
function UserHit({ hit }: { hit: User }) {
	const t = useTranslations();

	return (
		<Link
			href={hit.username && `/user/username/${hit.username}`}
			target='_blank'
		>
			<div className='flex gap-2 rounded-lg p-4 hover:bg-bg_pink/10'>
				<Image
					src={userIcon}
					alt={hit.username}
					width={60}
					height={60}
					className='rounded-full'
				/>
				<div>
					<h2 className={styles.user_name}>{hit.username}</h2>
					<p className='mt-2 text-sm text-text_primary'>{hit.profile?.bio || t('Search.noBio')}</p>
				</div>
			</div>
		</Link>
	);
}

// eslint-disable-next-line sonarjs/cognitive-complexity
function SearchResults({ activeIndex }: { activeIndex: ESearchType | null }) {
	const { status, results } = useInstantSearch();
	const { query } = useSearchBox();
	const { currentRefinement, refine } = usePagination();
	const t = useTranslations();
	const isLoading = results?.nbHits === 0 && (status === 'loading' || status === 'stalled');
	const hasNoResults = results?.nbHits === 0 && query.length > 2;

	return (
		<div>
			<div className='h-[50vh] overflow-hidden md:h-[58vh]'>
				{isLoading ? (
					<div className='flex h-full items-center justify-center'>
						<Image
							src={searchLoader}
							alt='search-loader'
							width={274}
							height={274}
							className='-my-[40px]'
							priority
						/>
					</div>
				) : query.length > 0 && query.length < 3 ? (
					<div className={styles.post_context}>
						<Image
							src={searchGif}
							alt='search-icon'
							width={274}
							height={274}
							className='-my-[40px]'
							priority
						/>
						<p className='text-sm text-text_primary'>{t('Search.pleaseEnterAtLeast3Characters')}</p>
						<div className='mt-4 flex items-center gap-2'>
							<span className='text-text_secondary text-sm'>{t('Search.or')}</span>
						</div>
						<div className='mb-10 mt-4'>
							<span className={styles.search}>
								{t('Search.see')}
								<Link
									href='/'
									className='text-text_pink underline'
								>
									{t('Search.latestActivity')}
								</Link>
								<span>{t('Search.onPolkassembly')}</span>
							</span>
						</div>
					</div>
				) : query.length > 2 ? (
					<div className='h-full'>
						{hasNoResults ? (
							<div className={styles.post_context}>
								<Image
									src={searchGif}
									alt='search-icon'
									width={274}
									height={274}
									className='-my-[40px]'
									priority
								/>
								<p className='mb-2 text-sm text-text_primary'>{t('Search.noSearchResultsFound')}</p>
								<div className='mt-4 flex items-center gap-2'>
									<span className='text-text_secondary text-sm'>{t('Search.or')}</span>
								</div>
								<div className='mb-10 mt-4'>
									<span className={styles.search}>
										{t('Search.see')}
										<Link
											href='/'
											className='text-text_pink underline'
										>
											{t('Search.latestActivity')}
										</Link>
										<span>{t('Search.onPolkassembly')}</span>
									</span>
								</div>
							</div>
						) : (
							<div className='h-full overflow-y-auto pr-2'>
								{activeIndex === ESearchType.POSTS ? (
									<Index indexName='polkassembly_v2_posts'>
										<Configure filters='NOT proposalType:DISCUSSION AND NOT proposalType:GRANTS' />
										<div className='space-y-4'>
											<Hits hitComponent={PostHit} />
										</div>
									</Index>
								) : activeIndex === ESearchType.DISCUSSIONS ? (
									<Index indexName='polkassembly_v2_posts'>
										<Configure filters='proposalType:DISCUSSION OR proposalType:GRANTS' />
										<div className='space-y-4'>
											<Hits hitComponent={PostHit} />
										</div>
									</Index>
								) : (
									<Index indexName='polkassembly_v2_users'>
										<Configure />
										<div className='space-y-4'>
											<Hits hitComponent={UserHit} />
										</div>
									</Index>
								)}
							</div>
						)}
					</div>
				) : (
					<div className={cn(styles.post_context, 'mb-10')}>
						<Image
							src={searchGif}
							alt='search-icon'
							width={274}
							height={274}
							className='-my-[40px]'
							priority
						/>
						<span className='mt-8 text-center tracking-[0.01em]'>{t('Search.welcomeToTheAllNewSuperchargedSearch')}</span>
						<div className={styles.pa_logo}>
							{t('Search.poweredByPolkassembly')}
							<PaLogo className='h-[30px] w-[99px]' />
						</div>
					</div>
				)}
			</div>
			{query.length > 2 && results?.nbHits > 10 && (
				<div className={styles.pagination}>
					<PaginationWithLinks
						page={currentRefinement + 1}
						pageSize={10}
						totalCount={results?.nbHits || 0}
						onPageChange={(newPage) => refine(newPage - 1)}
					/>
				</div>
			)}
		</div>
	);
}

export default SearchResults;
