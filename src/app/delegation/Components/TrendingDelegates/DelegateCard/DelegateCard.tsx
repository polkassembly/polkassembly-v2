// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useTranslations } from 'next-intl';
import { memo, useState } from 'react';
import Address from '@/app/_shared-components/Profile/Address/Address';
import { IoPersonAdd } from '@react-icons/all-files/io5/IoPersonAdd';
import { EDelegateSource, IDelegateDetails } from '@/_shared/types';
import { formatUSDWithUnits } from '@/app/_client-utils/formatUSDWithUnits';
import { formatBnBalance } from '@/app/_client-utils/formatBnBalance';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/_shared-components/Dialog/Dialog';
import { useUser } from '@/hooks/useUser';
import Link from 'next/link';
import { Button } from '@/app/_shared-components/Button';
import DelegateVotingPower from '@/app/_shared-components/DelegateVotingPower/DelegateVotingPower';
import { MarkdownViewer } from '@/app/_shared-components/MarkdownViewer/MarkdownViewer';
import { getCurrentNetwork } from '@/_shared/_utils/getCurrentNetwork';
import PlatformLogos from '../PlatformLogos/PlatformLogos';
import styles from './DelegateCard.module.scss';

const getPlatformStyles = (platforms: EDelegateSource[]) => {
	if (!Array.isArray(platforms) || platforms.length === 0) {
		return styles.delegationPlatformCard;
	}

	if (platforms.length > 1) {
		return styles.delegationCardDefault;
	}

	const platform = String(platforms[0]).toLowerCase();
	switch (platform) {
		case EDelegateSource.POLKASSEMBLY:
			return styles.delegationPlatformCard;
		case EDelegateSource.PARITY:
			return styles.delegationCardPolkadot;
		case EDelegateSource.W3F:
			return styles.delegationCardW3f;
		case EDelegateSource.NOVA:
			return styles.delegationCardNova;
		case EDelegateSource.INDIVIDUAL:
			return styles.delegationCardIndividual;
		default:
			return styles.delegationCardDefault;
	}
};

function DelegateStats({ delegate }: { delegate: IDelegateDetails }) {
	const t = useTranslations('Delegation');
	const network = getCurrentNetwork();

	return (
		<div className={styles.delegationCardStats}>
			<div className={styles.delegationCardStatsItem}>
				<div>
					<div className='text-sm text-btn_secondary_text lg:whitespace-nowrap'>
						<span className='font-semibold md:text-2xl'>
							{' '}
							{formatUSDWithUnits(formatBnBalance(delegate?.votingPower, { withUnit: true, numberAfterComma: 2, withThousandDelimitor: false }, network), 1)}
						</span>{' '}
					</div>
					<span className={styles.delegationCardStatsItemText}>{t('votingPower')}</span>
				</div>
			</div>
			<div className={styles.delegationCardStatsItem}>
				<div>
					<div className='font-semibold md:text-2xl'>{delegate?.last30DaysVotedProposalsCount}</div>
					<span className={styles.delegationCardStatsItemText}>{t('votedProposals')}</span>
					<span className={styles.delegationCardStatsItemTextPast30Days}>({t('past30Days')})</span>
				</div>
			</div>
			<div className='p-5 text-center'>
				<div>
					<div className='font-semibold md:text-2xl'>{delegate?.receivedDelegationsCount}</div>
					<span className={styles.delegationCardStatsItemText}>{t('receivedDelegations')}</span>
				</div>
			</div>
		</div>
	);
}

const DelegateCard = memo(({ delegate }: { delegate: IDelegateDetails }) => {
	const t = useTranslations('Delegation');

	const { user } = useUser();

	const [openModal, setOpenModal] = useState(false);

	return (
		<div className={styles.delegationCard}>
			<div className={`flex gap-2 rounded-t-md border py-1 ${getPlatformStyles(delegate.sources)}`}>
				<PlatformLogos platforms={delegate.sources} />
			</div>
			<div className='p-4'>
				<div className={styles.delegationDialog}>
					<div className='min-w-32'>
						<Address address={delegate.address} />
					</div>
					{user?.id ? (
						<Dialog>
							<DialogTrigger asChild>
								<Button
									variant='ghost'
									className='flex items-center gap-x-2 text-sm font-medium text-text_pink'
								>
									<IoPersonAdd />
									<span>{t('delegate')}</span>
								</Button>
							</DialogTrigger>
							<DialogContent className='max-w-screen-md p-6'>
								<DialogHeader>
									<DialogTitle className='flex items-center gap-x-2'>
										<IoPersonAdd />
										<span>{t('delegate')}</span>
									</DialogTitle>
								</DialogHeader>
								<DelegateVotingPower delegate={delegate} />
							</DialogContent>
						</Dialog>
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

			<div className='px-4 pb-2'>
				{delegate?.manifesto && delegate?.manifesto.length > 0 ? (
					<MarkdownViewer
						markdown={delegate.manifesto}
						truncate
						onShowMore={() => setOpenModal(true)}
						className='line-clamp-2'
					/>
				) : (
					<span>{t('noBio')}</span>
				)}
			</div>

			<DelegateStats delegate={delegate} />

			<Dialog
				open={openModal}
				onOpenChange={setOpenModal}
			>
				<DialogContent className='max-w-xl p-6'>
					<DialogHeader>
						<DialogTitle>
							<Address address={delegate.address} />
						</DialogTitle>
					</DialogHeader>
					{delegate?.manifesto && delegate?.manifesto.length > 0 && (
						<MarkdownViewer
							className='max-h-[70vh] overflow-y-auto'
							markdown={delegate.manifesto}
						/>
					)}
					<DelegateStats delegate={delegate} />
				</DialogContent>
			</Dialog>
		</div>
	);
});

export default DelegateCard;
