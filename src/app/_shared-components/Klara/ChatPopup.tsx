// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { useSidebar } from '../Sidebar/Sidebar';
import ChatsHistoryMobile from './ChatsHistoryMobile';

const ChatUI = dynamic(() => import('@/app/_shared-components/Klara/ChatUI'), { ssr: false });

function ChatPopup() {
	const { state } = useSidebar();
	const [isMobileHistoryOpen, setIsMobileHistoryOpen] = useState(false);

	return (
		<div
			className={cn(
				'fixed bottom-0 top-[15%] z-30 max-h-[85vh] transition-all duration-200 ease-in-out md:left-6 md:top-auto md:z-50',
				state === 'collapsed' ? 'md:left-24' : 'md:left-[16.3rem]'
			)}
		>
			<ChatUI setIsMobileHistoryOpen={setIsMobileHistoryOpen} />
			{isMobileHistoryOpen && (
				<div className='absolute inset-0 rounded-t-xl bg-black/75 pt-14 md:hidden'>
					<ChatsHistoryMobile onClose={() => setIsMobileHistoryOpen(false)} />
				</div>
			)}
		</div>
	);
}

export default ChatPopup;
