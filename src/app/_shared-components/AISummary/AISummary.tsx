// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { EProposalType, IContentSummary } from '@/_shared/types';
import { useAISummary } from '@/hooks/useAISummary';
import NoActivity from '@/_assets/activityfeed/gifs/noactivity.gif';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import AISummaryIcon from '@/_assets/icons/aiSummary.svg';
import { Skeleton } from '../Skeleton';
import { MarkdownViewer } from '../MarkdownViewer/MarkdownViewer';
import classes from './AISummaryCollapsible.module.scss';

interface Props {
	proposalType: EProposalType;
	indexOrHash: string;
	initialData?: IContentSummary;
}
function AISummary({ proposalType, indexOrHash, initialData }: Props) {
	const t = useTranslations();
	const { data, isLoading, error } = useAISummary({ proposalType, indexOrHash, initialData });

	if (isLoading) {
		return <Skeleton className='h-8' />;
	}

	return (
		<div>
			<div className={classes.heading}>
				<Image
					src={AISummaryIcon}
					alt='summarise'
					width={26}
					height={26}
				/>
				{t('PostDetails.aiSummary')}
			</div>
			{data?.postSummary && !error ? (
				<MarkdownViewer
					markdown={data?.postSummary || ''}
					className='text-text_primary'
				/>
			) : (
				<Image
					src={NoActivity}
					alt='no-activity'
					width={100}
					height={100}
				/>
			)}
		</div>
	);
}

export default AISummary;
