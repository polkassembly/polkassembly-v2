// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-underscore-dangle */

import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { ENetwork, EPostOrigin, EProposalStatus, IRequestedAssetData } from '@/_shared/types';
import { encodeAddress } from '@polkadot/util-crypto';

interface IAssetKind {
	assetId?: {
		value?: { interior?: { value?: any } };
		interior?: { value?: any };
	};
}

interface ICallValue {
	value?: {
		assetKind?: IAssetKind;
		beneficiary?: {
			value?: {
				interior?: {
					value?: { id?: string } | Array<{ id?: string }>;
				};
			};
		};
		amount?: string | number;
	};
}

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

		// Handle nested interior case
		const id = beneficiary?.value?.interior?.value?.id || beneficiary?.value?.interior?.value?.[0]?.id;
		if (id) {
			const substrateAddress = encodeAddress(id, 42);
			return substrateAddress || id;
		}
		return '';
	}

	/**
	 * Extracts asset information from call arguments
	 * @param args - Call arguments containing asset and beneficiary information
	 * @returns Extracted amounts, assetId and beneficiaries
	 */
	public static extractAmountAndAssetId(args: any): IRequestedAssetData {
		const result: IRequestedAssetData = {
			assetId: null,
			beneficiaries: [],
			amount: '0'
		};

		if (!args) return result;

		// Extract assetId
		const assetKind = args.assetKind as IAssetKind;
		const calls = Array.isArray(args.calls) ? (args.calls as ICallValue[]) : null;

		const interior = assetKind?.assetId?.value?.interior?.value || assetKind?.assetId?.interior?.value || calls?.[0]?.value?.assetKind?.assetId?.interior?.value;

		if (interior?.length) {
			const generalIndex = interior.find((item: any) => item?.__kind === 'GeneralIndex');
			result.assetId = generalIndex?.value?.toString() || null;
		}

		let requested = BigInt(0);

		// Handle direct amount
		if (args.amount) {
			requested = BigInt(args.amount);
			if (args.beneficiary) {
				const address = typeof args.beneficiary === 'string' ? args.beneficiary : SubsquidUtils.extractBeneficiaryAddress(args.beneficiary);

				result.beneficiaries.push({
					address,
					amount: args.amount.toString()
				});
			}
		}
		// Handle calls array
		else if (calls?.length && result.assetId) {
			calls.forEach((call) => {
				if (!call.value) return;

				const amount = BigInt(call.value.amount || 0);
				requested += amount;

				const address = SubsquidUtils.extractBeneficiaryAddress(call.value.beneficiary);
				if (address && amount) {
					result.beneficiaries.push({
						address,
						amount: amount.toString()
					});
				}
			});
		}

		result.amount = requested.toString();
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
}
