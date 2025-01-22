// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { IStatusHistoryItem } from '@/_shared/types';
import { dayjs } from '@shared/_utils/dayjsInit';
import { Separator } from '@ui/Separator';
import StatusTag from '@ui/StatusTag/StatusTag';
import { useTranslations } from 'next-intl';
import classes from './Timeline.module.scss';
import { Icon } from '../../Icon';

function Timeline({ timeline }: { timeline?: IStatusHistoryItem[] }) {
	const t = useTranslations();
	return (
		<div className={classes.timelineWrapper}>
			<div className={classes.timelineHeader}>
				<span className={classes.timelineIconAndLine}>
					<Icon
						name='icons/timeline-referenda-icon'
						className='h-6 w-6'
					/>
				</span>
				<span className={classes.timelineTitle}>{t('PostDetails.referendum')}</span>
			</div>
			<div className={classes.timelineContent}>
				<div className={classes.timelineIconAndLine}>
					<div className={classes.timelineLine}>
						<span className={classes.timelineDot} />
					</div>
				</div>
				<div className={classes.timelineItems}>
					{timeline &&
						timeline.map((item, i) => (
							<div
								key={JSON.stringify(item)}
								className='flex flex-col gap-y-4'
							>
								<div className={classes.timelineItem}>
									<span className='text-xs text-text_primary'>{dayjs(item.timestamp).format("Do MMM 'YY, h:mm a")}</span>
									<StatusTag status={item.status.toLowerCase().replace(/\s+/g, '_')} />
								</div>
								{i !== timeline.length - 1 && <Separator className='bg-border_grey' />}
							</div>
						))}
					<div />
				</div>
			</div>
		</div>
	);
}

export default Timeline;
