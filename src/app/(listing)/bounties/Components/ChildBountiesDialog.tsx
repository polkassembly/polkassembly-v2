// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { Users, Clock } from 'lucide-react';
import dayjs from 'dayjs';
import { BN, BN_ZERO } from '@polkadot/util';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/_shared-components/Dialog/Dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/_shared-components/Table';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import StatusTag from '@/app/_shared-components/StatusTag/StatusTag';
import LoadingLayover from '@/app/_shared-components/LoadingLayover';
import NoActivity from '@/_assets/activityfeed/gifs/noactivity.gif';
import { IPostListing, EProposalStatus } from '@/_shared/types';
import { DEFAULT_LISTING_LIMIT, MAX_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { PaginationWithLinks } from '@/app/_shared-components/PaginationWithLinks';

interface ChildBountiesDialogProps {
	isOpen: boolean;
	onClose: () => void;
	bountyIndex: number;
	bountyTitle: string;
	bountyReward?: string;
	bountyStatus?: EProposalStatus;
	bountyCurator?: string;
	bountyCreatedAt?: Date;
	childBountiesCount?: number;
}

function ChildBountiesDialog({
	isOpen,
	onClose,
	bountyIndex,
	bountyTitle,
	bountyReward,
	bountyStatus,
	bountyCurator,
	bountyCreatedAt,
	childBountiesCount
}: ChildBountiesDialogProps) {
	const network = getCurrentNetwork();
	const [currentPage, setCurrentPage] = useState(1);
	const t = useTranslations();

	const { data: childBounties, isLoading } = useQuery({
		queryKey: ['childBounties', bountyIndex, currentPage],
		queryFn: async () => {
			const { data, error } = await NextApiClientService.fetchChildBountiesApi({
				bountyIndex: bountyIndex.toString(),
				page: currentPage.toString(),
				limit: DEFAULT_LISTING_LIMIT.toString()
			});
			if (error) throw error;
			return data;
		},
		enabled: isOpen && !!bountyIndex
	});

	const { data: allChildBounties } = useQuery({
		queryKey: ['allChildBounties', bountyIndex],
		queryFn: async () => {
			const { data, error } = await NextApiClientService.fetchChildBountiesApi({
				bountyIndex: bountyIndex.toString(),
				page: '1',
				limit: MAX_LISTING_LIMIT.toString()
			});
			if (error) throw error;
			return data;
		},
		enabled: isOpen && !!bountyIndex
	});

	const claimedBounties = allChildBounties?.items.filter((cb) => cb.onChainInfo?.status === 'Claimed') || [];
	const claimedAmount = claimedBounties.reduce((sum, cb) => sum.add(new BN(cb.onChainInfo?.reward || '0')), BN_ZERO);
	const totalReward = new BN(bountyReward || '0');
	const progressPercentage = totalReward.gt(BN_ZERO) && claimedAmount.gt(BN_ZERO) ? Math.min(claimedAmount.muln(100).div(totalReward).toNumber(), 100) : 0;

	const formattedReward = bountyReward
		? formatBnBalance(bountyReward.toString(), { withThousandDelimitor: false, withUnit: true, numberAfterComma: 0, compactNotation: true }, network)
		: '0';
	const formattedClaimedAmount = claimedAmount.gt(BN_ZERO)
		? formatBnBalance(claimedAmount.toString(), { withThousandDelimitor: false, withUnit: true, numberAfterComma: 0, compactNotation: true }, network)
		: '0';

	return (
		<Dialog
			open={isOpen}
			onOpenChange={onClose}
		>
			<DialogContent className='max-h-[750px] max-w-2xl overflow-y-auto p-4'>
				<DialogHeader className='border-b border-border_grey pb-4'>
					<DialogTitle className='flex items-center gap-2 text-lg font-semibold text-text_primary'>
						<Users className='h-5 w-5' />
						{t('Bounties.childBounties')}
					</DialogTitle>
				</DialogHeader>

				<div className='rounded-xl border border-border_grey bg-bg_modal p-5'>
					<div className='flex flex-col gap-3'>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-2'>
								<span className='rounded-sm bg-poll_option_bg px-1 py-0.5 text-xs font-medium text-wallet_btn_text'>#{bountyIndex}</span>
								{bountyStatus && (
									<StatusTag
										status={bountyStatus}
										className='rounded-sm px-1 py-0.5 text-xs'
									/>
								)}
							</div>
							<div className='flex items-center gap-2'>
								<span className='text-lg font-semibold text-text_primary'>{formattedReward}</span>
							</div>
						</div>

						<div className='flex flex-col gap-2'>
							<h3 className='line-clamp-2 text-sm font-medium'>{bountyTitle || t('Bounties.untitledBounty')}</h3>

							{childBountiesCount && childBountiesCount > 0 && (
								<div className='space-y-1'>
									<div className='flex justify-between text-[10px] font-medium text-wallet_btn_text'>
										<span>
											{t('Bounties.fundsSpent')}: {formattedClaimedAmount}
										</span>
										<span>{progressPercentage}%</span>
									</div>
									<div className='h-1.5 w-full rounded-full bg-klara_ai_msg_bg'>
										<div
											className='h-1.5 rounded-full bg-delegation_nova_border transition-all'
											style={{ width: `${progressPercentage}%` }}
										/>
									</div>
								</div>
							)}
						</div>

						<div className='grid grid-cols-1 gap-y-2 border-t border-border_grey pt-2 text-xs'>
							<div className='flex items-center justify-between'>
								<span className='text-xs font-semibold text-wallet_btn_text'>{t('Bounties.curator')}</span>
								<div className='max-w-[120px]'>
									{bountyCurator ? (
										<Address
											address={bountyCurator}
											className='text-sm'
										/>
									) : (
										<span className='text-sm text-text_primary'>-</span>
									)}
								</div>
							</div>
							<div className='flex items-center justify-between'>
								<span className='text-xs font-semibold text-wallet_btn_text'>{t('Bounties.date')}</span>
								<div className='flex items-center gap-1 text-sm text-text_primary'>
									<Clock className='h-4 w-4' />
									<span>{dayjs(bountyCreatedAt).format("DD MMM 'YY")}</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className='relative flex max-h-[300px] w-full flex-col overflow-x-auto md:max-h-[400px]'>
					{isLoading && <LoadingLayover />}

					{!isLoading && (!childBounties?.items || childBounties.items.length === 0) ? (
						<div className='flex flex-col items-center justify-center gap-y-4 py-12 text-base text-text_primary'>
							<Image
								src={NoActivity}
								alt='No Child Bounties'
								width={120}
								height={120}
							/>
							<p className='text-text_secondary'>{t('Bounties.noChildBounties')}</p>
						</div>
					) : (
						<>
							<div className='mb-3 text-sm font-bold text-text_primary'>
								{t('Bounties.childBounties')}: {childBounties?.totalCount || 0}
							</div>
							<Table className='mb-3 w-full'>
								<TableHeader className='bg-page_background'>
									<TableRow>
										<TableHead className='text-xs font-semibold text-text_primary'>{t('Bounties.tableTitle')}</TableHead>
										<TableHead className='text-xs font-semibold text-text_primary'>{t('Bounties.tableAmount')}</TableHead>
										<TableHead className='text-xs font-semibold text-text_primary'>{t('Bounties.tableStatus')}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{childBounties?.items.map((childBounty: IPostListing) => {
										const childIndex = childBounty.onChainInfo?.index ?? childBounty.index ?? 0;
										const reward = childBounty.onChainInfo?.reward;
										const status = childBounty.onChainInfo?.status;
										const title = childBounty.title || t('Bounties.untitled');

										return (
											<TableRow
												key={childIndex}
												className='cursor-pointer hover:bg-bg_modal'
												onClick={() => {
													const parentBountyIndex = childBounty.onChainInfo?.parentBountyIndex;
													const compositeIndex = parentBountyIndex !== undefined ? `${parentBountyIndex}_${childIndex}` : childIndex;
													window.open(`/child-bounty/${compositeIndex}`, '_blank');
												}}
											>
												<TableCell className='max-w-[350px] py-4'>
													<div className='flex items-center gap-2'>
														<span className='text-sm font-semibold text-text_primary'>#{childIndex}</span>
														<span className='truncate text-sm font-semibold text-text_primary'>{title}</span>
													</div>
												</TableCell>
												<TableCell className='py-4'>
													<span className='text-sm font-semibold text-text_primary'>
														{reward
															? formatBnBalance(reward.toString(), { withThousandDelimitor: false, withUnit: true, numberAfterComma: 2, compactNotation: true }, network)
															: '-'}
													</span>
												</TableCell>
												<TableCell className='py-4'>
													<span>
														{status ? (
															<StatusTag
																status={status}
																className='px-2 py-1 text-center text-xs'
															/>
														) : (
															<span className='text-center text-sm text-wallet_btn_text'>-</span>
														)}
													</span>
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>

							<PaginationWithLinks
								totalCount={childBounties?.totalCount || 0}
								pageSize={DEFAULT_LISTING_LIMIT}
								page={currentPage}
								onPageChange={(page) => setCurrentPage(page)}
							/>
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default ChildBountiesDialog;
