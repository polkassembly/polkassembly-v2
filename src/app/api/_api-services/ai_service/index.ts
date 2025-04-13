// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ECommentSentiment, ENetwork, EProposalType, IBeneficiary, IComment, ICommentResponse, IContentSummary, IOnChainPostInfo, ICrossValidationResult } from '@/_shared/types';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { StatusCodes } from 'http-status-codes';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { AI_SERVICE_URL, IS_AI_ENABLED } from '../../_api-constants/apiEnvVars';
import { OffChainDbService } from '../offchain_db_service';
import { OnChainDbService } from '../onchain_db_service';
import { APIError } from '../../_api-utils/apiError';
import { fetchPostData } from '../../_api-utils/fetchPostData';
import { RedisService } from '../redis_service';

if (!IS_AI_ENABLED) {
	console.log('\n ℹ️ Info: AI service is not enabled, AI content will not be generated and/or included in the api data\n');
}

if (IS_AI_ENABLED && !AI_SERVICE_URL.trim()) {
	throw new APIError(ERROR_CODES.INTERNAL_SERVER_ERROR, StatusCodes.INTERNAL_SERVER_ERROR, 'AI_SERVICE_URL is not set');
}

// TODO: add a retry mechanism for every AI call

export class AIService {
	private static AI_SERVICE_URL = AI_SERVICE_URL;

	private static BASE_PROMPTS = {
		POST_SUMMARY: `
    You are a helpful assistant that summarizes Polkadot governance posts.
    Create a concise technical summary using only short bullet points (1-2 lines max) covering:
    - Main objective/purpose
    - Funding amounts and beneficiaries (if any)
    - Technical changes or implementations
    - Ecosystem impact
    - Key stakeholders or beneficiaries (if any)

    STRICT RULES:
    - Return ONLY bullet points in markdown format
    - Each bullet point must be 1-2 lines maximum
    - No introductory text or commentary
    - Use technical/blockchain terminology appropriately
    - Keep information factual and objective
		- Give priority to other sections over the user provided description for factual information like proposer, amounts, beneficiaries
    `,
		COMMENTS_SUMMARY: `
    You are a helpful assistant that summarizes discussions on Polkadot governance proposals.
    Analyze the sentiment and provide a breakdown in the following format:

    ### Users feeling optimistic say: [Summarize main positive points if any]

    ### Users feeling neutral say: [Summarize neutral/questioning points if any]

    ### Users feeling against say: [Summarize main concerns if any]

    ### Key questions from the community:
    - [List main questions]

    STRICT RULES: 
		- Respond ONLY with the markdown formatted analysis. Do not include any introductory text, acknowledgments, or additional commentary.
		- Format the response in markdown and maintain objectivity in the analysis.
    `,
		CONTENT_SPAM_CHECK: `
    You are a helpful assistant that evaluates Polkadot governance content for spam.
    Return only 'true' if the content matches any spam criteria, or 'false' if it's legitimate content.

    Check for:
    - Irrelevant promotional content
    - Off-topic discussions
    - Duplicate proposals
    - Malicious links
    - Impersonation attempts
    - Low-quality or automated content
    - Cryptocurrency scams or unauthorized token promotions
    - Phishing attempts
    - Excessive cross-posting
    - Unrelated commercial advertising

    STRICT RULES:
    - Consider the technical nature of governance discussions when evaluating.
    - A post being controversial or having strong opinions does not make it spam.
    - Return ONLY ONE WORD, either 'true' or 'false' without ANY additional text or explanation.
		`,
		COMMENT_SENTIMENT_ANALYSIS: `
		You are a helpful assistant that analyzes the sentiment of given comment on a post on the Polkadot governance forum Polkassembly.
		Return the sentiment as either 'against', 'slightly_against', 'neutral', 'slightly_for', or 'for'.

		STRICT RULES:
		- Return ONLY ONE WORD either 'against', 'slightly_against', 'neutral', 'slightly_for', or 'for'.
		`,
		POST_CONTENT_EXTRACTION: `
		You are a helpful assistant that extracts the content of a given post on the Polkadot governance forum Polkassembly.
		Return the following in a JSON format:
		{
			"beneficiaries": [address1, address2, ...],
			"proposer": "proposer address",
		}

		STRICT RULES:
		- Return ONLY the JSON format.
		`
	} as const;

	private static async getAIResponse(prompt: string): Promise<string | null> {
		if (!IS_AI_ENABLED) {
			return null;
		}

		try {
			const response = await fetch(this.AI_SERVICE_URL, {
				method: 'POST',
				body: JSON.stringify({ text: prompt }),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			const { response: aiResponse = '' } = await response.json();

			if (!response.ok) {
				console.log('AI service returned non-OK status', response.status);
				return null;
			}

			if (!aiResponse.trim()) {
				console.log('AI service returned empty response');
				return null;
			}

			console.log('AI Service Response', {
				prompt,
				response: aiResponse
			});

			return aiResponse;
		} catch (error) {
			console.error('Error in generating AI response', error);
			return null;
		}
	}

	private static async getPostSummary({
		network,
		content,
		title,
		additionalData
	}: {
		network: ENetwork;
		content?: string;
		title?: string;
		additionalData: { proposer?: string; proposalType?: EProposalType; preimageArgs?: Record<string, unknown>; onChainDescription?: string; beneficiaries?: IBeneficiary[] };
	}): Promise<string | null> {
		if (!content && !additionalData.onChainDescription && !additionalData.preimageArgs && !additionalData.beneficiaries?.length) {
			return null;
		}

		// Construct the complete prompt with context and available data
		let fullPrompt = `${this.BASE_PROMPTS.POST_SUMMARY}\n\nAnalyze the following content:\n\n`;

		if (additionalData.proposalType) {
			fullPrompt += `### Proposal Type:\n${additionalData.proposalType}\n\n`;
		}

		if (title) {
			fullPrompt += `### Title:\n${title}\n\n`;
		}

		if (content) {
			fullPrompt += `### User Provided Description:\n${content}\n\n`;
		}

		if (additionalData.proposer) {
			fullPrompt += `### Proposer:\n${additionalData.proposer}\n\n`;
		}

		if (additionalData.onChainDescription) {
			fullPrompt += `### On-chain Description:\n${additionalData.onChainDescription}\n\n`;
		}

		if (additionalData.preimageArgs && Object.keys(additionalData.preimageArgs).length) {
			fullPrompt += `### Technical Preimage Args:\n${JSON.stringify(additionalData.preimageArgs)}\n\n`;
		}

		if (additionalData.beneficiaries?.length) {
			fullPrompt += `### Beneficiaries:\n${additionalData.beneficiaries
				.map((beneficiary) => {
					try {
						const balanceStr = formatBnBalance(beneficiary.amount, { withUnit: true, numberAfterComma: 2, compactNotation: true }, network, beneficiary.assetId);

						return `${beneficiary.address} (Amount: ${balanceStr})`;
					} catch {
						// Fallback to basic format if asset lookup or formatting fails
						return `${beneficiary.address} (Amount: ${beneficiary.amount || 'Not specified'})`;
					}
				})
				.join(', ')}\n\n`;
		}

		const summaryResponse = await this.getAIResponse(fullPrompt);

		if (!summaryResponse?.trim()) {
			console.log('No summary response from AI');
			return null;
		}

		return summaryResponse;
	}

	private static async getCommentsSummary({
		network,
		proposalType,
		postIndexOrHash,
		comments
	}: {
		network: ENetwork;
		proposalType: EProposalType;
		postIndexOrHash: string;
		comments: ICommentResponse[];
	}): Promise<string | null> {
		if (!comments?.length) {
			return null;
		}

		// Construct the prompt
		let fullPrompt = `${this.BASE_PROMPTS.COMMENTS_SUMMARY}\n\n`;

		// fetch post content
		const post = await fetchPostData({ network, proposalType, indexOrHash: postIndexOrHash });

		if (post.content) {
			fullPrompt += `For a post with the following content:\n${post.content}\n\n`;
		}

		fullPrompt += 'Analyze the following comments:\n';

		comments.forEach((comment, index) => {
			fullPrompt += `### Comment ${index + 1}:\n${comment.content}\n\n`;
		});

		const summaryResponse = await this.getAIResponse(fullPrompt);

		if (!summaryResponse?.trim()) {
			console.log('No summary response from AI');
			return null;
		}

		return summaryResponse;
	}

	private static async getContentSpamCheck({ mdContent, title }: { mdContent?: string; title?: string }): Promise<boolean | null> {
		if (!mdContent && !title) {
			return null;
		}

		// Construct the prompt with the content
		let fullPrompt = `${this.BASE_PROMPTS.CONTENT_SPAM_CHECK}\n\nAnalyze the following content:\n\n`;

		if (title) {
			fullPrompt += `\n\n### Title:\n${title}`;
		}

		if (mdContent) {
			fullPrompt += `\n\n### User Provided Description:\n${mdContent}\n\n`;
		}

		const response = await this.getAIResponse(fullPrompt);

		// extract the result from the response using regex
		const resultRegex = /(true|false)/;
		const result = response?.match(resultRegex)?.[0];

		if (!result || typeof result !== 'string' || !['true', 'false'].includes(result.toLowerCase())) {
			return null;
		}

		console.log('spam check response', response);

		return result.toLowerCase() === 'true';
	}

	private static async getCommentSentiment({ mdContent }: { mdContent: string }): Promise<ECommentSentiment | null> {
		if (!mdContent) {
			return null;
		}

		const fullPrompt = `${this.BASE_PROMPTS.COMMENT_SENTIMENT_ANALYSIS}\n\nAnalyze the following comment:\n\n${mdContent}\n\n`;

		const response = await this.getAIResponse(fullPrompt);

		// extract the sentiment from the response using regex
		const sentimentRegex = /(against|slightly_against|neutral|slightly_for|for)/;
		const sentiment = response?.match(sentimentRegex)?.[0];

		if (!sentiment || typeof sentiment !== 'string' || !['against', 'slightly_against', 'neutral', 'slightly_for', 'for'].includes(sentiment.toLowerCase())) {
			return null;
		}

		return sentiment as ECommentSentiment;
	}

	/**
	 * Validates the content of a post against the on-chain post info.
	 * Returns the validation result or null if validation process fails
	 */
	private static async validatePostContent({ mdContent, onChainPostInfo }: { mdContent?: string; onChainPostInfo?: IOnChainPostInfo }): Promise<ICrossValidationResult | null> {
		if (!mdContent || !onChainPostInfo) {
			return null;
		}

		let fullPrompt = `${this.BASE_PROMPTS.POST_CONTENT_EXTRACTION}\n\n`;

		fullPrompt += `\n\nExtract from the following content:\n${mdContent}\n\n`;

		const response = await this.getAIResponse(fullPrompt);

		if (!response) {
			return null;
		}

		// TODO: validate more fields, amount, assetId, etc.
		let beneficiaryAddresses: string[] = [];
		let proposerAddress: string = '';

		// check if response is a valid JSON
		try {
			// extract js object via regex in case there is noise in the response
			const jsonRegex = /{[\s\S]*?}/;
			const jsonResponse = response.match(jsonRegex)?.[0];

			if (!jsonResponse) {
				return null;
			}

			const { beneficiaries = null, proposer = null } = JSON.parse(jsonResponse);

			if (
				!beneficiaries ||
				!Array.isArray(beneficiaries) ||
				!proposer ||
				typeof proposer !== 'string' ||
				!ValidatorService.isValidWeb3Address(proposer) ||
				!beneficiaries.every((address) => ValidatorService.isValidWeb3Address(address))
			) {
				// invalid response from LLM
				return null;
			}

			if (beneficiaries && Array.isArray(beneficiaries)) {
				beneficiaryAddresses = beneficiaries.map((address) => (address.startsWith('0x') ? address : getSubstrateAddress(address))).filter((address) => address !== null);
			}

			if (proposer && typeof proposer === 'string' && ValidatorService.isValidWeb3Address(proposer)) {
				proposerAddress = proposer.startsWith('0x') ? proposer : getSubstrateAddress(proposer) || '';
			}
		} catch {
			// if response is not a valid JSON or the fields returned by the LLM are not valid, discard the response
			return null;
		}

		const validationResult: ICrossValidationResult = {
			beneficiaries: '',
			proposer: ''
		};

		if (beneficiaryAddresses.length !== (onChainPostInfo.beneficiaries?.length || 0)) {
			validationResult.beneficiaries += `Beneficiary addresses count mismatch. Found ${beneficiaryAddresses.length} in content but ${onChainPostInfo.beneficiaries?.length || 0} on-chain.`;
		}

		if (beneficiaryAddresses.some((address) => !onChainPostInfo.beneficiaries?.some((beneficiary) => beneficiary.address === address))) {
			const mismatchedAddresses = beneficiaryAddresses.filter((address) => !onChainPostInfo.beneficiaries?.some((beneficiary) => beneficiary.address === address));
			validationResult.beneficiaries += `Beneficiary addresses mismatch: ${mismatchedAddresses.join(', ')} not found in on-chain data.`;
		}

		if (proposerAddress !== onChainPostInfo.proposer) {
			validationResult.proposer += `Proposer address mismatch: found "${proposerAddress}" in content but "${onChainPostInfo.proposer}" on-chain.`;
		}

		return {
			beneficiaries: validationResult.beneficiaries || 'Valid',
			proposer: validationResult.proposer || 'Valid'
		};
	}

	static async UpdatePostSummary({ network, proposalType, indexOrHash }: { network: ENetwork; proposalType: EProposalType; indexOrHash: string }): Promise<IContentSummary | null> {
		const offChainPostData = await OffChainDbService.GetOffChainPostData({ network, indexOrHash, proposalType, getDefaultContent: false });

		let onChainPostInfo: IOnChainPostInfo | null = null;
		if (ValidatorService.isValidOnChainProposalType(proposalType)) {
			onChainPostInfo = await OnChainDbService.GetOnChainPostInfo({ network, indexOrHash, proposalType });
			if (!onChainPostInfo) {
				throw new APIError(ERROR_CODES.POST_NOT_FOUND_ERROR, StatusCodes.NOT_FOUND, 'Post not found');
			}
		}

		const postSummary = await this.getPostSummary({
			network,
			content: offChainPostData.content,
			title: offChainPostData.title,
			additionalData: {
				proposer: onChainPostInfo?.proposer,
				proposalType,
				preimageArgs: onChainPostInfo?.preimageArgs,
				onChainDescription: onChainPostInfo?.description,
				beneficiaries: onChainPostInfo?.beneficiaries
			}
		});

		const isSpam = await this.getContentSpamCheck({
			mdContent: offChainPostData.content,
			title: offChainPostData.title
		});

		const crossValidationResult = onChainPostInfo
			? await this.validatePostContent({
					mdContent: offChainPostData.content,
					onChainPostInfo
				})
			: null;

		// if neither of AI generated stuff is usable, don't update anything
		if (!postSummary?.trim() && !isSpam && !crossValidationResult) return null;

		// TODO: send appropriate notifications if content is spam or cross validation fails

		// check if content summary already exists
		const existingContentSummary = await OffChainDbService.GetContentSummary({ network, indexOrHash, proposalType });

		const updatedContentSummary: IContentSummary = {
			id: existingContentSummary?.id || '', // if new will be set by firestore
			network,
			indexOrHash,
			proposalType,
			...(postSummary && { postSummary }),
			...(isSpam && { isSpam }),
			...(existingContentSummary?.commentsSummary && { commentsSummary: existingContentSummary.commentsSummary }),
			createdAt: existingContentSummary?.createdAt || new Date(),
			updatedAt: new Date(),
			...(crossValidationResult && { crossValidationResult })
		};

		await OffChainDbService.UpdateContentSummary(updatedContentSummary);

		// clear cache for the content summary
		await RedisService.DeleteContentSummary({ network, indexOrHash, proposalType });

		return updatedContentSummary;
	}

	static async UpdatePostCommentsSummary({
		network,
		proposalType,
		indexOrHash,
		newCommentId
	}: {
		network: ENetwork;
		proposalType: EProposalType;
		indexOrHash: string;
		newCommentId?: string;
	}): Promise<IContentSummary | null> {
		const commentsTree = await OffChainDbService.GetPostComments({ network, indexOrHash, proposalType });

		const flattenedComments = commentsTree.flatMap((comment) => comment.children || [comment]);

		if (!flattenedComments.length) return null;

		// check if new comment is spam
		if (newCommentId) {
			const newComment = flattenedComments.find((comment) => comment.id === newCommentId);

			if (newComment) {
				const isSpam = await this.getContentSpamCheck({ mdContent: newComment.content });
				if (isSpam) {
					await OffChainDbService.UpdateComment({ commentId: newCommentId, content: newComment.content, isSpam });
				}
			}
		}

		const commentsSummary = await this.getCommentsSummary({ network, proposalType, postIndexOrHash: indexOrHash, comments: flattenedComments });

		if (!commentsSummary?.trim()) return null;

		const existingContentSummary = await OffChainDbService.GetContentSummary({ network, indexOrHash, proposalType });

		const updatedContentSummary: IContentSummary = {
			id: existingContentSummary?.id || '',
			network,
			indexOrHash,
			proposalType,
			...(commentsSummary && { commentsSummary }),
			createdAt: existingContentSummary?.createdAt || new Date(),
			updatedAt: new Date()
		};

		await OffChainDbService.UpdateContentSummary(updatedContentSummary);

		// clear cache for the content summary
		await RedisService.DeleteContentSummary({ network, indexOrHash, proposalType });

		return updatedContentSummary;
	}

	static async UpdateCommentSentiment(commentId: string): Promise<IComment | null> {
		const comment = await OffChainDbService.GetCommentById(commentId);

		if (!comment) return null;

		const sentiment = await this.getCommentSentiment({ mdContent: comment.content });

		if (!sentiment) return null;

		await OffChainDbService.UpdateComment({ commentId, content: comment.content, aiSentiment: sentiment });

		return {
			...comment,
			aiSentiment: sentiment
		};
	}
}
