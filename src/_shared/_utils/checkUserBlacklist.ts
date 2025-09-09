// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { USER_ID_BLACKLIST } from '@/_shared/_constants/userIdBlacklist';

/**
 * Check if a user ID is blacklisted
 * @param userId - The user ID to check
 * @returns true if the user is blacklisted, false otherwise
 */
export const isUserBlacklisted = (userId?: number): boolean => {
	if (!userId) return false;
	return USER_ID_BLACKLIST.includes(userId);
};
