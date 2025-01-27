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
import { OutputData } from '@editorjs/editorjs';

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

	static async isValidSignatureForMessage(address: string, signature: string, message: string): Promise<boolean> {
		try {
			if (!this.isValidSubstrateAddress(address)) {
				return false;
			}

			const publicKey = await getSubstrateAddressPublicKey(address);

			await cryptoWaitReady();
			return signatureVerify(message, signature, publicKey).isValid;
		} catch {
			return false;
		}
	}

	static isValidUserId(userId: number): boolean {
		return !isNaN(userId) && userId > 0;
	}

	static isValidWeb3Address(address: string): boolean {
		return this.isValidEVMAddress(address) || this.isValidSubstrateAddress(address);
	}

	static isHTML(textRaw: string): boolean {
		let text = textRaw;

		// More comprehensive HTML detection
		if (!text || typeof text !== 'string') return false;

		// Strip comments and CDATA
		text = text.replace(/<!--[\s\S]*?-->/g, '').replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '');

		// Common HTML patterns
		const patterns = {
			tags: /<[a-z][\s\S]*>/i,
			entities: /&[a-z]+;/i,
			doctype: /<!DOCTYPE\s+html>/i,
			selfClosingTags: /<(?:area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr).*?>/i,
			attributes: /\s+[a-zA-Z-]+=(["']).*?\1/
		};

		// Check if text contains multiple HTML indicators
		const indicators = Object.values(patterns).filter((pattern) => pattern.test(text));
		return indicators.length >= 2; // Require at least 2 indicators for more confidence
	}

	static isMarkdown(
		text: string,
		options = {
			minIndicators: 2, // Minimum number of different Markdown elements required
			strictMode: false // If true, requires more precise pattern matching
		}
	): boolean {
		if (!text || typeof text !== 'string') return false;

		const markdownPatterns = {
			headers: {
				pattern: /^#{1,6}\s+[^\n]+$/m,
				strict: /^#{1,6}\s+[^\n]+$(?:\n|$)/m
			},
			emphasis: {
				pattern: /[*_]{1,2}[^*_\n]+[*_]{1,2}/,
				strict: /(?:^|\s)[*_]{1,2}[^*_\n]+[*_]{1,2}(?:\s|$)/
			},
			lists: {
				pattern: /^[\s]*[-*+]\s+[^\n]+/m,
				strict: /^[\s]*[-*+]\s+[^\n]+(?:\n|$)/m
			},
			numberedLists: {
				pattern: /^[\s]*\d+\.\s+[^\n]+/m,
				strict: /^[\s]*\d+\.\s+[^\n]+(?:\n|$)/m
			},
			blockquotes: {
				pattern: /^[\s]*>\s+[^\n]+/m,
				strict: /^[\s]*>\s+[^\n]+(?:\n|$)/m
			},
			codeBlocks: {
				pattern: /```[\s\S]*?```/,
				strict: /^```[\s\S]*?```$/m
			},
			inlineCode: {
				pattern: /`[^`]+`/,
				strict: /(?:^|\s)`[^`]+`(?:\s|$)/
			},
			links: {
				pattern: /\[([^\]]+)\]\(([^)]+)\)/,
				strict: /(?:^|\s)\[([^\]]+)\]\(([^)]+)\)(?:\s|$)/
			},
			images: {
				pattern: /!\[([^\]]*)\]\(([^)]+)\)/,
				strict: /(?:^|\s)!\[([^\]]*)\]\(([^)]+)\)(?:\s|$)/
			},
			tables: {
				pattern: /\|.*\|/,
				strict: /^\|.*\|$/m
			},
			horizontalRules: {
				pattern: /^[-*_]{3,}\s*$/m,
				strict: /^[-*_]{3,}\s*$/m
			}
		};

		// Count how many different Markdown elements are present
		let indicators = Object.values(markdownPatterns).reduce((count, patterns) => {
			const pattern = options.strictMode ? patterns.strict : patterns.pattern;
			return pattern.test(text) ? count + 1 : count;
		}, 0);

		// Additional checks for common Markdown structures
		const specialCases = [
			// Check for proper link references
			/^\[[^\]]+\]:\s*http[s]?:\/\/\S+$/m,
			// Check for footnotes
			/^\[\^[^\]]+\]:\s*[^\n]+$/m,
			// Check for task lists
			/^[\s]*[-*+]\s+\[[xX\s]\]\s+[^\n]+/m
		];

		specialCases.forEach((pattern) => {
			if (pattern.test(text)) indicators += 1;
		});

		// Additional validation for potential false positives
		const falsePositiveIndicators = [
			/^[A-Za-z0-9\s,.!?'"]+$/, // Only plain text
			/^[0-9\s.,]+$/ // Only numbers and spaces
		];

		const mightBePlainText = falsePositiveIndicators.some((pattern) => pattern.test(text));
		if (mightBePlainText && indicators < 2) return false;

		return indicators >= options.minIndicators;
	}

	// TODO: Add more checks for the content
	static isValidBlockContent(content: OutputData): boolean {
		return content.blocks.length > 0;
	}

	static isValidNumber(number: unknown): boolean {
		return number !== null && number !== undefined && Number.isFinite(Number(number));
	}
}
