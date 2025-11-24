// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

'use client';

import { memo, useState } from 'react';
import Image, { StaticImageData } from 'next/image';
import { IoPersonAdd } from '@react-icons/all-files/io5/IoPersonAdd';
import { useTranslations } from 'next-intl';
import { useUser } from '@/hooks/useUser';
import Link from 'next/link';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { Button } from '@/app/_shared-components/Button';
import { MarkdownViewer } from '@/app/_shared-components/MarkdownViewer/MarkdownViewer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/_shared-components/Dialog/Dialog';
import { IDelegateXAccount, ENetwork } from '@/_shared/types';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import { NETWORKS_DETAILS } from '@/_shared/_constants/networks';
import { AiFillLike } from '@react-icons/all-files/ai/AiFillLike';
import { AiFillDislike } from '@react-icons/all-files/ai/AiFillDislike';
import { Ban, Pencil } from 'lucide-react';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import EditDelegateXDialog from '../../DelegateXSetupDialog/EditDelegateXDialog';
import DelegateXSetupDialog from '../../DelegateXSetupDialog/DelegateXSetupDialog';
import styles from './DelegateCard.module.scss';

interface IDelegateXCardProps {
	data: {
		address: string;
		bio: string;
		image: StaticImageData;
		votesPast30Days: number;
		votingPower: string;
		ayeCount: number;
		nayCount: number;
		abstainCount: number;
		totalVotingPower: string;
		totalVotesPast30Days: number;
		totalDelegators: number;
	};
	delegateXAccount: IDelegateXAccount | null;
	onRefresh?: (delegateXAccount: IDelegateXAccount) => void;
}

function DelegateXStats({ data, networkSymbol, isBotSetup }: { data: IDelegateXCardProps['data']; networkSymbol: string; isBotSetup: boolean }) {
	const currentNetwork = getCurrentNetwork();

	if (isBotSetup) {
		return (
			<div className={styles.delegationCardStats}>
				<div className={styles.delegationCardStatsItem}>
					<div>
						<div className='text-sm text-btn_secondary_text xl:whitespace-nowrap'>
							<span className='font-semibold md:text-2xl'>
								{formatBnBalance(data.votingPower, { compactNotation: true, numberAfterComma: 1, withUnit: false }, currentNetwork as ENetwork)} {networkSymbol}
							</span>
						</div>
						<span className={styles.delegationCardStatsItemText}>Voting Power</span>
					</div>
				</div>

				<div className={styles.delegationCardStatsItem}>
					<div className='w-full text-center'>
						<div className='flex items-center justify-center gap-4'>
							<div className='flex items-center gap-1 text-success'>
								<AiFillLike className='fill-current text-sm' />
								<span className='font-medium'>{data.ayeCount}</span>
							</div>
							<div className='flex items-center gap-1 text-toast_error_text'>
								<AiFillDislike className='fill-current text-sm' />
								<span className='font-medium'>{data.nayCount}</span>
							</div>
							<div className='flex items-center gap-1 text-bg_blue'>
								<Ban size={14} />
								<span className='font-medium'>{data.abstainCount}</span>
							</div>
						</div>
						<span className={styles.delegationCardStatsItemText}>All Votes Casted</span> <br />
						<Link
							href='/delegation/voting-history'
							className='cursor-pointer text-xs font-semibold text-text_pink hover:underline'
						>
							View History
						</Link>
					</div>
				</div>

				<div className='p-5 text-center'>
					<div>
						<div className='font-semibold text-btn_secondary_text md:text-2xl'>{data.votesPast30Days}</div>
						<span className={styles.delegationCardStatsItemText}>Votes Casted </span>
						<span className={styles.delegationCardStatsItemTextPast30Days}>(Past 30 Days)</span>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.delegationCardStats}>
			<div className={styles.delegationCardStatsItem}>
				<div className='flex flex-col gap-2'>
					<span className='text-2xl font-semibold text-text_primary'>
						{formatBnBalance(data.totalVotingPower, { compactNotation: true, numberAfterComma: 1, withUnit: false }, currentNetwork)}{' '}
						<span className='text-text_secondary text-sm font-normal'> {networkSymbol}</span>
					</span>
					<span className='text-text_secondary text-center text-xs'>Total Voting power</span>
				</div>
			</div>
			<div className={styles.delegationCardStatsItem}>
				<div className='flex flex-col gap-2'>
					<span className='text-2xl font-semibold text-text_primary'>{data.totalVotesPast30Days}</span>
					<span className='text-text_secondary text-center text-xs'>
						Total Voted proposals
						<br />
						(Past 30 days)
					</span>
				</div>
			</div>
			<div className={styles.delegationCardStatsItem}>
				<div className='flex flex-col gap-2'>
					<span className='text-2xl font-semibold text-text_primary'>{data.totalDelegators}</span>
					<span className='text-text_secondary text-center text-xs'>Number of Users</span>
				</div>
			</div>
		</div>
	);
}

const DelegateXCard = memo(({ data, delegateXAccount, onRefresh }: IDelegateXCardProps) => {
	const { user } = useUser();
	const t = useTranslations('Delegation');
	const currentNetwork = getCurrentNetwork();
	const network = NETWORKS_DETAILS[currentNetwork];

	const [openModal, setOpenModal] = useState(false);
	const [openSetupDialog, setOpenSetupDialog] = useState(false);
	const [openEditDialog, setOpenEditDialog] = useState(false);
	const [editStep, setEditStep] = useState(1);
	const [isEditMode, setIsEditMode] = useState(false);

	const handleEditStrategy = () => {
		setOpenEditDialog(false);
		setEditStep(3);
		setIsEditMode(true);
		setOpenSetupDialog(true);
	};

	const handleEditPersonality = () => {
		setOpenEditDialog(false);
		setEditStep(4);
		setIsEditMode(true);
		setOpenSetupDialog(true);
	};

	const handleUndelegate = () => {
		// TODO: Implement undelegate
		setOpenEditDialog(false);
	};

	return (
		<div className={styles.delegateXCardWrapper}>
			<Image
				className={styles.delegateXGif}
				src={data.image}
				alt={data.address}
				width={95}
				height={95}
				priority
			/>
			<div className='flex gap-2 rounded-t-md border-b border-wallet_btn_text py-1'>
				<div className='flex items-center gap-1 px-2 lg:gap-2 lg:px-4'>
					<p className='text-medium pl-12 text-xs text-btn_secondary_text'>
						Built on{' '}
						<Link
							href='/'
							className='cursor-pointer text-text_pink underline'
						>
							CyberGov
						</Link>{' '}
						Powered by <span className='font-semibold'>Klara</span>
					</p>
				</div>{' '}
			</div>
			<div className={styles.delegateXCard}>
				<div className='px-4 pt-4'>
					<div className={styles.delegationDialog}>
						<div className='min-w-32'>
							<Address address={data.address} />
						</div>

						{user?.id ? (
							<>
								<Button
									variant='ghost'
									className='flex items-center gap-x-2 text-sm font-medium text-text_pink'
									onClick={() => {
										if (delegateXAccount) {
											setOpenEditDialog(true);
										} else {
											setIsEditMode(false);
											setEditStep(1);
											setOpenSetupDialog(true);
										}
									}}
								>
									{delegateXAccount ? <Pencil /> : <IoPersonAdd />}
									<span>{delegateXAccount ? 'Edit' : t('delegate')}</span>
								</Button>
								<DelegateXSetupDialog
									key={`${delegateXAccount?.strategyId}-${delegateXAccount?.contactLink}-${delegateXAccount?.signatureLink}-${delegateXAccount?.votingPower}`}
									open={openSetupDialog}
									onOpenChange={setOpenSetupDialog}
									isEditMode={isEditMode}
									initialStep={editStep}
									networkSymbol={network?.tokenSymbol}
									onSuccess={onRefresh}
									initialData={
										delegateXAccount
											? {
													selectedStrategy: delegateXAccount.strategyId,
													contact: delegateXAccount.contactLink,
													signature: delegateXAccount.signatureLink,
													includeComment: delegateXAccount.includeComment,
													votingPower: delegateXAccount.votingPower
												}
											: {}
									}
								/>
								<EditDelegateXDialog
									open={openEditDialog}
									onOpenChange={setOpenEditDialog}
									onEditStrategy={handleEditStrategy}
									onEditPersonality={handleEditPersonality}
									onUndelegate={handleUndelegate}
								/>
							</>
						) : (
							<Link
								href='/login'
								className='flex items-center gap-x-2 text-sm font-medium text-text_pink'
							>
								<IoPersonAdd />
								<span>{t('delegate')}</span>
							</Link>
						)}
					</div>
				</div>

				<div className='px-4 pb-2 pt-2'>
					<MarkdownViewer
						markdown={data.bio}
						truncate
						onShowMore={() => setOpenModal(true)}
						className='line-clamp-2'
					/>
				</div>

				<DelegateXStats
					data={data}
					networkSymbol={network?.tokenSymbol}
					isBotSetup={!!delegateXAccount}
				/>

				<Dialog
					open={openModal}
					onOpenChange={setOpenModal}
				>
					<DialogContent className='max-w-xl p-6'>
						<DialogHeader>
							<DialogTitle>
								<Address address={data.address} />
							</DialogTitle>
						</DialogHeader>

						<MarkdownViewer
							className='max-h-[70vh] overflow-y-auto'
							markdown={data.bio}
						/>

						<DelegateXStats
							data={data}
							networkSymbol={network?.tokenSymbol}
							isBotSetup={!!delegateXAccount}
						/>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
});

export default DelegateXCard;
