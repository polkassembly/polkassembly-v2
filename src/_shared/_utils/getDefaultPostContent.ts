// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { OutputData } from '@editorjs/editorjs';
import { ValidatorService } from '../_services/validator_service';
import { EProposalType } from '../types';
import { getSubstrateAddress } from './getSubstrateAddress';
import { EDITOR_JS_VERSION } from '../_constants/editorJsVersion';

export function getDefaultPostContent(proposalType: EProposalType, proposerAddress?: string): OutputData {
	const isValidProposerAddress = proposerAddress && (ValidatorService.isValidSubstrateAddress(proposerAddress) || ValidatorService.isValidEVMAddress(proposerAddress));

	const address = isValidProposerAddress ? proposerAddress : '';

	const content = `This is a ${proposalType} post. It can only be edited by the proposer of the post ${address.toLowerCase().startsWith('0x') ? proposerAddress : getSubstrateAddress(address) || ''}.`;

	return {
		time: new Date().getTime(),
		blocks: [
			{
				type: 'paragraph',
				data: { text: content }
			}
		],
		version: EDITOR_JS_VERSION
	};
}
