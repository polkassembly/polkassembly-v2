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
	EAllowedCommentor,
	IContentSummary,
	IProfileDetails,
	IUserNotificationSettings,
	IFollowEntry,
	IGenericListingResponse,
	EOffChainPostTopic,
	ITag,
	IVoteCartItem,
	EConvictionAmount,
	EVoteDecision,
	IPostSubscription,
	ECommentSentiment,
	ITreasuryStats,
	IDelegate,
	ESocialVerificationStatus,
	ESocial,
	IPostLink
} from '@shared/types';
import { DEFAULT_POST_TITLE } from '@/_shared/_constants/defaultPostTitle';
import { getDefaultPostContent } from '@/_shared/_utils/getDefaultPostContent';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
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

	static async GetNextUserId(): Promise<number> {
		return FirestoreService.GetNextUserId();
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

	static async GetAddressDataByAddress(address: string): Promise<IUserAddress | null> {
		return FirestoreService.GetAddressDataByAddress(address);
	}

	static async GetPublicUsers(page: number, limit: number): Promise<IGenericListingResponse<IPublicUser>> {
		return FirestoreService.GetPublicUsers(page, limit);
	}

	static async GetOffChainPostData({
		network,
		indexOrHash,
		proposalType,
		proposer,
		getDefaultContent = true
	}: {
		network: ENetwork;
		indexOrHash: string;
		proposalType: EProposalType;
		proposer?: string;
		getDefaultContent?: boolean;
	}): Promise<IOffChainPost> {
		let post: IOffChainPost | null = null;

		// 1. get post from firestore
		post = await FirestoreService.GetOffChainPostData({ network, indexOrHash, proposalType });

		// 2. if not found, get post from subsquare
		if (!post) {
			// if is off-chain and not found in our db, throw error
			if (ValidatorService.isValidOffChainProposalType(proposalType)) {
				throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, 'Post not found');
			}

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

		const content = getDefaultContent ? getDefaultPostContent(proposalType, proposer) : '';

		return {
			index: proposalType !== EProposalType.TIP && indexOrHash.trim() !== '' && ValidatorService.isValidNumber(indexOrHash) ? Number(indexOrHash) : undefined,
			hash: proposalType === EProposalType.TIP ? indexOrHash : undefined,
			title: DEFAULT_POST_TITLE,
			content,
			tags: [],
			dataSource: EDataSource.POLKASSEMBLY,
			proposalType,
			network,
			metrics: postMetrics,
			allowedCommentor: EAllowedCommentor.ALL,
			isDeleted: false,
			isDefaultContent: getDefaultContent
		} as IOffChainPost;
	}

	static async GetOffChainPostsListing({
		network,
		proposalType,
		limit,
		page,
		tags,
		userId
	}: {
		network: ENetwork;
		proposalType: EProposalType;
		limit: number;
		page: number;
		tags?: string[];
		userId?: number;
	}): Promise<IOffChainPost[]> {
		const posts = await FirestoreService.GetOffChainPostsListing({ network, proposalType, limit, page, tags, userId });
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
		const [firestoreComments, subsquareComments] = await Promise.all([
			FirestoreService.GetPostComments({ network, indexOrHash, proposalType }),
			SubsquareOffChainService.GetPostComments({ network, indexOrHash, proposalType })
		]);

		// Combine all comments from both sources
		const allComments = [...firestoreComments, ...subsquareComments];

		// get reactions for each comment
		const allCommentsWithReactions: ICommentResponse[] = await Promise.all(
			allComments.map(async (comment) => {
				const reactions = await this.GetCommentReactions({ network, indexOrHash, proposalType, id: comment.id });
				return { ...comment, reactions };
			})
		);

		// Helper function to build comment tree
		const buildCommentTree = (parentId: string | null): ICommentResponse[] => {
			return allCommentsWithReactions
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

	static async GetCommentReactions({
		network,
		indexOrHash,
		proposalType,
		id
	}: {
		network: ENetwork;
		indexOrHash: string;
		proposalType: EProposalType;
		id: string;
	}): Promise<IReaction[]> {
		return FirestoreService.GetCommentReactions({ network, indexOrHash, proposalType, id });
	}

	static async GetReactionById(id: string): Promise<IReaction | null> {
		return FirestoreService.GetReactionById(id);
	}

	static async GetPublicUserById(id: number): Promise<IPublicUser | null> {
		return FirestoreService.GetPublicUserById(id);
	}

	static async GetUserActivitiesByUserId({ userId, network }: { userId: number; network: ENetwork }): Promise<IUserActivity[]> {
		const activities = await FirestoreService.GetUserActivitiesByUserId({ userId, network });

		// fetch post data for each activity
		return Promise.all(
			activities.map(async (activity) => {
				const post =
					activity.indexOrHash && activity.proposalType
						? await this.GetOffChainPostData({ network, indexOrHash: activity.indexOrHash, proposalType: activity.proposalType })
						: null;
				return { ...activity, metadata: { ...activity.metadata, title: post?.title } };
			})
		);
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

	static async GetContentSummary({ network, indexOrHash, proposalType }: { network: ENetwork; indexOrHash: string; proposalType: EProposalType }): Promise<IContentSummary | null> {
		return FirestoreService.GetContentSummary({ network, indexOrHash, proposalType });
	}

	static async IsUserFollowing({ userId, userIdToFollow }: { userId: number; userIdToFollow: number }): Promise<boolean> {
		return FirestoreService.IsUserFollowing({ userId, userIdToFollow });
	}

	static async GetFollowers(userId: number): Promise<IFollowEntry[]> {
		return FirestoreService.GetFollowers(userId);
	}

	static async GetFollowing(userId: number): Promise<IFollowEntry[]> {
		return FirestoreService.GetFollowing(userId);
	}

	static async GetVoteCart({ userId, network }: { userId: number; network: ENetwork }): Promise<IVoteCartItem[]> {
		const voteCartItems = await FirestoreService.GetVoteCart({ userId, network });

		// fetch title for each vote cart item
		return Promise.all(
			voteCartItems.map(async (voteCartItem) => {
				const post = await this.GetOffChainPostData({ network: voteCartItem.network, indexOrHash: voteCartItem.postIndexOrHash, proposalType: voteCartItem.proposalType });
				return { ...voteCartItem, title: post.title };
			})
		);
	}

	static async GetPostSubscriptionByPostAndUserId({
		network,
		indexOrHash,
		proposalType,
		userId
	}: {
		network: ENetwork;
		indexOrHash: string;
		proposalType: EProposalType;
		userId: number;
	}): Promise<IPostSubscription | null> {
		return FirestoreService.GetPostSubscriptionByPostAndUserId({ network, indexOrHash, proposalType, userId });
	}

	static async GetPostSubscriptionsByUserId({ userId, page, limit, network }: { userId: number; page: number; limit: number; network: ENetwork }): Promise<IPostSubscription[]> {
		return FirestoreService.GetPostSubscriptionsByUserId({ userId, page, limit, network });
	}

	static async GetPostSubscriptionCountByUserId({ userId, network }: { userId: number; network: ENetwork }): Promise<number> {
		return FirestoreService.GetPostSubscriptionCountByUserId({ userId, network });
	}

	static async GetTreasuryStats({ network, from, to, limit, page }: { network: ENetwork; from?: Date; to?: Date; limit: number; page: number }): Promise<ITreasuryStats[]> {
		return FirestoreService.GetTreasuryStats({ network, from, to, limit, page });
	}

	static async GetPolkassemblyDelegates(network: ENetwork): Promise<IDelegate[]> {
		return FirestoreService.GetPolkassemblyDelegates(network);
	}

	static async GetPolkassemblyDelegateByAddress({ network, address }: { network: ENetwork; address: string }): Promise<IDelegate | null> {
		return FirestoreService.GetPolkassemblyDelegateByAddress({ network, address });
	}

	// helper methods
	private static async calculateProfileScoreIncrement({
		userId,
		address,
		activityName,
		activityMetadata,
		subActivityName
	}: {
		userId?: number;
		address?: string;
		activityName: EActivityName;
		activityMetadata?: IActivityMetadata;
		subActivityName?: EActivityName;
	}) {
		// TODO: calculate score based on activity name and sub activity name
		console.log('TODO: calculateProfileScoreIncrement fire and forget a cloud function maybe ?');
		console.log({ userId, address, activityName, activityMetadata, subActivityName });
		return 1;
	}

	// Write methods

	private static async saveUserActivity({
		userId,
		address,
		name,
		network,
		proposalType,
		indexOrHash,
		metadata,
		subActivityName,
		commentId
	}: {
		userId?: number;
		address?: string;
		name: EActivityName;
		network?: ENetwork;
		proposalType?: EProposalType;
		indexOrHash?: string;
		metadata?: IActivityMetadata;
		subActivityName?: EActivityName;
		commentId?: string;
	}): Promise<void> {
		const activity: IUserActivity = {
			id: '', // Firestore service class will generate this
			...(userId && { userId }),
			...(address && { address }),
			name,
			category: ON_CHAIN_ACTIVITY_NAMES.includes(name) ? EActivityCategory.ON_CHAIN : EActivityCategory.OFF_CHAIN,
			...(network && { network }),
			...(proposalType && { proposalType }),
			...(indexOrHash && { indexOrHash }),
			...(metadata && { metadata }),
			...(subActivityName && { subActivityName }),
			...(commentId && { commentId }),
			createdAt: new Date(),
			updatedAt: new Date()
		};

		await FirestoreService.AddUserActivity(activity);

		const score = await this.calculateProfileScoreIncrement({ userId, activityMetadata: metadata, activityName: name, subActivityName });

		if (ValidatorService.isValidUserId(userId)) {
			await FirestoreService.IncrementUserProfileScore({ userId: userId!, score });
		}

		if (address && ValidatorService.isValidWeb3Address(address)) {
			await FirestoreService.IncrementAddressProfileScore({ address, score });
		}
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

	static async UpdateUserProfile({
		userId,
		newProfileDetails,
		notificationPreferences
	}: {
		userId: number;
		newProfileDetails: IProfileDetails;
		notificationPreferences?: IUserNotificationSettings;
	}) {
		return FirestoreService.UpdateUserProfile({ userId, newProfileDetails, notificationPreferences });
	}

	static async DeleteUser(userId: number) {
		return FirestoreService.DeleteUser(userId);
	}

	static async UpdateUserEmail(userId: number, email: string) {
		if (!ValidatorService.isValidUserId(userId) || !ValidatorService.isValidEmail(email)) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Invalid user id or email');
		}

		return FirestoreService.UpdateUserEmail(userId, email);
	}

	static async UpdateUserUsername(userId: number, username: string) {
		if (!ValidatorService.isValidUserId(userId) || !ValidatorService.isValidUsername(username)) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Invalid user id or username');
		}

		return FirestoreService.UpdateUserUsername(userId, username);
	}

	static async AddNewComment({
		network,
		indexOrHash,
		proposalType,
		userId,
		content,
		parentCommentId,
		sentiment
	}: {
		network: ENetwork;
		indexOrHash: string;
		proposalType: EProposalType;
		userId: number;
		content: string;
		parentCommentId?: string;
		sentiment?: ECommentSentiment;
	}) {
		// check if the post is allowed to be commented on
		const post = await this.GetOffChainPostData({ network, indexOrHash, proposalType });
		if (post.allowedCommentor === EAllowedCommentor.NONE) {
			throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED, 'Post is not allowed to be commented on');
		}
		// TODO: implement on-chain check

		const comment = await FirestoreService.AddNewComment({ network, indexOrHash, proposalType, userId, content, parentCommentId, sentiment });

		await this.saveUserActivity({
			userId,
			name: parentCommentId ? EActivityName.REPLIED_TO_COMMENT : EActivityName.COMMENTED_ON_POST,
			network,
			proposalType,
			indexOrHash,
			metadata: { commentId: comment.id, ...(parentCommentId && { parentCommentId }) }
		});

		await FirestoreService.UpdateLastCommentAtPost({ network, indexOrHash, proposalType, lastCommentAt: comment.createdAt });

		return comment;
	}

	static async UpdateComment({ commentId, content, isSpam, aiSentiment }: { commentId: string; content: string; isSpam?: boolean; aiSentiment?: ECommentSentiment }) {
		return FirestoreService.UpdateComment({ commentId, content, isSpam, aiSentiment });
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

	static async AddCommentReaction({
		network,
		indexOrHash,
		proposalType,
		userId,
		reaction,
		commentId
	}: {
		network: ENetwork;
		indexOrHash: string;
		proposalType: EProposalType;
		userId: number;
		reaction: EReaction;
		commentId: string;
	}): Promise<string> {
		const reactionId = await FirestoreService.AddCommentReaction({ network, indexOrHash, proposalType, userId, reaction, commentId });

		await this.saveUserActivity({
			userId,
			name: EActivityName.REACTED_TO_COMMENT,
			network,
			proposalType,
			indexOrHash,
			metadata: { reaction },
			commentId
		});

		return reactionId;
	}

	static async DeleteReactionById({ id, userId }: { id: string; userId: number }) {
		const reaction = await FirestoreService.GetReactionById(id);
		if (!reaction) throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND);

		if (reaction.userId !== userId) throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED);

		await FirestoreService.DeleteReactionById(id);

		await this.saveUserActivity({
			userId: reaction.userId,
			name: EActivityName.DELETED_REACTION,
			network: reaction.network,
			proposalType: reaction.proposalType,
			indexOrHash: reaction.indexOrHash,
			commentId: reaction.commentId,
			metadata: { reaction: reaction.reaction }
		});
	}

	static async CreateOffChainPost({
		network,
		proposalType,
		userId,
		content,
		title,
		allowedCommentor,
		tags,
		topic
	}: {
		network: ENetwork;
		proposalType: EProposalType;
		userId: number;
		content: string;
		title: string;
		allowedCommentor: EAllowedCommentor;
		tags?: ITag[];
		topic?: EOffChainPostTopic;
	}) {
		if (!ValidatorService.isValidOffChainProposalType(proposalType)) {
			throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Invalid proposal type for an off-chain post');
		}

		const index = (await FirestoreService.GetLatestOffChainPostIndex(network, proposalType)) + 1;

		const post = await FirestoreService.CreatePost({ network, proposalType, userId, content, title, allowedCommentor, tags: tags || [], topic, indexOrHash: index.toString() });

		// Create tags
		if (tags && tags.every((tag) => ValidatorService.isValidTag(tag.value))) {
			await this.CreateTags(tags);
		}

		// create content summary
		// await AIService.createPostSummary({ network, proposalType, indexOrHash: post.indexOrHash });

		await this.saveUserActivity({
			userId,
			name: OFF_CHAIN_PROPOSAL_TYPES.includes(proposalType) ? EActivityName.CREATED_OFFCHAIN_POST : EActivityName.CREATED_PROPOSAL,
			network,
			proposalType,
			indexOrHash: post.indexOrHash
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
		allowedCommentor,
		linkedPost
	}: {
		network: ENetwork;
		indexOrHash: string;
		proposalType: EProposalType;
		userId: number;
		content: string;
		title: string;
		allowedCommentor: EAllowedCommentor;
		linkedPost?: IPostLink;
	}) {
		const postData = await this.GetOffChainPostData({ network, indexOrHash, proposalType });

		if (!postData || !postData.id) {
			throw new APIError(ERROR_CODES.POST_NOT_FOUND_ERROR, StatusCodes.NOT_FOUND);
		}

		if (postData.userId !== userId) {
			throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED);
		}

		await FirestoreService.UpdatePost({ id: postData.id, content, title, allowedCommentor, linkedPost });
	}

	static async UpdateOnChainPost({
		network,
		indexOrHash,
		proposalType,
		userId,
		content,
		title,
		allowedCommentor,
		linkedPost
	}: {
		network: ENetwork;
		indexOrHash: string;
		proposalType: EProposalType;
		userId: number;
		content: string;
		title: string;
		allowedCommentor: EAllowedCommentor;
		linkedPost?: IPostLink;
	}) {
		const onChainPostInfo = await OnChainDbService.GetOnChainPostInfo({ network, indexOrHash, proposalType });
		if (!onChainPostInfo || !onChainPostInfo.proposer) throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND);

		const proposerAddress = getSubstrateAddress(onChainPostInfo.proposer);

		if (!proposerAddress || !ValidatorService.isValidSubstrateAddress(proposerAddress)) throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND);

		// check if the user is the proposer
		const userAddresses = await this.GetAddressesForUserId(userId);
		if (!userAddresses.find((address) => address.address === proposerAddress)) throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED);

		// check if offchain post context exists
		const offChainPostData = await FirestoreService.GetOffChainPostData({ network, indexOrHash, proposalType });

		if (!offChainPostData?.id) {
			await FirestoreService.CreatePost({ network, proposalType, userId, content, indexOrHash, title, allowedCommentor, linkedPost });
			await this.saveUserActivity({
				userId,
				name: EActivityName.ADDED_CONTEXT_TO_PROPOSAL,
				network,
				proposalType,
				indexOrHash
			});
		} else {
			await FirestoreService.UpdatePost({ id: offChainPostData.id, content, title, allowedCommentor: offChainPostData.allowedCommentor, linkedPost });
		}
	}

	static async UpdateUserPassword(userId: number, password: string, salt: string) {
		return FirestoreService.UpdateUserPassword(userId, password, salt);
	}

	static async UpdateContentSummary(contentSummary: IContentSummary) {
		return FirestoreService.UpdateContentSummary(contentSummary);
	}

	static async FollowUser({ userId, userIdToFollow }: { userId: number; userIdToFollow: number }) {
		await FirestoreService.FollowUser({ userId, userIdToFollow });

		await this.saveUserActivity({
			userId,
			name: EActivityName.FOLLOWED_USER,
			metadata: {
				userId: userIdToFollow
			}
		});
	}

	static async UnfollowUser({ userId, userIdToUnfollow }: { userId: number; userIdToUnfollow: number }) {
		await FirestoreService.UnfollowUser({ userId, userIdToUnfollow });

		await this.saveUserActivity({
			userId,
			name: EActivityName.UNFOLLOWED_USER,
			metadata: { userId: userIdToUnfollow }
		});
	}

	static async GetAllTags(network: ENetwork) {
		return FirestoreService.GetAllTags(network);
	}

	static async CreateTags(tags: ITag[]) {
		return FirestoreService.CreateTags(tags);
	}

	static async AddVoteCartItem({
		userId,
		postIndexOrHash,
		proposalType,
		decision,
		amount,
		conviction,
		network
	}: {
		userId: number;
		postIndexOrHash: string;
		proposalType: EProposalType;
		decision: EVoteDecision;
		amount: { abstain?: string; aye?: string; nay?: string };
		conviction: EConvictionAmount;
		network: ENetwork;
	}): Promise<IVoteCartItem> {
		return FirestoreService.AddVoteCartItem({ userId, postIndexOrHash, proposalType, decision, amount, conviction, network });
	}

	static async DeleteVoteCartItem({ userId, voteCartItemId }: { userId: number; voteCartItemId: string }) {
		return FirestoreService.DeleteVoteCartItem({ userId, voteCartItemId });
	}

	static async ClearVoteCart({ userId }: { userId: number }) {
		return FirestoreService.ClearVoteCart({ userId });
	}

	static async UpdateVoteCartItem({
		userId,
		voteCartItemId,
		decision,
		amount,
		conviction
	}: {
		userId: number;
		voteCartItemId: string;
		decision: EVoteDecision;
		amount: { abstain?: string; aye?: string; nay?: string };
		conviction: EConvictionAmount;
	}) {
		return FirestoreService.UpdateVoteCartItem({ userId, voteCartItemId, decision, amount, conviction });
	}

	static async AddPostSubscription({ network, indexOrHash, proposalType, userId }: { network: ENetwork; indexOrHash: string; proposalType: EProposalType; userId: number }) {
		const existingSubscription = await this.GetPostSubscriptionByPostAndUserId({ network, indexOrHash, proposalType, userId });
		if (existingSubscription) {
			throw new APIError(ERROR_CODES.ALREADY_EXISTS, StatusCodes.CONFLICT, 'Subscription already exists');
		}

		return FirestoreService.AddPostSubscription({ network, indexOrHash, proposalType, userId });
	}

	static async DeletePostSubscription({ network, indexOrHash, proposalType, userId }: { network: ENetwork; indexOrHash: string; proposalType: EProposalType; userId: number }) {
		return FirestoreService.DeletePostSubscription({ network, indexOrHash, proposalType, userId });
	}

	static async SaveTreasuryStats({ treasuryStats }: { treasuryStats: ITreasuryStats }) {
		return FirestoreService.SaveTreasuryStats({ treasuryStats });
	}

	static async AddPolkassemblyDelegate({ network, address, manifesto }: { network: ENetwork; address: string; manifesto: string }) {
		return FirestoreService.AddPolkassemblyDelegate({ network, address, manifesto });
	}

	static async UpdatePolkassemblyDelegate({ network, address, manifesto }: { network: ENetwork; address: string; manifesto: string }) {
		return FirestoreService.UpdatePolkassemblyDelegate({ network, address, manifesto });
	}

	static async DeletePolkassemblyDelegate({ network, address }: { network: ENetwork; address: string }) {
		return FirestoreService.DeletePolkassemblyDelegate({ network, address });
	}

	static async UpdateUserSocialHandle({
		userId,
		address,
		social,
		handle,
		status,
		verificationToken
	}: {
		userId: number;
		address?: string;
		social: ESocial;
		handle: string;
		status: ESocialVerificationStatus;
		verificationToken?: {
			token?: string;
			secret?: string;
			expiresAt?: Date;
		};
	}) {
		return FirestoreService.UpdateUserSocialHandle({ userId, address, social, handle, status, verificationToken });
	}

	static async GetUserSocialHandles({ userId, address }: { userId: number; address: string }) {
		return FirestoreService.GetUserSocialHandles({ userId, address });
	}

	static async GetSocialHandleByToken({ token }: { token: string }) {
		return FirestoreService.GetSocialHandleByToken({ token });
	}

	static async UpdateSocialHandleByToken({ token, status }: { token: string; status: ESocialVerificationStatus }) {
		return FirestoreService.UpdateSocialHandleByToken({ token, status });
	}

	static async DeleteOffChainPost({ network, proposalType, index }: { network: ENetwork; proposalType: EProposalType; index: number }) {
		return FirestoreService.DeleteOffChainPost({ network, proposalType, index });
	}

	static async GetPostsByUserId({ userId, network, page, limit, proposalType }: { userId: number; network: ENetwork; page: number; limit: number; proposalType: EProposalType }) {
		return FirestoreService.GetPostsByUserId({ userId, network, page, limit, proposalType });
	}

	static async DeleteContentSummary({ network, proposalType, indexOrHash }: { network: ENetwork; proposalType: EProposalType; indexOrHash: string }) {
		return FirestoreService.DeleteContentSummary({ network, proposalType, indexOrHash });
	}
}
