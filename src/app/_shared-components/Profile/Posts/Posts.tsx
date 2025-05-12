// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useTranslations } from 'next-intl';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { getEncodedAddress } from '@/_shared/_utils/getEncodedAddress';
import { useState } from 'react';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { ClientError } from '@/app/_client-utils/clientError';
import { useQuery } from '@tanstack/react-query';
import { IUserPosts } from '@/_shared/types';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { Separator } from '../../Separator';
import classes from './Posts.module.scss';
import { Button } from '../../Button';
import { Skeleton } from '../../Skeleton';
import Address from '../Address/Address';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../Select/Select';
import PostsListing from './PostsListing';

enum EPostsType {
	OPEN_GOV = 'openGov',
	DISCUSSIONS = 'discussions'
}

function Posts({ addresses }: { addresses: string[] }) {
	const t = useTranslations('Profile');
	const network = getCurrentNetwork();
	const [selectedAddress, setSelectedAddress] = useState<string>(addresses?.[0]);
	const [page, setPage] = useState<number>(1);
	const [selectedPosts, setSelectedPosts] = useState<EPostsType>(EPostsType.OPEN_GOV);

	const fetchUserPosts = async () => {
		const { data: userPostsData, error: userPostsError } = await NextApiClientService.getUserPosts({
			address: getEncodedAddress(selectedAddress, network) || '',
			page,
			limit: DEFAULT_LISTING_LIMIT
		});
		if (userPostsError || !userPostsData) {
			throw new ClientError(userPostsError?.message || 'Failed to fetch data');
		}
		return userPostsData;
	};

	const { data: userPostsData, isFetching } = useQuery<IUserPosts>({
		queryKey: ['userPosts', selectedAddress, page],
		queryFn: fetchUserPosts,
		enabled: !!selectedAddress,
		placeholderData: (previousData) => previousData,
		staleTime: FIVE_MIN_IN_MILLI
	});

	return (
		<div className={classes.postsWrapper}>
			<div className={classes.postsHeader}>
				<div className='flex items-center gap-x-1'>
					<h1 className={classes.postsHeaderText}>{t('Posts.posts')}</h1>
					{(ValidatorService.isValidNumber(userPostsData?.onchainPostsResponse?.totalCount) ||
						ValidatorService.isValidNumber(userPostsData?.offchainPostsResponse?.totalCount)) && (
						<span className='text-sm font-medium'>({(userPostsData?.onchainPostsResponse?.totalCount || 0) + (userPostsData?.offchainPostsResponse?.totalCount || 0)})</span>
					)}
				</div>
				{addresses.length > 1 && (
					<Select
						value={selectedAddress}
						onValueChange={(value) => {
							setSelectedAddress(value);
						}}
					>
						<SelectTrigger className='w-[180px] text-sm'>
							<SelectValue defaultValue={selectedAddress} />
						</SelectTrigger>
						<SelectContent>
							{addresses.map((address) => (
								<SelectItem
									key={address}
									value={address}
								>
									<Address
										address={address}
										disableTooltip
									/>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				)}
			</div>
			<Separator />
			<div>
				<div className={classes.postsHeaderButtons}>
					<Button
						variant={selectedPosts === EPostsType.OPEN_GOV ? 'default' : 'secondary'}
						onClick={() => setSelectedPosts(EPostsType.OPEN_GOV)}
						disabled={isFetching}
						className='flex items-center gap-x-1'
					>
						{t('Posts.openGov')}
						{ValidatorService.isValidNumber(userPostsData?.onchainPostsResponse?.totalCount) && (
							<span className={classes.postsHeaderTextAddress}>({userPostsData?.onchainPostsResponse?.totalCount})</span>
						)}
					</Button>
					<Button
						variant={selectedPosts === EPostsType.DISCUSSIONS ? 'default' : 'secondary'}
						onClick={() => setSelectedPosts(EPostsType.DISCUSSIONS)}
						disabled={isFetching}
						className='flex items-center gap-x-1'
					>
						{t('Posts.discussions')}
						{ValidatorService.isValidNumber(userPostsData?.offchainPostsResponse?.totalCount) && (
							<span className={classes.postsHeaderTextAddress}>({userPostsData?.offchainPostsResponse?.totalCount})</span>
						)}
					</Button>
				</div>
				{isFetching ? (
					<Skeleton className={classes.postsHeaderSkeleton} />
				) : (
					<div className='w-full'>
						<div className='mt-6 w-full'>
							<PostsListing
								posts={selectedPosts === EPostsType.OPEN_GOV ? userPostsData?.onchainPostsResponse?.items || [] : userPostsData?.offchainPostsResponse?.items || []}
								totalCount={selectedPosts === EPostsType.OPEN_GOV ? userPostsData?.onchainPostsResponse?.totalCount || 0 : userPostsData?.offchainPostsResponse?.totalCount || 0}
								currentPage={page}
								onPageChange={setPage}
							/>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default Posts;
