// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import Link from 'next/link';
import { IPostListing } from '@/_shared/types';
import LoadingLayover from '@/app/_shared-components/LoadingLayover';
import { useTranslations } from 'next-intl';
import ActivityItem from './ActivityItem';

interface IActivityListProps {
	items?: IPostListing[];
	isFetching: boolean;
	noActivityText: string;
	viewAllUrl?: string;
}

function ActivityList({ items, isFetching, noActivityText, viewAllUrl }: IActivityListProps) {
	const t = useTranslations('Overview');
	return (
		<div className='flex flex-col'>
			{isFetching && <LoadingLayover />}
			<div className='override_scrollbar flex max-h-[400px] flex-col overflow-y-auto'>
				{items && items.length > 0 ? (
					items.map((row) => (
						<ActivityItem
							key={`${row.proposalType}_${row.index || row.hash}`}
							rowData={row}
						/>
					))
				) : (
					<div className='py-8 text-center text-sm text-wallet_btn_text'>{noActivityText}</div>
				)}
			</div>
			{viewAllUrl && (
				<div className='mt-4 flex justify-center'>
					<Link
						href={viewAllUrl}
						className='text-sm font-medium text-text_pink hover:underline'
					>
						{t('viewAllActivity')}
					</Link>
				</div>
			)}
		</div>
	);
}

export default ActivityList;
