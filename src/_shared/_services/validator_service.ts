// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { cryptoWaitReady, isEthereumAddress, signatureVerify } from '@polkadot/util-crypto';
import { BLACKLISTED_USERNAMES } from '@shared/_constants/blacklistedUsernames';
import { OFF_CHAIN_PROPOSAL_TYPES } from '@shared/_constants/offChainProposalTypes';
import { WEB3_AUTH_SIGN_MESSAGE } from '@shared/_constants/signMessage';
import { getSubstrateAddress } from '@shared/_utils/getSubstrateAddress';
import { getSubstrateAddressPublicKey } from '@shared/_utils/getSubstrateAddressPublicKey';
import { ELocales, ENetwork, EOffChainPostTopic, EProposalType, ETheme, EVoteDecision, EWallet } from '@shared/types';
import validator from 'validator';
import { recoverPersonalSignature } from '@metamask/eth-sig-util';
import { ON_CHAIN_PROPOSAL_TYPES } from '@shared/_constants/onChainProposalTypes';
import { BN, isHex } from '@polkadot/util';
import { NETWORKS_DETAILS } from '../_constants/networks';

const TAG_MAX_LENGTH = 20;
const TAG_MIN_LENGTH = 1;
export class ValidatorService {
	static isValidEmail(email: string): boolean {
		return !!email && validator.isEmail(email);
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
		// check if username is not blacklisted and matches the regex
		return username.length >= 2 && username.length <= 40 && !BLACKLISTED_USERNAMES.includes(username.toLowerCase());
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

	static isValidUserId(userId: unknown): boolean {
		return this.isValidNumber(userId) && Number(userId) > 0;
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

	static isValidNumber(number: unknown): boolean {
		return number !== null && number !== undefined && Number.isFinite(Number(number));
	}

	static isUrl(url: string): boolean {
		return !!url && validator.isURL(url);
	}

	static isValidTag(tag: string): boolean {
		return tag.length <= TAG_MAX_LENGTH && tag.length >= TAG_MIN_LENGTH && typeof tag === 'string';
	}

	static isValidOffChainPostTopic(topic: string): boolean {
		return Object.values(EOffChainPostTopic).includes(topic as EOffChainPostTopic);
	}

	static isValidAmount(amount: string): boolean {
		try {
			const bnAmount = new BN(amount);
			return bnAmount.gte(new BN(0));
		} catch {
			return false;
		}
	}

	static isValidVoteAmountsForDecision(amount: { abstain?: string; aye?: string; nay?: string }, decision: EVoteDecision): boolean {
		try {
			if (decision === EVoteDecision.AYE && !this.isValidAmount(amount.aye || '-1')) {
				throw new Error();
			}

			if (decision === EVoteDecision.NAY && !this.isValidAmount(amount.nay || '-1')) {
				throw new Error();
			}

			// abstain requires all three amounts
			if (
				decision === EVoteDecision.SPLIT_ABSTAIN &&
				(!this.isValidAmount(amount.abstain || '-1') || !this.isValidAmount(amount.aye || '-1') || !this.isValidAmount(amount.nay || '-1'))
			) {
				throw new Error();
			}

			// split requires aye or nay
			if (decision === EVoteDecision.SPLIT && (!this.isValidAmount(amount.aye || '-1') || !this.isValidAmount(amount.nay || '-1'))) {
				throw new Error();
			}

			return true;
		} catch {
			return false;
		}
	}

	static isValidAssetId(assetId: string, network: ENetwork): boolean {
		return Object.keys(NETWORKS_DETAILS[`${network}`].supportedAssets).includes(assetId);
	}

	static isValidPreimageHash(preimageHash: string): boolean {
		const bitLength = 256;
		return isHex(preimageHash, bitLength);
	}

	static isValidTrackNumber({ trackNum, network }: { trackNum: number; network: ENetwork }): boolean {
		const { trackDetails } = NETWORKS_DETAILS[`${network}`];
		const allTrackIds = Object.values(trackDetails).map((track) => track.trackId);
		return allTrackIds.includes(trackNum);
	}

	static isValidIndexOrHash(value: unknown): boolean {
		if (this.isValidNumber(value)) {
			return Number(value) >= 0;
		}
		if (typeof value === 'string') {
			return Boolean(value.trim()) && value.startsWith('0x');
		}
		return false;
	}

	static isValidTwitterHandle(handle: string): boolean {
		if (!handle || typeof handle !== 'string') return false;

		// Remove @ symbol if present
		const cleanHandle = handle.startsWith('@') ? handle.substring(1) : handle;

		// Twitter handle rules:
		// - 4-15 characters long
		// - Only alphanumeric characters and underscores
		// - Cannot start with a number
		const twitterHandleRegex = /^[a-zA-Z][a-zA-Z0-9_]{3,14}$/;

		return twitterHandleRegex.test(cleanHandle);
	}

	static isValidMatrixHandle(handle: string): boolean {
		if (!handle || typeof handle !== 'string') return false;

		// Matrix handle format: @username:domain.tld
		// Example: @alice:matrix.org

		// Remove @ symbol if present
		const cleanHandle = handle.startsWith('@') ? handle.substring(1) : handle;

		// Check if handle contains domain part
		if (!cleanHandle.includes(':')) return false;

		const [username, domain] = cleanHandle.split(':');

		// Username rules:
		// - 1-255 characters long
		// - Only alphanumeric characters, underscores, hyphens, and periods
		// - Cannot start or end with a period
		// - Cannot have consecutive periods
		// eslint-disable-next-line no-useless-escape
		const usernameRegex = /^[a-zA-Z0-9_\-]+(\.[a-zA-Z0-9_\-]+)*$/;

		// Domain rules:
		// - Valid domain format
		// - Cannot be empty
		const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*(\.[a-zA-Z0-9][a-zA-Z0-9-]*)*\.[a-zA-Z]{2,}$/;

		return usernameRegex.test(username) && domainRegex.test(domain);
	}
}
