// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ECommentFilterCondition, ECommentSortBy, EReaction, ICommentResponse } from '@/_shared/types';
import { W3F_DELEGATES_2025 } from '@/_shared/_constants/delegates2025';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { usePolkadotApiService } from './usePolkadotApiService';

interface UseCommentFiltersProps {
	comments: ICommentResponse[];
	activeFilters: ECommentFilterCondition[];
	sortBy: ECommentSortBy;
}

interface FilterHelpers {
	isDVDelegate: (address: string) => boolean;
	hasVotedOnProposal: (comment: ICommentResponse) => boolean;
	isCommentDeleted: (comment: ICommentResponse) => boolean;
	hasZeroBalance: (comment: ICommentResponse) => boolean;
}

export const useCommentFilters = ({ comments, activeFilters, sortBy }: UseCommentFiltersProps) => {
	const { apiService } = usePolkadotApiService();

	// Helper functions
	const filterHelpers: FilterHelpers = useMemo(
		() => ({
			isDVDelegate: (address: string) => {
				return W3F_DELEGATES_2025.some((dv) => getSubstrateAddress(dv.address) === getSubstrateAddress(address));
			},
			hasVotedOnProposal: (comment: ICommentResponse) => {
				return Boolean(comment.voteData && comment.voteData.length > 0);
			},
			isCommentDeleted: (comment: ICommentResponse) => {
				return comment.isDeleted === true;
			},
			hasZeroBalance: () => {
				// This will be updated by the balance query
				return false; // Default to false, will be updated by the balance data
			}
		}),
		[]
	);

	// Get unique addresses for balance checking
	const uniqueAddresses = useMemo(() => {
		return [...new Set(comments.map((c) => c.authorAddress || c.publicUser.addresses[0]).filter(Boolean))];
	}, [comments]);

	// Fetch balance data only when needed
	const { data: balanceData = {} } = useQuery({
		queryKey: ['comment-balances', uniqueAddresses],
		queryFn: async () => {
			if (!apiService || !activeFilters.includes(ECommentFilterCondition.HIDE_ZERO_BALANCE)) {
				return {};
			}

			const balances = await Promise.all(
				uniqueAddresses.map(async (address) => {
					if (!address) return null;
					try {
						const { totalBalance } = await apiService.getUserBalances({ address });
						return { address, totalBalance: totalBalance.toString() };
					} catch {
						return null;
					}
				})
			);

			return balances.reduce(
				(acc, balance) => {
					if (balance?.address) {
						// eslint-disable-next-line security/detect-object-injection
						acc[balance.address] = { totalBalance: balance.totalBalance };
					}
					return acc;
				},
				{} as Record<string, { totalBalance: string }>
			);
		},
		enabled: Boolean(apiService) && activeFilters.includes(ECommentFilterCondition.HIDE_ZERO_BALANCE),
		staleTime: 5 * 60 * 1000 // 5 minutes
	});

	// Filter and sort comments
	const processedComments = useMemo(() => {
		let filteredComments = [...comments];

		// Apply filters
		if (activeFilters.length > 0) {
			filteredComments = filteredComments.filter((comment) => {
				// Hide zero balance accounts
				if (activeFilters.includes(ECommentFilterCondition.HIDE_ZERO_BALANCE)) {
					const address = comment.authorAddress || comment.publicUser.addresses[0];
					if (!address) return false;

					const typedBalanceData = balanceData as Record<string, { totalBalance: string }>;
					// eslint-disable-next-line security/detect-object-injection
					const balance = Object.hasOwn(typedBalanceData, address) ? typedBalanceData[address] : undefined;
					if (balance && balance.totalBalance === '0') {
						return false;
					}
				}

				// Hide deleted comments
				if (activeFilters.includes(ECommentFilterCondition.HIDE_DELETED) && filterHelpers.isCommentDeleted(comment)) {
					return false;
				}

				// combine positive filters (show conditions)
				const hasPositiveFilters = activeFilters.includes(ECommentFilterCondition.VOTERS_ONLY) || activeFilters.includes(ECommentFilterCondition.DV_DELEGATES_ONLY);

				if (!hasPositiveFilters) {
					return true;
				}

				// Check if comment meets any of the positive filters
				if (activeFilters.includes(ECommentFilterCondition.VOTERS_ONLY) && filterHelpers.hasVotedOnProposal(comment)) {
					return true;
				}

				if (activeFilters.includes(ECommentFilterCondition.DV_DELEGATES_ONLY)) {
					const address = comment.authorAddress || comment.publicUser.addresses[0];
					if (address && filterHelpers.isDVDelegate(address)) {
						return true;
					}
				}

				// If none of the positive filters match, exclude the comment
				return false;
			});
		}

		// Apply sorting
		const score = (c: ICommentResponse) => {
			const likes = c.reactions?.filter((r) => r.reaction === EReaction.like).length || 0;
			const dislikes = c.reactions?.filter((r) => r.reaction === EReaction.dislike).length || 0;
			return likes - dislikes;
		};

		switch (sortBy) {
			case ECommentSortBy.oldest:
				return filteredComments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
			case ECommentSortBy.top:
				return filteredComments.sort((a, b) => score(b) - score(a));
			case ECommentSortBy.newest:
			default:
				return filteredComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
		}
	}, [comments, activeFilters, sortBy, filterHelpers, balanceData]);

	return {
		processedComments,
		filterHelpers: {
			...filterHelpers,
			hasZeroBalance: filterHelpers.hasZeroBalance
		}
	};
};
