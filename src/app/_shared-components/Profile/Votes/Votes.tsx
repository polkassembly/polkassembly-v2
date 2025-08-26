// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import noData from '@assets/activityfeed/gifs/noactivity.gif';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { ENetwork, ENetworkSocial, EProposalStatus, EVoteDecision, IGenericListingResponse, IProfileVote } from '@/_shared/types';
import { Ban, ThumbsDown, ThumbsUp, Trash2, ChevronDown } from 'lucide-react';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import SubscanIcon from '@assets/profile/subscan-link.svg';
import { useUser } from '@/hooks/useUser';
import { CLOSED_PROPOSAL_STATUSES } from '@/_shared/_constants/closedProposalStatuses';
import Link from 'next/link';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { cn } from '@/lib/utils';
import { getPostTypeUrl } from '@/app/_client-utils/getPostDetailsUrl';
import classes from './Votes.module.scss';
import { Separator } from '../../Separator';
import { Skeleton } from '../../Skeleton';
import { Button } from '../../Button';
import StatusTag from '../../StatusTag/StatusTag';
import { PaginationWithLinks } from '../../PaginationWithLinks';
import { Checkbox } from '../../Checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '../../Popover/Popover';
import Address from '../Address/Address';
import RemoveVoteDialog from '../../RemoveVoteDialog/RemoveVoteDialog';

const DEFAULT_VOTES_SHOW_COUNT = 3;

const getVoteFor = (vote: IProfileVote) => {
	switch (vote.decision) {
		case EVoteDecision.ABSTAIN:
			return { aye: vote.balance?.aye, nay: vote.balance?.nay, abstain: vote.balance?.abstain };
		case EVoteDecision.AYE:
			return { aye: vote.balance?.aye || vote.balance?.value };
		default:
			return { nay: vote.balance?.nay || vote.balance?.value };
	}
};

function VoteItem({
	vote,
	network,
	userId,
	handleRemoveVote,
	loading
}: {
	vote: IProfileVote;
	network: ENetwork;
	userId?: number;
	handleRemoveVote: () => void;
	loading: boolean;
}) {
	const voteFor = getVoteFor(vote);
	const { user } = useUser();
	const t = useTranslations();
	const subScanLink = NETWORKS_DETAILS[`${network}`].socialLinks?.find((link) => link.id === ENetworkSocial.SUBSCAN)?.href;
	const redirectUrl = getPostTypeUrl({ proposalType: vote?.proposalType, indexOrHash: vote.proposalIndex, network });

	return (
		<div className={classes.voteItem}>
			<Link
				href={redirectUrl}
				className={cn(classes.voteItemTitle, 'hover:underline')}
				target='_blank'
				rel='noopener noreferrer'
			>
				#{vote.proposalIndex} {vote.postDetails?.title}
			</Link>

			<div className={classes.voteItemBalance}>
				<div className={classes.voteItemBalanceContent}>
					{voteFor.aye && (
						<div className={classes.voteItemBalanceItem}>
							<span className={classes.voteItemBalanceItemTitle}>
								<ThumbsUp className='h-4 w-4' />
								{t('PostDetails.aye')}
							</span>
							<span>{formatBnBalance(voteFor.aye, { withUnit: true, numberAfterComma: 1, compactNotation: true }, network)}</span>
						</div>
					)}
					{voteFor.nay && (
						<div className={classes.voteItemBalanceItem}>
							<span className={classes.voteItemBalanceItemTitle}>
								<ThumbsDown className='h-4 w-4' />
								{t('PostDetails.nay')}
							</span>
							<span>{formatBnBalance(voteFor.nay, { withUnit: true, numberAfterComma: 1, compactNotation: true }, network)}</span>
						</div>
					)}
					{voteFor.abstain && (
						<div className={classes.voteItemBalanceItem}>
							<span className={classes.voteItemBalanceItemTitle}>
								<Ban className='h-4 w-4' />
								{t('PostDetails.abstain')}
							</span>
							<span>{formatBnBalance(voteFor.abstain, { withUnit: true, numberAfterComma: 1, compactNotation: true }, network)}</span>
						</div>
					)}
				</div>
				<div className='flex items-center justify-center'>{`${vote.lockPeriod || '0.1'}x${vote.isDelegated ? '/d' : ''}${vote.decision === EVoteDecision.ABSTAIN ? '/sa' : ''} `}</div>
			</div>
			<div className='col-span-1 flex justify-center'>
				<StatusTag status={vote.postDetails?.onChainInfo?.status} />
			</div>
			<div className='col-span-1 flex justify-center'>
				<Address
					address={vote.voterAddress}
					iconSize={20}
					redirectToProfile={false}
					disableTooltip
				/>
			</div>
			<div className='col-span-1 flex items-center justify-end gap-2 text-end'>
				<Link
					className='flex h-6 w-6 items-center rounded-full px-1 py-0'
					target='_blank'
					rel='noopener noreferrer'
					href={`${subScanLink}/extrinsic/${vote.extrinsicIndex}`}
				>
					<Image
						src={SubscanIcon}
						alt='subscan'
						width={24}
						height={24}
					/>
				</Link>
				{user?.id === userId && !CLOSED_PROPOSAL_STATUSES.includes(vote.postDetails?.onChainInfo?.status as EProposalStatus) && (
					<Button
						variant='ghost'
						size='icon'
						className='h-6 w-6 rounded-full px-1 py-0'
						onClick={handleRemoveVote}
						disabled={loading}
					>
						<Trash2 className='text-text_primary' />
					</Button>
				)}
			</div>
		</div>
	);
}

function SelectAddresses({
	addresses,
	selectedAddresses,
	setSelectedAddresses,
	disabled
}: {
	addresses: string[];
	selectedAddresses: string[];
	setSelectedAddresses: (addresses: string[]) => void;
	disabled?: boolean;
}) {
	const t = useTranslations('Profile');

	if (addresses.length === 1) {
		return null;
	}

	return (
		<div className='flex flex-col gap-2'>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant='outline'
						className='flex w-fit items-center justify-between gap-2 px-4 py-2'
						disabled={disabled}
					>
						<span className='text-sm font-medium'>{selectedAddresses.length > 0 ? `${t('Votes.selectAddresses')} (${selectedAddresses.length})` : t('Votes.selectAddresses')}</span>
						<ChevronDown className='h-4 w-4' />
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className='px-6 py-4'
					align='start'
				>
					<div className='flex flex-col gap-4'>
						{addresses.map((address) => (
							<div
								key={address}
								className='flex items-center space-x-2'
							>
								<Checkbox
									id={`address-${address}`}
									checked={selectedAddresses.includes(address)}
									onCheckedChange={(checked) => {
										if (checked) {
											setSelectedAddresses([...selectedAddresses, address]);
										} else {
											setSelectedAddresses(selectedAddresses.filter((addr) => addr !== address));
										}
									}}
								/>
								<div className={classes.address}>
									<Address
										address={address}
										iconSize={20}
										redirectToProfile={false}
										disableTooltip
									/>
								</div>
							</div>
						))}
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
}

function Votes({ addresses, userId }: { addresses: string[]; userId?: number }) {
	const t = useTranslations('Profile');
	const network = getCurrentNetwork();
	const [loading, setLoading] = useState(false);
	const [votes, setVotes] = useState<IGenericListingResponse<IProfileVote>>();
	const [page, setPage] = useState(1);
	const [showMore, setShowMore] = useState(false);
	const [selectedAddresses, setSelectedAddresses] = useState<string[]>(addresses);
	const [openRemoveVoteDialog, setOpenRemoveVoteDialog] = useState(false);
	const [proposalIndex, setProposalIndex] = useState<number | null>(null);

	const getVotes = async () => {
		if (!selectedAddresses.length) {
			setVotes({ items: [], totalCount: 0 });
			return;
		}
		const { data, error } = await NextApiClientService.getVotesByAddresses({ addresses: selectedAddresses, page, limit: DEFAULT_LISTING_LIMIT });
		if (error) {
			throw new Error(error.message);
		}
		setVotes(data || undefined);
	};

	const { isFetching } = useQuery({
		queryKey: ['votes', selectedAddresses, page],
		queryFn: getVotes,
		enabled: !!selectedAddresses.length,
		refetchOnWindowFocus: false
	});

	return (
		<div className={classes.votesWrapper}>
			<div className={classes.header}>
				<div className='flex items-center gap-2'>
					<h2 className='text-2xl font-bold'>{t('Votes.votes')}</h2>
					{!!votes?.totalCount && !!ValidatorService.isValidNumber(votes?.totalCount) && <p>({votes.totalCount})</p>}
				</div>
				<SelectAddresses
					addresses={addresses}
					selectedAddresses={selectedAddresses}
					setSelectedAddresses={setSelectedAddresses}
					disabled={isFetching || loading}
				/>
			</div>
			<Separator orientation='horizontal' />
			{isFetching ? (
				<div className={classes.votesItemWrapper}>
					<Skeleton className='h-10 w-full' />
					<Separator
						orientation='horizontal'
						className='my-2'
					/>
					{Array.from({ length: showMore ? DEFAULT_LISTING_LIMIT : DEFAULT_VOTES_SHOW_COUNT }).map(() => (
						<Skeleton className='h-16 w-full' />
					))}
				</div>
			) : !votes?.totalCount ? (
				<div className='mt-0 flex w-full flex-col items-center justify-center'>
					<Image
						src={noData}
						alt='no data'
						width={300}
						height={300}
					/>
					<p className='text-text_secondary mb-2 mt-0'>{t('Votes.noData')}</p>
				</div>
			) : (
				<div className={classes.votesItemWrapper}>
					<div className={classes.votesItemHeader}>
						<div className='col-span-4'>{t('Votes.proposal')}</div>
						<div className='col-span-2 text-start'>{t('Votes.voteFor')}</div>
						<div className='col-span-1 text-center'>{t('Votes.status')}</div>
						<div className='col-span-1 text-center'>{t('Votes.voter')}</div>
						<div className='col-span-1 text-end'>{t('Votes.action')}</div>
					</div>
					<Separator
						orientation='horizontal'
						className='my-2 max-md:hidden'
					/>
					{votes?.items.slice(0, showMore ? DEFAULT_LISTING_LIMIT : DEFAULT_VOTES_SHOW_COUNT).map((vote, index) => (
						<>
							<VoteItem
								key={vote.proposalIndex}
								vote={vote}
								network={network}
								userId={userId}
								handleRemoveVote={() => {
									setOpenRemoveVoteDialog(true);
									setProposalIndex(vote.proposalIndex);
								}}
								loading={loading}
							/>
							{index !== (!showMore ? DEFAULT_LISTING_LIMIT : votes.items.length) - 1 && (
								<Separator
									orientation='horizontal'
									className='my-1'
								/>
							)}
						</>
					))}

					<div className='flex w-full justify-start'>
						{votes && !isFetching && votes?.totalCount > DEFAULT_VOTES_SHOW_COUNT && (
							<Button
								variant='ghost'
								className='px-0 py-0 text-xs font-normal text-text_pink'
								onClick={() => setShowMore(!showMore)}
							>
								{showMore ? t('Votes.showLess') : t('Votes.showMore')}
							</Button>
						)}
					</div>
					{showMore && votes?.totalCount > DEFAULT_VOTES_SHOW_COUNT && (
						<div className='flex w-full justify-center'>
							<PaginationWithLinks
								page={page}
								pageSize={DEFAULT_LISTING_LIMIT}
								totalCount={votes?.totalCount ?? 0}
								onPageChange={setPage}
							/>
						</div>
					)}
				</div>
			)}
			{proposalIndex && ValidatorService.isValidNumber(proposalIndex) && (
				<RemoveVoteDialog
					open={openRemoveVoteDialog}
					onOpenChange={setOpenRemoveVoteDialog}
					setLoading={setLoading}
					isLoading={loading}
					proposalIndex={proposalIndex}
					onConfirm={() => {
						setVotes((prev) => {
							if (!prev) return prev;
							return {
								...(prev || []),
								items: prev.items.filter((item) => item.proposalIndex !== proposalIndex),
								totalCount: prev.totalCount - 1
							};
						});
						setProposalIndex(null);
					}}
				/>
			)}
		</div>
	);
}

export default Votes;
