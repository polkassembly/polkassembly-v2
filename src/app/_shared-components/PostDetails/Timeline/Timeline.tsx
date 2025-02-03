// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EProposalStatus, EProposalType, IStatusHistoryItem } from '@/_shared/types';
import { dayjs } from '@shared/_utils/dayjsInit';
import { Separator } from '@ui/Separator';
import StatusTag from '@ui/StatusTag/StatusTag';
import ReferendaIcon from '@assets/icons/timeline-referenda-icon.svg';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import classes from './Timeline.module.scss';

function Timeline({ timeline, proposalType, createdAt }: { timeline?: IStatusHistoryItem[]; proposalType?: EProposalType; createdAt?: Date }) {
	const t = useTranslations();
	return (
		<div className={classes.timelineWrapper}>
			<div className={classes.timelineHeader}>
				<span className={classes.timelineIconAndLine}>
					<Image
						src={ReferendaIcon}
						alt='referendum icon'
						width={24}
						height={24}
					/>
				</span>
				<span className={classes.timelineTitle}>{t(`PostDetails.ProposalType.${(proposalType || EProposalType.REFERENDUM_V2).toLowerCase()}`)}</span>
			</div>
			<div className={classes.timelineContent}>
				<div className={classes.timelineIconAndLine}>
					<div className={classes.timelineLine}>
						<span className={classes.timelineDot} />
					</div>
				</div>
				<div className={classes.timelineItems}>
					{timeline ? (
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
						))
					) : (
						<div className='flex flex-col gap-y-4'>
							<div className={classes.timelineItem}>
								<span className='text-xs text-text_primary'>{dayjs(createdAt).format("Do MMM 'YY, h:mm a")}</span>
								<StatusTag status={EProposalStatus.Created.toLowerCase().replace(/\s+/g, '_')} />
							</div>
						</div>
					)}
					<div />
				</div>
			</div>
		</div>
	);
}

export default Timeline;
