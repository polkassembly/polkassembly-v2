// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ENetwork, EProposalType, IOffChainPost, IUser, IUserAddress } from '@shared/types';
import { OffChainFirestoreService } from './offchain_firestore_service';

export class OffChainDbService {
	// Read methods
	static async GetTotalUsersCount(): Promise<number> {
		return OffChainFirestoreService.GetTotalUsersCount();
	}

	static async IsEmailInUse(email: string): Promise<boolean> {
		const userByEmail = await OffChainFirestoreService.GetUserByEmail(email);
		return Boolean(userByEmail);
	}

	static async IsUsernameInUse(username: string): Promise<boolean> {
		const userByUsername = await OffChainFirestoreService.GetUserByUsername(username);
		return Boolean(userByUsername);
	}

	static async GetUserByEmail(email: string): Promise<IUser | null> {
		return OffChainFirestoreService.GetUserByEmail(email);
	}

	static async GetUserByUsername(username: string): Promise<IUser | null> {
		return OffChainFirestoreService.GetUserByUsername(username);
	}

	static async GetUserById(userId: number): Promise<IUser | null> {
		return OffChainFirestoreService.GetUserById(userId);
	}

	static async GetUserByAddress(address: string): Promise<IUser | null> {
		return OffChainFirestoreService.GetUserByAddress(address);
	}

	static async GetAddressesForUserId(userId: number): Promise<IUserAddress[]> {
		return OffChainFirestoreService.GetAddressesForUserId(userId);
	}

	static async GetOffChainPostData({ network, indexOrHash, proposalType }: { network: ENetwork; indexOrHash: string; proposalType: EProposalType }): Promise<IOffChainPost | null> {
		const post = await OffChainFirestoreService.GetOffChainPostData({ network, indexOrHash, proposalType });
		if (post) return post;

		// TODO: add fallback for subsquare

		return null;
	}

	static async GetOffChainPostsListing({
		network,
		proposalType,
		limit,
		page
	}: {
		network: ENetwork;
		proposalType: EProposalType;
		limit: number;
		page: number;
	}): Promise<IOffChainPost[]> {
		const posts = await OffChainFirestoreService.GetOffChainPostsListing({ network, proposalType, limit, page });
		if (posts.length) return posts;

		// TODO: add fallback for subsquare
		return [];
	}

	// Write methods

	static async UpdateApiKeyUsage(apiKey: string, apiRoute: string) {
		return OffChainFirestoreService.UpdateApiKeyUsage(apiKey, apiRoute);
	}

	static async AddNewUser(user: IUser) {
		return OffChainFirestoreService.AddNewUser(user);
	}
}
