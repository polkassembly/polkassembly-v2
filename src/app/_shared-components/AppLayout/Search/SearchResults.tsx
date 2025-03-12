// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Image from 'next/image';
import searchGif from '@assets/search/search.gif';
import searchLoader from '@assets/search/search-loader.gif';
import userIcon from '@assets/profile/user-icon.svg';
import { Highlight, Hits, Index, useInstantSearch, useSearchBox, Configure } from 'react-instantsearch';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PaLogo from '../PaLogo';
import { Separator } from '../../Separator';
import { FaRegClock } from 'react-icons/fa';
import BlockEditor from '../../BlockEditor/BlockEditor';
import Address from '../../Profile/Address/Address';

const POST_TOPIC_MAP = {
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
	const router = useRouter();

	const handleClick = () => {
		if (!hit.id) return;
		if (hit.post_type === 'discussions') {
			router.push(`/referenda/${hit.id}`);
		} else {
			router.push(`/post/${hit.id}`);
		}
	};
	return (
		<div
			aria-hidden
			onClick={handleClick}
			className='cursor-pointer rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800'
		>
			{hit.proposer_address && (
				<Address
					address={hit.proposer_address}
					className='text-lg font-medium'
				/>
			)}
			<h2 className='text-lg font-medium'>
				<Highlight
					attribute='title'
					hit={hit}
				/>
			</h2>
			<div className='flex max-h-40 w-full overflow-hidden border-none'>
				<BlockEditor
					data={hit.content}
					readOnly
					id={`post-content-${hit.objectID}`}
				/>
			</div>{' '}
			<div className='mt-2 flex flex-wrap gap-2'>
				{hit.network && <span className='rounded bg-blue-100 px-2 py-1 text-xs text-blue-800'>{hit.network}</span>}
				{hit.tags?.map((tag) => (
					<span
						key={tag}
						className='rounded bg-gray-100 px-2 py-1 text-xs text-gray-800'
					>
						{tag}
					</span>
				))}
				<span className='flex items-center gap-2 text-sm text-text_primary'>
					<FaRegClock />
					{dayjs.utc(hit.created_at * 1000).format("Do MMM 'YY")}
				</span>{' '}
				{topic && <span className='rounded bg-gray-100 px-2 py-1 text-xs text-gray-800'>{topic.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}</span>}
				<Separator
					orientation='vertical'
					className='h-5'
				/>{' '}
				in
				{hit.post_type && (
					<span className='rounded bg-pink-100 px-2 py-1 text-xs text-pink-800'>{hit.post_type.charAt(0).toUpperCase() + hit.post_type.slice(1).replace('_', ' ')}</span>
				)}
			</div>
		</div>
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
				<>
					<div className='flex-1 overflow-auto'>
						{activeIndex === 'posts' ? (
							<Index indexName='polkassembly_posts'>
								<Configure filters='post_type:-discussions AND post_type:-grants' />
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
				</>
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
