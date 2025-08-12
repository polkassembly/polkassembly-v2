// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IReactionUser } from '@/_shared/types';

/**
 * Calculates updated user arrays for reactions (likes/dislikes) with optimistic updates
 *
 * @param params - Object containing current users arrays and action details
 * @returns Object with updated usersWhoLiked and usersWhoDisliked arrays
 */
export const calculateUpdatedReactionUserArrays = ({
	currentUsersWhoLiked,
	currentUsersWhoDisliked,
	isDeleteAction,
	isLikeAction,
	currentUserUsername,
	currentUserAddress,
	likedArrayKey = 'usersWhoLiked',
	dislikedArrayKey = 'usersWhoDisliked'
}: {
	currentUsersWhoLiked: IReactionUser[];
	currentUsersWhoDisliked: IReactionUser[];
	currentUserUsername: string;
	isLikeAction: boolean;
	isDeleteAction: boolean;
	currentUserAddress?: string;
	likedArrayKey?: string;
	dislikedArrayKey?: string;
}) => {
	if (!currentUserUsername) {
		return {
			[likedArrayKey]: currentUsersWhoLiked as IReactionUser[],
			[dislikedArrayKey]: currentUsersWhoDisliked as IReactionUser[]
		};
	}

	let updatedUsersWhoLiked = [...currentUsersWhoLiked] as IReactionUser[];
	let updatedUsersWhoDisliked = [...currentUsersWhoDisliked] as IReactionUser[];

	// Remove user from both arrays first to avoid duplicates
	updatedUsersWhoLiked = updatedUsersWhoLiked.filter((userWhoReacted) => userWhoReacted.username !== currentUserUsername);
	updatedUsersWhoDisliked = updatedUsersWhoDisliked.filter((userWhoReacted) => userWhoReacted.username !== currentUserUsername);

	// If not a delete action, add user to appropriate array
	if (!isDeleteAction) {
		const newUserReaction: IReactionUser = {
			...(currentUserAddress && { address: currentUserAddress }),
			username: currentUserUsername
		};

		if (isLikeAction) {
			updatedUsersWhoLiked.push(newUserReaction);
		} else {
			updatedUsersWhoDisliked.push(newUserReaction);
		}
	}

	return {
		[likedArrayKey]: updatedUsersWhoLiked,
		[dislikedArrayKey]: updatedUsersWhoDisliked
	};
};
