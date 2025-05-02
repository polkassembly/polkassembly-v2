// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { IGenericListingResponse, IPostListing } from '@/_shared/types';
import { formatTokenValue } from '@/app/_client-utils/tokenValueFormatter';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { getSpanStyle } from '@/app/_shared-components/TopicTag/TopicTag';
import { convertCamelCaseToTitleCase } from '@/_shared/_utils/convertCamelCaseToTitleCase';
import { spaceGroteskFont } from '@/app/_style/fonts';
import BountyCard from '@assets/bounties/bounty-card.svg';
import DollarIcon from '@assets/bounties/Dollar.svg';
import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from '@ui/Carousel';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { FaChevronLeft } from '@react-icons/all-files/fa/FaChevronLeft';
import { FaChevronRight } from '@react-icons/all-files/fa/FaChevronRight';
import { useTranslations } from 'next-intl';
import { MarkdownViewer } from '@/app/_shared-components/MarkdownViewer/MarkdownViewer';
import styles from './Bounty.module.scss';

function BountyProposal({ bountyProposals, tokenPrice }: { bountyProposals: IGenericListingResponse<IPostListing>; tokenPrice: number }) {
	const [api, setApi] = useState<CarouselApi>();
	const [current, setCurrent] = useState(0);
	const network = getCurrentNetwork();
	const t = useTranslations('Bounty');
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
			<h3 className={styles.bounty_proposal_text}>
				<Image
					src={DollarIcon}
					alt='Dollar'
					className='h-8 w-8'
					width={24}
					height={24}
				/>
				{t('bountyProposal')}
			</h3>
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
						{bountyProposals.items &&
							bountyProposals.items.map((bounty) => (
								<CarouselItem
									key={bounty.index}
									className='pl-6 md:basis-1/2 lg:basis-1/3'
								>
									<div className={styles.bounty_proposal_wrapper}>
										<div className='flex w-full'>
											<div className={styles.bounty_proposal_wrapper_text}>
												<div className='flex items-baseline gap-x-2'>
													<h2 className='mt-4 font-pixeboy text-[35px] font-normal text-navbar_border'>
														{formatTokenValue(String(bounty.onChainInfo?.reward ?? 0), network, tokenPrice)}
													</h2>
												</div>
												<div className={styles.bounty_proposal_div}>
													<span className={styles.bounty_proposal_div_span} />
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
												<span className={styles.bounty_proposal_span_line} />
												<button
													type='button'
													className={`${spaceGroteskFont.className} ${styles.bounty_proposal_button}`}
												>
													{t('vote')}
												</button>
											</div>
										</div>
										<div className={styles.bounty_proposal_wrapper_img}>
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
											<div className={styles.bounty_proposal_wrapper_img_text}>
												<MarkdownViewer markdown={bounty.content} />
											</div>
											<div className='mb-2 mt-5 flex items-center justify-between text-sm'>
												<Address
													address={bounty.onChainInfo?.proposer || ''}
													className='text-sm text-text_primary'
												/>
												<span className={`${getSpanStyle(bounty.onChainInfo?.origin || '', 1)} rounded-md px-1.5 py-1 text-xs`}>
													{convertCamelCaseToTitleCase(bounty.onChainInfo?.origin || '')}
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
							className={styles.carouselLeftArrow}
							onClick={() => api?.scrollPrev()}
						>
							<FaChevronLeft
								size={24}
								className='font-bold text-bg_modal'
							/>
						</button>
					)}
					{current < bountyProposals.items.length - 1 &&
						(window.innerWidth >= 1024 ? bountyProposals.items.length > 3 : window.innerWidth >= 768 ? bountyProposals.items.length > 2 : bountyProposals.items.length > 1) && (
							<button
								type='button'
								className={styles.carouselRightArrow}
								onClick={() => api?.scrollNext()}
							>
								<FaChevronRight
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
