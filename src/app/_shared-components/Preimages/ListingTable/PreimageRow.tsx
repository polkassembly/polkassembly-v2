// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { IPreimage } from '@/_shared/types';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { MdContentCopy } from '@react-icons/all-files/md/MdContentCopy';
import { FaRegListAlt } from '@react-icons/all-files/fa/FaRegListAlt';
import { useTranslations } from 'next-intl';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import SubscanIcon from '@assets/icons/profile-subscan.svg';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../Tooltip';
import { TableRow, TableCell } from '../../Table';
import styles from './ListingTable.module.scss';
import Address from '../../Profile/Address/Address';

function PreimageRow({ preimage, handleDialogOpen }: { preimage: IPreimage; handleDialogOpen: () => void }) {
	const network = getCurrentNetwork();
	const t = useTranslations('Preimages');
	return (
		<TableRow
			key={preimage?.id}
			className='text-start'
		>
			<TableCell className={styles.table_content_cell}>
				<span>{preimage?.hash ? `${preimage.hash.slice(0, 5)}...${preimage.hash.slice(-5)}` : '-'}</span>
				<Tooltip>
					<TooltipTrigger>
						<MdContentCopy
							onClick={() => {
								navigator.clipboard.writeText(preimage.hash);
							}}
							className={styles.table_content_cell_1}
						/>
					</TooltipTrigger>
					<TooltipContent className={styles.tooltipContent}>{t('copy')}</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger>
						<Image
							src={SubscanIcon}
							alt='copy'
							width={18}
							className='h-5 w-5 cursor-pointer'
							onClick={() => window.open(`https://${network}.subscan.io/block/${preimage?.createdAtBlock}`, '_blank')}
							height={18}
						/>
					</TooltipTrigger>
					<TooltipContent className={styles.tooltipContent}>{t('subscan')}</TooltipContent>
				</Tooltip>
			</TableCell>
			<TableCell className='px-6 py-5'>
				<Address
					truncateCharLen={5}
					address={preimage?.proposer || ''}
				/>
			</TableCell>
			<TableCell className='whitespace-nowrap px-6 py-5'>
				{preimage?.deposit
					? formatBnBalance(
							preimage.deposit,
							{
								withUnit: true,
								numberAfterComma: 2,
								compactNotation: true
							},
							network
						)
					: '-'}
			</TableCell>
			<TableCell className={styles.table_content_cell_2}>
				<span className={styles.table_content_cell_2_content}>{preimage?.section && preimage?.method ? `${preimage.section}.${preimage.method.slice(0, 5)}...` : '-'}</span>
				<FaRegListAlt
					onClick={handleDialogOpen}
					className={styles.mdlisticon}
				/>
			</TableCell>
			<TableCell className='px-6 py-5'>{preimage?.length || '-'}</TableCell>
			<TableCell className='px-6 py-5'>{preimage?.status || '-'}</TableCell>
		</TableRow>
	);
}

export default PreimageRow;
