// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import {
	EDataSource,
	ENetwork,
	EProposalType,
	EWallet,
	IOffChainPost,
	IUser,
	IUserTFADetails,
	IUserAddress,
	IComment,
	IReaction,
	EReaction,
	ICommentResponse,
	IPublicUser,
	IUserActivity,
	EActivityName,
	EActivityCategory,
	IActivityMetadata,
	EAllowedCommentor
} from '@shared/types';
import { DEFAULT_POST_TITLE } from '@/_shared/_constants/defaultPostTitle';
import { getDefaultPostContent } from '@/_shared/_utils/getDefaultPostContent';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { OutputData } from '@editorjs/editorjs';
import { htmlAndMarkdownFromEditorJs } from '@/_shared/_utils/htmlAndMarkdownFromEditorJs';
import { ON_CHAIN_ACTIVITY_NAMES } from '@/_shared/_constants/onChainActivityNames';
import { OFF_CHAIN_PROPOSAL_TYPES } from '@/_shared/_constants/offChainProposalTypes';
import { APIError } from '../../_api-utils/apiError';
import { SubsquareOffChainService } from './subsquare_offchain_service';
import { FirestoreService } from './firestore_service';
import { OnChainDbService } from '../onchain_db_service';

export class OffChainDbService {
	// Read methods
	static async GetTotalUsersCount(): Promise<number> {
		return FirestoreService.GetTotalUsersCount();
	}

	static async IsEmailInUse(email: string): Promise<boolean> {
		const userByEmail = await FirestoreService.GetUserByEmail(email);
		return Boolean(userByEmail);
	}

	static async IsUsernameInUse(username: string): Promise<boolean> {
		const userByUsername = await FirestoreService.GetUserByUsername(username);
		return Boolean(userByUsername);
	}

	static async GetUserByEmail(email: string): Promise<IUser | null> {
		return FirestoreService.GetUserByEmail(email);
	}

	static async GetUserByUsername(username: string): Promise<IUser | null> {
		return FirestoreService.GetUserByUsername(username);
	}

	static async GetPublicUserByUsername(username: string): Promise<IPublicUser | null> {
		return FirestoreService.GetPublicUserByUsername(username);
	}

	static async GetPublicUserByAddress(address: string): Promise<IPublicUser | null> {
		const formattedAddress = ValidatorService.isValidEVMAddress(address) ? address : getSubstrateAddress(address);
		if (!formattedAddress) throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Invalid address');
		return FirestoreService.GetPublicUserByAddress(formattedAddress);
	}

	static async GetUserById(userId: number): Promise<IUser | null> {
		return FirestoreService.GetUserById(userId);
	}

	static async GetUserByAddress(address: string): Promise<IUser | null> {
		return FirestoreService.GetUserByAddress(address);
	}

	static async GetAddressesForUserId(userId: number): Promise<IUserAddress[]> {
		return FirestoreService.GetAddressesForUserId(userId);
	}

	static async GetPublicUsers(page: number, limit: number): Promise<IPublicUser[]> {
		return FirestoreService.GetPublicUsers(page, limit);
	}

	static async GetOffChainPostData({
		network,
		indexOrHash,
		proposalType,
		proposer
	}: {
		network: ENetwork;
		indexOrHash: string;
		proposalType: EProposalType;
		proposer?: string;
	}): Promise<IOffChainPost> {
		let post: IOffChainPost | null = null;

		// 1. get post from firestore
		post = await FirestoreService.GetOffChainPostData({ network, indexOrHash, proposalType });

		// 2. if not found, get post from subsquare
		if (!post) {
			post = await SubsquareOffChainService.GetOffChainPostData({ network, indexOrHash, proposalType });
		}

		const firestorePostMetricsPromise = FirestoreService.GetPostMetrics({ network, indexOrHash, proposalType });
		const subsquarePostMetricsPromise = SubsquareOffChainService.GetPostMetrics({ network, indexOrHash, proposalType });

		const [firestorePostMetrics, subsquarePostMetrics] = await Promise.all([firestorePostMetricsPromise, subsquarePostMetricsPromise]);

		const postMetrics = {
			reactions: {
				like: firestorePostMetrics.reactions.like + subsquarePostMetrics.reactions.like,
				dislike: firestorePostMetrics.reactions.dislike + subsquarePostMetrics.reactions.dislike
			},
			comments: firestorePostMetrics.comments + subsquarePostMetrics.comments
		};

		if (post) {
			return {
				...post,
				metrics: postMetrics
			};
		}

		const content = getDefaultPostContent(proposalType, proposer);
		const { html, markdown } = htmlAndMarkdownFromEditorJs(content);

		return {
			index: proposalType !== EProposalType.TIP && indexOrHash.trim() !== '' && !isNaN(Number(indexOrHash)) ? Number(indexOrHash) : undefined,
			hash: proposalType === EProposalType.TIP ? indexOrHash : undefined,
			title: DEFAULT_POST_TITLE,
			content,
			htmlContent: html,
			markdownContent: markdown,
			tags: [],
			dataSource: EDataSource.POLKASSEMBLY,
			proposalType,
			network,
			metrics: postMetrics,
			allowedCommentor: EAllowedCommentor.ALL,
			isDeleted: false
		} as IOffChainPost;
	}

	static async GetOffChainPostsListing({
		network,
		proposalType,
		limit,
		page,
		tags
	}: {
		network: ENetwork;
		proposalType: EProposalType;
		limit: number;
		page: number;
		tags?: string[];
	}): Promise<IOffChainPost[]> {
		const posts = await FirestoreService.GetOffChainPostsListing({ network, proposalType, limit, page, tags });
		if (posts.length) return posts;

		if (tags?.length) {
			return [];
		}

		const subsquarePosts = await SubsquareOffChainService.GetOffChainPostsListing({ network, proposalType, limit, page });
		if (subsquarePosts.length) return subsquarePosts;

		return [];
	}

	static async GetTotalOffChainPostsCount({ network, proposalType, tags }: { network: ENetwork; proposalType: EProposalType; tags?: string[] }): Promise<number> {
		return FirestoreService.GetTotalOffChainPostsCount({ network, proposalType, tags });
	}

	static async GetPostComments({ network, indexOrHash, proposalType }: { network: ENetwork; indexOrHash: string; proposalType: EProposalType }): Promise<ICommentResponse[]> {
		const firestoreComments = await FirestoreService.GetPostComments({ network, indexOrHash, proposalType });
		const subsquareComments = await SubsquareOffChainService.GetPostComments({ network, indexOrHash, proposalType });

		// Combine all comments from both sources
		const allComments = [...firestoreComments, ...subsquareComments];

		// Helper function to build comment tree
		const buildCommentTree = (parentId: string | null): ICommentResponse[] => {
			return allComments
				.filter((comment) => comment.parentCommentId === parentId)
				.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()) // Sort by creation date, oldest first
				.map((comment) => ({
					...comment,
					children: buildCommentTree(comment.id)
				}));
		};

		// Get only top-level comments (those with no parent)
		return buildCommentTree(null);
	}

	static async GetCommentById(id: string): Promise<IComment | null> {
		return FirestoreService.GetCommentById(id);
	}

	static async GetPostReactions({ network, indexOrHash, proposalType }: { network: ENetwork; indexOrHash: string; proposalType: EProposalType }): Promise<IReaction[]> {
		return FirestoreService.GetPostReactions({ network, indexOrHash, proposalType });
	}

	static async GetPostReactionById(id: string): Promise<IReaction | null> {
		return FirestoreService.GetPostReactionById(id);
	}

	static async GetPublicUserById(id: number): Promise<IPublicUser | null> {
		return FirestoreService.GetPublicUserById(id);
	}

	static async GetUserActivitiesByUserId(userId: number): Promise<IUserActivity[]> {
		return FirestoreService.GetUserActivitiesByUserId(userId);
	}

	static async GetUserReactionForPost({
		network,
		indexOrHash,
		proposalType,
		userId
	}: {
		network: ENetwork;
		indexOrHash: string;
		proposalType: EProposalType;
		userId: number;
	}): Promise<IReaction | null> {
		return FirestoreService.GetUserReactionForPost({ network, indexOrHash, proposalType, userId });
	}

	// helper methods
	private static async calculateProfileScoreIncrement({
		userId,
		activityName,
		activityMetadata,
		subActivityName
	}: {
		userId: number;
		activityName: EActivityName;
		activityMetadata?: IActivityMetadata;
		subActivityName?: EActivityName;
	}) {
		// TODO: calculate score based on activity name and sub activity name
		console.log('TODO: calculateProfileScoreIncrement fire and forget a cloud function maybe ?');
		console.log({ userId, activityName, activityMetadata, subActivityName });
		return 1;
	}

	// Write methods

	private static async saveUserActivity({
		userId,
		name,
		network,
		proposalType,
		indexOrHash,
		metadata,
		subActivityName
	}: {
		userId: number;
		name: EActivityName;
		network?: ENetwork;
		proposalType?: EProposalType;
		indexOrHash?: string;
		metadata?: IActivityMetadata;
		subActivityName?: EActivityName;
	}): Promise<void> {
		const activity: IUserActivity = {
			id: '', // Firestore service class will generate this
			userId,
			name,
			category: ON_CHAIN_ACTIVITY_NAMES.includes(name) ? EActivityCategory.ON_CHAIN : EActivityCategory.OFF_CHAIN,
			...(network && { network }),
			...(proposalType && { proposalType }),
			...(indexOrHash && { indexOrHash }),
			...(metadata && { metadata }),
			...(subActivityName && { subActivityName }),
			createdAt: new Date(),
			updatedAt: new Date()
		};

		await FirestoreService.AddUserActivity(activity);

		const score = await this.calculateProfileScoreIncrement({ userId, activityMetadata: metadata, activityName: name, subActivityName });
		await FirestoreService.IncrementUserProfileScore(userId, score);
	}

	static async UpdateApiKeyUsage(apiKey: string, apiRoute: string) {
		return FirestoreService.UpdateApiKeyUsage(apiKey, apiRoute);
	}

	static async AddNewUser(user: IUser) {
		return FirestoreService.AddNewUser(user);
	}

	static async AddNewAddress({ address, userId, isDefault, wallet, network }: { address: string; userId: number; isDefault: boolean; wallet: EWallet; network: ENetwork }) {
		if (!ValidatorService.isValidWeb3Address(address)) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'address is not a valid web-3 address');
		}

		const addressEntry: IUserAddress = {
			address: ValidatorService.isValidEVMAddress(address) ? address : getSubstrateAddress(address)!,
			default: isDefault,
			network,
			userId,
			createdAt: new Date(),
			updatedAt: new Date(),
			wallet
		};

		await FirestoreService.AddNewAddress(addressEntry);

		await this.saveUserActivity({
			userId,
			name: EActivityName.LINKED_ADDRESS,
			metadata: { address: addressEntry.address }
		});
	}

	static async UpdateUserTfaDetails(userId: number, newTfaDetails: IUserTFADetails) {
		return FirestoreService.UpdateUserTfaDetails(userId, newTfaDetails);
	}

	static async AddNewComment({
		network,
		indexOrHash,
		proposalType,
		userId,
		content,
		parentCommentId,
		address
	}: {
		network: ENetwork;
		indexOrHash: string;
		proposalType: EProposalType;
		userId: number;
		content: OutputData;
		parentCommentId?: string;
		address?: string;
	}) {
		// check if the post is allowed to be commented on
		const post = await this.GetOffChainPostData({ network, indexOrHash, proposalType });
		if (post.allowedCommentor === EAllowedCommentor.NONE) {
			throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'Post is not allowed to be commented on');
		}
		// TODO: implement on-chain check

		const comment = await FirestoreService.AddNewComment({ network, indexOrHash, proposalType, userId, content, parentCommentId, address });

		await this.saveUserActivity({
			userId,
			name: parentCommentId ? EActivityName.REPLIED_TO_COMMENT : EActivityName.COMMENTED_ON_POST,
			network,
			proposalType,
			indexOrHash,
			metadata: { commentId: comment.id, parentCommentId }
		});

		await FirestoreService.UpdateLastCommentAtPost({ network, indexOrHash, proposalType, lastCommentAt: comment.createdAt });

		return comment;
	}

	static async UpdateComment({ commentId, content }: { commentId: string; content: OutputData }) {
		return FirestoreService.UpdateComment({ commentId, content });
	}

	static async DeleteComment(commentId: string) {
		const comment = await FirestoreService.GetCommentById(commentId);

		if (!comment) throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND);

		await FirestoreService.DeleteComment(commentId);

		await this.saveUserActivity({
			userId: comment.userId,
			name: EActivityName.DELETED_COMMENT,
			network: comment.network,
			proposalType: comment.proposalType,
			indexOrHash: comment.indexOrHash,
			metadata: { commentId }
		});
	}

	static async AddPostReaction({
		network,
		indexOrHash,
		proposalType,
		userId,
		reaction
	}: {
		network: ENetwork;
		indexOrHash: string;
		proposalType: EProposalType;
		userId: number;
		reaction: EReaction;
	}): Promise<string> {
		const reactionId = await FirestoreService.AddPostReaction({ network, indexOrHash, proposalType, userId, reaction });

		await this.saveUserActivity({
			userId,
			name: EActivityName.REACTED_TO_POST,
			network,
			proposalType,
			indexOrHash,
			metadata: { reaction }
		});

		return reactionId;
	}

	static async DeletePostReaction(id: string) {
		const reaction = await FirestoreService.GetPostReactionById(id);
		if (!reaction) throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND);

		await FirestoreService.DeletePostReaction(id);

		await this.saveUserActivity({
			userId: reaction.userId,
			name: EActivityName.DELETED_REACTION,
			network: reaction.network,
			proposalType: reaction.proposalType,
			indexOrHash: reaction.indexOrHash,
			metadata: { reaction: reaction.reaction }
		});
	}

	static async CreateOffChainPost({
		network,
		proposalType,
		userId,
		content,
		title,
		allowedCommentor
	}: {
		network: ENetwork;
		proposalType: EProposalType;
		userId: number;
		content: OutputData;
		title: string;
		allowedCommentor: EAllowedCommentor;
	}) {
		if (!ValidatorService.isValidOffChainProposalType(proposalType)) {
			throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Invalid proposal type for an off-chain post');
		}

		const post = await FirestoreService.CreatePost({ network, proposalType, userId, content, title, allowedCommentor });

		await this.saveUserActivity({
			userId,
			name: OFF_CHAIN_PROPOSAL_TYPES.includes(proposalType) ? EActivityName.CREATED_OFFCHAIN_POST : EActivityName.CREATED_PROPOSAL,
			network,
			proposalType,
			indexOrHash: post.indexOrHash || post.id
		});

		return post;
	}

	static async UpdateOffChainPost({
		network,
		indexOrHash,
		proposalType,
		userId,
		content,
		title,
		allowedCommentor
	}: {
		network: ENetwork;
		indexOrHash: string;
		proposalType: EProposalType;
		userId: number;
		content: OutputData;
		title: string;
		allowedCommentor: EAllowedCommentor;
	}) {
		const postData = await this.GetOffChainPostData({ network, indexOrHash, proposalType });

		if (!postData || !postData.id) {
			throw new APIError(ERROR_CODES.POST_NOT_FOUND_ERROR, StatusCodes.NOT_FOUND);
		}

		if (postData.userId !== userId) {
			throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED);
		}

		await FirestoreService.UpdatePost({ id: postData.id, content, title, allowedCommentor });
	}

	static async UpdateOnChainPost({
		network,
		indexOrHash,
		proposalType,
		userId,
		content,
		title,
		allowedCommentor
	}: {
		network: ENetwork;
		indexOrHash: string;
		proposalType: EProposalType;
		userId: number;
		content: OutputData;
		title: string;
		allowedCommentor: EAllowedCommentor;
	}) {
		const onChainPostInfo = await OnChainDbService.GetOnChainPostInfo({ network, indexOrHash, proposalType });
		if (!onChainPostInfo || !onChainPostInfo.proposer) throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND);

		const proposerAddress = getSubstrateAddress(onChainPostInfo.proposer);

		if (!proposerAddress || !ValidatorService.isValidSubstrateAddress(proposerAddress)) throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND);

		// check if the user is the proposer
		const userAddresses = await this.GetAddressesForUserId(userId);
		if (!userAddresses.find((address) => address.address === proposerAddress)) throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED);

		// check if offchain post context exists
		const offChainPostData = await this.GetOffChainPostData({ network, indexOrHash, proposalType });

		if (!offChainPostData?.id) {
			await FirestoreService.CreatePost({ network, proposalType, userId, content, indexOrHash, title, allowedCommentor });
			await this.saveUserActivity({
				userId,
				name: EActivityName.ADDED_CONTEXT_TO_PROPOSAL,
				network,
				proposalType,
				indexOrHash
			});
		} else {
			await FirestoreService.UpdatePost({ id: offChainPostData.id, content, title, allowedCommentor: offChainPostData.allowedCommentor });
		}
	}

	static async UpdateUserPassword(userId: number, password: string, salt: string) {
		return FirestoreService.UpdateUserPassword(userId, password, salt);
	}
}
