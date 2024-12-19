// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { cryptoWaitReady, isEthereumAddress, signatureVerify } from '@polkadot/util-crypto';
import { BLACKLISTED_USERNAMES } from '@shared/_constants/blacklistedUsernames';
import { OFF_CHAIN_PROPOSAL_TYPES } from '@shared/_constants/offChainProposalTypes';
import { WEB3_AUTH_SIGN_MESSAGE } from '@shared/_constants/signMessage';
import { getSubstrateAddress } from '@shared/_utils/getSubstrateAddress';
import { getSubstrateAddressPublicKey } from '@shared/_utils/getSubstrateAddressPublicKey';
import { ELocales, ENetwork, EProposalType, ETheme, EWallet } from '@shared/types';
import validator from 'validator';
import { recoverPersonalSignature } from '@metamask/eth-sig-util';
import { ON_CHAIN_PROPOSAL_TYPES } from '@shared/_constants/onChainProposalTypes';

export class ValidatorService {
	static isValidEmail(email: string): boolean {
		return validator.isEmail(email);
	}

	static isValidNetwork(network: string): boolean {
		return Object.values(ENetwork).includes(network as ENetwork);
	}

	static isValidTheme(theme: string): boolean {
		return Object.values(ETheme).includes(theme as ETheme);
	}

	static isValidLocale(locale: string): boolean {
		return Object.values(ELocales).includes(locale as ELocales);
	}

	static isValidUsername(username: string): boolean {
		const regexp = /^[A-Za-z0-9]{1}[A-Za-z0-9.-_]{2,29}$/;
		// check if username is not blacklisted and matches the regex
		return regexp.test(username) && !BLACKLISTED_USERNAMES.includes(username.toLowerCase());
	}

	static isValidPassword(password: string): boolean {
		return password.length >= 6;
	}

	static isValidSubstrateAddress(address: string): boolean {
		return getSubstrateAddress(address) !== null;
	}

	static isValidProposalType(proposalType: string): boolean {
		return Object.values(EProposalType).includes(proposalType as EProposalType);
	}

	static isValidOffChainProposalType(proposalType: string): boolean {
		return OFF_CHAIN_PROPOSAL_TYPES.includes(proposalType as EProposalType);
	}

	static isValidOnChainProposalType(proposalType: string): boolean {
		return ON_CHAIN_PROPOSAL_TYPES.includes(proposalType as EProposalType);
	}

	static isValidWallet(wallet: string): boolean {
		return Object.values(EWallet).includes(wallet as EWallet);
	}

	static isValidEVMAddress(address: string): boolean {
		return isEthereumAddress(address);
	}

	static async isValidSubstrateSignature(address: string, signature: string): Promise<boolean> {
		try {
			if (!this.isValidSubstrateAddress(address)) {
				return false;
			}

			const publicKey = await getSubstrateAddressPublicKey(address);

			await cryptoWaitReady();
			return signatureVerify(WEB3_AUTH_SIGN_MESSAGE, signature, publicKey).isValid;
		} catch {
			return false;
		}
	}

	static isValidEVMSignature(address: string, signature: string): boolean {
		if (!this.isValidEVMAddress(address)) {
			return false;
		}

		try {
			const msgParams = {
				data: WEB3_AUTH_SIGN_MESSAGE,
				signature
			};

			const recovered = recoverPersonalSignature(msgParams);

			return `${recovered}`.toLowerCase() === `${address}`.toLowerCase();
		} catch {
			return false;
		}
	}

	static isValidUserId(userId: number): boolean {
		return !isNaN(userId) && userId >= 0;
	}

	static isValidWeb3Address(address: string): boolean {
		return this.isValidEVMAddress(address) || this.isValidSubstrateAddress(address);
	}
}
