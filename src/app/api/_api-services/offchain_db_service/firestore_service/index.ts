// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

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
	EAllowedCommentor
} from '@/_shared/types';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { firestoreContentToEditorJs } from '@/app/api/_api-utils/firestoreContentToEditorJs';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { OutputData } from '@editorjs/editorjs';
import { htmlAndMarkdownFromEditorJs } from '@/_shared/_utils/htmlAndMarkdownFromEditorJs';
import { FirestoreRefs } from './firestoreRefs';

export class FirestoreService extends FirestoreRefs {
	// Read methods
	static async GetTotalUsersCount(): Promise<number> {
		const userDocSnapshot = await FirestoreRefs.usersCollectionRef().get();
		return userDocSnapshot.docs.length;
	}

	static async GetUserByEmail(email: string): Promise<IUser | null> {
		const userDocSnapshot = await FirestoreRefs.usersCollectionRef().where('email', '==', email).limit(1).get();
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
		const userDocSnapshot = await FirestoreRefs.usersCollectionRef().where('username', '==', username).limit(1).get();
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
		const userDocSnapshot = await FirestoreRefs.usersCollectionRef().doc(userId.toString()).get();
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
				await FirestoreRefs.usersCollectionRef()
					.where('profileScore', '>', Number(user.profileScore || 0))
					.count()
					.get()
			).data().count + 1;

		return {
			id: user.id,
			username: user.username,
			profileScore: user.profileScore,
			addresses: addresses.map((address) => address.address),
			rank
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
				await FirestoreRefs.usersCollectionRef()
					.where('profileScore', '>', Number(user.profileScore || 0))
					.count()
					.get()
			).data().count + 1;

		return {
			id: user.id,
			username: user.username,
			profileScore: user.profileScore,
			rank,
			addresses: addresses.map((addr) => addr.address)
		};
	}

	static async GetPublicUsers(page: number, limit: number): Promise<IPublicUser[]> {
		const usersQuery = FirestoreRefs.usersCollectionRef()
			.orderBy('profileScore', 'desc')
			.limit(limit)
			.offset((page - 1) * limit);

		const usersQuerySnapshot = await usersQuery.get();

		return Promise.all(
			usersQuerySnapshot.docs.map(async (doc) => {
				const data = doc.data();

				const addresses = await this.GetAddressesForUserId(data.id);
				const rank =
					(
						await FirestoreRefs.usersCollectionRef()
							.where('profileScore', '>', Number(data.profileScore || 0))
							.count()
							.get()
					).data().count + 1;

				return {
					id: data.id,
					username: data.username,
					profileScore: data.profileScore,
					addresses: addresses.map((addr: IUserAddress) => addr.address),
					rank
				} as IPublicUser;
			})
		);
	}

	static async GetUserByAddress(address: string): Promise<IUser | null> {
		const substrAddress = !address.startsWith('0x') ? getSubstrateAddress(address) : address;

		if (!substrAddress) {
			return null;
		}

		const addressDocSnapshot = await FirestoreRefs.getAddressDocRefByAddress(substrAddress).get();
		if (!addressDocSnapshot.exists) {
			return null;
		}

		const addressData = addressDocSnapshot.data() as IUserAddress;

		return this.GetUserById(addressData.userId);
	}

	static async getAddressDataByAddress(address: string): Promise<IUserAddress | null> {
		const substrAddress = !address.startsWith('0x') ? getSubstrateAddress(address) : address;

		if (!substrAddress) {
			return null;
		}

		const addressDocSnapshot = await FirestoreRefs.getAddressDocRefByAddress(substrAddress).get();
		if (!addressDocSnapshot.exists) {
			return null;
		}

		return addressDocSnapshot.data() as IUserAddress;
	}

	static async GetAddressesForUserId(userId: number): Promise<IUserAddress[]> {
		const addressesQuery = FirestoreRefs.addressesCollectionRef().where('userId', '==', userId);
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
		let postDocSnapshot = await FirestoreRefs.postsCollectionRef()
			.where('proposalType', '==', proposalType)
			.where('index', '==', Number(indexOrHash))
			.where('network', '==', network)
			.where('isDeleted', '==', false)
			.limit(1)
			.get();

		// if proposal type is tip then index is hash
		if (proposalType === EProposalType.TIP) {
			postDocSnapshot = await FirestoreRefs.postsCollectionRef()
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

		let { htmlContent = '', markdownContent = '' } = postData;
		const formattedContent = firestoreContentToEditorJs(postData.content);

		if (!htmlContent && !markdownContent && formattedContent) {
			const { html, markdown } = htmlAndMarkdownFromEditorJs(formattedContent);

			htmlContent = html;
			markdownContent = markdown;
		}

		return {
			...postData,
			content: formattedContent,
			htmlContent,
			markdownContent,
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
		tags
	}: {
		network: ENetwork;
		proposalType: EProposalType;
		limit: number;
		page: number;
		tags?: string[];
	}): Promise<IOffChainPost[]> {
		let postsQuery = FirestoreRefs.postsCollectionRef().where('proposalType', '==', proposalType).where('network', '==', network);

		if (tags?.length) {
			postsQuery = postsQuery.where('tags', 'array-contains-any', tags);
		}

		postsQuery = postsQuery
			.where('isDeleted', '==', false)
			.limit(limit)
			.offset((page - 1) * limit);

		const postsQuerySnapshot = await postsQuery.get();

		const postsWithMetricsPromises = postsQuerySnapshot.docs.map(async (doc) => {
			const data = doc.data();
			const indexOrHash = data.hash || String(data.index);
			const metrics = await this.GetPostMetrics({ network, indexOrHash, proposalType });

			let { htmlContent = '', markdownContent = '' } = data;
			const formattedContent = firestoreContentToEditorJs(data.content);

			if (!htmlContent && !markdownContent && formattedContent) {
				const { html, markdown } = htmlAndMarkdownFromEditorJs(formattedContent);

				htmlContent = html;
				markdownContent = markdown;
			}

			return {
				...data,
				content: formattedContent,
				htmlContent,
				markdownContent,
				createdAt: data.createdAt?.toDate(),
				updatedAt: data.updatedAt?.toDate(),
				metrics,
				allowedCommentor: data.allowedCommentor || EAllowedCommentor.ALL
			} as IOffChainPost;
		});

		return Promise.all(postsWithMetricsPromises);
	}

	static async GetTotalOffChainPostsCount({ network, proposalType, tags }: { network: ENetwork; proposalType: EProposalType; tags?: string[] }): Promise<number> {
		let postsQuery = FirestoreRefs.postsCollectionRef().where('proposalType', '==', proposalType).where('network', '==', network);

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
			const reactionCount = await FirestoreRefs.reactionsCollectionRef()
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
		const commentsCount = await FirestoreRefs.commentsCollectionRef()
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
		const commentsQuery = FirestoreRefs.commentsCollectionRef()
			.where('network', '==', network)
			.where('proposalType', '==', proposalType)
			.where('indexOrHash', '==', indexOrHash)
			.where('isDeleted', '==', false);

		const commentsQuerySnapshot = await commentsQuery.get();

		const commentResponsePromises = commentsQuerySnapshot.docs.map(async (doc) => {
			const dataRaw = doc.data();

			let { htmlContent = '', markdownContent = '' } = dataRaw;
			const formattedContent = firestoreContentToEditorJs(dataRaw.content);

			if (!htmlContent && !markdownContent && formattedContent) {
				const { html, markdown } = htmlAndMarkdownFromEditorJs(formattedContent);

				htmlContent = html;
				markdownContent = markdown;
			}

			const commentData = {
				...dataRaw,
				content: formattedContent,
				htmlContent,
				markdownContent,
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
				user,
				children: []
			} as ICommentResponse;
		});

		return (await Promise.all(commentResponsePromises)).filter((comment): comment is ICommentResponse => comment !== null);
	}

	static async GetCommentById(id: string): Promise<IComment | null> {
		const commentDocSnapshot = await FirestoreRefs.commentsCollectionRef().doc(id).get();
		if (!commentDocSnapshot.exists) {
			return null;
		}

		const data = commentDocSnapshot.data();

		if (!data || data.isDeleted) {
			return null;
		}

		let { htmlContent = '', markdownContent = '' } = data;
		const formattedContent = firestoreContentToEditorJs(data.content);

		if (!htmlContent && !markdownContent && formattedContent) {
			const { html, markdown } = htmlAndMarkdownFromEditorJs(formattedContent);

			htmlContent = html;
			markdownContent = markdown;
		}

		return {
			...data,
			content: formattedContent,
			htmlContent,
			markdownContent,
			createdAt: data.createdAt?.toDate(),
			updatedAt: data.updatedAt?.toDate()
		} as IComment;
	}

	static async GetPostReactions({ network, indexOrHash, proposalType }: { network: ENetwork; indexOrHash: string; proposalType: EProposalType }): Promise<IReaction[]> {
		const reactionsQuery = FirestoreRefs.reactionsCollectionRef().where('network', '==', network).where('proposalType', '==', proposalType).where('indexOrHash', '==', indexOrHash);
		const reactionsQuerySnapshot = await reactionsQuery.get();
		return reactionsQuerySnapshot.docs.map((doc) => {
			const data = doc.data();
			return {
				...data,
				createdAt: data.createdAt?.toDate(),
				updatedAt: data.updatedAt?.toDate()
			} as IReaction;
		});
	}

	static async GetPostReactionById(id: string): Promise<IReaction | null> {
		const reactionDocSnapshot = await FirestoreRefs.getReactionDocRefById(id).get();
		if (!reactionDocSnapshot.exists) {
			return null;
		}

		const data = reactionDocSnapshot.data();

		if (!data) {
			return null;
		}

		return {
			...data,
			createdAt: data.createdAt?.toDate(),
			updatedAt: data.updatedAt?.toDate()
		} as IReaction;
	}

	static async GetLatestOffChainPostIndex(network: ENetwork, proposalType: EProposalType): Promise<number> {
		const postsQuery = FirestoreRefs.postsCollectionRef().where('network', '==', network).where('proposalType', '==', proposalType).orderBy('index', 'desc').limit(1);
		const postsQuerySnapshot = await postsQuery.get();
		return postsQuerySnapshot.docs?.[0]?.data?.()?.index || 0;
	}

	static async GetUserActivitiesByUserId(id: number): Promise<IUserActivity[]> {
		const userActivityQuery = FirestoreRefs.userActivityCollectionRef().where('userId', '==', id);
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
		const reactionQuery = FirestoreRefs.reactionsCollectionRef()
			.where('network', '==', network)
			.where('proposalType', '==', proposalType)
			.where('indexOrHash', '==', indexOrHash)
			.where('userId', '==', userId)
			.limit(1);

		const reactionQuerySnapshot = await reactionQuery.get();

		return (reactionQuerySnapshot.docs?.[0]?.data?.() || null) as IReaction | null;
	}

	// write methods
	static async UpdateApiKeyUsage(apiKey: string, apiRoute: string) {
		const apiUsageUpdate = {
			key: apiKey,
			usage: {
				[apiRoute]: {
					count: FirestoreRefs.increment(1),
					last_used_at: new Date()
				}
			}
		};

		await FirestoreRefs.apiKeysCollectionRef()
			.doc(apiKey)
			.set(apiUsageUpdate, { merge: true })
			.catch((err) => {
				console.log('error in updating api key usage', err);
			});
	}

	static async AddNewUser(user: IUser) {
		await FirestoreRefs.usersCollectionRef().doc(user.id.toString()).set(user);
	}

	static async AddNewAddress(addressEntry: IUserAddress) {
		const substrateAddress = getSubstrateAddress(addressEntry.address);

		if (!substrateAddress) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST);
		}

		await FirestoreRefs.addressesCollectionRef().doc(substrateAddress).set(addressEntry);
	}

	static async UpdateUserTfaDetails(userId: number, newTfaDetails: IUserTFADetails) {
		await FirestoreRefs.usersCollectionRef().doc(userId.toString()).set({ twoFactorAuth: newTfaDetails }, { merge: true });
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
		const newCommentId = FirestoreRefs.commentsCollectionRef().doc().id;

		const { html, markdown } = htmlAndMarkdownFromEditorJs(content);

		const newComment: IComment = {
			id: newCommentId,
			network,
			proposalType,
			userId,
			content,
			htmlContent: html,
			markdownContent: markdown,
			createdAt: new Date(),
			updatedAt: new Date(),
			isDeleted: false,
			indexOrHash,
			parentCommentId: parentCommentId || null,
			address: address || null,
			dataSource: EDataSource.POLKASSEMBLY
		};

		await FirestoreRefs.commentsCollectionRef().doc(newCommentId).set(newComment);

		return newComment;
	}

	static async UpdateComment({ commentId, content }: { commentId: string; content: OutputData }) {
		const { html, markdown } = htmlAndMarkdownFromEditorJs(content);

		await FirestoreRefs.commentsCollectionRef().doc(commentId).set({ content, htmlContent: html, markdownContent: markdown, updatedAt: new Date() }, { merge: true });
	}

	static async DeleteComment(commentId: string) {
		await FirestoreRefs.commentsCollectionRef().doc(commentId).set({ isDeleted: true, updatedAt: new Date() }, { merge: true });
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
		const existingReaction = await FirestoreRefs.reactionsCollectionRef()
			.where('network', '==', network)
			.where('proposalType', '==', proposalType)
			.where('indexOrHash', '==', indexOrHash)
			.where('userId', '==', userId)
			.get();

		let reactionId = FirestoreRefs.reactionsCollectionRef().doc().id;

		if (existingReaction.docs.length) {
			reactionId = existingReaction.docs[0].id;
		}

		await FirestoreRefs.getReactionDocRefById(reactionId).set(
			{
				id: reactionId,
				network,
				indexOrHash,
				proposalType,
				userId,
				reaction,
				createdAt: existingReaction.docs.length ? existingReaction.docs[0].data().createdAt.toDate() : new Date(),
				updatedAt: new Date()
			},
			{ merge: true }
		);

		return reactionId;
	}

	static async DeletePostReaction(id: string) {
		await FirestoreRefs.getReactionDocRefById(id).delete();
	}

	static async UpdatePost({ id, content, title, allowedCommentor }: { id?: string; content: OutputData; title: string; allowedCommentor: EAllowedCommentor }) {
		const { html, markdown } = htmlAndMarkdownFromEditorJs(content);

		await FirestoreRefs.getPostDocRefById(String(id)).set(
			{ content, htmlContent: html, markdownContent: markdown, title, allowedCommentor, updatedAt: new Date() },
			{ merge: true }
		);
	}

	static async CreatePost({
		network,
		proposalType,
		userId,
		content,
		indexOrHash,
		title,
		allowedCommentor
	}: {
		network: ENetwork;
		proposalType: EProposalType;
		userId: number;
		content: OutputData;
		indexOrHash?: string;
		title: string;
		allowedCommentor: EAllowedCommentor;
	}): Promise<{ id: string; indexOrHash: string }> {
		const newPostId = FirestoreRefs.postsCollectionRef().doc().id;

		const { html, markdown } = htmlAndMarkdownFromEditorJs(content);

		const newIndex = proposalType === EProposalType.TIP ? indexOrHash : (Number(indexOrHash) ?? (await this.GetLatestOffChainPostIndex(network, proposalType)) + 1);

		const newPost: IOffChainPost = {
			id: newPostId,
			network,
			proposalType,
			userId,
			content,
			htmlContent: html,
			markdownContent: markdown,
			title,
			createdAt: new Date(),
			updatedAt: new Date(),
			dataSource: EDataSource.POLKASSEMBLY,
			allowedCommentor,
			isDeleted: false
		};

		if (proposalType === EProposalType.TIP) {
			newPost.hash = indexOrHash;
		} else {
			newPost.index = Number(newIndex);
		}

		await FirestoreRefs.getPostDocRefById(newPostId).set(newPost, { merge: true });

		return { id: newPostId, indexOrHash: String(newIndex) };
	}

	static async AddUserActivity(activity: IUserActivity) {
		const newActivityId = FirestoreRefs.userActivityCollectionRef().doc().id;
		await FirestoreRefs.userActivityCollectionRef()
			.doc(newActivityId)
			.set({ ...activity, id: newActivityId });
	}

	static async IncrementUserProfileScore(userId: number, score: number) {
		await FirestoreRefs.usersCollectionRef()
			.doc(userId.toString())
			.set({ profileScore: FirestoreRefs.increment(score) }, { merge: true });
	}

	static async UpdateUserPassword(userId: number, password: string, salt: string) {
		await FirestoreRefs.usersCollectionRef().doc(userId.toString()).set({ password, salt }, { merge: true });
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
		const post = await FirestoreRefs.postsCollectionRef()
			.where('network', '==', network)
			.where('proposalType', '==', proposalType)
			.where('indexOrHash', '==', indexOrHash)
			.limit(1)
			.get();

		if (post.docs.length) {
			await post.docs[0].ref.set({ lastCommentAt }, { merge: true });
		}
	}
}
