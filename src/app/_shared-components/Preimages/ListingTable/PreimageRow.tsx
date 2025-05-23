// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { ENotificationStatus, IPreimage } from '@/_shared/types';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { MdContentCopy } from '@react-icons/all-files/md/MdContentCopy';
import { FaRegListAlt } from '@react-icons/all-files/fa/FaRegListAlt';
import { useTranslations } from 'next-intl';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import SubscanIcon from '@assets/icons/profile-subscan.svg';
import Image from 'next/image';
import { Trash } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { getSubstrateAddress } from '@/_shared/_utils/getSubstrateAddress';
import { useMemo, useState } from 'react';
import { usePolkadotApiService } from '@/hooks/usePolkadotApiService';
import { useToast } from '@/hooks/useToast';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../Tooltip';
import { TableRow, TableCell } from '../../Table';
import styles from './ListingTable.module.scss';
import Address from '../../Profile/Address/Address';
import { Button } from '../../Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../Dialog/Dialog';
import { Separator } from '../../Separator';
import SwitchWalletOrAddress from '../../SwitchWalletOrAddress/SwitchWalletOrAddress';
import AddressRelationsPicker from '../../AddressRelationsPicker/AddressRelationsPicker';

const EPreimageStatus = {
	Noted: 'Noted',
	Requested: 'Requested'
};

function PreimageRow({ preimage, handleDialogOpen, onUnnotePreimage }: { preimage: IPreimage; handleDialogOpen: () => void; onUnnotePreimage: () => void }) {
	const network = getCurrentNetwork();
	const t = useTranslations('Preimages');

	const { user } = useUser();

	const [loading, setLoading] = useState(false);

	const { apiService } = usePolkadotApiService();

	const { toast } = useToast();

	const [openUnnoteDialog, setOpenUnnoteDialog] = useState(false);
	const substrateProposer = preimage.proposer && getSubstrateAddress(preimage.proposer);

	const canUnnotePreimage = useMemo(
		() =>
			user?.addresses &&
			user?.addresses.length > 0 &&
			preimage?.status &&
			(preimage.status === 'Noted' || preimage.status === 'Requested') &&
			substrateProposer &&
			user.addresses.includes(substrateProposer),
		[user, preimage, substrateProposer]
	);

	const unnotePreimage = async () => {
		if (!user || !substrateProposer || !user.addresses.includes(substrateProposer) || !apiService || !preimage.hash) return;
		setLoading(true);

		if (preimage.status === EPreimageStatus.Noted) {
			await apiService.unnotePreimage({
				address: substrateProposer,
				preimageHash: preimage.hash,
				onSuccess: () => {
					setLoading(false);
					onUnnotePreimage();
					toast({
						title: t('unnoted'),
						description: t('unnoted_description'),
						status: ENotificationStatus.SUCCESS
					});
					setOpenUnnoteDialog(false);
				},
				onFailed: () => {
					setLoading(false);
					toast({
						title: t('failed'),
						status: ENotificationStatus.ERROR
					});
				}
			});
		} else if (preimage.status === EPreimageStatus.Requested) {
			await apiService.unRequestPreimage({
				address: substrateProposer,
				preimageHash: preimage.hash,
				onSuccess: () => {
					setLoading(false);
					onUnnotePreimage();
					toast({
						title: t('unrequested'),
						description: t('unrequested_description'),
						status: ENotificationStatus.SUCCESS
					});
				},
				onFailed: () => {
					setLoading(false);
					toast({
						title: t('failed'),
						description: t('failed_description'),
						status: ENotificationStatus.ERROR
					});
				}
			});
		}
	};

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
					<TooltipContent className='bg-grey_bg text-text_primary'>{t('copy')}</TooltipContent>
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
					<TooltipContent className='bg-grey_bg text-text_primary'>{t('subscan')}</TooltipContent>
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
			<TableCell className='px-6 py-5'>
				<div className='flex items-center gap-x-4'>
					{preimage?.status || '-'}
					{canUnnotePreimage && (
						<Dialog
							open={openUnnoteDialog}
							onOpenChange={setOpenUnnoteDialog}
						>
							<DialogTrigger>
								<Tooltip>
									<TooltipTrigger>
										<Button
											size='icon'
											variant='ghost'
											className='border border-transparent py-1 text-sm font-semibold text-text_primary hover:border-bg_pink hover:bg-bg_pink/10'
										>
											<Trash />
										</Button>
									</TooltipTrigger>
									<TooltipContent className='bg-grey_bg text-text_primary'>
										{preimage.status === EPreimageStatus.Noted ? t('unnote') : preimage.status === EPreimageStatus.Requested ? t('unrequest') : '-'}
									</TooltipContent>
								</Tooltip>
							</DialogTrigger>

							<DialogContent className='max-w-xl p-6'>
								<DialogHeader>
									<DialogTitle>{preimage.status === EPreimageStatus.Requested ? t('unrequest') : t('unnote')} Preimage</DialogTitle>
								</DialogHeader>
								<div className='flex flex-col gap-y-4'>
									<SwitchWalletOrAddress
										small
										customAddressSelector={<AddressRelationsPicker withBalance />}
									/>
									<p className='text-sm font-medium text-text_primary'>{t('unnoteOrUnrequestPreimageDescription')}</p>
									<Separator />
									<div className='flex items-center justify-end'>
										<Button
											size='lg'
											onClick={unnotePreimage}
											isLoading={loading}
										>
											{preimage.status === EPreimageStatus.Requested ? t('unrequest') : t('unnote')}
										</Button>
									</div>
								</div>
							</DialogContent>
						</Dialog>
					)}
				</div>
			</TableCell>
		</TableRow>
	);
}

export default PreimageRow;
