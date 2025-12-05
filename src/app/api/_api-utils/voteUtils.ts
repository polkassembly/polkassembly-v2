// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IDelegatedVote, IDVCohortVote, IDVVotes } from '@/_shared/types';

export function normalizeOnchainVote(vote: IDVVotes) {
	if (vote?.balance?.value) {
		return [
			{
				isStandard: true,
				aye: vote.decision === 'yes',
				balance: vote.balance.value,
				conviction: vote.lockPeriod
			}
		];
	}

	if (vote?.balance?.aye && vote?.balance?.nay) {
		return [
			{
				isSplit: true,
				aye: true,
				balance: vote.balance.aye,
				conviction: 0
			},
			{
				isSplit: true,
				aye: false,
				balance: vote.balance.nay,
				conviction: 0
			}
		];
	}

	if (vote?.balance?.abstain) {
		return [
			{
				isSplitAbstain: true,
				aye: true,
				balance: vote.balance.aye,
				conviction: 0
			},
			{
				isSplitAbstain: true,
				aye: false,
				balance: vote.balance.nay,
				conviction: 0
			},
			{
				isSplitAbstain: true,
				isAbstain: true,
				balance: vote.balance.abstain,
				conviction: 0
			}
		];
	}

	return [];
}

export function formatDVCohortVote(vote: IDVVotes): IDVCohortVote {
	const refIndex = vote.proposal.index;

	let delegatedVotes = BigInt(0);
	let delegatedCapital = BigInt(0);

	if (vote.delegatedVotes && Array.isArray(vote.delegatedVotes)) {
		vote.delegatedVotes.forEach((dv: IDelegatedVote) => {
			delegatedVotes += BigInt(dv.votingPower || 0);
			const balance = dv.balance?.value || dv.balance?.aye || dv.balance?.nay || dv.balance?.abstain || 0;
			delegatedCapital += BigInt(balance);
		});
	}

	const isSplit = !!(vote.balance?.aye && vote.balance?.nay);
	const isSplitAbstain = !!vote.balance?.abstain;
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
