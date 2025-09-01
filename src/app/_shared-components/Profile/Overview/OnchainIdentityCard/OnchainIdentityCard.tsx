// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/_shared-components/Dialog/Dialog';
import { useUser } from '@/hooks/useUser';
import { EReactQueryKeys, IPublicUser } from '@/_shared/types';
import { useCallback, useState } from 'react';
import { Button } from '@/app/_shared-components/Button';
import { Plus } from 'lucide-react';
import { useIdentityService } from '@/hooks/useIdentityService';
import { useQuery } from '@tanstack/react-query';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/app/_shared-components/Tooltip';
import { Separator } from '@/app/_shared-components/Separator';
import { Skeleton } from '@/app/_shared-components/Skeleton';
import { cn } from '@/lib/utils';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import classes from './OnchainIdentityCard.module.scss';
import LinkAddress from '../LinkAddress/LinkAddress';
import Address from '../../Address/Address';

function OnchainIdentityCard({ userProfile, setUserProfile, addresses }: { userProfile?: IPublicUser; setUserProfile?: (userProfile: IPublicUser) => void; addresses: string[] }) {
	const t = useTranslations();

	const { user } = useUser();

	const { identityService } = useIdentityService();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [showAll, setShowAll] = useState(false);

	const getIdentityOfAddresses = useCallback(async () => {
		if (!identityService || !addresses.length) return undefined;
		const identities = await Promise.all(
			addresses.map(async (a) => {
				const identity = await identityService.getOnChainIdentity(a);
				if (identity) {
					return { ...identity, address: a };
				}
				return null;
			})
		);
		return identities.filter((i) => i !== null);
	}, [identityService, addresses]);

	const { data: identities, isFetching } = useQuery({
		queryKey: [EReactQueryKeys.PROFILE_IDENTITIES, addresses.join(',')],
		queryFn: getIdentityOfAddresses,
		enabled: !!addresses.length && !!identityService,
		staleTime: FIVE_MIN_IN_MILLI
	});

	const displayedAddresses = showAll ? addresses : addresses.slice(0, 2);

	return (
		<div className={classes.onchainIdentityCard}>
			<div className={classes.onchainIdentityCardHeader}>
				<p className={classes.onchainIdentityCardHeaderTitle}>{t('Profile.onchainIdentity')}</p>
				{user && userProfile?.id === user.id && (
					<Dialog
						open={isModalOpen}
						onOpenChange={setIsModalOpen}
					>
						<DialogTrigger>
							<Button
								variant='secondary'
								leftIcon={<Plus />}
								size='sm'
							>
								{t('Profile.linkAddress')}
							</Button>
						</DialogTrigger>
						<DialogContent className={classes.modal}>
							<DialogHeader>
								<DialogTitle>{t('Profile.linkAddress')}</DialogTitle>
							</DialogHeader>
							<LinkAddress
								onSuccess={(a) => {
									setIsModalOpen(false);
									setUserProfile?.({
										...userProfile,
										addresses: [...userProfile.addresses, a]
									});
								}}
							/>
						</DialogContent>
					</Dialog>
				)}
			</div>
			<div className={classes.onchainIdentityCardContent}>
				<TooltipProvider>
					{displayedAddresses.map((a) => {
						const identity = identities?.find((i) => i && i.address === a);
						const judgementText = identity?.judgements?.[0]?.[1]?.toString() || t('Profile.noJudgements');
						const judgementCount = identity?.judgements?.length || 0;

						return (
							<div
								key={a}
								className={classes.identityRow}
							>
								<div className={classes.identityInfo}>
									<div className='flex max-w-[100px] gap-1 truncate'>
										<Address
											address={a}
											className={classes.addressComponent}
											disableTooltip
											redirectToProfile={false}
											truncateCharLen={4}
										/>
									</div>

									<Separator
										orientation='vertical'
										className='h-4'
									/>
									{isFetching || !identityService ? (
										<Skeleton className='ml-2 h-4 w-16' />
									) : (
										<div className={classes.statusContainer}>
											<div className={classes.judgementText}>
												{!!judgementCount && <span>{t('Profile.judgement')}:</span>}
												<span>{judgementText}</span>
											</div>
											{judgementCount > 1 && (
												<Tooltip>
													<TooltipTrigger asChild>
														<div className={classes.judgementCounter}>+{judgementCount - 1}</div>
													</TooltipTrigger>
													<TooltipContent
														side='top'
														align='center'
														className={cn(classes.tooltipContent, 'bg-tooltip_background text-white')}
													>
														{identity?.judgements?.map((j) => {
															return (
																<div key={j[0].toString()}>
																	<span>{j[1].toString()}</span>
																</div>
															);
														})}
													</TooltipContent>
												</Tooltip>
											)}
										</div>
									)}
								</div>
							</div>
						);
					})}
					{addresses.length > 2 && (
						<div className={classes.showMoreContainer}>
							<Button
								variant='ghost'
								size='sm'
								className={cn(classes.showMoreButton, 'px-0 py-0')}
								onClick={() => setShowAll(!showAll)}
							>
								{showAll ? 'Show less' : 'Show more'}
							</Button>
						</div>
					)}
				</TooltipProvider>
			</div>
		</div>
	);
}

export default OnchainIdentityCard;
