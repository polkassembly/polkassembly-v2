// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useState } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import { Clock, LinkIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { BN, BN_ZERO } from '@polkadot/util';
import { EProposalStatus, IPostListing } from '@/_shared/types';
import StatusTag from '@/app/_shared-components/StatusTag/StatusTag';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { MdMenu } from '@react-icons/all-files/md/MdMenu';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import ChildBountiesDialog from './ChildBountiesDialog';

interface Props {
	item: IPostListing;
	className?: string;
}

function BountyCard({ item, className }: Props) {
	const network = getCurrentNetwork();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const { title, index, onChainInfo } = item;
	const status = onChainInfo?.status;
	const reward = onChainInfo?.reward;
	const curator = onChainInfo?.curator;
	const createdAt = onChainInfo?.createdAt;
	const childBountiesCount = onChainInfo?.childBountiesCount || 0;

	const { data: childBounties, isLoading: loadingChildren } = useQuery({
		queryKey: ['childBounties', index],
		queryFn: async () => {
			const { data, error } = await NextApiClientService.fetchChildBountiesApi({
				bountyIndex: index?.toString() || '',
				page: '1',
				limit: DEFAULT_LISTING_LIMIT.toString()
			});
			if (error) throw error;
			return data;
		},
		enabled: childBountiesCount > 0 && !!index
	});

	const claimedBounties = childBounties?.items.filter((cb) => cb.onChainInfo?.status === EProposalStatus.Claimed) || [];
	const claimedAmount = claimedBounties.reduce((sum, cb) => sum.add(new BN(cb.onChainInfo?.reward || '0')), BN_ZERO);

	const totalReward = new BN(reward || '0');
	const progressPercentage = totalReward.gt(BN_ZERO) && claimedAmount.gt(BN_ZERO) ? Math.min(Math.round((claimedAmount.toNumber() / totalReward.toNumber()) * 100), 100) : 0;

	const formattedReward = reward ? formatBnBalance(reward.toString(), { withThousandDelimitor: false, withUnit: true, numberAfterComma: 0, compactNotation: true }, network) : '0';
	const formattedClaimedAmount = claimedAmount.gt(BN_ZERO)
		? formatBnBalance(claimedAmount.toString(), { withThousandDelimitor: false, withUnit: true, numberAfterComma: 0, compactNotation: true }, network)
		: '0';

	return (
		<div className={`flex flex-col justify-between rounded-xl border border-border_grey bg-bg_modal p-5 ${className}`}>
			<div className='flex flex-col gap-3'>
				<div className='flex items-center justify-between border-b border-border_grey pb-3'>
					<div className='flex items-center gap-2'>
						<span className='rounded-sm bg-poll_option_bg px-1 py-0.5 text-xs font-medium text-wallet_btn_text'>#{index}</span>
						<StatusTag
							status={status}
							className='rounded-sm px-1 py-0.5 text-xs'
						/>
					</div>
					<Link
						href={`/bounty/${index}`}
						className='rounded-md border border-text_pink p-0.5 text-text_pink'
					>
						<LinkIcon
							size={12}
							className='rotate-90'
						/>
					</Link>
				</div>

				<div className='flex flex-col gap-2'>
					<h3 className='line-clamp-2 text-sm font-medium'>{title || 'Untitled Bounty'}</h3>

					<div className='flex items-center gap-2'>
						<span className='text-lg font-semibold text-text_primary'>{formattedReward}</span>
					</div>

					{childBountiesCount > 0 && (
						<div className='space-y-1'>
							{loadingChildren ? (
								<>
									<div className='h-3 w-full animate-pulse rounded bg-border_grey' />
									<div className='h-1.5 w-full animate-pulse rounded-full bg-border_grey' />
								</>
							) : (
								<>
									<div className='flex justify-between text-[10px] font-medium text-wallet_btn_text'>
										<span>Funds Spent: {formattedClaimedAmount}</span>
										<span>{progressPercentage}%</span>
									</div>
									<div className='h-1.5 w-full rounded-full bg-klara_ai_msg_bg'>
										<div
											className='h-1.5 rounded-full bg-delegation_nova_border transition-all'
											style={{ width: `${progressPercentage}%` }}
										/>
									</div>
								</>
							)}
						</div>
					)}
				</div>

				<div className='grid grid-cols-1 gap-y-2 border-t border-border_grey pt-2 text-xs'>
					<div className='flex items-center justify-between'>
						<span className='text-xs font-semibold text-wallet_btn_text'>Curator</span>
						<div className='max-w-[120px]'>
							{curator ? (
								<Address
									address={curator}
									className='text-sm'
								/>
							) : (
								<span className='text-sm text-text_primary'>-</span>
							)}
						</div>
					</div>
					<div className='flex items-center justify-between'>
						<span className='text-xs font-semibold text-wallet_btn_text'>Date</span>
						<div className='flex items-center gap-1 text-sm text-text_primary'>
							<Clock className='h-4 w-4' />
							<span>{dayjs(createdAt).format("DD MMM 'YY")}</span>
						</div>
					</div>
				</div>
			</div>
			<div className='mt-4 flex items-center justify-between gap-3'>
				<span className='flex-1 rounded-md bg-poll_option_bg px-2 py-1 text-xs font-semibold text-text_primary'>Child Bounties: {childBountiesCount}</span>
				{childBountiesCount > 0 && (
					<button
						type='button'
						onClick={(e) => {
							e.stopPropagation();
							setIsDialogOpen(true);
						}}
						className='cursor-pointer rounded-md border border-border_grey p-1 transition-colors hover:bg-bg_modal'
					>
						<MdMenu className='h-4 w-4 text-wallet_btn_text' />
					</button>
				)}
			</div>

			{/* Child Bounties Dialog */}
			<ChildBountiesDialog
				isOpen={isDialogOpen}
				onClose={() => setIsDialogOpen(false)}
				bountyIndex={index || 0}
				bountyTitle={title || 'Untitled Bounty'}
				bountyReward={reward}
				bountyStatus={status}
				bountyCurator={curator}
				bountyCreatedAt={createdAt}
				childBountiesCount={childBountiesCount}
			/>
		</div>
	);
}

export default BountyCard;
