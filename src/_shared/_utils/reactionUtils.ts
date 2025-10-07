// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IPublicUser } from '@/_shared/types';

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
	currentPublicUser,
	likedArrayKey = 'usersWhoLiked',
	dislikedArrayKey = 'usersWhoDisliked'
}: {
	currentUsersWhoLiked: IPublicUser[];
	currentUsersWhoDisliked: IPublicUser[];
	isLikeAction: boolean;
	isDeleteAction: boolean;
	currentPublicUser?: IPublicUser;
	likedArrayKey?: string;
	dislikedArrayKey?: string;
}) => {
	if (!currentPublicUser) {
		return {
			[likedArrayKey]: currentUsersWhoLiked as IPublicUser[],
			[dislikedArrayKey]: currentUsersWhoDisliked as IPublicUser[]
		};
	}

	let updatedUsersWhoLiked = [...currentUsersWhoLiked] as IPublicUser[];
	let updatedUsersWhoDisliked = [...currentUsersWhoDisliked] as IPublicUser[];

	// Remove user from both arrays first to avoid duplicates
	updatedUsersWhoLiked = updatedUsersWhoLiked.filter((userWhoReacted) => userWhoReacted.username !== currentPublicUser?.username);
	updatedUsersWhoDisliked = updatedUsersWhoDisliked.filter((userWhoReacted) => userWhoReacted.username !== currentPublicUser?.username);

	// If not a delete action, add user to appropriate array
	if (!isDeleteAction) {
		if (isLikeAction) {
			updatedUsersWhoLiked.push(currentPublicUser);
		} else {
			updatedUsersWhoDisliked.push(currentPublicUser);
		}
	}

	return {
		[likedArrayKey]: updatedUsersWhoLiked,
		[dislikedArrayKey]: updatedUsersWhoDisliked
	};
};
