// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Image from 'next/image';
import searchGif from '@assets/search/search.gif';
import searchLoader from '@assets/search/search-loader.gif';
import userIcon from '@assets/profile/user-icon.svg';
import { Hits, Index, useInstantSearch, useSearchBox, Configure } from 'react-instantsearch';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import Link from 'next/link';
import CommentIcon from '@assets/icons/Comment.svg';
import { AiOutlineDislike, AiOutlineLike } from 'react-icons/ai';
import PaLogo from '../PaLogo';
import { Separator } from '../../Separator';
import BlockEditor from '../../BlockEditor/BlockEditor';
import Address from '../../Profile/Address/Address';
import CreatedAtTime from '../../CreatedAtTime/CreatedAtTime';

export const POST_TOPIC_MAP = {
	AUCTION_ADMIN: 8,
	COMMUNITY_PIPS: 14,
	COUNCIL: 2,
	DEMOCRACY: 1,
	FELLOWSHIP: 10,
	GENERAL: 5,
	GENERAL_ADMIN: 15,
	GOVERNANCE: 9,
	ROOT: 6,
	STAKING_ADMIN: 7,
	TECHNICAL_COMMITTEE: 3,
	TECHNICAL_PIPS: 12,
	TREASURY: 4,
	UPGRADE_PIPS: 13,
	WHITELIST: 11
};

interface Post {
	id: string;
	objectID: string;
	title: string;
	content: string;
	proposer_address: string;
	post_type: 'on-chain-posts' | 'off-chain-posts' | 'discussions' | 'grants';
	created_at: number;
	track?: number;
	tags?: string[];
	parsed_content?: string;
	network?: string;
	topic_id?: number;
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
	const topic = hit.topic_id ? Object.keys(POST_TOPIC_MAP).find((key) => POST_TOPIC_MAP[key as keyof typeof POST_TOPIC_MAP] === hit.topic_id) : null;
	console.log('hit', hit);
	return (
		<Link
			href={hit.post_type !== 'discussions' ? `/referenda/${hit.id}` : `/post/${hit.id}`}
			target='_blank'
			className='cursor-pointer p-4 text-btn_secondary_text hover:border-y-bg_pink'
		>
			<div className='flex'>
				{hit.proposer_address && (
					<Address
						address={hit.proposer_address}
						className='text-lg font-medium'
					/>
				)}
			</div>
			<h2 className='text-lg font-medium'>
				<p className='text-sm font-medium'>
					#{hit.id} {hit.title.length > 90 ? `${hit.title.slice(0, 90)}...` : hit.title}
				</p>
			</h2>
			<div className='mb-5 flex max-h-40 w-full overflow-hidden border-none'>
				<BlockEditor
					data={typeof hit.content === 'string' ? { blocks: [{ type: 'paragraph', data: { text: `${hit.content.slice(0, 350)}...` } }] } : hit.content}
					readOnly
					id={`post-content-${hit.objectID}`}
				/>
			</div>{' '}
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
				</div>
				<Separator
					orientation='vertical'
					className='h-4'
				/>{' '}
				{hit.tags && hit.tags.length > 0 && (
					<div className='flex items-center gap-2'>
						{hit.tags?.map((tag) => (
							<span
								key={tag}
								className='rounded bg-gray-100 px-2 py-1 text-xs text-gray-800'
							>
								{tag}
							</span>
						))}
						<Separator
							orientation='vertical'
							className='h-4'
						/>{' '}
					</div>
				)}
				{hit.created_at && (
					<div className='flex items-center gap-2'>
						<CreatedAtTime createdAt={dayjs.utc(hit.created_at * 1000).toDate()} />
						<Separator
							orientation='vertical'
							className='h-4'
						/>{' '}
					</div>
				)}
				{topic && (
					<div className='flex items-center gap-2'>
						<span className='rounded bg-gray-100 px-2 py-1 text-xs text-gray-800'>{topic.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}</span>{' '}
						<Separator
							orientation='vertical'
							className='h-4'
						/>{' '}
					</div>
				)}
				{hit.post_type && (
					<div className='flex items-center gap-2'>
						<p>in</p>
						<span className='rounded bg-pink-100 px-2 py-1 text-xs text-pink-800'>{hit.post_type.charAt(0).toUpperCase() + hit.post_type.slice(1).replace('_', ' ')}</span>
					</div>
				)}
			</div>
		</Link>
	);
}
function UserHit({ hit }: { hit: User }) {
	return (
		<Link
			href={hit.username && `/user/username/${hit.username}`}
			className='flex cursor-pointer gap-2 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800'
		>
			<Image
				src={userIcon}
				alt={hit.username}
				width={60}
				height={60}
				className='rounded-full'
			/>
			<div>
				<h2 className='text-lg font-medium'>{hit.username}</h2>
				<p className='mt-2 text-sm text-gray-600 dark:text-gray-300'>{hit.profile?.bio || 'No bio'}</p>
			</div>
		</Link>
	);
}

function SearchResults({ activeIndex }: { activeIndex: 'posts' | 'users' | 'discussions' | null }) {
	const { status } = useInstantSearch();
	const { query } = useSearchBox();
	const isLoading = status === 'loading';

	return (
		<div className='flex h-[400px] flex-col'>
			{isLoading ? (
				<div className='mt-8 flex h-[360px] flex-col items-center justify-center'>
					<Image
						src={searchLoader}
						alt='search-loader'
						width={274}
						height={274}
						className='-my-[40px]'
						priority
					/>
				</div>
			) : query.length > 3 ? (
				<div className='flex-1 overflow-auto'>
					{activeIndex === 'posts' ? (
						<Index indexName='polkassembly_posts'>
							<Configure filters='NOT post_type:discussions AND NOT post_type:grants' />
							<div className='space-y-4'>
								<Hits hitComponent={PostHit} />
							</div>
						</Index>
					) : activeIndex === 'discussions' ? (
						<Index indexName='polkassembly_posts'>
							<Configure filters="post_type:'discussions' OR post_type:'grants'" />
							<div className='space-y-4'>
								<Hits hitComponent={PostHit} />
							</div>
						</Index>
					) : (
						<Index indexName='polkassembly_users'>
							<div className='space-y-4'>
								<Hits hitComponent={UserHit} />
							</div>
						</Index>
					)}
				</div>
			) : (
				<div className='mt-8 flex h-[360px] flex-col items-center justify-center text-sm font-medium text-btn_secondary_text'>
					<Image
						src={searchGif}
						alt='search-icon'
						width={274}
						height={274}
						className='-my-[40px]'
						priority
					/>
					<span className='mt-8 text-center tracking-[0.01em]'>Welcome to the all new & supercharged search!</span>
					<div className='mt-2 flex items-center gap-1 text-xs font-medium tracking-[0.01em]'>
						powered by
						<PaLogo className='h-[30px] w-[99px]' />
					</div>
				</div>
			)}
		</div>
	);
}

export default SearchResults;
