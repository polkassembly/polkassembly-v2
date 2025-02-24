// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useState } from 'react';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { EProposalStatus, IGenericListingResponse, IPostListing } from '@/_shared/types';

export function useChildBounties() {
	const [expandedRows, setExpandedRows] = useState<number[]>([]);
	const [childBounties, setChildBounties] = useState<Record<number, IGenericListingResponse<IPostListing>>>({});
	const [loading, setLoading] = useState<Record<number, boolean>>({});
	const [errors, setErrors] = useState<Record<number, string>>({});

	const fetchChildBounties = async (index: number) => {
		try {
			setLoading((prev) => ({ ...prev, [index]: true }));
			setErrors((prev) => ({ ...prev, [index]: '' }));

			const response = await NextApiClientService.fetchChildBountiesApi({ bountyIndex: index });

			if (response.error) {
				throw new Error(response.error.message || 'Failed to fetch child bounties');
			}

			if (!response.data) {
				throw new Error('No data received from API');
			}

			const childBountiesResponse: IGenericListingResponse<IPostListing> = {
				totalCount: response.data.totalCount ?? 0,
				items:
					response.data.items?.map((item) => ({
						index: item.index ?? 0,
						title: item.title ?? '',
						tags: item.tags ?? [],
						htmlContent: item.htmlContent ?? '',
						markdownContent: item.markdownContent ?? '',
						dataSource: item.dataSource ?? '',
						allowedCommentor: item.allowedCommentor ?? '',
						isDeleted: item.isDeleted ?? false,
						proposalType: item.proposalType,
						network: item.network,
						onChainInfo: {
							status: item.onChainInfo?.status ?? EProposalStatus.Unknown,
							reward: item.onChainInfo?.reward ?? '',
							createdAt: item.onChainInfo?.createdAt ? new Date(item.onChainInfo.createdAt) : new Date(),
							curator: item.onChainInfo?.curator,
							description: item.onChainInfo?.description ?? '',
							index: item.onChainInfo?.index ?? 0,
							origin: item.onChainInfo?.origin ?? '',
							proposer: item.onChainInfo?.proposer ?? '',
							type: item.onChainInfo?.type ?? item.proposalType,
							hash: item.onChainInfo?.hash ?? ''
						}
					})) ?? []
			};

			setChildBounties((prev) => ({ ...prev, [index]: childBountiesResponse }));
		} catch (error) {
			setErrors((prev) => ({
				...prev,
				[index]: error instanceof Error ? error.message : 'Failed to fetch child bounties'
			}));
		} finally {
			setLoading((prev) => ({ ...prev, [index]: false }));
		}
	};

	const toggleRow = async (index: number) => {
		if (expandedRows.includes(index)) {
			setExpandedRows(expandedRows.filter((id) => id !== index));
		} else {
			setExpandedRows([...expandedRows, index]);
			if (!childBounties[index as number]) {
				await fetchChildBounties(index);
			}
		}
	};

	return {
		expandedRows,
		childBounties,
		loading,
		errors,
		toggleRow
	};
}
