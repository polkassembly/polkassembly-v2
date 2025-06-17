// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-underscore-dangle */

import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { ENetwork, EPostOrigin, EProposalStatus, EVoteDecision, EVoteSortOptions, IBeneficiary } from '@/_shared/types';
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
const DEFAULT_LOCK_PERIOD = new BN('10').div(new BN('100'));

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

		// Handle V3/V4 nested interior case
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
		return new BN(balance).mul(!lockPeriod ? DEFAULT_LOCK_PERIOD : new BN(lockPeriod)).toString();
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
}
