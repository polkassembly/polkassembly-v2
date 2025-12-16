// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { PaginationWithLinks } from '@/app/_shared-components/PaginationWithLinks';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import MemberCard from '../PeopleCards/MemberCard';
import MembersStats from '../Stats/MembersStats';

async function CommunityMembers({ page }: { page: number }) {
	const { data, error } = await NextApiClientService.fetchCommunityMembers({ page });

	if (error || !data) {
		return <div className='text-center text-sm text-red-500'>Error fetching members</div>;
	}

	const members = data.items;

	if (members.length === 0) {
		return <div className='text-text_secondary text-center text-sm'>No members found</div>;
	}
	return (
		<div>
			<MembersStats
				totalMembers={data.totalCount}
				verifiedMembers={80}
			/>
			<div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6'>
				{members.map((member) => (
					<MemberCard
						key={member.id}
						member={member}
					/>
				))}
			</div>
			{data.totalCount > DEFAULT_LISTING_LIMIT && (
				<div className='mt-5 w-full'>
					<PaginationWithLinks
						page={page}
						pageSize={DEFAULT_LISTING_LIMIT}
						totalCount={data.totalCount}
						pageSearchParam='page'
					/>
				</div>
			)}
		</div>
	);
}

export default CommunityMembers;
