// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ValidatorService } from '../_services/validator_service';
import { EProposalType } from '../types';
import { getSubstrateAddress } from './getSubstrateAddress';

export function getDefaultPostContent(proposalType: EProposalType, proposerAddress?: string): string {
	const isValidProposerAddress = proposerAddress && (ValidatorService.isValidSubstrateAddress(proposerAddress) || ValidatorService.isValidEVMAddress(proposerAddress));

	const address = isValidProposerAddress ? proposerAddress : '';

	return `This is a ${proposalType} post. It can only be edited by the proposer of the post ${address.toLowerCase().startsWith('0x') ? proposerAddress : getSubstrateAddress(address) || ''}.`;
}
