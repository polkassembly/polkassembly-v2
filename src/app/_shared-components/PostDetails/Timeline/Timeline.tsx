// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { EProposalStatus, EProposalType, IPostLink, IStatusHistoryItem } from '@/_shared/types';
import { dayjs } from '@shared/_utils/dayjsInit';
import { Separator } from '@ui/Separator';
import StatusTag from '@ui/StatusTag/StatusTag';
import ReferendaIcon from '@assets/icons/timeline-referenda-icon.svg';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { MessageSquareMore } from 'lucide-react';
import classes from './Timeline.module.scss';

function Timeline({ timeline, proposalType, createdAt, linkedPost }: { timeline?: IStatusHistoryItem[]; proposalType?: EProposalType; createdAt?: Date; linkedPost?: IPostLink }) {
	const t = useTranslations();

	const fetchLinkedPost = async () => {
		if (!linkedPost) return null;

		const { data, error } = await NextApiClientService.fetchProposalDetails({ proposalType: linkedPost.proposalType, indexOrHash: linkedPost.indexOrHash });

		if (error || !data) return null;

		return data;
	};

	const { data: linkedPostData } = useQuery({
		queryKey: ['linkedPost', linkedPost?.indexOrHash],
		queryFn: fetchLinkedPost,
		placeholderData: (prev) => prev,
		enabled: !!linkedPost?.indexOrHash,
		retry: true,
		refetchOnWindowFocus: false,
		refetchOnMount: false
	});

	const dateFormat = "Do MMM 'YY, h:mm a";

	return (
		<div className={classes.timelineWrapper}>
			{linkedPostData && linkedPostData.createdAt && (
				<div>
					<div className={classes.timelineHeader}>
						<span className={classes.timelineIconAndLine}>
							<MessageSquareMore className='h-6 w-6 text-text_pink' />
						</span>
						<Link
							href={`/post/${linkedPost?.indexOrHash}`}
							className={classes.timelineTitle}
						>
							{t(`PostDetails.ProposalType.${(linkedPost?.proposalType || EProposalType.DISCUSSION).toLowerCase()}`)}
						</Link>
					</div>
					<div className={classes.timelineContent}>
						<div className={classes.timelineIconAndLine}>
							<div className={classes.timelineLine} />
						</div>
						<div className={classes.timelineItems}>
							<div className='flex flex-col gap-y-4'>
								<div className={classes.timelineItem}>
									<span className='text-xs text-text_primary'>{dayjs(linkedPostData.createdAt).format(dateFormat)}</span>
									<StatusTag status={EProposalStatus.Created.toLowerCase()} />
								</div>
							</div>

							<div />
						</div>
					</div>
				</div>
			)}
			<div>
				<div className={classes.timelineHeader}>
					<span className={classes.timelineIconAndLine}>
						<Image
							src={ReferendaIcon}
							alt='referendum icon'
							width={24}
							height={24}
							className='h-6 w-6'
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
									<span className='text-xs text-text_primary'>{dayjs(createdAt).format(dateFormat)}</span>
									<StatusTag status={EProposalStatus.Created.toLowerCase().replace(/\s+/g, '_')} />
								</div>
							</div>
						)}
						<div />
					</div>
				</div>
			</div>
		</div>
	);
}

export default Timeline;
