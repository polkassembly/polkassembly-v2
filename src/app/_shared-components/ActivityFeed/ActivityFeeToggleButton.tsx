// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { EActivityFeedTab } from '@/_shared/types';

interface IToggleButtonProps {
	activeTab: EActivityFeedTab;
	setActiveTab: (tab: EActivityFeedTab) => void;
}

function ActivityFeeToggleButton({ activeTab, setActiveTab }: IToggleButtonProps) {
	const router = useRouter();
	const { query } = router;

	useEffect(() => {
		if (query.tab === 'subscribed') {
			setActiveTab(EActivityFeedTab.FOLLOWING);
		} else {
			setActiveTab(EActivityFeedTab.EXPLORE);
		}
	}, [query.tab, setActiveTab]);

	const handleTabClick = (tab: EActivityFeedTab) => {
		setActiveTab(tab);
		router.push(
			{
				pathname: router.pathname,
				query: { ...router.query, tab: tab === EActivityFeedTab.EXPLORE ? 'explore' : 'subscribed' }
			},
			undefined,
			{ shallow: true }
		);
	};

	return (
		<div className='mt-2 flex h-9 items-center gap-1 rounded-lg bg-[#ECECEC] p-2 dark:bg-white dark:bg-opacity-[12%] md:gap-2 md:p-2 md:pt-5'>
			<button
				type='button'
				onClick={() => handleTabClick(EActivityFeedTab.EXPLORE)}
				className={`mt-4 cursor-pointer rounded-md px-2 py-[3px] text-[15px] font-semibold md:mt-1 md:px-4 md:py-[5px] md:text-[16px] ${
					activeTab === EActivityFeedTab.EXPLORE ? 'text-pink_primary bg-[#FFFFFF] dark:bg-[#0D0D0D]' : 'text-blue-light-medium dark:text-[#DADADA]'
				}`}
			>
				Explore
			</button>
			<button
				type='button'
				onClick={() => handleTabClick(EActivityFeedTab.FOLLOWING)}
				className={`mt-4 cursor-pointer rounded-lg px-2 py-[3px] text-[15px] font-semibold md:mt-1 md:px-4 md:py-[5px] md:text-[16px] ${
					activeTab === EActivityFeedTab.FOLLOWING ? 'text-pink_primary bg-[#FFFFFF] dark:bg-[#0D0D0D]' : 'text-blue-light-medium dark:text-[#DADADA]'
				}`}
			>
				Subscribed
			</button>
		</div>
	);
}

export default ActivityFeeToggleButton;
