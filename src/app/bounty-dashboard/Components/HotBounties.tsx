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
import { useTranslations } from 'next-intl';
import { MarkdownViewer } from '@/app/_shared-components/MarkdownViewer/MarkdownViewer';
import Link from 'next/link';
import styles from './Bounty.module.scss';

export default function HotBounties({ hotBounties, tokenPrice }: { hotBounties: IGenericListingResponse<IPostListing>; tokenPrice: number }) {
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
					{t('hotBounties')} <span className={`text-2xl font-medium ${spaceGroteskFont.className}`}>({hotBounties.totalCount})</span>
				</h3>
				<Link
					href='/bounties'
					className={`${spaceGroteskFont.className} text-2xl font-bold text-navbar_border`}
				>
					{t('viewAll')}
				</Link>
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
								<Link
									href={`/bounty/${bounty.index}`}
									className='relative mx-auto max-w-[363px] overflow-hidden xl:max-w-[420px]'
								>
									<div className='flex w-full'>
										<div className={styles.hotbounties_wrapper}>
											<div className='flex items-baseline gap-x-2'>
												<h2 className={styles.hotbounties_wrapper_text}>{formatTokenValue(String(bounty.onChainInfo?.reward ?? 0), network, tokenPrice)}</h2>
											</div>
											<div className={styles.hotbounties_div}>
												<span className={styles.bounty_proposal_div_span} />
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
									<div className={styles.hotbounties_wrapper_img}>
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
										<div className={styles.hotbounties_wrapper_editor_text}>
											<MarkdownViewer markdown={bounty.content} />
										</div>
										<div className='mb-2 mt-8 flex items-center text-sm'>
											<Address
												address={bounty.onChainInfo?.proposer || ''}
												className='text-sm text-text_primary'
											/>
										</div>
									</div>
									<div className={styles.hotbounties_wrapper_img_text}>
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
								</Link>
							</CarouselItem>
						))}
					</CarouselContent>

					{current > 0 && (
						<button
							type='button'
							className={styles.carouselLeftArrow}
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
							className={styles.carouselRightArrow}
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
