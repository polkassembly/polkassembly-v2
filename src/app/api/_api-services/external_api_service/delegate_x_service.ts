// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EConvictionAmount, EProposalType, IDelegateXAccount } from '@/_shared/types';
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { naclDecrypt, blake2AsU8a } from '@polkadot/util-crypto';
import { stringToU8a, u8aToString } from '@polkadot/util';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { OffChainDbService } from '../offchain_db_service';

export class DelegateXService {
	static DELEGATE_X_API_BASE_URL = 'https://api.delegatex.com';

	// fetch data from DelegateX API
	static async fetchDelegateXStrategy(): Promise<unknown> {
		try {
			const url = new URL(`${this.DELEGATE_X_API_BASE_URL}/strategies`);

			const response = await fetch(url.toString(), {
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					'x-passcode': process.env.DELEGATE_X_SECRET || ''
				}
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch data from DelegateX API: ${response.statusText}`);
			}

			return await response.json();
		} catch (error) {
			console.error('Error fetching DelegateX data:', error);
			throw error;
		}
	}

	// create DelegateX Bot
	static async createDelegateXBot(userId: number, strategyId: string, contactLink?: string, signatureLink?: string): Promise<null | unknown> {
		if (this.DELEGATE_X_API_BASE_URL === 'https://api.delegatex.com') {
			return null;
		}
		try {
			const url = new URL(`${this.DELEGATE_X_API_BASE_URL}/create-bot`);

			const response = await fetch(url.toString(), {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					'x-passcode': process.env.DELEGATE_X_SECRET || ''
				},
				body: JSON.stringify({
					userId,
					strategyId,
					contactLink,
					signatureLink
				})
			});

			if (!response.ok) {
				throw new Error(`Failed to create DelegateX Bot: ${response.statusText}`);
			}

			return await response.json();
		} catch (error) {
			console.error('Error creating DelegateX Bot:', error);
			throw error;
		}
	}

	// vote on Proposal using polkadot.js api
	static async voteOnProposal(delegateXAccount: IDelegateXAccount, proposalId: string, decision: number): Promise<string> {
		try {
			// decrypt mnemonic
			const encryptedMnemonicU8a = stringToU8a(delegateXAccount.encryptedMnemonic);
			const nonceU8a = stringToU8a(delegateXAccount.nonce);
			// Hash the secret to ensure it's exactly 32 bytes (required by naclDecrypt)
			const secret = process.env.DELEGATE_X_SECRET || '';
			const secretKey = blake2AsU8a(stringToU8a(secret), 256);
			const mnemonic = naclDecrypt(encryptedMnemonicU8a, nonceU8a, secretKey);
			// create keyring
			const keyring = new Keyring({ type: 'sr25519' });
			const pair = keyring.addFromUri(u8aToString(mnemonic));
			const aye = decision === 1 ? true : decision === 0 ? false : null;
			if (aye === null) {
				throw new Error('Invalid decision value');
			}
			const vote = {
				Standard: {
					vote: {
						aye,
						conviction: EConvictionAmount.ZERO
					},
					balance: BigInt(0)
				}
			};

			const api = await ApiPromise.create({
				provider: new WsProvider(NETWORKS_DETAILS[delegateXAccount.network].rpcEndpoints[0].url)
			});

			await api.isReady;
			const tx = api.tx.convictionVoting.vote(proposalId, vote);
			const hash = await tx.signAndSend(pair);
			return hash.toHex();
		} catch (error) {
			console.error('Error voting on Proposal:', error);
			throw error;
		}
	}

	// save vote to database
	static async saveVote(
		delegateXAccountId: string,
		proposalId: string,
		hash: string,
		decision: number,
		reason: string[],
		comment: string,
		proposalType: EProposalType
	): Promise<unknown> {
		try {
			return await OffChainDbService.CreateVote({ delegateXAccountId, proposalId, hash, decision, reason, comment, proposalType });
		} catch (error) {
			console.error('Error saving vote:', error);
			throw error;
		}
	}
}
