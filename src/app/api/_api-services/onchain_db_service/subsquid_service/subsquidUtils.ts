// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-underscore-dangle */

import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { VOTING_PROPOSAL_STATUSES } from '@/_shared/_constants/votingProposalStatuses';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { ENetwork, EPostOrigin, EProposalStatus, IBeneficiary } from '@/_shared/types';
import { encodeAddress } from '@polkadot/util-crypto';
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
					assetId
				});
			}
		}
		// Handle multiple calls case
		else if (Array.isArray(args.calls)) {
			args.calls.forEach((call: any) => {
				if (!call.value) return;

				const { amount, beneficiary, assetKind } = call.value;
				const assetId = this.extractAssetId(assetKind);
				const address = this.extractBeneficiaryAddress(beneficiary);

				if (address && amount) {
					result.push({
						address,
						amount: amount.toString(),
						assetId
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
			const blockTime = networkDetails?.blockTime || 6000; // Default 6s if not found
			const trackData = networkDetails?.tracks[origin as keyof typeof networkDetails.tracks];

			if (!trackData) {
				console.error('Track data not found for network:', network);
				return result;
			}

			// Calculate decision period end
			const decidingStatus = statusHistory.find((status) => VOTING_PROPOSAL_STATUSES.includes(status.status));
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
}
