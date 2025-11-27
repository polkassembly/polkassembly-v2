// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/_shared-components/Dialog/Dialog';
import { IDVReferendumInfluence, EDVDelegateType, IDVDelegateVote, EVoteDecision } from '@/_shared/types';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import TwoUser from '@assets/icons/2User.svg';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import VoteRow from './VoteRow';

interface DVVotesDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	data: IDVReferendumInfluence | null;
}

export default function DVVotesDialog({ open, onOpenChange, data }: DVVotesDialogProps) {
	const [activeTab, setActiveTab] = useState<EDVDelegateType>(EDVDelegateType.DAO);
	const network = getCurrentNetwork();

	if (!data) return null;

	const { delegateVotes, guardianVotes } = data;

	const activeVotes = activeTab === EDVDelegateType.DAO ? delegateVotes : guardianVotes;

	const getStats = (votes: IDVDelegateVote[]) => {
		const ayeCount = votes.filter((v) => v.decision === EVoteDecision.AYE).length;
		const nayCount = votes.filter((v) => v.decision === EVoteDecision.NAY).length;
		const abstainCount = votes.filter((v) => v.decision === EVoteDecision.ABSTAIN || v.decision === EVoteDecision.SPLIT_ABSTAIN).length;

		let ayePower = BigInt(0);
		let nayPower = BigInt(0);
		let abstainPower = BigInt(0);

		votes.forEach((v) => {
			const power = BigInt(v.votingPower || '0');
			if (v.decision === EVoteDecision.AYE) ayePower += power;
			else if (v.decision === EVoteDecision.NAY) nayPower += power;
			else if (v.decision === EVoteDecision.ABSTAIN || v.decision === EVoteDecision.SPLIT_ABSTAIN) abstainPower += power;
		});

		return { ayeCount, nayCount, abstainCount, ayePower, nayPower, abstainPower };
	};

	const allVotes = [...delegateVotes, ...guardianVotes];
	const totalStats = getStats(allVotes);

	const dvAyePower = totalStats.ayePower;
	const dvNayPower = totalStats.nayPower;
	const dvAbstainPower = totalStats.abstainPower;
	const dvTotalPower = dvAyePower + dvNayPower + dvAbstainPower;

	const dvDecidingPower = dvAyePower + dvNayPower;
	const ayePercentBar = dvDecidingPower > 0 ? Number((dvAyePower * BigInt(100)) / dvDecidingPower) : 0;
	const nayPercentBar = dvDecidingPower > 0 ? Number((dvNayPower * BigInt(100)) / dvDecidingPower) : 0;

	const totalChainAyePower = BigInt(data.ayeVotingPower || '0');
	const totalChainNayPower = BigInt(data.nayVotingPower || '0');
	const totalChainPower = totalChainAyePower + totalChainNayPower;
	const dvPercentOfTotal = totalChainPower > 0 ? Number((dvDecidingPower * BigInt(10000)) / totalChainPower) / 100 : 0;

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className='max-w-3xl p-0'>
				<DialogHeader className='p-6 pb-2'>
					<DialogTitle className='flex items-center gap-2 text-xl font-bold'>
						<span className='flex items-center gap-2'>
							<Image
								src={TwoUser}
								alt='Two User'
								width={24}
								height={24}
								className='h-6 w-6 rounded-full'
							/>
							Decentralized Voices
						</span>
					</DialogTitle>
				</DialogHeader>

				<div className='flex flex-col gap-6 px-6 pb-6'>
					<div className='space-y-2'>
						<div className='flex items-center justify-between'>
							<span className='text-sm text-text_primary'>Overall Vote Distribution</span>
							<span className='text-lg font-bold text-text_primary'>
								~{formatUSDWithUnits(formatBnBalance(dvTotalPower.toString(), { withUnit: true, numberAfterComma: 2 }, network))}
							</span>
						</div>

						<div className='flex h-8 w-full overflow-hidden rounded-full'>
							{ayePercentBar > 0 && (
								<div
									className='flex items-center justify-center bg-aye_color text-xs font-semibold text-white'
									style={{ width: `${ayePercentBar}%` }}
								>
									{ayePercentBar}%
								</div>
							)}
							{nayPercentBar > 0 && (
								<div
									className='flex items-center justify-center bg-nay_color text-xs font-semibold text-white'
									style={{ width: `${nayPercentBar}%` }}
								>
									{nayPercentBar}%
								</div>
							)}
						</div>
						<p className='text-text_secondary text-sm'>{dvPercentOfTotal.toFixed(2)}% of referendum voting power</p>
					</div>

					<div className='grid grid-cols-3 gap-4'>
						<div className='rounded-xl border border-border_grey bg-aye_color/10 p-4'>
							<div className='flex items-center justify-between'>
								<span className='font-semibold text-success'>AYE</span>
								<span className='text-xl font-bold text-success'>
									{formatUSDWithUnits(formatBnBalance(dvAyePower.toString(), { withUnit: true, numberAfterComma: 2 }, network))}
								</span>
							</div>
							<div className='text-text_secondary text-xs'>{totalStats.ayeCount} Voters</div>
						</div>
						<div className='rounded-xl border border-border_grey bg-nay_color/10 p-4'>
							<div className='flex items-center justify-between'>
								<span className='text-failure_vote_text font-semibold'>NAY</span>
								<span className='text-failure_vote_text text-xl font-bold'>
									{formatUSDWithUnits(formatBnBalance(dvNayPower.toString(), { withUnit: true, numberAfterComma: 2 }, network))}
								</span>
							</div>
							<div className='text-text_secondary text-xs'>{totalStats.nayCount} Voters</div>
						</div>
						<div className='rounded-xl border border-border_grey bg-abstain_color/10 p-4'>
							<div className='flex items-center justify-between'>
								<span className='font-semibold text-blue-500'>DV ABSTAIN</span>
								<span className='text-xl font-bold text-blue-500'>
									{formatUSDWithUnits(formatBnBalance(dvAbstainPower.toString(), { withUnit: true, numberAfterComma: 2 }, network))}
								</span>
							</div>
							<div className='text-text_secondary text-xs'>{totalStats.abstainCount} Voters</div>
						</div>
					</div>

					<div className='bg-bg_secondary flex gap-4 rounded-lg p-1'>
						<button
							type='button'
							onClick={() => setActiveTab(EDVDelegateType.DAO)}
							className={cn(
								'flex-1 rounded-md py-2 text-sm font-medium transition-colors',
								activeTab === EDVDelegateType.DAO ? 'bg-white text-text_primary shadow-sm' : 'text-text_secondary hover:text-text_primary'
							)}
						>
							DAO ({delegateVotes.length})
						</button>
						<button
							type='button'
							onClick={() => setActiveTab(EDVDelegateType.GUARDIAN)}
							className={cn(
								'flex-1 rounded-md py-2 text-sm font-medium transition-colors',
								activeTab === EDVDelegateType.GUARDIAN ? 'bg-white text-text_primary shadow-sm' : 'text-text_secondary hover:text-text_primary'
							)}
						>
							GUARDIAN ({guardianVotes.length})
						</button>
					</div>

					<div className='flex max-h-[300px] flex-col gap-3 overflow-y-auto'>
						{activeVotes.length > 0 ? (
							activeVotes.map((vote) => (
								<VoteRow
									key={vote.address}
									vote={vote}
									network={network}
								/>
							))
						) : (
							<div className='text-text_secondary py-8 text-center'>No votes in this category</div>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
