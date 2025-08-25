// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Image from 'next/image';
import TipIcon from '@assets/tipping/tips.svg';
import { Tabs, TabsContent } from '@/app/_shared-components/Tabs';
import { Button } from '@/app/_shared-components/Button';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { ETipsTab, ITip, ENetwork, IPublicUser } from '@/_shared/types';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { Separator } from '@/app/_shared-components/Separator';
import noData from '@/_assets/activityfeed/gifs/noactivity.gif';
import { useUser } from '@/hooks/useUser';
import { CircleDollarSignIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTipModal } from '@/hooks/useTipModal';
import Address from '../../Address/Address';
import classes from './Tips.module.scss';

function Tip({ tip, network, activeTab }: { tip: ITip; network: ENetwork; activeTab: ETipsTab }) {
	return (
		<div className='flex items-center justify-between gap-2'>
			<div className='flex w-full items-center justify-start gap-1'>
				<Address
					address={activeTab === ETipsTab.Received ? tip.userAddress : tip.beneficiaryAddress}
					className='text-xs font-normal'
					truncateCharLen={4}
				/>
			</div>
			<div className='w-full text-wrap text-xs'>{tip.remark}</div>
			<div className='flex w-2/5 justify-end text-xs font-medium text-text_pink'>
				{formatBnBalance(tip.amount, { withUnit: true, numberAfterComma: 2, compactNotation: true }, network)}
			</div>
		</div>
	);
}
// Todo : Tip separator by user and beneficiary
function Tips({ userProfile }: { userProfile?: IPublicUser }) {
	const t = useTranslations('Profile.Tips');
	const router = useRouter();
	const { setBeneficiaryAddress, setOpenTipModal } = useTipModal();
	const { user } = useUser();
	const network = getCurrentNetwork();
	const [activeTab, setActiveTab] = useState<ETipsTab>(ETipsTab.Received);

	const getUserTips = async () => {
		if (!userProfile?.id) return [];
		const { data, error } = await NextApiClientService.getUserTips({ userId: userProfile?.id, tab: activeTab });
		if (error) {
			throw new Error(error.message);
		}
		return data?.tips || [];
	};

	const { data, isLoading } = useQuery({
		queryKey: ['userTips', userProfile?.id, activeTab],
		queryFn: getUserTips,
		enabled: !!userProfile?.id
	});
	return (
		<div>
			<div className={classes.header}>
				<div className={classes.headerTitle}>
					<Image
						src={TipIcon}
						alt='tips'
						width={24}
						height={24}
					/>
					Tips
				</div>
				<div>
					<div className={classes.tabs}>
						{[ETipsTab.Received, ETipsTab.Given].map((tab) => (
							<Button
								key={tab}
								variant='ghost'
								size='sm'
								onClick={() => setActiveTab(tab)}
								className={cn(classes.tab, 'h-7', activeTab === tab ? classes.activeTab : classes.inactiveTab)}
							>
								{t(tab)}
							</Button>
						))}
					</div>
				</div>
			</div>
			{isLoading ? (
				<div className='flex h-full flex-col items-center justify-center gap-1'>
					{new Array(3).fill(0).map(() => (
						<Skeleton className='h-12 w-full' />
					))}
				</div>
			) : data && data?.length > 0 ? (
				<Tabs
					value={activeTab}
					defaultValue={activeTab}
				>
					<TabsContent value={ETipsTab.Received}>
						{data?.map((tip, index) => (
							<>
								<Tip
									key={tip.id}
									tip={tip}
									network={network}
									activeTab={activeTab}
								/>
								{index !== data.length - 1 && (
									<Separator
										orientation='horizontal'
										className='h-4'
									/>
								)}
							</>
						))}
					</TabsContent>
					<TabsContent
						value={ETipsTab.Given}
						className='mt-4'
					>
						{data?.map((tip, index) => (
							<>
								<Tip
									key={tip.id}
									tip={tip}
									network={network}
									activeTab={activeTab}
								/>
								{index !== data.length - 1 && (
									<Separator
										orientation='horizontal'
										className='my-3'
									/>
								)}
							</>
						))}
					</TabsContent>
				</Tabs>
			) : (
				<div className={classes.noData}>
					<Image
						src={noData}
						alt='no data'
						width={140}
						height={140}
					/>
					<p className='text-sm'>{t('noData')}</p>
				</div>
			)}

			{user?.id !== userProfile?.id && userProfile && userProfile?.addresses?.length > 0 && (
				<Button
					className='border-text-bg_pink mt-6 w-full rounded-3xl text-sm font-semibold text-text_pink'
					leftIcon={<CircleDollarSignIcon />}
					variant='outline'
					onClick={(e) => {
						e.stopPropagation();
						e.preventDefault();
						if (!user?.id) {
							router.push('/login');
						} else {
							setBeneficiaryAddress(userProfile?.addresses[0]);
							setOpenTipModal(true);
						}
					}}
				>
					{t('tipUser')}
				</Button>
			)}
		</div>
	);
}

export default Tips;
