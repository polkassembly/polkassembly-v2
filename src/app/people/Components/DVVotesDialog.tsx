// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useState } from 'react';
import { useTranslations } from 'next-intl';
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
	const t = useTranslations('DecentralizedVoices');
	const [activeTab, setActiveTab] = useState<EDVDelegateType>(EDVDelegateType.DAO);
	const network = getCurrentNetwork();

	if (!data) return null;

	const { delegateVotes = [], guardianVotes = [] } = data;

	const activeVotes = (activeTab === EDVDelegateType.DAO ? delegateVotes || [] : guardianVotes || []).slice().sort((a, b) => {
		const powerA = BigInt(a.votingPower || '0');
		const powerB = BigInt(b.votingPower || '0');

		if (powerA > powerB) return -1;
		if (powerA < powerB) return 1;
		return 0;
	});

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

	const allVotes = [...(delegateVotes || []), ...(guardianVotes || [])];
	const totalStats = getStats(allVotes);

	const dvAyePower = totalStats.ayePower;
	const dvNayPower = totalStats.nayPower;
	const dvAbstainPower = totalStats.abstainPower;
	const dvTotalPower = dvAyePower + dvNayPower + dvAbstainPower;

	const dvDecidingPower = dvAyePower + dvNayPower;

	const totalChainAyePower = BigInt(data.totalAyeVotingPower || '0');
	const totalChainNayPower = BigInt(data.totalNayVotingPower || '0');
	const totalChainPower = totalChainAyePower + totalChainNayPower;

	const ayePercentBar = totalChainPower > 0 ? Number((dvAyePower * BigInt(10000)) / totalChainPower) / 100 : 0;
	const nayPercentBar = totalChainPower > 0 ? Number((dvNayPower * BigInt(10000)) / totalChainPower) / 100 : 0;
	const abstainPercentBar = totalChainPower > 0 ? Number((dvAbstainPower * BigInt(10000)) / totalChainPower) / 100 : 0;

	const dvPercentOfTotal = totalChainPower > 0 ? Number((dvDecidingPower * BigInt(10000)) / totalChainPower) / 100 : 0;

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className='p-0 md:max-w-3xl'>
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
							{t('DecentralizedVoicesTitle')}
						</span>
					</DialogTitle>
				</DialogHeader>

				<div className='flex flex-col gap-6 px-6 pb-6'>
					<div className='space-y-2'>
						<div className='flex items-center justify-between'>
							<span className='text-sm text-text_primary'>{t('OverallVoteDistribution')}</span>
							<span className='text-lg font-bold text-text_primary'>
								~{formatUSDWithUnits(formatBnBalance(dvTotalPower.toString(), { withUnit: true, numberAfterComma: 2 }, network))}
							</span>
						</div>

						<div className='flex h-8 w-full overflow-hidden rounded-full bg-sidebar_footer'>
							{ayePercentBar > 0 && (
								<div
									className='flex items-center justify-center bg-aye_color text-xs font-semibold text-btn_primary_text'
									style={{ width: `${ayePercentBar.toFixed(1)}%` }}
								>
									{ayePercentBar.toFixed(1)}%
								</div>
							)}
							{nayPercentBar > 0 && (
								<div
									className='flex items-center justify-center bg-nay_color text-xs font-semibold text-btn_primary_text'
									style={{ width: `${nayPercentBar.toFixed(1)}%` }}
								>
									{nayPercentBar.toFixed(1)}%
								</div>
							)}
							{abstainPercentBar > 0 && (
								<div
									className='flex items-center justify-center bg-abstain_color text-xs font-semibold text-btn_primary_text'
									style={{ width: `${abstainPercentBar.toFixed(1)}%` }}
								>
									{abstainPercentBar.toFixed(1)}%
								</div>
							)}
						</div>
						<p className='text-sm text-text_primary'>
							{dvPercentOfTotal.toFixed(2)}% {t('ReferendumVotingPower')}
						</p>
					</div>

					<div className='grid max-h-[150px] grid-cols-1 gap-4 overflow-y-auto md:max-h-full md:grid-cols-3'>
						<div className='rounded-xl border border-border_grey bg-aye_color/10 p-4'>
							<div className='flex items-center justify-between'>
								<span className='font-semibold text-success'>{t('Aye').toUpperCase()}</span>
								<span className='text-xl font-bold text-success'>
									{formatUSDWithUnits(formatBnBalance(dvAyePower.toString(), { withUnit: true, numberAfterComma: 2 }, network))}
								</span>
							</div>
							<div className='text-xs text-text_primary'>
								{totalStats.ayeCount} {t('Voters')}
							</div>
						</div>
						<div className='rounded-xl border border-border_grey bg-nay_color/10 p-4'>
							<div className='flex items-center justify-between'>
								<span className='text-failure_vote_text font-semibold'>{t('Nay').toUpperCase()}</span>
								<span className='text-failure_vote_text text-xl font-bold'>
									{formatUSDWithUnits(formatBnBalance(dvNayPower.toString(), { withUnit: true, numberAfterComma: 2 }, network))}
								</span>
							</div>
							<div className='text-xs text-text_primary'>
								{totalStats.nayCount} {t('Voters')}
							</div>
						</div>
						<div className='rounded-xl border border-border_grey bg-abstain_color/10 p-4'>
							<div className='flex items-center justify-between'>
								<span className='font-semibold text-abstain_color'>{t('DVAbstain')}</span>
								<span className='text-xl font-bold text-abstain_color'>
									{formatUSDWithUnits(formatBnBalance(dvAbstainPower.toString(), { withUnit: true, numberAfterComma: 2 }, network))}
								</span>
							</div>
							<div className='text-xs text-text_primary'>
								{totalStats.abstainCount} {t('Voters')}
							</div>
						</div>
					</div>
					{guardianVotes.length > 0 && (
						<div className='flex gap-4 rounded-lg bg-sidebar_footer p-1'>
							<button
								type='button'
								onClick={() => setActiveTab(EDVDelegateType.DAO)}
								className={cn(
									'flex-1 rounded-md py-2 text-sm font-medium transition-colors',
									activeTab === EDVDelegateType.DAO && 'bg-section_dark_overlay text-text_primary shadow-sm'
								)}
							>
								{t('DAO')} ({delegateVotes.length})
							</button>

							<button
								type='button'
								onClick={() => setActiveTab(EDVDelegateType.GUARDIAN)}
								className={cn(
									'flex-1 rounded-md py-2 text-sm font-medium text-wallet_btn_text transition-colors',
									activeTab === EDVDelegateType.GUARDIAN && 'bg-section_dark_overlay text-text_primary shadow-sm'
								)}
							>
								{t('Guardian').toUpperCase()} ({guardianVotes.length})
							</button>
						</div>
					)}

					<div className='flex max-h-[150px] flex-col gap-3 overflow-y-auto md:max-h-full'>
						{activeVotes.length > 0 ? (
							activeVotes.map((vote) => (
								<VoteRow
									key={vote.address}
									vote={vote}
									network={network}
								/>
							))
						) : (
							<div className='py-8 text-center text-text_primary'>{t('NoVotesInCategory')}</div>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
