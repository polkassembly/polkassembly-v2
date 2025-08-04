// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalType, EGovType, ENetwork } from '@/_shared/types';

interface GetPostTypeUrlParams {
	proposalType: EProposalType;
	indexOrHash: string | number;
	network?: ENetwork;
	govType?: EGovType;
}

/**
 * Generates the appropriate URL for a post type based on governance type and proposal type
 * This function is scalable and handles different governance types (Gov1 vs Gov2)
 */
export const getPostTypeUrl = ({ proposalType, indexOrHash, network, govType = EGovType.OPENGOV }: GetPostTypeUrlParams): string => {
	const id = String(indexOrHash);

	// Handle Gov1 (legacy) governance type
	if (govType === EGovType.GOV_1) {
		switch (proposalType) {
			case EProposalType.DEMOCRACY_PROPOSAL:
				return `https://${network}-old.polkassembly.io/proposal/${id}`;
			case EProposalType.REFERENDUM:
				return `https://${network}-old.polkassembly.io/referendum/${id}`;
			case EProposalType.TREASURY_PROPOSAL:
				return `https://${network}-old.polkassembly.io/treasury/${id}`;
			case EProposalType.TIP:
				return `https://${network}-old.polkassembly.io/tip/${id}`;
			case EProposalType.COUNCIL_MOTION:
				return `https://${network}-old.polkassembly.io/motion/${id}`;
			case EProposalType.TECH_COMMITTEE_PROPOSAL:
				return `https://${network}-old.polkassembly.io/tech/${id}`;
			default:
				return `https://${network}-old.polkassembly.io/referendum/${id}`;
		}
	}

	// Handle Gov2 (OpenGov) governance type - current system
	switch (proposalType) {
		case EProposalType.DISCUSSION:
			return `/post/${id}`;
		case EProposalType.BOUNTY:
			return `/bounty/${id}`;
		case EProposalType.CHILD_BOUNTY:
			return `/child-bounty/${id}`;
		case EProposalType.ALLIANCE_MOTION:
		case EProposalType.ANNOUNCEMENT:
		case EProposalType.DEMOCRACY_PROPOSAL:
		case EProposalType.TECH_COMMITTEE_PROPOSAL:
		case EProposalType.TREASURY_PROPOSAL:
		case EProposalType.REFERENDUM:
		case EProposalType.FELLOWSHIP_REFERENDUM:
		case EProposalType.COUNCIL_MOTION:
		case EProposalType.TIP:
		case EProposalType.REFERENDUM_V2:
		case EProposalType.TECHNICAL_COMMITTEE:
		case EProposalType.COMMUNITY:
		case EProposalType.UPGRADE_COMMITTEE:
		case EProposalType.ADVISORY_COMMITTEE:
		case EProposalType.GRANT:
		default:
			// Default to referenda for all on-chain proposal types in Gov2
			return `/referenda/${id}`;
	}
};

/**
 * Generates the appropriate URL for a post type with query parameters
 */
export const getPostTypeUrlWithParams = (params: GetPostTypeUrlParams & { queryParams?: Record<string, string> }): string => {
	const baseUrl = getPostTypeUrl(params);

	if (!params.queryParams) {
		return baseUrl;
	}

	const queryString = new URLSearchParams(params.queryParams).toString();
	return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

/**
 * Generates the appropriate URL for a post type with a hash fragment
 */
export const getPostTypeUrlWithHash = (params: GetPostTypeUrlParams & { hash?: string }): string => {
	const baseUrl = getPostTypeUrl(params);

	if (!params.hash) {
		return baseUrl;
	}

	return `${baseUrl}#${params.hash}`;
};

/**
 * Helper function to get post URL with current network context
 * This is useful when you have access to the current network but want to use defaults
 */
export const getPostTypeUrlForCurrentNetwork = (params: Omit<GetPostTypeUrlParams, 'network' | 'govType'> & { network?: ENetwork }): string => {
	return getPostTypeUrl({
		...params,
		network: params.network,
		govType: EGovType.OPENGOV // Default to OpenGov for current system
	});
};
