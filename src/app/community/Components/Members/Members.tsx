// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import MemberCard from './MemberCard/MemberCard';
import MembersStats from './MembersStats';

async function CommunityMembers() {
	return (
		<div>
			<MembersStats
				totalMembers={100}
				verifiedMembers={80}
			/>
			<div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6'>
				<MemberCard />
			</div>
		</div>
	);
}

export default CommunityMembers;
