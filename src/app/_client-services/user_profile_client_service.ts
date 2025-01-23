// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiClientService } from './next_api_client_service';

export class UserProfileClientService extends NextApiClientService {
	static async fetchPublicUserById({ userId }: { userId: string | number }) {
		return this.fetchPublicUserByIdApi({ userId });
	}

	static async fetchPublicUserByAddress({ address }: { address: string }) {
		return this.fetchPublicUserByAddressApi({ address });
	}

	static async fetchPublicUserByUsername({ username }: { username: string }) {
		return this.fetchPublicUserByUsernameApi({ username });
	}

	static async fetchUserActivity({ userId }: { userId: string | number }) {
		return this.fetchUserActivityApi({ userId });
	}
}
