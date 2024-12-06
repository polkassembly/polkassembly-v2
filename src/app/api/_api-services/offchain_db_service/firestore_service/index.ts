// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EDataSource, ENetwork, EProposalType, IOffChainPost, IUser, IUserAddress } from '@/_shared/types';
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
		page
	}: {
		network: ENetwork;
		proposalType: EProposalType;
		limit: number;
		page: number;
	}): Promise<IOffChainPost[]> {
		const postsQuery = FirestoreRefs.postsCollectionRef()
			.where('proposalType', '==', proposalType)
			.where('network', '==', network)
			.limit(limit)
			.offset((page - 1) * limit);

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
}
