// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { EChatState } from '@/_shared/types';
import Link from 'next/link';
import { NotebookText } from 'lucide-react';
import styles from './ChatUI.module.scss';

export function ChatBanner({ chatState }: { chatState: EChatState }) {
	return (
		<div className={styles.chatBanner}>
			{chatState === EChatState.EXPANDED ? (
				<div className='flex items-center gap-[3px] text-center text-xs'>
					🚀 This is the beta version of Klara for testing. Please share any feedback or issues you encounter{' '}
					<Link
						href='/klara-feedback'
						target='_blank'
						rel='noopener noreferrer'
						className='underline'
					>
						here!
					</Link>{' '}
					📝
				</div>
			) : (
				<Link
					href='/klara-guide'
					target='_blank'
					className='flex items-center gap-1 text-sm text-white underline'
					rel='noopener noreferrer'
				>
					<NotebookText className='size-4' />
					Refer Usage Guide
				</Link>
			)}
		</div>
	);
}
