// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EDataSource, ENetwork, EProposalType, EWallet, IOffChainPost, IUser, IUserTFADetails, IUserAddress, IComment, IReaction, EReaction } from '@shared/types';
import { DEFAULT_POST_TITLE } from '@/_shared/_constants/defaultPostTitle';
import { getDefaultPostContent } from '@/_shared/_utils/getDefaultPostContent';
import { ValidatorService } from '@/_shared/_services/validator_service';
import { ERROR_CODES } from '@/_shared/_constants/errorLiterals';
import { StatusCodes } from 'http-status-codes';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
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

	static async GetUserById(userId: number): Promise<IUser | null> {
		return FirestoreService.GetUserById(userId);
	}

	static async GetUserByAddress(address: string): Promise<IUser | null> {
		return FirestoreService.GetUserByAddress(address);
	}

	static async GetAddressesForUserId(userId: number): Promise<IUserAddress[]> {
		return FirestoreService.GetAddressesForUserId(userId);
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
		const post = await FirestoreService.GetOffChainPostData({ network, indexOrHash, proposalType });
		if (post) return post;

		const subsquarePost = await SubsquareOffChainService.GetOffChainPostData({ network, indexOrHash, proposalType });
		if (subsquarePost) return subsquarePost;

		return {
			index: proposalType !== EProposalType.TIP && indexOrHash.trim() !== '' && !isNaN(Number(indexOrHash)) ? Number(indexOrHash) : undefined,
			hash: proposalType === EProposalType.TIP ? indexOrHash : undefined,
			title: DEFAULT_POST_TITLE,
			content: getDefaultPostContent(proposalType, proposer),
			tags: [],
			dataSource: EDataSource.POLKASSEMBLY,
			proposalType,
			network
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

	static async GetPostComments({ network, indexOrHash, proposalType }: { network: ENetwork; indexOrHash: string; proposalType: EProposalType }): Promise<IComment[]> {
		return FirestoreService.GetPostComments({ network, indexOrHash, proposalType });
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

	// Write methods

	static async UpdateApiKeyUsage(apiKey: string, apiRoute: string) {
		return FirestoreService.UpdateApiKeyUsage(apiKey, apiRoute);
	}

	static async AddNewUser(user: IUser) {
		return FirestoreService.AddNewUser(user);
	}

	static async AddNewAddress({ address, userId, isDefault, wallet, network }: { address: string; userId: number; isDefault: boolean; wallet: EWallet; network: ENetwork }) {
		if (!ValidatorService.isValidEVMAddress(address) && !ValidatorService.isValidSubstrateAddress(address)) {
			throw new APIError(ERROR_CODES.BAD_REQUEST, StatusCodes.BAD_REQUEST);
		}

		const addressEntry = {
			address: ValidatorService.isValidEVMAddress(address) ? address : getSubstrateAddress(address),
			default: isDefault,
			network,
			userId,
			createdAt: new Date(),
			updatedAt: new Date(),
			wallet
		} as IUserAddress;
		return FirestoreService.AddNewAddress(addressEntry);
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
		content: string;
		parentCommentId?: string;
		address?: string;
	}) {
		return FirestoreService.AddNewComment({ network, indexOrHash, proposalType, userId, content, parentCommentId, address });
	}

	static async UpdateComment({ commentId, content }: { commentId: string; content: string }) {
		return FirestoreService.UpdateComment({ commentId, content });
	}

	static async DeleteComment(commentId: string) {
		return FirestoreService.DeleteComment(commentId);
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
	}) {
		return FirestoreService.AddPostReaction({ network, indexOrHash, proposalType, userId, reaction });
	}

	static async DeletePostReaction(id: string) {
		return FirestoreService.DeletePostReaction(id);
	}

	static async CreateOffChainPost({ network, proposalType, userId, content }: { network: ENetwork; proposalType: EProposalType; userId: number; content: string }) {
		if (!ValidatorService.isValidOffChainProposalType(proposalType)) {
			throw new APIError(ERROR_CODES.INVALID_PARAMS_ERROR, StatusCodes.BAD_REQUEST, 'Invalid proposal type for an off-chain post');
		}

		return FirestoreService.CreatePost({ network, proposalType, userId, content });
	}

	static async UpdateOffChainPost({
		network,
		indexOrHash,
		proposalType,
		userId,
		content
	}: {
		network: ENetwork;
		indexOrHash: string;
		proposalType: EProposalType;
		userId: number;
		content: string;
	}) {
		const postData = await this.GetOffChainPostData({ network, indexOrHash, proposalType });

		if (!postData || !postData.id) {
			throw new APIError(ERROR_CODES.POST_NOT_FOUND_ERROR, StatusCodes.NOT_FOUND);
		}

		if (postData.userId !== userId) {
			throw new APIError(ERROR_CODES.UNAUTHORIZED, StatusCodes.UNAUTHORIZED);
		}

		await FirestoreService.UpdatePost({ id: postData.id, content });
	}

	static async UpdateOnChainPost({
		network,
		indexOrHash,
		proposalType,
		userId,
		content
	}: {
		network: ENetwork;
		indexOrHash: string;
		proposalType: EProposalType;
		userId: number;
		content: string;
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

		if (!offChainPostData) {
			await FirestoreService.CreatePost({ network, proposalType, userId, content, indexOrHash });
		} else {
			await FirestoreService.UpdatePost({ id: offChainPostData.id, content });
		}
	}
}
