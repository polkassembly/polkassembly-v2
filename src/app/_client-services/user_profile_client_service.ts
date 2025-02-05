// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ESocial } from '@/_shared/types';
import { NextApiClientService } from './next_api_client_service';

export class UserProfileClientService extends NextApiClientService {
	static async fetchPublicUserById({ userId }: { userId: number }) {
		return this.fetchPublicUserByIdApi({ userId });
	}

	static async fetchPublicUserByAddress({ address }: { address: string }) {
		return this.fetchPublicUserByAddressApi({ address });
	}

	static async fetchPublicUserByUsername({ username }: { username: string }) {
		return this.fetchPublicUserByUsernameApi({ username });
	}

	static async fetchUserActivity({ userId }: { userId: number }) {
		return this.fetchUserActivityApi({ userId });
	}

	static async editUserProfile({
		userId,
		bio,
		badges,
		title,
		image,
		coverImage,
		publicSocialLinks,
		email,
		username
	}: {
		userId: number;
		bio?: string;
		badges?: string[];
		title?: string;
		image?: string;
		coverImage?: string;
		publicSocialLinks?: { platform: ESocial; url: string }[];
		email?: string;
		username?: string;
	}) {
		return this.editUserProfileApi({ userId, bio, badges, title, image, coverImage, publicSocialLinks, email, username });
	}

	static async deleteAccount({ userId }: { userId: number }) {
		return this.deleteAccountApi({ userId });
	}

	static async followUser({ userId }: { userId: number }) {
		return this.followUserApi({ userId });
	}

	static async unfollowUser({ userId }: { userId: number }) {
		return this.unfollowUserApi({ userId });
	}

	static async getFollowing({ userId }: { userId: number }) {
		return this.getFollowingApi({ userId });
	}

	static async getFollowers({ userId }: { userId: number }) {
		return this.getFollowersApi({ userId });
	}
}
