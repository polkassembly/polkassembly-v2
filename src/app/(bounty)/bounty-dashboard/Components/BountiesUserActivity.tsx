// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Image from 'next/image';
import { useEffect, useState } from 'react';
import BountyPoster from '@assets/bounties/bounty-poster.svg';
import { spaceGroteskFont } from '@/app/_style/fonts';
import { ArrowUpRight } from 'lucide-react';
import { ENetwork, IBountyUserActivity } from '@/_shared/types';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { formatTokenValue } from '@/app/_client-utils/tokenValueFormatter';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from '@/app/_shared-components/Carousel';
import { useTranslations } from 'next-intl';
import styles from './Bounty.module.scss';

function BountiesUserActivity({ userActivities, tokenPrice }: { userActivities: IBountyUserActivity[]; tokenPrice?: number }) {
	const network = getCurrentNetwork();
	const unit = NETWORKS_DETAILS[network as ENetwork].tokenSymbol;
	const [api, setApi] = useState<CarouselApi>();
	const t = useTranslations('Bounty');

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
		<div>
			<div className={styles.bounty_User_Activity_Container}>
				<div className='relative'>
					<Image
						src={BountyPoster}
						alt='curator'
						className='w-[100%]'
					/>
					<div
						className={`${spaceGroteskFont.className} ${styles.bounty_User_Activity_Container_Skeleton_Wrapper}`}
						style={{
							background: 'linear-gradient(266deg, #301DA7 15.23%, #57F 75.34%)'
						}}
					>
						<div className='flex items-center gap-[2px]'>
							{t('viewAll')}
							<ArrowUpRight
								className='text-btn_primary_text'
								size={20}
							/>
						</div>
					</div>
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
											key={`${activity.address}-${Math.random()}`}
											className='!h-[50px] !pt-0'
											style={{
												marginTop: '0',
												padding: '0'
											}}
										>
											<div className={styles.bounty_User_Activity_Carousel}>
												<Address address={activity?.address} />
												<span className={styles.bounty_User_Activity_Carousel_Content}>{t('claimed')}</span>
												<span className={styles.bounty_User_Activity_Carousel_Token_Amount}>{formatTokenValue(activity?.amount, network, tokenPrice as string, unit)}</span>
												<span className={styles.bounty_User_Activity_Carousel_Content}>{t('bounty')}</span>
												<span className={styles.bounty_User_Activity_Carousel_Span} />
												<span className={styles.bounty_User_Activity_Carousel_Date}>{dayjs(activity?.created_at).format("DD[th] MMM 'YY")}</span>
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
