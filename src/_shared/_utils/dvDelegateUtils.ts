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
	IDVDReferendumResponse,
	IDVDelegateWithStats,
	IDVReferendumInfluence,
	IDVDelegateVotingMatrix,
	EInfluenceStatus,
	IDVDelegateVote,
	IDelegatedVote,
	IDVVotes
} from '../types';

export function calculateDVCohortStats(votes: IDVCohortVote[], referenda: IDVDReferendumResponse[], cohort: IDVCohort): { delegatesWithStats: IDVDelegateWithStats[] } {
	const getWinningVoteIncrement = (vote: IDVCohortVote, referendum: IDVDReferendumResponse): number => {
		if (vote.isSplit || vote.isSplitAbstain) return 0;
		if (!referendum.status) return 0;
		const approvedStatuses = [EProposalStatus.Executed, EProposalStatus.Approved, EProposalStatus.Confirmed];
		const isApproved = approvedStatuses.includes(referendum.status);
		const isClosed = isApproved || [EProposalStatus.Rejected, EProposalStatus.TimedOut, EProposalStatus.Cancelled].includes(referendum.status);

		if (!isClosed) return 0;

		if ((isApproved && vote.aye) || (!isApproved && !vote.aye)) {
			return 1;
		}
		return 0;
	};

	const getVoteStatsIncrement = (
		vote: IDVCohortVote,
		referendum: IDVDReferendumResponse | undefined
	): { ayeCount: number; nayCount: number; abstainCount: number; winningVotes: number; votedCount: number } => {
		const result = { ayeCount: 0, nayCount: 0, abstainCount: 0, winningVotes: 0, votedCount: 0 };
		if (!referendum) return result;
		result.votedCount = 1;

		if (vote.isSplit || vote.isSplitAbstain) {
			if (BigInt(vote.ayeBalance || 0) > 0) result.ayeCount = 1;
			if (BigInt(vote.nayBalance || 0) > 0) result.nayCount = 1;
			if (BigInt(vote.abstainBalance || 0) > 0) result.abstainCount = 1;
		} else if (vote.aye) {
			result.ayeCount = 1;
		} else {
			result.nayCount = 1;
		}

		result.winningVotes = getWinningVoteIncrement(vote, referendum);
		return result;
	};

	const delegatesWithStats = cohort.delegates.map((delegate) => {
		const delegateVotes = votes.filter((v) => v.account === delegate.address);
		const stats = {
			ayeCount: 0,
			nayCount: 0,
			abstainCount: 0,
			winningVotes: 0,
			votedCount: 0
		};

		delegateVotes.forEach((vote) => {
			const referendum = referenda.find((r) => r.index === vote.referendumIndex);
			const increment = getVoteStatsIncrement(vote, referendum);
			stats.ayeCount += increment.ayeCount;
			stats.nayCount += increment.nayCount;
			stats.abstainCount += increment.abstainCount;
			stats.winningVotes += increment.winningVotes;
			stats.votedCount += increment.votedCount;
		});

		const participation = referenda.length > 0 ? (stats.votedCount / referenda.length) * 100 : 0;
		const winRate = delegateVotes.length > 0 ? (stats.winningVotes / delegateVotes.length) * 100 : 0;

		return {
			...delegate,
			voteStats: {
				ayeCount: stats.ayeCount,
				nayCount: stats.nayCount,
				abstainCount: stats.abstainCount,
				participation,
				winRate
			}
		};
	});

	return { delegatesWithStats };
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function formatDate(date: Date): { date: string; time: string } {
	const d = dayjs(date);
	return { date: d.format("MMM D 'YY"), time: d.format('HH:mm:ss') };
}

export function formatDateWithYear(date: Date): string {
	return dayjs(date).format("MMM D 'YY");
}

export function formatDateRange(startDate: Date, endDate?: Date, isOngoing?: boolean): string {
	const startStr = formatDateWithYear(startDate);
	if (isOngoing) {
		return startStr;
	}
	const endStr = endDate ? formatDateWithYear(endDate) : '';
	return `${startStr} - ${endStr}`;
}

export function getCohortTenureDays(cohort: IDVCohort): number {
	const startTime = new Date(cohort.startTime);
	const endTime = cohort.endTime ? new Date(cohort.endTime) : new Date();
	const days = Math.floor((endTime.getTime() - startTime.getTime()) / MS_PER_DAY);
	return Math.max(0, days);
}

export function getDVCohortsByNetwork(network: ENetwork): IDVCohort[] {
	if (network === ENetwork.KUSAMA) return DV_COHORTS_KUSAMA;
	if (network === ENetwork.POLKADOT) return DV_COHORTS_POLKADOT;
	return [];
}

export function getCurrentDVCohort(network: ENetwork): IDVCohort | null {
	const cohorts = getDVCohortsByNetwork(network);
	return cohorts.find((c) => c.status === ECohortStatus.ONGOING) || null;
}

export function getDVCohortByIndex(network: ENetwork, index: number): IDVCohort | null {
	const cohorts = getDVCohortsByNetwork(network);
	return cohorts.find((c) => c.index === index) || null;
}

export function calculateDVInfluence(
	votes: IDVCohortVote[],
	cohort: IDVCohort,
	referenda: IDVDReferendumResponse[],
	network: ENetwork
): { referendaInfluence: IDVReferendumInfluence[] } {
	const referendaInfluence: IDVReferendumInfluence[] = referenda.map((referendum) => {
		const refVotes = votes.filter((v) => v.referendumIndex === referendum.index);

		const delegateVotes: IDVDelegateVote[] = [];
		const guardianVotes: IDVDelegateVote[] = [];

		let dvAyePower = BigInt(0);
		let dvNayPower = BigInt(0);
		let dvAbstainPower = BigInt(0);

		refVotes.forEach((vote) => {
			let decision = EVoteDecision.ABSTAIN;
			let votingPower = BigInt(0);
			if (vote.isSplit || vote.isSplitAbstain) {
				dvAyePower += BigInt(vote.ayeVotes || 0);
				dvNayPower += BigInt(vote.nayVotes || 0);
				dvAbstainPower += BigInt(vote.abstainVotes || 0);
				votingPower = BigInt(vote.ayeVotes || 0) + BigInt(vote.nayVotes || 0) + BigInt(vote.abstainVotes || 0);

				decision = vote.isSplitAbstain ? EVoteDecision.SPLIT_ABSTAIN : EVoteDecision.SPLIT;
			} else if (vote.aye) {
				const totalVotes = BigInt(vote.votes || 0) + BigInt(vote.delegations?.votes || 0);
				dvAyePower += totalVotes;
				votingPower = totalVotes;
				decision = EVoteDecision.AYE;
			} else if (!vote.aye) {
				const totalVotes = BigInt(vote.votes || 0) + BigInt(vote.delegations?.votes || 0);
				dvNayPower += totalVotes;
				votingPower = totalVotes;
				decision = EVoteDecision.NAY;
			}

			const delegate = cohort.delegates.find((d) => d.address === vote.account);
			if (delegate) {
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
		});

		const totalAye = BigInt(referendum.tally?.ayes || 0);
		const totalNay = BigInt(referendum.tally?.nays || 0);

		const isPassed = [EProposalStatus.Executed, EProposalStatus.Approved, EProposalStatus.Confirmed].includes(referendum.status);
		const isFailed = [EProposalStatus.Rejected].includes(referendum.status);

		let influence = EInfluenceStatus.NO_IMPACT;

		if (dvAyePower === BigInt(0) && dvNayPower === BigInt(0)) {
			influence = EInfluenceStatus.NO_IMPACT;
		} else if (isPassed) {
			if (dvAyePower >= dvNayPower) influence = EInfluenceStatus.APPROVED;
			else influence = EInfluenceStatus.FAILED;
		} else if (isFailed) {
			if (dvNayPower >= dvAyePower) influence = EInfluenceStatus.REJECTED;
			else influence = EInfluenceStatus.FAILED;
		}

		const totalPower = dvAyePower + dvNayPower + dvAbstainPower;
		const turnout = totalAye + totalNay;

		const setPercentage = (votesList: IDVDelegateVote[]) => {
			return votesList.map((vote) => {
				const power = BigInt(vote.votingPower);
				return {
					...vote,
					percentage: turnout > BigInt(0) ? Number((power * BigInt(10000)) / turnout) / 100 : 0
				};
			});
		};

		const delegateVotesWithPercentage = setPercentage(delegateVotes);
		const guardianVotesWithPercentage = setPercentage(guardianVotes);
		const ayePercent = turnout > BigInt(0) ? Number((totalAye * BigInt(10000)) / turnout) / 100 : 0;
		const nayPercent = turnout > BigInt(0) ? Number((totalNay * BigInt(10000)) / turnout) / 100 : 0;
		const { trackNumber } = referendum;
		const networkDetails = NETWORKS_DETAILS[network];
		const trackDetails = networkDetails?.trackDetails || {};
		const track = Object.values(trackDetails).find((t) => t && t.trackId === trackNumber);
		return {
			index: referendum.index,
			title: referendum.proposalArguments?.description || referendum.preimage?.proposedCall?.description || 'Untitled',
			track: track?.name ? track.name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : '',
			status: referendum.status,
			ayeVotingPower: dvAyePower.toString(),
			nayVotingPower: dvNayPower.toString(),
			ayePercent,
			nayPercent,
			influence,
			dvTotalVotingPower: totalPower.toString(),
			delegateVotes: delegateVotesWithPercentage,
			guardianVotes: guardianVotesWithPercentage,
			totalAyeVotingPower: totalAye.toString(),
			totalNayVotingPower: totalNay.toString()
		};
	});

	return { referendaInfluence };
}

function processDelegateVote(vote: IDVCohortVote): { decision: EVoteDecision; votingPower: bigint } {
	let votingPower = BigInt(0);
	let decision = EVoteDecision.ABSTAIN;

	if (vote.isSplit || vote.isSplitAbstain) {
		const ayeBalance = BigInt(vote.ayeBalance || 0);
		const nayBalance = BigInt(vote.nayBalance || 0);
		const abstainBalance = BigInt(vote.abstainBalance || 0);

		if (ayeBalance >= nayBalance && ayeBalance >= abstainBalance) {
			decision = EVoteDecision.AYE;
		} else if (nayBalance >= ayeBalance && nayBalance >= abstainBalance) {
			decision = EVoteDecision.NAY;
		} else {
			decision = EVoteDecision.ABSTAIN;
		}
		votingPower = BigInt(vote.ayeVotes || 0) + BigInt(vote.nayVotes || 0) + BigInt(vote.abstainVotes || 0);
	} else if (vote.aye) {
		decision = EVoteDecision.AYE;
		votingPower = BigInt(vote.votes || 0) + BigInt(vote.delegations?.votes || 0);
	} else if (vote.balance && !vote.aye) {
		decision = EVoteDecision.NAY;
		votingPower = BigInt(vote.votes || 0) + BigInt(vote.delegations?.votes || 0);
	} else {
		decision = EVoteDecision.ABSTAIN;
	}

	return { decision, votingPower };
}

export function calculateDVVotingMatrix(
	votes: IDVCohortVote[],
	cohort: IDVCohort,
	referenda: IDVDReferendumResponse[]
): { votingMatrix: IDVDelegateVotingMatrix[]; referendumIndices: number[] } {
	const referendumIndices = referenda.map((r) => r.index).sort((a, b) => a - b);
	const validReferendumIndices = new Set(referendumIndices);

	const votingMatrix: IDVDelegateVotingMatrix[] = cohort.delegates.map((delegate) => {
		const delegateVotes = votes.filter((v) => v.account === delegate.address);
		const votesMap: Record<number, EVoteDecision> = {};
		let delegateTotalVotingPower = BigInt(0);

		delegateVotes.forEach((vote) => {
			if (!validReferendumIndices.has(vote.referendumIndex)) return;

			const { decision, votingPower } = processDelegateVote(vote);
			votesMap[vote.referendumIndex] = decision;
			delegateTotalVotingPower += votingPower;
		});

		const activeCount = Object.keys(votesMap).length;
		const ayeCount = Object.values(votesMap).filter((v) => v === EVoteDecision.AYE).length;

		const totalRefs = referenda.length;
		const participation = totalRefs > 0 ? (activeCount / totalRefs) * 100 : 0;
		const ayeRate = activeCount > 0 ? (ayeCount / activeCount) * 100 : 0;

		return {
			address: delegate.address,
			type: delegate.role,
			votes: votesMap,
			participation,
			ayeRate,
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

	if (vote.delegatedVotes && Array.isArray(vote.delegatedVotes)) {
		vote.delegatedVotes.forEach((dv: IDelegatedVote) => {
			delegatedVotes += BigInt(dv.votingPower || 0);
			const balance = dv.balance?.value || BigInt(dv.balance?.aye || 0) + BigInt(dv.balance?.nay || 0) + BigInt(dv.balance?.abstain || 0);
			delegatedCapital += BigInt(balance);
		});
	}

	const isSplit = !!(vote.balance?.aye && vote.balance?.nay);
	const isSplitAbstain = !!vote.balance?.abstain && (!!vote.balance?.aye || !!vote.balance?.nay);
	const isStandard = !!vote.balance?.value;

	const voteData: IDVCohortVote = {
		referendumIndex: refIndex,
		account: vote.voter,
		isDelegating: !!vote.delegatedTo,
		isStandard,
		isSplit,
		isSplitAbstain,
		balance: vote.balance?.value || (BigInt(vote.balance?.aye || 0) + BigInt(vote.balance?.nay || 0) + BigInt(vote.balance?.abstain || 0)).toString(),
		aye: vote.decision === 'yes',
		conviction: vote.lockPeriod,
		votes: vote.selfVotingPower || '0',
		delegations: {
			votes: delegatedVotes.toString(),
			capital: delegatedCapital.toString()
		}
	};

	if (isSplit || isSplitAbstain) {
		const ayeBalance = BigInt(vote.balance?.aye || 0);
		const nayBalance = BigInt(vote.balance?.nay || 0);
		const abstainBalance = BigInt(vote.balance?.abstain || 0);

		voteData.ayeBalance = ayeBalance.toString();
		voteData.nayBalance = nayBalance.toString();
		voteData.abstainBalance = abstainBalance.toString();

		voteData.ayeVotes = (ayeBalance / BigInt(10)).toString();
		voteData.nayVotes = (nayBalance / BigInt(10)).toString();
		voteData.abstainVotes = (abstainBalance / BigInt(10)).toString();
	}

	return voteData;
}
