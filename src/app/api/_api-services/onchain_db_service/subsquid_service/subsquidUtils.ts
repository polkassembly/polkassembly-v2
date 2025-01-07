// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-underscore-dangle */

import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { ENetwork, EPostOrigin, EProposalStatus, IBeneficiary } from '@/_shared/types';
import { encodeAddress } from '@polkadot/util-crypto';

interface IStatusHistory {
	status: EProposalStatus;
	timestamp: string;
}

export class SubsquidUtils {
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
	public static extractAmountAndAssetId(args: any): IBeneficiary[] {
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

	public static getDecisionPeriodEnd(statusHistory: IStatusHistory[], network: ENetwork, origin: EPostOrigin): Date | null {
		try {
			// Find deciding status block
			const decidingStatus = statusHistory.find((status) => status.status === EProposalStatus.Deciding || status.status === EProposalStatus.DecisionDepositPlaced);
			if (!decidingStatus?.timestamp) {
				return null;
			}

			// Get block time and track data from network properties
			const networkDetails = NETWORKS_DETAILS[network as ENetwork];
			const blockTime = networkDetails?.blockTime || 6000; // Default 6s if not found
			const decisionPeriod = networkDetails?.tracks[origin as keyof typeof networkDetails.tracks]?.decisionPeriod;

			if (!decisionPeriod) {
				console.error('Decision period not found for network:', network);
				return null;
			}

			// Convert decision period blocks to milliseconds
			const decisionPeriodMs = Number(decisionPeriod) * blockTime;

			// Calculate end date by adding decision period to deciding timestamp
			const decidingStartDate = dayjs(decidingStatus.timestamp);
			const endDate = decidingStartDate.add(decisionPeriodMs, 'millisecond');

			return endDate.toDate();
		} catch (error) {
			console.error('Error calculating decision period end:', error);
			return null;
		}
	}

	public static getPreparePeriodEnd(statusHistory: IStatusHistory[], network: ENetwork, origin: EPostOrigin): Date | null {
		try {
			// Find submitted status block
			const submittedStatus = statusHistory.find((status) => status.status === EProposalStatus.Submitted);
			if (!submittedStatus?.timestamp) {
				return null;
			}

			// Get block time and track data from network properties
			const networkDetails = NETWORKS_DETAILS[network as ENetwork];
			const blockTime = networkDetails?.blockTime || 6000; // Default 6s if not found
			const preparePeriod = networkDetails?.tracks[origin as keyof typeof networkDetails.tracks]?.preparePeriod;

			if (!preparePeriod) {
				console.error('Prepare period not found for network:', network);
				return null;
			}

			// Convert prepare period blocks to milliseconds
			const preparePeriodMs = Number(preparePeriod) * blockTime;

			// Calculate end date by adding prepare period to submitted timestamp
			const submittedStartDate = dayjs(submittedStatus.timestamp);
			const endDate = submittedStartDate.add(preparePeriodMs, 'millisecond');

			return endDate.toDate();
		} catch (error) {
			console.error('Error calculating prepare period end:', error);
			return null;
		}
	}

	public static getConfirmationPeriodEnd(statusHistory: IStatusHistory[], network: ENetwork, origin: EPostOrigin): Date | null {
		try {
			// Find confirm started status block
			const confirmStartedStatus = statusHistory.find((status) => status.status === EProposalStatus.ConfirmStarted);
			if (!confirmStartedStatus?.timestamp) {
				return null;
			}

			// Get block time and track data from network properties
			const networkDetails = NETWORKS_DETAILS[network as ENetwork];
			const blockTime = networkDetails?.blockTime || 6000; // Default 6s if not found
			const confirmPeriod = networkDetails?.tracks[origin as keyof typeof networkDetails.tracks]?.confirmPeriod;

			if (!confirmPeriod) {
				console.error('Confirm period not found for network:', network);
				return null;
			}

			// Convert confirm period blocks to milliseconds
			const confirmPeriodMs = Number(confirmPeriod) * blockTime;

			// Calculate end date by adding confirm period to confirm started timestamp
			const confirmStartDate = dayjs(confirmStartedStatus.timestamp);
			const endDate = confirmStartDate.add(confirmPeriodMs, 'millisecond');

			return endDate.toDate();
		} catch (error) {
			console.error('Error calculating confirmation period end:', error);
			return null;
		}
	}
}
