// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { PaginationWithLinks } from '@/app/_shared-components/PaginationWithLinks';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import CuratorStats from './CuratorStats';
import CuratorCard from './CuratorCard';

async function CommunityCurators({ page }: { page: number }) {
	const { data, error } = await NextApiClientService.fetchCommunityCurators({ page: 1, limit: 3000 });

	if (error || !data) {
		return <div className='text-center text-sm text-red-500'>Error fetching curators</div>;
	}

	const curators = data;

	if (curators.length === 0) {
		return <div className='text-text_secondary text-center text-sm'>No curators found</div>;
	}

	const startIndex = (page - 1) * DEFAULT_LISTING_LIMIT;
	const endIndex = startIndex + DEFAULT_LISTING_LIMIT;
	const paginatedCurators = curators.slice(startIndex, endIndex);

	return (
		<div>
			<CuratorStats
				totalMembers={data.length}
				verifiedMembers={80}
			/>
			<div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6'>
				{paginatedCurators.map((curator) => (
					<CuratorCard
						key={curator.id}
						curator={curator}
					/>
				))}
			</div>
			{curators.length > DEFAULT_LISTING_LIMIT && (
				<div className='mt-5 w-full'>
					<PaginationWithLinks
						page={page}
						pageSize={DEFAULT_LISTING_LIMIT}
						totalCount={curators.length}
						pageSearchParam='page'
					/>
				</div>
			)}
		</div>
	);
}

export default CommunityCurators;
