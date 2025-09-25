// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IOffChainContentHistoryItem } from '@/_shared/types';
import { generateDiffHtml, removeSymbols } from '@/_shared/_utils/htmlDiff';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { DialogHeader, DialogTitle, Dialog, DialogTrigger, DialogContent } from '../../Dialog/Dialog';
import { Button } from '../../Button';
import { MarkdownViewer } from '../../MarkdownViewer/MarkdownViewer';
import classes from './PostHistory.module.scss';
import Address from '../../Profile/Address/Address';
import { Separator } from '../../Separator';
import CreatedAtTime from '../../CreatedAtTime/CreatedAtTime';

function PostHistory({
	authorAddress,
	authorUsername,
	history,
	currentTitle,
	currentContent,
	updatedAt
}: {
	authorAddress?: string;
	authorUsername?: string;
	history: IOffChainContentHistoryItem[];
	currentTitle?: string;
	currentContent: string;
	updatedAt?: Date;
}) {
	const t = useTranslations();

	const processedHistory = useMemo(() => {
		const fullHistory = [
			...history,
			{
				content: currentContent,
				title: currentTitle,
				createdAt: updatedAt || new Date()
			}
		];

		const filteredHistory = fullHistory.filter((item, index) => {
			if (index === fullHistory.length - 1) return true;

			const currentContentStr = removeSymbols(item.content).trim();
			const currentTitleStr = removeSymbols(item.title || '').trim();

			const nextItem = fullHistory[index - 1];
			if (!nextItem) return true;

			const nextContentStr = removeSymbols(nextItem.content).trim();
			const nextTitleStr = removeSymbols(nextItem.title || '').trim();

			return currentContentStr !== nextContentStr || currentTitleStr !== nextTitleStr;
		});

		return filteredHistory.map((item, index) => {
			const currentContentStr = removeSymbols(item.content);
			const currentTitleStr = removeSymbols(item.title || '');

			const previousItem = index < (filteredHistory?.length ? filteredHistory.length - 1 : 0) ? filteredHistory[index + 1] : null;

			const previousContentStr = previousItem ? removeSymbols(previousItem.content) : '';
			const previousTitleStr = previousItem ? removeSymbols(previousItem.title || '') : '';

			const contentDiffHtml = previousContentStr ? generateDiffHtml(previousContentStr, currentContentStr) : currentContentStr;
			const titleDiffHtml = previousTitleStr ? generateDiffHtml(previousTitleStr, currentTitleStr) : currentTitleStr;

			return {
				...item,
				contentDiffHtml,
				titleDiffHtml
			};
		});
	}, [history, currentContent, currentTitle, updatedAt]);

	return (
		<Dialog>
			<DialogTrigger>
				<Button
					className='border-none p-0 shadow-none'
					variant='ghost'
					type='button'
				>
					<div className={classes.editedText}>({t('PostDetails.edited')})</div>
				</Button>
			</DialogTrigger>
			<DialogContent className='max-w-4xl p-6'>
				<DialogHeader>
					<DialogTitle>{t('PostDetails.editHistory')}</DialogTitle>
				</DialogHeader>

				<div className={classes.postHistory}>
					{processedHistory.map((item, index) => {
						return (
							<div
								key={item.createdAt.toString()}
								className={classes.timelineItem}
							>
								<div className={classes.timelineLeft}>
									<div className={classes.timelineDot} />
									{index < processedHistory.length - 1 && <div className={classes.timelineLine} />}
								</div>

								<div className={classes.timelineContent}>
									<div className='flex items-center gap-x-2'>
										{authorAddress ? <Address address={authorAddress} /> : <span className='text-text_primary'>{authorUsername}</span>}
										<Separator
											orientation='vertical'
											className='h-3'
										/>
										<CreatedAtTime createdAt={item.createdAt} />
									</div>

									{item.title && (
										<div className='mt-2'>
											<h4 className='text-text_secondary mb-1 text-sm font-semibold'>{t('Create.title')}</h4>
											<MarkdownViewer
												markdown={item.titleDiffHtml || removeSymbols(item.title || '')}
												className='text-base font-medium text-text_primary'
											/>
										</div>
									)}

									<div className='mt-3'>
										<h4 className='text-text_secondary mb-1 text-sm font-semibold'>{t('PostDetails.description')}</h4>
										<MarkdownViewer
											markdown={item.contentDiffHtml || item.content}
											truncate
										/>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default PostHistory;
