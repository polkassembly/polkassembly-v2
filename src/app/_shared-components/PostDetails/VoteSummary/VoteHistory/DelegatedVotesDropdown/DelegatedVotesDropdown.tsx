// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { useTranslations } from 'next-intl';
import { IVoteData } from '@/_shared/types';
import { BN } from '@polkadot/util';

function DelegatedVotesDropdown({ voteData, voterDelegations }: { voteData: IVoteData; voterDelegations: IVoteData[] }) {
	const network = getCurrentNetwork();
	const t = useTranslations('VoteSummary');

	const formatter = new Intl.NumberFormat('en-US', { notation: 'compact' });

	const [visibleDelegators, setVisibleDelegators] = useState(3); // Initially show 3 delegators

	const calculateDelegatedCapital = () => {
		const totalCapital = new BN(0);
		voterDelegations.forEach((delegator: IVoteData) => {
			const delegatorBalance = new BN(delegator?.balanceValue || '0');
			totalCapital.iadd(delegatorBalance);
		});
		return totalCapital.toString();
	};

	const formatBalance = (balance: string) => {
		return formatter.format(Number(formatBnBalance(balance, { withThousandDelimitor: false }, network)));
	};

	const handleViewMoreClick = () => {
		setVisibleDelegators(voterDelegations.length);
	};

	const handleViewLessClick = () => {
		setVisibleDelegators(3);
	};

	return (
		<div className='mb-2 px-2'>
			<div className='mb-3 mt-2 flex items-center justify-between'>
				<span className='text-sm font-medium text-basic_text dark:text-btn_primary_text'>{t('voteDetails.title')}</span>
				{voteData.createdAt && <span className='text-xs text-text_primary'>{dayjs(voteData.createdAt).format("Do MMM 'YY")}</span>}
			</div>

			<div className='flex justify-between'>
				<div className='flex w-[200px] flex-col gap-1'>
					<div className='text-xs font-medium text-basic_text dark:text-btn_primary_text'>{t('voteDetails.selfVotes')}</div>
					<div className='my-[2px] flex justify-between'>
						<span className='flex items-center gap-1 text-xs text-basic_text'>{t('voteDetails.votingPower')}</span>
						<span className='text-xs text-basic_text dark:text-btn_primary_text'>
							{formatBalance(voteData?.selfVotingPower?.toString() || '0')} {NETWORKS_DETAILS[`${network}`].tokenSymbol}
						</span>
					</div>
					<div className='my-[2px] flex justify-between'>
						<span className='flex items-center gap-1 text-xs text-basic_text'>{t('voteDetails.conviction')}</span>
						<span className='text-xs text-basic_text dark:text-btn_primary_text'>{voteData?.lockPeriod || '0'}x</span>
					</div>
					<div className='my-[2px] flex justify-between'>
						<span className='flex items-center gap-1 text-xs text-basic_text'>{t('voteDetails.capital')}</span>
						<span className='text-xs text-basic_text dark:text-btn_primary_text'>
							{formatBalance(voteData?.balanceValue?.toString() || '0')} {NETWORKS_DETAILS[`${network}`].tokenSymbol}
						</span>
					</div>
				</div>
				<div className='border-y-0 border-l-2 border-r-0 border-dashed border-primary_border' />
				<div className='mr-3 flex w-[200px] flex-col gap-1'>
					<div className='text-xs font-medium text-basic_text dark:text-btn_primary_text'>{t('voteDetails.delegatedVotes')}</div>
					<div className='my-[2px] flex justify-between'>
						<span className='flex items-center gap-1 text-xs text-basic_text'>{t('voteDetails.votingPower')}</span>
						<span className='text-xs text-basic_text dark:text-btn_primary_text'>
							{formatBalance(voteData?.delegatedVotingPower?.toString() || '0')} {NETWORKS_DETAILS[`${network}`].tokenSymbol}
						</span>
					</div>
					<div className='my-[2px] flex justify-between'>
						<span className='flex items-center gap-1 text-xs text-basic_text'>{t('voteDetails.delegators')}</span>
						<span className='text-xs text-basic_text dark:text-btn_primary_text'>{voterDelegations.length || '0'}</span>
					</div>
					<div className='my-[2px] flex justify-between'>
						<span className='flex items-center gap-1 text-xs text-basic_text'>{t('voteDetails.capital')}</span>
						<span className='text-xs text-basic_text dark:text-btn_primary_text'>
							{formatBalance(calculateDelegatedCapital())} {NETWORKS_DETAILS[`${network}`].tokenSymbol}
						</span>
					</div>
				</div>
			</div>

			<div className='mt-3 border-b-0 border-l-0 border-r-0 border-t-2 border-dashed border-primary_border pt-3 text-xs text-muted-foreground'>
				<span className='mb-2.5 mt-1 text-sm font-medium text-basic_text dark:text-btn_primary_text'>{t('voteDetails.delegationList')}</span>
				<div className='mb-1 mt-3 flex items-center justify-between'>
					<span className='w-1/2 text-xs font-medium text-basic_text dark:text-btn_primary_text'>{t('delegation.delegatorListHeader.delegator')}</span>
					<span className='w-1/4 text-xs font-medium text-basic_text dark:text-btn_primary_text'>{t('delegation.delegatorListHeader.conviction')}</span>
					<span className='text-xs font-medium text-basic_text dark:text-btn_primary_text'>{t('delegation.delegatorListHeader.votingPower')}</span>
				</div>
				<div className='max-h-[300px] overflow-y-auto'>
					{voterDelegations.slice(0, visibleDelegators).map((delegator: IVoteData) => (
						<div
							key={delegator?.voterAddress}
							className='mt-2.5 w-full space-y-1 border-b border-dashed border-primary_border pb-3'
						>
							<div className='flex justify-between font-normal sm:text-xs'>
								<div className='w-1/2'>
									<Address address={delegator?.voterAddress} />
								</div>
								<span className='mx-0 w-1/4 items-start text-basic_text dark:text-btn_primary_text'>{delegator?.lockPeriod || '0'}/d</span>
								<span className='mx-0 px-0 text-basic_text dark:text-btn_primary_text'>
									{formatBalance(delegator?.totalVotingPower?.toString() || '0')} {NETWORKS_DETAILS[`${network}`].tokenSymbol}
								</span>
							</div>
						</div>
					))}

					{voterDelegations.length > 3 && (
						<div className='mt-3 text-right'>
							<button
								type='button'
								onClick={visibleDelegators === 3 ? handleViewMoreClick : handleViewLessClick}
								className='text-xs text-btn_primary_background'
							>
								{visibleDelegators === 3 ? 'View More' : 'View Less'}
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default DelegatedVotesDropdown;
