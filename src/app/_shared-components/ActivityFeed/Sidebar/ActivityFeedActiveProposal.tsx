// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { FaAngleRight } from 'react-icons/fa';
import { useTranslations } from 'next-intl';

function ActivityFeedActiveProposal() {
	const t = useTranslations();
	return (
		<div className='flex flex-col gap-3 rounded-xl border-[1px] border-primary_border bg-bg_modal p-5 text-text_primary'>
			<div className='flex items-center justify-between'>
				<span className='flex items-center gap-1 text-sm font-semibold dark:text-white'>
					{t('ActivityFeed.VotedProposals')} <FaAngleRight />
				</span>
				<span className='bg-active_proposal_bg dark:bg-active_proposal_bg rounded-full bg-opacity-[5%] px-2 py-1 text-[10px] text-wallet_btn_text text-opacity-[80%]'>
					{t('ActivityFeed.Last15Days')}
				</span>
			</div>
			<div className='text-sm'>
				<span className='text-xs text-wallet_btn_text'>
					<span className='text-xl font-semibold text-navbar_border'>09</span> out of <span className='text-sm font-semibold'>12</span> {t('ActivityFeed.ActiveProposals')}
				</span>
			</div>
		</div>
	);
}

export default ActivityFeedActiveProposal;
