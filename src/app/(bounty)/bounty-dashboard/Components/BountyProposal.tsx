// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { IGenericListingResponse, IPostListing } from '@/_shared/types';
import { formatTokenValue } from '@/app/_client-utils/tokenValueFormatter';
import BlockEditor from '@/app/_shared-components/BlockEditor/BlockEditor';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { getSpanStyle } from '@/app/_shared-components/TopicTag/TopicTag';
import { spaceGroteskFont } from '@/app/_style/fonts';
import BountyCard from '@assets/bounties/bounty-card.svg';
import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from '@ui/Carousel';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { SlArrowLeft, SlArrowRight } from 'react-icons/sl';

function BountyProposal({ bountyProposals, tokenPrice }: { bountyProposals: IGenericListingResponse<IPostListing>; tokenPrice: string | number }) {
	console.log(bountyProposals);
	const [api, setApi] = useState<CarouselApi>();
	const [current, setCurrent] = useState(0);
	const network = getCurrentNetwork();
	const onSelect = useCallback(() => {
		if (!api) return;
		setCurrent(api.selectedScrollSnap());
	}, [api]);

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
		<div className='mt-5'>
			<h3 className='font-pixelify text-3xl font-bold text-btn_secondary_text'>Bounty Proposal</h3>
			<div className='relative mt-5'>
				<Carousel
					opts={{
						align: 'start',
						loop: false
					}}
					className='w-full'
					setApi={setApi}
				>
					<CarouselContent className='-ml-6'>
						{bountyProposals.items.map((bounty) => (
							<CarouselItem
								key={bounty.index}
								className='pl-6 md:basis-1/2 lg:basis-1/3'
							>
								<div className='relative mx-auto max-w-[363px] overflow-hidden xl:max-w-[420px]'>
									<div className='flex w-full'>
										<div className='relative flex h-[56px] w-[90%] items-center gap-x-3 rounded-t-3xl border-b-0 border-l border-r border-t border-solid border-border_grey bg-bg_modal px-3 pt-5'>
											<div className='flex items-baseline gap-x-2'>
												<h2 className='mt-4 font-pixeboy text-[35px] font-normal text-navbar_border'>
													{formatTokenValue(String(bounty.onChainInfo?.reward), network, tokenPrice as string)}
												</h2>
											</div>
											<div className='absolute bottom-0 right-[-30px] h-[30px] w-[30px] overflow-hidden bg-bg_modal'>
												<span className='absolute bottom-0 left-0 h-[30px] w-[30px] rounded-bl-[100%] border-b border-l border-border_grey bg-page_background' />
											</div>
										</div>
										<div className='z-10 ml-8 flex items-center -space-x-0.5'>
											<button
												type='button'
												className='rounded-full bg-arrow_bg_color p-3'
											>
												<ArrowUpRight
													size={20}
													className='text-bg_modal'
												/>
											</button>
											<span className='relative h-2 w-[10px] bg-arrow_bg_color before:absolute before:bottom-[-13px] before:right-[-1px] before:h-3 before:w-3 before:rounded-full before:shadow-[0_-4px_0_0_black] after:absolute after:bottom-[8px] after:right-[-1px] after:h-3 after:w-3 after:rounded-full after:shadow-[0_4px_0_0_black] dark:before:shadow-[0_-4px_0_0_white] dark:after:shadow-[0_4px_0_0_white]' />
											<button
												type='button'
												className={`${spaceGroteskFont.className} h-[36px] w-[75px] cursor-pointer rounded-3xl border-none bg-arrow_bg_color text-base font-bold text-bg_modal md:h-[44px] md:w-[100px] md:text-lg`}
											>
												Vote
											</button>
										</div>
									</div>
									<div className='h-[300px] rounded-b-3xl rounded-tr-2xl border-b border-l border-r border-t-0 border-solid border-border_grey bg-bg_modal px-3 py-1'>
										<Image
											src={BountyCard}
											alt='Bounty'
											className='my-3 h-32 w-full rounded-md object-cover'
											width={100}
											height={100}
										/>
										<h4 className={`${spaceGroteskFont.className} font-medium`}>
											<span className='text-[17px] text-wallet_btn_text'>#{bounty.index}</span>{' '}
											<span className='text-[18px] text-btn_secondary_text'>{bounty.title?.slice(0, 28)}</span>
										</h4>
										<div className='line-clamp-2 overflow-hidden text-ellipsis text-sm text-btn_secondary_text'>
											<BlockEditor
												data={{ blocks: bounty.content?.blocks?.slice(0, 1) || [] }}
												readOnly
												id={`bounty-content-${bounty.index}`}
											/>
										</div>
										<div className='mb-2 mt-5 flex items-center justify-between text-sm'>
											<Address
												address={bounty.onChainInfo?.proposer || ''}
												className='text-sm text-text_primary'
											/>
											<span className={`${getSpanStyle(bounty.onChainInfo?.origin || '', 1)} rounded-md px-1.5 py-1 text-xs`}>
												{bounty.onChainInfo?.origin.replace(/([A-Z])/g, ' $1').trim() || ''}
											</span>
										</div>
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
					{current < bountyProposals.items.length - 3 && (
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
		</div>
	);
}

export default BountyProposal;
