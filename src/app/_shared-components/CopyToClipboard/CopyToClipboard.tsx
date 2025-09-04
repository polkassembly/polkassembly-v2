// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ENotificationStatus } from '@/_shared/types';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import { CopyIcon } from 'lucide-react';
import { Button } from '../Button';

function CopyToClipboard({ label, text, className }: { label: string; text: string; className?: string }) {
	const { toast } = useToast();
	const copyToClipboard = () => {
		navigator.clipboard.writeText(text);
		toast({
			title: 'Copied!',
			status: ENotificationStatus.INFO
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	};

	return (
		<div className={cn('flex items-center gap-x-1 text-sm font-medium text-text_primary', className)}>
			<p>{label}</p>
			<Button
				size='icon'
				variant='ghost'
				className='px-0 py-0'
				onClick={copyToClipboard}
			>
				<CopyIcon />
			</Button>
		</div>
	);
}

export default CopyToClipboard;
