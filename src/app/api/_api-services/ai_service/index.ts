// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ECommentSentiment, ENetwork, EProposalType, IBeneficiary, IComment, ICommentResponse, IContentSummary, IOnChainPostInfo } from '@/_shared/types';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { StatusCodes } from 'http-status-codes';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { NON_SPAM_POSTS, SPAM_POSTS } from '@/_shared/_constants/spamDetectionExamples';
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
    - Your entire response must ONLY consist of markdown bullet points. DO NOT include any other text.
    - NEVER include any explanatory text, thinking, or commentary before or after the bullet points.
    - Start your response with the first bullet point immediately.
    - Each bullet point must be 1-2 lines maximum.
    - Use technical/blockchain terminology appropriately.
    - Keep information factual and objective.
    - Give priority to other sections over the user provided description for factual information like proposer, amounts, beneficiaries.
		- Give strict priority to the '### Beneficiaries' section over the '### Technical Preimage Arguments' section.
		- The '### Technical Preimage Arguments' section should only be used if the '### Beneficiaries' section is not available because the Technical Preimage Arguments do not contain formatted values.
    `,
		COMMENTS_SUMMARY: `
    You are a helpful assistant that summarizes discussions on Polkadot governance proposals.
    Analyze the sentiment and provide a breakdown in EXACTLY this format:

    ### Users feeling optimistic say: [Summarize main positive points if any]

    ### Users feeling neutral say: [Summarize neutral/questioning points if any]

    ### Users feeling against say: [Summarize main concerns if any]

    ### Key questions from the community:
    - [List main questions]

    STRICT RULES: 
		- Try to keep each section short and concise, but do not leave out any important information.
		- Try to keep it to a maximum of 2-3 sentences per section.
		- If a section has no content, include the heading but leave the content empty or write "None identified."
		- Your ENTIRE response must follow ONLY this markdown format with these exact section headers.
		- STRICTLY DO NOT include any introductory text, thinking, acknowledgments, or commentary before or after the analysis.
		- DO NOT explain your reasoning or include any meta-commentary about the analysis.
		- Begin your response directly with the first heading "Users feeling optimistic say".
    `,
		CONTENT_SPAM_CHECK: `
    You are a helpful assistant that evaluates Polkadot governance content for spam and scam.
    Return ONLY the word 'true' if the content matches any spam criteria, or ONLY the word 'false' if it's legitimate content.

    CHECK FOR:
    - Irrelevant promotional content
    - Off-topic discussions
    - Malicious links
    - Impersonation attempts
    - Low-quality or automated content
    - Cryptocurrency scams or unauthorized token promotions
    - Phishing attempts
    - Excessive cross-posting
    - Unrelated commercial advertising especially if it's not related to Polkadot governance or funding
		- Crypto recovery advertising
		- Gambling
		- Pornography
		- Illegal content
		- known spoof/fake/scam news websites
		- Known fake/scam news social media accounts
		- Airdrop and giveaway promises with no valid backing

		EXAMPLES FOR SPAM POSTS:
		${SPAM_POSTS.join('\n\n')}

		EXAMPLES FOR NON-SPAM POSTS:
		${NON_SPAM_POSTS.join('\n\n')}

		
    STRICT RULES:
    - Consider the technical nature of governance and funding discussions when evaluating.
    - A post being controversial or having strong opinions does not make it spam.
    - Your ENTIRE response must be EXACTLY one word: either 'true' or 'false'.
    - DO NOT include ANY explanations, reasoning, or additional words in your response.
		`,
		COMMENT_SENTIMENT_ANALYSIS: `
		You are a helpful assistant that analyzes the sentiment of given comment on a post on the Polkadot governance forum Polkassembly.
		Return the sentiment as ONLY one of these exact values: 'against', 'slightly_against', 'neutral', 'slightly_for', or 'for'.

		STRICT RULES:
		- Your ENTIRE response must be EXACTLY ONE WORD from the following list: 'against', 'slightly_against', 'neutral', 'slightly_for', or 'for'.
		- DO NOT include any explanations, reasoning, or additional text in your response.
		- DO NOT use quotation marks or any other characters around your response.
		`
	} as const;

	private static cleanPostSummaryResponse(response: string): string {
		// Keep only markdown bullet points
		let cleaned = response
			.split('\n')
			.filter((line: string) => line.trim().startsWith('- ') || line.trim().startsWith('* '))
			.join('\n');

		// Ensure the response starts with the 'Main objective/purpose' bullet point
		const mainObjectiveIndex = cleaned.toLowerCase().indexOf('main objective/purpose');
		if (mainObjectiveIndex !== -1) {
			// Find the start of the bullet point containing 'Main objective/purpose'
			const before = cleaned.toLowerCase().lastIndexOf('\n', mainObjectiveIndex);
			cleaned = cleaned.substring(before === -1 ? 0 : before + 1);
		}

		return cleaned;
	}

	private static cleanSingleWordResponse(response: string, validValues: string[]): string {
		// Extract the final response by looking from the end
		// This handles cases where AI includes reasoning before the final answer
		const lines = response.split('\n');
		// Find the last line that contains only a valid value
		for (let i = lines.length - 1; i >= 0; i -= 1) {
			const line = lines[Number(i)].trim().toLowerCase();
			if (validValues.includes(line)) {
				return line;
			}
		}
		return '';
	}

	private static cleanCommentsSummaryResponse(response: string): string {
		// Extract only the structured summary part, starting with the first heading
		const summaryStartMatch = response.match(/### Users feeling optimistic say:/);
		if (summaryStartMatch) {
			const startIndex = response.indexOf(summaryStartMatch[0]);
			return response.substring(startIndex);
		}
		return response;
	}

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

			// Clean the response based on which prompt was used
			let cleanedResponse = aiResponse;

			// Remove thinking tags
			cleanedResponse = cleanedResponse.replace(/<think>[\s\S]*?<\/think>/g, '');

			// Apply specific cleaning based on prompt type
			if (prompt.includes(this.BASE_PROMPTS.POST_SUMMARY)) {
				cleanedResponse = this.cleanPostSummaryResponse(cleanedResponse);
			} else if (prompt.includes(this.BASE_PROMPTS.COMMENT_SENTIMENT_ANALYSIS)) {
				const validSentiments = ['against', 'slightly_against', 'neutral', 'slightly_for', 'for'];
				cleanedResponse = this.cleanSingleWordResponse(cleanedResponse, validSentiments);
			} else if (prompt.includes(this.BASE_PROMPTS.CONTENT_SPAM_CHECK)) {
				const validSpamResponses = ['true', 'false'];
				cleanedResponse = this.cleanSingleWordResponse(cleanedResponse, validSpamResponses);
			} else if (prompt.includes(this.BASE_PROMPTS.COMMENTS_SUMMARY)) {
				cleanedResponse = this.cleanCommentsSummaryResponse(cleanedResponse);
			}

			return cleanedResponse;
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
			fullPrompt += `### Technical Preimage Arguments:\n${JSON.stringify(additionalData.preimageArgs)}\n\n`;
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
			fullPrompt += `\n\n### User Provided Content:\n${mdContent}\n\n`;
		}

		const response = await this.getAIResponse(fullPrompt);

		if (!response || !['true', 'false'].includes(response.toLowerCase())) {
			return null;
		}

		return response.toLowerCase() === 'true';
	}

	private static async getCommentSentiment({ mdContent }: { mdContent: string }): Promise<ECommentSentiment | null> {
		if (!mdContent) {
			return null;
		}

		const fullPrompt = `${this.BASE_PROMPTS.COMMENT_SENTIMENT_ANALYSIS}\n\nAnalyze the following comment:\n\n${mdContent}\n\n`;

		const response = await this.getAIResponse(fullPrompt);

		if (!response || !['against', 'slightly_against', 'neutral', 'slightly_for', 'for'].includes(response.toLowerCase())) {
			return null;
		}

		return response as ECommentSentiment;
	}

	static async GenerateAndUpdatePostSummary({
		network,
		proposalType,
		indexOrHash
	}: {
		network: ENetwork;
		proposalType: EProposalType;
		indexOrHash: string;
	}): Promise<IContentSummary | null> {
		console.log('Updating post summary', { network, proposalType, indexOrHash });

		const offChainPostData = await OffChainDbService.GetOffChainPostData({ network, indexOrHash, proposalType, getDefaultContent: false });

		// check if content summary already exists
		const existingContentSummary = await OffChainDbService.GetContentSummary({ network, indexOrHash, proposalType });

		let isSpam: boolean | null = null;

		// only check for spam if post is off-chain
		if (ValidatorService.isValidOffChainProposalType(proposalType)) {
			isSpam = await this.getContentSpamCheck({
				mdContent: offChainPostData.content,
				title: offChainPostData.title
			});

			console.log(`SPAM RESULT for ${proposalType} post ${offChainPostData.index} is ${isSpam}`);
		}

		// if post is spam, no need to generate post summary
		if (isSpam) {
			// TODO: send appropriate notifications if content is spam

			console.log(`SPAM DETECTED and DELETING for ${proposalType} post ${offChainPostData.index}`);

			await OffChainDbService.DeleteOffChainPost({ network, proposalType, index: offChainPostData.index! });

			const contentSummary: IContentSummary = {
				id: existingContentSummary?.id || '', // if new will be set by firestore
				network,
				indexOrHash,
				proposalType,
				isSpam: true,
				postSummary: 'This post is likely spam/scam/fake news',
				createdAt: existingContentSummary?.createdAt || new Date(),
				updatedAt: new Date()
			};

			await OffChainDbService.UpdateContentSummary(contentSummary);

			// Invalidate caches
			await RedisService.DeletePostData({ network, indexOrHash, proposalType });
			await RedisService.DeletePostsListing({ network, proposalType });
			await RedisService.DeleteActivityFeed({ network });
			await RedisService.DeleteOverviewPageData({ network });

			return contentSummary;
		}

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

		// if neither of AI generated stuff is usable, don't update anything
		if (!postSummary?.trim()) return null;

		const updatedContentSummary: IContentSummary = {
			id: existingContentSummary?.id || '', // if new will be set by firestore
			network,
			indexOrHash,
			proposalType,
			...(postSummary && { postSummary }),
			...(existingContentSummary?.commentsSummary && { commentsSummary: existingContentSummary.commentsSummary }),
			createdAt: existingContentSummary?.createdAt || new Date(),
			updatedAt: new Date()
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

		const flattenedComments = commentsTree.flatMap((comment) => (comment.children && comment.children.length ? comment.children : [comment]));

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
