// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { ITrackAnalyticsDelegationsList, IVoteData } from '@/_shared/types';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/_shared-components/Dialog/Dialog';
import { PaginationWithLinks } from '@/app/_shared-components/PaginationWithLinks';
import DelegatedVotesDropdown from '@/app/_shared-components/PostDetails/VoteSummary/VoteHistory/DelegatedVotesDropdown/DelegatedVotesDropdown';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/_shared-components/Table';
import { BN, BN_ZERO } from '@polkadot/util';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

function Delegatees({ delegateesData }: { delegateesData: ITrackAnalyticsDelegationsList }) {
	const t = useTranslations('TrackAnalytics');
	const [page, setPage] = useState<number>(1);
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [selectedDelegatee, setSelectedDelegatee] = useState<IVoteData | null>(null);

	const network = getCurrentNetwork();

	const delegateeDataArray = Object.entries(delegateesData).map(([key, value]) => {
		const sumCapital = value.data.reduce((acc, curr) => acc.add(new BN(curr.capital)), BN_ZERO);
		const sumVotingPower = value.data.reduce((acc, curr) => acc.add(new BN(curr.votingPower)), BN_ZERO);

		const convictionPower = (Number(sumVotingPower) / Number(sumCapital)).toFixed(1);

		return {
			capital: sumCapital.toString(),
			count: value.count,
			lockPeriod: Number(convictionPower),
			from: key,
			votingPower: sumVotingPower.toString(),
			delegatedVotes: value.data.map((item) => ({
				balanceValue: item.capital,
				lockPeriod: item.lockedPeriod,
				voterAddress: item.from,
				totalVotingPower: item.votingPower
			}))
		};
	});

	return (
		<div>
			<Dialog
				open={openModal}
				onOpenChange={setOpenModal}
			>
				<DialogContent className='max-w-xl p-6'>
					<DialogHeader>
						<DialogTitle>{t('voteDetails')}</DialogTitle>
					</DialogHeader>
					<div>
						{selectedDelegatee && (
							<DelegatedVotesDropdown
								voteData={selectedDelegatee}
								voterDelegations={selectedDelegatee.delegatedVotes || []}
							/>
						)}
					</div>
				</DialogContent>
			</Dialog>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>{t('address')}</TableHead>
						<TableHead>{t('count')}</TableHead>
						<TableHead>{t('capital')}</TableHead>
						<TableHead>{t('votes')}</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody className='text-sm text-text_primary'>
					{delegateeDataArray.slice((page - 1) * DEFAULT_LISTING_LIMIT, page * DEFAULT_LISTING_LIMIT).map((delegatee) => (
						<TableRow
							className='cursor-pointer'
							onClick={() => {
								setOpenModal(true);
								setSelectedDelegatee({
									balanceValue: delegatee.capital,
									lockPeriod: delegatee.lockPeriod,
									selfVotingPower: delegatee.votingPower,
									voterAddress: delegatee.from,
									delegatedVotingPower: delegatee.votingPower,
									delegatedVotes: delegatee.delegatedVotes.map((item) => ({
										balanceValue: item.balanceValue,
										lockPeriod: item.lockPeriod,
										voterAddress: item.voterAddress,
										totalVotingPower: item.totalVotingPower
									}))
								} as IVoteData);
							}}
							key={delegatee.from}
						>
							<TableCell className='p-2'>
								<div className='flex items-center truncate'>
									<Address address={delegatee.from} />
								</div>
							</TableCell>
							<TableCell className='p-2'>{delegatee.count}</TableCell>
							<TableCell className='p-2'>{formatBnBalance(delegatee.capital, { compactNotation: true, withUnit: true, numberAfterComma: 1 }, network)}</TableCell>
							<TableCell className='p-2'>
								<div className='flex items-center justify-between gap-x-2'>
									{formatBnBalance(delegatee.votingPower, { compactNotation: true, withUnit: true, numberAfterComma: 1 }, network)}
									<ChevronRight className='h-4 w-4' />
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			<PaginationWithLinks
				page={page}
				pageSize={DEFAULT_LISTING_LIMIT}
				totalCount={delegateeDataArray.length}
				onPageChange={(newPage) => setPage(newPage)}
			/>
		</div>
	);
}

export default Delegatees;
