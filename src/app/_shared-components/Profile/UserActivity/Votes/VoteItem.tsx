// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useTranslations } from 'next-intl';
import { useUser } from '@/hooks/useUser';
import { useMemo } from 'react';
import { ENetwork, ENetworkSocial, EProposalStatus, EVoteDecision, IProfileVote } from '@/_shared/types';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getPostTypeUrl } from '@/app/_client-utils/getPostDetailsUrl';
import { CLOSED_PROPOSAL_STATUSES } from '@/_shared/_constants/closedProposalStatuses';
import Link from 'next/link';
import { ThumbsUp, ThumbsDown, Ban, Trash2 } from 'lucide-react';
import Image from 'next/image';
import SubscanIcon from '@assets/profile/subscan-link.svg';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { cn } from '@/lib/utils';
import StatusTag from '../../../StatusTag/StatusTag';
import { Button } from '../../../Button';
import { TableCell, TableRow } from '../../../Table';
import classes from './Votes.module.scss';
import Address from '../../Address/Address';

interface VoteItemProps {
	vote: IProfileVote;
	network: ENetwork;
	userId?: number;
	onRemoveVote: () => void;
	isLoading: boolean;
}

interface VoteBalance {
	aye?: string;
	nay?: string;
	abstain?: string;
}

// Utility Functions
const getVoteBalance = (vote: IProfileVote): VoteBalance => {
	switch (vote.decision) {
		case EVoteDecision.ABSTAIN:
			return {
				aye: vote.balance?.aye,
				nay: vote.balance?.nay,
				abstain: vote.balance?.abstain
			};
		case EVoteDecision.AYE:
			return { aye: vote.balance?.aye || vote.balance?.value };
		default:
			return { nay: vote.balance?.nay || vote.balance?.value };
	}
};

function VoteItem({ vote, network, userId, onRemoveVote, isLoading }: VoteItemProps) {
	const { user } = useUser();

	const t = useTranslations();

	// Memoize expensive calculations
	const voteBalance = useMemo(() => getVoteBalance(vote), [vote]);

	const subScanLink = useMemo(() => NETWORKS_DETAILS[`${network}`]?.socialLinks?.find((link) => link.id === ENetworkSocial.SUBSCAN)?.href, [network]);

	const redirectUrl = useMemo(
		() => getPostTypeUrl({ proposalType: vote.proposalType, indexOrHash: vote.proposalIndex, network }),
		[vote.proposalType, vote.proposalIndex, network]
	);

	// Memoize conditional rendering checks
	const canRemoveVote = useMemo(
		() => user && user.id === userId && !CLOSED_PROPOSAL_STATUSES.includes(vote.postDetails?.onChainInfo?.status as EProposalStatus),
		[user, userId, vote.postDetails?.onChainInfo?.status]
	);

	return (
		<TableRow key={vote.proposalIndex}>
			{/* Proposal Column */}
			<TableCell className='max-w-[300px] truncate py-4 text-sm'>
				<Link
					href={redirectUrl}
					className='hover:underline'
					target='_blank'
					rel='noopener noreferrer'
				>
					#{vote.proposalIndex} {vote.postDetails?.title}
				</Link>
			</TableCell>

			{/* Vote For Column */}
			<TableCell className='min-w-0 py-4'>
				<div className={cn('flex items-center text-xs', voteBalance.abstain ? 'gap-x-4' : 'gap-x-2')}>
					<div className='flex flex-col gap-y-3'>
						{voteBalance.aye && (
							<div className='flex items-center gap-2'>
								<span className={cn(classes.voteItemBalanceItemValue, voteBalance.abstain ? 'w-16' : '')}>
									<ThumbsUp
										className='h-4 w-4 fill-basic_text'
										aria-hidden='true'
									/>
									{t('PostDetails.aye')}
								</span>
								<span className='truncate font-medium'>{formatBnBalance(voteBalance.aye, { withUnit: true, numberAfterComma: 1, compactNotation: true }, network)}</span>
							</div>
						)}
						{voteBalance.nay && (
							<div className='flex items-center gap-2'>
								<span className={cn(classes.voteItemBalanceItemValue, voteBalance.abstain ? 'w-16' : '')}>
									<ThumbsDown
										className='h-4 w-4 fill-basic_text'
										aria-hidden='true'
									/>
									{t('PostDetails.nay')}
								</span>
								<span className='truncate font-medium'>{formatBnBalance(voteBalance.nay, { withUnit: true, numberAfterComma: 1, compactNotation: true }, network)}</span>
							</div>
						)}
						{voteBalance.abstain && (
							<div className='flex items-center gap-2'>
								<span className={cn(classes.voteItemBalanceItemValue, voteBalance.abstain ? 'w-16' : '')}>
									<Ban
										className='h-4 w-4'
										aria-hidden='true'
									/>
									{t('PostDetails.abstain')}
								</span>
								<span className='truncate font-medium'>{formatBnBalance(voteBalance.abstain, { withUnit: true, numberAfterComma: 1, compactNotation: true }, network)}</span>
							</div>
						)}
					</div>
					<div className='text-text_secondary text-xs'>{`${vote.lockPeriod || '0.1'}x${vote.isDelegated ? '/d' : ''}${vote.decision === EVoteDecision.ABSTAIN ? '/sa' : ''} `}</div>
				</div>
			</TableCell>

			{/* Status Column */}
			<TableCell className='py-4'>
				<div className='flex items-center justify-center'>
					<StatusTag status={vote.postDetails?.onChainInfo?.status} />
				</div>
			</TableCell>

			{/* Voter Column */}
			<TableCell className='py-4 text-center'>
				<div className='flex items-center justify-center'>
					<Address
						address={vote.voterAddress}
						redirectToProfile={false}
						truncateCharLen={5}
						disableTooltip
					/>
				</div>
			</TableCell>

			{/* Action Column */}
			<TableCell className='py-4 text-right'>
				<div className='flex items-center justify-end gap-1'>
					{subScanLink && (
						<Link
							className='flex h-6 w-6 items-center justify-center rounded-full hover:bg-gray-100'
							target='_blank'
							rel='noopener noreferrer'
							href={`${subScanLink}/extrinsic/${vote.extrinsicIndex}`}
							aria-label='View on Subscan'
							onClick={(e) => e.stopPropagation()}
						>
							<Image
								src={SubscanIcon}
								alt='View on Subscan'
								width={16}
								height={16}
							/>
						</Link>
					)}
					{canRemoveVote && (
						<Button
							variant='ghost'
							size='icon'
							className='h-6 w-6 rounded-full p-0'
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								onRemoveVote();
							}}
							disabled={isLoading}
							aria-label='Remove vote'
						>
							<Trash2
								className='h-4 w-4 text-text_primary'
								aria-hidden='true'
							/>
						</Button>
					)}
				</div>
			</TableCell>
		</TableRow>
	);
}

export default VoteItem;
