// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import BountyPoster from '@assets/bounties/bounty-poster.svg';
import { spaceGroteskFont } from '@/app/_style/fonts';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { formatTokenValue } from '@/app/_client-utils/tokenValueFormatter';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from '@/app/_shared-components/Carousel';
import { useTranslations } from 'next-intl';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useQuery } from '@tanstack/react-query';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import LoadingLayover from '@/app/_shared-components/LoadingLayover';
import styles from './Bounty.module.scss';

function BountiesUserActivity({ tokenPrice }: { tokenPrice: number }) {
	const network = getCurrentNetwork();
	const unit = NETWORKS_DETAILS[`${network}`].tokenSymbol;
	const [api, setApi] = useState<CarouselApi>();
	const t = useTranslations('Bounty');

	const fetchUserActivities = async () => {
		const { data, error } = await NextApiClientService.fetchBountiesUserActivity();

		if (error || !data) {
			console.error(error);
			return [];
		}

		return data;
	};

	const { data: userActivities, isFetching } = useQuery({
		queryKey: ['bounties-user-activities'],
		queryFn: fetchUserActivities,
		staleTime: FIVE_MIN_IN_MILLI,
		retry: false,
		refetchOnMount: false,
		refetchOnWindowFocus: false
	});

	useEffect(() => {
		if (!api) {
			return () => {};
		}

		const interval = setInterval(() => {
			if (api.canScrollNext()) {
				api.scrollNext();
			} else {
				api.scrollTo(0);
			}
		}, 3000);

		return () => clearInterval(interval);
	}, [api]);

	return (
		<div className='mt-10'>
			<div className='grid grid-cols-1 gap-12 lg:grid-cols-2'>
				<div className='relative col-span-1 -mt-0'>
					<Image
						src={BountyPoster}
						alt='curator'
						className='w-full'
					/>
					<div
						className={`${spaceGroteskFont.className} ${styles.bounty_User_Activity_Container_Skeleton_Wrapper}`}
						style={{
							background: 'linear-gradient(266deg, #301DA7 15.23%, #57F 75.34%)'
						}}
					>
						<div className={styles.coming_soon_text}>{t('comingSoon')}</div>
					</div>
				</div>

				<div className='col-span-1'>
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
							<CarouselContent className='relative min-h-48'>
								{isFetching && <LoadingLayover />}
								{userActivities &&
									userActivities.map((activity) => (
										<CarouselItem
											key={`${activity.address}-${activity.amount}-${activity.created_at.toString()}`}
											className='!h-[50px] !pt-0'
											style={{
												marginTop: '0',
												padding: '0'
											}}
										>
											<div className={styles.bounty_User_Activity_Carousel}>
												<Address address={activity?.address} />
												<span className={styles.bounty_User_Activity_Carousel_Content}>{t('claimed')}</span>
												<span className={styles.bounty_User_Activity_Carousel_Token_Amount}>{formatTokenValue(activity?.amount, network, tokenPrice, unit)}</span>
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
