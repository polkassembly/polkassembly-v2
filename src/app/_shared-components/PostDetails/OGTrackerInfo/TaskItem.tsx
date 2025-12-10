// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { IOGTrackerTask } from '@/_shared/types';

function TaskItem({ task }: { task: IOGTrackerTask }) {
	const t = useTranslations();
	const statusMap: Record<string, string> = {
		A: t('PostDetails.OGTracker.status.Delivered'),
		B: t('PostDetails.OGTracker.status.InProgress'),
		C: t('PostDetails.OGTracker.status.Flagged'),
		D: t('PostDetails.OGTracker.status.Remodel')
	};
	const statusLabel = statusMap[task.status] || task.status;
	const getStatusColor = (code: string) => {
		if (code === 'A') return 'text-green-500 bg-green-500/10 border-green-500/20';
		if (code === 'B') return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
		if (code === 'C') return 'text-red-500 bg-red-500/10 border-red-500/20';
		if (code === 'D') return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
		return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
	};

	return (
		<div className='bg-bg_secondary hover:bg-bg_tertiary group flex flex-col gap-2 rounded-lg border border-border_grey p-3 transition-all'>
			<div className='text-sm font-medium leading-snug text-text_primary'>{task.title}</div>
			{statusLabel && (
				<div className='flex items-center gap-2'>
					<span className={cn('rounded-md border px-2 py-0.5 text-xs font-medium', getStatusColor(task.status))}>{statusLabel}</span>
				</div>
			)}
		</div>
	);
}

export default TaskItem;
