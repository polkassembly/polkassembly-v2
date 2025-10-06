// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { cn } from '@/lib/utils';
import React from 'react';
import dynamic from 'next/dynamic';
import { useSidebar } from '../Sidebar/Sidebar';

const ChatUI = dynamic(() => import('@/app/_shared-components/Klara/ChatUI'), { ssr: false });

function ChatPopup() {
	const { state } = useSidebar();
	return (
		<div className={cn('fixed bottom-0 left-6 z-50 hidden transition-all duration-200 ease-in-out md:block', state === 'collapsed' ? 'md:left-24' : 'md:left-[16.3rem]')}>
			<ChatUI />
		</div>
	);
}

export default ChatPopup;
