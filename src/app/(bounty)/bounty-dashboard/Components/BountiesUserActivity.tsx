// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import BountyPoster from '@assets/bounties/bounty-poster.svg';
import Link from 'next/link';
import { spaceGroteskFont } from '@/app/_style/fonts';
import { ArrowUpRight } from 'lucide-react';
import { ENetwork, IBountyUserActivity } from '@/_shared/types';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { formatTokenValue } from '@/app/_client-utils/tokenValueFormatter';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from '@/app/_shared-components/Carousel';

function BountiesUserActivity({ userActivities, tokenPrice }: { userActivities: IBountyUserActivity[]; tokenPrice: string }) {
	const network = getCurrentNetwork();
	const currentTokenPrice = { isLoading: false, value: tokenPrice?.toString() };
	const unit = NETWORKS_DETAILS[network as ENetwork].tokenSymbol;
	const [api, setApi] = useState<CarouselApi>();

	useEffect(() => {
		if (!api) {
			return () => {};
		}
		const interval = setInterval(() => {
			api.scrollNext();
		}, 3000);

		return () => clearInterval(interval);
	}, [api]);

	return (
		<div className=''>
			<div className='mt-10 flex flex-col-reverse items-center gap-8 overflow-hidden md:flex-row'>
				<div className='relative'>
					<Image
						src={BountyPoster}
						alt='curator'
						className='w-[100%]'
					/>
					<Link
						href='/user-created-bounties'
						passHref
						className={`${spaceGroteskFont.className} absolute right-0 top-0 z-50 flex h-6 w-[86px] items-center justify-center gap-x-1 rounded-[50px] px-2 text-[10px] font-bold text-white sm:h-10 sm:w-[150px] sm:px-6 sm:text-base xl:h-[48px] xl:w-[180px] xl:px-[36px] xl:text-xl`}
						style={{
							background: 'linear-gradient(266deg, #301DA7 15.23%, #57F 75.34%)'
						}}
					>
						<div className='flex items-center gap-[2px]'>
							View All
							<ArrowUpRight
								className='text-white'
								size={20}
							/>
						</div>
					</Link>
				</div>

				<div className='md:w-[50%] xl:w-[40%]'>
					<div className='h-[350px] overflow-hidden'>
						<Carousel
							setApi={setApi}
							orientation='vertical'
							opts={{
								align: 'start',
								axis: 'y',
								loop: true,
								slidesToScroll: 1,
								containScroll: false,
								dragFree: true
							}}
						>
							<CarouselContent className='-mt-0'>
								{userActivities &&
									userActivities.map((activity) => (
										<CarouselItem
											key={activity.address + activity.created_at + activity.amount}
											className='!h-[50px] !pt-0'
											style={{
												marginTop: '0',
												padding: '0'
											}}
										>
											<div className='my-1 flex h-[50px] items-center gap-1 rounded-[14px] bg-bg_modal px-3 py-2 md:max-w-[450px]'>
												<Address address={activity?.address} />
												<span className='text-sm font-normal text-text_primary'>claimed</span>
												<span className='font-pixeboy text-sm font-normal text-text_pink md:text-[20px]'>
													{formatTokenValue(activity?.amount, network, currentTokenPrice, unit)}
												</span>
												<span className='text-sm font-normal text-text_primary'>bounty</span>
												<span className='mx-2 h-[5px] w-[5px] rounded-full bg-basic_text' />
												<span className='rounded-full text-xs text-wallet_btn_text'>{dayjs(activity?.created_at).format("DD[th] MMM 'YY")}</span>
											</div>
										</CarouselItem>
									))}
							</CarouselContent>
						</Carousel>
					</div>
				</div>
			</div>
		</div>
	);
}

export default BountiesUserActivity;
