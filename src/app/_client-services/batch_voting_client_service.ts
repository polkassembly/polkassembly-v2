// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EProposalType, EVoteDecision, EConvictionAmount } from '@/_shared/types';
import { BN } from '@polkadot/util';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { NextApiClientService } from './next_api_client_service';

export class BatchVotingClientService extends NextApiClientService {
	static getAmountForDecision({
		voteDecision,
		ayeNayValue,
		abstainValue,
		abstainAyeValue,
		abstainNayValue
	}: {
		voteDecision: EVoteDecision;
		ayeNayValue: BN;
		abstainValue: BN;
		abstainAyeValue: BN;
		abstainNayValue: BN;
	}) {
		return {
			...(voteDecision === EVoteDecision.AYE && { aye: ayeNayValue.toString() }),
			...(voteDecision === EVoteDecision.NAY && { nay: ayeNayValue.toString() }),
			...(voteDecision === EVoteDecision.SPLIT_ABSTAIN && { abstain: abstainValue.toString(), aye: abstainAyeValue.toString(), nay: abstainNayValue.toString() })
		};
	}

	static async getBatchVoteCart({ userId }: { userId: number }) {
		return this.getBatchVoteCartApi({ userId });
	}

	static async addToBatchVoteCart({
		userId,
		postIndexOrHash,
		proposalType,
		decision,
		amount,
		conviction
	}: {
		userId: number;
		postIndexOrHash: string;
		proposalType: EProposalType;
		decision: EVoteDecision;
		amount: { abstain?: string; aye?: string; nay?: string };
		conviction: EConvictionAmount;
	}) {
		if (!ValidatorService.isValidVoteAmountsForDecision(amount, decision)) {
			throw new Error('Invalid vote amounts');
		}

		return this.addToBatchVoteCartApi({ userId, postIndexOrHash, proposalType, decision, amount, conviction });
	}

	static async editBatchVoteCartItem({
		userId,
		id,
		decision,
		amount,
		conviction
	}: {
		userId: number;
		id: string;
		decision: EVoteDecision;
		amount: { abstain?: string; aye?: string; nay?: string };
		conviction: EConvictionAmount;
	}) {
		if (!ValidatorService.isValidVoteAmountsForDecision(amount, decision)) {
			throw new Error('Invalid vote amounts');
		}

		return this.editBatchVoteCartItemApi({ userId, id, decision, amount, conviction });
	}

	static async deleteBatchVoteCartItem({ userId, id }: { userId: number; id: string }) {
		return this.deleteBatchVoteCartItemApi({ userId, id });
	}

	static async clearBatchVoteCart({ userId }: { userId: number }) {
		return this.clearBatchVoteCartApi({ userId });
	}
}
