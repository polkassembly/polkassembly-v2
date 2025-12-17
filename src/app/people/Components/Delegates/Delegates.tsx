// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { PaginationWithLinks } from '@/app/_shared-components/PaginationWithLinks';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { useEffect, useCallback } from 'react';
import { IDelegateDetails } from '@/_shared/types';
import useDelegateFiltering from '@/hooks/useDelegateFiltering';
import LoadingLayover from '@/app/_shared-components/LoadingLayover';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { delegatesAtom } from '@/app/_atoms/delegation/delegationAtom';
import { FIVE_MIN_IN_MILLI } from '@/app/api/_api-constants/timeConstants';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { DelegateXClientService } from '@/app/_client-services/delegate_x_client_service';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { delegateXAtom } from '@/app/_atoms/delegateX/delegateXAtom';
import MembersStats from '../Stats/MembersStats';
import DelegateCard from '../PeopleCards/DelegateCard';

const PA_ADDRESS = '13mZThJSNdKUyVUjQE9ZCypwJrwdvY8G5cUCpS9Uw4bodh4t';

function CommunityDelegates({ page }: { page: number }) {
	const [delegates, setDelegates] = useAtom(delegatesAtom);
	const { userPreferences } = useUserPreferences();
	const [, setDelegateXState] = useAtom(delegateXAtom);

	const fetchDelegateXData = useCallback(async () => {
		if (!userPreferences.selectedAccount?.address) return;

		setDelegateXState((prev) => ({
			...prev,
			isLoading: true,
			error: null
		}));

		const { data, error } = await DelegateXClientService.getDelegateXDetails();

		if (error || !data) {
			setDelegateXState((prev) => ({
				...prev,
				isLoading: false,
				error: typeof error === 'string' ? error : 'Failed to fetch DelegateX details'
			}));
			return;
		}

		if (data.success) {
			const delegateXData = {
				address: data.delegateXAccount?.address || PA_ADDRESS,
				bio: 'An AI powered custom agent that votes just like you would. Setup bot suited to your evaluation criterias and simplify voting with reason',
				totalVotesPast30Days: data.totalVotesPast30Days || 0,
				totalVotingPower: data.totalVotingPower || '0',
				totalDelegators: data.totalDelegators || 0,
				votingPower: data.votingPower || '0',
				ayeCount: data.yesCount || 0,
				nayCount: data.noCount || 0,
				abstainCount: data.abstainCount || 0,
				votesPast30Days: data.votesPast30Days || 0
			};

			setDelegateXState({
				data: delegateXData,
				account: data.delegateXAccount || null,
				isLoading: false,
				error: null
			});
		} else {
			setDelegateXState((prev) => ({
				...prev,
				isLoading: false
			}));
		}
	}, [userPreferences.selectedAccount?.address, setDelegateXState]);

	useEffect(() => {
		if (userPreferences.selectedAccount?.address) {
			fetchDelegateXData();
		}
	}, [fetchDelegateXData, userPreferences.selectedAccount?.address]);

	const fetchDelegates = async () => {
		const { data, error } = await NextApiClientService.fetchDelegates();
		if (error || !data) {
			return [];
		}

		const updatedDelegates = data.sort((a: IDelegateDetails, b: IDelegateDetails) => {
			const addressess = [getSubstrateAddress(PA_ADDRESS)];
			const aIndex = addressess.indexOf(getSubstrateAddress(a.address));
			const bIndex = addressess.indexOf(getSubstrateAddress(b.address));

			if (aIndex !== -1 && bIndex !== -1) {
				return aIndex - bIndex;
			}

			if (aIndex !== -1) return -1;
			if (bIndex !== -1) return 1;
			return 0;
		});

		setDelegates(updatedDelegates);
		return updatedDelegates;
	};

	const { isLoading } = useQuery({
		queryKey: ['delegates'],
		queryFn: fetchDelegates,
		staleTime: FIVE_MIN_IN_MILLI
	});

	const { filteredDelegates, totalDelegates } = useDelegateFiltering(delegates, page);

	return (
		<div>
			<MembersStats
				totalMembers={delegates.length}
				verifiedMembers={80}
			/>
			{isLoading ? (
				<div className='relative mt-20'>
					<LoadingLayover />
				</div>
			) : (
				<div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6'>
					{filteredDelegates.map((delegate) => (
						<DelegateCard
							key={delegate.id}
							delegate={delegate}
						/>
					))}
				</div>
			)}
			{totalDelegates > DEFAULT_LISTING_LIMIT && (
				<div className='mt-5 w-full'>
					<PaginationWithLinks
						page={page}
						pageSize={DEFAULT_LISTING_LIMIT}
						totalCount={totalDelegates}
						pageSearchParam='page'
					/>
				</div>
			)}
		</div>
	);
}

export default CommunityDelegates;
