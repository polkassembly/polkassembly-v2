// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { useMemo, useCallback } from 'react';
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

			const balancePromises = uniqueAddresses.map(async (address) => {
				if (!address) return { address, totalBalance: '0' };
				try {
					const { totalBalance } = await apiService.getUserBalances({ address });
					return { address, totalBalance: totalBalance.toString() };
				} catch {
					return { address, totalBalance: '0' };
				}
			});

			const balances = await Promise.all(balancePromises);
			return balances.reduce(
				(acc, { address, totalBalance }) => {
					if (address && typeof address === 'string') {
						// eslint-disable-next-line security/detect-object-injection
						acc[address] = { totalBalance };
					}
					return acc;
				},
				{} as Record<string, { totalBalance: string }>
			);
		},
		enabled: Boolean(apiService) && activeFilters.includes(ECommentFilterCondition.HIDE_ZERO_BALANCE),
		staleTime: 5 * 60 * 1000 // 5 minutes
	});

	// Helper function for zero balance check with actual balance data
	const hasZeroBalanceWithData = useCallback(
		(comment: ICommentResponse) => {
			const address = comment.authorAddress || comment.publicUser.addresses[0];
			if (!address) return true;

			const typedBalanceData = balanceData as Record<string, { totalBalance: string }>;
			// eslint-disable-next-line security/detect-object-injection
			const balance = Object.hasOwn(typedBalanceData, address) ? typedBalanceData[address] : undefined;
			return !balance || balance.totalBalance === '0';
		},
		[balanceData]
	);

	// Filter and sort comments
	const processedComments = useMemo(() => {
		let filteredComments = [...comments];

		// Apply filters
		if (activeFilters.length > 0) {
			filteredComments = filteredComments.filter((comment) => {
				// Hide zero balance accounts
				if (activeFilters.includes(ECommentFilterCondition.HIDE_ZERO_BALANCE) && hasZeroBalanceWithData(comment)) {
					return false;
				}

				// Show only voters
				if (activeFilters.includes(ECommentFilterCondition.VOTERS_ONLY) && !filterHelpers.hasVotedOnProposal(comment)) {
					return false;
				}

				// Show only DV delegates
				if (activeFilters.includes(ECommentFilterCondition.DV_DELEGATES_ONLY)) {
					const address = comment.authorAddress || comment.publicUser.addresses[0];
					if (!address || !filterHelpers.isDVDelegate(address)) {
						return false;
					}
				}

				// Hide deleted comments
				return !(activeFilters.includes(ECommentFilterCondition.HIDE_DELETED) && filterHelpers.isCommentDeleted(comment));
			});
		}

		// Apply sorting
		const score = (c: ICommentResponse) => {
			const likes = c.reactions?.filter((r) => r.reaction === EReaction.like).length || 0;
			const dislikes = c.reactions?.filter((r) => r.reaction === EReaction.dislike).length || 0;
			return likes - dislikes;
		};

		switch (sortBy) {
			case ECommentSortBy.newest:
				return filteredComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
			case ECommentSortBy.oldest:
				return filteredComments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
			case ECommentSortBy.top:
				return filteredComments.sort((a, b) => score(b) - score(a));
			default:
				return filteredComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
		}
	}, [comments, activeFilters, sortBy, hasZeroBalanceWithData, filterHelpers]);

	return {
		processedComments,
		filterHelpers: {
			...filterHelpers,
			hasZeroBalance: hasZeroBalanceWithData
		}
	};
};
