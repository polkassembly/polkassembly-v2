// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ICommentHistoryItem } from '@/_shared/types';
import { generateDiffHtml, removeSymbols } from '@/_shared/_utils/htmlDiff';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { DialogHeader, DialogTitle, Dialog, DialogTrigger, DialogContent } from '../../../Dialog/Dialog';
import { Button } from '../../../Button';
import { MarkdownViewer } from '../../../MarkdownViewer/MarkdownViewer';
import classes from './CommentHistory.module.scss';
import Address from '../../../Profile/Address/Address';
import { Separator } from '../../../Separator';
import CreatedAtTime from '../../../CreatedAtTime/CreatedAtTime';

function CommentHistory({ authorAddress, authorUsername, history }: { authorAddress?: string; authorUsername?: string; history: ICommentHistoryItem[] }) {
	const t = useTranslations();

	const processedHistory = useMemo(() => {
		return history.map((item, index) => {
			const currentCommentStr = removeSymbols(item.content);
			const previousComment = index < (history?.length ? history.length - 1 : 0) ? history[index + 1]?.content : null;

			const previousCommentStr = previousComment ? removeSymbols(previousComment) : '';
			const diffHtml = previousCommentStr ? generateDiffHtml(currentCommentStr, previousCommentStr) : currentCommentStr;

			return {
				...item,
				diffHtml
			};
		});
	}, [history]);

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
			<DialogContent className='max-w-xl p-6'>
				<DialogHeader>
					<DialogTitle>{t('PostDetails.commentHistory')}</DialogTitle>
				</DialogHeader>

				{/* comment history box */}
				<div className={classes.commentHistory}>
					{processedHistory.map((item, index) => {
						return (
							<div
								key={item.createdAt.toString()}
								className={classes.timelineItem}
							>
								{/* Timeline */}
								<div className={classes.timelineLeft}>
									<div className={classes.timelineDot} />
									{index < processedHistory.length - 1 && <div className={classes.timelineLine} />}
								</div>

								{/* Content */}
								<div className={classes.timelineContent}>
									<div className='flex items-center gap-x-2'>
										{authorAddress ? <Address address={authorAddress} /> : <span className='text-text_primary'>{authorUsername}</span>}
										<Separator
											orientation='vertical'
											className='h-3'
										/>
										<CreatedAtTime createdAt={item.createdAt} />
									</div>
									<MarkdownViewer
										markdown={item.diffHtml}
										truncate
									/>
								</div>
							</div>
						);
					})}
				</div>
			</DialogContent>
		</Dialog>
	);
}

export default CommentHistory;
