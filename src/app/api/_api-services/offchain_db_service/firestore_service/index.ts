// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { QueryDocumentSnapshot, QuerySnapshot, Timestamp, WriteBatch } from 'firebase-admin/firestore';
import {
	EDataSource,
	ENetwork,
	EProposalType,
	IOffChainPost,
	IUser,
	IUserTFADetails,
	IUserAddress,
	IComment,
	ICommentResponse,
	IPublicUser,
	IReaction,
	EReaction,
	IPostOffChainMetrics,
	IUserActivity,
	EAllowedCommentor,
	IContentSummary,
	IProfileDetails,
	IUserNotificationSettings,
	IFollowEntry,
	IGenericListingResponse,
	EOffChainPostTopic,
	ITag,
	IVoteCartItem,
	EVoteDecision,
	EConvictionAmount,
	IPostSubscription,
	ECommentSentiment,
	ITreasuryStats,
	IDelegate,
	EDelegateSource,
	ESocial,
	ISocialHandle,
	ESocialVerificationStatus,
	IPostLink
} from '@/_shared/types';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { DEFAULT_PROFILE_DETAILS } from '@/_shared/_constants/defaultProfileDetails';
import { FirestoreUtils } from './firestoreUtils';

export class FirestoreService extends FirestoreUtils {
	// Read methods
	static async GetTotalUsersCount(): Promise<number> {
		const userDocSnapshot = await this.usersCollectionRef().get();
		return userDocSnapshot.docs.length;
	}

	static async GetNextUserId(): Promise<number> {
		const userDocSnapshot = await this.usersCollectionRef().orderBy('id', 'desc').limit(1).get();
		return userDocSnapshot.docs[0].data().id + 1;
	}

	static async GetUserByEmail(email: string): Promise<IUser | null> {
		const userDocSnapshot = await this.usersCollectionRef().where('email', '==', email).limit(1).get();
		if (userDocSnapshot.empty) {
			return null;
		}

		const userData = userDocSnapshot.docs[0].data();
		return {
			...userData,
			createdAt: userData.createdAt?.toDate(),
			updatedAt: userData.updatedAt?.toDate()
		} as IUser;
	}

	static async GetUserByUsername(username: string): Promise<IUser | null> {
		const userDocSnapshot = await this.usersCollectionRef().where('username', '==', username).limit(1).get();
		if (userDocSnapshot.empty) {
			return null;
		}

		const userData = userDocSnapshot.docs[0].data();
		return {
			...userData,
			createdAt: userData.createdAt?.toDate(),
			updatedAt: userData.updatedAt?.toDate()
		} as IUser;
	}

	static async GetUserById(userId: number): Promise<IUser | null> {
		const userDocSnapshot = await this.usersCollectionRef().doc(userId.toString()).get();
		if (!userDocSnapshot.exists) {
			return null;
		}

		const userData = userDocSnapshot.data();
		if (!userData) {
			return null;
		}

		return {
			...userData,
			createdAt: userData.createdAt?.toDate(),
			updatedAt: userData.updatedAt?.toDate()
		} as IUser;
	}

	static async GetPublicUserById(userId: number): Promise<IPublicUser | null> {
		const user = await this.GetUserById(userId);

		if (!user) {
			return null;
		}

		const addresses = await this.GetAddressesForUserId(userId);
		const rank =
			(
				await this.usersCollectionRef()
					.where('profileScore', '>', Number(user.profileScore || 0))
					.count()
					.get()
			).data().count + 1;

		return {
			id: user.id,
			username: user.username,
			profileScore: user.profileScore,
			addresses: addresses.map((address) => address.address),
			rank,
			createdAt: user.createdAt,
			profileDetails: user.profileDetails || DEFAULT_PROFILE_DETAILS
		};
	}

	static async GetPublicUserByUsername(username: string): Promise<IPublicUser | null> {
		const user = await this.GetUserByUsername(username);
		if (!user) {
			return null;
		}

		return this.GetPublicUserById(user.id);
	}

	static async GetPublicUserByAddress(address: string): Promise<IPublicUser | null> {
		if (!ValidatorService.isValidWeb3Address(address)) {
			return null;
		}

		const user = await this.GetUserByAddress(address);
		if (!user) {
			return null;
		}

		const addresses = await this.GetAddressesForUserId(user.id);
		const rank =
			(
				await this.usersCollectionRef()
					.where('profileScore', '>', Number(user.profileScore || 0))
					.count()
					.get()
			).data().count + 1;

		return {
			id: user.id,
			username: user.username,
			profileScore: user.profileScore,
			createdAt: user.createdAt,
			rank,
			addresses: addresses.map((addr) => addr.address),
			profileDetails: user.profileDetails || DEFAULT_PROFILE_DETAILS
		};
	}

	static async GetPublicUsers(page: number, limit: number): Promise<IGenericListingResponse<IPublicUser>> {
		const usersQuery = this.usersCollectionRef()
			.orderBy('profileScore', 'desc')
			.limit(limit)
			.offset((page - 1) * limit);

		const usersQuerySnapshot = await usersQuery.get();

		const totalUsersCount = (await this.usersCollectionRef().count().get()).data().count || 0;

		return {
			items: await Promise.all(
				usersQuerySnapshot.docs.map(async (doc) => {
					const data = doc.data();

					const addresses = await this.GetAddressesForUserId(data.id);
					const rank =
						(
							await this.usersCollectionRef()
								.where('profileScore', '>', Number(data.profileScore || 0))
								.count()
								.get()
						).data().count + 1;

					return {
						id: data.id,
						username: data.username,
						profileScore: data.profileScore,
						addresses: addresses.map((addr: IUserAddress) => addr.address),
						rank,
						createdAt: data.createdAt?.toDate?.(),
						profileDetails: data.profileDetails || DEFAULT_PROFILE_DETAILS
					} as IPublicUser;
				})
			),
			totalCount: totalUsersCount
		};
	}

	static async GetUserByAddress(address: string): Promise<IUser | null> {
		const substrAddress = !address.startsWith('0x') ? getSubstrateAddress(address) : address;

		if (!substrAddress) {
			return null;
		}

		const addressDocSnapshot = await this.addressesCollectionRef().doc(substrAddress).get();
		if (!addressDocSnapshot.exists) {
			return null;
		}

		const addressData = addressDocSnapshot.data() as IUserAddress;

		return this.GetUserById(addressData.userId);
	}

	static async GetAddressDataByAddress(address: string): Promise<IUserAddress | null> {
		const substrAddress = !address.startsWith('0x') ? getSubstrateAddress(address) : address;

		if (!substrAddress) {
			return null;
		}

		const addressDocSnapshot = await this.addressesCollectionRef().doc(substrAddress).get();
		if (!addressDocSnapshot.exists) {
			return null;
		}

		const data = addressDocSnapshot.data();
		if (!data) {
			return null;
		}

		return {
			...data,
			createdAt: data.createdAt?.toDate(),
			updatedAt: data.updatedAt?.toDate()
		} as IUserAddress;
	}

	static async GetAddressesForUserId(userId: number): Promise<IUserAddress[]> {
		const addressesQuery = this.addressesCollectionRef().where('userId', '==', userId);
		const addressesQuerySnapshot = await addressesQuery.get();

		return addressesQuerySnapshot.docs.map((doc) => {
			const data = doc.data();

			return {
				...data,
				createdAt: data.createdAt?.toDate(),
				updatedAt: data.updatedAt?.toDate()
			} as IUserAddress;
		});
	}

	static async GetOffChainPostData({ network, indexOrHash, proposalType }: { network: ENetwork; indexOrHash: string; proposalType: EProposalType }): Promise<IOffChainPost | null> {
		let postDocSnapshot = await this.postsCollectionRef()
			.where('proposalType', '==', proposalType)
			.where('index', '==', Number(indexOrHash))
			.where('network', '==', network)
			.where('isDeleted', '==', false)
			.limit(1)
			.get();

		// if proposal type is tip then index is hash
		if (proposalType === EProposalType.TIP) {
			postDocSnapshot = await this.postsCollectionRef()
				.where('proposalType', '==', proposalType)
				.where('hash', '==', indexOrHash)
				.where('network', '==', network)
				.where('isDeleted', '==', false)
				.limit(1)
				.get();
		}

		if (postDocSnapshot.empty) {
			return null;
		}

		const postData = postDocSnapshot.docs[0].data();

		return {
			...postData,
			content: postData.content || '',
			tags:
				postData.tags?.map((tag: { value: string; lastUsedAt: unknown }) => ({
					value: tag.value,
					lastUsedAt:
						typeof tag.lastUsedAt === 'object' && tag.lastUsedAt !== null && typeof (tag.lastUsedAt as Timestamp).toDate === 'function'
							? (tag.lastUsedAt as Timestamp).toDate()
							: new Date(tag.lastUsedAt as string) || new Date(),
					network
				})) || [],
			dataSource: EDataSource.POLKASSEMBLY,
			createdAt: postData.createdAt?.toDate(),
			updatedAt: postData.updatedAt?.toDate(),
			allowedCommentor: postData.allowedCommentor || EAllowedCommentor.ALL
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
		let postsQuery = this.postsCollectionRef().where('proposalType', '==', proposalType).where('network', '==', network);

		if (tags?.length) {
			postsQuery = postsQuery.where('tags', 'array-contains-any', tags);
		}

		if (userId) {
			postsQuery = postsQuery.where('userId', '==', userId);
		}

		postsQuery = postsQuery
			.where('isDeleted', '==', false)
			.orderBy('createdAt', 'desc')
			.limit(limit)
			.offset((page - 1) * limit);

		const postsQuerySnapshot = await postsQuery.get();

		const postsWithMetricsPromises = postsQuerySnapshot.docs.map(async (doc) => {
			const data = doc.data();
			const indexOrHash = data.hash || String(data.index);
			const metrics = await this.GetPostMetrics({ network, indexOrHash, proposalType });

			return {
				...data,
				content: data.content || '',
				createdAt: data.createdAt?.toDate(),
				updatedAt: data.updatedAt?.toDate(),
				metrics,
				allowedCommentor: data.allowedCommentor || EAllowedCommentor.ALL,
				dataSource: data.dataSource || EDataSource.POLKASSEMBLY
			} as IOffChainPost;
		});

		return Promise.all(postsWithMetricsPromises);
	}

	static async GetTotalOffChainPostsCount({ network, proposalType, tags }: { network: ENetwork; proposalType: EProposalType; tags?: string[] }): Promise<number> {
		let postsQuery = this.postsCollectionRef().where('proposalType', '==', proposalType).where('network', '==', network);

		if (tags?.length) {
			postsQuery = postsQuery.where('tags', 'array-contains-any', tags);
		}

		postsQuery = postsQuery.where('isDeleted', '==', false);

		const countSnapshot = await postsQuery.count().get();
		return countSnapshot.data().count || 0;
	}

	static async GetPostReactionsCount({
		network,
		indexOrHash,
		proposalType
	}: {
		network: ENetwork;
		indexOrHash: string;
		proposalType: EProposalType;
	}): Promise<{ reaction: EReaction; count: number }[]> {
		const reactionCountPromises = Object.values(EReaction).map(async (reaction) => {
			const reactionCount = await this.reactionsCollectionRef()
				.where('network', '==', network)
				.where('proposalType', '==', proposalType)
				.where('indexOrHash', '==', indexOrHash)
				.where('reaction', '==', reaction)
				.count()
				.get();

			return {
				reaction,
				count: reactionCount.data().count || 0
			};
		});

		return Promise.all(reactionCountPromises);
	}

	static async GetPostCommentsCount({ network, indexOrHash, proposalType }: { network: ENetwork; indexOrHash: string; proposalType: EProposalType }): Promise<number> {
		const commentsCount = await this.commentsCollectionRef()
			.where('network', '==', network)
			.where('proposalType', '==', proposalType)
			.where('indexOrHash', '==', indexOrHash)
			.where('isDeleted', '==', false)
			.count()
			.get();
		return commentsCount.data().count || 0;
	}

	static async GetPostMetrics({ network, indexOrHash, proposalType }: { network: ENetwork; indexOrHash: string; proposalType: EProposalType }): Promise<IPostOffChainMetrics> {
		const postReactionsCount = (await this.GetPostReactionsCount({ network, indexOrHash, proposalType })).reduce(
			(acc, curr) => {
				acc[curr.reaction] = curr.count;
				return acc;
			},
			{} as { [key in EReaction]: number }
		);

		const commentsCount = await this.GetPostCommentsCount({ network, indexOrHash, proposalType });

		return {
			reactions: postReactionsCount,
			comments: commentsCount
		} as IPostOffChainMetrics;
	}

	static async GetPostComments({ network, indexOrHash, proposalType }: { network: ENetwork; indexOrHash: string; proposalType: EProposalType }): Promise<ICommentResponse[]> {
		const commentsQuery = this.commentsCollectionRef()
			.where('network', '==', network)
			.where('proposalType', '==', proposalType)
			.where('indexOrHash', '==', indexOrHash)
			.where('isDeleted', '==', false);

		const commentsQuerySnapshot = await commentsQuery.get();

		const commentResponsePromises = commentsQuerySnapshot.docs.map(async (doc) => {
			const dataRaw = doc.data();

			const commentData = {
				...dataRaw,
				content: dataRaw.content || '',
				createdAt: dataRaw.createdAt?.toDate(),
				updatedAt: dataRaw.updatedAt?.toDate(),
				dataSource: dataRaw.dataSource || EDataSource.POLKASSEMBLY
			} as IComment;

			const user = await this.GetPublicUserById(commentData.userId);

			if (!user) {
				return null;
			}

			return {
				...commentData,
				publicUser: user,
				children: []
			} as ICommentResponse;
		});

		return (await Promise.all(commentResponsePromises)).filter((comment): comment is ICommentResponse => comment !== null);
	}

	static async GetCommentById(id: string): Promise<IComment | null> {
		const commentDocSnapshot = await this.commentsCollectionRef().doc(id).get();
		if (!commentDocSnapshot.exists) {
			return null;
		}

		const data = commentDocSnapshot.data();

		if (!data || data.isDeleted) {
			return null;
		}

		return {
			...data,
			content: data.content || '',
			createdAt: data.createdAt?.toDate(),
			updatedAt: data.updatedAt?.toDate(),
			dataSource: data.dataSource || EDataSource.POLKASSEMBLY
		} as IComment;
	}

	static async GetPostReactions({ network, indexOrHash, proposalType }: { network: ENetwork; indexOrHash: string; proposalType: EProposalType }): Promise<IReaction[]> {
		const reactionsQuery = this.reactionsCollectionRef().where('network', '==', network).where('proposalType', '==', proposalType).where('indexOrHash', '==', indexOrHash);
		const reactionsQuerySnapshot = await reactionsQuery.get();
		const reactionPromises = reactionsQuerySnapshot.docs.map(async (doc) => {
			const data = doc.data();
			const publicUser = await this.GetPublicUserById(data.userId);

			return {
				...data,
				createdAt: data.createdAt?.toDate(),
				updatedAt: data.updatedAt?.toDate(),
				publicUser
			} as IReaction;
		});

		return Promise.all(reactionPromises);
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
		const reactionsQuery = this.reactionsCollectionRef()
			.where('network', '==', network)
			.where('proposalType', '==', proposalType)
			.where('indexOrHash', '==', indexOrHash)
			.where('commentId', '==', id);

		const reactionsQuerySnapshot = await reactionsQuery.get();
		const reactionPromises = reactionsQuerySnapshot.docs.map(async (doc) => {
			const data = doc.data();
			const publicUser = await this.GetPublicUserById(data.userId);

			return {
				...data,
				createdAt: data.createdAt?.toDate(),
				updatedAt: data.updatedAt?.toDate(),
				publicUser
			} as IReaction;
		});

		return Promise.all(reactionPromises);
	}

	static async GetReactionById(id: string): Promise<IReaction | null> {
		const reactionDocSnapshot = await this.reactionsCollectionRef().doc(id).get();
		if (!reactionDocSnapshot.exists) {
			return null;
		}

		const data = reactionDocSnapshot.data();

		if (!data) {
			return null;
		}

		const publicUser = await this.GetPublicUserById(data.userId);

		return {
			...data,
			createdAt: data.createdAt?.toDate(),
			updatedAt: data.updatedAt?.toDate(),
			publicUser
		} as IReaction;
	}

	static async GetLatestOffChainPostIndex(network: ENetwork, proposalType: EProposalType): Promise<number> {
		const postsQuery = this.postsCollectionRef().where('network', '==', network).where('proposalType', '==', proposalType).orderBy('index', 'desc').limit(1);
		const postsQuerySnapshot = await postsQuery.get();
		return postsQuerySnapshot.docs?.[0]?.data?.()?.index || 0;
	}

	static async GetUserActivitiesByUserId({ userId, network }: { userId: number; network: ENetwork }): Promise<IUserActivity[]> {
		const userActivityQuery = this.userActivityCollectionRef().where('userId', '==', userId).where('network', '==', network);
		const userActivityQuerySnapshot = await userActivityQuery.get();
		return userActivityQuerySnapshot.docs.map((doc) => {
			const data = doc.data();
			return {
				...data,
				createdAt: data.createdAt?.toDate(),
				updatedAt: data.updatedAt?.toDate()
			} as IUserActivity;
		});
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
		const reactionQuery = this.reactionsCollectionRef()
			.where('network', '==', network)
			.where('proposalType', '==', proposalType)
			.where('indexOrHash', '==', indexOrHash)
			.where('userId', '==', userId)
			.limit(1);

		const reactionQuerySnapshot = await reactionQuery.get();

		const publicUser = await this.GetPublicUserById(userId);
		const data = reactionQuerySnapshot.docs?.[0]?.data?.();

		if (!data) return null;

		const reaction: IReaction = {
			...reactionQuerySnapshot.docs?.[0]?.data?.(),
			createdAt: data.createdAt?.toDate(),
			updatedAt: data.updatedAt?.toDate(),
			publicUser
		} as IReaction;

		return reaction;
	}

	static async GetContentSummary({ network, indexOrHash, proposalType }: { network: ENetwork; indexOrHash: string; proposalType: EProposalType }): Promise<IContentSummary | null> {
		const contentSummaryQuery = this.contentSummariesCollectionRef()
			.where('network', '==', network)
			.where('proposalType', '==', proposalType)
			.where('indexOrHash', '==', indexOrHash)
			.orderBy('createdAt', 'desc') // just in case there are multiple summaries for the same post
			.limit(1);

		const contentSummaryQuerySnapshot = await contentSummaryQuery.get();

		if (contentSummaryQuerySnapshot.empty) {
			return null;
		}

		return {
			...contentSummaryQuerySnapshot.docs[0].data(),
			createdAt: contentSummaryQuerySnapshot.docs[0].data().createdAt?.toDate() || new Date(),
			updatedAt: contentSummaryQuerySnapshot.docs[0].data().updatedAt?.toDate() || new Date()
		} as IContentSummary;
	}

	static async IsUserFollowing({ userId, userIdToFollow }: { userId: number; userIdToFollow: number }): Promise<boolean> {
		const followingQuery = this.followersCollectionRef().where('followerUserId', '==', userId).where('followedUserId', '==', userIdToFollow).limit(1);
		const followingQuerySnapshot = await followingQuery.get();
		return followingQuerySnapshot.docs.length > 0;
	}

	static async GetFollowers(userId: number): Promise<IFollowEntry[]> {
		const followersQuery = this.followersCollectionRef().where('followedUserId', '==', userId);
		const followersQuerySnapshot = await followersQuery.get();
		return followersQuerySnapshot.docs.map((doc) => {
			const data = doc.data();
			return {
				...data,
				createdAt: data.createdAt?.toDate(),
				updatedAt: data.updatedAt?.toDate()
			} as IFollowEntry;
		});
	}

	static async GetFollowing(userId: number): Promise<IFollowEntry[]> {
		const followingQuery = this.followersCollectionRef().where('followerUserId', '==', userId);
		const followingQuerySnapshot = await followingQuery.get();
		return followingQuerySnapshot.docs.map((doc) => {
			const data = doc.data();
			return {
				...data,
				createdAt: data.createdAt?.toDate(),
				updatedAt: data.updatedAt?.toDate()
			} as IFollowEntry;
		});
	}

	static async GetVoteCart({ userId, network }: { userId: number; network: ENetwork }): Promise<IVoteCartItem[]> {
		const voteCartQuery = this.voteCartItemsCollectionRef().where('userId', '==', userId).where('network', '==', network);
		const voteCartQuerySnapshot = await voteCartQuery.get();
		return voteCartQuerySnapshot.docs.map((doc) => {
			const data = doc.data();
			return {
				...data,
				createdAt: data.createdAt?.toDate(),
				updatedAt: data.updatedAt?.toDate()
			} as IVoteCartItem;
		});
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
		const postSubscriptionQuery = this.postSubscriptionsCollectionRef()
			.where('network', '==', network)
			.where('indexOrHash', '==', indexOrHash)
			.where('proposalType', '==', proposalType)
			.where('userId', '==', userId)
			.limit(1);

		const postSubscriptionQuerySnapshot = await postSubscriptionQuery.get();

		if (postSubscriptionQuerySnapshot.empty) {
			return null;
		}

		const data = postSubscriptionQuerySnapshot.docs[0].data();

		return {
			...data,
			createdAt: data.createdAt?.toDate(),
			updatedAt: data.updatedAt?.toDate()
		} as IPostSubscription;
	}

	static async GetPostSubscriptionsByUserId({ userId, page, limit, network }: { userId: number; page: number; limit: number; network: ENetwork }): Promise<IPostSubscription[]> {
		const postSubscriptionsQuery = this.postSubscriptionsCollectionRef()
			.where('userId', '==', userId)
			.where('network', '==', network)
			.orderBy('createdAt', 'desc')
			.limit(limit)
			.offset(limit * (page - 1));
		const postSubscriptionsQuerySnapshot = await postSubscriptionsQuery.get();

		return postSubscriptionsQuerySnapshot.docs.map((doc) => {
			const data = doc.data();
			return {
				...data,
				createdAt: data.createdAt?.toDate(),
				updatedAt: data.updatedAt?.toDate()
			} as IPostSubscription;
		});
	}

	static async GetPostSubscriptionCountByUserId({ userId, network }: { userId: number; network: ENetwork }): Promise<number> {
		const postSubscriptionsQuery = this.postSubscriptionsCollectionRef().where('userId', '==', userId).where('network', '==', network).count();
		const postSubscriptionsQuerySnapshot = await postSubscriptionsQuery.get();
		return postSubscriptionsQuerySnapshot.data().count || 0;
	}

	static async GetTreasuryStats({ network, from, to, limit, page }: { network: ENetwork; from?: Date; to?: Date; limit: number; page: number }): Promise<ITreasuryStats[]> {
		let treasuryStatsQuery = this.treasuryStatsCollectionRef().where('network', '==', network);

		if (from) {
			treasuryStatsQuery = treasuryStatsQuery.where('createdAt', '>=', from);
		}

		if (to) {
			treasuryStatsQuery = treasuryStatsQuery.where('createdAt', '<=', to);
		}

		treasuryStatsQuery = treasuryStatsQuery
			.orderBy('createdAt', 'desc')
			.limit(limit)
			.offset(limit * (page - 1));

		const treasuryStatsQuerySnapshot = await treasuryStatsQuery.get();

		if (treasuryStatsQuerySnapshot.empty) {
			return [];
		}

		return treasuryStatsQuerySnapshot.docs.map((doc) => {
			const data = doc.data();
			return {
				...data,
				relayChain: {
					...data.relayChain,
					nextSpendAt: data.relayChain?.nextSpendAt?.toDate()
				},
				createdAt: data.createdAt?.toDate(),
				updatedAt: data.updatedAt?.toDate()
			} as ITreasuryStats;
		});
	}

	static async SaveTreasuryStats({ treasuryStats }: { treasuryStats: ITreasuryStats }) {
		await this.treasuryStatsCollectionRef().add(treasuryStats);
	}

	static async GetPolkassemblyDelegates(network: ENetwork): Promise<IDelegate[]> {
		const delegatesQuery = this.delegatesCollectionRef().where('network', '==', network);
		const delegatesQuerySnapshot = await delegatesQuery.get();
		return delegatesQuerySnapshot.docs.map((doc) => {
			const data = doc.data();
			return {
				...data,
				sources: [EDelegateSource.POLKASSEMBLY],
				createdAt: data.createdAt?.toDate(),
				updatedAt: data.updatedAt?.toDate()
			} as IDelegate;
		});
	}

	static async GetPolkassemblyDelegateByAddress({ network, address }: { network: ENetwork; address: string }): Promise<IDelegate | null> {
		const delegateQuery = this.delegatesCollectionRef().where('address', '==', address).where('network', '==', network).limit(1);
		const delegateQuerySnapshot = await delegateQuery.get();
		if (delegateQuerySnapshot.empty) {
			return null;
		}

		const data = delegateQuerySnapshot.docs[0].data();

		return {
			...data,
			createdAt: data.createdAt?.toDate(),
			updatedAt: data.updatedAt?.toDate()
		} as IDelegate;
	}

	// write methods
	static async UpdateApiKeyUsage(apiKey: string, apiRoute: string) {
		const apiUsageUpdate = {
			key: apiKey,
			usage: {
				[apiRoute]: {
					count: this.increment(1),
					last_used_at: new Date()
				}
			}
		};

		await this.apiKeysCollectionRef()
			.doc(apiKey)
			.set(apiUsageUpdate, { merge: true })
			.catch((err) => {
				console.log('error in updating api key usage', err);
			});
	}

	static async AddNewUser(user: IUser) {
		await this.usersCollectionRef().doc(user.id.toString()).set(user);
	}

	static async AddNewAddress(addressEntry: IUserAddress) {
		const substrateAddress = getSubstrateAddress(addressEntry.address);

		if (!substrateAddress) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST);
		}

		await this.addressesCollectionRef().doc(substrateAddress).set(addressEntry);
	}

	static async UpdateUserTfaDetails(userId: number, newTfaDetails: IUserTFADetails) {
		await this.usersCollectionRef().doc(userId.toString()).set({ twoFactorAuth: newTfaDetails }, { merge: true });
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
		let payload: Partial<IUser> = {};

		const profileDetails: IProfileDetails = {
			...(newProfileDetails?.badges?.length ? { badges: newProfileDetails.badges } : {}),
			...(newProfileDetails?.bio ? { bio: newProfileDetails.bio } : {}),
			...(newProfileDetails?.coverImage ? { coverImage: newProfileDetails.coverImage } : {}),
			...(newProfileDetails?.image ? { image: newProfileDetails.image } : {}),
			...(newProfileDetails?.title ? { title: newProfileDetails.title } : {}),
			...(newProfileDetails?.publicSocialLinks?.length ? { publicSocialLinks: newProfileDetails.publicSocialLinks } : {})
		};

		if (Object.keys(profileDetails).length) {
			payload = { ...payload, profileDetails };
		}

		if (Object.keys(notificationPreferences?.channelPreferences || {}).length || Object.keys(notificationPreferences?.triggerPreferences || {}).length) {
			payload = { ...payload, notificationPreferences };
		}

		await this.usersCollectionRef().doc(userId.toString()).set(payload, { merge: true });
	}

	static async UpdateUserEmail(userId: number, email: string) {
		// check if email is already in use
		const user = await this.GetUserByEmail(email);
		if (user) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Email already in use');
		}

		await this.usersCollectionRef().doc(userId.toString()).set({ email, isEmailVerified: false }, { merge: true });
	}

	static async UpdateUserUsername(userId: number, username: string) {
		// check if username is already in use
		const user = await this.GetUserByUsername(username);
		if (user) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Username already in use');
		}

		await this.usersCollectionRef().doc(userId.toString()).set({ username }, { merge: true });
	}

	// Helper function to process documents in batches
	private static async processBatch({
		querySnapshot,
		batchOperation,
		batchSize = 400 // limit is 500
	}: {
		querySnapshot: QuerySnapshot;
		batchOperation: (batch: WriteBatch, doc: QueryDocumentSnapshot) => void;
		batchSize?: number;
	}) {
		const batches: WriteBatch[] = [];
		let currentBatch = this.firestoreDb.batch();
		let operationCount = 0;

		querySnapshot.docs.forEach((doc) => {
			if (operationCount === batchSize) {
				batches.push(currentBatch);
				currentBatch = this.firestoreDb.batch();
				operationCount = 0;
			}
			batchOperation(currentBatch, doc);
			operationCount += 1;
		});

		if (operationCount > 0) {
			batches.push(currentBatch);
		}

		// Execute all batches
		await Promise.all(batches.map((batch) => batch.commit()));
	}

	static async DeleteUser(userId: number) {
		// Delete user document
		const userBatch = this.firestoreDb.batch();
		userBatch.delete(this.usersCollectionRef().doc(userId.toString()));
		await userBatch.commit();

		// Fetch and delete all related collections
		const collections = [
			{
				query: this.addressesCollectionRef().where('userId', '==', userId),
				name: 'addresses'
			},
			{
				query: this.userActivityCollectionRef().where('userId', '==', userId),
				name: 'user activities'
			},
			{
				query: this.commentsCollectionRef().where('userId', '==', userId),
				name: 'comments'
			},
			{
				query: this.reactionsCollectionRef().where('userId', '==', userId),
				name: 'reactions'
			},
			{
				query: this.notificationsCollectionRef().where('userId', '==', userId),
				name: 'notifications'
			}
		];

		await Promise.all(
			collections.map(async (collection) => {
				const querySnapshot = await collection.query.get();
				if (!querySnapshot.empty) {
					console.log(`Deleting ${querySnapshot.size} ${collection.name} documents`);
					await this.processBatch({
						querySnapshot,
						batchOperation: (batch, doc) => batch.delete(doc.ref)
					});
				}
			})
		);
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
		address?: string;
		sentiment?: ECommentSentiment;
	}) {
		const newCommentId = this.commentsCollectionRef().doc().id;

		const newComment: IComment = {
			id: newCommentId,
			network,
			proposalType,
			userId,
			content,
			createdAt: new Date(),
			updatedAt: new Date(),
			isDeleted: false,
			indexOrHash,
			parentCommentId: parentCommentId || null,
			dataSource: EDataSource.POLKASSEMBLY,
			...(sentiment && { sentiment })
		};

		await this.commentsCollectionRef().doc(newCommentId).set(newComment);

		return newComment;
	}

	static async UpdateComment({ commentId, content, isSpam, aiSentiment }: { commentId: string; content: string; isSpam?: boolean; aiSentiment?: ECommentSentiment }) {
		const newCommentData: Partial<IComment> = {
			content,
			...(isSpam && { isSpam }),
			...(aiSentiment && { aiSentiment }),
			updatedAt: new Date(),
			dataSource: EDataSource.POLKASSEMBLY
		};

		await this.commentsCollectionRef().doc(commentId).set(newCommentData, { merge: true });
	}

	static async DeleteComment(commentId: string) {
		await this.commentsCollectionRef().doc(commentId).set({ isDeleted: true, updatedAt: new Date() }, { merge: true });
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
		// if user has already reacted to this post, replace the reaction
		const existingReaction = await this.reactionsCollectionRef()
			.where('network', '==', network)
			.where('proposalType', '==', proposalType)
			.where('indexOrHash', '==', indexOrHash)
			.where('userId', '==', userId)
			.get();

		let reactionId = this.reactionsCollectionRef().doc().id;

		if (existingReaction.docs.length) {
			reactionId = existingReaction.docs[0].id;
		}

		await this.reactionsCollectionRef()
			.doc(reactionId)
			.set(
				{
					id: reactionId,
					network,
					indexOrHash,
					proposalType,
					userId,
					reaction,
					createdAt: existingReaction.docs.length ? existingReaction.docs[0].data().createdAt?.toDate() : new Date(),
					updatedAt: new Date()
				},
				{ merge: true }
			);

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
		// if user has already reacted to this comment, replace the reaction
		const existingReaction = await this.reactionsCollectionRef()
			.where('network', '==', network)
			.where('proposalType', '==', proposalType)
			.where('indexOrHash', '==', indexOrHash)
			.where('userId', '==', userId)
			.where('commentId', '==', commentId)
			.get();

		let reactionId = this.reactionsCollectionRef().doc().id;

		if (existingReaction.docs.length) {
			reactionId = existingReaction.docs[0].id;
		}

		await this.reactionsCollectionRef()
			.doc(reactionId)
			.set(
				{
					network,
					indexOrHash,
					proposalType,
					userId,
					reaction,
					commentId,
					createdAt: existingReaction.docs.length ? existingReaction.docs[0].data().createdAt?.toDate() : new Date(),
					updatedAt: new Date()
				},
				{ merge: true }
			);

		return reactionId;
	}

	static async DeleteReactionById(id: string) {
		await this.reactionsCollectionRef().doc(id).delete();
	}

	static async UpdatePost({
		id,
		content,
		title,
		allowedCommentor,
		linkedPost
	}: {
		id?: string;
		content: string;
		title: string;
		allowedCommentor: EAllowedCommentor;
		linkedPost?: IPostLink;
	}) {
		if (!id) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST, 'Post ID is required');
		}

		await this.postsCollectionRef()
			.doc(String(id))
			.set({ content, title, allowedCommentor, updatedAt: new Date(), ...(linkedPost && { linkedPost }) }, { merge: true });

		// add back link to linkedPost for linkedPost if it exists
		if (linkedPost) {
			const updatedPostData = (await this.postsCollectionRef().doc(String(id)).get()).data() as IOffChainPost;

			const linkedPostSnapshot = await this.postsCollectionRef()
				.where('network', '==', updatedPostData.network)
				.where('proposalType', '==', linkedPost.proposalType)
				.where('indexOrHash', '==', linkedPost.indexOrHash)
				.limit(1)
				.get();

			const linkedPostDoc = !linkedPostSnapshot.empty ? linkedPostSnapshot.docs[0] : null;

			const backLink: IPostLink = {
				proposalType: updatedPostData.proposalType,
				indexOrHash: String(updatedPostData.index ?? updatedPostData.hash)
			};

			if (linkedPostDoc && backLink.indexOrHash) {
				await linkedPostDoc.ref.set({ linkedPost: backLink }, { merge: true });
			}
		}
	}

	static async CreatePost({
		network,
		proposalType,
		userId,
		content,
		indexOrHash,
		title,
		allowedCommentor,
		tags,
		topic,
		linkedPost
	}: {
		network: ENetwork;
		proposalType: EProposalType;
		userId: number;
		content: string;
		indexOrHash?: string;
		title: string;
		allowedCommentor: EAllowedCommentor;
		tags?: ITag[];
		topic?: EOffChainPostTopic;
		linkedPost?: IPostLink;
	}): Promise<{ id: string; indexOrHash: string }> {
		const newPostId = this.postsCollectionRef().doc().id;

		const newIndex = proposalType === EProposalType.TIP ? indexOrHash : (Number(indexOrHash) ?? (await this.GetLatestOffChainPostIndex(network, proposalType)) + 1);

		const newPost: IOffChainPost = {
			id: newPostId,
			network,
			proposalType,
			userId,
			content,
			title,
			createdAt: new Date(),
			updatedAt: new Date(),
			dataSource: EDataSource.POLKASSEMBLY,
			allowedCommentor,
			isDeleted: false,
			...(linkedPost && { linkedPost })
		};
		if (tags && tags.every((tag) => ValidatorService.isValidTag(tag.value))) newPost.tags = tags;
		if (topic && ValidatorService.isValidOffChainPostTopic(topic)) newPost.topic = topic;

		if (proposalType === EProposalType.TIP) {
			newPost.hash = indexOrHash;
		} else {
			newPost.index = Number(newIndex);
		}
		await this.postsCollectionRef().doc(newPostId).set(newPost, { merge: true });

		return { id: newPostId, indexOrHash: String(newIndex) };
	}

	static async AddUserActivity(activity: IUserActivity) {
		const newActivityId = this.userActivityCollectionRef().doc().id;
		await this.userActivityCollectionRef()
			.doc(newActivityId)
			.set({ ...activity, id: newActivityId });
	}

	static async IncrementUserProfileScore({ userId, score }: { userId: number; score: number }) {
		await this.usersCollectionRef()
			.doc(userId.toString())
			.set({ profileScore: this.increment(score) }, { merge: true });
	}

	static async IncrementAddressProfileScore({ address, score }: { address: string; score: number }) {
		await this.addressesCollectionRef()
			.doc(address)
			.set({ profileScore: this.increment(score) }, { merge: true });
	}

	static async UpdateUserPassword(userId: number, password: string, salt: string) {
		await this.usersCollectionRef().doc(userId.toString()).set({ password, salt }, { merge: true });
	}

	static async UpdateLastCommentAtPost({
		network,
		indexOrHash,
		proposalType,
		lastCommentAt
	}: {
		network: ENetwork;
		indexOrHash: string;
		proposalType: EProposalType;
		lastCommentAt: Date;
	}) {
		const post = await this.postsCollectionRef().where('network', '==', network).where('proposalType', '==', proposalType).where('indexOrHash', '==', indexOrHash).limit(1).get();

		if (post.docs.length) {
			await post.docs[0].ref.set({ lastCommentAt }, { merge: true });
		}
	}

	static async UpdateContentSummary(contentSummary: IContentSummary) {
		const contentSummaryId = contentSummary.id || this.contentSummariesCollectionRef().doc().id;
		await this.contentSummariesCollectionRef()
			.doc(contentSummaryId)
			.set({ ...contentSummary, id: contentSummaryId }, { merge: true });
	}

	static async FollowUser({ userId, userIdToFollow }: { userId: number; userIdToFollow: number }) {
		const newFollowEntryId = this.followersCollectionRef().doc().id;

		const followEntry: IFollowEntry = {
			id: newFollowEntryId,
			createdAt: new Date(),
			followerUserId: userId,
			followedUserId: userIdToFollow,
			updatedAt: new Date()
		};

		await this.followersCollectionRef().doc(newFollowEntryId).set(followEntry);
	}

	static async UnfollowUser({ userId, userIdToUnfollow }: { userId: number; userIdToUnfollow: number }) {
		const followEntry = await this.followersCollectionRef().where('followerUserId', '==', userId).where('followedUserId', '==', userIdToUnfollow).limit(1).get();

		if (followEntry.docs.length) {
			await followEntry.docs[0].ref.delete();
		}
	}

	static async GetAllTags(network: ENetwork): Promise<IGenericListingResponse<ITag>> {
		const tags = await this.tagsCollectionRef().where('network', '==', network).get();
		return {
			items: tags.docs
				.filter((doc) => doc.data().value)
				.map((doc) => {
					const data = doc.data();
					return {
						lastUsedAt: data.lastUsedAt?.toDate?.() || new Date(),
						value: data.value,
						network: data.network
					} as ITag;
				}),
			totalCount: tags.size
		};
	}

	static async CreateTags(tags: ITag[]) {
		const batch = this.firestoreDb.batch();

		tags?.forEach((tag) => {
			const docId = `${tag.value}_${tag.network}`;
			batch.set(this.tagsCollectionRef().doc(docId), { value: tag.value, lastUsedAt: new Date(), network: tag.network }, { merge: true });
		});

		await batch.commit();
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
		const existingVoteCartItem = await this.voteCartItemsCollectionRef()
			.where('userId', '==', userId)
			.where('postIndexOrHash', '==', postIndexOrHash)
			.where('proposalType', '==', proposalType)
			.where('network', '==', network)
			.limit(1)
			.get();

		if (existingVoteCartItem.docs.length) {
			await existingVoteCartItem.docs[0].ref.set({ decision, amount, conviction, updatedAt: new Date() }, { merge: true });
			const data = existingVoteCartItem.docs[0].data();
			return {
				...data,
				decision,
				amount,
				conviction,
				createdAt: data.createdAt?.toDate?.(),
				updatedAt: new Date()
			} as IVoteCartItem;
		}

		const newVoteCartItemId = this.voteCartItemsCollectionRef().doc().id;

		const voteCartItem: IVoteCartItem = {
			id: newVoteCartItemId,
			createdAt: new Date(),
			updatedAt: new Date(),
			userId,
			postIndexOrHash,
			proposalType,
			decision,
			amount,
			conviction,
			network
		};

		await this.voteCartItemsCollectionRef().doc(newVoteCartItemId).set(voteCartItem);

		return voteCartItem;
	}

	static async DeleteVoteCartItem({ userId, voteCartItemId }: { userId: number; voteCartItemId: string }) {
		const voteCartItem = await this.voteCartItemsCollectionRef().where('userId', '==', userId).where('id', '==', voteCartItemId).limit(1).get();

		if (voteCartItem.docs.length) {
			await voteCartItem.docs[0].ref.delete();
		}
	}

	static async ClearVoteCart({ userId }: { userId: number }) {
		const voteCartItems = await FirestoreUtils.voteCartItemsCollectionRef().where('userId', '==', userId).get();
		await Promise.all(voteCartItems.docs.map((doc) => doc.ref.delete()));
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
		const voteCartItem = await this.voteCartItemsCollectionRef().where('userId', '==', userId).where('id', '==', voteCartItemId).limit(1).get();

		if (voteCartItem.docs.length) {
			await voteCartItem.docs[0].ref.set({ decision, amount, conviction, updatedAt: new Date() }, { merge: true });
		}
	}

	static async AddPostSubscription({ network, indexOrHash, proposalType, userId }: { network: ENetwork; indexOrHash: string; proposalType: EProposalType; userId: number }) {
		const newPostSubscriptionId = this.postSubscriptionsCollectionRef().doc().id;

		const postSubscription: IPostSubscription = {
			id: newPostSubscriptionId,
			createdAt: new Date(),
			updatedAt: new Date(),
			network,
			indexOrHash,
			proposalType,
			userId
		};

		await this.postSubscriptionsCollectionRef().doc(newPostSubscriptionId).set(postSubscription);

		return postSubscription;
	}

	static async DeletePostSubscription({ network, indexOrHash, proposalType, userId }: { network: ENetwork; indexOrHash: string; proposalType: EProposalType; userId: number }) {
		const postSubscription = await this.postSubscriptionsCollectionRef()
			.where('network', '==', network)
			.where('indexOrHash', '==', indexOrHash)
			.where('proposalType', '==', proposalType)
			.where('userId', '==', userId)
			.limit(1)
			.get();

		if (postSubscription.docs.length) {
			await postSubscription.docs[0].ref.delete();
		}
	}

	static async AddPolkassemblyDelegate({ network, address, manifesto }: { network: ENetwork; address: string; manifesto: string }) {
		const existingDelegate = await this.delegatesCollectionRef().where('network', '==', network).where('address', '==', address).limit(1).get();

		if (existingDelegate.docs.length) {
			throw new APIError(ERROR_CODES.ALREADY_EXISTS, StatusCodes.CONFLICT, 'This address is already registered as a delegate.');
		}

		const newPolkassemblyDelegateId = this.delegatesCollectionRef().doc().id;

		const polkassemblyDelegate: IDelegate = {
			id: newPolkassemblyDelegateId,
			createdAt: new Date(),
			updatedAt: new Date(),
			network,
			address,
			manifesto,
			sources: [EDelegateSource.POLKASSEMBLY]
		};

		await this.delegatesCollectionRef().doc(newPolkassemblyDelegateId).set(polkassemblyDelegate);

		return newPolkassemblyDelegateId;
	}

	static async UpdatePolkassemblyDelegate({ network, address, manifesto }: { network: ENetwork; address: string; manifesto: string }) {
		const existingDelegate = await this.delegatesCollectionRef().where('network', '==', network).where('address', '==', address).limit(1).get();

		if (!existingDelegate.docs.length) {
			throw new APIError(ERROR_CODES.NOT_FOUND, StatusCodes.NOT_FOUND, 'This address is not registered as a delegate.');
		}

		await existingDelegate.docs[0].ref.set({ manifesto, updatedAt: new Date() }, { merge: true });
	}

	static async DeletePolkassemblyDelegate({ network, address }: { network: ENetwork; address: string }) {
		const delegate = await this.delegatesCollectionRef().where('network', '==', network).where('address', '==', address).limit(1).get();

		if (delegate.docs.length) {
			await delegate.docs[0].ref.delete();
		}
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
		// Check if the user already has this social handle type
		const userSocialHandleQuery = address
			? await this.userSocialsCollectionRef().where('userId', '==', userId).where('address', '==', address).where('social', '==', social).limit(1).get()
			: await this.userSocialsCollectionRef().where('userId', '==', userId).where('social', '==', social).limit(1).get();

		if (!userSocialHandleQuery.empty) {
			// Update existing social handle
			const docId = userSocialHandleQuery.docs[0].id;
			const existingSocialHandle = userSocialHandleQuery.docs[0].data();
			await this.userSocialsCollectionRef()
				.doc(docId)
				.set(
					{
						...existingSocialHandle,
						status,
						updatedAt: new Date()
					},
					{ merge: true }
				);
			return {
				...existingSocialHandle,
				status,
				updatedAt: new Date()
			} as ISocialHandle;
		}
		// Create new social handle
		const newSocialVerificationId = this.userSocialsCollectionRef().doc().id;

		const socialHandle = {
			userId,
			address,
			social,
			handle,
			status,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		await this.userSocialsCollectionRef()
			.doc(newSocialVerificationId)
			.set({ ...socialHandle, ...(verificationToken && { verificationToken }) }, { merge: true });
		return { ...socialHandle, verificationToken: { token: verificationToken?.token } };
	}

	static async GetUserSocialHandles({ userId, address }: { userId: number; address: string }) {
		const socialVerification = await this.userSocialsCollectionRef().where('userId', '==', userId).where('address', '==', address).get();

		const socialHandles = {} as Record<ESocial, ISocialHandle>;

		socialVerification.docs.forEach((doc) => {
			const data = doc.data() as ISocialHandle;
			socialHandles[data.social] = data;
		});

		return socialHandles;
	}

	static async GetSocialHandleByToken({ token }: { token: string }) {
		const socialVerification = await this.userSocialsCollectionRef().where('verificationToken.token', '==', token).limit(1).get();

		if (socialVerification.docs.length) {
			return socialVerification.docs[0].data() as ISocialHandle;
		}

		return null;
	}

	static async UpdateSocialHandleByToken({ token, status }: { token: string; status: ESocialVerificationStatus }) {
		const userSocialHandleQuery = await this.userSocialsCollectionRef().where('verificationToken.token', '==', token).limit(1).get();

		if (userSocialHandleQuery.docs.length) {
			await userSocialHandleQuery.docs[0].ref.set({ status, updatedAt: new Date() }, { merge: true });
		}
	}

	static async DeleteOffChainPost({ network, proposalType, index }: { network: ENetwork; proposalType: EProposalType; index: number }) {
		const post = await this.postsCollectionRef().where('network', '==', network).where('proposalType', '==', proposalType).where('index', '==', index).limit(1).get();

		if (post.docs.length) {
			await post.docs[0].ref.set({ isDeleted: true, updatedAt: new Date() }, { merge: true });
		}
	}

	static async GetPostsByUserId({ userId, network, page, limit, proposalType }: { userId: number; network: ENetwork; page: number; limit: number; proposalType: EProposalType }) {
		const postRef = this.postsCollectionRef().where('userId', '==', userId).where('network', '==', network).where('proposalType', '==', proposalType);
		const totalCount = await postRef.count().get();
		const posts = await postRef
			.orderBy('createdAt', 'desc')
			.limit(limit)
			.offset((page - 1) * limit)
			.get();

		return {
			items: posts.docs.map((doc) => doc.data() as IOffChainPost),
			totalCount: totalCount.data().count
		};
	}

	static async DeleteContentSummary({ network, proposalType, indexOrHash }: { network: ENetwork; proposalType: EProposalType; indexOrHash: string }) {
		const contentSummary = await this.contentSummariesCollectionRef()
			.where('network', '==', network)
			.where('proposalType', '==', proposalType)
			.where('indexOrHash', '==', indexOrHash)
			.get();

		if (contentSummary.docs.length) {
			// sometimes multiple content summaries are generated for the same post
			await Promise.all(contentSummary.docs.map((doc) => doc.ref.delete()));
		}
	}
}
