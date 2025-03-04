// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { IGenericListingResponse, IPostListing, IBountyUserActivity, EProposalType } from '@/_shared/types';
import { ArrowUpRight } from 'lucide-react';
import BountyCard from '@assets/bounties/bounty-card.svg';
import Image from 'next/image';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { spaceGroteskFont } from '@/app/_style/fonts';
import ChildBounties from '@assets/bounties/child_bounties.svg';
import { FaAngleRight } from 'react-icons/fa6';
import { Carousel, CarouselContent, CarouselItem } from '@ui/Carousel';
import { useCallback, useEffect, useState } from 'react';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { type CarouselApi } from '@ui/Carousel';
import { SlArrowLeft, SlArrowRight } from 'react-icons/sl';
import { formatTokenValue } from '@/app/_client-utils/tokenValueFormatter';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import BountiesUserActivity from './BountiesUserActivity';

export default function HotBounties({
	hotBounties,
	userActivities,
	tokenPrice
}: {
	hotBounties: IGenericListingResponse<IPostListing>;
	userActivities: IBountyUserActivity[];
	tokenPrice: string | number;
}) {
	const [api, setApi] = useState<CarouselApi>();
	const [current, setCurrent] = useState(0);
	const network = getCurrentNetwork();
	const [childBountiesCounts, setChildBountiesCounts] = useState<Record<string, number>>({});

	const onSelect = useCallback(() => {
		if (!api) return;
		setCurrent(api.selectedScrollSnap());
	}, [api]);

	const getChildBounties = async () => {
		try {
			const promises = hotBounties.items
				.filter((bounty): bounty is IPostListing & { index: number } => bounty.index !== undefined)
				.map((bounty) => NextApiClientService.getChildBounties(EProposalType.BOUNTY, bounty.index.toString()));

			const results = await Promise.all(promises);
			const counts = results.reduce(
				(acc, result, index) => {
					const bountyIndex = hotBounties.items[index as number]?.index?.toString() || '';
					if (bountyIndex) acc[bountyIndex as string] = result.data?.length || 0;
					return acc;
				},
				{} as Record<string, number>
			);

			setChildBountiesCounts(counts);
		} catch (error) {
			console.error('Error fetching child bounties:', error);
		}
	};

	useEffect(() => {
		if (hotBounties.items.length > 0) {
			getChildBounties();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hotBounties.items]);

	useEffect(() => {
		if (!api) {
			return () => {};
		}
		api.on('select', onSelect);
		return () => {
			api.off('select', onSelect);
		};
	}, [api, onSelect]);

	return (
		<div>
			<div className='flex items-center justify-between p-4'>
				<h3 className='font-pixelify text-3xl font-bold text-btn_secondary_text'>
					🔥 Hot Bounties <span className={`text-2xl font-medium ${spaceGroteskFont.className}`}>({hotBounties.totalCount})</span>
				</h3>
				<p className={`${spaceGroteskFont.className} text-2xl font-bold text-navbar_border`}>View All</p>
			</div>
			<div className='relative px-12'>
				<Carousel
					opts={{
						align: 'start',
						loop: false
					}}
					className='w-full'
					setApi={setApi}
				>
					<CarouselContent className='-ml-6'>
						{hotBounties.items.map((bounty) => (
							<CarouselItem
								key={bounty.index}
								className='pl-6 md:basis-1/2 lg:basis-1/3'
							>
								<div className='relative mx-auto max-w-[363px] overflow-hidden xl:max-w-[420px]'>
									<div className='flex w-full'>
										<div className='relative flex h-[56px] w-[85%] items-center gap-x-3 rounded-t-3xl border-b-0 border-l border-r border-t border-solid border-border_grey bg-bg_modal px-3 pt-5'>
											<div className='flex items-baseline gap-x-2'>
												<h2 className='mt-4 font-pixeboy text-[35px] font-normal text-navbar_border'>
													{formatTokenValue(String(bounty.onChainInfo?.reward), network, tokenPrice as string)}
												</h2>
											</div>
											<div className='absolute bottom-0 right-[-30px] h-[30px] w-[30px] overflow-hidden bg-bg_modal'>
												<span className='bg-bg_primary absolute bottom-0 left-0 h-[30px] w-[30px] rounded-bl-[100%] border-b border-l border-border_grey' />
											</div>
										</div>
										<div className='z-10 ml-2 mt-1'>
											<button
												type='button'
												className='rounded-full bg-arrow_bg_color p-3'
											>
												<ArrowUpRight
													size={20}
													className='text-bg_modal'
												/>
											</button>
										</div>
									</div>
									<div className='rounded-tr-2xl border-b border-l border-r border-t-0 border-solid border-border_grey bg-bg_modal px-3 py-1'>
										<Image
											src={BountyCard}
											alt='Bounty'
											className='my-3 h-32 w-full rounded-md object-cover'
											width={100}
											height={100}
										/>
										<h4 className='text-lg font-bold text-btn_secondary_text'>
											<span className='text-[17px] font-medium text-wallet_btn_text'>#{bounty.index}</span> {bounty.title}
										</h4>
										<div className='line-clamp-2 overflow-hidden text-ellipsis'>
											<p className='text-sm text-text_primary'>{bounty.onChainInfo?.description}</p>
										</div>
										<div className='mb-2 mt-10 flex items-center text-sm'>
											<Address
												address={bounty.onChainInfo?.proposer || ''}
												className='text-sm text-text_primary'
											/>
										</div>
									</div>
									<div className='flex items-center justify-between rounded-b-3xl bg-child_bounties_bg p-4'>
										<div className='flex items-center gap-2'>
											<Image
												src={ChildBounties}
												alt='Child Bounties'
												width={16}
												height={16}
											/>
											<span className='text-sm text-btn_primary_text'>Child Bounties: {childBountiesCounts[bounty.index?.toString() || ''] || 0}</span>
										</div>
										<FaAngleRight
											className='text-btn_primary_text text-opacity-[70%]'
											size={18}
										/>
									</div>
								</div>
							</CarouselItem>
						))}
					</CarouselContent>

					{current > 0 && (
						<button
							type='button'
							className='absolute -left-6 top-1/2 -translate-y-1/2 rounded-full bg-arrow_bg_color p-4 shadow-lg'
							onClick={() => api?.scrollPrev()}
						>
							<SlArrowLeft
								size={24}
								className='font-bold text-bg_modal'
							/>
						</button>
					)}
					{current < hotBounties.items.length - 3 && (
						<button
							type='button'
							className='absolute -right-6 top-1/2 -translate-y-1/2 rounded-full bg-arrow_bg_color p-4 shadow-lg'
							onClick={() => api?.scrollNext()}
						>
							<SlArrowRight
								size={24}
								className='font-bold text-bg_modal'
							/>
						</button>
					)}
				</Carousel>
			</div>
			<BountiesUserActivity
				userActivities={userActivities}
				tokenPrice={tokenPrice as string}
			/>
		</div>
	);
}
