// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EDataSource, ENetwork, EProposalType, IOffChainPost, IUser, IUserTFADetails, IUserAddress, IComment } from '@/_shared/types';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { APIError } from '@/app/api/_api-utils/apiError';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
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

	static async GetUserByAddress(address: string): Promise<IUser | null> {
		const addressDocSnapshot = await FirestoreRefs.getAddressDocRefByAddress(address).get();
		if (!addressDocSnapshot.exists) {
			return null;
		}

		const addressData = addressDocSnapshot.data() as IUserAddress;

		return this.GetUserById(addressData.userId);
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
			.limit(1)
			.get();

		// if proposal type is tip then index is hash
		if (proposalType === EProposalType.TIP) {
			postDocSnapshot = await FirestoreRefs.postsCollectionRef()
				.where('proposalType', '==', proposalType)
				.where('hash', '==', indexOrHash)
				.where('network', '==', network)
				.limit(1)
				.get();
		}

		if (postDocSnapshot.empty) {
			return null;
		}

		const postData = postDocSnapshot.docs[0].data();

		return {
			...postData,
			dataSource: EDataSource.POLKASSEMBLY,
			createdAt: postData.createdAt?.toDate(),
			updatedAt: postData.updatedAt?.toDate()
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

		postsQuery = postsQuery.limit(limit).offset((page - 1) * limit);

		const postsQuerySnapshot = await postsQuery.get();

		return postsQuerySnapshot.docs.map((doc) => {
			const data = doc.data();

			return {
				...data,
				createdAt: data.createdAt?.toDate(),
				updatedAt: data.updatedAt?.toDate()
			} as IOffChainPost;
		});
	}

	static async GetTotalOffChainPostsCount({ network, proposalType, tags }: { network: ENetwork; proposalType: EProposalType; tags?: string[] }): Promise<number> {
		let postsQuery = FirestoreRefs.postsCollectionRef().where('proposalType', '==', proposalType).where('network', '==', network);

		if (tags?.length) {
			postsQuery = postsQuery.where('tags', 'array-contains-any', tags);
		}

		const countSnapshot = await postsQuery.count().get();
		return countSnapshot.data().count || 0;
	}

	static async GetPostComments({ network, indexOrHash, proposalType }: { network: ENetwork; indexOrHash: string; proposalType: EProposalType }): Promise<IComment[]> {
		let commentsQuery = FirestoreRefs.commentsCollectionRef().where('network', '==', network).where('proposalType', '==', proposalType);

		if (proposalType === EProposalType.TIP) {
			commentsQuery = commentsQuery.where('hash', '==', indexOrHash);
		} else {
			commentsQuery = commentsQuery.where('index', '==', Number(indexOrHash));
		}

		const commentsQuerySnapshot = await commentsQuery.get();

		return commentsQuerySnapshot.docs.map((doc) => {
			const data = doc.data();

			return {
				...data,
				createdAt: data.createdAt?.toDate(),
				updatedAt: data.updatedAt?.toDate()
			} as IComment;
		});
	}

	static async GetCommentById(id: string): Promise<IComment | null> {
		const commentDocSnapshot = await FirestoreRefs.commentsCollectionRef().doc(id).get();
		if (!commentDocSnapshot.exists) {
			return null;
		}

		const data = commentDocSnapshot.data();

		if (!data) {
			return null;
		}

		return {
			...data,
			createdAt: data.createdAt?.toDate(),
			updatedAt: data.updatedAt?.toDate()
		} as IComment;
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
		parentCommentId
	}: {
		network: ENetwork;
		indexOrHash: string;
		proposalType: EProposalType;
		userId: number;
		content: string;
		parentCommentId?: string;
	}) {
		const newCommentId = FirestoreRefs.commentsCollectionRef().doc().id;

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
			parentCommentId: parentCommentId || null
		};

		await FirestoreRefs.commentsCollectionRef().doc(newCommentId).set(newComment);
	}

	static async UpdateComment({ commentId, content }: { commentId: string; content: string }) {
		await FirestoreRefs.commentsCollectionRef().doc(commentId).set({ content, updatedAt: new Date() }, { merge: true });
	}

	static async DeleteComment(commentId: string) {
		await FirestoreRefs.commentsCollectionRef().doc(commentId).set({ isDeleted: true, updatedAt: new Date() }, { merge: true });
	}
}
