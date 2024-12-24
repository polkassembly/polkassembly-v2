// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect } from 'react';
import { EActivityFeedTab } from '@/_shared/types';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface IToggleButtonProps {
	activeTab: EActivityFeedTab;
	setActiveTab: (tab: EActivityFeedTab) => void;
}

function ActivityFeeToggleButton({ activeTab, setActiveTab }: IToggleButtonProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const queryTab = searchParams.get('tab');
	useEffect(() => {
		if (queryTab === 'subscribed') {
			setActiveTab(EActivityFeedTab.FOLLOWING);
		} else {
			setActiveTab(EActivityFeedTab.EXPLORE);
		}
	}, [queryTab, setActiveTab]);

	const handleTabClick = (tab: EActivityFeedTab) => {
		setActiveTab(tab);
		router.push(`${pathname}?tab=${tab === EActivityFeedTab.EXPLORE ? 'explore' : 'subscribed'}`);
	};

	return (
		<div className='my-2 flex h-9 items-center rounded-lg bg-[#ECECEC] px-1.5 pb-1 dark:bg-white dark:bg-opacity-[12%]'>
			<button
				type='button'
				onClick={() => handleTabClick(EActivityFeedTab.EXPLORE)}
				className={`md:text-md mt-4 cursor-pointer rounded-md px-2 py-[3px] text-sm font-medium md:mt-1 md:px-3 md:py-[2px] ${
					activeTab === EActivityFeedTab.EXPLORE ? 'bg-[#FFFFFF] text-navbar_border dark:bg-[#0D0D0D]' : 'text-sidebar_text dark:text-[#DADADA]'
				}`}
			>
				Explore
			</button>
			<button
				type='button'
				onClick={() => handleTabClick(EActivityFeedTab.FOLLOWING)}
				className={`md:text-md mt-4 cursor-pointer rounded-md px-2 py-[3px] text-sm font-medium md:mt-1 md:px-3 md:py-[2px] ${
					activeTab === EActivityFeedTab.FOLLOWING ? 'bg-[#FFFFFF] text-navbar_border dark:bg-[#0D0D0D]' : 'text-sidebar_text dark:text-[#DADADA]'
				}`}
			>
				Subscribed
			</button>
		</div>
	);
}

export default ActivityFeeToggleButton;
