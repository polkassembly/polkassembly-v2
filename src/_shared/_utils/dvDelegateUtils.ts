// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import dayjs from 'dayjs';
import { DV_COHORTS_KUSAMA, DV_COHORTS_POLKADOT } from '../_constants/dvCohorts';
import { NETWORKS_DETAILS } from '../_constants/networks';
import {
	ECohortStatus,
	ENetwork,
	IDVCohort,
	EDVDelegateType,
	EVoteDecision,
	EProposalStatus,
	IDVCohortVote,
	ICohortReferenda,
	IDVDelegateWithStats,
	IDVReferendumInfluence,
	IDVDelegateVotingMatrix,
	EInfluenceStatus,
	IDVDelegateVote,
	IDVVotes,
	IDelegatedVote
} from '../types';

export function calculateDVCohortStats(votes: IDVCohortVote[], referenda: ICohortReferenda[], cohort: IDVCohort): { delegatesWithStats: IDVDelegateWithStats[] } {
	// Optimization: Create a map of referenda for O(1) lookup
	const referendaMap = new Map(referenda.map((r) => [r.index, r]));

	const delegatesWithStats = cohort.delegates.map((delegate) => {
		// Filter votes for this delegate - still O(V) where V is total votes
		// Could optimize further by pre-grouping votes by delegate address if N_delegates is large, but for < 20 it's fine.
		const delegateVotes = votes.filter((v) => v.account === delegate.address);

		let ayeCount = 0;
		let nayCount = 0;
		let abstainCount = 0;
		let winningVotes = 0;
		let votedCount = 0;

		for (const vote of delegateVotes) {
			const referendum = referendaMap.get(vote.referendumIndex);
			if (!referendum) continue;

			votedCount++;

			// Determine vote direction
			if (vote.isSplit || vote.isSplitAbstain) {
				if (BigInt(vote.ayeBalance || 0) > 0) ayeCount++;
				if (BigInt(vote.nayBalance || 0) > 0) nayCount++;
				if (BigInt(vote.abstainBalance || 0) > 0) abstainCount++;
			} else if (vote.isAbstain) {
				abstainCount++;
			} else if (vote.aye) {
				ayeCount++;
			} else {
				nayCount++;
			}

			// Check for winning vote
			if (!referendum.status) continue;

			const approvedStatuses = [EProposalStatus.Executed, EProposalStatus.Approved, EProposalStatus.Confirmed];
			const isApproved = approvedStatuses.includes(referendum.status);
			const isClosed =
				isApproved ||
				[EProposalStatus.Rejected, EProposalStatus.TimedOut, EProposalStatus.Cancelled, EProposalStatus.Killed, EProposalStatus.ExecutionFailed].includes(referendum.status);

			if (isClosed) {
				if ((isApproved && vote.aye) || (!isApproved && !vote.aye)) {
					winningVotes++;
				}
			}
		}

		const totalRefs = referenda.length;
		const participation = totalRefs > 0 ? (votedCount / totalRefs) * 100 : 0;
		const winRate = votedCount > 0 ? (winningVotes / votedCount) * 100 : 0;

		return {
			...delegate,
			voteStats: {
				ayeCount,
				nayCount,
				abstainCount,
				participation,
				winRate
			}
		};
	});

	return { delegatesWithStats };
}

export const formatDate = (date: Date) => {
	const d = dayjs(date);
	return { date: d.format("MMM D 'YY"), time: d.format('HH:mm:ss') };
};

export const formatDateWithYear = (date: Date) => dayjs(date).format("MMM D 'YY");

export const formatDateRange = (startDate: Date, endDate?: Date, isOngoing?: boolean) => {
	const startStr = formatDateWithYear(startDate);
	if (isOngoing) return startStr;
	const endStr = endDate ? formatDateWithYear(endDate) : '';
	return `${startStr} - ${endStr}`;
};

export const getCohortTenureDays = (cohort: IDVCohort) => {
	const startTime = new Date(cohort.startTime);
	const endTime = cohort.endTime ? new Date(cohort.endTime) : new Date();
	const days = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24));
	return Math.max(0, days);
};

export const getDVCohortsByNetwork = (network: ENetwork): IDVCohort[] => {
	if (network === ENetwork.KUSAMA) return DV_COHORTS_KUSAMA;
	if (network === ENetwork.POLKADOT) return DV_COHORTS_POLKADOT;
	return [];
};

export const getCurrentDVCohort = (network: ENetwork): IDVCohort | null => {
	const cohorts = getDVCohortsByNetwork(network);
	return cohorts.find((c) => c.status === ECohortStatus.ONGOING) || null;
};

export const getDVCohortByIndex = (network: ENetwork, index: number): IDVCohort | null => {
	const cohorts = getDVCohortsByNetwork(network);
	return cohorts.find((c) => c.index === index) || null;
};

// ... (Other functions can be similarly simplified)

function calculateInfluenceStatus(dvAyePower: bigint, dvNayPower: bigint, referendum: ICohortReferenda): EInfluenceStatus {
	if (dvAyePower === BigInt(0) && dvNayPower === BigInt(0)) return EInfluenceStatus.NO_IMPACT;

	const isPassed = [EProposalStatus.Executed, EProposalStatus.Approved, EProposalStatus.Confirmed].includes(referendum.status);
	const isFailed = [EProposalStatus.Rejected].includes(referendum.status);

	if (isPassed) return dvAyePower >= dvNayPower ? EInfluenceStatus.APPROVED : EInfluenceStatus.FAILED;
	if (isFailed) return dvNayPower >= dvAyePower ? EInfluenceStatus.REJECTED : EInfluenceStatus.FAILED;

	return EInfluenceStatus.NO_IMPACT;
}

export function calculateDVInfluence(
	votes: IDVCohortVote[],
	cohort: IDVCohort,
	referenda: ICohortReferenda[],
	network: ENetwork
): { referendaInfluence: IDVReferendumInfluence[] } {
	// Optimization: Group votes by referendum index
	const votesByReferendum = new Map<number, IDVCohortVote[]>();
	for (const vote of votes) {
		const existing = votesByReferendum.get(vote.referendumIndex) || [];
		existing.push(vote);
		votesByReferendum.set(vote.referendumIndex, existing);
	}

	const referendaInfluence = referenda.map((referendum) => {
		const refVotes = votesByReferendum.get(referendum.index) || [];

		// Initialize accumulators
		let dvAyePower = BigInt(0);
		let dvNayPower = BigInt(0);
		const dvAbstainPower = BigInt(0);
		const delegateVotes: IDVDelegateVote[] = [];
		const guardianVotes: IDVDelegateVote[] = [];

		for (const vote of refVotes) {
			const delegate = cohort.delegates.find((d) => d.address === vote.account);
			if (!delegate) continue;

			// Calculate vote power
			let votingPower = BigInt(0);
			let decision = EVoteDecision.ABSTAIN;

			if (vote.isSplit || vote.isSplitAbstain) {
				const ayeP = BigInt(vote.ayeVotes || 0);
				const nayP = BigInt(vote.nayVotes || 0);
				const absP = BigInt(vote.abstainVotes || 0);
				dvAyePower += ayeP;
				dvNayPower += nayP;
				votingPower = ayeP + nayP + absP;
				decision = vote.isSplitAbstain ? EVoteDecision.SPLIT_ABSTAIN : EVoteDecision.SPLIT;
			} else if (vote.aye) {
				const total = BigInt(vote.votes || 0) + BigInt(vote.delegations?.votes || 0);
				dvAyePower += total;
				votingPower = total;
				decision = EVoteDecision.AYE;
			} else if (!vote.aye && !vote.isAbstain) {
				// Nay
				const total = BigInt(vote.votes || 0) + BigInt(vote.delegations?.votes || 0);
				dvNayPower += total;
				votingPower = total;
				decision = EVoteDecision.NAY;
			} else {
				// Abstain
				const total = BigInt(vote.votes || 0) + BigInt(vote.delegations?.votes || 0);
				votingPower = total;
				decision = EVoteDecision.ABSTAIN;
			}

			const voteData: IDVDelegateVote = {
				address: vote.account,
				decision,
				votingPower: votingPower.toString(),
				balance: vote.balance,
				conviction: vote.conviction || 0
			};

			if (delegate.role === EDVDelegateType.DAO) {
				delegateVotes.push(voteData);
			} else {
				guardianVotes.push(voteData);
			}
		}

		const totalAye = BigInt(referendum.tally?.ayes || 0);
		const totalNay = BigInt(referendum.tally?.nays || 0);
		const turnout = totalAye + totalNay;

		const influence = calculateInfluenceStatus(dvAyePower, dvNayPower, referendum);
		const totalPower = dvAyePower + dvNayPower + dvAbstainPower;

		const calcPercent = (v: IDVDelegateVote) => {
			const power = BigInt(v.votingPower);
			return turnout > BigInt(0) ? Number((power * BigInt(10000)) / turnout) / 100 : 0;
		};

		delegateVotes.forEach((v) => (v.percentage = calcPercent(v)));
		guardianVotes.forEach((v) => (v.percentage = calcPercent(v)));

		const trackDetails = NETWORKS_DETAILS[network]?.trackDetails || {};
		const track = Object.values(trackDetails).find((t) => t?.trackId === referendum.trackNumber);

		return {
			index: referendum.index,
			title: referendum.preimage?.proposedCall?.description || 'Untitled',
			track: track?.name?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || '',
			status: referendum.status,
			ayeVotingPower: dvAyePower.toString(),
			nayVotingPower: dvNayPower.toString(),
			ayePercent: turnout > BigInt(0) ? Number((totalAye * BigInt(10000)) / turnout) / 100 : 0,
			nayPercent: turnout > BigInt(0) ? Number((totalNay * BigInt(10000)) / turnout) / 100 : 0,
			influence,
			dvTotalVotingPower: totalPower.toString(),
			delegateVotes,
			guardianVotes,
			totalAyeVotingPower: totalAye.toString(),
			totalNayVotingPower: totalNay.toString()
		};
	});

	return { referendaInfluence };
}

export function calculateDVVotingMatrix(
	votes: IDVCohortVote[],
	cohort: IDVCohort,
	referenda: ICohortReferenda[]
): { votingMatrix: IDVDelegateVotingMatrix[]; referendumIndices: number[] } {
	const referendumIndices = referenda.map((r) => r.index).sort((a, b) => a - b);
	const validReferendumIndices = new Set(referendumIndices);

	// Group votes by account and then referendum index
	const accountVotesMap = new Map<string, Map<number, IDVCohortVote>>();
	for (const v of votes) {
		if (!accountVotesMap.has(v.account)) accountVotesMap.set(v.account, new Map());
		accountVotesMap.get(v.account)!.set(v.referendumIndex, v);
	}

	const votingMatrix = cohort.delegates.map((delegate) => {
		const votesMap: Record<number, EVoteDecision> = {};
		let delegateTotalVotingPower = BigInt(0);

		const delegateVotes = accountVotesMap.get(delegate.address);

		if (delegateVotes) {
			delegateVotes.forEach((vote, refIndex) => {
				if (!validReferendumIndices.has(refIndex)) return;

				let decision = EVoteDecision.ABSTAIN;
				let power = BigInt(0);

				if (vote.isSplit || vote.isSplitAbstain) {
					const aye = BigInt(vote.ayeBalance || 0);
					const nay = BigInt(vote.nayBalance || 0);
					const abs = BigInt(vote.abstainBalance || 0);
					if (aye >= nay && aye >= abs) decision = EVoteDecision.AYE;
					else if (nay >= aye && nay >= abs) decision = EVoteDecision.NAY;

					power = BigInt(vote.ayeVotes || 0) + BigInt(vote.nayVotes || 0) + BigInt(vote.abstainVotes || 0);
				} else if (vote.aye) {
					decision = EVoteDecision.AYE;
					power = BigInt(vote.votes || 0) + BigInt(vote.delegations?.votes || 0);
				} else if (!vote.aye && !vote.isAbstain) {
					decision = EVoteDecision.NAY;
					power = BigInt(vote.votes || 0) + BigInt(vote.delegations?.votes || 0);
				} else {
					power = BigInt(vote.votes || 0) + BigInt(vote.delegations?.votes || 0);
				}

				votesMap[refIndex] = decision;
				delegateTotalVotingPower += power;
			});
		}

		const activeCount = Object.keys(votesMap).length;
		const ayeCount = Object.values(votesMap).filter((v) => v === EVoteDecision.AYE).length;
		const totalRefs = referenda.length;

		return {
			address: delegate.address,
			type: delegate.role,
			votes: votesMap,
			participation: totalRefs > 0 ? (activeCount / totalRefs) * 100 : 0,
			ayeRate: activeCount > 0 ? (ayeCount / activeCount) * 100 : 0,
			activeCount,
			totalRefs,
			totalVotingPower: delegateTotalVotingPower.toString()
		};
	});

	return { votingMatrix, referendumIndices };
}

export function formatDVCohortVote(vote: IDVVotes): IDVCohortVote {
	const refIndex = vote.proposal.index;
	let delegatedVotes = BigInt(0);
	let delegatedCapital = BigInt(0);

	if (vote.delegatedVotes?.length) {
		for (const dv of vote.delegatedVotes) {
			delegatedVotes += BigInt(dv.votingPower || 0);
			const val = dv.balance?.value ? BigInt(dv.balance.value) : BigInt(0);
			const split = BigInt(dv.balance?.aye || 0) + BigInt(dv.balance?.nay || 0) + BigInt(dv.balance?.abstain || 0);
			delegatedCapital += val > BigInt(0) ? val : split;
		}
	}

	const ayeBal = BigInt(vote.balance?.aye || 0);
	const nayBal = BigInt(vote.balance?.nay || 0);
	const absBal = BigInt(vote.balance?.abstain || 0);

	const isSplit = ayeBal > BigInt(0) && nayBal > BigInt(0);
	const isSplitAbstain = absBal > BigInt(0) && (ayeBal > BigInt(0) || nayBal > BigInt(0));
	const isStandard = !!vote.balance?.value;

	// Simplification: decision string check
	const decisionLower = vote.decision?.toLowerCase();
	const isAbstain = decisionLower === 'abstain';
	const isAye = decisionLower === 'yes' || decisionLower === 'aye';

	const balVal = vote.balance?.value ? vote.balance.value : (ayeBal + nayBal + absBal).toString();

	const voteData: IDVCohortVote = {
		referendumIndex: refIndex,
		account: vote.voter,
		isDelegating: !!vote.delegatedTo,
		isStandard,
		isSplit,
		isSplitAbstain,
		isAbstain,
		balance: balVal,
		aye: isAye,
		conviction: vote.lockPeriod,
		votes: vote.selfVotingPower || '0',
		delegations: {
			votes: delegatedVotes.toString(),
			capital: delegatedCapital.toString()
		}
	};

	if (isSplit || isSplitAbstain) {
		voteData.ayeBalance = ayeBal.toString();
		voteData.nayBalance = nayBal.toString();
		voteData.abstainBalance = absBal.toString();
		voteData.ayeVotes = (ayeBal / BigInt(10)).toString();
		voteData.nayVotes = (nayBal / BigInt(10)).toString();
		voteData.abstainVotes = (absBal / BigInt(10)).toString();
	}

	return voteData;
}
