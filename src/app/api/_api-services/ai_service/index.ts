// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { fetchPF } from '@/_shared/_utils/fetchPF';
import { ENetwork, EProposalType, IBeneficiary, ICommentResponse, IContentSummary, IOnChainPostInfo } from '@/_shared/types';
import { getAssetDataByIndexForNetwork } from '@/_shared/_utils/getAssetDataByIndexForNetwork';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { htmlAndMarkdownFromEditorJs } from '@/_shared/_utils/htmlAndMarkdownFromEditorJs';
import { StatusCodes } from 'http-status-codes';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { IS_AI_ENABLED } from '../../_api-constants/apiEnvVars';
import { OffChainDbService } from '../offchain_db_service';
import { OnChainDbService } from '../onchain_db_service';
import { APIError } from '../../_api-utils/apiError';

if (!IS_AI_ENABLED) {
	console.log(`
		\n========================== ==========================\n
		Info: AI service is not enabled, AI content will not be generated and/or included in the api data\n
		========================== ==========================\n
	`);
}

export class AIService {
	private static AI_SERVICE_URL = 'https://example.com';

	private static BASE_PROMPTS = {
		POST_SUMMARY: `
    You are a helpful assistant that summarizes Polkadot governance posts.
    Focus on key points like:
    - The proposal's main objective
    - Requested funding amounts (if any)
    - Technical changes proposed
    - Expected impact on the ecosystem
    - Key beneficiaries

    IMPORTANT: Respond ONLY with the markdown summary. Do not include any introductory text, acknowledgments, or additional commentary.
    Keep the summary concise and technical. Use blockchain terminology appropriately but do not overdo it.
    Format your response in markdown with appropriate headers and bullet points.
    `,
		COMMENTS_SUMMARY: `
    You are a helpful assistant that summarizes discussions on Polkadot governance proposals.
    Analyze the sentiment and provide a breakdown in the following format:

    Overall X% of users are feeling optimistic. [Summarize main positive points]

    Overall Y% of users are feeling neutral. [Summarize neutral/questioning points]

    Overall Z% of users are feeling against it. [Summarize main concerns]

    Important technical points raised:
    - [List key technical discussions]

    Key questions from the community:
    - [List main questions]

    IMPORTANT: Respond ONLY with the markdown formatted analysis. Do not include any introductory text, acknowledgments, or additional commentary.
    Format the response in markdown and maintain objectivity in the analysis.
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

    IMPORTANT: Return ONLY the word 'true' or 'false' without any additional text or explanation.
    Consider the technical nature of governance discussions when evaluating.
    A post being controversial or having strong opinions does not make it spam.
  `
	} as const;

	private static async getAIResponse(prompt: string): Promise<string | null> {
		if (!IS_AI_ENABLED) {
			return null;
		}

		const response = await fetchPF(this.AI_SERVICE_URL, {
			method: 'POST',
			body: JSON.stringify({ prompt })
		});

		if (!response.ok) {
			return null;
		}

		const data = await response.json();

		if (!data || typeof data !== 'string') {
			return null;
		}

		return data;
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
			fullPrompt += `### Main Content:\n${content}\n\n`;
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
						const assetData = beneficiary.assetId
							? getAssetDataByIndexForNetwork({
									network,
									generalIndex: beneficiary.assetId
								})
							: null;

						const amount = beneficiary.amount || 'Not specified';
						const assetSymbol = assetData ? `${assetData.symbol} (${assetData.name})` : NETWORKS_DETAILS[network as ENetwork].tokenSymbol;

						return `${beneficiary.address} (Amount: ${amount} ${assetSymbol})`;
					} catch {
						// Fallback to basic format if asset lookup fails
						return `${beneficiary.address} (Amount: ${beneficiary.amount || 'Not specified'})`;
					}
				})
				.join(', ')}\n\n`;
		}

		const summaryResponse = await this.getAIResponse(fullPrompt);

		// check if response is valid and is markdown
		if (!summaryResponse || !ValidatorService.isMarkdown(summaryResponse)) {
			return null;
		}

		return summaryResponse;
	}

	private static async getCommentsSummary({ comments }: { comments: ICommentResponse[] }): Promise<string | null> {
		if (!comments?.length) {
			return null;
		}

		// Construct the prompt with all comments
		let fullPrompt = `${this.BASE_PROMPTS.COMMENTS_SUMMARY}\n\nAnalyze the following comments:\n\n`;

		comments.forEach((comment, index) => {
			// Use markdown content if available, otherwise convert from content
			const commentText = comment.markdownContent || (comment.content ? htmlAndMarkdownFromEditorJs(comment.content).markdown : '');

			fullPrompt += `### Comment ${index + 1}:\n${commentText}\n\n`;
		});

		const summaryResponse = await this.getAIResponse(fullPrompt);

		// check if response is valid and is markdown
		if (!summaryResponse || !ValidatorService.isMarkdown(summaryResponse)) {
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
			fullPrompt += `\n\n### Main Content:\n${mdContent}\n\n`;
		}

		const response = await this.getAIResponse(fullPrompt);

		if (!response || typeof response !== 'string' || !['true', 'false'].includes(response.toLowerCase())) {
			return null;
		}

		// Check if response is exactly 'true' or 'false'
		return response?.toLowerCase() === 'true';
	}

	static async UpdatePostSummary({ network, proposalType, indexOrHash }: { network: ENetwork; proposalType: EProposalType; indexOrHash: string }): Promise<IContentSummary | null> {
		const offChainPostData = await OffChainDbService.GetOffChainPostData({ network, indexOrHash, proposalType });

		let onChainPostInfo: IOnChainPostInfo | null = null;
		if (ValidatorService.isValidOnChainProposalType(proposalType)) {
			onChainPostInfo = await OnChainDbService.GetOnChainPostInfo({ network, indexOrHash, proposalType });
			if (!onChainPostInfo) {
				throw new APIError(ERROR_CODES.POST_NOT_FOUND_ERROR, StatusCodes.NOT_FOUND, 'Post not found');
			}
		}

		const mdContent = offChainPostData.content ? htmlAndMarkdownFromEditorJs(offChainPostData.content).markdown : undefined;

		const postSummary = await this.getPostSummary({
			network,
			content: mdContent,
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
			mdContent,
			title: offChainPostData.title
		});

		if (!postSummary?.trim() && !isSpam) return null;

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
			updatedAt: new Date()
		};

		await OffChainDbService.UpdateContentSummary(updatedContentSummary);

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
				const isSpam = await this.getContentSpamCheck({ mdContent: newComment.markdownContent });
				if (isSpam) {
					await OffChainDbService.UpdateComment({ commentId: newCommentId, content: newComment.content, isSpam });
				}
			}
		}

		const commentsSummary = await this.getCommentsSummary({ comments: flattenedComments });

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

		return updatedContentSummary;
	}
}
