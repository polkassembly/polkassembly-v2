// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo, useCallback, memo } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import noData from '@assets/activityfeed/gifs/noactivity.gif';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { IGenericListingResponse, IProfileVote } from '@/_shared/types';
import { ChevronDown } from 'lucide-react';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { cn } from '@/lib/utils';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { getEncodedAddress } from '@/_shared/_utils/getEncodedAddress';
import { ONE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import classes from './Votes.module.scss';
import { Separator } from '../../../Separator';
import { Skeleton } from '../../../Skeleton';
import { Button } from '../../../Button';
import { PaginationWithLinks } from '../../../PaginationWithLinks';
import { Checkbox } from '../../../Checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '../../../Popover/Popover';
import RemoveVoteDialog from '../../../RemoveVoteDialog/RemoveVoteDialog';
import Address from '../../Address/Address';
import VoteItem from './VoteItem';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../Table';

// Constants
const DEFAULT_VOTES_SHOW_COUNT = 3;

interface SelectAddressesProps {
	addresses: string[];
	selectedAddresses: string[];
	onSelectedAddressesChange: (addresses: string[]) => void;
	disabled?: boolean;
}

interface VotesProps {
	addresses: string[];
	userId?: number;
}

// Select Addresses Component
const SelectAddresses = memo<SelectAddressesProps>(function SelectAddresses({ addresses, selectedAddresses, onSelectedAddressesChange, disabled = false }) {
	const t = useTranslations('Profile');

	// Early return for single address - moved hooks before this
	const buttonText = useMemo(
		() => (selectedAddresses.length > 0 ? `${t('Votes.selectAddresses')} (${selectedAddresses.length})` : t('Votes.selectAddresses')),
		[selectedAddresses.length, t]
	);

	// Optimized checkbox change handler
	const handleCheckboxChange = useCallback(
		(address: string) => (checked: boolean) => {
			if (checked) {
				onSelectedAddressesChange([...selectedAddresses, address]);
			} else {
				onSelectedAddressesChange(selectedAddresses.filter((addr) => addr !== address));
			}
		},
		[selectedAddresses, onSelectedAddressesChange]
	);

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
						aria-label={buttonText}
					>
						<span className='text-sm font-medium'>{buttonText}</span>
						<ChevronDown
							className='h-4 w-4'
							aria-hidden='true'
						/>
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className='px-6 py-4'
					align='start'
					role='dialog'
					aria-label='Select addresses'
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
									onCheckedChange={handleCheckboxChange(address)}
									aria-label={`Select address ${address}`}
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
});

// Main Votes Component
function Votes({ addresses, userId }: VotesProps) {
	const t = useTranslations('Profile');

	const { userPreferences } = useUserPreferences();

	const network = getCurrentNetwork();

	const queryClient = useQueryClient();

	// State management
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [showMore, setShowMore] = useState(false);
	const [selectedAddresses, setSelectedAddresses] = useState<string[]>([...addresses]);
	const [openRemoveVoteDialog, setOpenRemoveVoteDialog] = useState(false);
	const [proposalIndex, setProposalIndex] = useState<number | null>(null);
	const [voterAddress, setVoterAddress] = useState<string>();

	// Memoized fetch function to prevent unnecessary recreations
	const fetchVotes = useCallback(async () => {
		if (!selectedAddresses.length) {
			return { items: [], totalCount: 0 };
		}

		const { data, error } = await NextApiClientService.getVotesByAddresses({
			addresses: [...selectedAddresses],
			page,
			limit: DEFAULT_LISTING_LIMIT
		});

		if (error) {
			throw new Error(error.message);
		}

		return data || { items: [], totalCount: 0 };
	}, [selectedAddresses, page]);

	const { data: votes, isFetching } = useQuery({
		queryKey: ['profileVotes', selectedAddresses, page] as const,
		queryFn: fetchVotes,
		enabled: selectedAddresses.length > 0,
		refetchOnWindowFocus: false,
		staleTime: ONE_MIN_IN_MILLI
	});

	// Memoized handlers to prevent unnecessary re-renders
	const handleSelectedAddressesChange = useCallback((newAddresses: string[]) => {
		setSelectedAddresses(newAddresses);
		setPage(1); // Reset to first page when addresses change
	}, []);

	const handleRemoveVote = useCallback((voteProposalIndex: number, removingAddress: string) => {
		setOpenRemoveVoteDialog(true);
		setProposalIndex(voteProposalIndex);
		setVoterAddress(removingAddress);
	}, []);

	const handleRemoveVoteConfirm = useCallback(() => {
		if (proposalIndex === null) return;
		queryClient.setQueryData(['profileVotes', selectedAddresses, page] as const, (old: IGenericListingResponse<IProfileVote> | undefined) => {
			if (!old) return old;
			return {
				...old,
				items: old.items.filter(
					(item) => !(item.proposalIndex === proposalIndex && item.voterAddress === getEncodedAddress(userPreferences.selectedAccount?.address || '', network))
				),
				totalCount: old.totalCount - 1
			};
		});
		setLoading(false);
		setProposalIndex(null);
	}, [proposalIndex, queryClient, selectedAddresses, page, userPreferences.selectedAccount?.address, network]);

	// Memoized vote items to prevent unnecessary re-renders
	const visibleVotes = useMemo(() => {
		if (!votes?.items) return [];
		return votes.items.slice(0, showMore ? DEFAULT_LISTING_LIMIT : DEFAULT_VOTES_SHOW_COUNT);
	}, [votes?.items, showMore]);

	// Memoized skeleton count
	const skeletonCount = useMemo(() => (showMore ? DEFAULT_LISTING_LIMIT : DEFAULT_VOTES_SHOW_COUNT), [showMore]);

	// Memoized conditions
	const hasVotes = useMemo(() => Boolean(votes?.totalCount), [votes?.totalCount]);
	const shouldShowToggleButton = useMemo(() => votes && !isFetching && votes.totalCount > DEFAULT_VOTES_SHOW_COUNT, [votes, isFetching]);
	const shouldShowPagination = useMemo(() => showMore && votes && votes.totalCount > DEFAULT_VOTES_SHOW_COUNT, [showMore, votes]);

	return (
		<div
			className={classes.votesWrapper}
			role='main'
			aria-label='Votes section'
		>
			{/* Header Section */}
			<header className={classes.header}>
				<div className='flex items-center gap-2'>
					<h2 className='text-2xl font-bold'>{t('Votes.votes')}</h2>
					{hasVotes && votes && ValidatorService.isValidNumber(votes.totalCount) && <p aria-label={`Total votes: ${votes.totalCount}`}>({votes.totalCount})</p>}
				</div>
				<SelectAddresses
					addresses={addresses}
					selectedAddresses={selectedAddresses}
					onSelectedAddressesChange={handleSelectedAddressesChange}
					disabled={isFetching || loading}
				/>
			</header>

			<Separator orientation='horizontal' />

			{/* Content Section */}
			{isFetching ? (
				// Loading State
				<div
					className={cn(classes.votesItemWrapper, 'overflow-x-auto')}
					role='status'
					aria-label='Loading votes'
				>
					<Table className='min-w-full text-sm text-text_primary'>
						<TableHeader>
							<TableRow className='bg-page_background text-sm font-medium text-wallet_btn_text'>
								<TableHead className='py-4'>{t('Votes.proposal')}</TableHead>
								<TableHead className='py-4 text-start'>{t('Votes.voteFor')}</TableHead>
								<TableHead className='py-4 text-center'>{t('Votes.status')}</TableHead>
								<TableHead className='py-4 text-center'>{t('Votes.voter')}</TableHead>
								<TableHead className='py-4 text-right'>{t('Votes.action')}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{Array.from({ length: skeletonCount }, (_, index) => (
								<TableRow key={index}>
									<TableCell className='py-4'>
										<Skeleton className='h-4 w-full' />
									</TableCell>
									<TableCell className='py-4'>
										<Skeleton className='h-4 w-3/4' />
									</TableCell>
									<TableCell className='py-4'>
										<Skeleton className='mx-auto h-4 w-16' />
									</TableCell>
									<TableCell className='py-4'>
										<Skeleton className='mx-auto h-4 w-20' />
									</TableCell>
									<TableCell className='py-4'>
										<Skeleton className='ml-auto h-4 w-8' />
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			) : !hasVotes ? (
				// Empty State
				<div
					className='mt-0 flex w-full flex-col items-center justify-center'
					role='status'
				>
					<Image
						src={noData}
						alt='No votes data available'
						width={300}
						height={300}
						priority
					/>
					<p className='text-text_secondary mb-2 mt-0'>{t('Votes.noData')}</p>
				</div>
			) : (
				// Votes Content
				<div className={classes.votesItemWrapper}>
					<Table className='min-w-full text-sm text-text_primary'>
						<TableHeader>
							<TableRow className='bg-page_background text-sm font-medium text-wallet_btn_text'>
								<TableHead className='py-4'>{t('Votes.proposal')}</TableHead>
								<TableHead className='py-4 text-start'>{t('Votes.voteFor')}</TableHead>
								<TableHead className='py-4 text-center'>{t('Votes.status')}</TableHead>
								<TableHead className='py-4 text-center'>{t('Votes.voter')}</TableHead>
								<TableHead className='py-4 text-right'>{t('Votes.action')}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{visibleVotes.map((vote) => (
								<VoteItem
									key={`${vote.proposalIndex}-${vote.voterAddress}`}
									vote={vote}
									network={network}
									userId={userId}
									onRemoveVote={() => handleRemoveVote(vote.proposalIndex, vote.voterAddress)}
									isLoading={loading}
								/>
							))}
						</TableBody>
					</Table>

					{/* Show More/Less Button */}
					<div className='flex w-full justify-start'>
						{shouldShowToggleButton && (
							<Button
								variant='ghost'
								className='px-0 py-0 text-xs font-normal text-text_pink'
								onClick={() => setShowMore(!showMore)}
								aria-expanded={showMore}
								aria-controls='votes-list'
							>
								{showMore ? t('Votes.showLess') : t('Votes.showMore')}
							</Button>
						)}
					</div>

					{/* Pagination */}
					{shouldShowPagination && (
						<div
							className='flex w-full justify-center'
							role='navigation'
							aria-label='Votes pagination'
						>
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

			{/* Remove Vote Dialog */}
			{proposalIndex !== null && ValidatorService.isValidNumber(proposalIndex) && voterAddress && (
				<RemoveVoteDialog
					open={openRemoveVoteDialog}
					onOpenChange={setOpenRemoveVoteDialog}
					setLoading={setLoading}
					isLoading={loading}
					proposalIndex={proposalIndex}
					onConfirm={handleRemoveVoteConfirm}
					voterAddress={voterAddress}
				/>
			)}
		</div>
	);
}

export default memo(Votes);
