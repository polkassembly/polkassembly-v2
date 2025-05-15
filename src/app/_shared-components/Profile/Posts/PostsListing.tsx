// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { IPostListing } from '@/_shared/types';
import { useTranslations } from 'next-intl';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import Image from 'next/image';
import noData from '@assets/activityfeed/gifs/noactivity.gif';
import ListingCard from '../../ListingComponent/ListingCard/ListingCard';
import { PaginationWithLinks } from '../../PaginationWithLinks';

function PostsListing({ posts, totalCount, currentPage, onPageChange }: { posts: IPostListing[]; totalCount: number; currentPage: number; onPageChange: (page: number) => void }) {
	const t = useTranslations('Profile');

	return (
		<div>
			{posts?.length > 0 ? (
				<div>
					{posts.map((post, idx) => {
						const backgroundColor = idx % 2 === 0 ? 'bg-listing_card1' : 'bg-section_dark_overlay';

						return (
							<ListingCard
								backgroundColor={backgroundColor}
								title={post.title || 'Untitled'}
								data={post}
								proposalType={post.proposalType}
								metrics={post.metrics}
								index={post.index ?? 0}
							/>
						);
					})}
					<div className='mt-4'>
						<PaginationWithLinks
							page={currentPage}
							pageSize={DEFAULT_LISTING_LIMIT}
							totalCount={totalCount}
							onPageChange={onPageChange}
						/>
					</div>
				</div>
			) : (
				<div className='mt-0 flex w-full flex-col items-center justify-center'>
					<Image
						src={noData}
						alt='no data'
						width={300}
						height={300}
					/>
					<p className='text-text_secondary mb-2 mt-0'>{t('Posts.noData')}</p>
				</div>
			)}
		</div>
	);
}

export default PostsListing;
