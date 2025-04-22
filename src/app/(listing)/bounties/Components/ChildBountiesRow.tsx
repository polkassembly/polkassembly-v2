// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IPost } from '@/_shared/types';
import React from 'react';
import { dayjs } from '@/_shared/_utils/dayjsInit';
import { TableCell, TableRow } from '@/app/_shared-components/Table';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import Image from 'next/image';
import { Clock } from 'lucide-react';
import ChildBountiesIcon from '@assets/bounties/bountieslistingchildlevelone.svg';
import StatusTag from '@ui/StatusTag/StatusTag';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import Address from '@ui/Profile/Address/Address';
import { useTranslations } from 'next-intl';
import { useRouter } from 'nextjs-toploader/app';
import ChildBountiesLevelZeroIcon from '@assets/bounties/bountieslistingchildlevelzero.svg';
import { useQuery } from '@tanstack/react-query';
import { ClientError } from '@/app/_client-utils/clientError';
import { NextApiClientService } from '@/app/_client-services/next_api_client_service';
import { DEFAULT_LISTING_LIMIT } from '@/_shared/_constants/listingLimit';
import { Button } from '@/app/_shared-components/Button';
import styles from './Bounties.module.scss';

const DEFAULT_PAGE = 1;
function ChildBountiesRow({ parentIndex }: { parentIndex: number }) {
	const network = getCurrentNetwork();
	const t = useTranslations();
	const router = useRouter();

	const fetchChildBounties = async () => {
		const { data, error } = await NextApiClientService.fetchChildBountiesApi({
			bountyIndex: parentIndex.toString(),
			page: DEFAULT_PAGE.toString(),
			limit: DEFAULT_LISTING_LIMIT.toString()
		});
		if (error) {
			throw new ClientError(error.message || 'Failed to fetch data');
		}
		return data;
	};

	const {
		data: childBounties,
		isFetching,
		error
	} = useQuery({
		queryKey: ['childBountiesInBountySidebar', parentIndex, DEFAULT_PAGE],
		queryFn: fetchChildBounties,
		enabled: !!parentIndex
	});

	if (isFetching) {
		return (
			<TableRow className={styles.childBountyRow}>
				<TableCell
					colSpan={7}
					className='p-4 text-center'
				>
					<div className='flex items-center justify-center space-x-2'>
						<div className='h-4 w-4 animate-spin rounded-full border-b-2 border-primary' />
						<span>{t('Bounties.loadingChildBounties')}</span>
					</div>
				</TableCell>
			</TableRow>
		);
	}

	if (error) {
		return (
			<TableRow className={styles.childBountyRow}>
				<TableCell
					colSpan={7}
					className='p-4 text-center text-red-500'
				>
					{error.message}
				</TableCell>
			</TableRow>
		);
	}

	if (childBounties && !childBounties.items?.length) {
		return (
			<TableRow className={styles.childBountyRow}>
				<TableCell
					colSpan={7}
					className='p-6 text-center'
				>
					{t('Bounties.noChildBountiesFound')}
				</TableCell>
			</TableRow>
		);
	}
	return (
		<>
			{childBounties &&
				childBounties.items.map((childBounty: IPost, index: number) => (
					<TableRow
						key={childBounty.index}
						className={`${styles.tableBodyRow} ${styles.childBountyRow}`}
						onClick={() => router.push(`/child-bounty/${childBounty.index}`)}
					>
						<TableCell className='p-6'>
							<div className='flex h-6 items-center justify-start space-x-4 pl-2 pt-1'>
								{childBounties.items.length === 1 || index === childBounties.items.length - 1 ? (
									<Image
										src={ChildBountiesLevelZeroIcon}
										alt='Child Bounty Icon'
										width={10}
										height={4}
										priority
									/>
								) : (
									<Image
										src={ChildBountiesIcon}
										alt='Child Bounty Icon'
										width={9}
										height={9}
										priority
									/>
								)}
								<span className='ml-8'>{childBounty.index}</span>
							</div>
						</TableCell>
						<TableCell className={styles.tableCell}>{childBounty.onChainInfo?.curator ? <Address address={childBounty.onChainInfo.curator} /> : '-'}</TableCell>
						<TableCell className={styles.tableCell}>{childBounty.title || '-'}</TableCell>
						<TableCell className={styles.tableCell}>
							{childBounty.onChainInfo?.reward
								? formatBnBalance(childBounty.onChainInfo.reward.toString(), { withThousandDelimitor: false, withUnit: true, numberAfterComma: 2, compactNotation: true }, network)
								: '-'}
						</TableCell>
						<TableCell className={styles.tableCell_createdAt}>
							{' '}
							<Clock className='h-4 w-4' /> {childBounty.onChainInfo?.createdAt ? dayjs.utc(childBounty.onChainInfo.createdAt).format("DD MMM 'YY") : '-'}
						</TableCell>
						<TableCell className={styles.tableCell_status}>
							{childBounty.onChainInfo?.status ? (
								<StatusTag
									className='text-center'
									status={childBounty.onChainInfo.status}
								/>
							) : (
								'-'
							)}
						</TableCell>
						<TableCell className={styles.tableCellBody_last}>{childBounty.tags?.length ? childBounty.tags.join(', ') : 'N/A'}</TableCell>
					</TableRow>
				))}
			{childBounties && childBounties?.totalCount > DEFAULT_LISTING_LIMIT && (
				<TableRow className={styles.childBountyRow}>
					<TableCell
						colSpan={7}
						className='p-2 text-center'
					>
						<Button
							variant='link'
							onClick={() => router.push(`/bounty/${parentIndex}`)}
							className='text-text_pink'
						>
							{t('ChildBounties.viewAllChildBounties')}
						</Button>
					</TableCell>
				</TableRow>
			)}
		</>
	);
}

export default ChildBountiesRow;
