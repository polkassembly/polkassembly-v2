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
import DelegateXSetupDialog from '../../DelegateXSetupDialog/DelegateXSetupDialog';
import styles from './DelegateCard.module.scss';

interface IDelegateXCardProps {
	data: {
		address: string;
		name: string;
		bio: string;
		image: StaticImageData;
		maxDelegated: string;
		votedProposals: number;
		delegatorsCount: number;
	};
}

function DelegateXStats({ data }: { data: IDelegateXCardProps['data'] }) {
	return (
		<div className={styles.delegationCardStats}>
			<div className={styles.delegationCardStatsItem}>
				<div>
					<div className='text-sm text-btn_secondary_text xl:whitespace-nowrap'>
						<span className='font-semibold md:text-2xl'>{data.maxDelegated}</span>
					</div>
					<span className={styles.delegationCardStatsItemText}>Total Voting Power</span>
				</div>
			</div>

			<div className={styles.delegationCardStatsItem}>
				<div>
					<div className='font-semibold text-btn_secondary_text md:text-2xl'>{data.votedProposals}</div>
					<span className={styles.delegationCardStatsItemText}>Voted Proposals</span>
					<span className={styles.delegationCardStatsItemTextPast30Days}>(Past 30 Days)</span>
				</div>
			</div>

			<div className='p-5 text-center'>
				<div>
					<div className='font-semibold text-btn_secondary_text md:text-2xl'>{data.delegatorsCount}</div>
					<span className={styles.delegationCardStatsItemText}>Number of Users</span>
				</div>
			</div>
		</div>
	);
}

const DelegateXCard = memo(({ data }: IDelegateXCardProps) => {
	const { user } = useUser();
	const t = useTranslations('Delegation');

	const [openModal, setOpenModal] = useState(false);
	const [openSetupDialog, setOpenSetupDialog] = useState(false);

	return (
		<div className={styles.delegateXCardWrapper}>
			<Image
				className={styles.delegateXGif}
				src={data.image}
				alt={data.name}
				width={95}
				height={95}
				priority
			/>
			<div className='flex gap-2 rounded-t-md border-b border-wallet_btn_text py-1'>
				<div className='flex items-center gap-1 px-2 lg:gap-2 lg:px-4'>
					<p className='text-medium pl-12 text-xs text-btn_secondary_text'>
						Built on <span className='cursor-pointer text-text_pink underline'>CyberGov</span> Powered by <span className='font-semibold'>Klara</span>
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
									onClick={() => setOpenSetupDialog(true)}
								>
									<IoPersonAdd />
									<span>{t('delegate')}</span>
								</Button>
								<DelegateXSetupDialog
									open={openSetupDialog}
									onOpenChange={setOpenSetupDialog}
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

				<DelegateXStats data={data} />

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

						<DelegateXStats data={data} />
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
});

export default DelegateXCard;
