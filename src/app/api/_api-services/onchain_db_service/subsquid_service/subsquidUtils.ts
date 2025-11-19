// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-underscore-dangle */

import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import {
	EAnalyticsType,
	ENetwork,
	EPostOrigin,
	EProposalStatus,
	EVoteDecision,
	EVoteSortOptions,
	IAccountAnalytics,
	IAnalytics,
	IBeneficiary,
	IFlattenedConvictionVote
} from '@/_shared/types';
import { encodeAddress } from '@polkadot/util-crypto';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { BN, BN_ZERO } from '@polkadot/util';
import { SubsquidQueries } from './subsquidQueries';

interface IStatusHistory {
	status: EProposalStatus;
	timestamp: string;
}

interface IPeriodEndDates {
	decisionPeriodEnd: Date | null;
	preparePeriodEnd: Date | null;
	confirmationPeriodEnd: Date | null;
}
const DEFAULT_LOCK_PERIOD_DIVISOR = new BN('10');

export class SubsquidUtils extends SubsquidQueries {
	/**
	 * Helper to extract beneficiary address from complex object structure
	 */
	private static extractBeneficiaryAddress(beneficiary: any): string {
		if (!beneficiary) return '';

		// Handle direct Id case
		if (beneficiary.__kind === 'Id' && beneficiary.value) {
			const substrateAddress = encodeAddress(beneficiary.value, 42);
			return substrateAddress || beneficiary.value;
		}

		// Handle V4 nested interior case
		if (beneficiary.__kind === 'V4' && beneficiary.accountId) {
			const id = beneficiary?.accountId?.interior?.value?.id || beneficiary?.accountId?.interior?.value?.[0]?.id;
			if (id) {
				const substrateAddress = encodeAddress(id, 42);
				return substrateAddress || id;
			}
		}

		// Handle V3 nested interior case
		const id = beneficiary?.value?.interior?.value?.id || beneficiary?.value?.interior?.value?.[0]?.id;
		if (id) {
			const substrateAddress = encodeAddress(id, 42);
			return substrateAddress || id;
		}
		return '';
	}

	/**
	 * Helper to extract assetId from assetKind object
	 */
	private static extractAssetId(assetKind: any): string | null {
		if (!assetKind) return null;

		const interior = assetKind?.assetId?.value?.interior?.value || assetKind?.assetId?.interior?.value;

		if (Array.isArray(interior)) {
			const generalIndex = interior.find((item: any) => item?.__kind === 'GeneralIndex');
			return generalIndex?.value?.toString() || null;
		}

		return null;
	}

	/**
	 * Helper to process conviction votes
	 */
	private static processConvictionVote({ vote, balance, convictionsVotes }: { vote: IFlattenedConvictionVote; balance: BN; convictionsVotes: IAnalytics['votesByConviction'] }) {
		const sameLockedPeriod = convictionsVotes.find((value) => [vote.lockPeriod || 0].includes(value.lockPeriod));
		if (sameLockedPeriod) {
			if (vote.decision === EVoteDecision.AYE) {
				sameLockedPeriod[EVoteDecision.AYE] = new BN(sameLockedPeriod[EVoteDecision.AYE] || '0').add(balance).toString();
			} else if (vote.decision === EVoteDecision.NAY) {
				sameLockedPeriod[EVoteDecision.NAY] = new BN(sameLockedPeriod[EVoteDecision.NAY] || '0').add(balance).toString();
			} else if (vote.decision === EVoteDecision.ABSTAIN) {
				sameLockedPeriod[EVoteDecision.ABSTAIN] = new BN(sameLockedPeriod[EVoteDecision.ABSTAIN] || '0').add(balance).toString();
			}
		} else {
			convictionsVotes.push({
				[EVoteDecision.ABSTAIN]: vote.decision === EVoteDecision.ABSTAIN ? balance?.toString() : '0',
				[EVoteDecision.AYE]: vote.decision === EVoteDecision.AYE ? balance?.toString() : '0',
				[EVoteDecision.NAY]: vote.decision === EVoteDecision.NAY ? balance?.toString() : '0',
				lockPeriod: vote.lockPeriod || 0
			});
		}
		return convictionsVotes.sort((a, b) => a.lockPeriod - b.lockPeriod);
	}

	/**
	 * Helper to process delegation votes
	 */
	private static processDelegationVote({
		vote,
		balance,
		delegationVotes
	}: {
		vote: IFlattenedConvictionVote;
		balance: BN;
		delegationVotes: IAnalytics['delegationVotesByConviction'];
	}) {
		const sameLockedPeriod = delegationVotes.find((value) => [vote.lockPeriod || 0].includes(value.lockPeriod));
		if (sameLockedPeriod) {
			if (vote.isDelegated) {
				sameLockedPeriod.delegated = new BN(sameLockedPeriod.delegated || '0').add(balance).toString();
			} else {
				sameLockedPeriod.solo = new BN(sameLockedPeriod.solo || '0').add(balance).toString();
			}
		} else {
			delegationVotes.push({
				delegated: vote.isDelegated ? balance?.toString() : '0',
				solo: vote.isDelegated ? '0' : balance?.toString(),
				lockPeriod: vote.lockPeriod || 0
			});
		}
		return delegationVotes.sort((a, b) => a.lockPeriod - b.lockPeriod);
	}

	/**
	 * Helper to process conviction votes for account
	 */
	private static processConvictionVotesForAccount({ vote, convictionVotes }: { vote: IFlattenedConvictionVote; convictionVotes: IAccountAnalytics['votesByConviction'] }) {
		const sameLockedPeriod = convictionVotes.find((value) => [vote.lockPeriod || 0].includes(value.lockPeriod));
		if (sameLockedPeriod) {
			if (vote.decision === EVoteDecision.AYE) {
				sameLockedPeriod[EVoteDecision.AYE] += 1;
			} else if (vote.decision === EVoteDecision.NAY) {
				sameLockedPeriod[EVoteDecision.NAY] += 1;
			} else if (vote.decision === EVoteDecision.ABSTAIN) {
				sameLockedPeriod[EVoteDecision.ABSTAIN] += 1;
			}
		} else {
			convictionVotes.push({
				[EVoteDecision.ABSTAIN]: vote.decision === EVoteDecision.ABSTAIN ? 1 : 0,
				[EVoteDecision.AYE]: vote.decision === EVoteDecision.AYE ? 1 : 0,
				[EVoteDecision.NAY]: vote.decision === EVoteDecision.NAY ? 1 : 0,
				lockPeriod: vote.lockPeriod || 0
			});
		}
		return convictionVotes.sort((a, b) => a.lockPeriod - b.lockPeriod);
	}

	/**
	 * Helper to process delegation votes for account
	 */
	private static processDelegationVotesForAccount({
		vote,
		delegationVotes
	}: {
		vote: IFlattenedConvictionVote;
		delegationVotes: IAccountAnalytics['delegationVotesByConviction'];
	}) {
		const sameLockedPeriod = delegationVotes.find((value) => [vote.lockPeriod || 0].includes(value.lockPeriod));
		if (sameLockedPeriod) {
			if (vote.isDelegated) {
				sameLockedPeriod.delegated += 1;
			} else {
				sameLockedPeriod.solo += 1;
			}
		} else {
			delegationVotes.push({
				delegated: vote.isDelegated ? 1 : 0,
				solo: vote.isDelegated ? 0 : 1,
				lockPeriod: vote.lockPeriod || 0
			});
		}
		return delegationVotes.sort((a, b) => a.lockPeriod - b.lockPeriod);
	}

	/**
	 * Helper to process time split votes
	 */
	private static processTimeSplitVotes({
		vote,
		convictionVote,
		timeSplitVotes
	}: {
		vote: IFlattenedConvictionVote;
		convictionVote: BN;
		timeSplitVotes: IAnalytics['timeSplitVotes'];
	}) {
		const proposalCreatedAt = dayjs(vote.proposal.createdAt);
		const voteCreatedAt = dayjs(vote.createdAt);
		const timeSplit = voteCreatedAt.diff(proposalCreatedAt, 'day');

		// 0-28 days
		if (timeSplit > 0 && timeSplit <= 28) {
			const sameIndex = timeSplitVotes.find((timeSplitVote) => timeSplitVote.index === timeSplit);
			if (sameIndex) {
				sameIndex.value = new BN(sameIndex.value).add(convictionVote).toString();
			} else {
				timeSplitVotes.push({ index: timeSplit, value: convictionVote.toString() });
			}
		}
		return timeSplitVotes.sort((a, b) => a.index - b.index);
	}

	/**
	 * Helper to process time split votes for account
	 */
	private static processTimeSplitVotesForAccount({ vote, timeSplitVotes }: { vote: IFlattenedConvictionVote; timeSplitVotes: IAccountAnalytics['timeSplitVotes'] }) {
		const proposalCreatedAt = dayjs(vote.proposal.createdAt);
		const voteCreatedAt = dayjs(vote.createdAt);
		const timeSplit = voteCreatedAt.diff(proposalCreatedAt, 'day');

		if (timeSplit > 0 && timeSplit <= 28) {
			const sameIndex = timeSplitVotes.find((timeSplitVote) => timeSplitVote.index === timeSplit);
			if (sameIndex) {
				sameIndex.value += 1;
			} else {
				timeSplitVotes.push({ index: timeSplit, value: 1 });
			}
		}
		return timeSplitVotes.sort((a, b) => a.index - b.index);
	}

	/**
	 * Extracts asset information from call arguments
	 * @param args - Call arguments containing asset and beneficiary information
	 * @returns Array of IBeneficiary with amounts, assetIds and addresses
	 */
	protected static extractAmountAndAssetId(args: any): IBeneficiary[] {
		const result: IBeneficiary[] = [];

		if (!args) return result;

		// Handle single spend case
		if (args.amount && args.beneficiary) {
			const assetId = this.extractAssetId(args.assetKind);
			const address = this.extractBeneficiaryAddress(args.beneficiary);

			if (address) {
				result.push({
					address,
					amount: args.amount.toString(),
					assetId,
					...(args.validFrom && { validFromBlock: String(args.validFrom) })
				});
			}
		}
		// Handle multiple calls case
		else if (Array.isArray(args.calls)) {
			args.calls.forEach((call: any) => {
				if (!call.value) return;

				const { amount, beneficiary, assetKind, validFrom } = call.value;
				const assetId = this.extractAssetId(assetKind);
				const address = this.extractBeneficiaryAddress(beneficiary);

				if (address && amount) {
					result.push({
						address,
						amount: amount.toString(),
						assetId,
						...(validFrom && { validFromBlock: String(validFrom) })
					});
				}
			});
		}

		return result;
	}

	protected static getAllPeriodEndDates(statusHistory: IStatusHistory[], network: ENetwork, origin: EPostOrigin): IPeriodEndDates {
		const result: IPeriodEndDates = {
			decisionPeriodEnd: null,
			preparePeriodEnd: null,
			confirmationPeriodEnd: null
		};

		try {
			const networkDetails = NETWORKS_DETAILS[network as ENetwork];
			const blockTime = networkDetails?.blockTime;

			if (!blockTime) {
				throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Block time not found for network');
			}

			const trackData = networkDetails?.trackDetails[origin as keyof typeof networkDetails.trackDetails];

			if (!trackData) {
				throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'Track data not found for network');
			}

			// Calculate decision period end
			const decidingStatus = statusHistory.find((status) => status.status === EProposalStatus.Deciding);
			if (decidingStatus?.timestamp && trackData.decisionPeriod) {
				const decisionPeriodMs = Number(trackData.decisionPeriod) * blockTime;
				result.decisionPeriodEnd = dayjs(decidingStatus.timestamp).add(decisionPeriodMs, 'millisecond').toDate();
			}

			// Calculate prepare period end
			const submittedStatus = statusHistory.find((status) => status.status === EProposalStatus.Submitted);
			if (submittedStatus?.timestamp && trackData.preparePeriod) {
				const preparePeriodMs = Number(trackData.preparePeriod) * blockTime;
				result.preparePeriodEnd = dayjs(submittedStatus.timestamp).add(preparePeriodMs, 'millisecond').toDate();
			}

			// Calculate confirmation period end
			const confirmStartedStatus = statusHistory.find((status) => status.status === EProposalStatus.ConfirmStarted);
			if (confirmStartedStatus?.timestamp && trackData.confirmPeriod) {
				const confirmPeriodMs = Number(trackData.confirmPeriod) * blockTime;
				result.confirmationPeriodEnd = dayjs(confirmStartedStatus.timestamp).add(confirmPeriodMs, 'millisecond').toDate();
			}

			return result;
		} catch (error) {
			console.error('Error calculating period end dates:', error);
			return result;
		}
	}

	protected static convertVoteDecisionToSubsquidFormat({ decision }: { decision: EVoteDecision }): string {
		return decision === EVoteDecision.AYE ? 'yes' : decision === EVoteDecision.NAY ? 'no' : 'abstain';
	}

	protected static convertVoteDecisionToSubsquidFormatArray({ decision }: { decision: EVoteDecision }): string[] {
		return decision === EVoteDecision.AYE ? ['yes', 'abstain'] : decision === EVoteDecision.NAY ? ['no', 'abstain'] : ['abstain'];
	}

	protected static convertSubsquidVoteDecisionToVoteDecision({ decision }: { decision: string }): EVoteDecision {
		return decision === 'yes' ? EVoteDecision.AYE : decision === 'no' ? EVoteDecision.NAY : (decision as EVoteDecision);
	}

	protected static getVoteBalanceValueForVoteHistory({
		balance,
		decision
	}: {
		balance: { value?: string; aye?: string; nay?: string; abstain?: string };
		decision: EVoteDecision;
	}): string {
		if (decision === EVoteDecision.AYE) {
			return balance?.value || balance?.aye || '0';
		}

		if (decision === EVoteDecision.NAY) {
			return balance?.value || balance?.nay || '0';
		}

		return balance?.abstain || '0';
	}

	protected static getSelfVotingPower({ balance, selfVotingPower, lockPeriod }: { balance: string; selfVotingPower: string | null; lockPeriod: null | number }): string {
		if (new BN(selfVotingPower || '0').gt(BN_ZERO)) return selfVotingPower || '0';
		if (lockPeriod === null) {
			return balance;
		}
		return lockPeriod ? new BN(balance).mul(new BN(lockPeriod)).toString() : new BN(balance).div(DEFAULT_LOCK_PERIOD_DIVISOR).toString();
	}

	protected static getOrderByForSubsquid({ orderBy }: { orderBy?: EVoteSortOptions }): EVoteSortOptions[] {
		switch (orderBy) {
			case EVoteSortOptions.BalanceValueASC:
				return [EVoteSortOptions.BalanceValueASC, EVoteSortOptions.IdASC];
			case EVoteSortOptions.BalanceValueDESC:
				return [EVoteSortOptions.BalanceValueDESC, EVoteSortOptions.IdDESC];
			case EVoteSortOptions.SelfVotingPowerASC:
				return [EVoteSortOptions.SelfVotingPowerASC, EVoteSortOptions.IdASC];
			case EVoteSortOptions.SelfVotingPowerDESC:
				return [EVoteSortOptions.SelfVotingPowerDESC, EVoteSortOptions.IdDESC];
			case EVoteSortOptions.DelegatedVotingPowerASC:
				return [EVoteSortOptions.DelegatedVotingPowerASC, EVoteSortOptions.IdASC];
			case EVoteSortOptions.DelegatedVotingPowerDESC:
				return [EVoteSortOptions.DelegatedVotingPowerDESC, EVoteSortOptions.IdDESC];
			case EVoteSortOptions.TimestampASC:
				return [EVoteSortOptions.TimestampASC, EVoteSortOptions.IdASC];
			default:
				return [EVoteSortOptions.CreatedAtBlockDESC, EVoteSortOptions.IdDESC];
		}
	}

	protected static getVotingPower(balance: string, lockPeriod: number): BN {
		return lockPeriod ? new BN(balance).mul(new BN(lockPeriod)) : new BN(balance).div(DEFAULT_LOCK_PERIOD_DIVISOR);
	}

	protected static getNestedVoteVotingPower(delegatedVotingPower: string, selfVotingPower: string): BN | null {
		const value = new BN(selfVotingPower || BN_ZERO?.toString()).add(new BN(delegatedVotingPower || BN_ZERO?.toString()));
		return value.gt(BN_ZERO) ? value : null;
	}

	protected static getVotesAnalytics({ votes, type }: { votes: IFlattenedConvictionVote[]; type: Exclude<EAnalyticsType, EAnalyticsType.ACCOUNTS> }): IAnalytics {
		const analytics: IAnalytics = {
			aye: '0',
			nay: '0',
			abstain: '0',
			delegated: '0',
			solo: '0',
			support: '0',
			timeSplitVotes: [],
			votesByConviction: [],
			delegationVotesByConviction: []
		};

		let totalAye = BN_ZERO;
		let totalNay = BN_ZERO;

		votes.forEach((vote) => {
			const balance = new BN(vote.balance?.value || vote.balance.abstain || '0');
			const voteBalance = type === EAnalyticsType.CONVICTIONS ? this.getVotingPower(balance.toString(), vote.lockPeriod) : balance;

			if (vote.decision === EVoteDecision.AYE) {
				analytics.aye = new BN(analytics.aye).add(new BN(voteBalance)).toString();

				totalAye = totalAye.add(balance);

				analytics.support = new BN(analytics.support).add(balance).toString();
			} else {
				if (vote.decision === EVoteDecision.NAY) {
					analytics.nay = new BN(analytics.nay).add(new BN(voteBalance)).toString();
				} else if (vote.decision === EVoteDecision.ABSTAIN) {
					analytics.abstain = new BN(analytics.abstain).add(new BN(voteBalance)).toString();

					analytics.support = new BN(analytics.support).add(balance).toString();
				}
				totalNay = totalNay.add(balance);
			}

			// delegation votes
			if (vote.isDelegated) {
				analytics.delegated = new BN(analytics.delegated).add(new BN(voteBalance)).toString();
			} else {
				analytics.solo = new BN(analytics.solo).add(new BN(voteBalance)).toString();
			}

			// time split votes
			analytics.timeSplitVotes = this.processTimeSplitVotes({ vote, convictionVote: voteBalance, timeSplitVotes: analytics.timeSplitVotes });

			// conviction votes
			analytics.votesByConviction = this.processConvictionVote({ vote, balance: voteBalance, convictionsVotes: analytics.votesByConviction });
			analytics.delegationVotesByConviction = this.processDelegationVote({ vote, balance: voteBalance, delegationVotes: analytics.delegationVotesByConviction });
		});
		// turnout //todo:
		// analytics.turnout = new BN(totalAye).add(new BN(totalNay)).toString();

		return analytics;
	}

	protected static getAccountsAnalytics({ votes }: { votes: IFlattenedConvictionVote[] }): IAccountAnalytics {
		const analytics: IAccountAnalytics = {
			abstain: 0,
			aye: 0,
			nay: 0,
			delegated: 0,
			solo: 0,
			support: '0',
			timeSplitVotes: [],
			votesByConviction: [],
			delegationVotesByConviction: []
		};

		let totalAye = BN_ZERO;
		let totalNay = BN_ZERO;

		votes.forEach((vote) => {
			const balance = new BN(vote.balance?.value || vote.balance.abstain || '0');
			const increment = vote.isDelegated ? 0 : 1;

			if (vote.decision === EVoteDecision.AYE) {
				analytics.aye += increment;

				totalAye = totalAye.add(balance);

				analytics.support = new BN(analytics.support).add(balance).toString();
			} else {
				if (vote.decision === EVoteDecision.NAY) {
					analytics.nay += increment;
				} else if (vote.decision === EVoteDecision.ABSTAIN) {
					analytics.abstain += increment;
				}
				totalNay = totalNay.add(balance);
			}

			// delegation votes
			if (vote.isDelegated) {
				analytics.delegated += 1;
			} else {
				analytics.solo += 1;
			}

			// time split votes
			analytics.timeSplitVotes = this.processTimeSplitVotesForAccount({ vote, timeSplitVotes: analytics.timeSplitVotes });

			// conviction votes
			analytics.votesByConviction = this.processConvictionVotesForAccount({ vote, convictionVotes: analytics.votesByConviction });
			analytics.delegationVotesByConviction = this.processDelegationVotesForAccount({ vote, delegationVotes: analytics.delegationVotesByConviction });
		});

		// turnout todo:
		// analytics.turnout = new BN(totalAye).add(new BN(totalNay)).toString();

		return analytics;
	}

	/**
	 * Calculates the maximum voting power across all tracks for a delegate
	 * @param delegations - Array of voting delegation objects for a specific delegate
	 * @returns Maximum voting power as string
	 */
	protected static calculateMaxTrackVotingPower(delegations: Array<{ balance: string; lockPeriod: number; track?: number; trackNumber?: number }>): string {
		if (!delegations.length) return '0';

		// Group delegations by track and calculate voting power per track
		const trackPowerMap = new Map<number, BN>();

		delegations.forEach((delegation) => {
			const track = delegation.track ?? delegation.trackNumber ?? 0;
			const votingPower = this.getVotingPower(delegation.balance, delegation.lockPeriod);

			const currentPower = trackPowerMap.get(track) || BN_ZERO;
			trackPowerMap.set(track, currentPower.add(votingPower));
		});

		// Find maximum voting power across all tracks
		const trackPowers = Array.from(trackPowerMap.values());
		const maxVotingPower = trackPowers.reduce((max, current) => (current.gt(max) ? current : max), BN_ZERO);

		return maxVotingPower.toString();
	}
}
