// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IGenericListingResponse, IPostListing } from '@/_shared/types';
import { ArrowUpRight } from 'lucide-react';
import BountyCard from '@assets/bounties/bounty-card.svg';
import Image from 'next/image';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { spaceGroteskFont } from '@/app/_style/fonts';
import ChildBounties from '@assets/bounties/child_bounties.svg';
import { FaAngleRight } from 'react-icons/fa6';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@ui/Carousel';
import { useCallback, useEffect, useState } from 'react';
import { SlArrowLeft, SlArrowRight } from 'react-icons/sl';
import { formatTokenValue } from '@/app/_client-utils/tokenValueFormatter';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import BlockEditor from '@/app/_shared-components/BlockEditor/BlockEditor';
import { useTranslations } from 'next-intl';

export default function HotBounties({ hotBounties, tokenPrice }: { hotBounties: IGenericListingResponse<IPostListing>; tokenPrice: string | number }) {
	const [carouselApi, setCarouselApi] = useState<CarouselApi>();
	const [current, setCurrent] = useState(0);
	const network = getCurrentNetwork();
	const t = useTranslations('Bounty');

	const onSelect = useCallback(() => {
		if (!carouselApi) return;
		setCurrent(carouselApi.selectedScrollSnap());
	}, [carouselApi]);

	useEffect(() => {
		if (!carouselApi) {
			return () => {};
		}
		carouselApi.on('select', onSelect);
		return () => {
			carouselApi.off('select', onSelect);
		};
	}, [carouselApi, onSelect]);

	return (
		<div>
			<div className='my-5 flex items-center justify-between'>
				<h3 className='font-pixelify text-3xl font-bold text-btn_secondary_text'>
					🔥 Hot Bounties <span className={`text-2xl font-medium ${spaceGroteskFont.className}`}>({hotBounties.totalCount})</span>
				</h3>
				<p className={`${spaceGroteskFont.className} text-2xl font-bold text-navbar_border`}>{t('viewAll')}</p>
			</div>
			<div className='relative'>
				<Carousel
					opts={{
						align: 'start',
						loop: false
					}}
					className='w-full'
					setApi={setCarouselApi}
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
												<h2 className='m t-4 font-pixeboy text-[35px] font-normal text-navbar_border'>
													{formatTokenValue(String(bounty.onChainInfo?.reward), network, tokenPrice as string)}
												</h2>
											</div>
											<div className='absolute bottom-0 right-[-30px] h-[30px] w-[30px] overflow-hidden bg-bg_modal'>
												<span className='absolute bottom-0 left-0 h-[30px] w-[30px] rounded-bl-[100%] border-b border-l border-border_grey bg-page_background' />
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
									<div className='h-[310px] rounded-tr-2xl border-b border-l border-r border-t-0 border-solid border-border_grey bg-bg_modal px-3 py-1'>
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
												data={{ blocks: bounty.content?.blocks?.slice(0, 2) || [] }}
												readOnly
												id={`bounty-content-${bounty.index}`}
											/>{' '}
										</div>
										<div className='mb-2 mt-8 flex items-center text-sm'>
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
											<span className='text-sm text-btn_primary_text'>
												{t('childBounties')}: {bounty.onChainInfo?.childBountiesCount}
											</span>
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
							onClick={() => carouselApi?.scrollPrev()}
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
							onClick={() => carouselApi?.scrollNext()}
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
